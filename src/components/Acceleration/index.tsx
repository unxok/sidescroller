import { useContext, useRef, useState } from "react";
import { ArticleWidthContext } from "../../App";
import { Canvas } from "../Canvas";
import { WH, XY } from "@/utils";
import { Button } from "../ui/button";

export const Acceleration = () => {
  const [_, setCounter] = useState(0);
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
      { x: 1, y: 1 },
      { x: 1, y: 1 },
      undefined,
    ),
  );

  // console.log("viewport: ", viewport);

  return (
    <>
      <h3>Acceleration</h3>
      <p>
        Acceleration is the rate at which <code>velocity</code> changes. To do
        this, we just need to add an <code>adjustVelocityByAccerlation</code>{" "}
        method to our <code>Body</code> class. It's pretty much the same as the
        velocity method.
      </p>
      <p>
        The following example shows two boxes where all properties are the same,
        except green has an accleration of <code>1 pixel/second</code> and red
        has no acceleration.
      </p>
      <p>No sliders, but you can press the reset button to see it again.</p>
      <Button onClick={() => setCounter((prev) => ++prev)}>reset</Button>
      {/* <p>
        X = pixels moved <i>horizontally</i> per frame
      </p>
      <p>
        Y = pixels moved <i>vertically</i> per frame
      </p> */}
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
            { x: 10, y: 10 },
            { x: width, y: height },
            { x: 1, y: 1 },
            { x: 1, y: 1 },
            ctx,
          );
          const box2 = new Body(
            "red",
            { x: 10, y: 10 },
            { x: width, y: height },
            { x: 1, y: 1 },
            { x: 0, y: 0 },
            ctx,
          );
          ref.current = box;

          const animate = () => {
            ctx.clearRect(0, 0, width, height);
            box.animate();
            box2.animate();
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

// velocity and position and acceleration
class Body {
  volume: WH = { w: 50, h: 50 };
  constructor(
    private fill: string,
    protected position: XY,
    protected maxPosition: XY,
    // pixels per frame
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
    if (underMinX) {
      this.position.x = 0;
      // this.velocity.x = Math.abs(this.velocity.x);
    }
    if (underMinY) {
      this.position.y = 0;
      // this.velocity.y = Math.abs(this.velocity.y);
    }
    if (overMaxX) {
      this.position.x = this.maxPosition.x - w;
      // this.velocity.x = -1 * Math.abs(this.velocity.x);
    }
    if (overMaxY) {
      this.position.y = this.maxPosition.y - h;
      // this.velocity.y = -1 * Math.abs(this.velocity.y);
    }
  }

  affectVelocityByAcceleration(): void {
    this.updateVelocity(this.acceleration.x, this.acceleration.y);
  }

  updateVelocity(dx: number, dy: number): void {
    this.velocity.x += dx;
    this.velocity.y += dy;
  }

  setVelocity(v: XY): void {
    this.velocity.x = v.x;
    this.velocity.y = v.y;
  }

  animate(): void {
    this.draw();
    this.affectVelocityByAcceleration();
    this.affectPositionByVelocity();
  }
}
