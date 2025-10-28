export const MAX_DIST             = 250;      // The maximum distance a node can transmit
export const MAX_RELAY_DELAY_MS   = 7000;     // The maximum amount of time a client waits to relay
export const MAX_TX_DELAY_MS      = 1000;     // How long it waits before initial transmission
export const MIN_RELAY_DELAY_MS   = 1000;     // The minimum amount of time a client waits to relay
export const TICK_INTERVAL        = 100;      // The time resolution of the simulation
export const TX_TIME_MS           = 500;      // How long each transmission takes
export const TX_TIMEOUT           = 30_000;   // How long until max_retransmission_reached if no ack

export enum MeshNodeRole {
  CLIENT                      = 'CLIENT',
  CLIENT_MUTE                 = 'CLIENT_MUTE',
  ROUTER                      = 'ROUTER',
  ROUTER_LATE                 = 'ROUTER_LATE',
}

export enum MeshPacketStatus {
  acked                       = 'acked',                        // Has received a duplicate of its own packet
  canceled                    = 'canceled',                     // Stopped its relay countdown after hearing another duplicate first
  exhausted                   = 'exhausted',                    // The packet has no more hops
  muted                       = 'muted',                        // The node is client_mute and will not relay
  max_retransmission_reached  = 'max_retransmission_reached',   // Never heard another node relay its own packet within the TX_TIMEOUT
  relayed                     = 'relayed',                      // Has transmitted a packet it did not originate
  transmitting                = 'transmitting',                 // Is currently transmitting a packet
  waiting_ack                 = 'waiting_ack',                  // Is waiting to hear someone else relay its packet
  waiting_relay               = 'waiting_relay',                // Is waiting to transmit another node’s packet
  waiting_tx                  = 'waiting_tx',                   // Is waiting to transmit its own packet
}
