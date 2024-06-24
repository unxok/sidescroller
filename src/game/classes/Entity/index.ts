import { getCtx } from "../..";
import { WH, XY } from "../../../utils";
import { DENSITY_CONSTANT } from "../../constants";

export class Entity {
  ctx = getCtx();
  mass = 0;

  constructor(
    protected position: XY,
    protected volume: WH,
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
    this.ctx.fillText(
      `L${b.left.toFixed(2)} R${b.right.toFixed(2)} T${b.top.toFixed(2)} B${b.bottom.toFixed(2)}`,
      b.right - b.left,
      b.bottom - b.top,
    );
  };

  updatePosition = (dx: number, dy: number) => {
    const {
      position: { x, y },
    } = this;
    const newX = x + dx;
    const newY = y + dy;
    this.position = { x: newX, y: newY };
    // this.draw();
  };

  setPosition = (cb: (prev: XY & WH) => XY) => {
    const { x, y } = this.position;
    const { x: newX, y: newY } = cb({ ...this.position, ...this.volume });
    this.updatePosition(newX - x, newY - y);
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
