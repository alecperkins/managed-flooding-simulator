// TODO: point-and-click layout editing
// TODO: NextHop, Replay transports
// TODO: frictionless router links
// TODO: tx power, rx sensitivity levels
// TODO: obstacles and attenuation
// TODO: doubling interference and random noise
// TODO: variable hop counts
// TODO: linkable network configurations
// TODO: express the constants as frame counts instead of real time so speed is variable
// TODO: allow pausing, stepping through hops

import { MAX_DIST, MeshNodeRole, MeshPacketStatus, TICK_INTERVAL, TX_TIME_MS } from './constants';
import MeshNode from './MeshNode';
import MeshPacket from './MeshPacket';
import { distBetweenNodes } from './utils';

export type PacketPath = {
  key: MeshPacket['key'];
  from: MeshNode;
  to: MeshNode;
  packet: MeshPacket;
  opacity: number;
}

type SimMeshEvents = 'update';
type SimMeshEventHandler = (e: {
  name: SimMeshEvents;
  last_tick: number;
}) => void;

export default class SimMesh {

  last_tick: number = 0;

  nodes: Array<MeshNode> = [];
  packets: Array<MeshPacket> = [];

  private _interval: ReturnType<typeof setInterval> | null = null;

  private _listeners: {
    [key in SimMeshEvents]: Array<SimMeshEventHandler>;
  }= {
    'update': [],
  };

  static async sleep (seconds: number) {
    return new Promise(r => setTimeout(r, seconds * 1000));
  }

  constructor () {
    this._setUp();
  }

  addEventListener (name: SimMeshEvents, handler: SimMeshEventHandler) {
    if (!this._listeners[name].find(fn => fn === handler)) {
      this._listeners[name].push(handler);
    }
  }

  removeEventListener (name: SimMeshEvents, handler: SimMeshEventHandler) {
    this._listeners[name] = this._listeners[name].filter(fn => fn !== handler);
  }

  addNode (short_name: string, left_px = 20, top_px = 20, role = MeshNodeRole.CLIENT) {
    const node = new MeshNode({ short_name, left_px, top_px, role }, this);
    this.nodes.push(node);
    return node;
  }

  addPacket (attrs: { from: MeshNode, payload: string; relay?: MeshNode, hopStart?: number }) {
    const num = Math.max(0, ...this.packets.map(p => p.num)) + 1;
    const packet = new MeshPacket({
      num,
      hop_limit: 3,
      hop_start: 3,
      ...attrs,
    });
    this.packets.push(packet);
    return packet;
  }

  tearDown () {
    if (this._interval) {
      clearInterval(this._interval);
    }
    this._interval = null;
  }

  get edges () {
    const edges: Array<PacketPath> = [];
    let max = 0;
    this.packets.forEach(p => {
      if (p.num > max) { max = p.num; }
      if (p.received_at && p.relay && p.receiver) {
        edges.push({
          key: p.key,
          from: p.relay,
          to: p.receiver,
          packet: p,
          opacity: 1,
        });
      }
    });
    edges.forEach(e => {
      e.opacity = e.packet.num / max;
    });
    return edges;
  }

  private _setUp () {
    this._interval = setInterval(() => {
      this._tick();
    }, TICK_INTERVAL);
  }

  private _onUpdate () {
    this._listeners.update.forEach(handler => {
      handler({ name: 'update', last_tick: this.last_tick });
    });
  }

  private _transmitPackets (t: Date) {
    const need_transmitting = this.packets.filter(p => {
      const is_waiting = [
        MeshPacketStatus.waiting_relay,
        MeshPacketStatus.waiting_tx,
      ].includes(p.status);
      // if (p.transmitted_at) { return false; }
      // if (p.hop_limit === 0) { return false; }

      return is_waiting && !p.getDelay(t).is_delayed;
    });

    // console.log('\n', this.packets.length, 'total', need_transmitting.length, 'need transmitting', need_transmitting.map(p => [p.receiver.short_name, p.num]))
    need_transmitting.forEach(packet => {
      // console.log(packet.receiver!.short_name, 'tx', packet.num, recipients.map(r => r.node.short_name));
      if (packet.receiver?.incoming.size || packet.receiver?.is_sending) { // CSMA
        return;
      }
      packet.transmit_started_at = t;
      packet.receiver!.is_sending = true;
      const recipients = this._findRecipients(packet);
      const sent = recipients.map(({ node, distance }) => {
        if (node.is_sending) {
          return;
        }
        const tx = packet.clone();
        tx.relay = packet.receiver;
        // console.log('transmitting', packet.num, 'from', tx.relay.short_name, 'to', node.short_name);
        if (packet.receiver !== packet.from) { // Don't decrement if it's the first hop
          tx.hop_limit -= 1;
        }
        const is_dupe = node.startPacketRx(tx, distance);
        if (!is_dupe) {
          this.packets.push(tx);
        }
        return { tx, node };
      });
      setTimeout(() => {
        packet.transmitted_at = new Date();
        packet.receiver!.is_sending = false;
        sent.forEach(({ tx, node }) => {
          node.finishPacketRx(tx);
        });
      }, TX_TIME_MS);
    });

    return need_transmitting.length > 0;
  }

  private _findRecipients (packet: MeshPacket): Array<{ node: MeshNode, distance: number }> {
    const receipt_distance = MAX_DIST;
    return this.nodes.map(node => {
      const distance = distBetweenNodes(node, packet.receiver!);
      // TODO: const attenuation = based on path between, obstacles
      return { node, distance };
    }).filter(({ node, distance }) => (
      distance < receipt_distance
      && node.key !== packet.receiver!.key
    ));
  }

  private _tick () {
    let did_update = false;
    const now = new Date();
    this.last_tick = now.getTime();
    did_update = this._transmitPackets(now) || did_update;
    this._onUpdate();
  }

}
