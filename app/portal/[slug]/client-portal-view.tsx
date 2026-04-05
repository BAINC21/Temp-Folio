"use client";

import { use, useState, useEffect, useRef } from "react";
import { ProgressRing, EXT_COLORS, fileExt } from "@/components";
import { getPortalData, approveMilestone } from "@/app/actions";

type PortalData = {
  id: string; name: string; email: string; company: string | null;
  user: { name: string; brandName: string | null; brandColor: string; brandLogoUrl: string | null };
  projects: Array<{
    id: string; title: string; status: string; progress: number; dueDate: string | null; description: string | null;
    milestones: Array<{ id: string; title: string; completed: boolean; dueDate: string | null; sortOrder: number; completedAt: string | null }>;
    files: Array<{ id: string; name: string; storagePath: string; mimeType: string; sizeBytes: number; createdAt: string }>;
  }>;
} | null;

export default function ClientPortalView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [data, setData] = useState<PortalData>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("progress");
  const [approving, setApproving] = useState<string | null>(null);
  const [msgInput, setMsgInput] = useState("");
  const [messages, setMessages] = useState<Array<{ id: string; text: string; sender: string; time: string }>>([]);
  const msgEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getPortalData(slug).then(d => { setData(d as unknown as PortalData); setLoading(false); }).catch(() => setLoading(false));
  }, [slug]);

  useEffect(() => { msgEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFAF8" }}><svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#6C5CE7" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" /></svg></div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFAF8" }}><div className="text-center"><h1 className="text-2xl font-bold mb-2" style={{ color: "#1A1A1A" }}>Portal not found</h1><p style={{ color: "#7D7A72" }}>This link may be invalid or expired.</p></div></div>;

  const brand = data.user;
  const color = brand.brandColor || "#6C5CE7";
  const brandLabel = brand.brandName || brand.name;
  const project = data.projects[0];

  if (!project) return <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFAF8" }}><p style={{ color: "#7D7A72" }}>No projects yet</p></div>;

  const ms = project.milestones;
  const fs = project.files;
  const done = ms.filter(m => m.completed).length;
  const progress = ms.length > 0 ? Math.round((done / ms.length) * 100) : 0;

  const handleApprove = async (id: string) => {
    setApproving(id);
    try { await approveMilestone(id); setData(prev => { if (!prev) return prev; return { ...prev, projects: prev.projects.map(p => ({ ...p, milestones: p.milestones.map(m => m.id === id ? { ...m, completed: true, completedAt: new Date().toISOString() } : m) })) }; }); }
    catch {} finally { setApproving(null); }
  };

  const sendMsg = () => {
    if (!msgInput.trim()) return;
    setMessages(prev => [...prev, { id: `m-${Date.now()}`, text: msgInput.trim(), sender: "client", time: "Just now" }]);
    setMsgInput("");
  };

  const fmtSize = (b: number) => b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`;
  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF8", color: "#1A1A1A" }}>
      <header className="sticky top-0 z-50" style={{ background: "rgba(250,250,248,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid #E8E6E1" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-8 h-14 sm:h-16 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-sm" style={{ background: color }}>{brandLabel.charAt(0)}</div>
          <div><p className="text-sm sm:text-base font-bold" style={{ color: "#1A1A1A" }}>{brandLabel}</p><p className="text-[11px]" style={{ color: "#7D7A72" }}>Client Portal</p></div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
        {/* Hero */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8">
          <div className="relative w-28 h-28 shrink-0 mx-auto sm:mx-0">
            <ProgressRing value={progress} color={color} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>{progress}%</span>
              <span className="text-[10px]" style={{ color: "#7D7A72" }}>complete</span>
            </div>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium mb-1" style={{ color: "#7D7A72" }}>Welcome, {data.name.split(" ")[0]}</p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display" style={{ color: "#1A1A1A" }}>{project.title}</h1>
            <p className="text-sm mt-1" style={{ color: "#7D7A72" }}>{done} of {ms.length} milestones · {project.dueDate ? `Due ${fmtDate(project.dueDate)}` : "No due date"}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
          {[{ l: "Milestones", v: `${done}/${ms.length}`, s: "completed" }, { l: "Files", v: `${fs.length}`, s: "shared" }, { l: "Status", v: project.status.replace("_", " "), s: project.dueDate ? fmtDate(project.dueDate) : "ongoing" }].map((s, i) => (
            <div key={i} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6" style={{ border: "1px solid #E8E6E1" }}>
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#7D7A72" }}>{s.l}</p>
              <p className="text-xl sm:text-3xl font-bold" style={{ color: "#1A1A1A" }}>{s.v}</p>
              <p className="text-xs mt-0.5" style={{ color: "#7D7A72" }}>{s.s}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: "#F0EDE8" }}>
          {["progress", "files", "messages"].map(t => (
            <button key={t} onClick={() => setTab(t)} className="flex-1 px-3 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold capitalize transition-all" style={{ background: tab === t ? "#fff" : "transparent", boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.06)" : "none", color: tab === t ? "#1A1A1A" : "#7D7A72" }}>{t}</button>
          ))}
        </div>

        {tab === "progress" && <div className="space-y-3">
          {ms.map((m, i) => (
            <div key={m.id} className="bg-white rounded-xl p-4 sm:p-5 flex items-center gap-4" style={{ border: "1px solid #E8E6E1" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: m.completed ? color : "#F0EDE8", color: m.completed ? "#fff" : "#7D7A72" }}>
                {m.completed ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg> : i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: m.completed ? "#7D7A72" : "#1A1A1A", textDecoration: m.completed ? "line-through" : "none" }}>{m.title}</p>
                {m.dueDate && <p className="text-xs" style={{ color: "#7D7A72" }}>Due {fmtDate(m.dueDate)}</p>}
              </div>
              {!m.completed && i === done && <span className="text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: `${color}15`, color }}>Current</span>}
              {!m.completed && (
                <button onClick={() => handleApprove(m.id)} disabled={approving === m.id}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg text-white disabled:opacity-50" style={{ background: color }}>
                  {approving === m.id ? "..." : "Approve"}
                </button>
              )}
            </div>
          ))}
          {ms.length === 0 && <div className="bg-white rounded-xl p-8 text-center" style={{ border: "1px solid #E8E6E1" }}><p className="text-sm" style={{ color: "#7D7A72" }}>No milestones set up yet</p></div>}
        </div>}

        {tab === "files" && <div className="space-y-3">
          {fs.map(f => { const ext = fileExt(f.name); return (
            <div key={f.id} className="bg-white rounded-xl p-4 sm:p-5 flex items-center gap-4" style={{ border: "1px solid #E8E6E1" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: EXT_COLORS[ext] || "#8888A0" }}>{ext}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "#1A1A1A" }}>{f.name}</p>
                <p className="text-xs" style={{ color: "#7D7A72" }}>{fmtSize(f.sizeBytes)} · {fmtDate(f.createdAt)}</p>
              </div>
              <button className="px-4 py-2 rounded-lg text-xs font-semibold text-white shrink-0" style={{ background: color }}>Download</button>
            </div>
          ); })}
          {fs.length === 0 && <div className="bg-white rounded-xl p-8 text-center" style={{ border: "1px solid #E8E6E1" }}><p className="text-sm" style={{ color: "#7D7A72" }}>No files shared yet</p></div>}
        </div>}

        {tab === "messages" && <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E8E6E1" }}>
          <div className="p-4 sm:p-6 space-y-4 max-h-[400px] overflow-y-auto" style={{ minHeight: 200 }}>
            {messages.length === 0 && <div className="flex items-center justify-center h-32"><p className="text-sm" style={{ color: "#7D7A72" }}>No messages yet — start the conversation below</p></div>}
            {messages.map(m => (
              <div key={m.id} className={`flex gap-3 ${m.sender === "client" ? "justify-end" : ""}`}>
                <div className={`max-w-[70%]`}>
                  <div className={`rounded-2xl px-4 py-3 text-sm ${m.sender === "client" ? "rounded-tr-md text-white" : "rounded-tl-md"}`}
                    style={{ background: m.sender === "client" ? color : "#f3f3f0", color: m.sender === "client" ? "#fff" : "#1A1A1A" }}>
                    {m.text}
                  </div>
                  <p className={`text-[10px] mt-1 ${m.sender === "client" ? "text-right" : ""}`} style={{ color: "#7D7A72" }}>{m.time}</p>
                </div>
              </div>
            ))}
            <div ref={msgEnd} />
          </div>
          <div className="p-3 sm:p-4 border-t flex gap-3" style={{ borderColor: "#E8E6E1" }}>
            <input value={msgInput} onChange={e => setMsgInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") sendMsg(); }}
              placeholder="Type a message..." className="flex-1 px-4 py-2.5 rounded-xl border text-sm focus:outline-none" style={{ borderColor: "#E8E6E1", color: "#1A1A1A", background: "#FAFAF8" }} />
            <button onClick={sendMsg} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white shrink-0" style={{ background: color }}>Send</button>
          </div>
        </div>}

        <div className="mt-12 text-center pb-4">
          <span className="text-xs" style={{ color: "#B0ADA5" }}>Powered by <span className="font-bold bg-gradient-to-r from-f-accent to-f-accent-lt bg-clip-text text-transparent font-display">folio</span></span>
        </div>
      </div>
    </div>
  );
}
