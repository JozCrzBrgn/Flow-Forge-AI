import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Send, Bot, User, Loader2, Zap, LogOut } from "lucide-react";

export default function Chat({ workflow, setWorkflow, token, onLogout }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = input.trim();
        setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
        setInput("");
        setIsLoading(true);

        try {
            const API_URL = import.meta.env.VITE_API_URL || "https://noble-vibrancy-production-25bb.up.railway.app";
            const res = await axios.post(`${API_URL}/v2/chat`, {
                message: userMsg,
                workflow: workflow,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.data.workflow) {
                setWorkflow(res.data.workflow);
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "assistant",
                        content:
                            "✨ Workflow successfully updated based on your requirements.",
                    },
                ]);
            }
        } catch (err) {
            if (err.response?.status === 401) {
                onLogout();
            } else {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "assistant",
                        content: "❌ Connection error. Please try again.",
                    },
                ]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center p-6 bg-[#050507] font-sans overflow-hidden">

            {/* Glow background */}
            <div className="absolute inset-0 -z-10 blur-3xl opacity-20 bg-gradient-to-r from-[#3657E2] to-[#1CCDEF]"></div>

            {/* Container */}
            <div className="w-full max-w-4xl h-[85vh] flex flex-col rounded-2xl bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.6)] overflow-hidden">

                {/* Header */}
                <div className="px-6 py-4 border-b border-white/10 bg-black/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-[#3657E2] to-[#1CCDEF] text-white shadow-lg shadow-[#3657E2]/40">
                            <Zap size={18} />
                        </div>
                        <div>
                            <h3 className="text-white text-sm font-semibold tracking-wide">
                                FlowForge AI
                            </h3>
                            <p className="text-xs text-gray-400">
                                Intelligent workflow automation
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-xs px-3 py-1 bg-white/5 border border-white/10 rounded-full text-gray-400">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            Online
                        </div>
                        <button
                            onClick={onLogout}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-colors"
                            title="Cerrar Sesión"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4 opacity-70">
                            <Bot size={42} />
                            <p className="text-sm">
                                Describe the workflow you want to automate...
                            </p>
                        </div>
                    )}

                    {messages.map((m, i) => (
                        <div
                            key={i}
                            className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"
                                } animate-fadeIn`}
                        >
                            {m.role === "assistant" && (
                                <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                                    <Bot size={14} />
                                </div>
                            )}

                            <div
                                className={`max-w-[80%] px-5 py-3 text-sm leading-relaxed ${m.role === "user"
                                    ? "bg-gradient-to-br from-[#3657E2] to-[#1CCDEF] text-white rounded-2xl rounded-tr-sm shadow-[0_8px_30px_rgba(54,87,226,0.35)]"
                                    : "bg-white/[0.06] border border-white/10 text-gray-200 rounded-2xl rounded-tl-sm backdrop-blur-md"
                                    }`}
                            >
                                {m.content}
                            </div>

                            {m.role === "user" && (
                                <div className="w-8 h-8 rounded-full bg-[#3657E2]/20 border border-[#3657E2]/30 flex items-center justify-center">
                                    <User size={14} className="text-[#1CCDEF]" />
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Loader */}
                    {isLoading && (
                        <div className="flex gap-3 animate-pulse">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                <Bot size={14} />
                            </div>
                            <div className="bg-white/[0.06] border border-white/10 text-gray-400 rounded-2xl px-5 py-3 flex items-center gap-2">
                                <Loader2 size={14} className="animate-spin" />
                                Analyzing workflow with AI...
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-xl">
                    <div className="flex items-end gap-3 relative">

                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={1}
                            placeholder="Example: Create a CI/CD pipeline with FastAPI and Docker..."
                            className="w-full resize-none max-h-32 min-h-[52px] bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1CCDEF]/40"
                        />

                        <button
                            onClick={sendMessage}
                            disabled={!input.trim() || isLoading}
                            className="absolute right-2 bottom-2 p-2 rounded-lg bg-gradient-to-br from-[#3657E2] to-[#1CCDEF] hover:opacity-90 text-white shadow-lg shadow-[#3657E2]/30 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Send size={18} />
                            )}
                        </button>
                    </div>

                    <div className="text-center mt-2 text-[10px] text-gray-600">
                        Enter to send · Shift + Enter for new line
                    </div>
                </div>
            </div>

            {/* Animations + Scrollbar */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255,255,255,0.2);
                }

                .animate-fadeIn {
                    animation: fadeIn 0.3s ease;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}