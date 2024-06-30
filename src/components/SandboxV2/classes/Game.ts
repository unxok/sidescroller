import { LRTB, WH, XY, assert } from "@/utils";

export type StateUpdater<T> = (key: keyof T, value: T[keyof T]) => void;
export type StateUpdaterByUID<T> = (
  key: keyof T,
  value: T[keyof T],
  uid: number,
) => void;

const getCtx = (canvasId: string) => {
  const el = document.getElementById(canvasId);
  if (!el) throw new Error("Couldn't find canvas element by id: " + canvasId);
  if (el.tagName.toLowerCase() !== "canvas")
    throw new Error("Expected `canvas` but got " + el.tagName);
  const canvas = assert<HTMLCanvasElement>(el);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get 2D context from canvas");
  return ctx;
};

abstract class Dispatchable<T> {
  public DispatchDetail?: { key: keyof T; value: T[keyof T] };
  constructor(protected eventTarget: EventTarget) {}

  dispatch(key: keyof T, value: T[keyof T]): void {
    const ev = new CustomEvent("dispatch", {
      detail: {
        key,
        value,
      },
    });
    this.eventTarget.dispatchEvent(ev);
  }
}

// remember to update class properties when changing this
// there's gotta be a better way than this...
export type ReactiveGameProps = {
  gravity: number;
};

export type GameProps = {
  canvasId: string;
  ctx?: CanvasRenderingContext2D;
  width: number;
  height: number;
  bodies?: Body[];
} & ReactiveGameProps;

export class Game {
  private gravity: GameProps["gravity"];
  private canvasId: GameProps["canvasId"];
  private ctx: GameProps["ctx"];
  private width: GameProps["width"];
  private height: GameProps["height"];
  public bodies: GameProps["bodies"];
  private updateExternalState: StateUpdater<ReactiveGameProps>;

  constructor(
    props: GameProps,
    updateExternalState: StateUpdater<ReactiveGameProps>,
  ) {
    this.gravity = props.gravity;
    this.canvasId = props.canvasId;
    this.width = props.width;
    this.height = props.height;
    this.bodies = props.bodies;
    this.updateExternalState = updateExternalState;
  }

  generateBodyUID(): number {
    const newUID = Math.floor(Math.random() * 1000000);
    const { bodies } = this;
    if (!bodies) return newUID;
    const dup = bodies.some((b) => b.getUID() === newUID);
    if (dup) {
      return this.generateBodyUID();
    }
    return newUID;
  }

  getWidth(): number {
    return this.width;
  }
  setWidth(w: number): void {
    this.width = w;
  }

  setGravity(ay: number): void {
    this.gravity = ay;
    this.updateExternalState("gravity", ay);
  }

  setBodies(bodies: Body[]): void {
    this.bodies = [...bodies];
  }

  addBody(body: Body): void {
    const current = this.bodies ?? [];
    this.bodies = [...current, body];
  }

  initCtx(): CanvasRenderingContext2D {
    const { canvasId } = this;
    return getCtx(canvasId);
  }

  animate(): void {
    const { gravity, canvasId, width, height, bodies } = this;
    if (!this.ctx) {
      this.ctx = this.initCtx();
    }
    const { ctx } = this;
    if (!ctx) throw new Error("Tried animating but no 2D context exists");
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "green";
    ctx.font = "16px monospace";
    const texts: string[] = [];
    texts.push("Gravity: " + gravity);
    texts.push("CanvasId: " + canvasId);
    texts.forEach((text, i) => ctx.fillText(text, 20, 20 * (i + 1)));

    if (!bodies) return;

    bodies.forEach((b) => {
      b.applyGravity(this.gravity);
      b.draw();
      const { left, right, top, bottom } = b.getBounds();
      // b.draw();
      if (bottom > this.height) {
        b.updateVelocity((prev) => ({ x: prev.x, y: 0 }));
        b.updatePosition((prev) => ({
          x: prev.x,
          y: this.height - (bottom - top),
        }));
      }
      if (top < 0) {
        b.updateVelocity((prev) => ({ x: prev.x, y: 0 }));
        b.updatePosition((prev) => ({ x: prev.x, y: 0 }));
      }
      if (left < 0) {
        b.updateVelocity((prev) => ({ x: 0, y: prev.y }));
        b.updatePosition((prev) => ({ x: 0, y: prev.y }));
      }
      if (right > this.width) {
        b.updateVelocity((prev) => ({ x: 0, y: prev.y }));
        b.updatePosition((prev) => ({
          x: this.width - (right - left),
          y: prev.y,
        }));
      }
    });
  }
}

