import {
  DEFAULT_CANVAS_HEIGHT,
  DENSITY_CONSTANT,
  FRICTION_CONSTANT,
  GRAVITY,
  HORIZONTAL_MOVEMENT_UNIT,
  VERTICAL_MOVEMENT_UNIT,
} from "../../constants";
import { Sprite } from "../Sprite";

export class Player extends Sprite {
  img: HTMLImageElement;
  imgLeft: boolean = false;
  imgSources = {
    idle: {
      right: "src/assets/Huntress/Sprites/Idle.png",
      left: "src/assets/Huntress/Sprites/Idle-left.png",
    },
    run: {
      right: "src/assets/Huntress/Sprites/Run.png",
      left: "src/assets/Huntress/Sprites/Run-left.png",
    },
  };

  imgOffset: number = 0;
  lastImgOffsetUpdate: number = performance.now();
  pressedKeys: Record<string, boolean> = {};
  //   hasDoubleJump = true;
  constructor(...args: ConstructorParameters<typeof Sprite>) {
    super(...args);
    this.registerControls();
    const img = new Image();
    this.img = img;
  }

  setImgSource = (key: keyof typeof this.imgSources) => {
    this.img.src = this.imgSources[key][this.imgLeft ? "left" : "right"];
  };

  draw = () => {
    const {
      position: { x, y },
      volume: { w, h },
      fill,
      density,
    } = this;
    this.ctx.fillStyle = fill;
    // this.ctx.fillRect(x, y, w, h);

    const spriteWidth = 150;
    const spriteHeight = 160;
    this.setImgSource("idle");

    if (this.velocity.x > 1) {
      this.imgLeft = false;
      this.setImgSource("run");
    }
    if (this.velocity.x < -1) {
      this.imgLeft = true;
      this.setImgSource("run");
    }

    this.ctx.drawImage(
      this.img,
      this.imgOffset * spriteWidth,
      0,
      spriteWidth,
      spriteHeight,
      x - 117,
      y - 112,
      w + spriteWidth + 80,
      h + spriteHeight + 80,
    );
    this.mass = w * h * (density ?? DENSITY_CONSTANT);
    const b = this.getBounds();
    this.ctx.fillText(
      `L${b.left.toFixed(2)} R${b.right.toFixed(2)} T${b.top.toFixed(2)} B${b.bottom.toFixed(2)}`,
      b.right - b.left,
      b.bottom - b.top,
    );
    const now = performance.now();
    if (now - this.lastImgOffsetUpdate >= 75) {
      this.imgOffset = this.imgOffset === 7 ? 0 : this.imgOffset + 1;
      this.lastImgOffsetUpdate = now;
    }
  };

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
      this.moveRight();
    }
    if (this.pressedKeys["ArrowLeft"]) {
      this.moveLeft();
    }
    // if (
    //   this.pressedKeys[" "] &&
    //   (this.isOnGround || this.isOnLeftWall || this.isOnRightWall)
    // ) {
    //   this.jump();
    // }
    if (
      this.pressedKeys[" "] &&
      (this.hasJump || this.isOnLeftWall || this.isOnRightWall)
    ) {
      this.hasJump = false;
      this.jump();
    }
  };

  animate = () => {
    this.displace({ x: 0, y: GRAVITY });
    this.velocity.x *= FRICTION_CONSTANT;
    this.applyKeyPress();
    // this.velocity.y *= FRICTION_CONSTANT;
  };
}
