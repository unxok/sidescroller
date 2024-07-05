import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Vector2 } from "./Vector2";
import { Body } from "./Body";
import { Game } from "./Game";
import { Button } from "../ui/button";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 450;

const box = new Body({
  mass: 50,
  friction: 1,
  volume: [50, 50],
  position: new Vector2(100, 100),
  velocity: new Vector2(0, 0),
  acceleration: new Vector2(0, 0),
  fill: "green",
});

const box2 = new Body({
  mass: 500,
  friction: 1,
  volume: [50, 50],
  position: new Vector2(300, 100),
  velocity: new Vector2(0, 0),
  acceleration: new Vector2(0, 0),
  fill: "blue",
});

const game = new Game({
  gravity: 60,
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  bodies: [box, box2],
});

let isPaused = false;

export const SandboxV3 = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef<number>(0);

  const animate = (time: number) => {
    // console.log("time: ", time);
    if (isPaused) {
      console.log("paused ", time);
      return;
    }
    if (!canvasRef?.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) throw new Error("Couldn't get context");
    // const dt = timeRef.current !== -1 ? time - timeRef.current : 8.3;
    // if (dt >= 8.3) {
    //   timeRef.current = time;
    //   game.calculatePhysics(dt / 1000);
    // }
    // const dt = timeRef.current !== -1 ? time - timeRef.current : 500;
    // if (dt >= 500) {
    //   timeRef.current = time;
    //   game.calculatePhysics(dt / 1000);
    // }
    let dt = time - timeRef.current;
    if (dt > 1000) {
      dt = 1000 / 60;
    }
    if (dt >= 1000 / 60) {
      game.calculatePhysics(dt / 1000);
      timeRef.current = time;
    }

    game.draw(ctx);
    requestAnimationFrame(animate);
  };

  return (
    <div>
      v3
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="rounded-md border"
      ></canvas>
      <div className="flex items-center gap-2 py-2">
        <Button
          onClick={() => {
            // animate(0);
            requestAnimationFrame(animate);
          }}
        >
          start
        </Button>
        <Button onClick={() => (isPaused = true)}>pause</Button>
      </div>
    </div>
  );
};
