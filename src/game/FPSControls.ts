import * as THREE from 'three';

export interface ControlCallbacks {
  onToggleFlashlight?: () => void;
  onInteract?: () => void;
  onFootstep?: (isSprinting: boolean) => void;
  onOpenSettings?: () => void;
  onToggleMinimap?: () => void;
  getGroundHeight?: (x: number, z: number) => number;
}

export class FPSControls {
  public camera: THREE.PerspectiveCamera;
  public domElement: HTMLElement;
  public isLocked: boolean = false;
  public position: THREE.Vector3 = new THREE.Vector3();
  public velocity: THREE.Vector3 = new THREE.Vector3();
  public isSprinting: boolean = false;
  public isCrouching: boolean = false;
  public sensitivity: number = 1.0;
  public bobIntensity: number = 0.4; // Anti-motion sickness: 0.0 = static horizon, 1.0 = subtle translational bob

  private keys: { [key: string]: boolean } = {};
  private euler = new THREE.Euler(0, 0, 0, 'YXZ');
  private bobOffset = { y: 0, lateral: 0 };
  private stepDistance: number = 0;
  private headBobTimer: number = 0;
  private baseHeight: number = 1.6;
  private callbacks: ControlCallbacks = {};

  // Touch controls for mobile
  private joystickMove: { x: number; y: number } = { x: 0, y: 0 };

