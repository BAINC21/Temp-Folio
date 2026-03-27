"use client";

import { useState } from "react";
import { Badge, Avatar, Sparkline, ProgressRing, Sidebar, NotificationBell, Modal, progressColor, EXT_COLORS, fileExt } from "@/components";

// ─── Mock data (replace with Prisma queries when Supabase is connected) ───
const CLIENTS = [
  { id:"c1", name:"Bloom Studio", email:"alex@bloomstudio.co", company:"Bloom Studio", avatar:"BS", color:"#6C5CE7" },
  { id:"c2", name:"Neon Health", email:"jamie@neonhealth.io", company:"Neon Health", avatar:"NH", color:"#00D68F" },
  { id:"c3", name:"TrekFit", email:"sam@trekfit.app", company:"TrekFit", avatar:"TF", color:"#FF5C35" },
  { id:"c4", name:"Madre Coffee", email:"luna@madrecoffee.com", company:"Madre Coffee", avatar:"MC", color:"#FFB946" },
  { id:"c5", name:"Skyward Ventures", email:"ravi@skyward.vc", company:"Skyward Ventures", avatar:"SV", color:"#a29bfe" },
];
const PROJECTS = [
  { id:"p1", clientId:"c1", title:"Brand Refresh", status:"ACTIVE", progress:72, due:"Apr 2, 2026" },
  { id:"p2", clientId:"c2", title:"Website Redesign", status:"IN_REVIEW", progress:90, due:"Mar 28, 2026" },
  { id:"p3", clientId:"c3", title:"Mobile App UI", status:"ACTIVE", progress:35, due:"Apr 18, 2026" },
  { id:"p4", clientId:"c4", title:"E-Commerce Store", status:"OVERDUE", progress:60, due:"Mar 20, 2026" },
  { id:"p5", clientId:"c5", title:"Pitch Deck", status:"ACTIVE", progress:15, due:"May 1, 2026" },
];
const MILESTONES: Record<string, Array<{id:string; title:string; done:boolean; due:string; approve?:boolean}>> = {
  p1: [
    { id:"m1", title:"Discovery & Research", done:true, due:"Feb 15" },
    { id:"m2", title:"Logo Concepts (3 directions)", done:true, due:"Mar 1" },
    { id:"m3", title:"Color & Typography System", done:true, due:"Mar 12" },
    { id:"m4", title:"Brand Guidelines Document", done:false, due:"Mar 28", approve:true },
    { id:"m5", title:"Final Delivery & Handoff", done:false, due:"Apr 2" },
  ],
};
const FILES: Record<string, Array<{id:string; name:string; cat:string; size:string; date:string; isNew:boolean}>> = {
  p1: [
    { id:"f1", name:"logo-v3-final.svg", cat:"deliverable", size:"142 KB", date:"Mar 22", isNew:true },
    { id:"f2", name:"color-palette.pdf", cat:"deliverable", size:"1.2 MB", date:"Mar 18", isNew:false },
    { id:"f3", name:"brand-brief.docx", cat:"brief", size:"86 KB", date:"Feb 10", isNew:false },
    { id:"f4", name:"competitor-analysis.pdf", cat:"asset", size:"3.4 MB", date:"Feb 12", isNew:false },
  ],
};
const ACTIVITIES = [
  { id:"a1", pid:"p1", actor:"Bloom Studio", action:"approved the logo concepts", time:"12 min ago", type:"success" },
  { id:"a2", pid:"p2", actor:"You", action:"uploaded 3 files to Website Redesign", time:"2 hours ago", type:"info" },
  { id:"a3", pid:"p3", actor:"TrekFit", action:"left a comment on wireframes", time:"Yesterday", type:"warning" },
  { id:"a4", pid:"p5", actor:"Skyward Ventures", action:"paid invoice #041", time:"Yesterday", type:"success" },
  { id:"a5", pid:"p4", actor:"System", action:"Invoice #038 for Madre Coffee is overdue", time:"3 days ago", type:"danger" },
];
const INVOICES = [
  { id:"i1", cid:"c1", num:"#042", amt:"$1,800", status:"PAID", date:"Mar 22" },
  { id:"i2", cid:"c2", num:"#041", amt:"$3,200", status:"SENT", date:"Mar 15" },
  { id:"i3", cid:"c4", num:"#038", amt:"$950", status:"OVERDUE", date:"Mar 1" },
];
const REV = [3200,4100,3800,5200,4600,6100,5400,7200,6800,7600,8100,8420];
const NOTIFS = [
  { id:"n1", text:"Bloom Studio approved logo concepts", time:"12m ago", read:false },
  { id:"n2", text:"New comment on TrekFit wireframes", time:"Yesterday", read:false },
  { id:"n3", text:"Invoice #038 is overdue", time:"3 days ago", read:true },
];

