import type MeshPacket from './MeshPacket';
import type SimMesh from './SimMesh';
import { genKey } from './utils';

export default class MeshNode {
  key: string;
  short_name: string;
  role: 'CLIENT';
  packets: Array<MeshPacket>;
  left_px: number;
  top_px: number;
  world: SimMesh;

  constructor (attrs: Pick<MeshNode, 'short_name' | 'left_px' | 'top_px'>, world: SimMesh) {
    this.short_name = attrs.short_name;
    this.left_px = attrs.left_px;
    this.top_px = attrs.top_px;
    this.packets = [];
    this.role = 'CLIENT';
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

  rxPacket (packet: MeshPacket) {
    const previously_seen = this.packets.find(p => p.num === packet.num);
    // console.log('\t', this.short_name, 'rx', packet.num, previously_seen ? 'dupe' : 'new');
    if (previously_seen) {
      previously_seen.duplicates.push(packet);
      return true;
    } else {
      packet.received_at = new Date();
      packet.receiver = this;
      this.packets.push(packet);
      return false;
    }
  }
}
