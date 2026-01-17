/**
 * useSound Hook - React integration for the sound system
 *
 * Provides easy access to sound functions in React components.
 */

import { useCallback, useEffect, useRef } from 'react';
import { soundManager } from '../services/soundManager';
import type { SoundEvent, SoundCategory } from '../services/soundManager';

/**
 * Main hook for playing sounds
 */
export function useSound() {
  const play = useCallback((event: SoundEvent, options?: { volume?: number; loop?: boolean }) => {
    soundManager.play(event, options);
  }, []);

  const stop = useCallback((event: SoundEvent) => {
    soundManager.stop(event);
  }, []);

  const stopCategory = useCallback((category: SoundCategory) => {
    soundManager.stopCategory(category);
  }, []);

  return { play, stop, stopCategory };
}

/**
 * Hook for UI interaction sounds
 * Automatically plays click sounds on click and hover sounds on hover
 */
export function useUISound() {
  const { play } = useSound();

  const onClick = useCallback(() => {
    play('ui_click');
  }, [play]);

  const onHover = useCallback(() => {
    play('ui_hover');
  }, [play]);

  return { onClick, onHover };
}

/**
 * Hook for playing a sound on mount
 */
export function useSoundOnMount(event: SoundEvent, options?: { volume?: number }) {
  const hasPlayed = useRef(false);

  useEffect(() => {
    if (!hasPlayed.current) {
      hasPlayed.current = true;
      soundManager.play(event, options);
    }
  }, [event, options]);
}

/**
 * Hook for playing a looping sound while component is mounted
 */
export function useLoopingSound(event: SoundEvent, shouldPlay: boolean = true, volume?: number) {
  useEffect(() => {
    if (shouldPlay) {
      soundManager.play(event, { loop: true, volume });
      return () => {
        soundManager.stop(event);
      };
    }
  }, [event, shouldPlay, volume]);
}

/**
 * Hook for agent-specific sounds
 */
export function useAgentSounds(_agentId?: string) {
  const { play } = useSound();

  const playSpawn = useCallback(() => {
    play('agent_spawn');
  }, [play]);

  const playSelect = useCallback(() => {
    play('agent_select');
  }, [play]);

  const playDeselect = useCallback(() => {
    play('agent_deselect');
  }, [play]);

  const playAttention = useCallback(() => {
    play('agent_attention');
  }, [play]);

  const playLevelUp = useCallback(() => {
    play('agent_level_up');
  }, [play]);

  return {
    playSpawn,
    playSelect,
    playDeselect,
    playAttention,
    playLevelUp,
  };
}

/**
 * Hook for quest sounds
 */
export function useQuestSounds() {
  const { play } = useSound();

  const playQuestStart = useCallback(() => {
    play('quest_start');
  }, [play]);

  const playQuestComplete = useCallback(() => {
    play('quest_complete');
  }, [play]);

  const playQuestApproved = useCallback(() => {
    play('quest_approved');
  }, [play]);

  const playQuestRejected = useCallback(() => {
    play('quest_rejected');
  }, [play]);

  return {
    playQuestStart,
    playQuestComplete,
    playQuestApproved,
    playQuestRejected,
  };
}

/**
 * Hook for talent sounds
 */
export function useTalentSounds() {
  const { play } = useSound();

  const playAllocate = useCallback(() => {
    play('talent_allocate');
  }, [play]);

  const playReset = useCallback(() => {
    play('talent_reset');
  }, [play]);

  const playMaxed = useCallback(() => {
    play('talent_maxed');
  }, [play]);

  const playTreeOpen = useCallback(() => {
    play('talent_tree_open');
  }, [play]);

  const playTreeClose = useCallback(() => {
    play('talent_tree_close');
  }, [play]);

  return {
    playAllocate,
    playReset,
    playMaxed,
    playTreeOpen,
    playTreeClose,
  };
}

/**
 * Hook for file/loot sounds
 */
export function useLootSounds() {
  const { play } = useSound();

  const playFileCreated = useCallback(() => {
    play('file_created');
  }, [play]);

  const playFileModified = useCallback(() => {
    play('file_modified');
  }, [play]);

  const playLootDrop = useCallback(() => {
    play('loot_drop');
  }, [play]);

  const playLootPickup = useCallback(() => {
    play('loot_pickup');
  }, [play]);

  return {
    playFileCreated,
    playFileModified,
    playLootDrop,
    playLootPickup,
  };
}
