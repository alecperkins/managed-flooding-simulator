import type MeshNode from './MeshNode';
import { MAX_RELAY_DELAY_MS, MAX_TX_DELAY_MS, MeshPacketStatus, MIN_RELAY_DELAY_MS, TX_TIMEOUT } from './constants';
import { genKey } from './utils';

export default class MeshPacket {
  created_at: Date;
  key: string;
  num: number;
  received_at: Date | null;
  received_snr: number | null;
  transmit_started_at: Date | null;
  transmitted_at: Date | null;
  hop_limit: number;
  hop_start: number;
  from: MeshNode;
  receiver: MeshNode | null = null;
  relay: MeshNode | null = null;
  relayed_at: Date | null = null;
  duplicates: Array<MeshPacket> = [];
  private _random: number;

  constructor (attrs: {
    num: number;
    hop_limit: number;
    hop_start: number;
    // payload: string;
    from: MeshNode;
    relay?: MeshNode;
  }) {
    this.created_at = new Date();
    this.key = genKey();
    this.num = attrs.num;
    this.received_at = null;
    this.received_snr = null;
    this.transmit_started_at = null;
    this.transmitted_at = null;
    this.hop_limit = attrs.hop_limit;
    this.hop_start = 3;
    this.from = attrs.from;
    this.relay = attrs.relay ?? null;
    this._random = Math.random();
  }

  get status (): MeshPacketStatus {
    if (this.from.key === this.receiver?.key) {
      if (this.transmitted_at) {
        if (this.duplicates.length > 0) {
          return MeshPacketStatus.acked;
        } else if ((Date.now() - this.transmitted_at.getTime()) > TX_TIMEOUT) {
          return MeshPacketStatus.max_retransmission_reached;
        } else {
          return MeshPacketStatus.waiting_ack;
        }
      } else if (this.transmit_started_at) {
        return MeshPacketStatus.transmitting;
      } else if (this.hop_limit > 0) {
        return MeshPacketStatus.waiting_tx;
      } else {
        return MeshPacketStatus.exhausted;
      }
    } else {
      if (this.transmitted_at) {
        return MeshPacketStatus.relayed;
      } else if (this.transmit_started_at) {
        return MeshPacketStatus.transmitting;
      } else if (this.hop_limit > 0) {
        if (this.duplicates.length > 0) {
          return MeshPacketStatus.canceled;
        }
        return MeshPacketStatus.waiting_relay;
      } else {
        return MeshPacketStatus.exhausted;
      }
    }
  }

  getDelay (t: Date) {
    let delay_ms = 0;
    let delta_ms = 0;
    if (this.received_at) {
      delta_ms = t.getTime() - this.received_at.getTime();
      const rand_window = 500;
      delay_ms = MIN_RELAY_DELAY_MS + (MAX_RELAY_DELAY_MS - MIN_RELAY_DELAY_MS - rand_window) * (this.received_snr ?? 1) + this._random * rand_window;
    } else {
      delta_ms = t.getTime() - this.created_at.getTime();
      delay_ms = MAX_TX_DELAY_MS // TODO: base this on currently receiving
    }
    return {
      delay_ms,
      delta_ms,
      diff: delay_ms - delta_ms,
      countdown: ((delay_ms - delta_ms) / MAX_RELAY_DELAY_MS),
      is_delayed: delta_ms <= delay_ms,
    };
  }

  clone () {
    const packet = new MeshPacket({
      num: this.num,
      hop_limit: this.hop_limit,
      hop_start: this.hop_start,
      from: this.from,
      // payload: this.payload;
    });
    return packet;
  }
}
