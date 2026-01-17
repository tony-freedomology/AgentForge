/**
 * Toast Notification Components
 *
 * Fantasy-themed toast notifications with WoW-style visuals.
 */

import { useEffect, useState } from 'react';
import { useToastStore } from '../../stores/toastStore';
import type { Toast as ToastType, ToastType as ToastVariant } from '../../stores/toastStore';
import { X, Info, CheckCircle, AlertTriangle, XCircle, ScrollText, Trophy, Gem } from 'lucide-react';

// Toast styling configuration
const TOAST_CONFIG: Record<ToastVariant, { color: string; bgColor: string; borderColor: string; icon: React.ReactNode }> = {
  info: {
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.4)',
    icon: <Info size={20} />,
  },
  success: {
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: 'rgba(34, 197, 94, 0.4)',
    icon: <CheckCircle size={20} />,
  },
  warning: {
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
    icon: <AlertTriangle size={20} />,
  },
  error: {
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
    icon: <XCircle size={20} />,
  },
  quest: {
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: 'rgba(245, 158, 11, 0.5)',
    icon: <ScrollText size={20} />,
  },
  achievement: {
    color: '#a855f7',
    bgColor: 'rgba(168, 85, 247, 0.2)',
    borderColor: 'rgba(168, 85, 247, 0.5)',
    icon: <Trophy size={20} />,
  },
  loot: {
    color: '#06b6d4',
    bgColor: 'rgba(6, 182, 212, 0.2)',
    borderColor: 'rgba(6, 182, 212, 0.5)',
    icon: <Gem size={20} />,
  },
};

interface ToastItemProps {
  toast: ToastType;
  onRemove: () => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const config = TOAST_CONFIG[toast.type];

  // Progress bar countdown
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const interval = 50;
      const decrement = (100 / toast.duration) * interval;

      const timer = setInterval(() => {
        setProgress((prev) => {
          const next = prev - decrement;
          if (next <= 0) {
            clearInterval(timer);
            return 0;
          }
          return next;
        });
      }, interval);

      return () => clearInterval(timer);
    }
  }, [toast.duration]);

  // Exit animation
  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(onRemove, 300);
  };

  return (
    <div
      className={`
        relative flex items-start gap-3 p-4 rounded-lg shadow-lg backdrop-blur-md
        transition-all duration-300 ease-out overflow-hidden
        ${isExiting ? 'animate-toast-exit' : 'animate-toast-enter'}
      `}
      style={{
        background: config.bgColor,
        border: `1px solid ${config.borderColor}`,
        boxShadow: `0 4px 20px ${config.color}20, 0 0 40px ${config.color}10`,
      }}
    >
      {/* Icon */}
      <div
        className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ background: `${config.color}20`, color: config.color }}
      >
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <h4 className="font-bold text-white text-sm leading-tight">{toast.title}</h4>
        {toast.message && (
          <p className="text-gray-400 text-xs mt-1 leading-relaxed">{toast.message}</p>
        )}
        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick();
              handleRemove();
            }}
            className="mt-2 text-xs font-semibold px-3 py-1 rounded transition-colors"
            style={{
              background: `${config.color}30`,
              color: config.color,
            }}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={handleRemove}
        className="flex-shrink-0 p-1 rounded hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
      >
        <X size={16} />
      </button>

      {/* Progress bar */}
      {toast.duration && toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
          <div
            className="h-full transition-all duration-50 ease-linear"
            style={{
              width: `${progress}%`,
              background: config.color,
            }}
          />
        </div>
      )}

      {/* Decorative corner accents for special toasts */}
      {(toast.type === 'achievement' || toast.type === 'quest') && (
        <>
          <div
            className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 rounded-tl-lg"
            style={{ borderColor: config.color }}
          />
          <div
            className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 rounded-tr-lg"
            style={{ borderColor: config.color }}
          />
          <div
            className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 rounded-bl-lg"
            style={{ borderColor: config.color }}
          />
          <div
            className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 rounded-br-lg"
            style={{ borderColor: config.color }}
          />
        </>
      )}
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] w-96 max-w-[calc(100vw-2rem)] space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={() => removeToast(toast.id)} />
        </div>
      ))}
    </div>
  );
}
