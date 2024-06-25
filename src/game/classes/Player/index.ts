import { FRICTION_CONSTANT } from "../../constants";
import { Entity } from "../Entity";

export class Player extends Entity {
  private pressedKeys: Record<string, boolean> = {};
  img: HTMLImageElement;
  imgLeft: boolean = false;
  imgSources = {
    idle: {
      right: "src/assets/Huntress/Sprites/Idle.png",
      left: "src/assets/Huntress/Sprites/Idle-left.png",
      offset: 0,
      offsetMax: 7,
    },
    run: {
      right: "src/assets/Huntress/Sprites/Run.png",
      left: "src/assets/Huntress/Sprites/Run-left.png",
      offset: 0,
      offsetMax: 7,
    },
    jump: {
      right: "src/assets/Huntress/Sprites/Jump.png",
      left: "src/assets/Huntress/Sprites/Jump-left.png",
      offset: 0,
      offsetMax: 1,
    },
    fall: {
      right: "src/assets/Huntress/Sprites/Fall.png",
      left: "src/assets/Huntress/Sprites/Fall-left.png",
      offset: 0,
      offsetMax: 1,
    },
  };
  selectedImgSource: keyof typeof this.imgSources = "idle";
  lastImgOffsetUpdate: number = performance.now();
  constructor(...args: ConstructorParameters<typeof Entity>) {
    super(...args);
    this.registerControls();
    this.img = new Image();
  }

  draw() {
    const {
      position: { x, y },
      volume: { w, h },
    } = this;
    this.ctx.fillStyle = this.fill ?? "black";
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
    if (this.velocity.y < -1) {
      this.setImgSource("jump");
    }
    if (this.velocity.y > 1) {
      this.setImgSource("fall");
    }

    this.ctx.drawImage(
      this.img,
      this.imgSources[this.selectedImgSource].offset * spriteWidth,
      0,
      spriteWidth,
      spriteHeight,
      x - 100,
      y - 108,
      w + spriteWidth + 50,
      h + spriteHeight + 50,
    );

    this.incrementImgOffset();

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

  setImgSource = (key: keyof typeof this.imgSources) => {
    this.selectedImgSource = key;
    // this.imgSources[key].offset = 0;
    this.img.src = this.imgSources[key][this.imgLeft ? "left" : "right"];
  };

  incrementImgOffset = () => {
    const now = performance.now();
    if (now - this.lastImgOffsetUpdate < 50) return;
    const { offset, offsetMax } = this.imgSources[this.selectedImgSource];
    const newOffset = offset === offsetMax ? 0 : offset + 1;
    this.imgSources[this.selectedImgSource].offset = newOffset;
    this.lastImgOffsetUpdate = now;
  };

  registerControls(): void {
    window.addEventListener("keydown", (e) => {
      this.pressedKeys[e.key] = true;
    });
    window.addEventListener("keyup", (e) => {
      this.pressedKeys[e.key] = false;
      if (
        (e.key === "ArrowLeft" || e.key === "ArrowRight") &&
        this.isOnGround
      ) {
        // this.applyForce({ x: this.strength.x, y: 0 });
        this.acceleration.x = 0;
        this.velocity.x = 0;
      }
    });
  }

  applyKeyPress(): void {
    console.log(this.pressedKeys);
    if (this.pressedKeys["ArrowRight"]) {
      // this.updatePosition(HORIZONTAL_MOVEMENT_UNIT, 0);
      this.moveRight();
    }
    if (this.pressedKeys["ArrowLeft"]) {
      this.moveLeft();
    }

    if (this.pressedKeys[" "]) {
      this.jump();
    }
  }

  onAnimate(): void {
    this.applyKeyPress();
    this.updateNotVerticalTime();
    this.velocity.x *= FRICTION_CONSTANT;
  }
}
