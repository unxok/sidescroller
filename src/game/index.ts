import { assert } from "../utils";
import { Sprite } from "./classes/Sprite";
import { FPS } from "./classes/FPS";
import {
  DEFAULT_CANVAS_HEIGHT,
  DEFAULT_CANVAS_WIDTH,
  GAME_CANVAS_ID,
  GRAVITY,
} from "./constants";
import { Player } from "./classes/Player";

export const getCtx = () => {
  const c = document.getElementById(GAME_CANVAS_ID) as HTMLCanvasElement | null;

  if (!c) {
    throw new Error("Could not get game canvas");
  }

  const context = c.getContext("2d");

  if (!context) {
    throw new Error("Could not get 2d context");
  }

  return context as CanvasRenderingContext2D;
};

const checkCollision = (sprite1: Sprite, sprite2: Sprite) => {
  const bounds1 = sprite1.getBounds();
  const bounds2 = sprite2.getBounds();

  return !(
    bounds1.right < bounds2.left ||
    bounds1.left > bounds2.right ||
    bounds1.bottom < bounds2.top ||
    bounds1.top > bounds2.bottom
  );
};

export const game = () => {
  //   class Sprite {
  //     constructor(
  //       private x: number,
  //       private y: number,
  //       private w: number,
  //       private h: number,
  //       private fill: string,
  //     ) {}

  //     draw = () => {
  //       const { x, y, w, h, fill } = this;
  //       ctx.fillStyle = fill;
  //       ctx.fillRect(x, y, w, h);
  //     };

  //     updatePosition = (dx: number, dy: number) => {
  //       const newX = this.x + dx;
  //       const preNewY = this.y + dy;
  //       const hitBottom = preNewY + this.h >= DEFAULT_CANVAS_HEIGHT;
  //       const newY = hitBottom ? this.y : preNewY;
  //       this.x = newX;
  //       this.y = newY;
  //       this.draw();
  //     };

  //     animate = () => {
  //       this.updatePosition(0, GRAVITY);
  //     };
  //   }

  const ctx = getCtx();
  const fps = new FPS();
  const player = new Player(
    { x: 25, y: DEFAULT_CANVAS_HEIGHT - 50 },
    { w: 50, h: 50 },
    "green",
  );
  const enemy = new Sprite(
    { x: 400, y: DEFAULT_CANVAS_HEIGHT - 50 },
    { w: 50, h: 50 },
    "red",
  );
  //   const player = new Player(25, DEFAULT_CANVAS_HEIGHT - 50, 50, 50, "green");

  const entities = [player, enemy];

  entities.forEach((e) => e.draw());

  const doTick = async () => {
    ctx.clearRect(0, 0, DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT);

    fps.animate();
    entities.forEach((e) => {
      e.animate();
      // TODO not working as expected
      //   entities.forEach((e2) => {
      //     const collision = checkCollision(e, e2);
      //     if (collision) {
      //       console.log("collision occurred");
      //     }
      //   });
    });
    requestAnimationFrame(doTick);
  };

  requestAnimationFrame(async () => await doTick());
};
