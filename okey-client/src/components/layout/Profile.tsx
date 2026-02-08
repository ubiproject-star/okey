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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="w-[400px] bg-[#1E1E1E] rounded-3xl border border-white/10 shadow-2xl overflow-hidden transform scale-100 transition-all font-sans" onClick={e => e.stopPropagation()}>
                {/* Header / Banner */}
                <div className="h-32 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white text-xl">✕</button>
                </div>

                {/* Avatar & Info */}
                <div className="relative px-6 pb-6">
                    <div className="absolute -top-12 left-6 w-24 h-24 rounded-full border-4 border-[#1E1E1E] bg-blue-600 flex items-center justify-center shadow-lg">
                        <span className="text-3xl text-white font-bold">{user.name.substring(0, 2).toUpperCase()}</span>
                        <div className="absolute bottom-0 right-0 w-6 h-6 bg-yellow-500 rounded-full border-2 border-[#1E1E1E] flex items-center justify-center text-[10px] font-bold text-black">
                            {user.level}
                        </div>
                    </div>

                    <div className="ml-28 pt-2 flex justify-between items-end">
                        <div className="flex flex-col">
                            <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                            <span className="text-blue-400 text-xs font-bold uppercase tracking-wider">Profesyonel Oyuncu</span>
                        </div>
                        <button className="bg-yellow-600 px-4 py-1.5 rounded-full text-xs font-bold text-white hover:bg-yellow-500 transition">Düzenle</button>
                    </div>

                    {/* Stats Grid */}
                    <div className="mt-8 grid grid-cols-3 gap-3">
                        <StatBox label="Oyun" value={user.gamesPlayed} />
                        <StatBox label="Kazanma" value={user.won} color="text-green-400" />
                        <StatBox label="Oran" value={`%${winRate}`} />
                    </div>

                    {/* XP Progress */}
                    <div className="mt-6">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Seviye {user.level}</span>
                            <span>{user.xp} / {user.maxXp} XP</span>
                        </div>
                        <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                            <div
                                className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400"
                                style={{ width: `${(user.xp / user.maxXp) * 100}%` }}
                            ></div>
                        </div>
                        <p className="mt-2 text-[10px] text-gray-500 text-center">Bir sonraki seviye için 450 XP gerekiyor.</p>
                    </div>
                </div>

                {/* Footer Currency */}
                <div className="bg-black/40 p-4 flex justify-around border-t border-white/5">
                    <CurrencyItem icon="💰" value={user.chips} label="Çip" />
                    <CurrencyItem icon="💎" value={user.diamonds} label="Elmas" />
                </div>
            </div>
        </div>
    );
};

const StatBox = ({ label, value, color = "text-white" }: { label: string, value: any, color?: string }) => (
    <div className="bg-white/5 rounded-xl p-3 flex flex-col items-center">
        <span className={`text-xl font-bold ${color}`}>{value}</span>
        <span className="text-[10px] text-gray-400 uppercase">{label}</span>
    </div>
);

const CurrencyItem = ({ icon, value, label }: { icon: string, value: number, label: string }) => (
    <div className="flex items-center space-x-2">
        <span className="text-xl">{icon}</span>
        <div className="flex flex-col leading-none">
            <span className="text-white font-bold">{value.toLocaleString()}</span>
            <span className="text-[10px] text-gray-500 uppercase">{label}</span>
        </div>
    </div>
);
