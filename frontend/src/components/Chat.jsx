import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import {
    Send, Bot, User, Loader2, Zap, LogOut,
    GitBranch, Pencil, Check, Plus, FolderOpen,
    ChevronRight, Clock, X, AlignLeft
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "https://noble-vibrancy-production-25bb.up.railway.app";

// ─── Inline editable field ────────────────────────────────────────────────────
function EditableField({ value, onSave, placeholder = "Click to edit", className = "", multiline = false }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);
    const ref = useRef(null);

    useEffect(() => { setDraft(value); }, [value]);
    useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);

    const commit = () => {
        const trimmed = draft.trim();
        setEditing(false);
        if (trimmed !== value) onSave(trimmed);
    };

    const onKeyDown = (e) => {
        if (e.key === "Enter" && (!multiline || !e.shiftKey)) { e.preventDefault(); commit(); }
        if (e.key === "Escape") { setDraft(value); setEditing(false); }
    };

    if (!editing) {
        return (
            <div
                className={`group flex items-center gap-1.5 cursor-pointer ${className}`}
                onClick={() => setEditing(true)}
            >
                <span className={value ? "" : "text-gray-600 italic"}>{value || placeholder}</span>
                <Pencil size={11} className="text-gray-600 group-hover:text-[#1CCDEF] transition-colors shrink-0" />
            </div>
        );
    }

    const sharedClass = "bg-white/10 border border-white/20 rounded-md px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#1CCDEF]/60 text-white";

    return (
        <div className="flex items-center gap-1">
            {multiline ? (
                <textarea
                    ref={ref}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={onKeyDown}
                    onBlur={commit}
                    rows={2}
                    className={`${sharedClass} resize-none w-64 text-xs`}
                />
            ) : (
                <input
                    ref={ref}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={onKeyDown}
                    onBlur={commit}
                    className={`${sharedClass} w-52 text-sm font-semibold`}
                />
            )}
            <button onClick={commit} className="text-[#1CCDEF] hover:text-white transition-colors">
                <Check size={14} />
            </button>
        </div>
    );
}

