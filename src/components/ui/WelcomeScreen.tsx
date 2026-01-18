import { useState, useEffect } from 'react';
import { PixelButton } from './PixelButton';
import { ChevronRight, Activity, Zap, Shield, BookOpen } from 'lucide-react';

interface WelcomeScreenProps {
    onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [activeCard, setActiveCard] = useState<number | null>(null);

    const handleStart = () => {
        setIsVisible(false);
        setTimeout(onStart, 800); // Allow animation to finish
    };

    const menuItems = [
        {
            icon: <Zap className="w-8 h-8 text-amber-300" />,
            title: "SUMMON",
            desc: "Summon Arcane Units",
            color: "amber",
            shortcut: "N"
        },
        {
            icon: <Shield className="w-8 h-8 text-cyan-300" />,
            title: "COMMAND",
            desc: "Issue Decrees",
            color: "cyan",
            shortcut: "T"
        },
        {
            icon: <BookOpen className="w-8 h-8 text-purple-300" />,
            title: "OBSERVE",
            desc: "Scry Unit Minds",
            color: "purple",
            shortcut: "O"
        }
    ];

    if (!isVisible) return null;

    return (
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>

            {/* Background Image Layer */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center pixel-art"
                style={{
                    backgroundImage: 'url(/assets/welcome_bg.png)',
                    imageRendering: 'pixelated'
                }}
            >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
            </div>

            {/* Main Content Container */}
            <div className="relative z-10 flex flex-col items-center w-full max-w-5xl px-4 animate-fade-in-up">

                {/* Logo Section */}
                <div className="mb-16 text-center transform hover:scale-105 transition-transform duration-500">
                    <h1 className="text-4xl md:text-6xl font-pixel text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-amber-600 drop-shadow-[0_4px_0_#451a03] mb-4 tracking-tighter">
                        AGENT FORGE
                    </h1>
                    <div className="flex items-center justify-center gap-4">
                        <div className="h-[2px] w-12 bg-amber-500/50" />
                        <p className="font-pixel-text text-amber-200/80 text-xl tracking-widest uppercase font-serif">
                            Arcane Command Interface
                        </p>
                        <div className="h-[2px] w-12 bg-amber-500/50" />
                    </div>
                </div>

                {/* Interactive Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-16">
                    {menuItems.map((item, idx) => {
                        const isActive = activeCard === idx;
                        return (
                            <div
                                key={idx}
                                className={`
                  relative group cursor-pointer transition-all duration-300 transform hover:-translate-y-2
                  bg-stone-900/80 border-4 border-stone-700 hover:border-amber-500/70
                  p-6 rounded-none
                  shadow-[0_8px_0_rgba(0,0,0,0.5)] active:translate-y-0 active:shadow-none
                `}
                                onMouseEnter={() => setActiveCard(idx)}
                                onMouseLeave={() => setActiveCard(null)}
                            >
                                {/* 9-slice-ish inner aesthetic */}
                                <div className={`
                  absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300
                  bg-gradient-to-br from-${item.color}-500 to-transparent
                `} />

                                <div className="relative z-10 flex flex-col items-center text-center gap-4">
                                    {/* Icon Container with Glow */}
                                    <div className={`
                    p-4 bg-stone-800 border-2 border-stone-600 rounded-none group-hover:border-${item.color}-400
                    shadow-[0_4px_0_rgba(0,0,0,0.3)] transition-colors duration-300
                    ${isActive ? `shadow-[0_0_20px_rgba(251,191,36,0.4)]` : ''}
                  `}>
                                        {item.icon}
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className={`font-pixel text-sm text-${item.color}-300 group-hover:text-white transition-colors`}>
                                            {item.title}
                                        </h3>
                                        <p className="font-pixel-text text-stone-400 text-lg group-hover:text-amber-100 font-serif">
                                            {item.desc}
                                        </p>
                                    </div>

                                    {/* Keyboard Shortcut Hint */}
                                    <div className="absolute top-2 right-2 opacity-50 font-pixel text-[10px] text-stone-500 border border-stone-700 px-1.5 py-0.5 bg-black/40">
                                        [{item.shortcut}]
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Start Button */}
                <div className="relative">
                    <PixelButton
                        size="lg"
                        className="text-xl px-12 py-6 animate-pulse-slow hover:animate-none border-4 border-amber-800 bg-amber-700 hover:bg-amber-600 text-amber-50 shadow-[0_8px_0_#451a03]"
                        onClick={handleStart}
                    >
                        <span className="mr-3 font-serif tracking-widest">ENTER THE REALM</span>
                        <ChevronRight className="w-6 h-6 animate-bounce-horizontal" />
                    </PixelButton>

                    {/* Decorative floor elements */}
                    <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[500px] h-[100px] bg-amber-500/10 blur-[50px] rounded-full pointer-events-none" />
                </div>

                {/* Footer Status */}
                <div className="absolute bottom-8 flex items-center gap-3 font-pixel-text text-amber-700/60 text-lg font-serif">
                    <Activity className="w-5 h-5" />
                    <span>REALM ACTIVE // Era 2.0.4</span>
                </div>
            </div>
        </div>
    );
}
