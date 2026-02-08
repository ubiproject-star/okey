import React, { useEffect } from 'react';

interface SplashProps {
    onComplete: () => void;
}

export const Splash: React.FC<SplashProps> = ({ onComplete }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 3500); // Slightly longer for cinematic feel
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 to-black flex flex-col items-center justify-center z-50 overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-600/20 rounded-full blur-[100px] animate-pulse"></div>

            {/* Logo Container */}
            <div className="relative z-10 flex flex-col items-center">
                {/* 3D Tile Animation */}
                <div className="relative w-40 h-56 bg-gradient-to-b from-[#F9F7F2] to-[#E0DBD0] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center border-r-4 border-b-4 border-[#BCAAA4] transform hover:scale-105 transition duration-700 animate-[bounce_3s_infinite]">
                    {/* Inner Recess */}
                    <div className="absolute inset-4 border-2 border-[#D7CCC8]/50 rounded-lg"></div>

                    {/* Number */}
                    <span className="text-8xl font-black text-[#D32F2F] tracking-tighter drop-shadow-md" style={{ fontFamily: 'Inter, sans-serif' }}>
                        101
                    </span>

                    {/* Decorative Circles */}
                    <div className="absolute top-3 left-3 w-4 h-4 rounded-full bg-[#D32F2F] shadow-inner"></div>
                    <div className="absolute bottom-3 right-3 w-4 h-4 rounded-full bg-[#D32F2F] shadow-inner"></div>
                </div>

                {/* Title */}
                <h1 className="mt-12 text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-500 tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    OKEY PRO
                </h1>

                {/* Loading Bar */}
                <div className="mt-8 w-64 h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                    <div className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 w-full origin-left animate-[grow_3s_ease-out]"></div>
                </div>

                <p className="mt-4 text-gray-400 text-xs tracking-widest uppercase">Connecting to Server...</p>
            </div>

            {/* Footer Version */}
            <div className="absolute bottom-8 text-gray-600 text-[10px] font-mono">
                v2.0.4.15 (PRO-BUILD)
            </div>
        </div>
    );
};