// ─── Workflow Selector Screen ─────────────────────────────────────────────────
function WorkflowSelector({ token, onSelect, onNew }) {
    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios
            .get(`${API_URL}/v2/workflows`, { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => setWorkflows(r.data.workflows || []))
            .catch(() => setError("Could not load workflows."))
            .finally(() => setLoading(false));
    }, [token]);

    const fmt = (iso) => {
        if (!iso) return "";
        return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    };

    return (
        <div className="flex flex-col h-full">
            <div className="px-8 pt-8 pb-4">
                <h2 className="text-white text-lg font-semibold tracking-wide">Your Workflows</h2>
                <p className="text-gray-500 text-xs mt-1">Select one to continue or start fresh.</p>
            </div>

            <div className="px-8 mb-4">
                <button
                    onClick={onNew}
                    className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl border border-dashed border-[#3657E2]/50 hover:border-[#1CCDEF]/70 bg-[#3657E2]/5 hover:bg-[#1CCDEF]/5 text-[#1CCDEF] text-sm font-medium transition-all group"
                >
                    <Plus size={16} className="group-hover:rotate-90 transition-transform duration-200" />
                    New Workflow
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-2 custom-scrollbar">
                {loading && (
                    <div className="flex items-center justify-center py-12 text-gray-500">
                        <Loader2 size={20} className="animate-spin mr-2" /> Loading…
                    </div>
                )}
                {error && <div className="text-red-400 text-sm text-center py-8">{error}</div>}
                {!loading && !error && workflows.length === 0 && (
                    <div className="text-gray-600 text-sm text-center py-12">
                        No workflows yet. Create your first one!
                    </div>
                )}
                {workflows.map((wf) => (
                    <button
                        key={wf.id}
                        onClick={() => onSelect(wf)}
                        className="w-full flex items-center justify-between px-5 py-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.07] hover:border-white/20 transition-all group text-left"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 rounded-lg bg-[#3657E2]/10 group-hover:bg-[#3657E2]/20 transition-colors shrink-0">
                                <FolderOpen size={14} className="text-[#1CCDEF]" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-white text-sm font-medium truncate">{wf.name}</p>
                                {wf.description && (
                                    <p className="text-gray-500 text-xs truncate mt-0.5 max-w-xs">{wf.description}</p>
                                )}
                                <p className="text-gray-600 text-xs flex items-center gap-1 mt-0.5">
                                    <Clock size={10} /> {fmt(wf.updated_at)}
                                </p>
                            </div>
                        </div>
                        <ChevronRight size={14} className="text-gray-600 group-hover:text-[#1CCDEF] shrink-0 transition-colors" />
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── Chat Screen ──────────────────────────────────────────────────────────────
function ChatScreen({
    token, username, onLogout, onGoRegister,
    workflow, setWorkflow,
    initialWorkflowId, initialWorkflowName, initialVersionNumber, initialDescription,
    onBack,
}) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [workflowId, setWorkflowId] = useState(initialWorkflowId ?? null);
    const [versionNumber, setVersionNumber] = useState(initialVersionNumber ?? null);
    const [workflowName, setWorkflowName] = useState(initialWorkflowName ?? "Untitled Workflow");
    const [description, setDescription] = useState(initialDescription ?? "");

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(() => { scrollToBottom(); }, [messages, isLoading]);

    // Save name or description to the backend (only if workflow already exists)
    const persistMeta = useCallback(async (patch) => {
        if (!workflowId) return; // will be created on first chat message
        try {
            await axios.patch(`${API_URL}/v2/workflows/${workflowId}`, patch, {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (err) {
            console.error("Failed to save workflow metadata:", err);
        }
    }, [workflowId, token]);

    const handleNameSave = (newName) => {
        const name = newName || "Untitled Workflow";
        setWorkflowName(name);
        persistMeta({ name });
    };

    const handleDescriptionSave = (newDesc) => {
        setDescription(newDesc);
        persistMeta({ description: newDesc });
    };

    const sendMessage = async () => {
        if (!input.trim()) return;
        const userMsg = input.trim();
        setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
        setInput("");
        setIsLoading(true);

        try {
            const body = {
                message: userMsg,
                workflow: workflow,
                name: workflowName,
                ...(workflowId && { workflow_id: workflowId }),
            };

            const res = await axios.post(`${API_URL}/v2/chat`, body, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.workflow) {
                setWorkflow(res.data.workflow);
                if (res.data.workflow_id) setWorkflowId(res.data.workflow_id);
                if (res.data.version_number != null) setVersionNumber(res.data.version_number);

                setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: `✨ Workflow updated — version ${res.data.version_number ?? "?"}.` },
                ]);
            }
        } catch (err) {
            if (err.response?.status === 401) onLogout();
            else setMessages((prev) => [...prev, { role: "assistant", content: "❌ Connection error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 bg-black/30 flex items-start justify-between shrink-0 gap-4">
                <div className="flex items-start gap-3 min-w-0">
                    {/* Back */}
                    <button
                        onClick={onBack}
                        className="mt-0.5 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-colors shrink-0"
                        title="All Workflows"
                    >
                        <X size={14} />
                    </button>

                    <div className="p-2 rounded-xl bg-gradient-to-br from-[#3657E2] to-[#1CCDEF] text-white shadow-lg shadow-[#3657E2]/40 shrink-0">
                        <Zap size={18} />
                    </div>

                    {/* Name + Description stacked */}
                    <div className="min-w-0">
                        <EditableField
                            value={workflowName}
                            onSave={handleNameSave}
                            placeholder="Untitled Workflow"
                            className="text-white text-sm font-semibold tracking-wide"
                        />
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <AlignLeft size={10} className="text-gray-600 shrink-0" />
                            <EditableField
                                value={description}
                                onSave={handleDescriptionSave}
                                placeholder="Add a description…"
                                className="text-gray-400 text-xs"
                                multiline
                            />
                        </div>
                    </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-3 shrink-0">
                    {versionNumber != null && (
                        <div className="flex items-center gap-1.5 text-xs px-3 py-1 bg-white/5 border border-white/10 rounded-full text-gray-400">
                            <GitBranch size={11} /> v{versionNumber}
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-xs px-3 py-1 bg-white/5 border border-white/10 rounded-full text-gray-400">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        Online
                    </div>
                    {username === "admin" && (
                        <button
                            onClick={onGoRegister}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-[#1CCDEF] transition-colors"
                            title="Register New User"
                        >
                            <User size={16} />
                        </button>
                    )}
                    <button
                        onClick={onLogout}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-colors"
                        title="Sign out"
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
                        <p className="text-sm">Describe the workflow you want to automate...</p>
                    </div>
                )}

                {messages.map((m, i) => (
                    <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}>
                        {m.role === "assistant" && (
                            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                                <Bot size={14} />
                            </div>
                        )}
                        <div className={`max-w-[80%] px-5 py-3 text-sm leading-relaxed ${m.role === "user"
                            ? "bg-gradient-to-br from-[#3657E2] to-[#1CCDEF] text-white rounded-2xl rounded-tr-sm shadow-[0_8px_30px_rgba(54,87,226,0.35)]"
                            : "bg-white/[0.06] border border-white/10 text-gray-200 rounded-2xl rounded-tl-sm backdrop-blur-md"
                        }`}>
                            {m.content}
                        </div>
                        {m.role === "user" && (
                            <div className="w-8 h-8 rounded-full bg-[#3657E2]/20 border border-[#3657E2]/30 flex items-center justify-center shrink-0">
                                <User size={14} className="text-[#1CCDEF]" />
                            </div>
                        )}
                    </div>
                ))}

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
            <div className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-xl shrink-0">
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
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                </div>
                <div className="text-center mt-2 text-[10px] text-gray-600">
                    Enter to send · Shift + Enter for new line
                </div>
            </div>
        </div>
    );
}

// ─── Root Component ───────────────────────────────────────────────────────────
export default function Chat({ workflow, setWorkflow, token, username, onLogout, onGoRegister }) {
    const [screen, setScreen] = useState("selector");
    const [activeWorkflow, setActiveWorkflow] = useState(null);

    const handleSelectExisting = useCallback(async (wf) => {
        try {
            const res = await axios.get(`${API_URL}/v2/workflows/${wf.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = res.data;
            if (data.workflow) setWorkflow(data.workflow);
            setActiveWorkflow({
                id: data.workflow_id,
                name: data.name,
                description: data.description ?? "",
                versionNumber: data.version_number,
            });
        } catch {
            setActiveWorkflow({ id: wf.id, name: wf.name, description: wf.description ?? "", versionNumber: null });
        }
        setScreen("chat");
    }, [token, setWorkflow]);

    const handleNew = useCallback(() => {
        setWorkflow({ nodes: [], edges: [] });
        setActiveWorkflow(null);
        setScreen("chat");
    }, [setWorkflow]);

    return (
        <div className="relative min-h-screen flex items-center justify-center p-6 bg-[#050507] font-sans overflow-hidden">
            <div className="absolute inset-0 -z-10 blur-3xl opacity-20 bg-gradient-to-r from-[#3657E2] to-[#1CCDEF]" />

            <div className="w-full max-w-4xl h-[85vh] flex flex-col rounded-2xl bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.6)] overflow-hidden">

                {screen === "selector" && (
                    <>
                        <div className="px-6 py-4 border-b border-white/10 bg-black/30 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-[#3657E2] to-[#1CCDEF] text-white shadow-lg shadow-[#3657E2]/40">
                                    <Zap size={18} />
                                </div>
                                <div>
                                    <h3 className="text-white text-sm font-semibold tracking-wide">FlowForge AI</h3>
                                    <p className="text-xs text-gray-400">Intelligent workflow automation</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {username === "admin" && (
                                    <button onClick={onGoRegister} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-[#1CCDEF] transition-colors" title="Register New User">
                                        <User size={16} />
                                    </button>
                                )}
                                <button onClick={onLogout} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-colors" title="Sign out">
                                    <LogOut size={16} />
                                </button>
                            </div>
                        </div>
                        <WorkflowSelector token={token} onSelect={handleSelectExisting} onNew={handleNew} />
                    </>
                )}

                {screen === "chat" && (
                    <ChatScreen
                        token={token}
                        username={username}
                        onLogout={onLogout}
                        onGoRegister={onGoRegister}
                        workflow={workflow}
                        setWorkflow={setWorkflow}
                        initialWorkflowId={activeWorkflow?.id ?? null}
                        initialWorkflowName={activeWorkflow?.name ?? "Untitled Workflow"}
                        initialVersionNumber={activeWorkflow?.versionNumber ?? null}
                        initialDescription={activeWorkflow?.description ?? ""}
                        onBack={() => setScreen("selector")}
                    />
                )}
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
                .animate-fadeIn { animation: fadeIn 0.3s ease; }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}