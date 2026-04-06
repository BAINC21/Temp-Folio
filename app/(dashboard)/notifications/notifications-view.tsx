"use client";
import { useState, useEffect } from "react";
import { Badge, Toast } from "@/components";

type Notification = {
  id: string;
  text: string;
  detail?: string;
  time: string;
  type: "success" | "info" | "warning" | "danger";
  read: boolean;
  link?: string;
  readAt?: number;
};

const INITIAL_NOTIFS: Notification[] = [
  { id: "n1", text: "Bloom Studio approved logo concepts", detail: "Brand Refresh project milestone approved", time: "12 min ago", type: "success", read: false, link: "/project/p1" },
  { id: "n2", text: "New comment on TrekFit wireframes", detail: "Sam Rivera left feedback on the mobile app wireframes", time: "Yesterday", type: "warning", read: false, link: "/project/p3" },
  { id: "n3", text: "Invoice #038 is overdue", detail: "Madre Coffee — $950 was due Mar 20", time: "3 days ago", type: "danger", read: false, link: "/invoices" },
  { id: "n4", text: "Skyward Ventures paid invoice #041", detail: "$1,500 payment received via Stripe", time: "Yesterday", type: "success", read: true, link: "/payments" },
  { id: "n5", text: "You uploaded 3 files to Website Redesign", detail: "homepage-final.fig, inner-pages-v2.fig, sitemap.pdf", time: "2 hours ago", type: "info", read: true, link: "/project/p2" },
  { id: "n6", text: "New client added: BILOP Contr", detail: "Blame Iote — BL@gmail.com", time: "2 days ago", type: "info", read: true, link: "/clients" },
  { id: "n7", text: "Project deadline approaching", detail: "Brand Refresh due in 3 days — Apr 2, 2026", time: "3 days ago", type: "warning", read: true },
];

const dotColor = (t: string) =>
  t === "success" ? "bg-emerald-400" : t === "warning" ? "bg-amber-400" : t === "danger" ? "bg-red-400" : "bg-f-accent";

const bgColor = (t: string) =>
  t === "success" ? "bg-emerald-500/5" : t === "warning" ? "bg-amber-500/5" : t === "danger" ? "bg-red-500/5" : "bg-f-accent/5";

export default function NotificationsView() {
  const [notifs, setNotifs] = useState<Notification[]>(INITIAL_NOTIFS);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" as "success" | "error" });

  const unreadCount = notifs.filter((n) => !n.read).length;
  const filtered = filter === "unread" ? notifs.filter((n) => !n.read) : notifs;

  const markAsRead = (id: string) => {
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true, readAt: n.readAt ?? Date.now() } : n))
    );
  };

  const markAllRead = () => {
    const now = Date.now();
    setNotifs((prev) =>
      prev.map((n) => ({ ...n, read: true, readAt: n.readAt ?? now }))
    );
    setToast({ show: true, message: "All notifications marked as read", type: "success" });
  };

  const clearAll = () => {
    setNotifs([]);
    setToast({ show: true, message: "All notifications permanently cleared", type: "success" });
  };

  // Auto-delete read notifications after 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifs((prev) => {
        const now = Date.now();
        const next = prev.filter((n) => {
          if (!n.read) return true;
          if (!n.readAt) return true;
          return now - n.readAt < 5 * 60 * 1000;
        });
        if (next.length < prev.length) {
          setToast({
            show: true,
            message: `${prev.length - next.length} read notification(s) auto-removed`,
            type: "success",
          });
        }
        return next;
      });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-f-text tracking-tight font-display">Notifications</h1>
          <p className="text-sm text-f-muted mt-1">{unreadCount} unread · {notifs.length} total</p>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold text-f-muted border border-f-border hover:border-f-muted hover:text-f-text transition-all disabled:opacity-40"
          >
            Mark all read
          </button>
          <button
            onClick={clearAll}
            disabled={notifs.length === 0}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold text-red-400 border border-red-400/30 hover:bg-red-400/10 transition-all disabled:opacity-40"
          >
            Clear all
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 p-1 rounded-lg bg-f-surface border border-f-border w-fit mb-6">
        {(["all", "unread"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${
              filter === f ? "bg-f-accent/15 text-f-accent-lt" : "text-f-muted hover:text-f-text"
            }`}
          >
            {f === "unread" ? `Unread (${unreadCount})` : "All"}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div className="bg-f-surface border border-f-border rounded-xl overflow-hidden">
        {filtered.length === 0 && (
          <div className="px-6 py-12 text-center">
            <svg className="mx-auto mb-3 opacity-30" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8888A0" strokeWidth="1.5">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            <p className="text-f-muted text-sm">
              {filter === "unread" ? "No unread notifications" : "No notifications"}
            </p>
          </div>
        )}
        <div className="divide-y divide-f-border/50">
          {filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => markAsRead(n.id)}
              className={`px-5 py-4 flex gap-4 items-start cursor-pointer transition-colors hover:bg-f-hover ${
                !n.read ? bgColor(n.type) : ""
              }`}
            >
              <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${n.read ? "bg-[#3A3A48]" : dotColor(n.type)}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-relaxed ${n.read ? "text-f-muted" : "text-f-text font-medium"}`}>
                  {n.text}
                </p>
                {n.detail && <p className="text-xs text-f-muted mt-0.5">{n.detail}</p>}
                <p className="text-[11px] text-f-muted mt-1">{n.time}</p>
              </div>
              {!n.read && <Badge status="pending" />}
            </div>
          ))}
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
      />
    </>
  );
}
