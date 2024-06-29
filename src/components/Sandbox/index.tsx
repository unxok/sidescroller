import { BOUNCE_DAMPENING, GRAVITY, TIME_CONSTANT } from "@/game/constants";
import {
  LRTB,
  WH,
  XY,
  assert,
  getRandomHexStr,
  getRandomInt,
  toNumber,
} from "@/utils";
import { createRef, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Game } from "./Game";
import { PauseIcon, PlayIcon, ReloadIcon } from "@radix-ui/react-icons";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "../ui/input";

export const CANVAS_ID = "sandbox";

const generateBoxes = (volume: WH, maxPosition: XY, count: number) => {
  const arr = [];
  for (let i = 0; i < count; i++) {
    const fill = "#" + getRandomHexStr(6);
    const xMax = maxPosition.x - volume.w;
    const yMax = maxPosition.y - volume.h;
    const px = getRandomInt(0, xMax);
    const py = getRandomInt(0, yMax);
    const vx = getRandomInt(1, 10) * (getRandomInt(0, 1) > 0 ? -1 : 1);
    const vy = getRandomInt(1, 10) * (getRandomInt(0, 1) > 0 ? -1 : 1);
    arr.push(
      new Box({
        fill: fill,
        mass: 60,
        volume: { ...volume },
        position: { x: px, y: py },
        velocity: { x: vx, y: vy },
        acceleration: { x: 0, y: 0 },
        bouncy: true,
        minPosition: { x: 0, y: 0 },
        maxPosition: { x: xMax, y: yMax },
      }),
    );
  }
  return arr;
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

// const game = () => {
//   const bodies = [
//     new Player({
//       fill: "green",
//       strength: { x: 5, y: 60 },
//       mass: 60,
//       volume: { w: 50, h: 50 },
//       position: { x: 50, y: 50 },
//       velocity: { x: 0, y: 0 },
//       acceleration: { x: 0, y: 0 },
//       bouncy: true,
//       minPosition: { x: 0, y: 0 },
//       // maxPosition: { x: width, y: height },
//     }),
//   ];
//   const g = new Game(9, CANVAS_ID, bodies);

//   g.init();

//   g.start();
// };

// const game2 = () => {
//   const canvas = document.getElementById(CANVAS_ID) as
//     | HTMLCanvasElement
//     | undefined;
//   if (!canvas) throw new Error("No canvas found");
//   const parent = canvas.parentElement;
//   if (!parent) throw new Error("No parent of canvas found");
//   const width = parent.clientWidth;
//   const height = 450;
//   canvas.setAttribute("width", width.toString());
//   canvas.setAttribute("height", height.toString());

//   const box = new Player({
//     fill: "green",
//     strength: { x: 5, y: 60 },
//     mass: 60,
//     volume: { w: 50, h: 50 },
//     position: { x: 50, y: 50 },
//     velocity: { x: 0, y: 0 },
//     acceleration: { x: 0, y: 0 },
//     bouncy: true,
//     minPosition: { x: 0, y: 0 },
//     maxPosition: { x: width, y: height },
//   });

//   // const box = new Box({
//   //   fill: "green",
//   //   // strength: { x: 5, y: 5 },
//   //   mass: 60,
//   //   volume: { w: 50, h: 50 },
//   //   position: { x: 50, y: 50 },
//   //   velocity: { x: 0, y: 0 },
//   //   acceleration: { x: 0, y: 0 },
//   //   bouncy: true,
//   //   minPosition: { x: 0, y: 0 },
//   //   maxPosition: { x: width, y: height },
//   // });

//   const entities = [box];

//   let frameCounter = 0;

//   const animate = () => {
//     const ctx = canvas.getContext("2d");
//     if (!ctx) return;
//     const paused = canvas.getAttribute("data-paused") === "true";
//     if (paused) {
//       ctx.fillStyle = "red";
//       ctx.font = "18px monospace";
//       ctx.fillText("PAUSED", width - 80, 30);
//       return;
//     }
//     ctx.clearRect(0, 0, width, height);
//     ctx.fillStyle = "white";
//     ctx.font = "18px monospace";
//     ctx.fillText("Frame: " + frameCounter, 20, 20);
//     ctx.fillText("Time (ms): " + performance.now().toFixed(), 20, 40);
//     frameCounter++;
//     entities.forEach((b) => b.animate());

//     requestAnimationFrame(animate);
//   };

//   window.addEventListener("pauseChanged", (e) => {
//     if (!(e as PauseChangedEvent).detail.paused) {
//       //   console.log("unpaused");
//       requestAnimationFrame(animate);
//     }
//   });
//   window.addEventListener("stepFrame", () => {
//     canvas.setAttribute("data-paused", "false");
//     animate();
//     canvas.setAttribute("data-paused", "true");
//   });

//   requestAnimationFrame(animate);
// };

type BodyConstructorParams = {
  mass: number;
  volume: WH;
  position: XY;
  velocity: XY;
  acceleration: XY;
  maxPosition?: XY;
  minPosition?: XY;
  bouncy?: boolean;
  immovable?: boolean;
  bounceDampening?: number;
  gravity?: number;
};
export abstract class Body {
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

  getBounds(): LRTB {
    const { x, y } = this.getPosition();
    const { w, h } = this.getVolume();
    return {
      left: x,
      right: x + w,
      top: y,
      bottom: y + h,
    };
  }

  getImmovability(): boolean {
    return !!this.state.immovable;
  }

  getBounceDampening(): number {
    return this.state.bounceDampening ?? 1;
  }

  setMaxPosition = (p: XY) => {
    this.state.maxPosition = { ...p };
  };

  setBounceDampening = (n: number) => {
    this.state.bounceDampening = n;
  };

  setGravity = (n: number) => {
    this.state.gravity = n;
  };

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
          x: -1 * prev.x * (this.state.bounceDampening ?? BOUNCE_DAMPENING),
          y: prev.y,
        }));
      bouncy &&
        this.updateAcceleration((prev) => ({
          x: -1 * prev.x * (this.state.bounceDampening ?? BOUNCE_DAMPENING),
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
          y: -1 * prev.y * (this.state.bounceDampening ?? BOUNCE_DAMPENING),
        }));
      bouncy &&
        this.updateAcceleration((prev) => ({
          x: prev.x,
          y: -1 * prev.y * (this.state.bounceDampening ?? BOUNCE_DAMPENING),
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
    if (this.state.immovable) return;
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

  applyGravity = () => {
    // gravity isn't really a force being applied
    // because it ends up always affecting masses by the same acceleration
    // this.applyForce({ x: 0, y: this.state.gravity ?? GRAVITY });

    if (this.getImmovability()) return;
    this.updateAcceleration((prev) => ({
      x: prev.x,
      y: prev.y + (this.state.gravity ?? GRAVITY),
    }));
    this.adjustVelocityByAcceleration();
  };

  animate(): void {
    this.onAnimateStart();
    this.applyGravity();
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

  drawLabel(): void {
    const {
      position: { x, y },
      velocity: { x: vx, y: vy },
      acceleration: { x: ax, y: ay },
    } = this.state;
    if (!this.ctx) return;
    this.ctx.font = "18px monospace";
    this.ctx.fillText(
      "Position: " + x.toFixed(2) + "," + y.toFixed(2),
      x,
      y - 60,
    );
    this.ctx.fillText(
      "Velocity: " + vx.toFixed(2) + "," + vy.toFixed(2),
      x,
      y - 40,
    );
    this.ctx.fillText(
      "Acceleration: " + ax.toFixed(2) + "," + ay.toFixed(2),
      x,
      y - 20,
    );
  }

  onAnimateEnd(): void {
    // this.drawLabel();
    const {
      position: { x, y },
      volume: { w, h },
    } = this.state;
    if (!this.ctx) return;
    this.ctx.fillStyle = this.fill;
    this.ctx.fillRect(x, y, w, h);
  }

  onAnimateStart(): void {
    // this.applyGravity();
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
  jump = () => {
    const sy = this.strength.y;
    const fy = (this.state.gravity ?? GRAVITY) > 0 ? -sy : sy;
    this.applyForce({ x: 0, y: fy });
  };
}

class Player extends Entity {
  private pressedKeys: Record<string, boolean> = {};
  constructor(...props: ConstructorParameters<typeof Entity>) {
    super(...props);
    this.registerControls();
  }

  registerControls(): void {
    const keys = ["ArrowLeft", "ArrowRight", " "];
    window.addEventListener("keydown", (e) => {
      if (!keys.includes(e.key)) return;
      this.pressedKeys[e.key] = true;
      // e.preventDefault();
    });
    window.addEventListener("keyup", (e) => {
      if (!keys.includes(e.key)) return;
      this.pressedKeys[e.key] = false;
      // e.preventDefault();
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
    // this.applyGravity();
    // this.adjustVelocityByAcceleration();
    // this.adjustPositionByVelocity();
  }

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
    this.ctx.fillText(
      "Position: " + x.toFixed(2) + "," + y.toFixed(2),
      20,
      100,
    );
    this.ctx.fillText(
      "Velocity: " + vx.toFixed(2) + "," + vy.toFixed(2),
      20,
      120,
    );
    this.ctx.fillText(
      "Acceleration: " + ax.toFixed(2) + "," + ay.toFixed(2),
      20,
      140,
    );
  }
}

const eventTarget = new EventTarget();
export const revalidateEvent = new CustomEvent("revalidate", {
  detail: {
    property: "",
    value: undefined,
  } as {
    property: string;
    value: any;
  },
});

const DEFAULT_GRAVITY = 2;
const DEFAULT_BOUNCE_DAMPENING = 0.7;

const g = new Game(
  DEFAULT_GRAVITY,
  DEFAULT_BOUNCE_DAMPENING,
  CANVAS_ID,
  [],
  eventTarget,
);

export const Sandbox = () => {
  // const [game, setGame] = useState<Game>();
  const [randomDetails, setRandomDetails] = useState({
    count: 0,
    size: 50,
  });
  const isPaused = useRef(false);
  // this is soley used for button text
  // we can't have `isPaused` be stateful since that'd be updated async by react
  const [pauseState, setPauseState] = useState(false);

  const [gameProps, setGameProps] = useState<Record<string, any>>({
    gravity: DEFAULT_GRAVITY,
  });

  const updateGamePropState = (prop: string, value: any) => {
    setGameProps((prev) => ({
      ...prev,
      [prop]: value,
    }));
  };

  const eventTargetRef = useRef(eventTarget);

  const [gravityState, setGravityState] = useState(DEFAULT_GRAVITY);

  const togglePaused = () => {
    if (isPaused.current) {
      isPaused.current = false;
      setPauseState(false);
      requestAnimationFrame(animate);
      return;
    }
    isPaused.current = true;
    setPauseState(true);
  };

  const setupGame = (reset?: boolean) => {
    // if (game && !reset) return;
    // const bodies = [
    //   new Player({
    //     fill: "green",
    //     strength: { x: 5, y: 50 },
    //     mass: 50,
    //     volume: { w: 50, h: 50 },
    //     position: { x: 50, y: 50 },
    //     velocity: { x: 0, y: 0 },
    //     acceleration: { x: 0, y: 0 },
    //     bouncy: true,
    //     minPosition: { x: 0, y: 0 },
    //     // maxPosition: { x: width, y: height },
    //   }),
    //   new Box({
    //     fill: "red",
    //     // strength: { x: 5, y: 200 },
    //     mass: 50,
    //     volume: { w: 50, h: 50 },
    //     position: { x: 150, y: 50 },
    //     velocity: { x: 0, y: 0 },
    //     acceleration: { x: 0, y: 0 },
    //     bouncy: true,
    //     minPosition: { x: 0, y: 0 },
    //     // maxPosition: { x: width, y: height },
    //   }),
    //   new Box({
    //     fill: "orange",
    //     // strength: { x: 5, y: 200 },
    //     mass: 50,
    //     volume: { w: 50, h: 50 },
    //     position: { x: 200, y: 50 },
    //     velocity: { x: 0, y: 0 },
    //     acceleration: { x: 0, y: 0 },
    //     bouncy: true,
    //     minPosition: { x: 0, y: 0 },
    //     // maxPosition: { x: width, y: height },
    //   }),
    //   new Box({
    //     fill: "blue",
    //     // strength: { x: 5, y: 200 },
    //     mass: 50,
    //     volume: { w: 50, h: 50 },
    //     position: { x: 250, y: 50 },
    //     velocity: { x: 0, y: 0 },
    //     acceleration: { x: 0, y: 0 },
    //     bouncy: true,
    //     minPosition: { x: 0, y: 0 },
    //     // maxPosition: { x: width, y: height },
    //   }),
    //   // ...generateBoxes({ w: 50, h: 50 }, { x: 400, y: 500 }, 10),
    // ];

    if (g.initComplete) return;
    g.bodies = [
      new Player({
        fill: "green",
        strength: { x: 5, y: 50 },
        mass: 50,
        volume: { w: 50, h: 50 },
        position: { x: 50, y: 50 },
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        bouncy: true,
        minPosition: { x: 0, y: 0 },
        // maxPosition: { x: width, y: height },
      }),
    ];
    g.init();
    animate();

    eventTargetRef.current.addEventListener("revalidate", (e) => {
      const {
        detail: { property, value },
      } = e as typeof revalidateEvent;
      console.log("revalidate called", property);
      if (property !== "gravity") return;
      const grav = toNumber(value);
      // const grav = g.getGravity();
      console.log("react got grav: ", grav);
      if (!grav) return;
      updateGamePropState("gravity", grav);
    });
    // const g = new Game(
    //   DEFAULT_GRAVITY,
    //   DEFAULT_BOUNCE_DAMPENING,
    //   CANVAS_ID,
    //   bodies,
    //   eventTarget,
    // );
    // setGame(g);
  };

  useEffect(
    () => console.log("gravityState changed: ", gravityState),
    [gravityState],
  );

  useEffect(() => {
    setupGame();
  }, []);

  useEffect(() => console.log("gameProps: ", gameProps), [gameProps]);

  const animate = () => {
    // if (!game) {
    //   return console.log("no game found");
    // }
    if (isPaused.current) {
      return console.log("stopping for pause");
    }
    g.animate();
    return requestAnimationFrame(animate);
  };

  // useEffect(() => {

  //   g.init();
  //   animate();
  // }, []);

  return (
    <div className="w-[90vw]">
      <h1 className="text-4xl font-bold tracking-wide">Sandbox</h1>
      <br />
      <canvas width={0} height={0} id={CANVAS_ID} className="border" />
      <div className="flex flex-wrap items-center gap-4 py-3">
        <Button>Gravity: {gravityState}</Button>
        <Button onClick={() => togglePaused()}>
          {pauseState ? <PlayIcon /> : <PauseIcon />}
        </Button>
        <Button
          onClick={() => {
            isPaused.current = true;
            togglePaused();
            setPauseState(true);
            setTimeout(() => {
              isPaused.current = true;
            }, 0);
            // isPaused = true;
          }}
        >
          step
        </Button>
        <Button onClick={() => setupGame(true)}>
          <ReloadIcon />
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="gravity-input" className="text-xl">
            Gravity
          </Label>
          <Input
            // key={Math.random()}
            name="gravity-input"
            id="gravity-input"
            value={gameProps["gravity"]}
            onChange={(e) => {
              const grav = toNumber(e.target.value);
              updateGamePropState("gravity", grav);
              g.setGravity(grav);
              // setGameProps((prev) => ({ ...prev, gravity: g }));
            }}
            className="w-24"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="bodies-count-input" className="text-xl">
            Count
          </Label>
          <Input
            // key={Math.random()}
            name="bodies-count-input"
            id="bodies-count-input"
            value={randomDetails.count}
            onChange={(e) => {
              setRandomDetails((prev) => ({
                ...prev,
                count: toNumber(e.target.value),
              }));
            }}
            className="w-24"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="bodies-size-input" className="text-xl">
            Size
          </Label>
          <Input
            // key={Math.random()}
            name="bodies-size-input"
            id="bodies-size-input"
            value={randomDetails.size}
            onChange={(e) => {
              setRandomDetails((prev) => ({
                ...prev,
                size: toNumber(e.target.value),
              }));
            }}
            className="w-24"
          />
        </div>
      </div>
      {/* <Button
        className="my-3"
        onClick={() => {
          if (!game) return;
          const canvas = document.getElementById(CANVAS_ID);
          if (!canvas) return;
          const x = toNumber(canvas.getAttribute("width"));
          const y = toNumber(canvas.getAttribute("height"));
          game.bodies = generateBoxes(
            { w: randomDetails.size, h: randomDetails.size },
            { x, y },
            randomDetails.count,
          );
          game.init();
        }}
      >
        generate
      </Button> */}
      {/* <div className="flex flex-col gap-2">
        <Label htmlFor="gravity-slider" className="text-xl">
          Gravity
        </Label>
        <p className="text-muted-foreground">
          Put positive to have gravity pull down, negative to pull up, and of
          course zero to have no gravity.
        </p>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">-20</span>
          <div className="flex w-3/4 flex-col">
            <Slider
              // makes it so it will rerender whenever game is first set
              key={Math.random()}
              name="gravity-slider"
              id="gravity-slider"
              min={-20}
              max={20}
              // thumbLabel
              // can't use `value` prop because it's value isn't truly stateful
              // since this is the only place to every change gravity, this should
              // always be in sync anyway
              defaultValue={[DEFAULT_GRAVITY]}
              onValueChange={([num]) => {
                if (!game) return;
                game.gravity = num;
              }}
            >
              {" "}
              <span className="absolute bottom-[-1.75rem] left-1/2 -translate-x-1/2 text-muted-foreground">
                0
              </span>
            </Slider>
          </div>
          <span className="text-muted-foreground">20</span>
        </div>
      </div> */}
      <br />
      {/* <div className="flex flex-col gap-2">
      <Label htmlFor="gravity-slider" className="text-xl">
        Bounce dampening
      </Label>
      <p className="text-muted-foreground">
        A multiplier to affect the velocity of an object after it collides
        with something (like the wall).{" "}
      </p>
      <ul className="list-disc pl-8 text-muted-foreground">
        <li>0 → velocity becomes zero</li>
        <li>.5 → velocity is cut in half</li>
        <li>1 → velocity stays same</li>
      </ul>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">0</span>
        <div className="flex w-3/4 flex-col">
          <Slider
            // makes it so it will rerender whenever game is first set
            key={Math.random()}
            name="gravity-slider"
            id="gravity-slider"
            min={0}
            max={1}
            step={0.1}
            // thumbLabel
            // can't use `value` prop because it's value isn't truly stateful
            // since this is the only place to every change gravity, this should
            // always be in sync anyway
            defaultValue={[DEFAULT_BOUNCE_DAMPENING]}
            onValueChange={([num]) => {
              if (!game) return;
              game.bounceDampening = num;
            }}
          >
            <span className="absolute bottom-[-1.75rem] left-1/2 -translate-x-1/2 text-muted-foreground">
              .5
            </span>
          </Slider>
        </div>
        <span className="text-muted-foreground">1</span>
      </div>
    </div> */}
    </div>
  );
};
