import * as THREE from 'three';

export interface ControlCallbacks {
  onToggleFlashlight?: () => void;
  onInteract?: () => void;
  onFootstep?: (isSprinting: boolean) => void;
  onOpenSettings?: () => void;
  onToggleMinimap?: () => void;
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

  private keys: { [key: string]: boolean } = {};
  private euler = new THREE.Euler(0, 0, 0, 'YXZ');
  private shakeOffset = { pitch: 0, yaw: 0, roll: 0 };
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

      const targetPos = this.camera.position.clone();
      targetPos.x += deltaX;
      targetPos.z += deltaZ;

      if (!collisionCheck || collisionCheck(targetPos)) {
        this.camera.position.x = targetPos.x;
        this.camera.position.z = targetPos.z;
      } else {
        const slideX = this.camera.position.clone();
        slideX.x += deltaX;
        if (!collisionCheck || collisionCheck(slideX)) {
          this.camera.position.x = slideX.x;
        } else {
          const slideZ = this.camera.position.clone();
          slideZ.z += deltaZ;
          if (!collisionCheck || collisionCheck(slideZ)) {
            this.camera.position.z = slideZ.z;
          }
        }
      }

      const dist = Math.hypot(deltaX, deltaZ);
      this.stepDistance += dist;

      // Slower, deliberate stride rhythm ("pelan-pelan")
      this.headBobTimer += delta * (this.isSprinting ? 7.2 : 4.6);
      const stepThreshold = this.isSprinting ? 1.4 : 1.2;

      if (this.stepDistance > stepThreshold) {
        this.stepDistance = 0;
        if (this.callbacks.onFootstep) {
          this.callbacks.onFootstep(this.isSprinting);
        }
      }
    }

    // Realistic Walking Camera Shaky Motion & Organic Body Sway
    const time = performance.now() * 0.001;
    let targetPitchShake = 0;
    let targetYawShake = 0;
    let targetRollShake = 0;

    if (isMoving) {
      const mult = this.isSprinting ? 1.7 : 1.0;
      // Natural shoulder sway / roll tilt with each step
      targetRollShake = Math.sin(this.headBobTimer * 0.5) * 0.022 * mult;
      // Heel-impact pitch dip
      targetPitchShake = Math.cos(this.headBobTimer) * 0.012 * mult;
      // Micro handheld cam tremor & body inertia
      targetYawShake = Math.sin(this.headBobTimer * 0.5) * 0.008 * mult + Math.sin(time * 11.0) * 0.0016 * mult;
    } else {
      // Gentle breathing idle sway
      targetPitchShake = Math.sin(time * 1.6) * 0.0022;
      targetRollShake = Math.cos(time * 1.2) * 0.0016;
    }

    this.shakeOffset.pitch = THREE.MathUtils.lerp(this.shakeOffset.pitch, targetPitchShake, 0.2);
    this.shakeOffset.yaw = THREE.MathUtils.lerp(this.shakeOffset.yaw, targetYawShake, 0.2);
    this.shakeOffset.roll = THREE.MathUtils.lerp(this.shakeOffset.roll, targetRollShake, 0.2);

    // Apply clean composed orientation (Base look angle + organic walking tremor)
    const composedEuler = new THREE.Euler(
      this.euler.x + this.shakeOffset.pitch,
      this.euler.y + this.shakeOffset.yaw,
      this.shakeOffset.roll,
      'YXZ'
    );
    this.camera.quaternion.setFromEuler(composedEuler);

    // Vertical height bobbing
    const targetHeight = this.isCrouching ? 0.9 : this.baseHeight;
    const bobOffset = isMoving ? Math.sin(this.headBobTimer) * (this.isSprinting ? 0.05 : 0.024) : 0;
    this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, targetHeight + bobOffset, 0.15);
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
