"use client";
import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, Badge, Toast, ConfirmDialog, progressColor } from "@/components";
import { getUserClients, deleteClient, generateMagicLink } from "@/app/actions";

type Project = {
  id: string;
  title: string;
  status: string;
  progress: number;
  dueDate: string | null;
};

type ClientDetail = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  portalSlug: string;
  projects: Project[];
};

export default function ClientDetailView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" as "success" | "error" });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
  }, []);

  useEffect(() => {
    getUserClients()
      .then((clients) => {
        const found = clients.find((c) => c.id === id);
        if (found) {
          setClient({
            id: found.id,
            name: found.name,
            email: found.email,
            company: found.company || null,
            phone: (found as unknown as { phone?: string | null }).phone || null,
            portalSlug: found.portalSlug,
            projects: (found.projects || []).map((p) => ({
              id: p.id,
              title: p.title,
              status: p.status,
              progress: p.progress,
              dueDate: null,
            })),
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!client) return;
    setDeleting(true);
    try {
      await deleteClient(client.id);
      router.push("/clients");
      router.refresh();
    } catch {
      showToast("Failed to delete client", "error");
      setDeleting(false);
    }
  };

  const handleMagicLink = async () => {
    if (!client) return;
    setGeneratingLink(true);
    try {
      const result = await generateMagicLink(client.id);
      const url = `${window.location.origin}/portal/auth?token=${result.token}`;
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      showToast("Magic link copied to clipboard!");
      setTimeout(() => setLinkCopied(false), 3000);
    } catch {
      showToast("Failed to generate magic link", "error");
    } finally {
      setGeneratingLink(false);
    }
  };

  const handleCopyPortalUrl = async () => {
    if (!client) return;
    const url = `${window.location.origin}/portal/${client.portalSlug}`;
    try {
      await navigator.clipboard.writeText(url);
      setUrlCopied(true);
      showToast("Portal URL copied!");
      setTimeout(() => setUrlCopied(false), 3000);
    } catch {
      showToast("Failed to copy", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#6C5CE7" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-20">
        <p className="text-f-muted text-sm mb-4">Client not found</p>
        <Link href="/clients" className="text-xs font-semibold text-f-accent hover:text-f-accent-lt transition-colors">
          ← Back to Clients
        </Link>
      </div>
    );
  }

  const initials = (client.company || client.name).substring(0, 2).toUpperCase();
  const activeProjects = client.projects.filter((p) => p.status === "ACTIVE" || p.status === "IN_REVIEW").length;
  const completedProjects = client.projects.filter((p) => p.status === "COMPLETED").length;
  const portalUrl = typeof window !== "undefined" ? `${window.location.origin}/portal/${client.portalSlug}` : `/portal/${client.portalSlug}`;

  return (
    <>
      {/* Back */}
      <Link href="/clients" className="inline-flex items-center gap-2 text-sm text-f-muted hover:text-f-text transition-colors mb-6">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Clients
      </Link>

      {/* Hero card */}
      <div className="bg-f-surface border border-f-accent/30 rounded-2xl p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          {/* Avatar + info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Avatar text={initials} color="#6C5CE7" size={64} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-f-text tracking-tight font-display">
                  {client.company || client.name}
                </h1>
                <span className="text-[9px] font-bold text-f-accent uppercase tracking-wider px-2 py-0.5 rounded-full bg-f-accent/10">
                  Saved
                </span>
              </div>
              {client.company && <p className="text-sm text-f-muted mt-0.5">{client.name}</p>}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                <span className="flex items-center gap-1.5 text-xs text-f-muted">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6" /></svg>
                  {client.email}
                </span>
                {client.phone && (
                  <span className="flex items-center gap-1.5 text-xs text-f-muted">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>
                    {client.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 shrink-0">
            <a
              href={portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-lg text-xs font-semibold text-f-muted border border-f-border hover:border-f-muted hover:text-f-text transition-all flex items-center gap-1.5"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
              </svg>
              View Portal
            </a>
            <button
              onClick={handleCopyPortalUrl}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                urlCopied ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/10" : "text-f-muted border-f-border hover:border-f-muted hover:text-f-text"
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {urlCopied
                  ? <path d="M20 6L9 17l-5-5" />
                  : <><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></>
                }
              </svg>
              {urlCopied ? "Copied!" : "Copy URL"}
            </button>
            <button
              onClick={handleMagicLink}
              disabled={generatingLink}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 disabled:opacity-50 ${
                linkCopied ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/10" : "text-f-accent border-f-accent/30 hover:bg-f-accent/10"
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {linkCopied
                  ? <path d="M20 6L9 17l-5-5" />
                  : <path d="M15 7h3a5 5 0 010 10h-3M9 17H6A5 5 0 016 7h3M8 12h8" />
                }
              </svg>
              {generatingLink ? "Generating..." : linkCopied ? "Copied!" : "Magic Link"}
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="px-3 py-2 rounded-lg text-xs font-semibold text-red-400 border border-red-400/30 hover:bg-red-400/10 transition-all flex items-center gap-1.5"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        {[
          { l: "Total Projects", v: String(client.projects.length), color: "text-f-text" },
          { l: "Active", v: String(activeProjects), color: "text-emerald-400" },
          { l: "Completed", v: String(completedProjects), color: "text-blue-400" },
        ].map((s, i) => (
          <div key={i} className="bg-f-surface border border-f-border rounded-xl p-4 sm:p-5">
            <p className="text-[11px] text-f-muted font-medium uppercase tracking-wider mb-1.5">{s.l}</p>
            <p className={`text-2xl sm:text-3xl font-bold tracking-tight ${s.color}`}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* Portal URL banner */}
      <div className="bg-f-surface border border-f-border rounded-xl px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-f-muted uppercase tracking-widest mb-1">Client Portal URL</p>
          <p className="text-sm text-f-text font-mono truncate opacity-70">{portalUrl}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleCopyPortalUrl}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-f-muted border border-f-border hover:text-f-text transition-all"
          >
            Copy
          </button>
          <a
            href={portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-f-accent border border-f-accent/30 hover:bg-f-accent/10 transition-all"
          >
            Open →
          </a>
        </div>
      </div>

      {/* Projects */}
      <div className="bg-f-surface border border-f-border rounded-xl overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-f-border flex items-center justify-between">
          <h2 className="text-base font-bold text-f-text">Projects</h2>
          <span className="text-xs text-f-muted">{client.projects.length} total</span>
        </div>

        {client.projects.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg className="mx-auto mb-3 opacity-20" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8888A0" strokeWidth="1.5">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            <p className="text-sm text-f-muted">No projects yet for this client</p>
            <p className="text-xs text-f-muted opacity-60 mt-1">Create a project from the Dashboard</p>
          </div>
        ) : (
          <div className="divide-y divide-f-border/50">
            {client.projects.map((p) => (
              <Link
                key={p.id}
                href={`/project/${p.id}`}
                className="px-5 sm:px-6 py-4 flex items-center gap-4 hover:bg-f-hover transition-colors group"
              >
                {/* Status dot */}
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: progressColor(p.status) }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-f-text truncate group-hover:text-f-accent-lt transition-colors">
                    {p.title}
                  </p>
                  {p.dueDate && <p className="text-xs text-f-muted mt-0.5">Due {p.dueDate}</p>}
                </div>
                <Badge status={p.status} />
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-28 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${p.progress}%`, background: progressColor(p.status) }}
                    />
                  </div>
                  <span className="text-xs text-f-muted tabular-nums w-8 text-right">{p.progress}%</span>
                </div>
                <svg
                  className="opacity-0 group-hover:opacity-40 transition-opacity shrink-0 text-f-muted"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete Client?"
        message={`"${client.company || client.name}" and all their projects and invoices will be permanently deleted. This cannot be undone.`}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
      />
    </>
  );
}
