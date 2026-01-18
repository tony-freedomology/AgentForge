/**
 * Idle Monitor Hook
 *
 * Periodically checks for agents that have been idle too long
 * and flags them for attention.
 */

import { useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';

// Check interval in milliseconds (10 seconds)
const CHECK_INTERVAL_MS = 10000;

export function useIdleMonitor() {
  const checkIdleTimeouts = useGameStore((s) => s.checkIdleTimeouts);

  useEffect(() => {
    // Run check periodically
    const interval = setInterval(() => {
      checkIdleTimeouts();
    }, CHECK_INTERVAL_MS);

    // Initial check
    checkIdleTimeouts();

    return () => clearInterval(interval);
  }, [checkIdleTimeouts]);
}

/**
 * Hook to auto-save session periodically
 */
export function useAutoSave(intervalMs: number = 60000) {
  const saveSession = useGameStore((s) => s.saveSession);
  const agents = useGameStore((s) => s.agents);

  useEffect(() => {
    // Only auto-save if there are agents
    if (agents.size === 0) return;

    const interval = setInterval(() => {
      saveSession();
    }, intervalMs);

    // Save on unmount
    return () => {
      clearInterval(interval);
      if (agents.size > 0) {
        saveSession();
      }
    };
  }, [saveSession, agents.size, intervalMs]);
}

/**
 * Hook to restore session on mount
 */
export function useSessionRestore() {
  const loadSession = useGameStore((s) => s.loadSession);
  const spawnAgent = useGameStore((s) => s.spawnAgent);

  useEffect(() => {
    const savedAgents = loadSession();

    if (savedAgents && Array.isArray(savedAgents) && savedAgents.length > 0) {
      // Offer to restore agents (for now, just log)
      console.log('Session restored with agent data:', savedAgents);
      // Note: Full restoration would require re-spawning agents via the backend
      // For now, we just restore positions and metadata
    }
  }, [loadSession, spawnAgent]);
}
