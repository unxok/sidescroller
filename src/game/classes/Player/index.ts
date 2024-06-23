import {
  DEFAULT_CANVAS_HEIGHT,
  FRICTION_CONSTANT,
  GRAVITY,
  HORIZONTAL_MOVEMENT_UNIT,
  VERTICAL_MOVEMENT_UNIT,
} from "../../constants";
import { Sprite } from "../Sprite";

export class Player extends Sprite {
  pressedKeys: Record<string, boolean> = {};
  //   hasDoubleJump = true;
  constructor(...args: ConstructorParameters<typeof Sprite>) {
    super(...args);
    this.registerControls();
  }

  registerControls = () => {
    window.addEventListener("keydown", (e) => {
      this.pressedKeys[e.key] = true;
    });
    window.addEventListener("keyup", (e) => {
      this.pressedKeys[e.key] = false;
    });
  };

  applyKeyPress = () => {
    if (this.pressedKeys["ArrowRight"]) {
      // this.updatePosition(HORIZONTAL_MOVEMENT_UNIT, 0);
      this.displace({ x: HORIZONTAL_MOVEMENT_UNIT, y: 0 });
    }
    if (this.pressedKeys["ArrowLeft"]) {
      this.displace({ x: -HORIZONTAL_MOVEMENT_UNIT, y: 0 });
    }
    if (
      this.pressedKeys[" "] &&
      (this.isOnGround || this.isOnLeftWall || this.isOnRightWall)
    ) {
      const dx = this.isOnLeftWall
        ? HORIZONTAL_MOVEMENT_UNIT
        : this.isOnRightWall
          ? -HORIZONTAL_MOVEMENT_UNIT
          : 0;
      const dy = this.isOnGround
        ? -VERTICAL_MOVEMENT_UNIT
        : -VERTICAL_MOVEMENT_UNIT * 1.2;
      this.displace({ x: dx * 30, y: dy });
    }
  };

  animate = () => {
    this.displace({ x: 0, y: GRAVITY });
    this.velocity.x *= FRICTION_CONSTANT;
    this.applyKeyPress();
    // this.velocity.y *= FRICTION_CONSTANT;
  };
}
