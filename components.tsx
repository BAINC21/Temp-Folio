"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";

// ─── Badge ───
const STATUS: Record<string, { label: string; bg: string; text: string; dot?: string }> = {
  active: { label: "Active", bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  ACTIVE: { label: "Active", bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  review: { label: "In Review", bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
  IN_REVIEW: { label: "In Review", bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
  overdue: { label: "Overdue", bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
  OVERDUE: { label: "Overdue", bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
  completed: { label: "Done", bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-400" },
  COMPLETED: { label: "Done", bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-400" },
  ON_HOLD: { label: "On Hold", bg: "bg-gray-500/10", text: "text-gray-400", dot: "bg-gray-400" },
  PAID: { label: "Paid", bg: "bg-emerald-500/10", text: "text-emerald-400" },
  paid: { label: "Paid", bg: "bg-emerald-500/10", text: "text-emerald-400" },
  SENT: { label: "Sent", bg: "bg-blue-500/10", text: "text-blue-400" },
  pending: { label: "Pending", bg: "bg-amber-500/10", text: "text-amber-400" },
  DRAFT: { label: "Draft", bg: "bg-gray-500/10", text: "text-gray-400" },
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
    <div className="rounded-full flex items-center justify-center font-bold text-white shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.3, background: color }}>
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
      <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.2" /><stop offset="100%" stopColor={color} stopOpacity="0.01" /></linearGradient></defs>
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
            <a key={n.id} href="/notifications" className={`px-4 py-3 flex gap-3 items-start hover:bg-white/[0.03] transition-colors cursor-pointer ${n.read ? "opacity-50" : ""}`}>
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.read ? "bg-[#3A3A48]" : "bg-f-accent"}`} />
              <div><div className="text-sm text-f-text">{n.text}</div><div className="text-[11px] text-f-muted mt-0.5">{n.time}</div></div>
            </a>
          ))}
          <a href="/notifications" className="block px-4 py-3 text-center text-xs font-semibold text-f-accent hover:text-f-accent-lt border-t border-f-border transition-colors">
            View all notifications →
          </a>
        </div>
      )}
    </div>
  );
}

// ─── Modal ───
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1C1C26] border border-f-border rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-f-border flex items-center justify-between sticky top-0 bg-[#1C1C26] z-10">
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

// ─── Confirm Dialog ───
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = "Delete", danger = true }: {
  open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; confirmLabel?: string; danger?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-[#1C1C26] border border-f-border rounded-2xl w-full max-w-sm shadow-2xl p-6">
        <h3 className="text-base font-bold text-f-text mb-2">{title}</h3>
        <p className="text-sm text-f-muted mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2.5 rounded-lg text-sm font-semibold text-f-muted border border-f-border hover:text-f-text transition-all">Cancel</button>
          <button onClick={onConfirm} className={`px-4 py-2.5 rounded-lg text-sm font-bold text-white transition-all ${danger ? "bg-red-500 hover:bg-red-600" : "bg-f-accent hover:bg-f-accent/80"}`}>{confirmLabel}</button>
        </div>
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
      setFlipUp(window.innerHeight - rect.bottom < 340);
    }
  }, [open]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const pick = (day: number) => { onChange(`${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`); setOpen(false); };
  const prev = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const next = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };
  const displayValue = selected ? `${MONTHS[selected.getMonth()]} ${selected.getDate()}, ${selected.getFullYear()}` : "";
  const isToday = (day: number) => day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  const isSelected = (day: number) => selected != null && day === selected.getDate() && viewMonth === selected.getMonth() && viewYear === selected.getFullYear();

  return (
    <div className="relative" ref={ref}>
      <div className="relative cursor-pointer" ref={triggerRef} onClick={() => { setOpen(!open); if (selected) { setViewMonth(selected.getMonth()); setViewYear(selected.getFullYear()); } }}>
        <input readOnly value={displayValue} placeholder={placeholder} className="w-full px-4 py-2.5 pr-10 rounded-lg bg-f-bg border border-f-border text-sm text-f-text placeholder-[#555] focus:border-f-accent focus:outline-none cursor-pointer" />
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8888A0" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
      </div>
      {open && (
        <div className={`absolute z-50 w-72 bg-[#1C1C26] border border-f-border rounded-xl shadow-2xl p-4 ${flipUp ? "bottom-full mb-2" : "top-full mt-2"}`}>
          <div className="flex items-center justify-between mb-3">
            <button onClick={prev} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-f-muted hover:text-f-text transition-colors"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg></button>
            <span className="text-sm font-semibold text-f-text">{MONTHS[viewMonth]} {viewYear}</span>
            <button onClick={next} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-f-muted hover:text-f-text transition-colors"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg></button>
          </div>
          <div className="grid grid-cols-7 gap-0.5 mb-1">{DAYNAMES.map(d => <div key={d} className="text-center text-[10px] font-semibold text-f-muted py-1">{d}</div>)}</div>
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((day, i) => day === null ? <div key={`e${i}`} /> : (
              <button key={day} onClick={() => pick(day)} className={`w-8 h-8 rounded-lg text-xs font-medium flex items-center justify-center transition-all ${isSelected(day) ? "bg-f-accent text-white font-bold" : ""} ${isToday(day) && !isSelected(day) ? "ring-1 ring-f-accent text-f-accent" : ""} ${!isSelected(day) && !isToday(day) ? "text-f-text hover:bg-white/[0.06]" : ""}`}>{day}</button>
            ))}
          </div>
          {value && <button onClick={() => { onChange(""); setOpen(false); }} className="mt-2 w-full text-center text-xs text-f-muted hover:text-f-text transition-colors py-1">Clear date</button>}
        </div>
      )}
    </div>
  );
}

// ─── Toast ───
export function Toast({ message, type = "success", show, onClose }: {
  message: string; type?: "success" | "error"; show: boolean; onClose: () => void;
}) {
  useEffect(() => { if (show) { const t = setTimeout(onClose, 5000); return () => clearTimeout(t); } }, [show, onClose]);
  if (!show) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-[slideUp_0.3s_ease-out]">
      <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border ${type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"}`} style={{ backdropFilter: "blur(12px)" }}>
        {type === "success" ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" /></svg>
        )}
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100 transition-opacity"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
      </div>
    </div>
  );
}
