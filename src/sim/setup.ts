import { MeshNodeRole } from './constants';
import MeshNode from './MeshNode';
import type SimMesh from './SimMesh';


const SCENARIO = [
  { "short_name": "A", "left_px": 7, "top_px": 202 },
  { "short_name": "B", "left_px": 26, "top_px": 639 },
  { "short_name": "C", "left_px": 251, "top_px": 540, role: MeshNodeRole.ROUTER_LATE },
  { "short_name": "D", "left_px": 284, "top_px": 107, role: MeshNodeRole.ROUTER }, // Naughty router
  { "short_name": "E", "left_px": 602, "top_px": 223 },
  { "short_name": "F", "left_px": 784, "top_px": 262 },
  { "short_name": "G", "left_px": 599, "top_px": 517, role: MeshNodeRole.CLIENT_MUTE  },
  { "short_name": "H", "left_px": 188, "top_px": 273 },
  { "short_name": "I", "left_px": 415, "top_px": 320, role: MeshNodeRole.ROUTER_LATE },
  { "short_name": "J", "left_px": 116, "top_px": 100, role: MeshNodeRole.CLIENT_MUTE },
  { "short_name": "K", "left_px": 290, "top_px": 260 },
  { "short_name": "L", "left_px": 298, "top_px": 487 },
  { "short_name": "M", "left_px": 113, "top_px": 558 },
  { "short_name": "N", "left_px": 438, "top_px": 493 },
  { "short_name": "O", "left_px": 659, "top_px": 731 },
  { "short_name": "P", "left_px": 183, "top_px": 147 },
  { "short_name": "Q", "left_px": 458, "top_px": 736 },
  { "short_name": "R", "left_px": 51, "top_px": 310, role: MeshNodeRole.CLIENT_MUTE },
  { "short_name": "S", "left_px": 479, "top_px": 583  },
  { "short_name": "T", "left_px": 694, "top_px": 244, role: MeshNodeRole.CLIENT_MUTE },
  { "short_name": "U", "left_px": 178, "top_px": 633, role: MeshNodeRole.CLIENT_MUTE },
  { "short_name": "V", "left_px": 338, "top_px": 708 },
  { "short_name": "W", "left_px": 144, "top_px": 437 },
  { "short_name": "X", "left_px": 635, "top_px": 53, role: MeshNodeRole.CLIENT_MUTE },
  { "short_name": "Y", "left_px": 704, "top_px": 427 },
  { "short_name": "Z", "left_px": 576, "top_px": 289, role: MeshNodeRole.ROUTER } // Good router
];

const SIMPLE = [
  { short_name: 'A', left_px: 20, top_px: 20 },
  { short_name: 'B', left_px: 100, top_px: 50 },
  { short_name: 'C', left_px: 40, top_px: 100 },
  { short_name: 'D', left_px: 200, top_px: 120 },
  { short_name: 'E', left_px: 20, top_px: 300 },
  { short_name: 'F', left_px: 250, top_px: 400 },
  { short_name: 'G', left_px: 250, top_px: 10 },
];

function randomize () {
  const nodes = [];
  for (let i = 0; i < 26; i++) {
    nodes.push({
      short_name: String.fromCharCode(i + 65),
      left_px: Math.floor(800 * Math.random()),
      top_px: Math.floor(800 * Math.random()),
      role: MeshNodeRole.CLIENT,
    });
  }
  return nodes;
}

export function layoutNodes (sim: SimMesh, scenario: 'simple' | 'random' | 'set') {
  let nodes: Array<Pick<MeshNode, 'short_name' | 'left_px' | 'top_px'> & Partial<Pick<MeshNode, 'role'>>>;
  if (scenario === 'set') {
    nodes = [...SCENARIO];
  } else if (scenario === 'simple') {
    nodes = [...SIMPLE];
  } else if (scenario === 'random') {
    nodes = randomize();
  }
  nodes!.forEach(node => {
    sim.addNode(
      node.short_name,
      node.left_px,
      node.top_px,
      node.role,
    );
  });
}
