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
    color: '#38bdf8', // Sky-400
    bgColor: 'rgba(12, 74, 110, 0.9)', // Sky-950
    borderColor: 'rgba(56, 189, 248, 0.5)',
    icon: <Info size={20} />,
  },
  success: {
    color: '#34d399', // Emerald-400
    bgColor: 'rgba(6, 78, 59, 0.9)', // Emerald-950
    borderColor: 'rgba(52, 211, 153, 0.5)',
    icon: <CheckCircle size={20} />,
  },
  warning: {
    color: '#fbbf24', // Amber-400
    bgColor: 'rgba(69, 26, 3, 0.9)', // Amber-950
    borderColor: 'rgba(251, 191, 36, 0.5)',
    icon: <AlertTriangle size={20} />,
  },
  error: {
    color: '#f87171', // Red-400
    bgColor: 'rgba(69, 10, 10, 0.9)', // Red-950
    borderColor: 'rgba(248, 113, 113, 0.5)',
    icon: <XCircle size={20} />,
  },
  quest: {
    color: '#fbbf24', // Amber-400
    bgColor: 'rgba(28, 25, 23, 0.95)', // Stone-900
    borderColor: 'rgba(217, 119, 6, 0.6)', // Amber-600
    icon: <ScrollText size={20} />,
  },
  achievement: {
    color: '#e879f9', // Purple-400
    bgColor: 'rgba(59, 7, 100, 0.9)', // Purple-950
    borderColor: 'rgba(232, 121, 249, 0.5)',
    icon: <Trophy size={20} />,
  },
  loot: {
    color: '#a78bfa', // Purple-400 (Epic)
    bgColor: 'rgba(46, 16, 101, 0.9)', // Violet-950
    borderColor: 'rgba(167, 139, 250, 0.5)',
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
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>

      {/* Progress bar */}
      {toast.duration && toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
          <div
            className="h-full ease-linear"
            style={{
              width: `${progress}%`,
              background: config.color,
              transition: 'width 50ms linear',
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
    <div
      className="fixed top-56 right-4 z-[100] w-96 max-w-[calc(100vw-2rem)] space-y-2 pointer-events-none"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={() => removeToast(toast.id)} />
        </div>
      ))}
    </div>
  );
}
