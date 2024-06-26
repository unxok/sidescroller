export const assert = <T>(a: unknown) => a as T;

export type XY = { x: number; y: number };
export type WH = { w: number; h: number };
export type Side = "left" | "right" | "top" | "bottom";
export type LRTB = Record<Side, number>;

/**
 * Checks if a number is 'close' to another number
 * @param checkNum Number to check with `closeness` added to or substracted from
 * @param targetNum Number to compare to
 * @param closeness How close checkNum can be to targetNum
 * @returns true if close enough, false otherwise
 * ---
 * ```js
 *
 * isCloseNumber(30, 50, 20) // true
 * isCloseNumber(30, 10, 20) // true
 * isCloseNumber(30, 0, 20) // false
 * ```
 */
export const isCloseNumber = (
  checkNum: number,
  targetNum: number,
  closeness: number,
) => {
  return checkNum + closeness <= targetNum && checkNum - closeness >= targetNum;
};

export const calculateVelocityAfterCollision: (
  m1: number,
  m2: number,
  v1: XY,
  v2: XY,
) => XY = (m1, m2, v1, v2) => {
  const vx = (v1.x * (m1 - m2) + 2 * (m2 * v2.x)) / (m1 + m2);
  const vy = (v1.y * (m1 - m2) + 2 * (m2 * v2.y)) / (m1 + m2);
  return { x: vx, y: vy };
};

/**
 * Improved version of `Number()` that will convert something to a non-NaN number
 * @param val Any value
 * @param defaultNumber What to convert to if not a number (0 by default)
 * @param invalidValCheck An expression to call on val. If true, `defaultNumber` will be returned
 * @returns A non-NaN number
 */
export const toNumber = (
  val: any,
  defaultNumber?: number,
  invalidValCheck?: (val: any) => boolean,
) => {
  if (invalidValCheck !== null && invalidValCheck !== undefined) {
    const bool = invalidValCheck(val);
    if (bool) return defaultNumber ?? 0;
  }
  const num = Number(val);
  if (Number.isNaN(num)) {
    return defaultNumber ?? 0;
  }
  return num;
};

export const getRandomInt = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getRandomHexStr = (len: number) => {
  let output = "";
  for (let i = 0; i < len; ++i) {
    output += Math.floor(Math.random() * 16).toString(16);
  }
  return output;
};
