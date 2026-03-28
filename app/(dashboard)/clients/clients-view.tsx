"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Avatar, Badge, Modal, Toast } from "@/components";
import { CLIENTS as MOCK_CLIENTS, PROJECTS } from "@/mock-data";
import { createClient, getUserClients } from "@/app/actions";

type DbClient = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  createdAt: Date;
  projects: Array<{ id: string; title: string; status: string; progress: number }>;
};

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" as "success" | "error" });
  const [dbClients, setDbClients] = useState<DbClient[]>([]);
  const [loading, setLoading] = useState(true);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
  }, []);

  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const clients = await getUserClients();
      setDbClients(clients as unknown as DbClient[]);
    } catch {
      // Fall back to empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadClients(); }, [loadClients]);

  // Merge mock clients + real DB clients for display
  const mockCards = MOCK_CLIENTS.map(c => ({
    id: c.id,
    name: c.name,
    email: c.email,
    company: c.company,
    avatar: c.avatar,
    color: c.color,
    isMock: true,
    projects: PROJECTS.filter(p => p.clientId === c.id),
  }));

  const dbCards = dbClients.map(c => ({
    id: c.id,
    name: c.name,
    email: c.email,
    company: c.company || "",
    avatar: (c.company || c.name).substring(0, 2).toUpperCase(),
    color: "#6C5CE7",
    isMock: false,
    projects: c.projects || [],
  }));

  const allClients = [...dbCards, ...mockCards];

  const filtered = allClients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-f-text tracking-tight font-display">Clients</h1>
          <p className="text-sm text-f-muted mt-1">{dbClients.length} saved · {MOCK_CLIENTS.length} demo</p>
        </div>
        <button onClick={() => setModal(true)} className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-f-accent shadow-lg shadow-f-accent/25 hover:-translate-y-0.5 transition-all flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
          Add Client
        </button>
      </div>

      {/* Search + Refresh */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8888A0" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-f-surface border border-f-border text-sm text-f-text placeholder-[#555] focus:border-f-accent focus:outline-none"
            placeholder="Search clients..." />
        </div>
        <button onClick={loadClients} disabled={loading}
          className="px-4 py-2.5 rounded-lg text-sm font-semibold text-f-muted border border-f-border hover:border-f-muted hover:text-f-text transition-all flex items-center gap-2 disabled:opacity-50">
          <svg className={loading ? "animate-spin" : ""} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Client cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(c => {
          const activeCount = c.projects.filter((p: { status: string }) => p.status === "ACTIVE" || p.status === "IN_REVIEW").length;
          return (
            <div key={c.id} className={`bg-f-surface border rounded-xl p-5 hover:border-[#3A3A48] hover:-translate-y-0.5 transition-all group ${c.isMock ? "border-f-border" : "border-f-accent/30"}`}>
              {!c.isMock && <div className="text-[9px] font-bold text-f-accent mb-2 uppercase tracking-wider">Saved</div>}
              <div className="flex items-start gap-4 mb-4">
                <Avatar text={c.avatar} color={c.color} size={44} />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-f-text truncate">{c.company || c.name}</h3>
                  <p className="text-xs text-f-muted truncate">{c.name}</p>
                  <p className="text-xs text-f-muted truncate">{c.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1"><p className="text-[10px] text-f-muted font-medium uppercase tracking-wider mb-0.5">Projects</p><p className="text-lg font-bold text-f-text">{c.projects.length}</p></div>
                <div className="flex-1"><p className="text-[10px] text-f-muted font-medium uppercase tracking-wider mb-0.5">Active</p><p className="text-lg font-bold text-f-text">{activeCount}</p></div>
                <div className="flex-1"><p className="text-[10px] text-f-muted font-medium uppercase tracking-wider mb-0.5">Status</p><Badge status={activeCount > 0 ? "ACTIVE" : c.projects.length > 0 ? "COMPLETED" : "DRAFT"} /></div>
              </div>
              {c.projects.length > 0 && (
                <div className="space-y-1.5 mb-4">
                  {c.projects.slice(0, 2).map((p: { id: string; title: string; status: string; progress: number }) => (
                    <Link key={p.id} href={`/project/${p.id}`} className="flex items-center gap-2 text-xs hover:text-f-accent-lt transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: p.status === "OVERDUE" ? "#FF6B6B" : p.status === "IN_REVIEW" ? "#FFB946" : "#6C5CE7" }} />
                      <span className="text-f-text truncate">{p.title}</span>
                      <span className="text-f-muted ml-auto shrink-0">{p.progress}%</span>
                    </Link>
                  ))}
                </div>
              )}
              <div className="flex gap-2 pt-3 border-t border-f-border/50">
                <Link href={`/portal/${c.id}`} className="flex-1 text-center px-3 py-2 rounded-lg text-xs font-semibold text-f-muted border border-f-border hover:border-f-muted hover:text-f-text transition-all">View Portal</Link>
                <button className="flex-1 text-center px-3 py-2 rounded-lg text-xs font-semibold text-f-accent border border-f-accent/30 hover:bg-f-accent/10 transition-all">Send Magic Link</button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && <div className="text-center py-16"><p className="text-f-muted text-sm">No clients match &quot;{search}&quot;</p></div>}

      <Modal open={modal} onClose={() => setModal(false)} title="Add Client">
        <NewClientForm onClose={() => setModal(false)} onSuccess={(name) => { showToast(`Client "${name}" saved successfully`); loadClients(); }} />
      </Modal>

      <Toast message={toast.message} type={toast.type} show={toast.show} onClose={() => setToast(t => ({ ...t, show: false }))} />
    </>
  );
}

function NewClientForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: (name: string) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setSaving(true);
    setError("");
    try {
      const result = await createClient({ name, email, company: company || undefined });
      onClose();
      onSuccess(result.company || result.name);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create client");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="p-6 space-y-4">
        {error && <div className="px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>}
        <div>
          <label className="block text-xs font-semibold text-f-muted mb-1.5">Contact Name</label>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-f-bg border border-f-border text-sm text-f-text placeholder-[#555] focus:border-f-accent focus:outline-none" placeholder="Alex Morgan" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-f-muted mb-1.5">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-f-bg border border-f-border text-sm text-f-text placeholder-[#555] focus:border-f-accent focus:outline-none" placeholder="alex@company.com" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-f-muted mb-1.5">Company</label>
          <input value={company} onChange={e => setCompany(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-f-bg border border-f-border text-sm text-f-text placeholder-[#555] focus:border-f-accent focus:outline-none" placeholder="Bloom Studio" />
        </div>
      </div>
      <div className="px-6 py-4 border-t border-f-border flex gap-3 justify-end">
        <button onClick={onClose} className="px-4 py-2.5 rounded-lg text-sm font-semibold text-f-muted border border-f-border hover:text-f-text transition-all">Cancel</button>
        <button onClick={handleSubmit} disabled={!name || !email || saving} className="px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-f-accent shadow-lg shadow-f-accent/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
          {saving ? "Adding..." : "Add Client"}
        </button>
      </div>
    </>
  );
}
