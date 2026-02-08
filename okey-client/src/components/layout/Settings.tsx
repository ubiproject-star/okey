import React from 'react';
import { useGameStore } from '../../store/gameStore';

interface SettingsProps {
    onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onClose }) => {
    // In a real app, these would be in a persistent store (localStorage/Zustand)
    const [soundEnabled, setSoundEnabled] = React.useState(true);
    const [vibrationEnabled, setVibrationEnabled] = React.useState(true);
    const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="w-[350px] bg-[#222] rounded-2xl border border-white/10 shadow-2xl overflow-hidden font-sans" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-[#333] px-6 py-4 flex justify-between items-center border-b border-white/5">
                    <h2 className="text-white font-bold text-lg">Ayarlar</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <ToggleItem
                        label="Ses Efektleri"
                        icon="🔊"
                        checked={soundEnabled}
                        onChange={setSoundEnabled}
                    />
                    <ToggleItem
                        label="Titreşim"
                        icon="📳"
                        checked={vibrationEnabled}
                        onChange={setVibrationEnabled}
                    />
                    <ToggleItem
                        label="Bildirimler"
                        icon="🔔"
                        checked={notificationsEnabled}
                        onChange={setNotificationsEnabled}
                    />

                    {/* Account Settings */}
                    <div className="pt-4 border-t border-white/5">
                        <button className="w-full py-3 bg-red-600/20 text-red-400 rounded-xl font-bold hover:bg-red-600/30 transition">
                            Çıkış Yap
                        </button>
                    </div>
                </div>

                <div className="bg-[#111] py-3 text-center text-xs text-gray-500">
                    Okey Pro v2.0.4 - ID: 894321
                </div>
            </div>
        </div>
    );
};

const ToggleItem = ({ label, icon, checked, onChange }: { label: string, icon: string, checked: boolean, onChange: (val: boolean) => void }) => (
    <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
            <span className="text-xl">{icon}</span>
            <span className="text-gray-200 font-medium">{label}</span>
        </div>
        <button
            onClick={() => onChange(!checked)}
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${checked ? 'bg-green-500' : 'bg-gray-600'}`}
        >
            <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0'}`}></div>
        </button>
    </div>
);
