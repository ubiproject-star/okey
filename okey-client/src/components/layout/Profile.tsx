import React from 'react';

interface ProfileProps {
    onClose: () => void;
    user: {
        name: string;
        level: number;
        xp: number;
        maxXp: number;
        gamesPlayed: number;
        won: number;
        chips: number;
        diamonds: number;
    };
}

export const Profile: React.FC<ProfileProps> = ({ onClose, user }) => {
    const winRate = user.gamesPlayed > 0 ? ((user.won / user.gamesPlayed) * 100).toFixed(1) : "0";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in" onClick={onClose}>
            {/* Glass Card Container */}
            <div
                className="w-[420px] glass-panel overflow-hidden transform scale-100 transition-all font-sans relative"
                onClick={e => e.stopPropagation()}
            >
                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-900/80 to-purple-900/80"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/20 hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition"
                >
                    ✕
                </button>

                {/* Content */}
                <div className="relative pt-6 px-8 pb-8">

                    {/* Header Section */}
                    <div className="flex items-end mb-6 relative">
                        {/* Avatar */}
                        <div className="relative z-10 w-24 h-24 rounded-full border-4 border-[#242424] shadow-2xl overflow-hidden bg-gray-800">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="avatar" className="w-full h-full object-cover" />
                        </div>
                        {/* Level Badge */}
                        <div className="absolute left-16 bottom-0 z-20 bg-gradient-to-r from-yellow-600 to-yellow-400 text-black text-xs font-black px-2 py-0.5 rounded shadow-lg border border-white/20">
                            LVL {user.level}
                        </div>

                        {/* Name & Title */}
                        <div className="ml-4 flex-1 pb-1">
                            <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-md">{user.name}</h2>
                            <div className="flex items-center justify-between">
                                <span className="text-blue-300 text-xs font-bold uppercase tracking-wider">Pro Player</span>
                                <button className="text-[10px] bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full border border-white/5 transition">
                                    EDIT PROFILE
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* XP Progress Bar */}
                    <div className="mb-8">
                        <div className="flex justify-between text-[10px] uppercase font-bold text-gray-400 mb-1.5 px-0.5">
                            <span>Experience</span>
                            <span>{user.xp} / {user.maxXp} XP</span>
                        </div>
                        <div className="h-2.5 w-full bg-black/50 rounded-full overflow-hidden shadow-inner border border-white/5">
                            <div
                                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                style={{ width: `${(user.xp / user.maxXp) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-8">
                        <StatBox label="Games" value={user.gamesPlayed} />
                        <StatBox label="Wins" value={user.won} highlight />
                        <StatBox label="Win Rate" value={`${winRate}%`} />
                    </div>

                    {/* Currency Footer */}
                    <div className="bg-black/40 rounded-xl p-4 flex justify-around border border-white/5 shadow-inner">
                        <CurrencyItem icon="💰" value={user.chips} label="Chips" color="text-yellow-400" />
                        <div className="w-px bg-white/10"></div>
                        <CurrencyItem icon="💎" value={user.diamonds} label="Diamonds" color="text-green-400" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatBox = ({ label, value, highlight = false }: { label: string, value: any, highlight?: boolean }) => (
    <div className={`bg-white/5 rounded-2xl p-3 flex flex-col items-center border border-white/5 transition hover:bg-white/10 ${highlight ? 'bg-gradient-to-b from-white/10 to-transparent border-white/10' : ''}`}>
        <span className={`text-2xl font-black ${highlight ? 'text-green-400 filter drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]' : 'text-white'}`}>{value}</span>
        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wide mt-1">{label}</span>
    </div>
);

const CurrencyItem = ({ icon, value, label, color }: { icon: string, value: number, label: string, color: string }) => (
    <div className="flex items-center space-x-3">
        <span className="text-2xl filter drop-shadow-md">{icon}</span>
        <div className="flex flex-col leading-none">
            <span className={`font-mono font-bold text-lg ${color} text-shadow-sm`}>{value.toLocaleString()}</span>
            <span className="text-[9px] text-gray-500 uppercase font-bold mt-0.5">{label}</span>
        </div>
    </div>
);
