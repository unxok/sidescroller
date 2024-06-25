import { getCtx } from "../..";
import {
  XY,
  WH,
  LRTB,
  Side,
  calculateVelocityAfterCollision,
} from "../../../utils";
import { FRICTION_CONSTANT, GRAVITY } from "../../constants";

/**
 * abstract `draw(): void`
 */
export abstract class Box {
  ctx = getCtx();
  isOnGround = false;
  isOnRightWall = false;
  isOnLeftWall = false;
  constructor(
    protected position: XY,
    protected volume: WH,
    protected mass: number,
    protected velocity: XY,
    protected maxVelocity: XY,
    protected acceleration: XY,
    protected collisions: boolean,
    protected immovable: boolean,
    protected gravity: boolean,
    // protected friction: LRTB,
  ) {}

  /**
   * Will be called every animation loop
   */
  abstract draw(): void;

  getBounds(): LRTB {
    return {
      left: this.position.x,
      right: this.position.x + this.volume.w,
      top: this.position.y,
      bottom: this.position.y + this.volume.h,
    };
  }

  checkCollision(target: Box): boolean {
    if (!this.collisions || !target.collisions) return false;
    // this.isOnGround = false;
    // this.isOnWall = false;
    const targetBounds = target.getBounds();
    const thisBounds = this.getBounds();
    const notWithinHorizontal =
      thisBounds.top > targetBounds.bottom ||
      thisBounds.bottom < targetBounds.top;
    const notWithinVertical =
      thisBounds.left > targetBounds.right ||
      thisBounds.right < targetBounds.left;

    // If within both then `this` is within target hitbox
    return !notWithinHorizontal && !notWithinVertical;
  }

  fixCollision(hitTarget: Box): void {
    if (this.immovable) return;
    // this.isOnGround = false;
    // this.isOnWall = false;
    const thisBounds = this.getBounds();
    const targetBounds = hitTarget.getBounds();
    // distances in from target sides
    const distances = {
      left: Math.abs(thisBounds.right - targetBounds.left),
      right: Math.abs(thisBounds.left - targetBounds.right),
      top: Math.abs(thisBounds.bottom - targetBounds.top),
      bottom: Math.abs(thisBounds.top - targetBounds.bottom),
    };
    const min = Math.min(
      distances.left,
      distances.right,
      distances.top,
      distances.bottom,
    );

    const newVelocity = calculateVelocityAfterCollision(
      this.mass,
      hitTarget.mass,
      this.velocity,
      hitTarget.velocity,
    );

    this.velocity = newVelocity;

    const hitSide = (Object.keys(distances) as Side[]).find(
      (s) => distances[s] === min,
    );
    // console.log("hitside: ", hitSide);
    if (hitSide === "left" || hitSide === "right") {
      this.acceleration.x = 0;
      this.velocity.x = 0;
      if (hitSide === "left") {
        this.isOnRightWall = true;
        this.isOnLeftWall = false;
        // move the right side to the left side of the target
        this.position.x = hitTarget.position.x - this.volume.w;
        return;
      }
      this.isOnLeftWall = true;
      this.isOnRightWall = false;
      // move the left side to the right side of the target
      this.position.x = hitTarget.position.x + hitTarget.volume.w;
      return;
    }
    this.isOnLeftWall = false;
    this.isOnRightWall = false;
    this.acceleration.y = 0;
    this.velocity.y = 0;
    if (hitSide === "top") {
      // move the bottom side to the top side of the target
      this.isOnGround = true;
      this.position.y = hitTarget.position.y - this.volume.h;
      return;
    }

    // move the top side to the bottom side of the target
    this.position.y = hitTarget.position.y + hitTarget.volume.h;
    return;
  }

  applyForce(force: XY): void {
    const ax = force.x / this.mass;
    const ay = force.y / this.mass;
    this.acceleration.x += ax;
    this.acceleration.y += ay;
    // this.adjustVelocityByAcceleration();
    // this.adjustPositionByVelocity();
  }

  applyGravity(): void {
    if (!this.gravity) return;
    this.applyForce({ x: 0, y: GRAVITY });
  }

  adjustPositionByVelocity(): void {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  adjustVelocityByAcceleration(): void {
    // this.velocity.x += this.acceleration.x;
    // this.velocity.y += this.acceleration.y;
    const vx = this.velocity.x + this.acceleration.x;
    const vy = this.velocity.y + this.acceleration.y;
    let vx2 = 0;
    let vy2 = 0;
    if (vx < 0) {
      vx2 = Math.max(vx, -1 * this.maxVelocity.x);
    }
    if (vy < 0) {
      vy2 = Math.max(vy, -1 * this.maxVelocity.y);
    }
    if (vx >= 0) {
      vx2 = Math.min(vx, this.maxVelocity.x);
    }
    if (vy >= 0) {
      vy2 = Math.min(vy, this.maxVelocity.y);
    }
    this.velocity.x = vx2;
    this.velocity.y = vy2;
  }

  /**
   * Called inside `animate()` method.
   *
   * Use this if you want to keep the default `animate()` method as is
   * but want to add additional functionalty
   */
  abstract onAnimate(): void;

  /**
   * Will be called every iteration in the animation loop
   */
  animate(): void {
    this.onAnimate();
    this.applyGravity();
    this.adjustVelocityByAcceleration();
    this.adjustPositionByVelocity();
    this.draw();
    // this.velocity.x *= FRICTION_CONSTANT;
  }
}

export class Platform extends Box {
  constructor(
    protected fill: string,
    ...args: ConstructorParameters<typeof Box>
  ) {
    super(...args);
  }

  onAnimate(): void {}

  draw() {
    const {
      position: { x, y },
      volume: { w, h },
    } = this;
    this.ctx.fillStyle = this.fill ?? "black";
    this.ctx.fillRect(x, y, w, h);
    const { left, right, top, bottom } = this.getBounds();
    this.ctx.fillText(
      `X ${this.position.x.toFixed(2)} Y ${this.position.y.toFixed(2)}
      L ${left.toFixed(2)} R ${right.toFixed(2)} T ${top.toFixed(2)} B ${bottom.toFixed(2)}
      VX ${this.velocity.x.toFixed(2)} VY ${this.velocity.y.toFixed(2)}
      AX ${this.acceleration.x.toFixed(2)} AY ${this.acceleration.y.toFixed(2)}`,
      this.position.x,
      this.position.y - 50,
    );
  }
}
