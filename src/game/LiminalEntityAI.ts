import * as THREE from 'three';
import { MapRoom } from '../procedural/LabyrinthGenerator';
import { AudioEngine } from '../audio/AudioEngine';
import { DifficultyLevel } from '../context/SettingsContext';

export class LiminalEntityAI {
  public mesh: THREE.Group;
  public position: THREE.Vector3 = new THREE.Vector3(999, 0, 999);
  public isActive: boolean = false;
  public isStalking: boolean = false;
  public isCharging: boolean = false;
  public distanceToPlayer: number = 999;

  public difficulty: DifficultyLevel = 'easy';
  public anchorsCollected: number = 0;

  private graceTimer: number = 60; // 60 seconds safe exploration period
  private timeAlive: number = 0;
  private stalkSpeed: number = 0.8;
  private chargeSpeed: number = 3.8;

  constructor(scene: THREE.Scene) {
    this.mesh = this.createEntityMesh();
    scene.add(this.mesh);
  }

  private createEntityMesh(): THREE.Group {
    const group = new THREE.Group();

    // Spindly, contorted shadow silhouette (like Kane Pixels wireframe/bacteria)
    const bodyGeo = new THREE.CylinderGeometry(0.12, 0.08, 2.5, 6);
    const bodyMat = new THREE.MeshBasicMaterial({ color: 0x080808 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.25;
    group.add(body);

    // Twisted head
    const headGeo = new THREE.SphereGeometry(0.2, 6, 6);
    const headMat = new THREE.MeshBasicMaterial({ color: 0x040404 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 2.45;
    group.add(head);

    // Tiny hollow white glare eyes (eerie, not neon cartoon)
    const eyeGeo = new THREE.SphereGeometry(0.025, 4, 4);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.06, 2.48, 0.16);
    group.add(eyeL);

    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.06, 2.46, 0.16);
    group.add(eyeR);

    // Initial position far away
    group.position.set(999, -20, 999);
    return group;
  }

  public spawn(room: MapRoom, roomSize: number = 10, difficulty: DifficultyLevel = 'easy') {
    this.difficulty = difficulty;
    this.position.set(room.x * roomSize, 0, room.z * roomSize);
    this.mesh.position.copy(this.position);
    this.isActive = true;
    this.isCharging = false;
    this.isStalking = false;
    this.timeAlive = 0;

    // Difficulty Tuning
    if (this.difficulty === 'explorer') {
      this.graceTimer = 999999; // Never hunts
      this.stalkSpeed = 0;
      this.chargeSpeed = 0;
    } else if (this.difficulty === 'easy') {
      this.graceTimer = 65; // 65 seconds safe exploration period!
      this.stalkSpeed = 0.8;
      this.chargeSpeed = 3.6;
    } else if (this.difficulty === 'normal') {
      this.graceTimer = 40;
      this.stalkSpeed = 1.3;
      this.chargeSpeed = 4.4;
    } else {
      // Nightmare
      this.graceTimer = 18;
      this.stalkSpeed = 2.0;
      this.chargeSpeed = 5.4;
    }
  }

  public setAnchors(count: number) {
    this.anchorsCollected = count;
    // Each anchor reduces remaining grace timer slightly
    if (this.anchorsCollected >= 1 && this.graceTimer > 20) {
      this.graceTimer = 20;
    }
    if (this.anchorsCollected >= 2 && this.graceTimer > 5) {
      this.graceTimer = 5;
    }
  }

  public update(
    delta: number,
    playerPos: THREE.Vector3,
    flashlightOn: boolean,
    isSprinting: boolean,
    onCatchPlayer: () => void
  ) {
    if (!this.isActive) return;

    this.timeAlive += delta;
    this.distanceToPlayer = this.position.distanceTo(playerPos);

    // Explorer mode: purely peaceful
    if (this.difficulty === 'explorer') {
      AudioEngine.updateProximityStatic(0);
      return;
    }

    // Grace Period: During the initial 60 seconds, entity stays dormant and far away!
    if (this.timeAlive < this.graceTimer) {
      // Entity only whispers from far away if player wanders right into its room
      if (this.distanceToPlayer < 8.0) {
        // Relocate entity to another room so player isn't jumped!
        this.position.x += 25;
        this.position.z += 25;
        this.mesh.position.copy(this.position);
      }
      AudioEngine.updateProximityStatic(0);
      return;
    }

    // Entity is now awake!
    this.isStalking = true;

    // Update Proximity Radio Static (only heard when within 20m)
    const maxHearDist = 22;
    if (this.distanceToPlayer < maxHearDist) {
      const intensity = 1.0 - this.distanceToPlayer / maxHearDist;
      AudioEngine.updateProximityStatic(intensity);
      AudioEngine.setHumFlicker(this.distanceToPlayer < 10);
    } else {
      AudioEngine.updateProximityStatic(0);
    }

    // Facing player
    this.mesh.lookAt(playerPos.x, this.mesh.position.y, playerPos.z);

    const dir = new THREE.Vector3().subVectors(playerPos, this.position).normalize();

    // Check if player is detected / triggers charge
    const chargeTriggerDist =
      this.difficulty === 'easy' ? 3.0 : this.difficulty === 'normal' ? 5.5 : 8.0;

    // Sprinting makes loud noise and attracts the entity from further away
    const effectiveTrigger = isSprinting ? chargeTriggerDist * 1.5 : chargeTriggerDist;

    if (this.distanceToPlayer < effectiveTrigger) {
      this.isCharging = true;
      AudioEngine.setHeartbeatActive(true, 160);
    }

    // Movement
    if (this.isCharging) {
      this.position.addScaledVector(dir, this.chargeSpeed * delta);
      this.mesh.position.copy(this.position);

      // Captured player!
      if (this.distanceToPlayer < 1.4) {
        this.isActive = false;
        AudioEngine.setHeartbeatActive(false);
        AudioEngine.updateProximityStatic(0);
        onCatchPlayer();
        return;
      }
    } else if (this.isStalking) {
      // Stalk slowly toward player
      // If flashlight is shining directly at it and player is not sprinting, entity slows down
      let currentStalkSpeed = this.stalkSpeed;
      if (flashlightOn && this.distanceToPlayer > 8) {
        currentStalkSpeed *= 0.6; // Light slows it down at range
      }

      this.position.addScaledVector(dir, currentStalkSpeed * delta);
      this.mesh.position.copy(this.position);
    }

    // Uncanny subtle twitching
    this.mesh.rotation.z = Math.sin(this.timeAlive * 8) * 0.04;
  }
}
