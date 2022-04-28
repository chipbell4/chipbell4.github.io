const canvas = document.createElement('canvas');
canvas.classList.add('background');
document.body.insertBefore(canvas, document.body.children[0]);

const resize = () => {
  canvas.setAttribute('width', window.innerWidth);
  canvas.setAttribute('height', window.innerHeight);
};
window.addEventListener('resize', resize);
resize();

export const ctx = canvas.getContext('2d');

ctx.strokeStyle = '#eee';

export const drawTriangle = (p1, p2, p3) => {
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.closePath();
  ctx.stroke();
};

export const drawTriangles = (triangles) => {
  ctx.beginPath();
  for (const t of triangles) {
    ctx.moveTo(t[0].x, t[0].y);
    ctx.lineTo(t[1].x, t[1].y);
    ctx.lineTo(t[2].x, t[2].y);
    ctx.lineTo(t[0].x, t[0].y);
  }
  ctx.stroke();
};
