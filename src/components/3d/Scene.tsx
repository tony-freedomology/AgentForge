import { Suspense, useMemo, useState, useEffect } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useGameStore } from '../../stores/gameStore';
import { Environment } from './Environment';
import { AgentUnit } from './AgentUnit';
import { SelectionBox } from './SelectionBox';

// Camera controls that only activate when Option/Alt key is held
function ModifierOrbitControls() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow orbit with Alt key
      if (e.altKey) setEnabled(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.altKey) setEnabled(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <OrbitControls
      target={[0, 0, 0]}
      enabled={enabled}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={10}
      maxDistance={60}
      maxPolarAngle={Math.PI / 2.2} // Prevent going under the ground
    />
  );
}

function AgentUnits() {
  const agentsMap = useGameStore((s) => s.agents);
  const selectedIds = useGameStore((s) => s.selectedAgentIds);
  const selectAgent = useGameStore((s) => s.selectAgent);

  const agents = useMemo(() => Array.from(agentsMap.values()), [agentsMap]);

  return (
    <group>
      {agents.map((agent) => (
        <AgentUnit
          key={agent.id}
          id={agent.id}
          type={agent.class}
          q={agent.position.q}
          r={agent.position.r}
          name={agent.name}
          status={agent.status}
          isSelected={selectedIds.has(agent.id)}
          onClick={() => selectAgent(agent.id, false)} // Simple selection for now
        />
      ))}
    </group>
  );
}

export function Scene() {
  return (
    <>
      <ModifierOrbitControls />

      <Suspense fallback={null}>
        <Environment />
        <AgentUnits />
      </Suspense>

      <SelectionBox />
    </>
  );
}
