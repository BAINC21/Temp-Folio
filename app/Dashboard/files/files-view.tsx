"use client";

import { useState } from "react";
import Link from "next/link";
import { EXT_COLORS, fileExt } from "@/components";
import { ALL_FILES, PROJECTS, getClient } from "@/mock-data";

const CATEGORIES = ["all", "deliverable", "asset", "brief", "contract", "other"] as const;

export default function FilesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");

  const filtered = ALL_FILES.filter(f => {
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (category !== "all" && f.cat !== category) return false;
    if (projectFilter !== "all" && f.projectId !== projectFilter) return false;
    return true;
  });

  // Group by project
  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, f) => {
    const key = f.projectId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(f);
    return acc;
  }, {});

  const totalSize = ALL_FILES.length;
  const deliverableCount = ALL_FILES.filter(f => f.cat === "deliverable").length;

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-f-text tracking-tight font-display">Files</h1>
          <p className="text-sm text-f-muted mt-1">{totalSize} files · {deliverableCount} deliverables</p>
        </div>
        <button className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-f-accent shadow-lg shadow-f-accent/25 hover:-translate-y-0.5 transition-all flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
          Upload Files
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8888A0" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-f-surface border border-f-border text-sm text-f-text placeholder-[#555] focus:border-f-accent focus:outline-none"
            placeholder="Search files..."
          />
        </div>
        <div className="flex gap-1.5 p-1 rounded-lg bg-f-surface border border-f-border overflow-x-auto">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize whitespace-nowrap transition-all ${category === cat ? "bg-f-accent/15 text-f-accent-lt" : "text-f-muted hover:text-f-text"}`}>
              {cat}
            </button>
          ))}
        </div>
        <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)}
          className="px-3 py-2.5 rounded-lg bg-f-surface border border-f-border text-sm text-f-text focus:border-f-accent focus:outline-none appearance-none">
          <option value="all">All projects</option>
          {PROJECTS.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      </div>

      {/* File list grouped by project */}
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16">
          <svg className="mx-auto mb-3 opacity-30" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8888A0" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /></svg>
          <p className="text-f-muted text-sm">No files match your filters</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([pid, files]) => {
            const proj = PROJECTS.find(p => p.id === pid);
            const cl = proj ? getClient(proj.clientId) : null;
            return (
              <div key={pid} className="bg-f-surface border border-f-border rounded-xl overflow-hidden">
                <div className="px-4 sm:px-6 py-3.5 flex items-center gap-3 border-b border-f-border">
                  {cl && <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0" style={{ background: cl.color }}>{cl.avatar[0]}</div>}
                  <Link href={`/project/${pid}`} className="text-sm font-bold text-f-text hover:text-f-accent-lt transition-colors">{proj?.title}</Link>
                  <span className="text-xs text-f-muted">{files.length} file{files.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="divide-y divide-f-border/50">
                  {files.map(f => {
                    const ext = fileExt(f.name);
                    return (
                      <div key={f.id} className="px-4 sm:px-6 py-3 flex items-center gap-3 hover:bg-f-hover transition-colors group">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: EXT_COLORS[ext] || "#8888A0" }}>{ext}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-f-text truncate">{f.name}</p>
                            {f.isNew && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 shrink-0">NEW</span>}
                          </div>
                          <p className="text-[11px] text-f-muted">{f.size} · {f.date} · <span className="capitalize">{f.cat}</span></p>
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 px-3 py-1.5 rounded-lg text-xs font-semibold text-f-accent border border-f-accent/30 hover:bg-f-accent/10 transition-all">
                          Download
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
