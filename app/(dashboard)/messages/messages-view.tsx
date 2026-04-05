"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Avatar, Toast } from "@/components";
import { getUserClients } from "@/app/actions";

type DbClient = { id: string; name: string; company: string | null; email: string };

type Message = { id: string; text: string; sender: "user" | "client"; time: string };

// Demo messages per client — in production these would come from a messages table
const DEMO_MESSAGES: Record<string, Message[]> = {};

export default function MessagesView() {
  const [clients, setClients] = useState<DbClient[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>(DEMO_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" as "success" | "error" });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadClients = useCallback(async () => {
    try {
      const c = await getUserClients();
      setClients(c as unknown as DbClient[]);
      if (c.length > 0 && !selectedId) setSelectedId(c[0].id);
    } catch {}
    finally { setLoading(false); }
  }, [selectedId]);

  useEffect(() => { loadClients(); }, [loadClients]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, selectedId]);

  const selected = clients.find(c => c.id === selectedId);
  const currentMessages = selectedId ? (messages[selectedId] || []) : [];

  const sendMessage = () => {
    if (!input.trim() || !selectedId) return;
    const newMsg: Message = { id: `m-${Date.now()}`, text: input.trim(), sender: "user", time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) };
    setMessages(prev => ({ ...prev, [selectedId]: [...(prev[selectedId] || []), newMsg] }));
    setInput("");
  };

  const getInitials = (c: DbClient) => (c.company || c.name).substring(0, 2).toUpperCase();
  const lastMsg = (id: string) => { const m = messages[id]; return m && m.length > 0 ? m[m.length - 1].text : "No messages yet"; };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-f-text tracking-tight font-display">Messages</h1>
        <p className="text-sm text-f-muted mt-1">Chat with your clients</p>
      </div>

      <div className="bg-f-surface border border-f-border rounded-xl overflow-hidden flex" style={{ height: "calc(100vh - 220px)", minHeight: "500px" }}>
        {/* Client list */}
        <div className="w-72 border-r border-f-border flex flex-col shrink-0">
          <div className="px-4 py-3 border-b border-f-border">
            <p className="text-xs font-semibold text-f-muted uppercase tracking-wider">Conversations</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading && <p className="px-4 py-8 text-xs text-f-muted text-center">Loading...</p>}
            {!loading && clients.length === 0 && <p className="px-4 py-8 text-xs text-f-muted text-center">No clients yet — add one first</p>}
            {clients.map(c => (
              <button key={c.id} onClick={() => setSelectedId(c.id)}
                className={`w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-f-hover transition-colors ${selectedId === c.id ? "bg-f-accent/10 border-r-2 border-f-accent" : ""}`}>
                <Avatar text={getInitials(c)} color="#6C5CE7" size={36} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${selectedId === c.id ? "text-f-accent-lt" : "text-f-text"}`}>{c.company || c.name}</p>
                  <p className="text-xs text-f-muted truncate">{lastMsg(c.id)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {selected ? (
            <>
              {/* Chat header */}
              <div className="px-5 py-3 border-b border-f-border flex items-center gap-3">
                <Avatar text={getInitials(selected)} color="#6C5CE7" size={32} />
                <div>
                  <p className="text-sm font-semibold text-f-text">{selected.company || selected.name}</p>
                  <p className="text-[11px] text-f-muted">{selected.email}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {currentMessages.length === 0 && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <svg className="mx-auto mb-3 opacity-30" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8888A0" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                      <p className="text-sm text-f-muted">No messages yet</p>
                      <p className="text-xs text-f-muted mt-1">Start the conversation below</p>
                    </div>
                  </div>
                )}
                {currentMessages.map(m => (
                  <div key={m.id} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] ${m.sender === "user" ? "order-2" : ""}`}>
                      <div className={`px-4 py-3 rounded-2xl text-sm ${
                        m.sender === "user"
                          ? "bg-f-accent text-white rounded-tr-md"
                          : "bg-f-hover text-f-text rounded-tl-md"
                      }`}>
                        {m.text}
                      </div>
                      <p className={`text-[10px] text-f-muted mt-1 ${m.sender === "user" ? "text-right" : ""}`}>{m.time}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-f-border flex gap-3">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && input.trim()) sendMessage(); }}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-f-bg border border-f-border text-sm text-f-text placeholder-[#555] focus:border-f-accent focus:outline-none"
                />
                <button onClick={sendMessage} disabled={!input.trim()}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-f-accent hover:bg-f-accent/80 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0">
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <svg className="mx-auto mb-3 opacity-30" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8888A0" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                <p className="text-f-muted text-sm">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Toast message={toast.message} type={toast.type} show={toast.show} onClose={() => setToast(t => ({ ...t, show: false }))} />
    </>
  );
}
