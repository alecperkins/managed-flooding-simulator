import type MeshNode from './MeshNode';

export function genKey () {
  return Math.floor((Date.now() + Math.random()) * 10_000).toString(32);
}


export function distBetweenNodes (a: MeshNode, b: MeshNode) {
  return Math.pow(
    Math.pow(a.left_px - b.left_px, 2)
     + Math.pow(a.top_px - b.top_px, 2)
    , 0.5
  );
}


export function angleBetweenNodes (a: MeshNode, b: MeshNode) {
  return Math.atan2(
    b.top_px - a.top_px,
    b.left_px - a.left_px,
  );
}