const gc = (id: string) => CLIENTS.find(c => c.id === id)!;
const dotColor = (t: string) => t === "success" ? "bg-emerald-400" : t === "warning" ? "bg-amber-400" : t === "danger" ? "bg-red-400" : "bg-f-accent";

// ═══════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════
function DashboardView({ onViewProject, onNewProject }: { onViewProject: (id: string) => void; onNewProject: () => void }) {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-sm text-f-muted font-medium mb-1">Good afternoon, Jane</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-f-text tracking-tight font-display">Dashboard</h1>
        </div>
        <div className="flex gap-2.5">
          <button className="px-4 py-2.5 rounded-lg text-sm font-semibold text-f-muted border border-f-border hover:border-f-muted hover:text-f-text transition-all">Export</button>
          <button onClick={onNewProject} className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-f-accent shadow-lg shadow-f-accent/25 hover:-translate-y-0.5 transition-all flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
            New Project
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {[
          { l:"Active Projects", v:"8", s:"↑ 2 this month", up:true },
          { l:"Total Clients", v:"12", s:"↑ 3 this quarter", up:true },
          { l:"Revenue (Mar)", v:"$8,420", s:"↑ 18% vs Feb", up:true, chart:true },
          { l:"Outstanding", v:"$2,150", s:"2 overdue", up:false },
        ].map((s, i) => (
          <div key={i} className="bg-f-surface border border-f-border rounded-xl p-4 sm:p-5 hover:border-[#3A3A48] hover:-translate-y-0.5 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-f-muted font-medium mb-1.5">{s.l}</p>
                <p className="text-2xl sm:text-3xl font-bold text-f-text tracking-tight">{s.v}</p>
                <p className={`text-[11px] font-semibold mt-1 ${s.up ? "text-emerald-400" : "text-red-400"}`}>{s.s}</p>
              </div>
              {s.chart && <div className="hidden sm:block opacity-70 mt-1"><Sparkline data={REV} /></div>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
        <div className="bg-f-surface border border-f-border rounded-xl overflow-hidden">
          <div className="px-4 sm:px-6 py-4 flex items-center justify-between border-b border-f-border">
            <h2 className="text-base font-bold text-f-text">Active Projects</h2>
          </div>
          <div className="divide-y divide-f-border/50">
            {PROJECTS.map(p => { const cl = gc(p.clientId); return (
              <div key={p.id} onClick={() => onViewProject(p.id)} className="px-4 sm:px-6 py-3.5 flex items-center gap-3 sm:gap-4 hover:bg-f-hover cursor-pointer transition-colors">
                <Avatar text={cl.avatar} color={cl.color} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-f-text truncate">{p.title}</p>
                  <p className="text-xs text-f-muted">{cl.company}</p>
                </div>
                <Badge status={p.status} />
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-20 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: progressColor(p.status) }} />
                  </div>
                  <span className="text-xs text-f-muted tabular-nums w-8 text-right">{p.progress}%</span>
                </div>
                <span className={`hidden sm:inline text-sm ${p.status === "OVERDUE" ? "text-red-400" : "text-f-muted"}`}>{p.due}</span>
              </div>
            ); })}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-f-surface border border-f-border rounded-xl overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-f-border"><h2 className="text-base font-bold text-f-text">Activity</h2></div>
            <div className="divide-y divide-f-border/50">
              {ACTIVITIES.map(a => (
                <div key={a.id} className="px-4 sm:px-6 py-3.5 flex gap-3 items-start hover:bg-f-hover transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dotColor(a.type)}`} />
                  <div>
                    <p className="text-sm text-f-text leading-relaxed"><span className="font-semibold">{a.actor}</span> {a.action}</p>
                    <p className="text-[11px] text-f-muted mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-f-surface border border-f-border rounded-xl overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-f-border"><h2 className="text-base font-bold text-f-text">Recent Invoices</h2></div>
            <div className="divide-y divide-f-border/50">
              {INVOICES.map(inv => { const cl = gc(inv.cid); return (
                <div key={inv.id} className="px-4 sm:px-6 py-3.5 flex items-center justify-between hover:bg-f-hover transition-colors">
                  <div><p className="text-sm font-semibold text-f-text">{cl.company}</p><p className="text-xs text-f-muted">{inv.num} · {inv.date}</p></div>
                  <div className="text-right"><p className="text-sm font-bold text-f-text">{inv.amt}</p><Badge status={inv.status} /></div>
                </div>
              ); })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════
// PROJECT VIEW
// ═══════════════════════════════════════
function ProjectView({ pid, onBack, onPortal }: { pid: string; onBack: () => void; onPortal: () => void }) {
  const p = PROJECTS.find(x => x.id === pid)!;
  const cl = gc(p.clientId);
  const ms = MILESTONES[pid] || [];
  const fs = FILES[pid] || [];
  const acts = ACTIVITIES.filter(a => a.pid === pid);

  return (
    <>
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-f-muted hover:text-f-text transition-colors mb-5">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back to Dashboard
      </button>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4 flex-1">
          <Avatar text={cl.avatar} color={cl.color} size={48} />
          <div><h1 className="text-xl sm:text-2xl font-bold text-f-text">{p.title}</h1><p className="text-sm text-f-muted">{cl.company} · Due {p.due}</p></div>
          <Badge status={p.status} />
        </div>
        <button onClick={onPortal} className="px-4 py-2.5 rounded-lg text-sm font-semibold text-f-muted border border-f-border hover:border-f-muted hover:text-f-text transition-all">
          Client Portal →
        </button>
      </div>

      <div className="bg-f-surface border border-f-border rounded-xl p-5 mb-6">
        <div className="flex justify-between mb-3"><span className="text-sm font-semibold text-f-text">Progress</span><span className="text-sm font-bold text-f-text">{p.progress}%</span></div>
        <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden"><div className="h-full rounded-full transition-all duration-1000" style={{ width: `${p.progress}%`, background: progressColor(p.status) }} /></div>
      </div>

      <div className="bg-f-surface border border-f-border rounded-xl overflow-hidden mb-6">
        <div className="px-4 sm:px-6 py-4 border-b border-f-border"><h2 className="text-base font-bold text-f-text">Milestones</h2></div>
        <div className="divide-y divide-f-border/50">
          {ms.map(m => (
            <div key={m.id} className="px-4 sm:px-6 py-4 flex items-center gap-4 hover:bg-f-hover transition-colors">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${m.done ? "bg-emerald-500 border-emerald-500" : "border-[#3A3A48]"}`}>
                {m.done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>}
              </div>
              <span className={`flex-1 text-sm font-medium ${m.done ? "text-f-muted line-through" : "text-f-text"}`}>{m.title}</span>
              <span className="text-xs text-f-muted">{m.due}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-f-surface border border-f-border rounded-xl overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-f-border"><h2 className="text-base font-bold text-f-text">Files</h2></div>
          <div className="divide-y divide-f-border/50">
            {fs.map(f => { const ext = fileExt(f.name); return (
              <div key={f.id} className="px-4 sm:px-6 py-3.5 flex items-center gap-3 hover:bg-f-hover transition-colors">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: EXT_COLORS[ext] || "#8888A0" }}>{ext}</div>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-f-text truncate">{f.name}</p><p className="text-[11px] text-f-muted">{f.size}</p></div>
              </div>
            ); })}
          </div>
        </div>
        <div className="bg-f-surface border border-f-border rounded-xl overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-f-border"><h2 className="text-base font-bold text-f-text">Activity</h2></div>
          <div className="divide-y divide-f-border/50">
            {acts.map(a => (
              <div key={a.id} className="px-4 sm:px-6 py-3.5 flex gap-3 items-start hover:bg-f-hover transition-colors">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dotColor(a.type)}`} />
                <div><p className="text-sm text-f-text"><span className="font-semibold">{a.actor}</span> {a.action}</p><p className="text-[11px] text-f-muted mt-0.5">{a.time}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════
// CLIENT PORTAL
// ═══════════════════════════════════════
function PortalView({ pid, onBack }: { pid: string; onBack: () => void }) {
  const [tab, setTab] = useState("progress");
  const [approvals, setApprovals] = useState<Record<string, boolean>>({});
  const p = PROJECTS.find(x => x.id === pid)!;
  const cl = gc(p.clientId);
  const ms = MILESTONES[pid] || [];
  const fs = FILES[pid] || [];
  const done = ms.filter(m => m.done).length;

  // Light theme — client portal uses explicit inline colors
  return (
    <div className="min-h-screen" style={{ background: "#FAFAF8", color: "#1A1A1A" }}>
      <header className="sticky top-0 z-50" style={{ background: "rgba(250,250,248,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid #E8E6E1" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-8 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-sm" style={{ background: cl.color }}>{cl.avatar[0]}</div>
            <div><p className="text-sm sm:text-base font-bold" style={{ color: "#1A1A1A" }}>Jane Doe Design</p><p className="text-[11px]" style={{ color: "#7D7A72" }}>Client Portal</p></div>
          </div>
          <button onClick={onBack} className="text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-lg hover:bg-black/5 transition-all" style={{ color: "#7D7A72", border: "1px solid #E8E6E1" }}>← Back to Admin</button>
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

        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
          {[{ l: "Milestones", v: `${done}/${ms.length}`, s: "completed" }, { l: "Files", v: `${fs.length}`, s: "shared" }, { l: "Due Date", v: p.due.replace(", 2026", ""), s: "2026" }].map((s, i) => (
            <div key={i} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6" style={{ border: "1px solid #E8E6E1" }}>
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#7D7A72" }}>{s.l}</p>
              <p className="text-xl sm:text-3xl font-bold" style={{ color: "#1A1A1A" }}>{s.v}</p>
              <p className="text-xs mt-0.5" style={{ color: "#7D7A72" }}>{s.s}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: "#F0EDE8" }}>
          {["progress", "files", "messages"].map(t => (
            <button key={t} onClick={() => setTab(t)} className="flex-1 px-3 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold capitalize transition-all" style={{ background: tab === t ? "#fff" : "transparent", boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.06)" : "none", color: tab === t ? "#1A1A1A" : "#7D7A72" }}>{t}</button>
          ))}
        </div>

        {tab === "progress" && <div className="space-y-3">
          {ms.map((m, i) => (
            <div key={m.id} className="bg-white rounded-xl p-4 sm:p-5 flex items-center gap-4" style={{ border: "1px solid #E8E6E1" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: m.done ? cl.color : "#F0EDE8", color: m.done ? "#fff" : "#7D7A72" }}>
                {m.done ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg> : i + 1}
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

// ═══════════════════════════════════════
// APP SHELL
// ═══════════════════════════════════════
export default function DashboardClient() {
  const [page, setPage] = useState("dashboard");
  const [proj, setProj] = useState("p1");
  const [portal, setPortal] = useState(false);
  const [sb, setSb] = useState(false);
  const [modal, setModal] = useState(false);

  if (portal) return <PortalView pid={proj} onBack={() => setPortal(false)} />;

  return (
    <div className="min-h-screen bg-f-bg text-f-text">
      <Sidebar activePage={page === "project" ? "projects" : page} onNavigate={p => { setPage(p === "projects" ? "dashboard" : p); setPortal(false); }} open={sb} onClose={() => setSb(false)} />

      <Modal open={modal} onClose={() => setModal(false)} title="New Project">
        <div className="p-6 space-y-4">
          <div><label className="block text-xs font-semibold text-f-muted mb-1.5">Project Name</label><input className="w-full px-4 py-2.5 rounded-lg bg-f-bg border border-f-border text-sm text-f-text placeholder-[#555] focus:border-f-accent focus:outline-none" placeholder="e.g. Brand Refresh" /></div>
          <div><label className="block text-xs font-semibold text-f-muted mb-1.5">Client</label><select className="w-full px-4 py-2.5 rounded-lg bg-f-bg border border-f-border text-sm text-f-text focus:border-f-accent focus:outline-none appearance-none"><option value="">Select a client...</option>{CLIENTS.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}</select></div>
        </div>
        <div className="px-6 py-4 border-t border-f-border flex gap-3 justify-end">
          <button onClick={() => setModal(false)} className="px-4 py-2.5 rounded-lg text-sm font-semibold text-f-muted border border-f-border hover:text-f-text transition-all">Cancel</button>
          <button onClick={() => setModal(false)} className="px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-f-accent shadow-lg shadow-f-accent/25 transition-all">Create</button>
        </div>
      </Modal>

      <main className="lg:ml-60 min-h-screen">
        <div className="sticky top-0 z-20 lg:hidden flex items-center justify-between px-4 py-3 border-b border-f-border" style={{ background: "rgba(15,15,18,0.9)", backdropFilter: "blur(12px)" }}>
          <button onClick={() => setSb(true)} className="p-2 -ml-2 rounded-lg hover:bg-white/[0.06]"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8E8ED" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg></button>
          <span className="text-lg font-bold bg-gradient-to-br from-f-accent to-f-accent-lt bg-clip-text text-transparent font-display">folio</span>
          <NotificationBell notifications={NOTIFS} />
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="hidden lg:flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {[{ id: "dashboard", l: "Dashboard" }, { id: "project", l: "Project View" }, { id: "portal", l: "Client Portal" }].map(n => (
                <button key={n.id} onClick={() => { if (n.id === "portal") { setPortal(true); return; } setPage(n.id); }}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${(n.id === page && !portal) || (n.id === "portal" && portal) ? "bg-f-accent/15 text-f-accent-lt" : "text-[#555] hover:text-f-muted"}`}>
                  {n.l}
                </button>
              ))}
              <span className="text-[11px] text-[#555] ml-2">← Switch pages</span>
            </div>
            <NotificationBell notifications={NOTIFS} />
          </div>

          {page === "dashboard" && <DashboardView onViewProject={id => { setProj(id); setPage("project"); }} onNewProject={() => setModal(true)} />}
          {page === "project" && <ProjectView pid={proj} onBack={() => setPage("dashboard")} onPortal={() => setPortal(true)} />}
        </div>
      </main>
    </div>
  );
}
