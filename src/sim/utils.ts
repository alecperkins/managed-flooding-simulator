import type MeshNode from './MeshNode';

let counter = 0;
export function genKey () {
  counter += 1;
  return Math.floor((Date.now() + counter + Math.random()) * 10_000).toString(32);
}


export function distBetweenNodes (a: Pick<MeshNode, 'left_px' | 'top_px'>, b: Pick<MeshNode, 'left_px' | 'top_px'>) {
  return Math.pow(
    Math.pow(a.left_px - b.left_px, 2)
     + Math.pow(a.top_px - b.top_px, 2)
    , 0.5
  );
}


export function angleBetweenNodes (a: Pick<MeshNode, 'left_px' | 'top_px'>, b: Pick<MeshNode, 'left_px' | 'top_px'>) {
  return Math.atan2(
    b.top_px - a.top_px,
    b.left_px - a.left_px,
  );
}

