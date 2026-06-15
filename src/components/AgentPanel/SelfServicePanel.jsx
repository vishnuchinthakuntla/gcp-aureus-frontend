import React, { useState, useEffect, useRef } from "react";
import useAgentStore from "../../stores/useAgentStore";
import "./AgentPanel.css";
import toast from "react-hot-toast";

const SELF_SERVICE_BASE_URL = "https://sociology-franchise-occurrence-authorized.trycloudflare.com";

export default function SelfServicePanel() {
  const selectedAgent = useAgentStore((s) => s.selectedAgent);
  const selectAgent = useAgentStore((s) => s.selectAgent);

  const [favourites, setFavourites] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [currentFeedbackData, setCurrentFeedbackData] = useState(null);
  const [feedbackReason, setFeedbackReason] = useState("");
  const [additionalFeedback, setAdditionalFeedback] = useState("");


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
        'ngrok-skip-browser-warning': 'true'
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
  // 👍👎 SUBMIT FEEDBACK
  // =========================
  async function submitFeedback(feedbackType, question, answer, reason = "", additional = "") {
    if (!sessionId) return;
    try {
      await fetch(`${SELF_SERVICE_BASE_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          session_id: sessionId,
          question: question,
          answer: answer,
          feedback_type: feedbackType,
          reason: reason,
          additional_feedback: additional
        }),
      });
      console.log(`Feedback '${feedbackType}' submitted.`);
    } catch (err) {
      console.error("Feedback submission failed", err);
    }
  }

  // =========================
  // 🗑️ REMOVE FEEDBACK
  // =========================
  async function removeFeedback(question, answer) {
    if (!sessionId) return;
    try {
      await fetch(`${SELF_SERVICE_BASE_URL}/api/feedback`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          session_id: sessionId,
          question: question,
          answer: answer
        }),
      });
      console.log(`Feedback removed.`);
    } catch (err) {
      console.error("Feedback removal failed", err);
    }
  }

  // =========================
  // 💬 SEND MESSAGE
  // =========================
  async function sendMessage(customMsg) {
    // Ensure we correctly identify if a plain text string was passed (ignoring click events)
    const textToSend = typeof customMsg === "string" ? customMsg : input;
    if (!textToSend.trim()) return;

    const msg = textToSend.trim();
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
    <>
      <div
        className={`agent-panel card-selfservice ${selectedAgent === "self_service" ? "visible" : ""}`}
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
                      <span
                        className="fav-text"
                        style={{ cursor: "pointer" }}
                        onClick={() => sendMessage(fav.question)}
                      >
                        {fav.question}
                      </span>

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
          <div className="panel-col chat-panel">
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
                          toast.error("Already in favourites");
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

                  {/* 👍👎 LIKE/DISLIKE ICONS FOR BOT MESSAGES */}
                  {m.role === "bot" && m.text !== "Thinking..." && (
                    <div style={{ display: "flex", gap: "10px", marginLeft: "15px" }}>
                      {/* LIKE BUTTON */}
                      <span
                        style={{ cursor: "pointer", fontSize: 16 }}
                        title="Like"
                        onClick={() => {
                          const question = messages[i - 1]?.text || "";
                          if (m.feedback === "like") {
                            // Reset state and remove feedback
                            setMessages((prev) => {
                              const updated = [...prev];
                              delete updated[i].feedback;
                              return updated;
                            });
                            removeFeedback(question, m.text);
                            return;
                          }

                          // Mark as liked in state
                          setMessages((prev) => {
                            const updated = [...prev];
                            updated[i].feedback = "like";
                            return updated;
                          });

                          submitFeedback(1, question, m.text);
                        }}
                      >
                        <svg viewBox="-8 -8 38 38" className={`like-btn ${m.feedback === "like" ? "selected" : ""}`} width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                          <path fill="white" d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
                        </svg>
                      </span>

                      {/* DISLIKE BUTTON */}
                      <span
                        style={{ cursor: "pointer", fontSize: 16 }}
                        title="Dislike"
                        onClick={() => {
                          const question = messages[i - 1]?.text || "";
                          if (m.feedback === "dislike") {
                            // Reset state and remove feedback
                            setMessages((prev) => {
                              const updated = [...prev];
                              delete updated[i].feedback;
                              return updated;
                            });
                            removeFeedback(question, m.text);
                            return;
                          }

                          // Pass the index `i` to the modal so we know which message to update
                          setCurrentFeedbackData({ question, answer: m.text, index: i });
                          setFeedbackReason("");
                          setAdditionalFeedback("");
                          setFeedbackModalOpen(true);
                        }}
                      >
                        <svg viewBox="-8 -8 38 38" className={`dislike-btn ${m.feedback === "dislike" ? "selected" : ""}`} width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                          <path fill="white" d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" />
                        </svg>
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="chat-input-area">
              <textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  const ta = e.target;
                  ta.style.height = "auto";
                  const maxHeight = 66;
                  ta.style.height = Math.min(ta.scrollHeight, maxHeight) + "px";
                  ta.style.overflowY = ta.scrollHeight > maxHeight ? "auto" : "hidden";
                }}
                placeholder="Type your message..."
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </div>
        </div>

      </div>
      {/* FEEDBACK MODAL */}
      {feedbackModalOpen && (
        <div className="feedback-modal-overlay">
          <div className="feedback-modal">
            <div className="feedback-modal-header">
              <h3>Feedback</h3>
              <button className="close-btn" onClick={() => setFeedbackModalOpen(false)}>✕</button>
            </div>

            <div className="feedback-modal-body">
              <p>Why did you choose this rating?</p>

              <div className="feedback-reasons">
                {["Offensive / Unsafe", "Irrelevant", "Not factually correct"].map(reason => (
                  <button
                    key={reason}
                    className={`reason-pill ${feedbackReason === reason ? "active" : ""}`}
                    onClick={() => setFeedbackReason(reason)}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              <textarea
                className="feedback-textarea"
                placeholder="Provide additional feedback"
                value={additionalFeedback}
                onChange={(e) => setAdditionalFeedback(e.target.value)}
              />
            </div>

            <div className="feedback-modal-footer">
              <button className="cancel-btn" onClick={() => setFeedbackModalOpen(false)}>Cancel</button>
              <button className="submit-btn" onClick={() => {
                if (currentFeedbackData) {
                  // Mark as disliked in state
                  setMessages((prev) => {
                    const updated = [...prev];
                    if (updated[currentFeedbackData.index]) {
                      updated[currentFeedbackData.index].feedback = "dislike";
                    }
                    return updated;
                  });

                  submitFeedback(-1, currentFeedbackData.question, currentFeedbackData.answer, feedbackReason, additionalFeedback);
                }
                setFeedbackModalOpen(false);
              }}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
