import React, { useState } from 'react';
import { Agent } from '../shared/types/agent';
import { LevelUpCelebration } from '../components/LevelUpCelebration';

export const useLevelUpCelebration = () => {
  const [celebration, setCelebration] = useState<{
    visible: boolean;
    agent: Agent | null;
    newLevel: number;
  }>({
    visible: false,
    agent: null,
    newLevel: 1,
  });

  const showCelebration = (agent: Agent, newLevel: number) => {
    setCelebration({ visible: true, agent, newLevel });
  };

  const hideCelebration = () => {
    setCelebration((prev) => ({ ...prev, visible: false }));
  };

  const CelebrationComponent = celebration.agent
    ? React.createElement(LevelUpCelebration, {
        agent: celebration.agent,
        newLevel: celebration.newLevel,
        visible: celebration.visible,
        onDismiss: hideCelebration,
      })
    : null;

  return {
    showCelebration,
    hideCelebration,
    CelebrationComponent,
  };
};
