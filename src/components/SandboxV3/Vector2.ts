export class Vector2 extends Array<number> {
  constructor(x: number, y: number) {
    super(x, y);
  }

  getMagnitude(): number {
    const [x, y] = this;
    return Math.sqrt(x * x + y * y);
  }

  getAngle(): number {
    const [x, y] = this;
    return Math.atan2(y, x);
  }

  /**
   * Adds a Vector2 to this vector
   * @param v2 The vector to add
   * @returns this vector after adding
   */
  addVector(v2: Vector2): Vector2 {
    const [x1, y1] = this;
    const [x2, y2] = v2;
    this[0] = x1 + x2;
    this[1] = y1 + y2;
    return this;
  }

  /**
   * Substracts a Vector2 from this vector
   * @param v2 The vector to add
   * @returns this vector after substracting
   */
  substractVector(v2: Vector2): Vector2 {
    const [x1, y1] = this;
    const [x2, y2] = v2;
    this[0] = x1 - x2;
    this[1] = y1 - y2;
    return this;
  }

  /**
   * Multiplies a scalar by this vector
   * @param s The scalar to multiply by
   * @returns this vector after multiplying
   */
  multiplyByScalar(s: number): Vector2 {
    const [x, y] = this;
    this[0] = x * s;
    this[1] = y * s;
    return this;
  }

  /**
   * Divides this vector by a scalar
   * @param s The scalar to divide by
   * @returns this vector after dividing
   */
  divideByScalar(s: number): Vector2 {
    const [x, y] = this;
    this[0] = x / s;
    this[1] = y / s;
    return this;
  }

  /**
   * Finds the dot product of another vector and this vector
   * @param v2 A Vector2
   * @returns The dot product of the two vectors
   * ---
   * Dot product of two vectors gives information about the angle between the two vectors:
   * - Positive: angle is acute
   * - Zero: vectors are perpendicular
   * - Negative: angle is obtuse
   */
  dotProductWith(v2: Vector2): number {
    const [x1, y1] = this;
    const [x2, y2] = v2;
    return x1 * x2 + y1 * y2;
  }
}
