import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SpireConnection,
  ConnectionStatus,
  MachineInfo,
} from '../shared/types/connection';

interface ConnectionState {
  // Current connection
  currentConnection: SpireConnection | null;
  connectionStatus: ConnectionStatus;
  connectionError: string | null;

  // Saved connections
  savedConnections: SpireConnection[];

  // Connection code for pairing
  pendingConnectionCode: string | null;

  // Machine info from connected daemon
  machineInfo: MachineInfo | null;

  // Recent workspaces (for quick selection)
  recentWorkspaces: string[];

  // Actions
  setConnectionStatus: (status: ConnectionStatus, error?: string) => void;
  setCurrentConnection: (connection: SpireConnection | null) => void;
  updateConnection: (id: string, updates: Partial<SpireConnection>) => void;

  // Saved connections
  saveConnection: (connection: SpireConnection) => void;
  removeConnection: (id: string) => void;
  getSavedConnection: (id: string) => SpireConnection | undefined;

  // Pairing
  setPendingConnectionCode: (code: string | null) => void;

  // Machine info
  setMachineInfo: (info: MachineInfo | null) => void;

  // Workspaces
  addRecentWorkspace: (path: string) => void;
  clearRecentWorkspaces: () => void;

  // Disconnect
  disconnect: () => void;
}

export const useConnectionStore = create<ConnectionState>()(
  persist(
    (set, get) => ({
      currentConnection: null,
      connectionStatus: 'disconnected',
      connectionError: null,
      savedConnections: [],
      pendingConnectionCode: null,
      machineInfo: null,
      recentWorkspaces: [],

      setConnectionStatus: (status, error) => {
        set({
          connectionStatus: status,
          connectionError: error || null,
        });

        // Update current connection status
        const current = get().currentConnection;
        if (current) {
          set({
            currentConnection: {
              ...current,
              status,
              lastConnected: status === 'connected' ? new Date() : current.lastConnected,
              lastDisconnected: status === 'disconnected' ? new Date() : current.lastDisconnected,
            },
          });
        }
      },

      setCurrentConnection: (connection) => {
        set({ currentConnection: connection });

        // Also save to saved connections
        if (connection) {
          const saved = get().savedConnections;
          const existing = saved.find((c) => c.id === connection.id);
          if (existing) {
            get().updateConnection(connection.id, connection);
          } else {
            get().saveConnection(connection);
          }
        }
      },

      updateConnection: (id, updates) => {
        set((state) => {
          const savedConnections = state.savedConnections.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          );
          const currentConnection =
            state.currentConnection?.id === id
              ? { ...state.currentConnection, ...updates }
              : state.currentConnection;
          return { savedConnections, currentConnection };
        });
      },

      saveConnection: (connection) => {
        set((state) => {
          const existing = state.savedConnections.find((c) => c.id === connection.id);
          if (existing) {
            return {
              savedConnections: state.savedConnections.map((c) =>
                c.id === connection.id ? connection : c
              ),
            };
          }
          return {
            savedConnections: [...state.savedConnections, connection],
          };
        });
      },

      removeConnection: (id) => {
        set((state) => ({
          savedConnections: state.savedConnections.filter((c) => c.id !== id),
          currentConnection:
            state.currentConnection?.id === id ? null : state.currentConnection,
        }));
      },

      getSavedConnection: (id) => {
        return get().savedConnections.find((c) => c.id === id);
      },

      setPendingConnectionCode: (code) => {
        set({ pendingConnectionCode: code });
      },

      setMachineInfo: (info) => {
        set({ machineInfo: info });
      },

      addRecentWorkspace: (path) => {
        set((state) => {
          const filtered = state.recentWorkspaces.filter((p) => p !== path);
          return {
            recentWorkspaces: [path, ...filtered].slice(0, 10), // Keep last 10
          };
        });
      },

      clearRecentWorkspaces: () => {
        set({ recentWorkspaces: [] });
      },

      disconnect: () => {
        set({
          connectionStatus: 'disconnected',
          connectionError: null,
          machineInfo: null,
        });

        const current = get().currentConnection;
        if (current) {
          set({
            currentConnection: {
              ...current,
              status: 'disconnected',
              lastDisconnected: new Date(),
            },
          });
        }
      },
    }),
    {
      name: 'arcane-spire-connections',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        savedConnections: state.savedConnections,
        recentWorkspaces: state.recentWorkspaces,
      }),
    }
  )
);

// Create a new connection object
export function createConnection(name: string, url: string): SpireConnection {
  return {
    id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    url,
    status: 'disconnected',
    agentIds: [],
  };
}
