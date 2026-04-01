import React, { useState, useEffect, useRef } from "react";
import useAgentStore from "../../stores/useAgentStore";
import "./AgentPanel.css";

const SELF_SERVICE_BASE_URL = "https://ec2c-175-101-6-106.ngrok-free.app";

export default function SelfServicePanel() {
  const selectedAgent = useAgentStore((s) => s.selectedAgent);
  const selectAgent = useAgentStore((s) => s.selectAgent);

  const [favourites, setFavourites] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);

  const chatRef = useRef(null);

  useEffect(() => {
    loadFavourites();
  }, []);

  // =========================
  // ✅ LOAD FAVOURITES
  // =========================
  async function loadFavourites() {
    try {
      const r = await fetch(`${SELF_SERVICE_BASE_URL}/api/favourites`, {
        credentials: "include",
      });

      const data = await r.json();

      const formatted = (data.favourites || []).map((item) => ({
        id: item.id,
        question: item.question,
        answer: item.answer,
      }));

      setFavourites(formatted);
    } catch (err) {
      console.error("Failed to load favourites", err);
      setFavourites([]);
    }
  }

  // =========================
  // ✅ DUPLICATE CHECK
  // =========================
  function isAlreadyFavourite(question) {
    return favourites.some(
      (fav) =>
        fav.question.toLowerCase().trim() === question.toLowerCase().trim(),
    );
  }

  // =========================
  // ➕ ADD FAVOURITE
  // =========================
  async function addFavourite(question, answer) {
    try {
      const res = await fetch(`${SELF_SERVICE_BASE_URL}/api/favourites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ question, answer }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Add favourite error:", err);
        return;
      }

      console.log("✅ Favourite saved");
    } catch (err) {
      console.error("Add favourite failed", err);
    }
  }

  // =========================
  // ❌ DELETE FAVOURITE
  // =========================
  async function deleteFavourite(id) {
    try {
      await fetch(`${SELF_SERVICE_BASE_URL}/api/favourites/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      loadFavourites();
    } catch (err) {
      console.error("Delete failed", err);
    }
  }

  // =========================
  // 🆕 CREATE SESSION
  // =========================
  async function createSession() {
    const r = await fetch(`${SELF_SERVICE_BASE_URL}/api/sessions/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ title: "AI Chat" }),
    });

    const d = await r.json();
    return d.session_id;
  }

  // =========================
  // 🧹 CLEAN RESPONSE
  // =========================
  function cleanResponse(raw) {
    if (!raw) return "";

    let cleaned = raw.replace(/start/gi, "");

    const temp = document.createElement("div");
    temp.innerHTML = cleaned;
    temp.querySelectorAll("button").forEach((btn) => btn.remove());

    return temp.innerText.trim();
  }

  // =========================
  // 💬 SEND MESSAGE
  // =========================
  async function sendMessage() {
    if (!input.trim()) return;

    const msg = input.trim();
    setInput("");

    setMessages((prev) => [
      ...prev,
      { role: "user", text: msg, saved: false },
      { role: "bot", text: "Thinking..." },
    ]);

    let sid = sessionId;

    if (!sid) {
      sid = await createSession();
      setSessionId(sid);
    }

    try {
      const r = await fetch(`${SELF_SERVICE_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message: msg,
          session_id: sid,
        }),
      });

      const d = await r.json();

      const rawResponse = d.response || d.html_content || "No response";
      const response = cleanResponse(rawResponse);

      setMessages((prev) => {
        const msgs = [...prev];
        msgs[msgs.length - 1] = {
          role: "bot",
          text: response,
        };
        return msgs;
      });
    } catch (err) {
      setMessages((prev) => {
        const msgs = [...prev];
        msgs[msgs.length - 1] = {
          role: "bot",
          text: "Error getting response",
        };
        return msgs;
      });
    }

    setTimeout(() => {
      chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
    }, 100);
  }

  // =========================
  // UI
  // =========================
  return (
    <div
      className={`agent-panel card-selfservice ${selectedAgent === "selfservice" ? "visible" : ""}`}
    >
      <div className="panel-header">
        <span style={{ fontSize: 22 }}>💬</span>
        <div className="panel-title">Self-Service Agent</div>
        <span className="panel-badge">ACTIVE</span>
        <div className="panel-close" onClick={() => selectAgent(null)}>
          ✕
        </div>
      </div>

      <div className="panel-grid-2">
        {/* LEFT PANEL */}
        <div className="panel-col">
          <div className="col-header">
            <h3>Favourite Questions</h3>
          </div>

          <div className="col-body">
            <ul className="fav-questions">
              {favourites.length === 0 ? (
                <li>No favourites found</li>
              ) : (
                favourites.map((fav) => (
                  <li key={fav.id} className="fav-item">
                    <span className="fav-text">{fav.question}</span>

                    <button
                      className="delete-btn"
                      onClick={() => deleteFavourite(fav.id)}
                    >
                      🗑
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        {/* CHAT */}
        <div className="panel-col">
          <div className="col-header">
            <h3>Chat</h3>
          </div>

          <div className="col-body chat-body" ref={chatRef}>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`message ${m.role === "user" ? "user-msg" : "bot-msg"}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>{m.text}</span>

                {/* ⭐ ICON */}
                {m.role === "user" && (
                  <span
                    style={{
                      cursor: "pointer",
                      fontSize: 18,
                      color: m.saved ? "#f4b400" : "#ccc",
                    }}
                    onClick={async () => {
                      const question = m.text;
                      const answer = messages[i + 1]?.text || "";

                      if (isAlreadyFavourite(question)) {
                        alert("⚠️ Already in favourites");
                        return;
                      }

                      await addFavourite(question, answer);

                      setMessages((prev) => {
                        const updated = [...prev];
                        updated[i].saved = true;
                        return updated;
                      });

                      loadFavourites();
                    }}
                  >
                    {m.saved ? "⭐" : "☆"}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="chat-input-area">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}
