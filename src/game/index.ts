import {
  DEFAULT_CANVAS_HEIGHT,
  DEFAULT_CANVAS_WIDTH,
  GAME_CANVAS_ID,
} from "./constants";
import { Player } from "./classes/Player";
import { Entity } from "./classes/Entity";
import { Platform } from "./classes/Box";

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

export const game = () => {
  const ctx = getCtx();

  const player = new Player(
    "green",
    { x: 50, y: 100 },
    { x: 50, y: 50 },
    { w: 50, h: 50 },
    50,
    { x: 0, y: 0 },
    { x: 8, y: 10 },
    { x: 0, y: 0 },
    true,
    false,
    true,
  );

  const enemy = new Entity(
    "green",
    { x: 50, y: 100 },
    { x: 400, y: 50 },
    { w: 50, h: 50 },
    500,
    { x: 0, y: 0 },
    { x: 8, y: 10 },
    { x: 0, y: 0 },
    true,
    false,
    true,
  );

  const platform1 = new Platform(
    "gray",
    { x: 200, y: 0 },
    { w: 50, h: 400 },
    500,
    { x: 0, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 0 },
    true,
    true,
    false,
  );

  const platform2 = new Platform(
    "black",
    { x: 50, y: 500 },
    { w: 800, h: 50 },
    500,
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    true,
    true,
    false,
  );

  const objects = [player, platform1, platform2, enemy];

  let handle = 0;

  const doTick = () => {
    ctx.clearRect(0, 0, DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT);
    objects.forEach((o1, i1) => {
      objects.forEach((o2, i2) => {
        if (i1 === i2) return;
        const isCollision = o1.checkCollision(o2);
        if (!isCollision) return;
        o1.fixCollision(o2);
      });
      o1.animate();
    });

    handle = requestAnimationFrame(doTick);
  };

  let isPaused = false;
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (isPaused) {
        console.log("unpaused");
        isPaused = false;
        ctx.clearRect(10, 10, 50, 50);
        doTick();
        return;
      }
      console.log("paused");
      cancelAnimationFrame(handle);
      ctx.fillText("Paused", 10, 10, 50);
      isPaused = true;
    }
    if (e.key === "f") {
      doTick();
      ctx.fillText("Paused", 10, 10, 50);
      cancelAnimationFrame(handle);
    }
  });

  doTick();
};
