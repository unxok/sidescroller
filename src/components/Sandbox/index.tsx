import { BOUNCE_DAMPENING, GRAVITY, TIME_CONSTANT } from "@/game/constants";
import { WH, XY, assert } from "@/utils";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const CANVAS_ID = "sandbox";

const pauseTrue = new CustomEvent("pauseChanged", {
  detail: {
    paused: true,
  },
});
const pauseFalse = new CustomEvent("pauseChanged", {
  detail: {
    paused: false,
  },
});
type PauseChangedEvent = typeof pauseTrue | typeof pauseFalse;

const stepFrame = new CustomEvent("stepFrame");

export const Sandbox = () => {
  const [reset, resetCanvas] = useState(0);
  const ref = useRef<HTMLCanvasElement>(null);

  const togglePaused = () => {
    if (!ref?.current) return;
    const paused = ref.current.getAttribute("data-paused") === "true";
    ref.current.setAttribute("data-paused", (!paused).toString());
    if (paused) {
      return window.dispatchEvent(pauseFalse);
    }
    window.dispatchEvent(pauseTrue);
  };

  useEffect(() => {
    // setTimeout(() => game(), 0);
    game();
  }, [reset]);

  return (
    <div className="w-[90vw]">
      <h1 className="text-4xl font-bold tracking-wide">Sandbox</h1>
      <br />
      <canvas
        ref={ref}
        width={0}
        height={0}
        id={CANVAS_ID}
        className="border"
      />
      <div className="flex flex-wrap items-center gap-4 py-3">
        <Button onClick={() => togglePaused()}>pause</Button>
        <Button onClick={() => window.dispatchEvent(stepFrame)}>step</Button>
        <Button onClick={() => resetCanvas((prev) => prev + 1)}>reset</Button>
      </div>
    </div>
  );
};

const getCtx = () => {
  const c = document.getElementById(CANVAS_ID);
  if (!c) {
    // throw new Error(
    //   "Couldn't find the canvas with the supplied id: " + CANVAS_ID,
    // );
    return;
  }
  const canvas = assert<HTMLCanvasElement>(c);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Couldn't get 2D context from id: " + CANVAS_ID);
  return ctx;
};

const game = () => {
  const canvas = document.getElementById(CANVAS_ID) as
    | HTMLCanvasElement
    | undefined;
  if (!canvas) throw new Error("No canvas found");
  const parent = canvas.parentElement;
  if (!parent) throw new Error("No parent of canvas found");
  const width = parent.clientWidth;
  const height = 450;
  canvas.setAttribute("width", width.toString());
  canvas.setAttribute("height", height.toString());

  const box = new Player({
    fill: "green",
    strength: { x: 5, y: 60 },
    mass: 60,
    volume: { w: 50, h: 50 },
    position: { x: 50, y: 50 },
    velocity: { x: 0, y: 0 },
    acceleration: { x: 0, y: 0 },
    bouncy: true,
    minPosition: { x: 0, y: 0 },
    maxPosition: { x: width, y: height },
  });

  // const box = new Box({
  //   fill: "green",
  //   // strength: { x: 5, y: 5 },
  //   mass: 60,
  //   volume: { w: 50, h: 50 },
  //   position: { x: 50, y: 50 },
  //   velocity: { x: 0, y: 0 },
  //   acceleration: { x: 0, y: 0 },
  //   bouncy: true,
  //   minPosition: { x: 0, y: 0 },
  //   maxPosition: { x: width, y: height },
  // });

  const entities = [box];

  let frameCounter = 0;

  const animate = () => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const paused = canvas.getAttribute("data-paused") === "true";
    if (paused) {
      ctx.fillStyle = "red";
      ctx.font = "18px monospace";
      ctx.fillText("PAUSED", width - 80, 30);
      return;
    }
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "white";
    ctx.font = "18px monospace";
    ctx.fillText("Frame: " + frameCounter, 20, 20);
    ctx.fillText("Time (ms): " + performance.now().toFixed(), 20, 40);
    frameCounter++;
    entities.forEach((b) => b.animate());

    requestAnimationFrame(animate);
  };

  window.addEventListener("pauseChanged", (e) => {
    if (!(e as PauseChangedEvent).detail.paused) {
      //   console.log("unpaused");
      requestAnimationFrame(animate);
    }
  });
  window.addEventListener("stepFrame", () => {
    canvas.setAttribute("data-paused", "false");
    animate();
    canvas.setAttribute("data-paused", "true");
  });

  requestAnimationFrame(animate);
};

