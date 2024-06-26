import { useContext, useEffect, useRef, useState } from "react";
import { ViewportContext } from "../../App";
import { Canvas } from "../Canvas";
import { Slider } from "../ui/slider";
import { Label } from "../ui/label";
import { WH, XY } from "@/utils";

export const Velocity = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const viewport = useContext(ViewportContext);
  const width = viewport.width * 0.75;
  const height = viewport.height * 0.5;

  const [velocity, setVelocity] = useState({ x: 2, y: 4 });

  // console.log("viewport: ", viewport);

  useEffect(() => {
    if (!ref?.current) return;
    render(ref.current);
  }, [viewport, velocity]);

  const render = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, viewport.width, viewport.height);
    // ctx.fillStyle = "green";
    // ctx.fillRect(coords.x, coords.y, bodyWidth, bodyHeight);
    const box = new Body(
      { x: 10, y: 10 },
      { x: width, y: height },
      { x: velocity.x, y: velocity.y },
      ctx,
    );

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      box.animate();
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  };

  return (
    <>
      <h3>Velocity</h3>
      <p>
        Adjusting the position directly <i>technically</i> works to mimic
        velocity. However, it can look pretty choppy.
      </p>
      <p>
        Ideally each entity can have a velocity that defines how its position
        changes every frame of animation. This will be affected by things like
        force and acceleration once we wire those up, but for now you can adjust
        manually with the sliders.
      </p>
      <p>
        No play buttons from this point on unfortunately due to the complexity
        of phsyics (even at this level so far). If there <i>were</i> play
        buttons though, they would effectively give the entity{" "}
        <i>acceleration</i>
      </p>
      <br />
      <Controls velocity={velocity} setVelocity={setVelocity} />
      {/* <p>
        X = pixels moved <i>horizontally</i> per frame
      </p>
      <p>
        Y = pixels moved <i>vertically</i> per frame
      </p> */}
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
  velocity,
  setVelocity,
}: {
  velocity: { x: number; y: number };
  setVelocity: React.Dispatch<
    React.SetStateAction<{
      x: number;
      y: number;
    }>
  >;
}) => {
  const xMax = 20;
  const yMax = 20;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center gap-3">
        <Label htmlFor="horizontal-velocity" className="whitespace-nowrap">
          Horizontal ={" "}
        </Label>
        <Slider
          id="horizontal-velocity"
          name="horizontal-velocity"
          thumbLabel={"pixels per second"}
          className="w-3/4"
          min={0}
          max={xMax}
          value={[velocity.x]}
          onValueChange={(arr) =>
            setVelocity((prev) => ({ x: arr[0] ?? 0, y: prev.y }))
          }
        />
      </div>
      <div className="flex items-center gap-3">
        <Label htmlFor="vertical-velocity" className="whitespace-nowrap">
          Vertical ={" "}
        </Label>
        <Slider
          id="vertical-velocity"
          name="vertical-velocity"
          thumbLabel={"pixels per second"}
          className="w-3/4"
          min={0}
          max={yMax}
          value={[velocity.y]}
          onValueChange={(arr) =>
            setVelocity((prev) => ({ x: prev.x, y: arr[0] ?? 0 }))
          }
        />
      </div>
    </div>
  );
};

// velocity and position only
class Body {
  volume: WH = { w: 50, h: 50 };
  constructor(
    protected position: XY,
    protected maxPosition: XY,
    // pixels per frame
    protected velocity: XY,
    private ctx: CanvasRenderingContext2D,
  ) {}

  draw(): void {
    const {
      position: { x, y },
      volume: { w, h },
      ctx,
    } = this;
    ctx.fillStyle = "green";
    ctx.fillRect(x, y, w, h);
  }

  affectPositionByVelocity(): void {
    const { w, h } = this.volume;
    const x = this.position.x + this.velocity.x;
    const y = this.position.y + this.velocity.y;
    const underMinX = x < 0;
    const underMinY = y < 0;
    const overMaxX = x + w > this.maxPosition.x;
    const overMaxY = y + h > this.maxPosition.y;
    if (!(underMinX || underMinY || overMaxX || overMaxY)) {
      // console.log("out of bounds");
      this.position.x = x;
      this.position.y = y;
      return;
    }
    if (underMinX) {
      this.position.x = 0;
      this.velocity.x = Math.abs(this.velocity.x);
    }
    if (underMinY) {
      this.position.y = 0;
      this.velocity.y = Math.abs(this.velocity.y);
    }
    if (overMaxX) {
      this.position.x = this.maxPosition.x - w;
      this.velocity.x = -1 * Math.abs(this.velocity.x);
    }
    if (overMaxY) {
      this.position.y = this.maxPosition.y - h;
      this.velocity.y = -1 * Math.abs(this.velocity.y);
    }
  }

  setVelocity(v: XY): void {
    this.velocity.x = v.x;
    this.velocity.y = v.y;
  }

  animate(): void {
    this.draw();
    this.affectPositionByVelocity();
  }
}
