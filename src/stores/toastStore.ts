/**
 * Toast Notification Store
 *
 * Fantasy-themed notification system for quest updates, agent alerts,
 * achievements, and system messages.
 */

import { create } from 'zustand';

export type ToastType = 'info' | 'success' | 'warning' | 'error' | 'quest' | 'achievement' | 'loot';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  icon?: string;
  duration?: number; // ms, 0 = persistent
  action?: {
    label: string;
    onClick: () => void;
  };
  createdAt: number;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id' | 'createdAt'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

let toastCounter = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${++toastCounter}-${Date.now()}`;
    const duration = toast.duration ?? 5000;
    const newToast: Toast = {
      ...toast,
      id,
      duration,
      createdAt: Date.now(),
    };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // Auto-remove after duration (unless persistent)
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearAll: () => {
    set({ toasts: [] });
  },
}));

// Helper functions for common toast types
export const toast = {
  info: (title: string, message?: string) =>
    useToastStore.getState().addToast({ type: 'info', title, message, icon: 'info' }),

  success: (title: string, message?: string) =>
    useToastStore.getState().addToast({ type: 'success', title, message, icon: 'success' }),

  warning: (title: string, message?: string) =>
    useToastStore.getState().addToast({ type: 'warning', title, message, icon: 'warning' }),

  error: (title: string, message?: string) =>
    useToastStore.getState().addToast({ type: 'error', title, message, icon: 'error', duration: 8000 }),

  quest: (title: string, message?: string) =>
    useToastStore.getState().addToast({ type: 'quest', title, message, icon: 'quest' }),

  achievement: (title: string, message?: string) =>
    useToastStore.getState().addToast({
      type: 'achievement',
      title,
      message,
      icon: 'achievement',
      duration: 8000,
    }),

  loot: (title: string, message?: string) =>
    useToastStore.getState().addToast({ type: 'loot', title, message, icon: 'loot' }),
};