export type ReactiveBodyProps = {
  position: XY;
  volume: WH;
  mass: number;
  velocity: XY;
  acceleration: XY;
  immovable: boolean;
  fill: string;
  uid: number;
};

export type BodyProps = ReactiveBodyProps & {
  canvasId: string;

  ctx?: CanvasRenderingContext2D;
};

export class Body {
  private position: BodyProps["position"];
  private volume: BodyProps["volume"];
  private mass: BodyProps["mass"];
  private velocity: BodyProps["velocity"];
  private acceleration: BodyProps["acceleration"];
  private immovable: BodyProps["immovable"];
  private fill: BodyProps["fill"];
  private canvasId: BodyProps["canvasId"];
  public ctx: BodyProps["ctx"];
  private updateExternalState: StateUpdaterByUID<ReactiveBodyProps>;
  private uid: number;

  constructor(
    props: BodyProps,
    updateExternalState: StateUpdaterByUID<ReactiveBodyProps>,
  ) {
    this.position = props.position;
    this.volume = props.volume;
    this.mass = props.mass;
    this.velocity = props.velocity;
    this.acceleration = props.acceleration;
    this.immovable = props.immovable;
    this.fill = props.fill;
    this.canvasId = props.canvasId;
    // this.ctx = props.ctx <-- Since we're in react, this should be called later
    this.updateExternalState = updateExternalState;
    this.uid = props.uid;
  }

  initCtx(): CanvasRenderingContext2D {
    const { canvasId } = this;
    return getCtx(canvasId);
  }

  getFill(): string {
    return this.fill;
  }

  getBounds(): LRTB {
    const {
      position: { x, y },
      volume: { w, h },
    } = this;
    return {
      left: x,
      right: x + w,
      top: y,
      bottom: y + h,
    };
  }

  getUID(): number {
    return this.uid;
  }

  setUID(uid: number): void {
    const old = this.uid;
    this.uid = uid;
    this.updateExternalState("uid", uid, old);
  }

  setPosition(value: BodyProps["position"]): void {
    this.position = { ...value };
    this.updateExternalState("position", { ...value }, this.uid);
  }
  updatePosition(cb: (pos: XY) => XY): void {
    const newPos = cb({ ...this.position });
    this.setPosition(newPos);
  }
  setVolume(value: BodyProps["volume"]): void {
    this.volume = { ...value };
    this.updateExternalState("volume", { ...value }, this.uid);
  }
  setMass(value: BodyProps["mass"]): void {
    this.mass = value;
    this.updateExternalState("mass", value, this.uid);
  }
  setVelocity(value: BodyProps["velocity"]): void {
    this.velocity = { ...value };
    this.updateExternalState("velocity", { ...value }, this.uid);
  }
  updateVelocity(cb: (vel: XY) => XY): void {
    const newVel = cb({ ...this.velocity });
    this.setVelocity(newVel);
  }
  setAcceleration(value: BodyProps["acceleration"]): void {
    this.acceleration = { ...value };
    this.updateExternalState("acceleration", { ...value }, this.uid);
  }
  updateAcceleration(cb: (acc: XY) => XY): void {
    const newAcc = cb({ ...this.acceleration });
    this.setAcceleration(newAcc);
  }
  setImmovable(value: BodyProps["immovable"]): void {
    this.immovable = value;
    this.updateExternalState("immovable", value, this.uid);
  }
  setFill(value: BodyProps["fill"]): void {
    this.fill = value;
    this.updateExternalState("fill", value, this.uid);
  }

  applyGravity(ay: number): void {
    if (this.immovable) return;
    this.updateAcceleration((prev) => ({
      x: prev.x,
      y: prev.y + ay,
    }));
  }

  onBeforeDraw(): void {
    this.updateVelocity((prev) => ({
      x: prev.x + this.acceleration.x,
      y: prev.y + this.acceleration.y,
    }));
    this.updatePosition((prev) => ({
      x: prev.x + this.velocity.x,
      y: prev.y + this.velocity.y,
    }));
  }

  onAferDraw(): void {
    this.setAcceleration({ x: 0, y: 0 });
  }

  draw(): void {
    const {
      position: { x, y },
      volume: { w, h },
      fill,
      ctx,
    } = this;
    if (!ctx)
      throw new Error("Tried drawing on canvas when context is undefined");

    this.onBeforeDraw();

    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);

    this.onAferDraw();
  }
}
