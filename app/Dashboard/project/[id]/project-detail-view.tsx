"use client";

import { use } from "react";
import Link from "next/link";
import { Badge, Avatar, progressColor, EXT_COLORS, fileExt } from "@/components";
import { PROJECTS, MILESTONES, FILES, ACTIVITIES, getClient } from "@/mock-data";

const dotColor = (t: string) => t === "success" ? "bg-emerald-400" : t === "warning" ? "bg-amber-400" : t === "danger" ? "bg-red-400" : "bg-f-accent";

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const p = PROJECTS.find(x => x.id === id);
  if (!p) return <div className="p-8 text-f-muted">Project not found</div>;

  const cl = getClient(p.clientId);
  const ms = MILESTONES[id] || [];
  const fs = FILES[id] || [];
  const acts = ACTIVITIES.filter(a => a.pid === id);

  return (
    <>
      <Link href="/" className="flex items-center gap-2 text-sm text-f-muted hover:text-f-text transition-colors mb-5">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        Back to Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4 flex-1">
          <Avatar text={cl.avatar} color={cl.color} size={48} />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-f-text">{p.title}</h1>
            <p className="text-sm text-f-muted">{cl.company} · Due {p.due}</p>
          </div>
          <Badge status={p.status} />
        </div>
        <Link href={`/portal/${p.clientId}`} className="px-4 py-2.5 rounded-lg text-sm font-semibold text-f-muted border border-f-border hover:border-f-muted hover:text-f-text transition-all">
          Client Portal →
        </Link>
      </div>

      {p.description && (
        <p className="text-sm text-f-muted mb-6 leading-relaxed">{p.description}</p>
      )}

      {/* Progress bar */}
      <div className="bg-f-surface border border-f-border rounded-xl p-5 mb-6">
        <div className="flex justify-between mb-3"><span className="text-sm font-semibold text-f-text">Progress</span><span className="text-sm font-bold text-f-text">{p.progress}%</span></div>
        <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden"><div className="h-full rounded-full transition-all duration-1000" style={{ width: `${p.progress}%`, background: progressColor(p.status) }} /></div>
      </div>

      {/* Milestones */}
      <div className="bg-f-surface border border-f-border rounded-xl overflow-hidden mb-6">
        <div className="px-4 sm:px-6 py-4 border-b border-f-border"><h2 className="text-base font-bold text-f-text">Milestones</h2></div>
        <div className="divide-y divide-f-border/50">
          {ms.length === 0 && <p className="px-6 py-8 text-sm text-f-muted text-center">No milestones yet</p>}
          {ms.map(m => (
            <div key={m.id} className="px-4 sm:px-6 py-4 flex items-center gap-4 hover:bg-f-hover transition-colors">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${m.done ? "bg-emerald-500 border-emerald-500" : "border-[#3A3A48]"}`}>
                {m.done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>}
              </div>
              <span className={`flex-1 text-sm font-medium ${m.done ? "text-f-muted line-through" : "text-f-text"}`}>{m.title}</span>
              <span className="text-xs text-f-muted">{m.due}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Files + Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-f-surface border border-f-border rounded-xl overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-f-border flex items-center justify-between">
            <h2 className="text-base font-bold text-f-text">Files</h2>
            <button className="text-xs font-semibold text-f-accent hover:text-f-accent-lt transition-colors">Upload file</button>
          </div>
          <div className="divide-y divide-f-border/50">
            {fs.length === 0 && <p className="px-6 py-8 text-sm text-f-muted text-center">No files yet</p>}
            {fs.map(f => { const ext = fileExt(f.name); return (
              <div key={f.id} className="px-4 sm:px-6 py-3.5 flex items-center gap-3 hover:bg-f-hover transition-colors">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: EXT_COLORS[ext] || "#8888A0" }}>{ext}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-f-text truncate">{f.name}</p>
                    {f.isNew && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 shrink-0">NEW</span>}
                  </div>
                  <p className="text-[11px] text-f-muted">{f.size} · {f.date}</p>
                </div>
              </div>
            ); })}
          </div>
        </div>
        <div className="bg-f-surface border border-f-border rounded-xl overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-f-border"><h2 className="text-base font-bold text-f-text">Activity</h2></div>
          <div className="divide-y divide-f-border/50">
            {acts.length === 0 && <p className="px-6 py-8 text-sm text-f-muted text-center">No activity yet</p>}
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
