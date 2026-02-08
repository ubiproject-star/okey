import React from 'react';
import { socketService } from '../../services/socket';

interface HomeProps {
    onStartGame: () => void;
}

import { Profile } from './Profile';
import { Settings } from './Settings';

export const Home: React.FC<HomeProps> = ({ onStartGame }) => {
    const [showProfile, setShowProfile] = React.useState(false);
    const [showSettings, setShowSettings] = React.useState(false);

    // Mock User
    const user = {
        name: "Misafir_99",
        level: 12,
        xp: 1050,
        maxXp: 1500,
        gamesPlayed: 142,
        won: 68,
        chips: 25400,
        diamonds: 120
    };

    const handlePlay = () => {
        socketService.connect();
        socketService.emit('join_queue', { name: user.name, mmr: 1000 });
        onStartGame();
    };

    return (
        <div className="w-full h-full bg-[#121212] flex flex-col relative overflow-hidden font-sans select-none">
            {/* Background Image (Dark Wood / Felt) */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-felt.png')] opacity-40"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80 pointer-events-none"></div>

            {/* Modals */}
            {showProfile && <Profile onClose={() => setShowProfile(false)} user={user} />}
            {showSettings && <Settings onClose={() => setShowSettings(false)} />}

            {/* --- TOP BAR (User Info & Currency) --- */}
            <div className="relative z-10 w-full px-6 py-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
                {/* User Profile */}
                <div className="flex items-center space-x-3">
                    <div onClick={() => setShowProfile(true)} className="flex items-center space-x-3 bg-black/40 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md cursor-pointer hover:bg-black/60 transition">
                        <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-white shadow-lg overflow-hidden relative">
                            {/* Placeholder Avatar */}
                            <div className="absolute inset-0 flex items-center justify-center font-bold text-white">ME</div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-bold text-sm leading-tight">Misafir_99</span>
                            <div className="flex items-center space-x-1">
                                <span className="text-[10px] text-yellow-400 font-bold">LVL 12</span>
                                <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-yellow-500 w-[60%]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Currency */}
                <div className="flex items-center space-x-4">
                    <div className="flex items-center bg-black/40 px-3 py-1.5 rounded-full border border-yellow-500/30 backdrop-blur-md">
                        <span className="text-xl mr-2">💰</span>
                        <span className="text-yellow-100 font-bold font-mono">25,400</span>
                        <div className="ml-2 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-xs cursor-pointer hover:scale-110 transition">+</div>
                    </div>
                    <div className="flex items-center bg-black/40 px-3 py-1.5 rounded-full border border-green-500/30 backdrop-blur-md">
                        <span className="text-xl mr-2">💎</span>
                        <span className="text-green-100 font-bold font-mono">120</span>
                        <div className="ml-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-black font-bold text-xs cursor-pointer hover:scale-110 transition">+</div>
                    </div>
                </div>
            </div>

            {/* --- CENTER CONTENT (Play Options) --- */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center space-y-8">

                {/* Logo Subtle */}
                <h2 className="text-3xl font-black text-white/10 tracking-[1em] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -z-10 select-none pointer-events-none">
                    OKEYPRO
                </h2>

                {/* Play Button (Hero) */}
                <button
                    onClick={handlePlay}
                    className="group relative w-64 h-24 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-2xl shadow-[0_10px_40px_rgba(255,193,7,0.4)] flex items-center justify-center transform hover:scale-105 active:scale-95 transition duration-200 border-t border-yellow-200"
                >
                    <div className="absolute inset-0 bg-yellow-300 opacity-20 blur-xl group-hover:opacity-40 transition animate-pulse"></div>
                    <span className="text-3xl mr-3">🚀</span>
                    <div className="text-left">
                        <div className="text-white font-black text-2xl leading-none drop-shadow-sm">HEMEN OYNA</div>
                        <div className="text-yellow-900 font-bold text-xs tracking-wider opacity-70">SIRA BEKLEMEDEN</div>
                    </div>
                </button>

                {/* Secondary Modes */}
                <div className="flex space-x-4">
                    <button className="w-32 h-24 bg-[#1E1E1E] border border-white/5 rounded-xl flex flex-col items-center justify-center hover:bg-[#252525] transition active:scale-95 group">
                        <span className="text-2xl mb-2 group-hover:scale-110 transition">🎰</span>
                        <span className="text-gray-300 font-bold text-sm">Salon Seç</span>
                    </button>
                    <button className="w-32 h-24 bg-[#1E1E1E] border border-white/5 rounded-xl flex flex-col items-center justify-center hover:bg-[#252525] transition active:scale-95 group">
                        <span className="text-2xl mb-2 group-hover:scale-110 transition">👥</span>
                        <span className="text-gray-300 font-bold text-sm">Arkadaşınla</span>
                    </button>
                </div>
            </div>

            {/* --- BOTTOM DOCK --- */}
            <div className="relative z-10 w-full px-8 pb-6 pt-2">
                <div className="bg-[#1A1A1A]/90 backdrop-blur-xl border border-white/5 rounded-2xl px-6 py-3 flex justify-between items-center shadow-2xl">
                    <NavItem icon="🏠" label="Lobi" active />
                    <NavItem icon="🛒" label="Market" />
                    <NavItem icon="📅" label="Görevler" badge="2" />
                    <NavItem icon="🏆" label="Sıralama" />
                    <NavItem icon="🥯" label="Çark" />
                </div>
            </div>
        </div>
    );
};

const NavItem: React.FC<{ icon: string, label: string, active?: boolean, badge?: string }> = ({ icon, label, active, badge }) => (
    <div className={`flex flex-col items-center cursor-pointer transition ${active ? 'opacity-100 scale-110' : 'opacity-50 hover:opacity-80'}`}>
        <div className="relative">
            <span className="text-2xl mb-1 block">{icon}</span>
            {badge && <div className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">{badge}</div>}
        </div>
        <span className={`text-[10px] font-bold ${active ? 'text-yellow-400' : 'text-gray-400'}`}>{label}</span>
    </div>
);
