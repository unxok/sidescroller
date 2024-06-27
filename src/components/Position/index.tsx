import { useContext, useEffect, useRef, useState } from "react";
import { ArticleWidthContext } from "../../App";
import { Canvas } from "../Canvas";
import { Slider } from "../ui/slider";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { PauseIcon, PlayIcon } from "@radix-ui/react-icons";

export const Position = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const articleWidth = useContext(ArticleWidthContext);
  const width = articleWidth * 0.75;
  // const height = article.height * 0.5;
  const height = 300;

  const bodyWidth = 50;
  const bodyHeight = 50;

  const [coords, setCoords] = useState({ x: 10, y: 10 });

  // console.log("viewport: ", viewport);

  useEffect(() => {
    if (!ref?.current) return;
    render(ref.current);
  }, [articleWidth, coords]);

  const render = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, articleWidth, height);
    ctx.fillStyle = "green";
    ctx.fillRect(coords.x, coords.y, bodyWidth, bodyHeight);
  };

  return (
    <>
      <h3>Position</h3>
      <p>First up, each entity will need to have a position</p>
      <p>
        This is pretty easy to represent: Just a number for <code>x</code> and{" "}
        <code>y</code> respectively. Use the sliders below to see how that
        looks. You can also press the buttons to the right of the sliders to
        make them adjust automatically (kind of like the classic dvd logo
        screensaver).
      </p>
      <p>
        Pressing the play button effectively gives the entity{" "}
        <i>
          <b>velocity</b>
        </i>
      </p>
      <p>
        Note: The <code>x</code> and <code>y</code> coordinates are restricted
        based on height and width of the canvas. This is <i>not</i> the same as
        actual collision detection (which we'll get to){" "}
      </p>
      <br />
      <Controls
        width={width}
        height={height}
        bodyWidth={bodyWidth}
        bodyHeight={bodyHeight}
        coords={coords}
        setCoords={setCoords}
      />
      <br />
      <Canvas
        id="bodies"
        ref={ref}
        width={width}
        height={height}
        className="rounded-xl border bg-background"
      />
    </>
  );
};

const Controls = ({
  width,
  height,
  bodyWidth,
  bodyHeight,
  coords,
  setCoords,
}: {
  width: number;
  height: number;
  bodyWidth: number;
  bodyHeight: number;
  coords: { x: number; y: number };
  setCoords: React.Dispatch<
    React.SetStateAction<{
      x: number;
      y: number;
    }>
  >;
}) => {
  const [intervalId, setIntervalId] = useState({ x: -1, y: -1 });

  // we don't need actual state for these three `let`s
  let forward = {
    x: true,
    y: true,
  };
  let x = coords.x;
  let y = coords.y;
  const xMax = width - bodyWidth;
  const yMax = height - bodyHeight;

  const animationLoopX = () => {
    // if (!animation.current.x.running) return;
    // console.log("x: ", x);
    const atOrOverMax = x >= xMax;
    const atOrUnderMin = x <= 0;
    const f1 = atOrOverMax ? false : forward.x;
    const f2 = atOrUnderMin ? true : f1;
    forward.x = f2;
    x = f2 ? x + 1 : x - 1;
    setCoords((prev) => ({ x: x, y: prev.y }));
    // requestAnimationFrame(animationLoopX);
  };

  const animationLoopY = () => {
    // if (!animation.current.x.running) return;
    // console.log("x: ", x);
    const atOrOverMax = y >= yMax;
    const atOrUnderMin = y <= 0;
    const f1 = atOrOverMax ? false : forward.y;
    const f2 = atOrUnderMin ? true : f1;
    forward.y = f2;
    y = f2 ? y + 1 : y - 1;
    setCoords((prev) => ({ x: prev.x, y: y }));
    // requestAnimationFrame(animationLoopX);
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center gap-3">
        <Label htmlFor="x-coordinate" className="whitespace-nowrap">
          X ={" "}
        </Label>
        <Slider
          id="x-coordinate"
          name="x-coordinate"
          thumbLabel
          className="w-3/4"
          min={0}
          max={xMax}
          value={[coords.x]}
          onValueChange={(arr) =>
            setCoords((prev) => ({ x: arr[0] ?? 0, y: prev.y }))
          }
        />
        <Label htmlFor="x-coordinate-play-button" className="sr-only">
          Play button
        </Label>
        <Button
          id="x-coordinate-play-button"
          name="x-coordinate-play-button"
          variant={"secondary"}
          onClick={() => {
            if (intervalId.x === -1) {
              // console.log("starting");
              const id = window.setInterval(animationLoopX, 10);
              setIntervalId((prev) => ({ x: id, y: prev.y }));
              return;
            }
            // console.log("stopping");
            window.clearInterval(intervalId.x);
            setIntervalId((prev) => ({ x: -1, y: prev.y }));
          }}
        >
          {intervalId.x === -1 ? <PlayIcon /> : <PauseIcon />}
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <Label htmlFor="y-coordinate" className="whitespace-nowrap">
          Y ={" "}
        </Label>

        <Slider
          id="y-coordinate"
          name="y-coordinate"
          thumbLabel
          className="w-3/4"
          min={0}
          max={yMax}
          value={[coords.y]}
          onValueChange={(arr) =>
            setCoords((prev) => ({ x: prev.x, y: arr[0] ?? 0 }))
          }
        />
        <Label htmlFor="y-coordinate-play-button" className="sr-only">
          Play button
        </Label>
        <Button
          id="y-coordinate-play-button"
          name="y-coordinate-play-button"
          variant={"secondary"}
          onClick={() => {
            if (intervalId.y === -1) {
              // console.log("starting");
              const id = window.setInterval(animationLoopY, 10);
              setIntervalId((prev) => ({ x: prev.x, y: id }));
              return;
            }
            // console.log("stopping");
            window.clearInterval(intervalId.y);
            setIntervalId((prev) => ({ x: prev.x, y: -1 }));
          }}
        >
          {intervalId.y === -1 ? <PlayIcon /> : <PauseIcon />}
        </Button>
      </div>
    </div>
  );
};
