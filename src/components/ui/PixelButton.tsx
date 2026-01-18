import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn'; // Assuming utils/cn exists, I will need to check or create it

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg';
    children: ReactNode;
    soundEnabled?: boolean;
}

export function PixelButton({
    className,
    variant = 'primary',
    size = 'md',
    children,
    soundEnabled = true,
    onClick,
    ...props
}: PixelButtonProps) {

    const playClickSound = () => {
        if (soundEnabled) {
            // Placeholder for sound effect
            // const audio = new Audio('/assets/sounds/click.mp3');
            // audio.volume = 0.5;
            // audio.play().catch(e => console.error("Audio play failed", e));
        }
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        playClickSound();
        onClick?.(e);
    };

    const variants = {
        primary: "bg-amber-500 border-amber-700 text-amber-100 hover:bg-amber-400 active:translate-y-1 active:shadow-none shadow-[0_4px_0_rgb(180,83,9)]",
        secondary: "bg-slate-600 border-slate-800 text-slate-100 hover:bg-slate-500 active:translate-y-1 active:shadow-none shadow-[0_4px_0_rgb(51,65,85)]",
        danger: "bg-red-600 border-red-800 text-red-100 hover:bg-red-500 active:translate-y-1 active:shadow-none shadow-[0_4px_0_rgb(153,27,27)]",
        success: "bg-emerald-600 border-emerald-800 text-emerald-100 hover:bg-emerald-500 active:translate-y-1 active:shadow-none shadow-[0_4px_0_rgb(6,95,70)]",
    };

    const sizes = {
        sm: "px-3 py-1 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
    };

    return (
        <button
            onClick={handleClick}
            className={cn(
                "relative inline-flex items-center justify-center font-pixel uppercase tracking-widest transition-all duration-75 border-2 select-none",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
