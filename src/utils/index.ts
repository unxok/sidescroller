export const assert = <T>(a: unknown) => a as T;

export type XY = { x: number; y: number };
export type WH = { w: number; h: number };
export type Side = "left" | "right" | "top" | "bottom";

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
