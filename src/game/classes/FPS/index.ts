import { getCtx } from "../..";
import { DEFAULT_CANVAS_WIDTH } from "../../constants";

export class FPS {
  ctx = getCtx();
  #frames: number[];
  #fps: string;
  constructor() {
    this.#frames = [];
    this.#fps = "60 fps";
  }

  update = () => {
    const currentFrame = performance.now();
    while (this.#frames.length > 0 && this.#frames[0] <= currentFrame - 1000) {
      this.#frames.shift();
    }
    this.#frames.push(currentFrame);
    const fps = this.#frames.length;
    this.#fps = fps.toFixed(2) + " fps";
  };

  draw = () => {
    this.ctx.fillStyle = "black";
    this.ctx.font = "25px monospace";
    this.ctx.fillText(this.#fps, DEFAULT_CANVAS_WIDTH - 150, 40);
  };

  animate = () => {
    this.update();
    this.draw();
  };
}
