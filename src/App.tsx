import { useEffect, useState } from 'react';
import SimMesh from './sim/SimMesh';
import MeshNodeUI from './components/MeshNodeUI';
import './App.css';
import PacketEdge from './components/PacketEdge';

const sim = new SimMesh();
// sim.addNode('A', 20, 20);
// sim.addNode('B', 100, 50);
// sim.addNode('C', 40, 100);
// sim.addNode('D', 200, 120);
// sim.addNode('E', 20, 300);
// sim.addNode('F', 250, 400);
// sim.addNode('G', 250, 10);
for (let i = 0; i < 26; i++) {
  sim.addNode(String.fromCharCode(i + 65),
    Math.floor(800 * Math.random()),
    Math.floor(800 * Math.random()),
  );
}


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