type BodyConstructorParams = {
  mass: number;
  volume: WH;
  position: XY;
  velocity: XY;
  acceleration: XY;
  maxPosition?: XY;
  minPosition?: XY;
  bouncy?: boolean;
};
abstract class Body {
  protected ctx = getCtx();
  constructor(protected state: BodyConstructorParams) {}

  /**
   * Called first within the `animate()` method.
   *
   */
  abstract onAnimateStart(): void;

  /**
   * Will be called as the last step in the `animate()` method
   */
  abstract onAnimateEnd(): void;

  getMass = () => this.state.mass;
  getVolume = () => ({ ...this.state.volume });
  getPosition = () => ({ ...this.state.position });
  getMaxPosition = () => ({ ...this.state.maxPosition });
  getMinPosition = () => ({ ...this.state.minPosition });
  getVelocity = () => ({ ...this.state.velocity });
  getAcceleration = () => ({ ...this.state.acceleration });

  setMass = (n: number) => {
    this.state.mass = n;
  };
  setVolume = (v: WH) => {
    this.state.volume = { ...v };
  };
  setPosition = (p: XY) => {
    const { bouncy } = this.state;
    const { w, h } = this.getVolume();
    const { x: xMin, y: yMin } = this.getMinPosition();
    const { x: xMax, y: yMax } = this.getMaxPosition();
    let px = p.x;
    let py = p.y;
    const xOverMax = xMax !== undefined && px + w > xMax;
    const xUnderMin = xMin !== undefined && px < xMin;
    const yOverMax = yMax !== undefined && py + h > yMax;
    const yUnderMin = yMin !== undefined && py < yMin;
    if (xOverMax || xUnderMin) {
      if (xOverMax) {
        px = xMax - w;
      }
      if (xUnderMin) {
        px = xMin;
      }
      bouncy &&
        this.updateVelocity((prev) => ({
          x: -1 * prev.x * BOUNCE_DAMPENING,
          y: prev.y,
        }));
      bouncy &&
        this.updateAcceleration((prev) => ({
          x: -1 * prev.x * BOUNCE_DAMPENING,
          y: prev.y,
        }));
    }
    if (yOverMax || yUnderMin) {
      if (yOverMax) {
        py = yMax - h;
      }
      if (yUnderMin) {
        py = yMin;
      }
      bouncy &&
        this.updateVelocity((prev) => ({
          x: prev.x,
          y: -1 * prev.y * BOUNCE_DAMPENING,
        }));
      bouncy &&
        this.updateAcceleration((prev) => ({
          x: prev.x,
          y: -1 * prev.y * BOUNCE_DAMPENING,
        }));
    }
    // if (xMin !== undefined && px < xMin) {
    //   px = xMin;
    //   bouncy &&
    //     this.updateVelocity((prev) => ({ x: Math.abs(prev.x), y: prev.y }));
    // }
    // if (yMin !== undefined && py < yMin) {
    //   py = yMin;
    //   bouncy &&
    //     this.updateVelocity((prev) => ({ x: prev.x, y: Math.abs(prev.y) }));
    // }
    // if (xMax !== undefined && px + w > xMax) {
    //   px = xMax - w;
    //   bouncy &&
    //     this.updateVelocity((prev) => ({
    //       x: -1 * Math.abs(prev.x),
    //       y: prev.y,
    //     }));
    // }
    // if (yMax !== undefined && py + h > yMax) {
    //   py = yMax - h;
    //   bouncy &&
    //     this.updateVelocity((prev) => ({
    //       x: prev.x,
    //       y: -1 * Math.abs(prev.y),
    //     }));
    // }
    this.state.position = { x: px, y: py };
  };
  setVelocity = (v: XY) => {
    this.state.velocity = { ...v };
  };
  setAcceleration = (a: XY) => {
    this.state.acceleration = { ...a };
  };

