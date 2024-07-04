import { Vector2 } from "./Vector2";

type Mass = number;
type Friction = number;
type Volume = [w: number, h: number];
type Position = Vector2;
type Velocity = Vector2;
type Acceleration = Vector2;

type BodyProps = {
  mass: Mass;
  friction: Friction;
  volume: Volume;
  position: Position;
  velocity: Velocity;
  acceleration: Acceleration;
};

export class Body {
  /* Body Props */
  private mass: Mass;
  private friction: Friction;
  private volume: Volume;
  private position: Position;
  private velocity: Velocity;
  private acceleration: Acceleration;
  /**************/
  private force: Vector2;

  constructor(props: BodyProps) {
    this.mass = props.mass;
    this.friction = props.friction;
    this.volume = props.volume;
    this.position = props.position;
    this.velocity = props.velocity;
    this.acceleration = props.acceleration;
    // end of body props
    this.force = new Vector2(0, 0);
  }

  getMass(): Mass {
    return this.mass;
  }
  setMass(m: Mass): Body {
    this.mass = m;
    return this;
  }

  getFriction(): Friction {
    return this.friction;
  }
  setFriction(f: Friction): Body {
    this.friction = f;
    return this;
  }

  getVolume(): Volume {
    return this.volume;
  }
  setVolume(v: Volume): Body {
    this.volume = [...v];
    return this;
  }
  updateVolume(cb: (previous: Volume) => Volume): Body {
    this.setVolume(cb(this.getVolume()));
    return this;
  }

  getPosition(): Position {
    return this.position;
  }
  setPosition(p: Position) {
    this.position = p;
  }
  updatePosition(cb: (previous: Position) => Position): Body {
    this.setPosition(cb(this.getPosition()));
    return this;
  }

  getVelocity(): Velocity {
    return this.velocity;
  }
  setVelocity(v: Velocity): Body {
    this.velocity = v;
    return this;
  }
  updateVelocity(cb: (previous: Velocity) => Velocity): Body {
    this.setVelocity(cb(this.getVelocity()));
    return this;
  }

  getAcceleration(): Acceleration {
    return this.acceleration;
  }
  setAcceleration(a: Acceleration): Body {
    this.acceleration = a;
    return this;
  }
  updateAcceleration(cb: (previous: Acceleration) => Acceleration): Body {
    this.setAcceleration(cb(this.getAcceleration()));
    return this;
  }
}
