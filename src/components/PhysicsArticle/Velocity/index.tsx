import { useContext, useEffect, useRef, useState } from "react";

import { Canvas } from "../../Canvas";
import { Slider } from "../../ui/slider";
import { Label } from "../../ui/label";
import { WH, XY } from "@/utils";
import SyntaxHighlighter from "react-syntax-highlighter";
import highlightStyle from "react-syntax-highlighter/dist/esm/styles/hljs/atom-one-dark-reasonable";
import { ArticleWidthContext } from "..";

export const Velocity = () => {
  const articleWidth = useContext(ArticleWidthContext);
  const width = articleWidth * 0.75;
  // const height = article.height * 0.5;
  const height = 300;
  const ref = useRef(
    // this doesn't matter it's just for initialization
    new Body(
      { x: 50, y: 50 },
      { x: width, y: height },
      // except velocity should match what's created later
      // because this is used to initialize the slider default values
      { x: 1, y: 1 },
      undefined,
    ),
  );

  const setVelocity = (cb: (prev: XY) => XY) => {
    const { x, y } = cb({
      x: ref.current.velocity.x,
      y: ref.current.velocity.y,
    });
    ref.current.velocity = { x, y };
  };

  // console.log("viewport: ", viewport);

  return (
    <>
      <h3>Velocity</h3>
      <p>
        Velocity is the number of pixels per frame the position of an entity
        changes. Here's an outline of what the <code>Body</code> class looks
        like
      </p>
      <SyntaxHighlighter language="typescript" style={highlightStyle}>
        {markdown}
      </SyntaxHighlighter>
      <p>
        No play buttons from this point on unfortunately due to the complexity
        of phsyics (even at this level so far). If there <i>were</i> play
        buttons though, they would effectively give the entity{" "}
        <i>acceleration</i>. In fact, if you were to drag the slider forward at{" "}
        <i>1 pixel per frame</i>, then the box effectively has an acceleration
        of <code>1 px/frame</code>
      </p>
      <p>
        I made it so that if the box goes <i>out of bounds</i>, then it will
        stop at the wall but its velocity will remain unchanged. This is so you
        can better see what it means to have a <i>negative</i> velocity
      </p>
      <br />
      <Controls
        velocity={{ x: ref.current.velocity.x, y: ref.current.velocity.y }}
        setVelocity={setVelocity}
      />
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
            { x: 10, y: 10 },
            { x: width, y: height },
            { x: 1, y: 1 },
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

const markdown = `
class Body {
  constructor(
    protected position: XY,
    protected volume: WL,
    public velocity: XY,
    // ...other stuff
  ) {}

  draw(): void {
    // fill a rect based on position and volume
  }

  affectPositionByVelocity(): void {
    // copy the current position and adjust by current velocity
    // if not out of bounds, update position
    // otherwise adjust appropiately since it's out of bounds
  }

  // called every frame of animation
  animate(): void {
    this.draw();
    this.affectPositionByVelocity();
  }
}

`;

// velocity and position only
class Body {
  volume: WH = { w: 50, h: 50 };
  constructor(
    protected position: XY,
    protected maxPosition: XY,
    // pixels per frame
    public velocity: XY,
    public ctx?: CanvasRenderingContext2D,
  ) {}

  draw(): void {
    if (!this.ctx) return;
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

  setVelocity(v: XY): void {
    this.velocity.x = v.x;
    this.velocity.y = v.y;
  }

  animate(): void {
    this.draw();
    this.affectPositionByVelocity();
  }
}
