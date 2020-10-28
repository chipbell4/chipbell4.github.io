import { make, weight } from './point.js';

export const baseTriangle = [
  make(0, 0),
  make(2, 0),
  make(0, 1),
];

export function split(triangle = baseTriangle) {
  // C
  // |\
  // |      \ 
  // |           \ 
  // -----------------\
  // A                  B
  
  const [A, B, C] = triangle;

  const bcWeighted = weight(B, C, 0.2);

  return [
    // top left triangle
    [
      bcWeighted,
      A,
      C 
    ],
  

    // bottom left triangle
    [
      weight(A, bcWeighted, 0.5),
      weight(A, B, 0.5),
      A
    ],

    // middle triangle
    [
      weight(A, bcWeighted, 0.5),
      weight(A, B, 0.5),
      bcWeighted,
    ],

    // middle right triangle
    [
      weight(B, C, 0.6),
      weight(B, C, 0.2),
      weight(A, B, 0.5),
    ],

    // far right triangle
    [
      weight(B, C, 0.6),
      B,
      weight(A, B, 0.5),
    ]
  ];
};

export function *splitMultiple(n = 10) {
  let triangles = [baseTriangle];

  for (let i = 0; i < n; i++) {
    const newTriangles = [];
    for (const triangle of triangles) {
      newTriangles.push.apply(newTriangles, split(triangle));

      // wait until given permission to go forward
      yield;
    }

    triangles = newTriangles;
  }

  return triangles;
}
