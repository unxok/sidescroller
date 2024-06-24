import { Side, XY, assert } from "../utils";
import { Sprite } from "./classes/Sprite";
import { FPS } from "./classes/FPS";
import {
  DEFAULT_CANVAS_HEIGHT,
  DEFAULT_CANVAS_WIDTH,
  GAME_CANVAS_ID,
  GRAVITY,
} from "./constants";
import { Player } from "./classes/Player";
import { Entity } from "./classes/Entity";

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

const checkCollision: (
  sprite: Sprite,
  entity: Entity,
) => {
  collision: boolean;
  side?: Side;
  offset: number;
} = (sprite, entity) => {
  const bounds1 = sprite.getBounds();
  const bounds2 = entity.getBounds();
  // const r: ReturnType<typeof checkCollision> = {
  //   collision: false,
  //   offset: { x: 0, y: 0 },
  // };
  // console.log("b1: ", bounds1);
  // console.log("b2: ", bounds2);
  // let sides = { left: false, right: false, top: false, bottom: false };

  const r: ReturnType<typeof checkCollision> = {
    collision: false,
    side: undefined,
    offset: 0,
  };

  // - t1 is below b2
  // - b1 is above t2
  const notWithinHorizontal =
    bounds1.top > bounds2.bottom || bounds1.bottom < bounds2.top;

  // - l1 greater than r2
  // - r1 less than l2
  const notWithinVertical =
    bounds1.left > bounds2.right || bounds1.right < bounds2.left;

  r.collision = !notWithinHorizontal && !notWithinVertical;
  // r.collision && console.log("collision");

  const hit: Record<Side, number> = { left: 0, right: 0, top: 0, bottom: 0 };

  // The side the sprite feels the collision
  hit.left = Math.abs(bounds1.left - bounds2.right);
  hit.right = Math.abs(bounds1.right - bounds2.left);
  hit.top = Math.abs(bounds1.top - bounds2.bottom);
  hit.bottom = Math.abs(bounds1.bottom - bounds2.top);

  // console.log("hit: ", hit);
  const min = Math.min(hit.left, hit.right, hit.top, hit.bottom);

  r.side = Object.keys(hit).find((side) => {
    return hit[side as Side] === min;
  }) as Side;

  if (!r.collision) return r;
  if (r.side === "left") {
    sprite.setPosition((prev) => ({
      x: bounds2.right,
      y: prev.y,
      options: {
        isOnLeftWall: true,
      },
    }));
  }
  if (r.side === "right") {
    sprite.setPosition((prev) => ({
      x: bounds2.left - prev.w,
      y: prev.y,
      options: {
        isOnRightWall: true,
      },
    }));
  }
  if (r.side === "top") {
    sprite.setPosition((prev) => ({
      x: prev.x,
      y: bounds2.bottom,
      options: {
        isOnCeiling: true,
      },
    }));
  }
  if (r.side === "bottom") {
    sprite.isOnGround = true;
    sprite.setPosition((prev) => ({
      x: prev.x,
      y: bounds2.top - prev.h,
      options: {
        isOnGround: true,
        isOnLeftWall: false,
        isOnRightWall: false,
      },
    }));
  }

  // hitSide &&
  //   r.collision &&
  //   console.log("side sprite felt collission: ", hitSide);

  return r;
};

const checkAndFixCollision: (sprite: Sprite, entity: Entity) => void = (
  sprite,
  entity,
) => {
  const { collision, side, offset } = checkCollision(sprite, entity);
  if (!collision) return;

  // console.log("hit side: ", side);

  // sprite.acceleration = { x: 0, y: 0 };
  // sprite.velocity = { x: 0, y: 0 };
  if (side === "bottom") {
    sprite.isOnGround = true;
  }

  // return checkAndFixCollision(sprite, entity);
};

export const game = () => {
  const ctx = getCtx();
  const fps = new FPS();
  const player = new Player({ x: 25, y: 500 }, { w: 50, h: 80 }, "green");
  const enemy = new Sprite(
    { x: 400, y: DEFAULT_CANVAS_HEIGHT - 50 },
    { w: 50, h: 50 },
    "red",
  );

  const platform = new Entity(
    { x: 25, y: DEFAULT_CANVAS_HEIGHT - 160 },
    { w: 500, h: 50 },
    "black",
  );

  const platform2 = new Entity({ x: 700, y: 300 }, { w: 200, h: 500 }, "black");
  //   const player = new Player(25, DEFAULT_CANVAS_HEIGHT - 50, 50, 50, "green");

  const entities = [player, platform, platform2];

  entities.forEach((e) => e.draw());

  const doTick = async () => {
    ctx.clearRect(0, 0, DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT);

    entities.forEach((e, i) => {
      if (i === 0) return;
      checkAndFixCollision(player, e);
      player.animate();
      e.animate();
      // player.animate();
      // player.updatePosition(offset.x, offset.y);
      // player.animate();
    });
    // checkCollision(enemy, player);
    fps.animate();

    // await new Promise<void>((res) => setTimeout(() => res(), 240));
    requestAnimationFrame(doTick);
  };

  requestAnimationFrame(async () => await doTick());
};
