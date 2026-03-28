"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";

// ─── Badge ───
const STATUS: Record<string, { label: string; bg: string; text: string; dot?: string }> = {
  active:    { label: "Active",    bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  ACTIVE:    { label: "Active",    bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  review:    { label: "In Review", bg: "bg-amber-500/10",   text: "text-amber-400",   dot: "bg-amber-400" },
  IN_REVIEW: { label: "In Review", bg: "bg-amber-500/10",   text: "text-amber-400",   dot: "bg-amber-400" },
  overdue:   { label: "Overdue",   bg: "bg-red-500/10",     text: "text-red-400",     dot: "bg-red-400" },
  OVERDUE:   { label: "Overdue",   bg: "bg-red-500/10",     text: "text-red-400",     dot: "bg-red-400" },
  completed: { label: "Done",      bg: "bg-blue-500/10",    text: "text-blue-400",    dot: "bg-blue-400" },
  COMPLETED: { label: "Done",      bg: "bg-blue-500/10",    text: "text-blue-400",    dot: "bg-blue-400" },
  PAID:      { label: "Paid",      bg: "bg-emerald-500/10", text: "text-emerald-400" },
  paid:      { label: "Paid",      bg: "bg-emerald-500/10", text: "text-emerald-400" },
  SENT:      { label: "Sent",      bg: "bg-blue-500/10",    text: "text-blue-400" },
  pending:   { label: "Pending",   bg: "bg-amber-500/10",   text: "text-amber-400" },
  DRAFT:     { label: "Draft",     bg: "bg-gray-500/10",    text: "text-gray-400" },
};

export function Badge({ status }: { status: string }) {
  const c = STATUS[status] ?? STATUS.active;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${c.bg} ${c.text}`}>
      {c.dot && <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />}
      {c.label}
    </span>
  );
}

// ─── Avatar ───
export function Avatar({ text, color = "#6C5CE7", size = 32 }: { text: string; color?: string; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.3, background: color }}
    >
      {text}
    </div>
  );
}

// ─── Sparkline ───
export function Sparkline({ data, color = "#6C5CE7", w = 120, h = 36 }: { data: number[]; color?: string; w?: number; h?: number }) {
  const mx = Math.max(...data), mn = Math.min(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - mn) / (mx - mn || 1)) * (h - 4) - 2}`).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill="url(#sg)" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── ProgressRing ───
export function ProgressRing({ value, size = 112, stroke = 7, color = "#6C5CE7" }: { value: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, o = c - (value / 100) * c;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-white/[0.06]" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={o} strokeLinecap="round" className="transition-all duration-1000" />
    </svg>
  );
}

// ─── Sidebar ───
const NAV = [
  { id: "dashboard", label: "Dashboard", d: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" },
  { id: "projects",  label: "Projects",  d: "M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" },
  { id: "clients",   label: "Clients",   d: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2M9 7a4 4 0 100-8 4 4 0 000 8z" },
  { id: "files",     label: "Files",     d: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6" },
];

export function Sidebar({ activePage, onNavigate, open, onClose }: {
  activePage: string; onNavigate: (p: string) => void; open: boolean; onClose: () => void;
}) {
  const Icon = ({ d }: { d: string }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
  );

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 bottom-0 w-60 bg-f-surface border-r border-f-border flex flex-col z-40 transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <span className="text-2xl font-bold bg-gradient-to-br from-f-accent to-f-accent-lt bg-clip-text text-transparent font-display">folio</span>
          <button onClick={onClose} className="lg:hidden text-f-muted hover:text-f-text">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <nav className="flex-1 px-3 overflow-y-auto">
          <p className="text-[10px] font-semibold uppercase tracking-[1.5px] text-f-muted px-3 mb-2">Workspace</p>
          {NAV.map((n) => (
            <button key={n.id} onClick={() => { onNavigate(n.id); onClose(); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5 ${activePage === n.id ? "bg-f-accent/15 text-f-accent-lt" : "text-f-muted hover:bg-f-hover hover:text-f-text"}`}>
              <Icon d={n.d} />{n.label}
            </button>
          ))}
          <p className="text-[10px] font-semibold uppercase tracking-[1.5px] text-f-muted px-3 mb-2 mt-5">Billing</p>
          {[{ l: "Invoices", d: "M1 4h22v16H1zM1 10h22" }, { l: "Payments", d: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" }].map((b) => (
            <button key={b.l} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-f-muted hover:bg-f-hover hover:text-f-text transition-all mb-0.5"><Icon d={b.d} />{b.l}</button>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-f-border flex items-center gap-3">
          <Avatar text="JD" color="#6C5CE7" />
          <div><div className="text-sm font-semibold text-f-text">Jane Doe</div><div className="text-[11px] text-f-muted">Pro Plan</div></div>
        </div>
      </aside>
    </>
  );
}

// ─── NotificationBell ───
export function NotificationBell({ notifications = [] }: { notifications?: Array<{ id: string; text: string; time: string; read: boolean }> }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-lg hover:bg-white/[0.06] transition-colors">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8888A0" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" /></svg>
        {unread > 0 && <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#FF5C35] text-[9px] font-bold text-white flex items-center justify-center animate-pulse">{unread}</span>}
      </button>
      {open && notifications.length > 0 && (
        <div className="absolute right-0 top-12 w-80 bg-[#1C1C26] border border-f-border rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-f-border flex items-center justify-between">
            <span className="text-sm font-bold text-f-text">Notifications</span>
            <button className="text-[11px] text-f-accent font-semibold hover:text-f-accent-lt">Mark all read</button>
          </div>
          {notifications.map((n) => (
            <div key={n.id} className={`px-4 py-3 flex gap-3 items-start hover:bg-white/[0.03] transition-colors ${n.read ? "opacity-50" : ""}`}>
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.read ? "bg-[#3A3A48]" : "bg-f-accent"}`} />
              <div><div className="text-sm text-f-text">{n.text}</div><div className="text-[11px] text-f-muted mt-0.5">{n.time}</div></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Modal shell ───
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1C1C26] border border-f-border rounded-2xl w-full max-w-md shadow-2xl">
        <div className="px-6 py-4 border-b border-f-border flex items-center justify-between">
          <h2 className="text-lg font-bold text-f-text">{title}</h2>
          <button onClick={onClose} className="text-f-muted hover:text-f-text transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Color helpers ───
export const progressColor = (status: string) =>
  status === "OVERDUE" || status === "overdue" ? "#FF6B6B" :
  status === "IN_REVIEW" || status === "review" ? "#FFB946" : "#6C5CE7";

export const EXT_COLORS: Record<string, string> = {
  SVG: "#6C5CE7", PDF: "#FF5C35", DOC: "#3B82F6", FIG: "#00D68F",
  PNG: "#6C5CE7", JPG: "#FFB946", DOCX: "#3B82F6", XLS: "#00D68F",
};

export function fileExt(name: string) {
  return name.split(".").pop()?.toUpperCase() ?? "";
}

// ─── DatePicker ───
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYNAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function DatePicker({ value, onChange, placeholder = "Select date" }: {
  value: string; onChange: (val: string) => void; placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [flipUp, setFlipUp] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  const selected = value ? new Date(value + "T00:00:00") : null;
  const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? today.getMonth());
  const [viewYear, setViewYear] = useState(selected?.getFullYear() ?? today.getFullYear());

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setFlipUp(spaceBelow < 340);
    }
  }, [open]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const pick = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    onChange(`${viewYear}-${m}-${d}`);
    setOpen(false);
  };

  const prev = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const next = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  const displayValue = selected ? `${MONTHS[selected.getMonth()]} ${selected.getDate()}, ${selected.getFullYear()}` : "";
  const isToday = (day: number) => day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  const isSelected = (day: number) => selected != null && day === selected.getDate() && viewMonth === selected.getMonth() && viewYear === selected.getFullYear();

  return (
    <div className="relative" ref={ref}>
      <div className="relative cursor-pointer" ref={triggerRef} onClick={() => { setOpen(!open); if (selected) { setViewMonth(selected.getMonth()); setViewYear(selected.getFullYear()); } }}>
        <input readOnly value={displayValue} placeholder={placeholder}
          className="w-full px-4 py-2.5 pr-10 rounded-lg bg-f-bg border border-f-border text-sm text-f-text placeholder-[#555] focus:border-f-accent focus:outline-none cursor-pointer" />
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8888A0" strokeWidth="1.8" strokeLinecap="round">
          <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      </div>
      {open && (
        <div className={`absolute z-50 w-72 bg-[#1C1C26] border border-f-border rounded-xl shadow-2xl p-4 ${flipUp ? "bottom-full mb-2" : "top-full mt-2"}`}>
          <div className="flex items-center justify-between mb-3">
            <button onClick={prev} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-f-muted hover:text-f-text transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <span className="text-sm font-semibold text-f-text">{MONTHS[viewMonth]} {viewYear}</span>
            <button onClick={next} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-f-muted hover:text-f-text transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {DAYNAMES.map(d => <div key={d} className="text-center text-[10px] font-semibold text-f-muted py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((day, i) => day === null ? <div key={`e${i}`} /> : (
              <button key={day} onClick={() => pick(day)}
                className={`w-8 h-8 rounded-lg text-xs font-medium flex items-center justify-center transition-all
                  ${isSelected(day) ? "bg-f-accent text-white font-bold" : ""}
                  ${isToday(day) && !isSelected(day) ? "ring-1 ring-f-accent text-f-accent" : ""}
                  ${!isSelected(day) && !isToday(day) ? "text-f-text hover:bg-white/[0.06]" : ""}`}>
                {day}
              </button>
            ))}
          </div>
          {value && <button onClick={() => { onChange(""); setOpen(false); }} className="mt-2 w-full text-center text-xs text-f-muted hover:text-f-text transition-colors py-1">Clear date</button>}
        </div>
      )}
    </div>
  );
}

// ─── Toast Notification ───
export function Toast({ message, type = "success", show, onClose }: {
  message: string; type?: "success" | "error"; show: boolean; onClose: () => void;
}) {
  useEffect(() => {
    if (show) {
      const t = setTimeout(onClose, 5000);
      return () => clearTimeout(t);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-[slideUp_0.3s_ease-out]">
      <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border ${
        type === "success"
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
          : "bg-red-500/10 border-red-500/30 text-red-400"
      }`} style={{ backdropFilter: "blur(12px)" }}>
        {type === "success" ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" /></svg>
        )}
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100 transition-opacity">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
}
