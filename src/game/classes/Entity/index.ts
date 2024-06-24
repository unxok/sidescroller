import { getCtx } from "../..";
import { XY } from "../../../utils";
import {
  DEFAULT_CANVAS_HEIGHT,
  DEFAULT_CANVAS_WIDTH,
  DENSITY_CONSTANT,
  FRICTION_CONSTANT,
  GRAVITY,
  TIME_CONSTANT,
} from "../../constants";

export class Entity {
  ctx = getCtx();
  mass = 0;
  //   velocity: XY = { x: 0, y: 0 };
  //   acceleration: XY = { x: 0, y: 0 };
  //   isOnGround = false;
  //   isOnLeftWall = false;
  //   isOnRightWall = false;

  constructor(
    protected position: XY,
    protected volume: { w: number; h: number },
    protected fill: string,
    protected density?: number,
  ) {}

  draw = () => {
    const {
      position: { x, y },
      volume: { w, h },
      fill,
      density,
    } = this;
    this.ctx.fillStyle = fill;
    this.ctx.fillRect(x, y, w, h);
    this.mass = w * h * (density ?? DENSITY_CONSTANT);
    const b = this.getBounds();
    this.ctx.fillText("L", b.left, y);
    this.ctx.fillText("R", b.right, y);
    this.ctx.fillText(
      `L${b.left.toFixed(2)} R${b.right.toFixed(2)} T${b.top.toFixed(2)} B${b.bottom.toFixed(2)}`,
      b.left,
      b.top - h,
    );
  };

  updatePosition = (dx: number, dy: number) => {
    const {
      position: { x, y },
    } = this;
    const newX = x + dx;
    const newY = y + dy;
    this.position = { x: newX, y: newY };
    this.draw();
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
    this.draw();
  };
}
