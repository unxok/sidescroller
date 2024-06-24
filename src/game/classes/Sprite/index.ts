import { getCtx } from "../..";
import { WH, XY } from "../../../utils";
import {
  FRICTION_CONSTANT,
  GRAVITY,
  HORIZONTAL_MOVEMENT_UNIT,
  TIME_CONSTANT,
  VERTICAL_MOVEMENT_UNIT,
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
  isOnCeiling = false;
  hasJump = false;

  constructor(...args: ConstructorParameters<typeof Entity>) {
    super(...args);
  }

  updatePosition = (
    dx: number,
    dy: number,
    options?: {
      isOnGround?: boolean;
      isOnLeftWall?: boolean;
      isOnRightWall?: boolean;
      isOnCeiling?: boolean;
    },
  ) => {
    const { isOnGround, isOnLeftWall, isOnRightWall, isOnCeiling } =
      options ?? {};
    const {
      position: { x, y },
      // volume: { w, h },
    } = this;
    const newX = x + dx;
    const newY = y + dy;
    // const hitBottom = newY + h >= DEFAULT_CANVAS_HEIGHT;
    // const hitTop = newY <= 0;
    // const hitRight = newX + w >= DEFAULT_CANVAS_WIDTH;
    // const hitLeft = newX <= 0;
    this.isOnGround = isOnGround ?? this.isOnGround;
    this.isOnLeftWall = isOnLeftWall ?? this.isOnLeftWall;
    this.isOnRightWall = isOnRightWall ?? this.isOnRightWall;
    this.isOnCeiling = isOnCeiling ?? this.isOnCeiling;
    this.position = { x: newX, y: newY };
    // this.position.x = hitRight ? DEFAULT_CANVAS_WIDTH - w : hitLeft ? 0 : newX;
    // this.position.y = hitBottom ? DEFAULT_CANVAS_HEIGHT - h : hitTop ? 0 : newY;
    if (this.isOnGround || this.isOnCeiling) {
      this.acceleration.y = 0;
      this.velocity.y = GRAVITY / this.mass;
      this.hasJump = true;
    }
    if (this.isOnLeftWall || this.isOnRightWall) {
      this.velocity.x = 0;
      this.acceleration.x = 0;
    }

    this.draw();
  };

  setPosition = (
    cb: (prev: XY & WH) => XY & {
      options?: {
        isOnGround?: boolean;
        isOnLeftWall?: boolean;
        isOnRightWall?: boolean;
        isOnCeiling?: boolean;
      };
    },
  ) => {
    const { x, y } = this.position;
    const {
      x: newX,
      y: newY,
      options,
    } = cb({ ...this.position, ...this.volume });
    this.updatePosition(newX - x, newY - y, options);
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

  applyVelocity = (options?: {
    isOnGround?: boolean;
    isOnLeftWall?: boolean;
    isOnRightWall?: boolean;
    isOnCeiling?: boolean;
  }) => {
    const { x: vx, y: vy } = this.velocity;
    // console.log("vel: ", this.velocity.x);
    const dx = vx * TIME_CONSTANT;
    const dy = vy * TIME_CONSTANT;
    this.updatePosition(dx, dy, options);
  };

  displace = (
    force: XY & {
      options?: {
        isOnGround?: boolean;
        isOnLeftWall?: boolean;
        isOnRightWall?: boolean;
        isOnCeiling?: boolean;
      };
    },
  ) => {
    this.applyForce(force);
    this.applyAcceleration();
    this.applyVelocity(force.options);
  };

  moveRight = () =>
    this.displace({
      x: HORIZONTAL_MOVEMENT_UNIT,
      y: 1,
      options: {
        isOnGround: false,
        isOnLeftWall: false,
        isOnRightWall: false,
      },
    });
  moveLeft = () =>
    this.displace({
      x: -HORIZONTAL_MOVEMENT_UNIT,
      y: 1,
      options: {
        isOnGround: false,
        isOnLeftWall: false,
        isOnRightWall: false,
      },
    });
  jump = () => {
    const dx = this.isOnLeftWall
      ? HORIZONTAL_MOVEMENT_UNIT
      : this.isOnRightWall
        ? -HORIZONTAL_MOVEMENT_UNIT
        : 0;
    const dy =
      this.isOnLeftWall || this.isOnRightWall
        ? -VERTICAL_MOVEMENT_UNIT
        : -VERTICAL_MOVEMENT_UNIT * 2;
    this.displace({
      x: dx * 30,
      y: dy,
      options: {
        isOnGround: false,
        isOnLeftWall: false,
        isOnRightWall: false,
      },
    });
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
