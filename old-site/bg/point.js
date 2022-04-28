export function make(x, y) {
  return { x, y };
};

export function rotate(p, theta) {
  return make(
      p.x * Math.cos(theta) - p.y * Math.sin(theta),
      p.x * Math.sin(theta) + p.y * Math.cos(theta)
  );
};

export function scale(p, s) {
  return make(p.x * s, p.y * s);
}

export function add(p1, p2) {
  return make(
      p1.x + p2.x,
      p1.y + p2.y
      );
}

export function weight(p1, p2, w1) {
  const w2 = 1 - w1;
  return make(
      p1.x * w1 + p2.x * w2,
      p1.y * w1 + p2.y * w2
  );
}
