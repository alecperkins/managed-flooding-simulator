import { useEffect, useState } from 'react';
import SimMesh from './sim/SimMesh';
import MeshNodeUI from './components/MeshNodeUI';
import './App.css';
import PacketEdge from './components/PacketEdge';
import { layoutNodes } from './sim/setup';
import { PacketStatusIndicator } from './components/PacketUI';

const is_screensaver = window.location.search === '?screensaver';
const is_random = window.location.search === '?random';
if (is_screensaver) {
  document.body.dataset.is_screensaver = is_screensaver.toString();
}
const sim = new SimMesh();
layoutNodes(sim, is_screensaver || is_random ? 'random' : 'set');

function getTransform () {
  if (!is_screensaver) { return undefined; }
  if (window.innerWidth < window.innerHeight) {
    return `scale(${window.innerWidth / 800})`;
  } else {
    return `scale(${window.innerHeight / 800})`;
  }
}

function _initPacket () {
  const node = sim.nodes[Math.floor(sim.nodes.length * Math.random())];
  node.originatePacket();
}

function App() {
  const [t, setT] = useState<number>(sim.last_tick);
  // const [num_completed_packets, setNumCompletedPackets] = useState<number>(sim.num_completed_packets);

  useEffect(() => {
    // Hacky way to sync up with the state of the simulation but it works.
    function _onUpdate (e: any) {
      setT(e.last_tick);
    }
    sim.addEventListener('update', _onUpdate);
    let screensaver_restart: number;
    let screensaver_polling: number;
    if (is_screensaver) {
      screensaver_restart = setTimeout(() => {
        window.location.reload();
      }, 30_000);
      screensaver_polling = setInterval(() => {
        _initPacket();
      }, 10_000);
      if (sim.packets.length === 0) { // Need to check because of React's double-invoking of effects in dev
        _initPacket();
      }
    }
    return () => {
      sim.removeEventListener('update', _onUpdate);
      clearTimeout(screensaver_restart);
      clearInterval(screensaver_polling);
    };
  }, []);

  function _sendPacket (short_name: string) {
    const node = sim.nodes.find(n => n.short_name === short_name);
    node!.originatePacket();
  }

  return (
    <div className='SimMesh__' data-is_screensaver={ is_screensaver } style={{
      transform: getTransform(),
    }}>
      {!is_screensaver && <div className='_Header__'>
        <div className='Header'>
          <a href="https://meshtastic.org">Meshtastic</a> <a href="https://meshtastic.org/docs/overview/mesh-algo/#broadcasts-using-managed-flooding">managed flooding</a> simulator. Click on a node to send a packet.
          {' '}<button onClick={() => window.location.reload() }>Reset</button>
        </div>
      </div>}
      <div data-tick={t} className='_Canvas__'>
        {
          sim.edges.map(edge => (
            <PacketEdge key={ edge.key } edge={ edge } />
          ))
        }
        {
          sim.nodes.map(node => (
            <MeshNodeUI key={node.key} node={node} />
          ))
        }
      </div>
      { !is_screensaver && <div className='_Footer__'>
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <td>#</td>
              {
                sim.nodes.map(n => (
                  <td>{ n.short_name }</td>
                ))
              }
            </tr>
          </thead>
          <tbody>
            {
              sim.packets.filter(p => p.is_original).map(packet => (
                <tr key={packet.num.toString()}>
                  <td>p{ packet.num }</td>
                  {
                    sim.nodes.map(n => {
                      const p = n.packets.find(p => p.num === packet.num);
                      if (p) {
                        return <td><PacketStatusIndicator packet={ p } countdown={false} /></td>;
                      }
                      return <td><div className='EmptyStatus'></div></td>;
                    })
                  }
                </tr>
              ))
            }
          </tbody>
        </table>
        <ul id="scenario_list">
          <li><button onClick={() => _sendPacket('F')}>F</button>: see a complete propagation</li>
          <li><button onClick={() => _sendPacket('C')}>C</button>: see poorly placed `ROUTER` D stop propagation</li>
          <li><button onClick={() => _sendPacket('Y')}>Y</button>: see hop exhaustion</li>
          <li><button onClick={() => _sendPacket('W')}>W</button>: see `ROUTER`, `ROUTER_LATE` work properly</li>
        </ul>
        <footer className='d-flex'>
          <div>
            By <a href="https://k2xap.radio">Alec K2XAP</a> / <a href="https://nyme.sh">nyme.sh</a>
          </div>
          <div className='flex-grow-1 text-right'>
            <a href="?default">?default</a> <a href="?random">?random</a> <a href="?screensaver">?screensaver</a>
          </div>
        </footer>
      </div>}
    </div>
  )
}

export default App
