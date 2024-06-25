import { XY } from "../../../utils";
import { Box } from "../Box";

export class Entity extends Box {
  protected notMovingVerticalTime = 0;
  constructor(
    protected fill: string,
    protected strength: XY,
    ...args: ConstructorParameters<typeof Box>
  ) {
    super(...args);
  }

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

  moveRight(): void {
    // this.applyGravity();
    // this.velocity.y = 0;
    // if (this.isOnLeftWall || this.isOnRightWall) return;
    if (this.velocity.x < 0) {
      this.velocity.x = 0;
    }
    if (this.acceleration.x < 0) {
      this.acceleration.x = 0;
    }
    this.applyForce({ x: this.strength.x, y: 0 });
  }

  moveLeft(): void {
    // this.applyGravity();
    // this.velocity.y = 0;
    // if (this.isOnLeftWall || this.isOnRightWall) return;

    if (this.velocity.x > 0) {
      this.velocity.x = 0;
    }
    if (this.acceleration.x > 0) {
      this.acceleration.x = 0;
    }
    this.applyForce({
      x: -1 * this.strength.x,
      y: 0,
    });
  }

  jump(): void {
    // if (!this.hasJump) return;
    // console.log("frames since: ", this.notMovingVerticalTime);
    // console.log("isL: ", this.isOnLeftWall);
    // console.log("isR: ", this.isOnRightWall);
    if (
      !(
        this.notMovingVerticalTime > 5 ||
        this.isOnLeftWall ||
        this.isOnRightWall
      )
    )
      return;
    // console.log("made it");
    if (this.velocity.y > 0) {
      this.velocity.y = 0;
    }
    if (this.acceleration.y > 0) {
      this.acceleration.y = 0;
    }
    let fx = 0;
    if (this.isOnLeftWall) {
      this.velocity.x = 0;
      fx = this.strength.x;
    }
    if (this.isOnRightWall) {
      this.velocity.x = 0;

      fx = -1 * this.strength.x;
    }
    this.applyForce({ x: fx, y: -1 * this.strength.y });
    this.isOnLeftWall = false;
    this.isOnRightWall = false;
  }

  updateNotVerticalTime(): void {
    const notMovingVertical = this.velocity.y <= 0.1 && this.velocity.y >= -0.1;
    // console.log("not moving v?: ", notMovingVertical);
    if (!notMovingVertical) {
      //   console.log("not incrementing");
      this.notMovingVerticalTime = 0;
      return;
    }
    // console.log("incrementing");
    // console.log(this.velocity.y);
    this.notMovingVerticalTime += 1;
  }

  onAnimate(): void {
    this.updateNotVerticalTime();
  }
}
