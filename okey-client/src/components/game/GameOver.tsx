import React, { useEffect } from 'react';
import Confetti from 'react-confetti';

interface GameOverProps {
    data: {
        winnerName: string;
        reason: string;
        winnerId?: string;
    };
    onClose: () => void;
    currentUserId: string;
}

export const GameOver: React.FC<GameOverProps> = ({ data, onClose, currentUserId }) => {
    const isWinner = data.winnerId === currentUserId; // Simple check if ID determines winner (needs robust ID check)
    // Or just check name for now if IDs are strict
    // Actually we passed winnerId from server.

    useEffect(() => {
        // Play specific sound
    }, [isWinner]);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in">
            {isWinner && <Confetti width={window.innerWidth} height={window.innerHeight} numberOfPieces={200} gravity={0.1} />}

            <div className={`relative w-[500px] h-[400px] rounded-3xl p-1 flex flex-col items-center justify-center ${isWinner ? 'bg-gradient-to-b from-yellow-300 to-yellow-600' : 'bg-gradient-to-b from-gray-500 to-gray-700'}`}>
                {/* Inner Content */}
                <div className="w-full h-full bg-[#1A1A1A] rounded-[22px] flex flex-col items-center justify-center relative overflow-hidden">

                    {/* Background Rays */}
                    {isWinner && (
                        <div className="absolute inset-0 animate-[spin_10s_linear_infinite] opacity-20">
                            <div className="w-full h-full bg-[conic-gradient(from_0deg,transparent_0deg,yellow_20deg,transparent_40deg,yellow_60deg,transparent_80deg,yellow_100deg,transparent_120deg,yellow_140deg,transparent_160deg,yellow_180deg,transparent_200deg,yellow_220deg,transparent_240deg,yellow_260deg,transparent_280deg,yellow_300deg,transparent_320deg,yellow_340deg,transparent_360deg)]"></div>
                        </div>
                    )}

                    {/* Trophy / Icon */}
                    <div className="text-8xl mb-4 transform hover:scale-110 transition duration-500 drop-shadow-2xl">
                        {isWinner ? '🏆' : '😔'}
                    </div>

                    <h2 className={`text-4xl font-black tracking-widest uppercase mb-2 ${isWinner ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500' : 'text-gray-400'}`}>
                        {isWinner ? 'KAZANDIN!' : 'KAYBETTİN'}
                    </h2>

                    <p className="text-white/60 text-lg mb-8">
                        {isWinner ? `Tebrikler, harika bir oyundu!` : `${data.winnerName} oyunu bitirdi.`}
                    </p>

                    {/* Stats or Reward */}
                    {isWinner && (
                        <div className="flex items-center space-x-4 bg-white/5 px-6 py-3 rounded-xl border border-white/10 mb-8">
                            <div className="flex flex-col items-center">
                                <span className="text-yellow-400 font-bold text-xl">+250</span>
                                <span className="text-[10px] text-gray-400 uppercase">XP KAZANDIN</span>
                            </div>
                            <div className="w-px h-8 bg-white/10"></div>
                            <div className="flex flex-col items-center">
                                <span className="text-green-400 font-bold text-xl">+1000</span>
                                <span className="text-[10px] text-gray-400 uppercase">Çip</span>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={onClose}
                        className={`px-10 py-3 rounded-full font-bold text-lg shadow-lg transform transition active:scale-95 ${isWinner ? 'bg-yellow-500 hover:bg-yellow-400 text-black' : 'bg-gray-600 hover:bg-gray-500 text-white'}`}
                    >
                        {isWinner ? 'DEVAM ET' : 'ANA MENÜYE DÖN'}
                    </button>

                </div>
            </div>
        </div>
    );
};
