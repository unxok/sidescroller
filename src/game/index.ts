import { XY, assert } from "../utils";
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
  side: { horizontal?: "left" | "right"; vertical?: "top" | "bottom" };
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
    side: {},
  };

  const bottom = bounds1.top <= bounds2.top && bounds1.bottom >= bounds2.top;
  const top = bounds1.top <= bounds2.bottom && bounds1.bottom >= bounds2.bottom;
  const left = bounds1.right >= bounds2.right && bounds1.left <= bounds2.right;
  const right = bounds1.right >= bounds2.left && bounds1.left <= bounds2.left;

  if (bottom || top || left || right) {
    r.collision = true;
  }
  if (bottom) {
    r.side.vertical = "bottom";
    console.log(r.side);
  }
  if (top) {
    r.side.vertical = "top";
    console.log(r.side);
  }
  if (left) {
    r.side.horizontal = "left";
    console.log(r.side);
  }
  if (right) {
    r.side.horizontal = "right";
    console.log(r.side);
  }

  if (!((left || right) && (top || bottom))) {
    r.collision = false;
  }

  return r;
};

const checkAndFixCollision: (sprite: Sprite, entity: Entity) => void = (
  sprite,
  entity,
) => {
  // const { collision, side } = checkCollision(sprite, entity);
  // if (!collision) return;

  // if (side === "left" || side === "right") {
  //   sprite.velocity.x *= -1;
  // }

  // if (side === "top" || side === "bottom") {
  //   sprite.velocity.y *= -1;
  // }
  // sprite.applyVelocity();
  const {
    collision,
    side: { horizontal, vertical },
  } = checkCollision(sprite, entity);
  if (!collision) {
    return;
  }
  // console.log(newSide);
  sprite.acceleration = { x: 0, y: 0 };
  sprite.velocity = { x: 0, y: 0 };
  // if (newSide === "bottom") {
  //   sprite.isOnGround = true;
  // }
  const displacement: XY = { x: 0, y: 0 };
  const adjustment = 5;
  if (horizontal === "left") {
    displacement.x = adjustment;
  }
  if (horizontal === "right") {
    displacement.x = -adjustment;
  }

  if (vertical === "bottom") {
    displacement.y = -adjustment;
  }

  if (vertical === "top") {
    displacement.y = adjustment;
  }
  sprite.updatePosition(displacement.x, displacement.y);
  // sprite.displace(displacement);
  const { collision: finalCollision } = checkCollision(sprite, entity);
  if (!finalCollision) {
    return;
  }
  return checkAndFixCollision(sprite, entity);
};

export const game = () => {
  const ctx = getCtx();
  const fps = new FPS();
  const player = new Player(
    { x: 25, y: DEFAULT_CANVAS_HEIGHT - 50 },
    { w: 50, h: 80 },
    "green",
  );
  const enemy = new Sprite(
    { x: 400, y: DEFAULT_CANVAS_HEIGHT - 50 },
    { w: 50, h: 50 },
    "red",
  );

  const platform = new Entity(
    { x: 700, y: DEFAULT_CANVAS_HEIGHT - 200 },
    { w: 200, h: 50 },
    "black",
  );
  //   const player = new Player(25, DEFAULT_CANVAS_HEIGHT - 50, 50, 50, "green");

  const entities = [player, enemy, platform];

  entities.forEach((e) => e.draw());

  // entities.forEach((e) => {
  //   e.animate();
  //   // TODO not working as expected
  //   // Because it's checking against itself...
  //   entities.forEach((e2) => {
  //     const collision = checkCollision(e, e2);
  //     if (collision) {
  //       console.log("collision occurred");
  //     }
  //   });
  // });

  const doTick = async () => {
    ctx.clearRect(0, 0, DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT);
    entities.forEach((e, i) => {
      e.animate();
    });

    entities.forEach((e, i) => {
      if (i === 0) return;
      checkAndFixCollision(player, e);
      // player.updatePosition(offset.x, offset.y);
      // player.animate();
    });
    checkCollision(enemy, player);
    fps.animate();

    requestAnimationFrame(doTick);
  };

  requestAnimationFrame(async () => await doTick());
};
