import { type PacketPath } from '../sim/SimMesh';
import { angleBetweenNodes, distBetweenNodes } from '../sim/utils';

const NODE_WIDTH = 30;
export default function PacketEdge ({ edge }: { edge: PacketPath }) {
  const dist = distBetweenNodes(edge.from, edge.to);
  const rads = angleBetweenNodes(edge.from, edge.to);
  const o = 255 * (1 - edge.opacity);
  return (
    <div className='PacketEdge' style={{
      width: dist - NODE_WIDTH / 2,
      left: edge.from.left_px + NODE_WIDTH / 2,
      top: edge.from.top_px + NODE_WIDTH / 2,
      transform: `rotate(${rads}rad)`,
      transformOrigin: `center left`,
      backgroundColor: `rgb(${o},${o},${o})`,
    }}>
    </div>
  );
}
