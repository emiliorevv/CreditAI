import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';


export function AiAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');

    // Vercel AI SDK Hook
    const { session } = useAuth(); // Import useAuth
    const { messages, status, sendMessage } = useChat({
        transport: new DefaultChatTransport({
            api: '/api/chat',
            ...(session?.access_token ? {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            } : {})
        }),
        onError: (error: Error) => {
            console.error('Chat Error:', error);
            alert('Failed to send message. Check console.');
        }
    });

    const isLoading = status === 'streaming' || status === 'submitted';

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input;
        setInput(''); // Clear input immediately

        await sendMessage({
            text: userMessage
        });
    };

    return (
        <>
            {/* Floating FAB */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl transition-all duration-300 z-50 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100 bg-white hover:bg-neutral-100 hover:scale-110'
                    }`}
            >
                <Sparkles className="w-6 h-6 text-indigo-600" />
            </button>

            {/* Chat Window */}
            {
                isOpen && (
                    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-10">
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 border-b border-white/5 flex justify-between items-center backdrop-blur-md">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-indigo-400" />
                                <h3 className="font-bold text-white">Credit AI Agent</h3>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-neutral-400" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {messages.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500 space-y-2">
                                    <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
                                    <p className="text-lg font-medium text-white/50">How can I help you today?</p>
                                    <p className="text-sm">Ask about your card benefits or get financial advice.</p>
                                </div>
                            )}

                            {messages.map((m: any) => {
                                return (
                                    <div
                                        key={m.id}
                                        className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${m.role === 'user'
                                                ? 'bg-indigo-600 text-white rounded-br-none'
                                                : 'bg-white/10 text-neutral-200 rounded-bl-none border border-white/5'
                                                }`}
                                        >
                                            {m.content}
                                            {(!m.content && m.parts) && m.parts.map((p: any, idx: number) => {
                                                if (p.type === 'text') return <span key={idx}>{p.text}</span>;
                                                if (p.type === 'reasoning') return <span key={idx} className="text-neutral-400 italic block border-l-2 border-neutral-600 pl-2 my-1">{p.text}</span>;
                                                return null;
                                            })}
                                        </div>
                                    </div>
                                );
                            })}

                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white/5 p-3 rounded-2xl rounded-bl-none flex gap-1 items-center">
                                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSubmit} className="p-4 border-t border-white/5 bg-neutral-900/50 backdrop-blur-md">
                            <div className="relative flex items-center">
                                <input
                                    value={input}
                                    onChange={handleInputChange}
                                    placeholder="Type a message..."
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-neutral-600"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !input.trim()}
                                    className="absolute right-2 p-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-4 h-4 text-white" />
                                </button>
                            </div>
                        </form>
                    </div>
                )
            }
        </>
    );
}
