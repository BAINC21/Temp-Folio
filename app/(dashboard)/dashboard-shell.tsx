"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, NotificationBell } from "@/components";
import { NOTIFS } from "@/mock-data";
import { getLoggedInUser, signOut } from "@/app/actions";

const NAV = [
  { id: "/", label: "Dashboard", d: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" },
  { id: "/clients", label: "Clients", d: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2M9 7a4 4 0 100-8 4 4 0 000 8z" },
  { id: "/files", label: "Files", d: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6" },
  { id: "/messages", label: "Messages", d: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" },
  { id: "/notifications", label: "Notifications", d: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" },
  { id: "/settings", label: "Settings", d: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" },
];

const BILLING = [
  { label: "Invoices", href: "/invoices", d: "M1 4h22v16H1zM1 10h22" },
  { label: "Payments", href: "/payments", d: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" },
];

function Icon({ d }: { d: string }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;
}

type UserInfo = { id: string; email: string; name: string; brandName: string | null; brandColor: string; plan: string } | null;

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sb, setSb] = useState(false);
  const [user, setUser] = useState<UserInfo>(null);

  useEffect(() => {
    getLoggedInUser().then(u => setUser(u as UserInfo));
  }, [pathname]); // Refresh user data on route change

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  const displayName = user?.brandName || user?.name || "User";
  const initials = (user?.name || "U").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const color = user?.brandColor || "#6C5CE7";

  return (
    <div className="min-h-screen bg-f-bg text-f-text">
      {sb && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSb(false)} />}

      <aside className={`fixed top-0 bottom-0 w-60 bg-f-surface border-r border-f-border flex flex-col z-40 transition-transform duration-300 ${sb ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-br from-f-accent to-f-accent-lt bg-clip-text text-transparent font-display">folio</Link>
          <button onClick={() => setSb(false)} className="lg:hidden text-f-muted hover:text-f-text">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <nav className="flex-1 px-3 overflow-y-auto">
          <p className="text-[10px] font-semibold uppercase tracking-[1.5px] text-f-muted px-3 mb-2">Workspace</p>
          {NAV.map((n) => (
            <Link key={n.id} href={n.id} onClick={() => setSb(false)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5 ${isActive(n.id) ? "bg-f-accent/15 text-f-accent-lt" : "text-f-muted hover:bg-f-hover hover:text-f-text"}`}>
              <Icon d={n.d} />{n.label}
            </Link>
          ))}
          <p className="text-[10px] font-semibold uppercase tracking-[1.5px] text-f-muted px-3 mb-2 mt-5">Billing</p>
          {BILLING.map((b) => (
            <Link key={b.label} href={b.href} onClick={() => setSb(false)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5 ${isActive(b.href) ? "bg-f-accent/15 text-f-accent-lt" : "text-f-muted hover:bg-f-hover hover:text-f-text"}`}>
              <Icon d={b.d} />{b.label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-3 border-t border-f-border">
          <Link href="/settings" className="flex items-center gap-3 hover:opacity-80 transition-opacity mb-2">
            <Avatar text={initials} color={color} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-f-text truncate">{displayName}</div>
              <div className="text-[11px] text-f-muted">{user?.plan || "Free"} Plan</div>
            </div>
          </Link>
          <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-f-muted hover:bg-f-hover hover:text-f-text transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
            Sign Out
          </button>
        </div>
      </aside>

      <main className="lg:ml-60 min-h-screen">
        <div className="sticky top-0 z-20 lg:hidden flex items-center justify-between px-4 py-3 border-b border-f-border" style={{ background: "rgba(15,15,18,0.9)", backdropFilter: "blur(12px)" }}>
          <button onClick={() => setSb(true)} className="p-2 -ml-2 rounded-lg hover:bg-white/[0.06]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8E8ED" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
          </button>
          <Link href="/" className="text-lg font-bold bg-gradient-to-br from-f-accent to-f-accent-lt bg-clip-text text-transparent font-display">folio</Link>
          <NotificationBell notifications={NOTIFS} />
        </div>

        <div className="hidden lg:flex items-center justify-end px-8 pt-6 pb-2">
          <NotificationBell notifications={NOTIFS} />
        </div>

        <div className="p-4 sm:p-6 lg:px-8 lg:pb-8 lg:pt-2">
          {children}
        </div>
      </main>
    </div>
  );
}
