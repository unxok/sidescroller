import { Body } from "@/components/Sandbox";
import { LRTB, XY } from "@/utils";

const checkCollision = (body1: Body, body2: Body) => {
  const b1 = body1.getBounds();
  const b2 = body2.getBounds();
  return (
    b1.left < b2.right &&
    b1.right > b2.left &&
    b1.top < b2.bottom &&
    b1.bottom > b2.top
  );
};

const calculateVelocityAfterCollision: (
  m1: number,
  m2: number,
  v1: XY,
  v2: XY,
  damp1: number,
  damp2: number,
) => [XY, XY] = (m1, m2, v1, v2, damp1, damp2) => {
  const vx1 = (v1.x * (m1 - m2) + 2 * (m2 * v2.x)) / (m1 + m2);
  const vy1 = (v1.y * (m1 - m2) + 2 * (m2 * v2.y)) / (m1 + m2);
  const vx2 = (v2.x * (m2 - m1) + 2 * (m1 * v1.x)) / (m2 + m1);
  const vy2 = (v2.y * (m2 - m1) + 2 * (m1 * v1.y)) / (m2 + m1);
  const velocity1 = { x: vx1 * damp1, y: vy1 * damp1 };
  const velocity2 = { x: vx2 * damp2, y: vy2 * damp2 };
  return [velocity1, velocity2];
};

const calculatePositionAfterCollision: (b1: LRTB, b2: LRTB) => XY = (
  b1,
  b2,
) => {
  // distance b1 sides relative to b2's sides
  const distances: LRTB = {
    left: Math.abs(b2.left - b1.right),
    right: Math.abs(b2.right - b1.left),
    top: Math.abs(b2.top - b1.bottom),
    bottom: Math.abs(b2.bottom - b1.top),
  };
  const min = Math.min(...Object.values(distances));
  const side = (Object.keys(distances) as (keyof typeof distances)[]).find(
    (k) => distances[k] === min,
  );
  if (side === "left") {
    return {
      x: b2.left - (b1.right - b1.left),
      y: b1.top,
    };
  }
  if (side === "right") {
    return {
      x: b2.right,
      y: b1.top,
    };
  }
  if (side === "top") {
    return {
      x: b1.left,
      y: b2.top - (b1.bottom - b1.top),
    };
  }
  if (side === "bottom") {
    return {
      x: b1.left,
      y: b2.bottom,
    };
  }

  throw new Error(
    "Couldn't find closest side somehow. This should be impossible?",
  );
};

export class Game {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number = 450;
  private frameCounter: number = 0;
  public isPaused = false;
  constructor(
    public gravity: number,
    public bounceDampening: number,
    private canvasId: string,
    public bodies: Body[],
  ) {
    this.gravity = gravity;
    this.bounceDampening = bounceDampening;
    this.canvasId = canvasId;
    this.bodies = bodies;
    const { ctx, width } = getCanvasInfo(canvasId);
    this.ctx = ctx;
    this.width = width;
    // console.log(this);
  }

  init(): void {
    console.log("init");
    this.setCanvasDimensions();
    const { width, height } = this;
    const p = { x: width, y: height };
    this.bodies.forEach((b) => {
      b.setMaxPosition(p);
    });
  }

  setCanvasDimensions(): void {
    const el = document.getElementById(this.canvasId);
    if (!el) {
      throw new Error("Failed to find element with id: " + this.canvasId);
    }
    el.setAttribute("width", this.width.toString());
    el.setAttribute("height", this.height.toString());
  }

  checkAndFixCollision(b1: Body, b2: Body): void {
    const isCollision = checkCollision(b1, b2);
    if (!isCollision) return;
    //   console.log("collision at time: ", performance.now());
    const [v1, v2] = calculateVelocityAfterCollision(
      b1.getMass(),
      b2.getMass(),
      b1.getVelocity(),
      b2.getVelocity(),
      b1.getBounceDampening(),
      b2.getBounceDampening(),
    );
    const b1IsImmovable = b1.getImmovability();
    const b2IsImmovable = b2.getImmovability();
    //   let position = {x: 0, y: 0};
    if (!b1IsImmovable) {
      const p = calculatePositionAfterCollision(b1.getBounds(), b2.getBounds());
      b1.setPosition(p);
      b1.setVelocity(v1);
    }
    const anotherCollision = checkCollision(b1, b2);
    if ((b1IsImmovable && !b2IsImmovable) || anotherCollision) {
      const p = calculatePositionAfterCollision(b2.getBounds(), b1.getBounds());
      b2.setPosition(p);
    }
    if (!b2IsImmovable) {
      b2.setVelocity(v2);
    }
  }

  /**
   * React is making me do this (I think)
   * @returns That (this)
   */
  animate(): void {
    // if (this.isPaused) return;
    // console.log("paused? ", that.isPaused);
    // console.log("this: ", that);
    // console.log("ctx", that.ctx);
    const { ctx, width, height, frameCounter, bodies } = this;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "white";
    ctx.font = "18px monospace";
    ctx.fillText("Frame: " + frameCounter, 20, 20);
    ctx.fillText("Time (ms): " + performance.now().toFixed(), 20, 40);
    ctx.fillText("Gravity: " + this.gravity.toFixed(), 20, 60);
    ctx.fillText("Bounce damp: " + this.bounceDampening.toFixed(1), 20, 80);
    this.frameCounter += 1;
    // bodies.forEach((b) => {
    //   b.setBounceDampening(this.bounceDampening);
    //   b.setGravity(this.gravity);
    //   b.animate();
    // });
    for (let i1 = 0; i1 < bodies.length; i1++) {
      const b1 = bodies[i1];
      b1.setBounceDampening(this.bounceDampening);
      b1.setGravity(this.gravity);
      b1.animate();
      for (let i2 = i1 + 1; i2 < bodies.length; i2++) {
        const b2 = bodies[i2];
        b2.setBounceDampening(this.bounceDampening);
        b2.setGravity(this.gravity);
        // b2.animate();
        this.checkAndFixCollision(b1, b2);
      }
    }
  }

  // requestAnimationFrame(() => this.animate(this));
}

//   start(): void {
//     this.isPaused = false;
//     requestAnimationFrame(() => this.animate(this));
//     // this.animate();
//   }

//   pause(): void {
//     this.isPaused = true;
//   }
//}

const getCanvasInfo = (canvasId: string) => {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    throw new Error("Unable to find canvas");
  }
  if (canvas.tagName.toLowerCase() !== "canvas") {
    throw new Error(
      "Expected element to be of type `canvas` but got: " + canvas.tagName,
    );
  }
  const ctx = (canvas as HTMLCanvasElement).getContext("2d");
  if (!ctx) {
    throw new Error("Couldn't get 2D context from canvas");
  }
  const parent = canvas.parentElement;
  if (!parent) {
    throw new Error("Couldn't find parent element");
  }
  const { clientWidth: width } = parent;
  return { ctx, width };
};
