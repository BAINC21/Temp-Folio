"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Toast, ConfirmDialog } from "@/components";
import { getLoggedInUser, updateSettings, signOut, getDeletedItems, restoreProject, permanentlyDeleteProject } from "@/app/actions";
import { createSupabaseClient } from "@/lib";

const PLANS = [
  { id: "FREE", name: "Free", price: "$0", desc: "1 client, 2 projects" },
  { id: "PRO", name: "Pro", price: "$19/mo", desc: "Unlimited clients & projects" },
  { id: "UNLIMITED", name: "Unlimited", price: "$49/mo", desc: "Custom domains, priority support" },
];

type DeletedProject = { id: string; title: string; deletedAt: Date | string; client: { name: string; company: string | null } };

export default function SettingsView() {
  const router = useRouter();
  const [tab, setTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [brandName, setBrandName] = useState("");
  const [brandColor, setBrandColor] = useState("#6C5CE7");
  const [userPlan, setUserPlan] = useState("FREE");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" as "success" | "error" });
  const showToast = useCallback((m: string, t: "success" | "error" = "success") => { setToast({ show: true, message: m, type: t }); }, []);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  const [deletedItems, setDeletedItems] = useState<DeletedProject[]>([]);
  const [loadingDeleted, setLoadingDeleted] = useState(false);
  const [permDeleteId, setPermDeleteId] = useState<string | null>(null);

  // Notification prefs (local for now)
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifProjectUpdates, setNotifProjectUpdates] = useState(true);
  const [notifInvoices, setNotifInvoices] = useState(true);
  const [notifMarketing, setNotifMarketing] = useState(false);

  useEffect(() => {
    getLoggedInUser().then(u => {
      if (u) { setName(u.name); setEmail(u.email); setBrandName(u.brandName || ""); setBrandColor(u.brandColor || "#6C5CE7"); setUserPlan(u.plan); }
      setLoading(false);
    });
  }, []);

  const loadDeleted = useCallback(async () => {
    setLoadingDeleted(true);
    try { const items = await getDeletedItems(); setDeletedItems(items as unknown as DeletedProject[]); } catch {}
    finally { setLoadingDeleted(false); }
  }, []);

  useEffect(() => { if (tab === "deleted") loadDeleted(); }, [tab, loadDeleted]);

  const handleSave = async () => {
    setSaving(true);
    try { await updateSettings({ name, brandName, brandColor }); showToast("Settings saved successfully"); }
    catch { showToast("Failed to save", "error"); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async () => {
    if (newPw !== confirmPw) { showToast("Passwords do not match", "error"); return; }
    if (newPw.length < 6) { showToast("Password must be at least 6 characters", "error"); return; }
    setPwSaving(true);
    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) throw error;
      showToast("Password updated successfully");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err: unknown) { showToast(err instanceof Error ? err.message : "Failed to update password", "error"); }
    finally { setPwSaving(false); }
  };

  const handleSignOut = async () => { await signOut(); router.push("/login"); router.refresh(); };

  const handleRestore = async (id: string) => {
    try { await restoreProject(id); showToast("Project restored"); loadDeleted(); } catch { showToast("Failed to restore", "error"); }
  };

  const handlePermDelete = async () => {
    if (!permDeleteId) return;
    try { await permanentlyDeleteProject(permDeleteId); showToast("Project permanently deleted"); setPermDeleteId(null); loadDeleted(); }
    catch { showToast("Failed to delete", "error"); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#6C5CE7" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" /></svg></div>;

  const plans = PLANS.map(p => ({ ...p, current: p.id === userPlan }));
  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "U";

  const Toggle = ({ checked, onChange: oc }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => oc(!checked)} className={`w-10 h-6 rounded-full transition-colors relative ${checked ? "bg-f-accent" : "bg-[#3A3A48]"}`}>
      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${checked ? "translate-x-5" : "translate-x-1"}`} />
    </button>
  );

  return (
    <>
      <div className="mb-8"><h1 className="text-2xl sm:text-3xl font-bold text-f-text tracking-tight font-display">Settings</h1><p className="text-sm text-f-muted mt-1">Manage your profile, branding, and account</p></div>

      <div className="flex gap-1 mb-8 p-1 rounded-lg bg-f-surface border border-f-border w-fit overflow-x-auto">
        {["profile", "branding", "security", "notifications", "deleted", "billing"].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-md text-sm font-semibold capitalize whitespace-nowrap transition-all ${tab === t ? "bg-f-accent/15 text-f-accent-lt" : "text-f-muted hover:text-f-text"}`}>
            {t === "deleted" ? "Recently Deleted" : t}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-f-surface border border-f-border rounded-xl p-6">
            <h2 className="text-base font-bold text-f-text mb-5">Profile</h2>
            <div className="flex items-center gap-5 mb-6"><Avatar text={initials} color={brandColor} size={56} /><div><button className="text-xs font-semibold text-f-accent hover:text-f-accent-lt transition-colors">Change avatar</button><p className="text-[11px] text-f-muted mt-0.5">JPG, PNG, or SVG. Max 2MB.</p></div></div>
            <div className="space-y-4">
              <div><label className="block text-xs font-semibold text-f-muted mb-1.5">Full Name</label><input value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-f-bg border border-f-border text-sm text-f-text focus:border-f-accent focus:outline-none" /></div>
              <div><label className="block text-xs font-semibold text-f-muted mb-1.5">Email</label><input value={email} readOnly className="w-full px-4 py-2.5 rounded-lg bg-f-bg border border-f-border text-sm text-f-muted focus:outline-none cursor-not-allowed" /><p className="text-[11px] text-f-muted mt-1">Email is managed through Supabase Auth</p></div>
            </div>
          </div>
          <div className="flex justify-end"><button onClick={handleSave} disabled={saving} className="px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-f-accent shadow-lg shadow-f-accent/25 transition-all disabled:opacity-60">{saving ? "Saving..." : "Save Changes"}</button></div>
        </div>
      )}

      {tab === "branding" && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-f-surface border border-f-border rounded-xl p-6">
            <h2 className="text-base font-bold text-f-text mb-2">Client Portal Branding</h2><p className="text-sm text-f-muted mb-5">Customize how your portal looks to clients</p>
            <div className="space-y-4">
              <div><label className="block text-xs font-semibold text-f-muted mb-1.5">Brand Name</label><input value={brandName} onChange={e => setBrandName(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-f-bg border border-f-border text-sm text-f-text focus:border-f-accent focus:outline-none" placeholder="Your Business Name" /></div>
              <div><label className="block text-xs font-semibold text-f-muted mb-1.5">Brand Color</label>
                <div className="flex items-center gap-3"><input type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)} className="w-10 h-10 rounded-lg border border-f-border cursor-pointer" /><input value={brandColor} onChange={e => setBrandColor(e.target.value)} className="w-28 px-3 py-2 rounded-lg bg-f-bg border border-f-border text-sm text-f-text font-mono focus:border-f-accent focus:outline-none" />
                  <div className="flex gap-1.5">{["#6C5CE7", "#00D68F", "#FF5C35", "#3B82F6", "#FFB946", "#EC4899"].map(c => (<button key={c} onClick={() => setBrandColor(c)} className="w-7 h-7 rounded-full border-2 transition-all" style={{ background: c, borderColor: brandColor === c ? "#fff" : "transparent" }} />))}</div></div></div>
            </div>
          </div>
          <div className="bg-f-surface border border-f-border rounded-xl p-6">
            <h2 className="text-base font-bold text-f-text mb-4">Portal Preview</h2>
            <div className="rounded-xl overflow-hidden border border-f-border">
              <div className="h-14 flex items-center px-6 gap-3" style={{ background: "rgba(250,250,248,0.95)", borderBottom: "1px solid #E8E6E1" }}><div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs" style={{ background: brandColor }}>{(brandName || name || "F").charAt(0)}</div><div><p className="text-sm font-bold" style={{ color: "#1A1A1A" }}>{brandName || name || "Your Brand"}</p><p className="text-[10px]" style={{ color: "#7D7A72" }}>Client Portal</p></div></div>
              <div className="h-24 flex items-center justify-center" style={{ background: "#FAFAF8" }}><div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: `${brandColor}20` }}><span className="text-2xl font-bold" style={{ color: brandColor }}>72%</span></div></div>
            </div>
          </div>
          <div className="flex justify-end"><button onClick={handleSave} disabled={saving} className="px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-f-accent shadow-lg shadow-f-accent/25 transition-all disabled:opacity-60">{saving ? "Saving..." : "Save Changes"}</button></div>
        </div>
      )}

      {tab === "security" && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-f-surface border border-f-border rounded-xl p-6">
            <h2 className="text-base font-bold text-f-text mb-5">Change Password</h2>
            <div className="space-y-4">
              <div><label className="block text-xs font-semibold text-f-muted mb-1.5">Current Password</label><input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-f-bg border border-f-border text-sm text-f-text placeholder-[#555] focus:border-f-accent focus:outline-none" placeholder="••••••••" /></div>
              <div><label className="block text-xs font-semibold text-f-muted mb-1.5">New Password</label><input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-f-bg border border-f-border text-sm text-f-text placeholder-[#555] focus:border-f-accent focus:outline-none" placeholder="••••••••" /></div>
              <div><label className="block text-xs font-semibold text-f-muted mb-1.5">Confirm New Password</label><input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-f-bg border border-f-border text-sm text-f-text placeholder-[#555] focus:border-f-accent focus:outline-none" placeholder="••••••••" /></div>
            </div>
            <div className="mt-5"><button onClick={handlePasswordChange} disabled={pwSaving || !newPw || !confirmPw} className="px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-f-accent shadow-lg shadow-f-accent/25 transition-all disabled:opacity-40">{pwSaving ? "Updating..." : "Update Password"}</button></div>
          </div>
          <div className="bg-f-surface border border-f-border rounded-xl p-6">
            <h2 className="text-base font-bold text-f-text mb-2">Sessions</h2><p className="text-sm text-f-muted mb-4">Sign out of your current session</p>
            <button onClick={handleSignOut} className="px-4 py-2.5 rounded-lg text-sm font-semibold text-f-muted border border-f-border hover:text-f-text hover:border-f-muted transition-all flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>Sign Out
            </button>
          </div>
          <div className="bg-f-surface border border-red-500/20 rounded-xl p-6"><h2 className="text-base font-bold text-f-text mb-2">Danger Zone</h2><p className="text-sm text-f-muted mb-4">Permanently delete your account and all data</p><button className="px-4 py-2.5 rounded-lg text-sm font-semibold text-red-400 border border-red-400/30 hover:bg-red-400/10 transition-all">Delete Account</button></div>
        </div>
      )}

      {tab === "notifications" && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-f-surface border border-f-border rounded-xl p-6">
            <h2 className="text-base font-bold text-f-text mb-5">Notification Preferences</h2>
            <div className="space-y-5">
              {[
                { label: "Email notifications", desc: "Receive notifications via email", checked: notifEmail, set: setNotifEmail },
                { label: "Project updates", desc: "Get notified when projects are updated", checked: notifProjectUpdates, set: setNotifProjectUpdates },
                { label: "Invoice reminders", desc: "Alerts for upcoming and overdue invoices", checked: notifInvoices, set: setNotifInvoices },
                { label: "Product updates", desc: "News about Folio features and updates", checked: notifMarketing, set: setNotifMarketing },
              ].map(n => (
                <div key={n.label} className="flex items-center justify-between">
                  <div><p className="text-sm font-semibold text-f-text">{n.label}</p><p className="text-xs text-f-muted">{n.desc}</p></div>
                  <Toggle checked={n.checked} onChange={n.set} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "deleted" && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-f-surface border border-f-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-f-border flex items-center justify-between">
              <h2 className="text-base font-bold text-f-text">Recently Deleted Projects</h2>
              <button onClick={loadDeleted} className="text-xs font-semibold text-f-accent hover:text-f-accent-lt">Refresh</button>
            </div>
            {loadingDeleted && <p className="px-6 py-8 text-sm text-f-muted text-center">Loading...</p>}
            {!loadingDeleted && deletedItems.length === 0 && <p className="px-6 py-8 text-sm text-f-muted text-center">No deleted items</p>}
            <div className="divide-y divide-f-border/50">
              {deletedItems.map(item => {
                const deletedDate = new Date(item.deletedAt);
                const daysLeft = Math.max(0, 30 - Math.floor((Date.now() - deletedDate.getTime()) / (1000 * 60 * 60 * 24)));
                return (
                  <div key={item.id} className="px-6 py-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-f-text truncate">{item.title}</p>
                      <p className="text-xs text-f-muted">{item.client.company || item.client.name} · {daysLeft} days until auto-delete</p>
                    </div>
                    <button onClick={() => handleRestore(item.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-f-accent border border-f-accent/30 hover:bg-f-accent/10 transition-all">Restore</button>
                    <button onClick={() => setPermDeleteId(item.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 border border-red-400/30 hover:bg-red-400/10 transition-all">Delete Now</button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === "billing" && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-f-surface border border-f-border rounded-xl p-6">
            <h2 className="text-base font-bold text-f-text mb-5">Plan</h2>
            <div className="space-y-3">{plans.map(p => (
              <div key={p.id} className={`rounded-xl p-4 flex items-center gap-4 border transition-all ${p.current ? "border-f-accent bg-f-accent/5" : "border-f-border hover:border-[#3A3A48]"}`}>
                <div className="flex-1"><div className="flex items-center gap-2"><span className="text-sm font-bold text-f-text">{p.name}</span>{p.current && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-f-accent/15 text-f-accent-lt">Current</span>}</div><p className="text-xs text-f-muted mt-0.5">{p.desc}</p></div>
                <span className="text-lg font-bold text-f-text">{p.price}</span>
                {!p.current && <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-f-accent border border-f-accent/30 hover:bg-f-accent/10 transition-all">{p.id === "FREE" ? "Downgrade" : "Upgrade"}</button>}
              </div>
            ))}</div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!permDeleteId} onClose={() => setPermDeleteId(null)} onConfirm={handlePermDelete}
        title="Permanently Delete?" message="This cannot be undone. The project and all its data will be gone forever." />

      <Toast message={toast.message} type={toast.type} show={toast.show} onClose={() => setToast(t => ({ ...t, show: false }))} />
    </>
  );
}
