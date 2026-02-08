import React, { useState, useEffect, useRef } from 'react';
import { socketService } from '../../services/socket';

interface ChatMessage {
    id: string;
    sender: string;
    text: string;
    timestamp: number;
    isSystem?: boolean;
}

export const Chat: React.FC<{ roomId: string }> = ({ roomId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        socketService.on('chat_message', (msg: ChatMessage) => {
            setMessages(prev => [...prev, msg]);
        });

        // Add some dummy messages for "clone" feel if empty
        if (messages.length === 0) {
            setMessages([
                { id: 'sys1', sender: 'System', text: 'Masaya hoşgeldiniz!', timestamp: Date.now(), isSystem: true },
            ]);
        }

        return () => {
            socketService.off('chat_message');
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const msg = {
            roomId,
            text: inputText,
            // sender, timestamp will be added by server or optimistic here
        };

        // Optimistic update
        const optimisticMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: 'ME',
            text: inputText,
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, optimisticMsg]);

        socketService.emit('send_chat', msg);
        setInputText('');
    };

    return (
        <div className={`fixed bottom-4 left-4 z-50 transition-all duration-300 ${isOpen ? 'w-80 h-96' : 'w-16 h-16'}`}>
            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/20 shadow-2xl hover:scale-110 transition group"
                >
                    <span className="text-3xl group-hover:rotate-12 transition">💬</span>
                    {messages.length > 1 && (
                        <div className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold animate-bounce">
                            {messages.length - 1}
                        </div>
                    )}
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="w-full h-full bg-[#1A1A1A]/90 backdrop-blur-xl rounded-2xl flex flex-col border border-white/10 shadow-2xl overflow-hidden font-sans">
                    {/* Header */}
                    <div className="p-3 bg-black/40 flex justify-between items-center border-b border-white/5 cursor-pointer" onClick={() => setIsOpen(false)}>
                        <h3 className="text-white font-bold text-sm">Sohbet</h3>
                        <button className="text-gray-400 hover:text-white">▼</button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-gray-600">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex flex-col ${msg.sender === 'ME' ? 'items-end' : 'items-start'}`}>
                                {!msg.isSystem && (
                                    <span className="text-[10px] text-gray-400 mb-0.5 ml-1">{msg.sender === 'ME' ? 'Ben' : msg.sender}</span>
                                )}
                                <div className={`
                                    max-w-[85%] px-3 py-2 rounded-xl text-sm
                                    ${msg.isSystem ? 'bg-yellow-500/20 text-yellow-200 text-center w-full' :
                                        msg.sender === 'ME' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}
                                `}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-3 bg-black/40 border-t border-white/5 flex gap-2">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Bir şeyler yaz..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50 transition"
                        />
                        <button
                            type="submit"
                            className="w-9 h-9 bg-yellow-600 rounded-full flex items-center justify-center text-white hover:bg-yellow-500 transition shadow-lg"
                        >
                            ➤
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};
