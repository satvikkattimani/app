import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const GREETING = {
  role: "assistant",
  content:
    "Good day. I'm the digital concierge of Satvik Kattimani, mutual fund distributor (ARN-349743). Ask me anything about SIPs, portfolio reviews, or mutual fund basics — or I can help you book a free consultation.",
};

export const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const openChat = async () => {
    setOpen(true);
    if (!sessionId) {
      try {
        const res = await fetch(`${API}/chat/session`, { method: "POST" });
        const data = await res.json();
        setSessionId(data.session_id);
      } catch {
        setSessionId(crypto.randomUUID());
      }
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }, { role: "assistant", content: "" }]);
    setStreaming(true);
    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, message: text }),
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop();
        for (const part of parts) {
          if (!part.startsWith("data: ")) continue;
          try {
            const payload = JSON.parse(part.slice(6));
            if (payload.delta) {
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = { role: "assistant", content: copy[copy.length - 1].content + payload.delta };
                return copy;
              });
            }
          } catch { /* partial json */ }
        }
      }
    } catch {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: "I'm momentarily unavailable — please call 9740542188 or email satvikkinvestments@gmail.com." };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          data-testid="chatbot-toggle"
          onClick={openChat}
          aria-label="Open chat"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#1A1A1A]/80 backdrop-blur-xl border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors duration-300 animate-pulse-gold"
        >
          <Sparkles size={22} />
        </button>
      )}

      {open && (
        <div
          data-testid="chatbot-window"
          className="fixed bottom-6 right-6 z-50 w-[92vw] max-w-[400px] h-[540px] max-h-[75vh] flex flex-col bg-[#1A1A1A]/90 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#0A0A0A]/60">
            <div>
              <p className="font-serif text-lg text-white leading-none">Concierge</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] mt-1.5">Satvik Kattimani · ARN-349743</p>
            </div>
            <button data-testid="chatbot-close-btn" onClick={() => setOpen(false)} aria-label="Close chat" className="text-white/50 hover:text-white transition-colors duration-200">
              <X size={18} />
            </button>
          </div>

          <div data-testid="chatbot-messages" className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] text-sm leading-relaxed px-4 py-3 rounded-2xl ${
                    m.role === "user"
                      ? "bg-[#D4AF37] text-black rounded-br-sm"
                      : "bg-white/5 text-white/85 border border-white/10 rounded-bl-sm"
                  }`}
                >
                  {m.content || (streaming && i === messages.length - 1 ? <span className="text-white/40">…</span> : "")}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="px-4 py-3 border-t border-white/10 bg-[#0A0A0A]/60 flex items-center gap-3">
            <input
              data-testid="chatbot-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask about SIPs, reviews, ELSS…"
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
            />
            <button
              data-testid="chatbot-send-btn"
              onClick={send}
              disabled={streaming || !input.trim()}
              aria-label="Send message"
              className="w-9 h-9 rounded-full bg-[#D4AF37] text-black flex items-center justify-center hover:bg-[#E6D5B8] transition-colors duration-200 disabled:opacity-40"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
