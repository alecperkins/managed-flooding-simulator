import { useEffect, useState } from 'react';
import SimMesh from './sim/SimMesh';
import MeshNodeUI from './components/MeshNodeUI';
import './App.css';
import PacketEdge from './components/PacketEdge';
import { layoutNodes } from './sim/setup';

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

  return (
    <div data-t={t}>
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
  )
}

export default App
