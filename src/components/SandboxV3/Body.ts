import { Vector2 } from "./Vector2";

type BodyPhysicsProps = {
  mass: number;
  friction: number;
  volume: [w: number, h: number];
  position: Vector2;
  velocity: Vector2;
  acceleration: Vector2;
};

type BodyRenderProps = {
  fill: string;
};

type BodyProps = BodyPhysicsProps & BodyRenderProps;

export class Body {
  /* Physics Props */
  private mass: number;
  private friction: number;
  private volume: [w: number, h: number];
  private position: Vector2;
  private velocity: Vector2;
  private acceleration: Vector2;
  /**************/
  /* Render Props */
  private fill: string;
  /****************/
  private force: Vector2;

  constructor(props: BodyProps) {
    this.mass = props.mass;
    this.friction = props.friction;
    this.volume = props.volume;
    this.position = props.position;
    this.velocity = props.velocity;
    this.acceleration = props.acceleration;
    // end of physics props
    this.fill = props.fill;
    // end of render props
    this.force = new Vector2(0, 0);
  }

  getMass(): number {
    return this.mass;
  }
  setMass(m: number): Body {
    this.mass = m;
    return this;
  }

  getFriction(): number {
    return this.friction;
  }
  setFriction(f: number): Body {
    this.friction = f;
    return this;
  }

  getVolume(): [w: number, h: number] {
    return this.volume;
  }
  setVolume(v: [w: number, h: number]): Body {
    this.volume = [...v];
    return this;
  }
  updateVolume(
    cb: (previous: [w: number, h: number]) => [w: number, h: number],
  ): Body {
    this.setVolume(cb(this.getVolume()));
    return this;
  }

  getPosition(): Vector2 {
    return this.position;
  }
  setPosition(p: Vector2) {
    this.position = p;
  }
  updatePosition(cb: (previous: Vector2) => Vector2): Body {
    this.setPosition(cb(this.getPosition()));
    return this;
  }

  getVelocity(): Vector2 {
    return this.velocity;
  }
  setVelocity(v: Vector2): Body {
    this.velocity = v;
    return this;
  }
  updateVelocity(cb: (previous: Vector2) => Vector2): Body {
    this.setVelocity(cb(this.getVelocity()));
    return this;
  }

  getAcceleration(): Vector2 {
    return this.acceleration;
  }
  setAcceleration(a: Vector2): Body {
    this.acceleration = a;
    return this;
  }
  updateAcceleration(cb: (previous: Vector2) => Vector2): Body {
    this.setAcceleration(cb(this.getAcceleration()));
    return this;
  }

  getForce(): Vector2 {
    return this.force;
  }

  /* Physics methods */

  applyForce(f: Vector2): Body {
    const { force } = this;
    this.force = force.addVector(f);
    return this;
  }
  resetForce(): Body {
    this.force = new Vector2(0, 0);
    return this;
  }

  adjustAccelerationByAppliedForce(dt: number) {
    const [fx, fy] = this.getForce();
    this.updateAcceleration((prev) => {
      const x = prev[0] + fx * dt;
      const y = prev[1] + fy * dt;
      return new Vector2(x, y);
    });
  }

  adjustVelocityByAcceleration(dt: number): Body {
    const [ax, ay] = this.getAcceleration();
    // console.log(ax, ay);
    this.updateVelocity((prev) => {
      const x = prev[0] + ax * dt;
      const y = prev[1] + ay * dt;
      console.log("vel: ", y, " at: ", dt);
      return new Vector2(x, y);
    });
    return this;
  }

  adjustPositionByVelocity(dt: number): Body {
    const [vx, vy] = this.getVelocity();
    // console.log(vx, vy);
    this.updatePosition((prev) => {
      const x = prev[0] + vx * dt;
      const y = prev[1] + vy * dt;
      // console.log("y: ", y);
      // console.log("dt: ", dt);
      // console.log(x, y);
      return new Vector2(x, y);
    });
    return this;
  }

  /*******************/

  draw(ctx: CanvasRenderingContext2D): Body {
    const {
      fill,
      position: [x, y],
      volume: [w, h],
    } = this;
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
    return this;
  }
}
