import { LRTB, XY } from "@/utils";

export const checkCollision = (b1: LRTB, b2: LRTB) => {
  return (
    b1.left < b2.right &&
    b1.right > b2.left &&
    b1.top < b2.bottom &&
    b1.bottom > b2.top
  );
};

export const calculateVelocityAfterCollision: (
  m1: number,
  m2: number,
  v1: XY,
  v2: XY,
  damp1: number,
  damp2: number,
) => [XY, XY] = (m1, m2, v1, v2, damp1, damp2) => {
  const vx1 = (v1.x * (m1 - m2) + 2 * (m2 * v2.x)) / (m1 + m2);
  const vy1 = (v1.y * (m1 - m2) + 2 * (m2 * v2.y)) / (m1 + m2);
  const vx2 = (v2.x * (m2 - m1) + 2 * (m1 * v1.x)) / (m2 + m1);
  const vy2 = (v2.y * (m2 - m1) + 2 * (m1 * v1.y)) / (m2 + m1);
  const velocity1 = { x: vx1 * damp1, y: vy1 * damp1 };
  const velocity2 = { x: vx2 * damp2, y: vy2 * damp2 };
  return [velocity1, velocity2];
};

export const calculatePositionAfterCollision: (b1: LRTB, b2: LRTB) => XY = (
  b1,
  b2,
) => {
  // distance b1 sides relative to b2's sides
  const distances: LRTB = {
    left: Math.abs(b2.left - b1.right),
    right: Math.abs(b2.right - b1.left),
    top: Math.abs(b2.top - b1.bottom),
    bottom: Math.abs(b2.bottom - b1.top),
  };
  const min = Math.min(...Object.values(distances));
  const side = (Object.keys(distances) as (keyof typeof distances)[]).find(
    (k) => distances[k] === min,
  );
  if (side === "left") {
    return {
      x: b2.left - (b1.right - b1.left),
      y: b1.top,
    };
  }
  if (side === "right") {
    return {
      x: b2.right,
      y: b1.top,
    };
  }
  if (side === "top") {
    return {
      x: b1.left,
      y: b2.top - (b1.bottom - b1.top),
    };
  }
  if (side === "bottom") {
    return {
      x: b1.left,
      y: b2.bottom,
    };
  }

  throw new Error(
    "Couldn't find closest side somehow. This should be impossible?",
  );
};
