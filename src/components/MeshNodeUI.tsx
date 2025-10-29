
import { MeshPacketStatus } from '../sim/constants';
import type MeshNode from '../sim/MeshNode';
import PacketUI from './PacketUI';

export default function MeshNodeUI (props: { node: MeshNode }) {
  const is_transmitting = props.node.packets.filter(p => p.status === MeshPacketStatus.transmitting).length > 0;
  return (
    <div className="MeshNode" data-role={props.node.role} onClick={ () => props.node.originatePacket() } style={{
      left: props.node.left_px,
      top: props.node.top_px,
    }} data-num_packets={ props.node.packets.length }>
      {
        is_transmitting ? <div className='_TransmittingCircle' /> : null
      }
      <div className="_Role">
        { props.node.role }
      </div>
      <div className="_ShortName">
        { props.node.short_name }
      </div>
      <ul className="_PacketQueue">
        {
          props.node.packets.slice(-3).map(packet => (
            <li key={ packet.key }>
              <PacketUI packet={packet} />
            </li>
          ))
        }
      </ul>
    </div>
  );
}