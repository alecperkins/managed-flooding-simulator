import { useEffect, useState } from 'react';
import SimMesh from './sim/SimMesh';
import MeshNodeUI from './components/MeshNodeUI';
import './App.css';
import PacketEdge from './components/PacketEdge';
import { layoutNodes } from './sim/setup';
import { PacketStatusIndicator } from './components/PacketUI';

const sim = new SimMesh();
layoutNodes(sim, 'set');


function App() {
  const [t, setT] = useState<number>(sim.last_tick);

  useEffect(() => {
    // Hacky way to sync up with the state of the simulation but it works.
    function _onUpdate (e: any) {
      setT(e.last_tick);
    }
    sim.addEventListener('update', _onUpdate);
    return () => {
      sim.removeEventListener('update', _onUpdate);
    };
  }, []);

  function _sendPacket (short_name: string) {
    const node = sim.nodes.find(n => n.short_name === short_name);
    node!.originatePacket();
  }

  return (
    <div className='SimMesh__'>
      <div className='_Header__'>
        <div className='Header'>
          <a href="https://meshtastic.org">Meshtastic</a> <a href="https://meshtastic.org/docs/overview/mesh-algo/#broadcasts-using-managed-flooding">managed flooding</a> simulator. Click on a node to send a packet.
          {' '}<button onClick={() => window.location.reload() }>Reset</button>
        </div>
      </div>
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
      <div className='_Footer__'>
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
        <footer>
          By <a href="https://k2xap.radio">Alec K2XAP</a> / <a href="https://nyme.sh">nyme.sh</a>
        </footer>
      </div>
    </div>
  )
}

export default App
