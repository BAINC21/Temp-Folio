"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Avatar, ProgressRing, EXT_COLORS, fileExt } from "@/components";
import { PROJECTS, MILESTONES, FILES, getClient } from "@/mock-data";

export default function PortalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [tab, setTab] = useState("progress");
  const [approvals, setApprovals] = useState<Record<string, boolean>>({});

  // In real app, slug would be the portalSlug. For now, treat it as clientId.
  const cl = getClient(slug);
  if (!cl) return <div className="p-8 text-center">Portal not found</div>;

  const clientProjects = PROJECTS.filter(p => p.clientId === slug);
  const p = clientProjects[0];
  if (!p) return <div className="p-8 text-center">No projects found</div>;

  const ms = MILESTONES[p.id] || [];
  const fs = FILES[p.id] || [];
  const done = ms.filter(m => m.done).length;

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF8", color: "#1A1A1A" }}>
      <header className="sticky top-0 z-50" style={{ background: "rgba(250,250,248,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid #E8E6E1" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-8 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-sm" style={{ background: cl.color }}>{cl.avatar[0]}</div>
            <div><p className="text-sm sm:text-base font-bold" style={{ color: "#1A1A1A" }}>Jane Doe Design</p><p className="text-[11px]" style={{ color: "#7D7A72" }}>Client Portal</p></div>
          </div>
          <Link href={`/project/${p.id}`} className="text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-lg hover:bg-black/5 transition-all" style={{ color: "#7D7A72", border: "1px solid #E8E6E1" }}>
            ← Back to Admin
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8">
          <div className="relative w-28 h-28 shrink-0 mx-auto sm:mx-0">
            <ProgressRing value={p.progress} color={cl.color} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>{p.progress}%</span>
              <span className="text-[10px]" style={{ color: "#7D7A72" }}>complete</span>
            </div>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium mb-1" style={{ color: "#7D7A72" }}>Welcome back, {cl.name.split(" ")[0]}</p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display" style={{ color: "#1A1A1A" }}>{p.title}</h1>
            <p className="text-sm mt-1" style={{ color: "#7D7A72" }}>{done} of {ms.length} milestones completed · Due {p.due}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
          {[{ l: "Milestones", v: `${done}/${ms.length}`, s: "completed" }, { l: "Files", v: `${fs.length}`, s: "shared" }, { l: "Due Date", v: p.due.replace(", 2026", ""), s: "2026" }].map((s, i) => (
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
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: m.done ? cl.color : "#F0EDE8", color: m.done ? "#fff" : "#7D7A72" }}>
                {m.done ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg> : i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: m.done ? "#7D7A72" : "#1A1A1A", textDecoration: m.done ? "line-through" : "none" }}>{m.title}</p>
                <p className="text-xs" style={{ color: "#7D7A72" }}>Due {m.due}</p>
              </div>
              {!m.done && i === done && <span className="text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: `${cl.color}15`, color: cl.color }}>Current</span>}
              {m.approve && !m.done && !approvals[m.id] && <button onClick={() => setApprovals(prev => ({ ...prev, [m.id]: true }))} className="text-xs font-bold px-3 py-1.5 rounded-lg text-white" style={{ background: cl.color }}>Approve</button>}
              {approvals[m.id] && <span className="text-xs font-semibold text-emerald-500">✓ Approved</span>}
            </div>
          ))}
        </div>}

        {tab === "files" && <div className="space-y-3">
          {fs.filter(f => f.cat === "deliverable").map(f => { const ext = fileExt(f.name); return (
            <div key={f.id} className="bg-white rounded-xl p-4 sm:p-5 flex items-center gap-4" style={{ border: `1px solid ${f.isNew ? `${cl.color}40` : "#E8E6E1"}` }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: EXT_COLORS[ext] || "#8888A0" }}>{ext}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><span className="text-sm font-semibold truncate" style={{ color: "#1A1A1A" }}>{f.name}</span>{f.isNew && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-600 shrink-0">NEW</span>}</div>
                <p className="text-xs" style={{ color: "#7D7A72" }}>{f.size} · {f.date}</p>
              </div>
              <button className="px-4 py-2 rounded-lg text-xs font-semibold text-white shrink-0" style={{ background: cl.color }}>Download</button>
            </div>
          ); })}
          {fs.filter(f => f.cat === "deliverable").length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center" style={{ border: "1px solid #E8E6E1" }}>
              <p className="text-sm" style={{ color: "#7D7A72" }}>No deliverables shared yet</p>
            </div>
          )}
        </div>}

        {tab === "messages" && <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E8E6E1" }}>
          <div className="p-4 sm:p-6 space-y-5" style={{ minHeight: 240 }}>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-f-accent to-f-accent-lt flex items-center justify-center text-white text-[10px] font-bold shrink-0">JD</div>
              <div><div className="bg-gray-50 rounded-2xl rounded-tl-md px-4 py-3 max-w-xs sm:max-w-sm"><p className="text-sm" style={{ color: "#1A1A1A" }}>Hi! I&apos;ve uploaded the latest logo concepts. Let me know your thoughts!</p></div><p className="text-[11px] mt-1 ml-1" style={{ color: "#7D7A72" }}>2 days ago</p></div>
            </div>
            <div className="flex gap-3 justify-end">
              <div><div className="rounded-2xl rounded-tr-md px-4 py-3 max-w-xs sm:max-w-sm text-white text-sm" style={{ background: cl.color }}>These look amazing! Leaning towards option B.</div><p className="text-[11px] mt-1 text-right" style={{ color: "#7D7A72" }}>Yesterday</p></div>
              <Avatar text={cl.avatar} color={cl.color} />
            </div>
          </div>
          <div className="p-3 sm:p-4 border-t flex gap-3" style={{ borderColor: "#E8E6E1" }}>
            <input placeholder="Type a message..." className="flex-1 px-4 py-2.5 rounded-xl border text-sm focus:outline-none" style={{ borderColor: "#E8E6E1", color: "#1A1A1A", background: "#FAFAF8" }} />
            <button className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white shrink-0" style={{ background: cl.color }}>Send</button>
          </div>
        </div>}

        <div className="mt-12 text-center pb-4">
          <span className="text-xs" style={{ color: "#B0ADA5" }}>Powered by <span className="font-bold bg-gradient-to-r from-f-accent to-f-accent-lt bg-clip-text text-transparent font-display">folio</span></span>
        </div>
      </div>
    </div>
  );
}
