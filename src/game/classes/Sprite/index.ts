import { getCtx } from "../..";
import { XY } from "../../../utils";
import {
  DEFAULT_CANVAS_HEIGHT,
  DEFAULT_CANVAS_WIDTH,
  DENSITY_CONSTANT,
  FRICTION_CONSTANT,
  GRAVITATIONAL_CONSTANT,
  GRAVITY,
  TIME_CONSTANT,
} from "../../constants";
import { Entity } from "../Entity";

export class Sprite extends Entity {
  ctx = getCtx();
  mass = 0;
  velocity: XY = { x: 0, y: 0 };
  acceleration: XY = { x: 0, y: 0 };
  isOnGround = false;
  isOnLeftWall = false;
  isOnRightWall = false;

  constructor(...args: ConstructorParameters<typeof Entity>) {
    super(...args);
  }

  // draw = () => {
  //   const {
  //     position: { x, y },
  //     volume: { w, h },
  //     fill,
  //     density,
  //   } = this;
  //   this.ctx.fillStyle = fill;
  //   this.ctx.fillRect(x, y, w, h);
  //   this.mass = w * h * (density ?? DENSITY_CONSTANT);
  // };

  updatePosition = (dx: number, dy: number) => {
    const {
      position: { x, y },
      volume: { w, h },
    } = this;
    const newX = x + dx;
    const newY = y + dy;
    const hitBottom = newY + h >= DEFAULT_CANVAS_HEIGHT;
    const hitTop = newY <= 0;
    const hitRight = newX + w >= DEFAULT_CANVAS_WIDTH;
    const hitLeft = newX <= 0;
    this.isOnGround = hitBottom;
    this.isOnLeftWall = hitLeft;
    this.isOnRightWall = hitRight;
    this.position.x = hitRight ? DEFAULT_CANVAS_WIDTH - w : hitLeft ? 0 : newX;
    this.position.y = hitBottom ? DEFAULT_CANVAS_HEIGHT - h : hitTop ? 0 : newY;
    if (hitBottom || hitTop) {
      this.velocity.y = 0;
      this.acceleration.y = 0;
    }
    if (hitLeft || hitRight) {
      this.velocity.x = 0;
      this.acceleration.x = 0;
    }

    this.draw();
  };

  applyForce = (f: XY) => {
    const ax = (f.x / this.mass) * FRICTION_CONSTANT;
    const ay = (f.y / this.mass) * FRICTION_CONSTANT;
    // console.log(ay);
    this.acceleration.x = ax;
    this.acceleration.y = ay;
  };

  applyAcceleration = () => {
    // console.log("acc: ", this.acceleration.x);
    this.velocity.x = this.velocity.x + this.acceleration.x * TIME_CONSTANT;
    this.velocity.y = this.velocity.y + this.acceleration.y * TIME_CONSTANT;

    // this.acceleration = { x: 0, y: 0 };
  };

  applyVelocity = () => {
    const { x: vx, y: vy } = this.velocity;
    // console.log("vel: ", this.velocity.x);
    const dx = vx * TIME_CONSTANT;
    const dy = vy * TIME_CONSTANT;
    this.updatePosition(dx, dy);
  };

  displace = (force: XY) => {
    this.applyForce(force);
    this.applyAcceleration();
    this.applyVelocity();
  };

  getBounds = () => {
    return {
      left: this.position.x,
      right: this.position.x + this.volume.w,
      top: this.position.y,
      bottom: this.position.y + this.volume.h,
    };
  };

  animate = () => {
    this.displace({ x: 0, y: GRAVITY });

    this.velocity.x *= FRICTION_CONSTANT;
    // this.velocity.y *= FRICTION_CONSTANT;
  };
}
