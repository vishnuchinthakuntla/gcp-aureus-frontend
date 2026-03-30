import React, { useState, useEffect, useRef } from 'react';
import useAgentStore from '../../stores/useAgentStore';
import './AgentPanel.css';

const SELF_SERVICE_BASE_URL = 'https://covalense-genai-vm-self-service-mcp.ngrok-free.dev';

export default function SelfServicePanel() {
    const selectedAgent = useAgentStore((s) => s.selectedAgent);
    const selectAgent = useAgentStore((s) => s.selectAgent);
    const [favourites, setFavourites] = useState([]);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [sessionId, setSessionId] = useState(null);
    const chatRef = useRef(null);

    useEffect(() => { loadFavourites(); }, []);

    async function loadFavourites() {
        try {
            const r = await fetch(`${SELF_SERVICE_BASE_URL}/api/favourites`);
            const data = await r.json();
            setFavourites(data.favourites || []);
        } catch { /* ignore */ }
    }

    async function createSession() {
        const r = await fetch(`${SELF_SERVICE_BASE_URL}/api/sessions/create`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'AI Chat' }),
        });
        const d = await r.json();
        return d.session_id;
    }

    async function sendMessage() {
        if (!input.trim()) return;
        const msg = input.trim();
        setInput('');
        setMessages((prev) => [...prev, { role: 'user', text: msg }]);
        setMessages((prev) => [...prev, { role: 'bot', text: 'Thinking...' }]);

        let sid = sessionId;
        if (!sid) { sid = await createSession(); setSessionId(sid); }

        try {
            const r = await fetch(`${SELF_SERVICE_BASE_URL}/api/chat`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg, session_id: sid }),
            });
            const d = await r.json();
            const response = d.response || d.html_content || 'No response';
            setMessages((prev) => { const msgs = [...prev]; msgs[msgs.length - 1] = { role: 'bot', text: response }; return msgs; });
        } catch { setMessages((prev) => { const msgs = [...prev]; msgs[msgs.length - 1] = { role: 'bot', text: 'Error getting response' }; return msgs; }); }

        setTimeout(() => chatRef.current?.scrollTo(0, chatRef.current.scrollHeight), 100);
    }

    async function deleteFavourite(id) {
        try { await fetch(`${SELF_SERVICE_BASE_URL}/api/favourites/${id}`, { method: 'DELETE' }); loadFavourites(); } catch { /* ignore */ }
    }

    function askQuestion(q) { setInput(q); setTimeout(() => sendMessage(), 50); }

    return (
        <div className={`agent-panel card-selfservice${selectedAgent === 'selfservice' ? ' visible' : ''}`} style={{ display: selectedAgent === 'selfservice' ? 'block' : 'none' }}>
            <div className="panel-header">
                <span style={{ fontSize: 22 }}>💬</span>
                <div className="panel-title">Self-Service Agent</div>
                <span className="panel-badge">ACTIVE</span>
                <div className="panel-close" onClick={() => selectAgent(null)}>✕</div>
            </div>
            <div className="panel-grid-2">
                <div className="panel-col">
                    <div className="col-header"><h3>Favourite Questions</h3></div>
                    <div className="col-body">
                        <ul className="fav-questions">
                            {favourites.length === 0 ? <li>No favourites found</li> : favourites.map((fav) => (
                                <li key={fav.id} className="fav-item">
                                    <span className="fav-text" onClick={() => askQuestion(fav.question)}>{fav.question}</span>
                                    <button className="delete-btn" onClick={() => deleteFavourite(fav.id)}>🗑</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="panel-col">
                    <div className="col-header"><h3>Chat</h3></div>
                    <div className="col-body chat-body" ref={chatRef}>
                        {messages.map((m, i) => (
                            <div key={i} className={`message ${m.role === 'user' ? 'user-msg' : 'bot-msg'}`}>{m.text}</div>
                        ))}
                    </div>
                    <div className="chat-input-area">
                        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your message..."
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()} />
                        <button onClick={sendMessage}>Send</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
