import { MAX_DIST, MeshNodeRole } from './constants';
import type MeshPacket from './MeshPacket';
import type SimMesh from './SimMesh';
import { genKey } from './utils';

export default class MeshNode {
  key         : string;
  packets     : Array<MeshPacket>;
  short_name  : string;
  role        : MeshNodeRole;
  left_px     : number;
  top_px      : number;
  world       : SimMesh;
  is_sending  : boolean;
  incoming    : Map<string, { packet: MeshPacket, distance: number, /* attentuation */ }>;

  constructor (attrs: Pick<MeshNode, 'short_name' | 'left_px' | 'top_px' | 'role'>, world: SimMesh) {
    this.short_name = attrs.short_name;
    this.left_px = attrs.left_px;
    this.top_px = attrs.top_px;
    this.packets = [];
    this.incoming = new Map();
    this.is_sending = false;
    this.role = attrs.role;
    this.key = genKey();
    this.world = world;
  }

  originatePacket (payload = '') {
    const packet = this.world.addPacket({ payload, from: this });
    packet.relay = this;
    packet.receiver = this;
    this.packets.push(packet);
    // console.log('originatePacket', packet.from.short_name, packet.num)
    return packet;
  }

  startPacketRx (packet: MeshPacket, distance: number) {
    if (this.incoming.size > 0) { // Track overlapping packets for collisions
      packet.rx_overlapped_at.push(new Date());
      for (const i of this.incoming.values()) {
        i.packet.rx_overlapped_at.push(new Date());
      }
    }
    const duplicate_of = this.packets.find(p => p.num === packet.num);
    this.incoming.set(packet.key, ({ packet, distance }));
    packet.receiver = this;
    if (duplicate_of) {
      duplicate_of.duplicates.push(packet);
      return true;
    } else {
      this.packets.push(packet);
      return false;
    }
    // console.log('\t', this.short_name, 'rx', packet.num, previously_seen ? 'dupe' : 'new');
  }

  finishPacketRx (packet: MeshPacket) {
    const rx = this.incoming.get(packet.key)!;
    this.incoming.delete(packet.key);
    const noise = 0
      + Math.random() * 0.05 // random RF noise
      + Math.random() * 0.5 * rx.packet.rx_overlapped_at.length // collisions
    ;
    rx.packet.received_snr = 1 - rx.distance / MAX_DIST - noise;
    rx.packet.received_at = new Date();

  }
}
