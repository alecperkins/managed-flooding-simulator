import type { ReactElement } from 'react';
import type MeshPacket from '../sim/MeshPacket';
import { MeshPacketStatus } from '../sim/constants';

export default function PacketUI (props: { packet: MeshPacket, setHighlight: any, is_highlighted: boolean }) {
  return (
    <div className="Packet"
      data-is_highlighted={ props.is_highlighted }
      data-key={ props.packet.key }
      data-status={ props.packet.status }
      onMouseEnter={ () => props.setHighlight(props.packet) }
      onMouseLeave={ () => props.setHighlight(null) }
    >
      <div>p{props.packet.num}</div>
      <div className='_Status'>
        <PacketStatusIndicator packet={props.packet} countdown={true} />
      </div>
    </div>
  );
}

export function PacketStatusIndicator (props: { packet: MeshPacket, countdown?: boolean }) {

  let status_icon: string | ReactElement = '';
  let status_text = '';

  switch (props.packet.status) {
    case MeshPacketStatus.acked: {
      status_icon = '✅';
      status_text = `Ack from ${ props.packet.duplicates[0].relay?.short_name }`;
      break;
    }
    case MeshPacketStatus.waiting_ack: {
      status_icon = '…';
      status_text = 'Waiting for ack';
      break;
    }
    case MeshPacketStatus.waiting_tx: {
      status_icon = '⏳';
      status_text = 'Waiting to TX';
      break;
    }
    case MeshPacketStatus.waiting_relay: {
      if (props.countdown) {
        status_icon = <div className="_Countdown" style={{ width: `${ props.packet.getDelay(new Date()).countdown * 100 }%` }} />;
      } else {
        status_icon = '⏳';
      }
      status_text = 'Waiting to Relay';
      break;
    }
    case MeshPacketStatus.relayed: {
      status_icon = '⏩';
      status_text = `Relayed for ${ props.packet.hop_limit } more hop${props.packet.hop_limit !== 1 ? 's' : '' }`;
      break;
    }
    case MeshPacketStatus.canceled: {
      status_icon = '🛑';
      status_text = `Canceled with ${ props.packet.hop_limit } hop${props.packet.hop_limit !== 1 ? 's' : '' } left by ${ props.packet.duplicates[0].relay?.short_name }`;
      break;
    }
    case MeshPacketStatus.muted: {
      status_icon = '🙊';
      status_text = `Heard but not relayed due to role`;
      break;
    }
    case MeshPacketStatus.transmitting: {
      status_icon = '📡';
      status_text = 'Transmitting';
      break;
    }
    case MeshPacketStatus.max_retransmission_reached: {
      status_icon = '❌';
      status_text = 'Max retransmission reached';
      break;
    }
    case MeshPacketStatus.exhausted: {
      status_icon = '🫙';
      status_text = 'Hops exhausted';
      break;
    }
  }
  return (
    <div className="PacketStatusIndicator" title={ status_text }>
      { status_icon }
    </div>
  );
}
