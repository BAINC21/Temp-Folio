"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge, Avatar, Sparkline, Modal, progressColor, EXT_COLORS, fileExt } from "@/components";
import { CLIENTS, PROJECTS, ACTIVITIES, INVOICES, REV, getClient } from "@/mock-data";

const dotColor = (t: string) => t === "success" ? "bg-emerald-400" : t === "warning" ? "bg-amber-400" : t === "danger" ? "bg-red-400" : "bg-f-accent";

export default function DashboardView() {
  const [modal, setModal] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-sm text-f-muted font-medium mb-1">Good afternoon, Jane</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-f-text tracking-tight font-display">Dashboard</h1>
        </div>
        <div className="flex gap-2.5">
          <button className="px-4 py-2.5 rounded-lg text-sm font-semibold text-f-muted border border-f-border hover:border-f-muted hover:text-f-text transition-all">Export</button>
          <button onClick={() => setModal(true)} className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-f-accent shadow-lg shadow-f-accent/25 hover:-translate-y-0.5 transition-all flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
            New Project
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {[
          { l: "Active Projects", v: "8", s: "↑ 2 this month", up: true },
          { l: "Total Clients", v: "12", s: "↑ 3 this quarter", up: true },
          { l: "Revenue (Mar)", v: "$8,420", s: "↑ 18% vs Feb", up: true, chart: true },
          { l: "Outstanding", v: "$2,150", s: "2 overdue", up: false },
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

      {/* Projects + sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
        <div className="bg-f-surface border border-f-border rounded-xl overflow-hidden">
          <div className="px-4 sm:px-6 py-4 flex items-center justify-between border-b border-f-border">
            <h2 className="text-base font-bold text-f-text">Active Projects</h2>
          </div>
          <div className="divide-y divide-f-border/50">
            {PROJECTS.map(p => { const cl = getClient(p.clientId); return (
              <Link key={p.id} href={`/project/${p.id}`} className="px-4 sm:px-6 py-3.5 flex items-center gap-3 sm:gap-4 hover:bg-f-hover cursor-pointer transition-colors">
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
              </Link>
            ); })}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Activity */}
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
          {/* Invoices */}
          <div className="bg-f-surface border border-f-border rounded-xl overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-f-border"><h2 className="text-base font-bold text-f-text">Recent Invoices</h2></div>
            <div className="divide-y divide-f-border/50">
              {INVOICES.map(inv => { const cl = getClient(inv.cid); return (
                <div key={inv.id} className="px-4 sm:px-6 py-3.5 flex items-center justify-between hover:bg-f-hover transition-colors">
                  <div><p className="text-sm font-semibold text-f-text">{cl.company}</p><p className="text-xs text-f-muted">{inv.num} · {inv.date}</p></div>
                  <div className="text-right"><p className="text-sm font-bold text-f-text">{inv.amt}</p><Badge status={inv.status} /></div>
                </div>
              ); })}
            </div>
          </div>
        </div>
      </div>

      {/* New Project Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="New Project">
        <NewProjectForm onClose={() => setModal(false)} />
      </Modal>
    </>
  );
}

function NewProjectForm({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = () => {
    // TODO: Wire to Prisma
    console.log("Create project:", { title, clientId, description, dueDate });
    onClose();
  };

  return (
    <>
      <div className="p-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-f-muted mb-1.5">Project Name</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-f-bg border border-f-border text-sm text-f-text placeholder-[#555] focus:border-f-accent focus:outline-none" placeholder="e.g. Brand Refresh" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-f-muted mb-1.5">Client</label>
          <select value={clientId} onChange={e => setClientId(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-f-bg border border-f-border text-sm text-f-text focus:border-f-accent focus:outline-none appearance-none">
            <option value="">Select a client...</option>
            {CLIENTS.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-f-muted mb-1.5">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-lg bg-f-bg border border-f-border text-sm text-f-text placeholder-[#555] focus:border-f-accent focus:outline-none resize-none" placeholder="Brief project description..." />
        </div>
        <div>
          <label className="block text-xs font-semibold text-f-muted mb-1.5">Due Date</label>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-f-bg border border-f-border text-sm text-f-text focus:border-f-accent focus:outline-none" />
        </div>
      </div>
      <div className="px-6 py-4 border-t border-f-border flex gap-3 justify-end">
        <button onClick={onClose} className="px-4 py-2.5 rounded-lg text-sm font-semibold text-f-muted border border-f-border hover:text-f-text transition-all">Cancel</button>
        <button onClick={handleSubmit} disabled={!title || !clientId} className="px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-f-accent shadow-lg shadow-f-accent/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed">Create Project</button>
      </div>
    </>
  );
}
