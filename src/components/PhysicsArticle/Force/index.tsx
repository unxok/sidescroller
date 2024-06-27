import { useContext, useEffect, useRef, useState } from "react";
import { Canvas } from "../../Canvas";
import { Slider } from "../../ui/slider";
import { Label } from "../../ui/label";
import { WH, XY, toNumber } from "@/utils";
import { Button } from "../../ui/button";
import SyntaxHighlighter from "react-syntax-highlighter";
import highlightStyle from "react-syntax-highlighter/dist/esm/styles/hljs/atom-one-dark-reasonable";
import { Input } from "../../ui/input";
import { ArticleWidthContext } from "..";

export const Force = () => {
  const [_, resetCanvas] = useState(0);
  const [strength, setStrength] = useState(1);
  const articleWidth = useContext(ArticleWidthContext);
  const width = articleWidth * 0.75;
  // const height = article.height * 0.5;
  const height = 300;
  const ref = useRef(
    // this doesn't matter it's just for initialization
    new Body(
      "green",
      { x: 50, y: 50 },
      { x: width, y: height },
      // except velocity should match what's created later
      // because this is used to initialize the slider default values
      { w: 50, h: 50 },
      50,
      { x: 1, y: 1 },
      { x: 1, y: 1 },
      undefined,
    ),
  );
  const [mass, setMass] = useState(ref.current.mass);

  // console.log("viewport: ", viewport);

  return (
    <>
      <h3>Force</h3>
      <p>This is where it finally starts getting interesting in my opinion.</p>
      <p>Force is a unit of energy which is typically calculated like so:</p>
      <SyntaxHighlighter language="typescript" style={highlightStyle}>
        {"const force = mass * acceleration"}
      </SyntaxHighlighter>
      <p>
        In our case, we want to be able to calculate the new acceleration of an
        entity after it has force exerted upon it. Therefore, we can instead
        change the force equation into:
      </p>
      <SyntaxHighlighter language="typescript" style={highlightStyle}>
        {"const acceleration = force / mass"}
      </SyntaxHighlighter>
      <p>
        Then we just need to add that to the current acceleration of our entity,
        and continue things like normal.
      </p>
      <p>
        Use the buttons to 'punch' the box and see what that looks like. You can
        also adjust the strength of the punch and the mass of the box.
      </p>
      <p>
        Now our movement looks a lot smoother compared to just moving the box at
        a flat 1 pixel per frame.
      </p>
      {/* <p>
        X = pixels moved <i>horizontally</i> per frame
      </p>
      <p>
        Y = pixels moved <i>vertically</i> per frame
      </p> */}
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <Label htmlFor="strength-input">Punch strength</Label>
          <Input
            id="strength-input"
            name="strength-input"
            type="number"
            value={strength}
            onChange={(e) => {
              const num = toNumber(
                e.target.value,
                1,
                (val) => toNumber(val) < 0,
              );
              setStrength(num);
            }}
            className="w-24"
          />
        </div>
        <div>
          <Label htmlFor="mass-input">Box mass</Label>
          <Input
            id="mass-input"
            name="mass-input"
            type="number"
            value={mass}
            onChange={(e) => {
              const num = toNumber(
                e.target.value,
                1,
                (val) => toNumber(val) < 0,
              );
              setMass(num);
            }}
            className="w-24"
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 py-2">
        <Button
          onClick={() => {
            ref.current.mass = mass;
            ref.current.applyForce({ x: strength, y: 0 });
          }}
        >
          punch left side
        </Button>
        <Button
          onClick={() => {
            ref.current.mass = mass;
            ref.current.applyForce({ x: -strength, y: 0 });
          }}
        >
          punch right side
        </Button>
        <Button
          variant={"secondary"}
          onClick={() => {
            ref.current.mass = mass;
            ref.current.applyForce({ x: 0, y: strength });
          }}
        >
          punch top side
        </Button>
        <Button
          variant={"secondary"}
          onClick={() => {
            ref.current.mass = mass;
            ref.current.applyForce({ x: 0, y: -strength });
          }}
        >
          punch bottom side
        </Button>
      </div>
      <Button
        variant={"destructive"}
        onClick={() => resetCanvas((prev) => ++prev)}
      >
        reset
      </Button>
      <br />
      <Canvas
        id="bodies"
        // ref={ref}
        ref={(canvas) => {
          if (!canvas) return;
          console.log("canvas rendered");
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          const box = new Body(
            "green",
            { x: width / 2 - 25, y: height / 2 - 25 },
            { x: width, y: height },
            { w: 50, h: 50 },
            50,
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            ctx,
          );
          ref.current = box;

          const animate = () => {
            ctx.clearRect(0, 0, width, height);
            box.animate();
            requestAnimationFrame(animate);
          };

          requestAnimationFrame(animate);
        }}
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
  setVelocity: (cb: (prev: XY) => XY) => void;
}) => {
  const xMax = 20;
  const yMax = 20;

  const [statefulVelociy, setStatefulVelocity] = useState(velocity);

  useEffect(() => {
    setVelocity(() => statefulVelociy);
  }, [statefulVelociy]);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center gap-3">
        <Label htmlFor="horizontal-velocity" className="whitespace-nowrap">
          Horizontal ={" "}
        </Label>
        <Slider
          id="horizontal-velocity"
          name="horizontal-velocity"
          thumbLabel={`pixels per second`}
          className="w-3/4"
          min={-xMax}
          max={xMax}
          value={[statefulVelociy.x]}
          onValueChange={(arr) =>
            setStatefulVelocity((prev) => ({ x: arr[0] ?? 0, y: prev.y }))
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
          min={-yMax}
          max={yMax}
          value={[statefulVelociy.y]}
          onValueChange={(arr) =>
            setStatefulVelocity((prev) => ({ x: prev.x, y: arr[0] ?? 0 }))
          }
        />
      </div>
    </div>
  );
};

