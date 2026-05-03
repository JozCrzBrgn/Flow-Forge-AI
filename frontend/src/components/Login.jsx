import { useState } from "react";
import axios from "axios";
import { Zap, Loader2, Lock, User as UserIcon } from "lucide-react";

export default function Login({ onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const formData = new URLSearchParams();
            formData.append("username", username);
            formData.append("password", password);

            const API_URL = import.meta.env.VITE_API_URL || "https://noble-vibrancy-production-25bb.up.railway.app/";
            const res = await axios.post(`${API_URL}/token`, formData, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });

            if (res.data.access_token) {
                onLogin(res.data.access_token);
            }
        } catch (err) {
            setError("Usuario o contraseña incorrectos");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center p-6 bg-[#050507] font-sans overflow-hidden">
            {/* Glow background */}
            <div className="absolute inset-0 -z-10 blur-3xl opacity-20 bg-gradient-to-r from-[#3657E2] to-[#1CCDEF]"></div>

            {/* Container */}
            <div className="w-full max-w-md p-8 flex flex-col rounded-2xl bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.6)] relative z-10">
                <div className="flex justify-center mb-6">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-[#3657E2] to-[#1CCDEF] text-white shadow-lg shadow-[#3657E2]/40">
                        <Zap size={32} />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-center text-white mb-2 tracking-wide">Bienvenido a FlowForge</h2>
                <p className="text-gray-400 text-center mb-8 text-sm">Ingresa tus credenciales para continuar</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400 ml-1">Usuario</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                <UserIcon size={18} />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1CCDEF]/40 transition-all"
                                placeholder="tu-usuario"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-gray-400 ml-1">Contraseña</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1CCDEF]/40 transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center animate-fadeIn">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || !username || !password}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-[#3657E2] to-[#1CCDEF] hover:opacity-90 text-white font-medium shadow-lg shadow-[#3657E2]/30 disabled:opacity-50 transition-all flex justify-center items-center gap-2 mt-4"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                <span>Verificando...</span>
                            </>
                        ) : (
                            <span>Iniciar Sesión</span>
                        )}
                    </button>
                </form>
            </div>

            <style>{`
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-5px);
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
