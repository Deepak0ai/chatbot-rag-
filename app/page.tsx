"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

const quickPrompts = [
  "What services do you provide?",
  "What is the company about?",
  "How does the chatbot work?",
  "What is the pricing?",
];

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Hi — ask me about services, company info, support, pricing, or the tech stack.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes bounceDot {
        0%, 80%, 100% { transform: translateY(0); opacity: 0.45; }
        40% { transform: translateY(-4px); opacity: 1; }
      }
      .typing-dot {
        width: 7px;
        height: 7px;
        border-radius: 999px;
        background: #cbd5e1;
        display: inline-block;
        animation: bounceDot 1.2s infinite ease-in-out;
      }
      .typing-dot:nth-child(2) { animation-delay: 0.15s; }
      .typing-dot:nth-child(3) { animation-delay: 0.3s; }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  async function send(text?: string) {
    const userText = (text ?? input).trim();
    if (!userText || loading) return;

    setLoading(true);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userText }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.reply || "No response.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Something went wrong while getting a reply." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.bgGlowTop} />
      <div style={styles.bgGlowBottom} />

      <section style={styles.shell}>
        <header style={styles.header}>
          <div style={styles.brand}>
            <div style={styles.brandIcon}>✦</div>
            <div>
              <div style={styles.brandTitle}>RAG Chatbot</div>
              <div style={styles.brandSubTitle}>Gemini + local retrieval + clean UI</div>
            </div>
          </div>

          <div style={styles.statusPill}>
            <span style={styles.statusDot} />
            Ready to chat
          </div>
        </header>

        <div style={styles.content}>
          <aside style={styles.sidebar}>
            <div style={styles.sidebarCard}>
              <div style={styles.sidebarLabel}>Quick prompts</div>
              <div style={styles.promptList}>
                {quickPrompts.map((p) => (
                  <button key={p} onClick={() => send(p)} style={styles.promptButton}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.sidebarCard}>
              <div style={styles.sidebarLabel}>What this demo knows</div>
              <ul style={styles.bullets}>
                <li>AI automation services</li>
                <li>Lead generation and workflows</li>
                <li>Support and pricing</li>
                <li>Next.js + Gemini stack</li>
              </ul>
            </div>
          </aside>

          <section style={styles.chatCard}>
            <div style={styles.chatTop}>
              <div>
                <div style={styles.chatTitle}>Conversation</div>
                <div style={styles.chatSubtitle}>Ask anything — the assistant uses the knowledge base first.</div>
              </div>
              <button
                onClick={() => setMessages([{ role: "assistant", text: "Chat cleared. Ask me anything." }])}
                style={styles.clearButton}
              >
                Clear
              </button>
            </div>

            <div style={styles.messageArea}>
              {messages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.messageRow,
                    justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      ...styles.messageBubble,
                      ...(m.role === "user" ? styles.userBubble : styles.botBubble),
                    }}
                  >
                    <div style={styles.messageRole}>{m.role === "user" ? "You" : "Assistant"}</div>
                    <div style={styles.messageText}>{m.text}</div>
                  </div>
                </div>
              ))}

              {loading && (
                <div style={styles.messageRow}>
                  <div style={{ ...styles.messageBubble, ...styles.botBubble }}>
                    <div style={styles.messageRole}>Assistant</div>
                    <div style={styles.typing}>
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              )}

              <div ref={endRef} />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              style={styles.inputBar}
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Type your message..."
                rows={1}
                style={styles.textarea}
              />

              <button type="submit" disabled={!canSend} style={canSend ? styles.sendButton : styles.sendButtonDisabled}>
                Send
              </button>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, rgba(37, 99, 235, 0.24) 0%, rgba(2, 6, 23, 1) 35%, #020617 100%)",
    color: "white",
    padding: "24px",
    fontFamily:
      'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    position: "relative",
    overflow: "hidden",
  },
  bgGlowTop: {
    position: "absolute",
    inset: "-10% auto auto 20%",
    width: "320px",
    height: "320px",
    borderRadius: "999px",
    background: "rgba(99, 102, 241, 0.18)",
    filter: "blur(80px)",
    pointerEvents: "none",
  },
  bgGlowBottom: {
    position: "absolute",
    inset: "auto 10% 10% auto",
    width: "360px",
    height: "360px",
    borderRadius: "999px",
    background: "rgba(16, 185, 129, 0.12)",
    filter: "blur(90px)",
    pointerEvents: "none",
  },
  shell: {
    position: "relative",
    zIndex: 1,
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    padding: "14px 18px",
    border: "1px solid rgba(148, 163, 184, 0.16)",
    borderRadius: "22px",
    background: "rgba(15, 23, 42, 0.72)",
    backdropFilter: "blur(18px)",
    boxShadow: "0 24px 80px rgba(0,0,0,0.28)",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  brandIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "16px",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    boxShadow: "0 16px 30px rgba(37, 99, 235, 0.35)",
    fontWeight: 900,
  },
  brandTitle: {
    fontSize: "20px",
    fontWeight: 800,
    letterSpacing: "-0.02em",
  },
  brandSubTitle: {
    fontSize: "13px",
    color: "#cbd5e1",
    marginTop: "2px",
  },
  statusPill: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 14px",
    borderRadius: "999px",
    background: "rgba(30, 41, 59, 0.8)",
    border: "1px solid rgba(148, 163, 184, 0.16)",
    color: "#e2e8f0",
    fontSize: "14px",
    whiteSpace: "nowrap",
  },
  statusDot: {
    width: "10px",
    height: "10px",
    borderRadius: "999px",
    background: "#22c55e",
    boxShadow: "0 0 0 6px rgba(34, 197, 94, 0.15)",
  },
  content: {
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    gap: "18px",
    alignItems: "stretch",
  },
  sidebar: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  sidebarCard: {
    background: "rgba(15, 23, 42, 0.72)",
    border: "1px solid rgba(148, 163, 184, 0.16)",
    borderRadius: "22px",
    padding: "18px",
    boxShadow: "0 24px 80px rgba(0,0,0,0.22)",
    backdropFilter: "blur(18px)",
  },
  sidebarLabel: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "#94a3b8",
    marginBottom: "14px",
    fontWeight: 800,
  },
  promptList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  promptButton: {
    textAlign: "left",
    border: "1px solid rgba(148, 163, 184, 0.16)",
    background: "rgba(30, 41, 59, 0.7)",
    color: "white",
    borderRadius: "16px",
    padding: "12px 14px",
    cursor: "pointer",
    transition: "transform 0.15s ease, border-color 0.15s ease",
  },
  bullets: {
    margin: 0,
    paddingLeft: "18px",
    color: "#cbd5e1",
    lineHeight: 1.8,
  },
  chatCard: {
    background: "rgba(15, 23, 42, 0.74)",
    border: "1px solid rgba(148, 163, 184, 0.16)",
    borderRadius: "28px",
    minHeight: "76vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 24px 80px rgba(0,0,0,0.28)",
    backdropFilter: "blur(18px)",
    overflow: "hidden",
  },
  chatTop: {
    padding: "18px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    borderBottom: "1px solid rgba(148, 163, 184, 0.12)",
  },
  chatTitle: {
    fontSize: "18px",
    fontWeight: 800,
  },
  chatSubtitle: {
    marginTop: "4px",
    color: "#94a3b8",
    fontSize: "13px",
  },
  clearButton: {
    border: "1px solid rgba(148, 163, 184, 0.18)",
    background: "rgba(30, 41, 59, 0.75)",
    color: "white",
    borderRadius: "14px",
    padding: "10px 14px",
    cursor: "pointer",
  },
  messageArea: {
    flex: 1,
    padding: "20px",
    overflowY: "auto",
  },
  messageRow: {
    display: "flex",
    marginBottom: "14px",
  },
  messageBubble: {
    maxWidth: "78%",
    borderRadius: "20px",
    padding: "14px 16px",
    lineHeight: 1.55,
  },
  userBubble: {
    background: "linear-gradient(135deg, #2563eb, #3b82f6)",
    boxShadow: "0 14px 28px rgba(37, 99, 235, 0.3)",
  },
  botBubble: {
    background: "rgba(30, 41, 59, 0.96)",
    border: "1px solid rgba(148, 163, 184, 0.18)",
  },
  messageRole: {
    fontSize: "12px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#cbd5e1",
    marginBottom: "8px",
    fontWeight: 800,
  },
  messageText: {
    whiteSpace: "pre-wrap",
  },
  inputBar: {
    padding: "16px",
    borderTop: "1px solid rgba(148, 163, 184, 0.12)",
    display: "flex",
    gap: "12px",
    alignItems: "flex-end",
    background: "rgba(2, 6, 23, 0.3)",
  },
  textarea: {
    flex: 1,
    resize: "none",
    minHeight: "54px",
    maxHeight: "160px",
    borderRadius: "18px",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    background: "rgba(2, 6, 23, 0.85)",
    color: "white",
    padding: "16px 18px",
    outline: "none",
    fontSize: "16px",
    lineHeight: 1.4,
  },
  sendButton: {
    border: "none",
    borderRadius: "18px",
    padding: "16px 24px",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "white",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 16px 32px rgba(37, 99, 235, 0.28)",
  },
  sendButtonDisabled: {
    border: "none",
    borderRadius: "18px",
    padding: "16px 24px",
    background: "linear-gradient(135deg, #475569, #64748b)",
    color: "white",
    fontWeight: 800,
    cursor: "not-allowed",
    opacity: 0.8,
  },
  typing: {
    display: "inline-flex",
    gap: "6px",
    alignItems: "center",
    minHeight: "18px",
  },
};