  private onKeyDownBound: (e: KeyboardEvent) => void;
  private onKeyUpBound: (e: KeyboardEvent) => void;
  private onMouseMoveBound: (e: MouseEvent) => void;
  private onClickBound: (e: MouseEvent) => void;
  private onPointerLockChangeBound: () => void;

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement, callbacks?: ControlCallbacks) {
    this.camera = camera;
    this.domElement = domElement;
    this.callbacks = callbacks || {};
    this.position.copy(this.camera.position);

    this.onKeyDownBound = this.onKeyDown.bind(this);
    this.onKeyUpBound = this.onKeyUp.bind(this);
    this.onMouseMoveBound = this.onMouseMove.bind(this);
    this.onClickBound = this.onClick.bind(this);
    this.onPointerLockChangeBound = this.onPointerLockChange.bind(this);

    this.initEventListeners();
  }

  private initEventListeners() {
    this.euler.setFromQuaternion(this.camera.quaternion);
    window.addEventListener('keydown', this.onKeyDownBound);
    window.addEventListener('keyup', this.onKeyUpBound);
    this.domElement.addEventListener('click', this.onClickBound);
    document.addEventListener('pointerlockchange', this.onPointerLockChangeBound);
    window.addEventListener('mousemove', this.onMouseMoveBound);
  }

  private onKeyDown(e: KeyboardEvent) {
    this.keys[e.code] = true;
    if (e.code === 'KeyF' && this.callbacks.onToggleFlashlight) {
      this.callbacks.onToggleFlashlight();
    }
    if (e.code === 'KeyE' || e.code === 'Space') {
      if (this.callbacks.onInteract) this.callbacks.onInteract();
    }
    if (e.code === 'KeyM' && this.callbacks.onToggleMinimap) {
      this.callbacks.onToggleMinimap();
    }
    if (e.code === 'Escape' && this.callbacks.onOpenSettings) {
      this.callbacks.onOpenSettings();
    }
  }

  private onKeyUp(e: KeyboardEvent) {
    this.keys[e.code] = false;
  }

  private onClick(e: MouseEvent) {
    // Only request lock if not already locked and clicking directly on 3D canvas
    if (!this.isLocked && document.pointerLockElement !== this.domElement) {
      this.domElement.requestPointerLock?.();
    } else if (this.isLocked && this.callbacks.onInteract) {
      this.callbacks.onInteract();
    }
  }

  private onPointerLockChange() {
    this.isLocked = document.pointerLockElement === this.domElement;
  }

  private onMouseMove(event: MouseEvent) {
    if (!this.isLocked) return;

    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;

    const factor = 0.0022 * this.sensitivity;
    this.euler.y -= movementX * factor;
    this.euler.x -= movementY * factor;
    this.euler.x = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, this.euler.x));
  }

  public unlock() {
    if (document.pointerLockElement) {
      document.exitPointerLock?.();
    }
    this.isLocked = false;
  }

  public setJoystickVector(x: number, y: number) {
    this.joystickMove = { x, y };
  }

  public handleTouchLook(deltaX: number, deltaY: number) {
    const factor = 0.004 * this.sensitivity;
    this.euler.y -= deltaX * factor;
    this.euler.x -= deltaY * factor;
    this.euler.x = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, this.euler.x));
  }

  public update(delta: number, collisionCheck?: (newPos: THREE.Vector3) => boolean) {
    // Sync initial player position if not set
    if (this.position.lengthSq() === 0 && this.camera.position.lengthSq() > 0) {
      this.position.copy(this.camera.position);
    }

    const isSprint = (this.keys['ShiftLeft'] || this.keys['ShiftRight']) && !this.isCrouching;
    const isCrouch = this.keys['KeyC'];
    this.isSprinting = isSprint;
    this.isCrouching = isCrouch;

    // Survival horror methodical, deliberate pacing
    let moveSpeed = 2.4;
    if (this.isSprinting) moveSpeed = 4.8;
    if (this.isCrouching) moveSpeed = 1.3;

    const moveDir = new THREE.Vector3();
    if (this.keys['KeyW'] || this.keys['ArrowUp']) moveDir.z -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) moveDir.z += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveDir.x -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) moveDir.x += 1;

    if (Math.abs(this.joystickMove.x) > 0.1 || Math.abs(this.joystickMove.y) > 0.1) {
      moveDir.x += this.joystickMove.x;
      moveDir.z += this.joystickMove.y;
    }

    const isMoving = moveDir.lengthSq() > 0;

    if (isMoving) {
      moveDir.normalize();

      const yaw = this.euler.y;
      const sin = Math.sin(yaw);
      const cos = Math.cos(yaw);

      const worldDirX = moveDir.x * cos + moveDir.z * sin;
      const worldDirZ = -moveDir.x * sin + moveDir.z * cos;

      const deltaX = worldDirX * moveSpeed * delta;
      const deltaZ = worldDirZ * moveSpeed * delta;

      const targetPos = this.position.clone();
      targetPos.x += deltaX;
      targetPos.z += deltaZ;

      if (!collisionCheck || collisionCheck(targetPos)) {
        this.position.x = targetPos.x;
        this.position.z = targetPos.z;
      } else {
        const slideX = this.position.clone();
        slideX.x += deltaX;
        if (!collisionCheck || collisionCheck(slideX)) {
          this.position.x = slideX.x;
        } else {
          const slideZ = this.position.clone();
          slideZ.z += deltaZ;
          if (!collisionCheck || collisionCheck(slideZ)) {
            this.position.z = slideZ.z;
          }
        }
      }

      const dist = Math.hypot(deltaX, deltaZ);
      this.stepDistance += dist;

      // Slower, deliberate stride rhythm ("pelan-pelan")
      this.headBobTimer += delta * (this.isSprinting ? 7.0 : 4.6);
      const stepThreshold = this.isSprinting ? 1.4 : 1.2;

      if (this.stepDistance > stepThreshold) {
        this.stepDistance = 0;
        if (this.callbacks.onFootstep) {
          this.callbacks.onFootstep(this.isSprinting);
        }
      }
    }

    // 1. Camera orientation: PURELY player look input!
    // ZERO ROLL TILT, ZERO PITCH SHAKE, ZERO YAW DRIFT
    // Horizon is 100% stable and level. Completely eliminates motion sickness!
    this.camera.quaternion.setFromEuler(this.euler);

    // 2. Anti-Motion Sickness Translational Bobbing (Displacement ONLY, Zero Rotation)
    const time = performance.now() * 0.001;
    let targetBobY = 0;
    let targetLateral = 0;

    if (isMoving && this.bobIntensity > 0) {
      // Natural harmonic footstep dip: dips slightly on heel contact, rises during push-off
      targetBobY = Math.sin(this.headBobTimer * 2) * (this.isSprinting ? 0.022 : 0.014) * this.bobIntensity;
      // Very gentle lateral weight shift between left & right steps
      targetLateral = Math.cos(this.headBobTimer) * (this.isSprinting ? 0.012 : 0.007) * this.bobIntensity;
    } else if (this.bobIntensity > 0) {
      // Barely perceptible idle breathing displacement (2 millimeters)
      targetBobY = Math.sin(time * 1.4) * 0.002 * this.bobIntensity;
    }

    this.bobOffset.y = THREE.MathUtils.lerp(this.bobOffset.y, targetBobY, 0.18);
    this.bobOffset.lateral = THREE.MathUtils.lerp(this.bobOffset.lateral, targetLateral, 0.18);

    // Apply lateral displacement along camera local right vector
    const rightX = Math.cos(this.euler.y);
    const rightZ = -Math.sin(this.euler.y);

    this.camera.position.x = this.position.x + rightX * this.bobOffset.lateral;
    this.camera.position.z = this.position.z + rightZ * this.bobOffset.lateral;

    // Vertical height bobbing & dynamic terrain elevation tracking
    const groundY = this.callbacks.getGroundHeight ? this.callbacks.getGroundHeight(this.position.x, this.position.z) : 0;
    const targetHeight = (this.isCrouching ? 0.9 : this.baseHeight) + groundY + this.bobOffset.y;
    this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, targetHeight, 0.2);
  }

  public dispose() {
    window.removeEventListener('keydown', this.onKeyDownBound);
    window.removeEventListener('keyup', this.onKeyUpBound);
    this.domElement.removeEventListener('click', this.onClickBound);
    document.removeEventListener('pointerlockchange', this.onPointerLockChangeBound);
    window.removeEventListener('mousemove', this.onMouseMoveBound);
    this.unlock();
  }
}
