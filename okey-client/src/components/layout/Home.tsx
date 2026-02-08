import React, { useState, useEffect } from 'react';
import { socketService } from '../../services/socket';
import { Profile } from './Profile';
import { Settings } from './Settings';

interface HomeProps {
    onStartGame: () => void;
}

export const Home: React.FC<HomeProps> = ({ onStartGame }) => {
    const [showProfile, setShowProfile] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Mock User (In real app, this comes from a Store/Context)
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
        <div className="w-full h-full bg-wood flex flex-col relative overflow-hidden font-sans select-none text-white">
            {/* Ambient Lighting Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.8)_100%)] pointer-events-none"></div>

            {/* Modals */}
            {showProfile && <Profile onClose={() => setShowProfile(false)} user={user} />}
            {showSettings && <Settings onClose={() => setShowSettings(false)} />}

            {/* --- TOP HEADER --- */}
            <div className="relative z-10 w-full px-6 py-4 flex justify-between items-center">

                {/* User Profile Card */}
                <div
                    onClick={() => setShowProfile(true)}
                    className="flex items-center space-x-3 glass-panel px-2 py-1.5 pr-4 rounded-full cursor-pointer hover:bg-white/10 transition group"
                >
                    <div className="w-10 h-10 rounded-full border-2 border-yellow-500 shadow-lg overflow-hidden relative">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="avatar" className="w-full h-full bg-blue-900" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white font-bold text-sm leading-tight group-hover:text-yellow-400 transition">{user.name}</span>
                        <div className="flex items-center space-x-1.5">
                            <span className="text-[10px] text-yellow-500 font-bold bg-black/40 px-1 rounded">LVL {user.level}</span>
                            <div className="w-16 h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/10">
                                <div className="h-full bg-yellow-500 w-[70%]"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Currency Display */}
                <div className="flex items-center space-x-3">
                    <CurrencyPill icon="💰" value={user.chips.toLocaleString()} color="text-yellow-400" />
                    <CurrencyPill icon="💎" value={user.diamonds.toLocaleString()} color="text-green-400" />
                    <button
                        onClick={() => setShowSettings(true)}
                        className="w-10 h-10 glass-panel rounded-full flex items-center justify-center hover:bg-white/10 active:scale-95 transition"
                    >
                        ⚙️
                    </button>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center space-y-10">

                {/* Logo Area */}
                <div className="flex flex-col items-center">
                    <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] tracking-widest font-serif">
                        OKEY<span className="text-yellow-500">PRO</span>
                    </h1>
                    <span className="text-yellow-500/80 tracking-[0.5em] text-xs font-bold mt-2 uppercase">Online Casino Experience</span>
                </div>

                {/* Primary Action */}
                <button
                    onClick={handlePlay}
                    className="group btn-gold relative w-72 h-24 rounded-2xl flex items-center justify-center overflow-hidden"
                >
                    {/* Shine Effect */}
                    <div className="shine absolute inset-0"></div>

                    <div className="relative z-10 flex items-center">
                        <span className="text-4xl mr-4 drop-shadow-md group-hover:scale-110 transition">🚀</span>
                        <div className="flex flex-col items-start">
                            <span className="text-2xl font-black text-[#3E2723] leading-none tracking-wide text-shadow-sm">HEMEN OYNA</span>
                            <span className="text-xs font-bold text-[#5D4037] tracking-wider uppercase mt-1">Sıra Beklemeden</span>
                        </div>
                    </div>
                </button>

                {/* Secondary Actions */}
                <div className="flex space-x-6">
                    <SecondaryAction icon="🎰" label="Salon Seç" />
                    <SecondaryAction icon="👥" label="Arkadaşınla" />
                </div>
            </div>

            {/* --- BOTTOM DOCK --- */}
            <div className="relative z-10 w-full px-6 pb-6">
                <div className="glass-panel mx-auto max-w-2xl px-8 py-4 flex justify-between items-center rounded-2xl shadow-2xl bg-[#0f0f0f]/80">
                    <NavItem icon="🏠" label="Lobi" active />
                    <NavItem icon="🏆" label="Sıralama" />
                    <div className="w-16"></div> {/* Spacer for Play button if needed, or just balance */}
                    <NavItem icon="🎁" label="Market" badge="Free" />
                    <NavItem icon="🎒" label="Çanta" />
                </div>
            </div>
        </div>
    );
};

// Sub-components

const CurrencyPill: React.FC<{ icon: string, value: string, color: string }> = ({ icon, value, color }) => (
    <div className="flex items-center bg-black/60 border border-white/5 px-3 py-1.5 rounded-full shadow-inner">
        <span className="text-lg mr-2 filter drop-shadow">{icon}</span>
        <span className={`font-mono font-bold ${color} text-sm tracking-wide`}>{value}</span>
        <div className="ml-2 w-5 h-5 bg-yellow-600/20 border border-yellow-500/50 rounded-full flex items-center justify-center text-yellow-500 font-bold text-xs cursor-pointer hover:bg-yellow-500 hover:text-black transition">+</div>
    </div>
);

const SecondaryAction: React.FC<{ icon: string, label: string }> = ({ icon, label }) => (
    <button className="w-28 h-24 glass-panel rounded-xl flex flex-col items-center justify-center hover:bg-white/5 active:scale-95 transition group border border-white/5 hover:border-white/20">
        <span className="text-3xl mb-2 group-hover:scale-110 group-hover:rotate-12 transition duration-300 filter drop-shadow-lg">{icon}</span>
        <span className="text-gray-300 font-bold text-xs uppercase tracking-wide group-hover:text-white transition">{label}</span>
    </button>
);

const NavItem: React.FC<{ icon: string, label: string, active?: boolean, badge?: string }> = ({ icon, label, active, badge }) => (
    <div className={`group flex flex-col items-center cursor-pointer transition relative ${active ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}>
        <div className={`p-2 rounded-xl transition ${active ? 'bg-white/10' : 'group-hover:bg-white/5'}`}>
            <span className={`text-2xl block transition ${active ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]' : 'group-hover:scale-110'}`}>{icon}</span>
        </div>
        {badge && (
            <div className="absolute -top-1 right-0 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm border border-black/20 animate-bounce">
                {badge}
            </div>
        )}
        <span className={`text-[10px] font-bold mt-1 uppercase tracking-wider ${active ? 'text-yellow-400' : 'text-gray-400 group-hover:text-gray-200'}`}>
            {label}
        </span>
    </div>
);
