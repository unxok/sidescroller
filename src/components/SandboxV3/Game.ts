import { Body } from "./Body";
import { Vector2 } from "./Vector2";

type GameProps = {
  gravity: number;
  width: number;
  height: number;
  bodies: Body[];
};

export class Game {
  private gravity: number;
  private width: number;
  private height: number;
  private bodies: Body[];
  constructor(props: GameProps) {
    this.gravity = props.gravity;
    this.width = props.width;
    this.height = props.height;
    this.bodies = props.bodies;
  }

  calculatePhysics(dt: number): Game {
    // console.log("calculatePhysics called: ", dt);
    const { gravity, bodies } = this;
    for (let i = 0; i < bodies.length; i++) {
      const b = bodies[i];
      b.setAcceleration(new Vector2(0, 0));
      b.resetForce();
      const magnitude = b.getMass() * gravity;
      const angle = Math.PI / 2;
      //   const gravForce = new Vector2({ magnitude, angle });
      const gravForce = new Vector2(0, gravity);
      //   console.log(b);
      b.applyForce(gravForce);
      b.adjustAccelerationByAppliedForce(dt);
      b.adjustVelocityByAcceleration(dt);
      b.adjustPositionByVelocity(dt);
      //   console.log(b);
    }
    return this;
  }

  draw(ctx: CanvasRenderingContext2D): Game {
    const { width, height, bodies } = this;
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < bodies.length; i++) {
      bodies[i].draw(ctx);
    }

    return this;
  }
}