  updateMass = (cb: (n: number) => number) => {
    this.setMass(cb(this.getMass()));
  };
  updateVolume = (cb: (v: WH) => WH) => {
    this.setVolume(cb({ ...this.getVolume() }));
  };
  updatePosition = (cb: (p: XY) => XY) => {
    this.setPosition(cb({ ...this.getPosition() }));
  };
  updateVelocity = (cb: (v: XY) => XY) => {
    this.setVelocity(cb({ ...this.getVelocity() }));
  };
  updateAcceleration = (cb: (a: XY) => XY) => {
    this.setAcceleration(cb({ ...this.getAcceleration() }));
  };

  adjustPositionByVelocity = () => {
    const v = this.getVelocity();
    this.updatePosition((prev) => ({
      x: prev.x + v.x,
      y: prev.y + v.y,
    }));
  };

  adjustVelocityByAcceleration = () => {
    const a = this.getAcceleration();
    this.updateVelocity((prev) => ({
      x: prev.x + a.x * TIME_CONSTANT,
      y: prev.y + a.y * TIME_CONSTANT,
    }));
  };

  /**
   * Applies force to a body which updates its acceleration
   * @param f Force object
   */
  applyForce = (f: XY) => {
    const mass = this.getMass();
    // force = mass * acceleration => acceleration = force / mass
    const ax = f.x / mass;
    const ay = f.y / mass;
    this.updateAcceleration((prev) => ({
      x: prev.x + ax,
      y: prev.y + ay,
    }));
    this.adjustVelocityByAcceleration();
  };

  animate(): void {
    this.onAnimateStart();
    this.adjustPositionByVelocity();
    this.setAcceleration({ x: 0, y: 0 });
    this.onAnimateEnd();
  }
}

class Box extends Body {
  protected fill: string;
  constructor({ fill, ...props }: BodyConstructorParams & { fill: string }) {
    super({ ...props });
    this.fill = fill;
  }

  applyGravity = () => {
    this.applyForce({ x: 0, y: GRAVITY });
  };

  onAnimateEnd(): void {
    const {
      position: { x, y },
      volume: { w, h },
      velocity: { x: vx, y: vy },
      acceleration: { x: ax, y: ay },
    } = this.state;
    if (!this.ctx) return;
    this.ctx.fillStyle = this.fill;
    this.ctx.fillRect(x, y, w, h);
    this.ctx.font = "18px monospace";
    this.ctx.fillText("Position: " + x.toFixed(2) + "," + y.toFixed(2), 20, 60);
    this.ctx.fillText(
      "Velocity: " + vx.toFixed(2) + "," + vy.toFixed(2),
      20,
      80,
    );
    this.ctx.fillText(
      "Acceleration: " + ax.toFixed(2) + "," + ay.toFixed(2),
      20,
      100,
    );
  }

  onAnimateStart(): void {
    this.applyGravity();
    // this.adjustVelocityByAcceleration();
    // this.adjustPositionByVelocity();
  }
}

class Entity extends Box {
  protected strength: XY;
  constructor({
    strength,
    ...props
  }: BodyConstructorParams & { fill: string; strength: XY }) {
    super({ ...props });
    this.strength = strength;
  }

  moveRight = () => this.applyForce({ x: this.strength.x, y: 0 });
  moveLeft = () => this.applyForce({ x: -1 * this.strength.x, y: 0 });
  jump = () => this.applyForce({ x: 0, y: -this.strength.y });
}

class Player extends Entity {
  private pressedKeys: Record<string, boolean> = {};
  constructor(...props: ConstructorParameters<typeof Entity>) {
    super(...props);
    this.registerControls();
  }

  registerControls(): void {
    window.addEventListener("keydown", (e) => {
      this.pressedKeys[e.key] = true;
    });
    window.addEventListener("keyup", (e) => {
      this.pressedKeys[e.key] = false;
      if (
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" //&&

        // this.isOnGround
      ) {
        // this.applyForce({ x: this.strength.x, y: 0 });
        // this.acceleration.x = 0;
        // this.velocity.x = 0;
      }
    });
  }

  applyKeyPress(): void {
    // console.log(this.pressedKeys);
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

  onAnimateStart(): void {
    this.applyKeyPress();
    this.applyGravity();
    // this.adjustVelocityByAcceleration();
    // this.adjustPositionByVelocity();
  }
}
