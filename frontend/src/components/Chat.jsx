import { useState } from "react";
import axios from "axios";

export default function Chat({ workflow, setWorkflow }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    const sendMessage = async () => {
        if (!input) return;

        const userMsg = input;

        setMessages([...messages, { role: "user", content: userMsg }]);
        setInput("");

        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
            const res = await axios.post(`${apiUrl}/chat`, {
                message: userMsg,
                workflow: workflow
            });

            if (res.data.workflow) {
                setWorkflow(res.data.workflow);

                setMessages(prev => [
                    ...prev,
                    { role: "assistant", content: "Workflow updated" }
                ]);
            } else if (res.data.error) {
                setMessages(prev => [
                    ...prev,
                    { role: "assistant", content: `Error: ${res.data.error}` }
                ]);
                console.error("Backend error:", res.data.error, res.data.raw);
            }
        } catch (err) {
            console.error(err);
            setMessages(prev => [
                ...prev,
                { role: "assistant", content: "Failed to connect to the backend." }
            ]);
        }
    };

    return (
        <div style={{ padding: 16 }}>
            <h3>AI Workflow Chat</h3>

            <div style={{ height: "70vh", overflowY: "auto" }}>
                {messages.map((m, i) => (
                    <div key={i}>
                        <b>{m.role}:</b> {m.content}
                    </div>
                ))}
            </div>

            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your process..."
                style={{ width: "80%" }}
            />

            <button onClick={sendMessage}>Send</button>
        </div>
    );
}