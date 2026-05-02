import { useState, useRef, useEffect } from "react";
import { askGemini } from "../utils/gemini";
import botIcon from "../assets/bot-icon.png";
import "./Chatbot.css";

const WELCOME = {
  role: "bot",
  text: "Hi! I'm your Medical AI Assistant\n\nI can help you:\n• Understand your scan results\n• Answer questions about brain tumors\n• Explain medical terms\n\nUpload a scan and analyze it first, or ask me anything!",
};

const SUGGESTIONS = [
  "What is glioma?",
  "Explain my scan result",
  "What does Dice Score mean?",
  "Is my tumor serious?",
];

export default function Chatbot({ scanResult }) {
  const [open, setOpen]       = useState(false);
  const [msgs, setMsgs]       = useState([WELCOME]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  const send = async (text) => {
    const q = text || input.trim();
    if (!q || loading) return;
    setInput("");

    const userMsg = { role: "user", text: q };
    setMsgs(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const reply = await askGemini(q, scanResult, msgs);
      setMsgs(prev => [...prev, { role: "bot", text: reply }]);
    } catch (e) {
      setMsgs(prev => [...prev, {
        role: "bot",
        text: "⚠️ Sorry, I couldn't reach the AI service. Check your API key or internet connection.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const showDot = !!scanResult && !open;

  return (
    <>
      {/* ── Floating bubble button ── */}
      <button
        className={`chat-fab ${open ? "open" : ""}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Open AI Assistant"
      >
        {open
          ? <span className="chat-fab-close">✕</span>
          : <img src={botIcon} alt="AI Assistant" className="chat-fab-img" />
        }
        {showDot && <span className="chat-fab-dot" />}
      </button>

      {/* ── Chat window ── */}
      {open && (
        <div className="chat-window">

          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-left">
              <div className="chat-avatar">
                <img src={botIcon} alt="AI" className="chat-avatar-img" />
              </div>
              <div>
                <div className="chat-title">Medical AI Assistant</div>
                <div className="chat-subtitle">
                  {loading ? "Thinking..." : "Powered by Gemini 2.5"}
                </div>
              </div>
            </div>
            <button className="chat-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* Scan context bar */}
          {scanResult && (
            <div className="chat-context-bar">
              <span className="chat-context-icon">🔬</span>
              <span className="chat-context-text">
                Scan loaded: <strong>{scanResult.tumor_type}</strong>
                &nbsp;({(scanResult.confidence[scanResult.tumor_type] * 100).toFixed(1)}% confidence)
              </span>
            </div>
          )}

          {/* Messages */}
          <div className="chat-messages">
            {msgs.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role}`}>
                {m.role === "bot" && (
                  <div className="chat-msg-avatar">
                    <img src={botIcon} alt="AI" className="chat-msg-avatar-img" />
                  </div>
                )}
                <div className="chat-bubble">
                  {m.text.split("\n").map((line, j) => (
                    <span key={j}>{line}{j < m.text.split("\n").length - 1 && <br />}</span>
                  ))}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-msg bot">
                <div className="chat-msg-avatar">
                  <img src={botIcon} alt="AI" className="chat-msg-avatar-img" />
                </div>
                <div className="chat-bubble typing">
                  <span /><span /><span />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {!scanResult && msgs.length === 1 && (
            <div className="chat-suggestions">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} className="chat-suggestion" onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="chat-input-row">
            <textarea
              className="chat-input"
              placeholder="Ask about your scan or brain tumors..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              disabled={loading}
            />
            <button
              className="chat-send"
              onClick={() => send()}
              disabled={!input.trim() || loading}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