// velocity and position only
class Body {
  constructor(
    private fill: string,
    protected position: XY,
    protected maxPosition: XY,
    protected volume: WH,
    // pixels per frame
    public mass: number,
    public velocity: XY,
    public acceleration: XY,
    public ctx?: CanvasRenderingContext2D,
  ) {}

  draw(): void {
    if (!this.ctx) return;
    const {
      position: { x, y },
      volume: { w, h },
      ctx,
    } = this;
    ctx.fillStyle = this.fill;
    ctx.fillRect(x, y, w, h);
    ctx.font = "16px monospace";
    ctx.fillText(`Horizontal velocity: ${this.velocity.x.toFixed(2)}`, 20, 20);
    ctx.fillText(`Vertical velocity: ${this.velocity.y.toFixed(2)}`, 20, 36);
    ctx.fillText(
      `Horizontal acceleration: ${this.acceleration.x.toFixed(2)}`,
      20,
      52,
    );
    ctx.fillText(
      `Vertical acceleration: ${this.acceleration.y.toFixed(2)}`,
      20,
      68,
    );
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
    this.setVelocity({ x: 0, y: 0 });
    this.setAcceleration({ x: 0, y: 0 });
    if (underMinX) {
      this.position.x = 0;
      // this.velocity.x = Math.abs(this.velocity.x);
      // this.acceleration.x = Math.abs(this.acceleration.x);
    }
    if (underMinY) {
      this.position.y = 0;
      // this.velocity.y = Math.abs(this.velocity.y);
      // this.acceleration.y = Math.abs(this.acceleration.y);
    }
    if (overMaxX) {
      this.position.x = this.maxPosition.x - w;
      // this.velocity.x = -1 * Math.abs(this.velocity.x);
      // this.acceleration.x = -1 * Math.abs(this.acceleration.x);
    }
    if (overMaxY) {
      this.position.y = this.maxPosition.y - h;
      // this.velocity.y = -1 * Math.abs(this.velocity.y);
      // this.acceleration.y = -1 * Math.abs(this.acceleration.y);
    }
  }

  affectVelocityByAcceleration(): void {
    this.updateVelocity(this.acceleration.x, this.acceleration.y);
  }

  applyForce(f: XY): void {
    const ax = f.x / this.mass;
    const ay = f.y / this.mass;
    this.updateAcceleration(ax, ay);
  }

  updateVelocity(dx: number, dy: number): void {
    this.velocity.x += dx;
    this.velocity.y += dy;
  }
  setVelocity({ x, y }: XY): void {
    this.velocity.x = x;
    this.velocity.y = y;
  }

  setAcceleration({ x, y }: XY): void {
    this.acceleration.x = x;
    this.acceleration.y = y;
  }

  updateAcceleration(dx: number, dy: number): void {
    this.acceleration.x += dx;
    this.acceleration.y += dy;
  }

  animate(): void {
    this.draw();
    this.affectVelocityByAcceleration();
    this.affectPositionByVelocity();
  }
}
