"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Toast } from "@/components";
import { getLoggedInUser, updateSettings, signOut } from "@/app/actions";
import { createSupabaseClient } from "@/lib";

const PLANS = [
  { id: "FREE", name: "Free", price: "$0", desc: "1 client, 2 projects", current: false },
  { id: "PRO", name: "Pro", price: "$19/mo", desc: "Unlimited clients & projects", current: false },
  { id: "UNLIMITED", name: "Unlimited", price: "$49/mo", desc: "Custom domains, priority support", current: false },
];

export default function SettingsView() {
  const router = useRouter();
  const [tab, setTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [brandName, setBrandName] = useState("");
  const [brandColor, setBrandColor] = useState("#6C5CE7");
  const [userPlan, setUserPlan] = useState("FREE");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" as "success" | "error" });
  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
  }, []);

  // Password change
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    getLoggedInUser().then(u => {
      if (u) {
        setName(u.name);
        setEmail(u.email);
        setBrandName(u.brandName || "");
        setBrandColor(u.brandColor || "#6C5CE7");
        setUserPlan(u.plan);
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await updateSettings({ name, brandName, brandColor });
      setSaved(true);
      showToast("Settings saved successfully");
      setTimeout(() => setSaved(false), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
      showToast(err instanceof Error ? err.message : "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPwError("");
    setPwMsg("");
    if (newPw !== confirmPw) { setPwError("Passwords do not match"); return; }
    if (newPw.length < 6) { setPwError("Password must be at least 6 characters"); return; }
    setPwSaving(true);
    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) throw error;
      setPwMsg("Password updated successfully");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setPwSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#6C5CE7" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" /></svg>
      </div>
    );
  }

  const plans = PLANS.map(p => ({ ...p, current: p.id === userPlan }));
  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "U";

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-f-text tracking-tight font-display">Settings</h1>
        <p className="text-sm text-f-muted mt-1">Manage your profile, branding, and account</p>
      </div>

      <div className="flex gap-1 mb-8 p-1 rounded-lg bg-f-surface border border-f-border w-fit">
        {["profile", "branding", "security", "billing"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-semibold capitalize transition-all ${tab === t ? "bg-f-accent/15 text-f-accent-lt" : "text-f-muted hover:text-f-text"}`}>
            {t}
          </button>
        ))}
      </div>

      {error && <div className="mb-4 max-w-2xl px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>}

      {tab === "profile" && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-f-surface border border-f-border rounded-xl p-6">
            <h2 className="text-base font-bold text-f-text mb-5">Profile</h2>
            <div className="flex items-center gap-5 mb-6">
              <Avatar text={initials} color={brandColor} size={56} />
              <div>
                <button className="text-xs font-semibold text-f-accent hover:text-f-accent-lt transition-colors">Change avatar</button>
                <p className="text-[11px] text-f-muted mt-0.5">JPG, PNG, or SVG. Max 2MB.</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-f-muted mb-1.5">Full Name</label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-f-bg border border-f-border text-sm text-f-text focus:border-f-accent focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-f-muted mb-1.5">Email</label>
                <input value={email} readOnly className="w-full px-4 py-2.5 rounded-lg bg-f-bg border border-f-border text-sm text-f-muted focus:outline-none cursor-not-allowed" />
                <p className="text-[11px] text-f-muted mt-1">Email is managed through Supabase Auth</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-f-accent shadow-lg shadow-f-accent/25 transition-all disabled:opacity-60 flex items-center gap-2">
              {saved ? <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>Saved</> : saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {tab === "branding" && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-f-surface border border-f-border rounded-xl p-6">
            <h2 className="text-base font-bold text-f-text mb-2">Client Portal Branding</h2>
            <p className="text-sm text-f-muted mb-5">Customize how your portal looks to clients</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-f-muted mb-1.5">Brand Name</label>
                <input value={brandName} onChange={e => setBrandName(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-f-bg border border-f-border text-sm text-f-text focus:border-f-accent focus:outline-none" placeholder="Your Business Name" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-f-muted mb-1.5">Brand Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)} className="w-10 h-10 rounded-lg border border-f-border cursor-pointer" />
                  <input value={brandColor} onChange={e => setBrandColor(e.target.value)} className="w-28 px-3 py-2 rounded-lg bg-f-bg border border-f-border text-sm text-f-text font-mono focus:border-f-accent focus:outline-none" />
                  <div className="flex gap-1.5">
                    {["#6C5CE7", "#00D68F", "#FF5C35", "#3B82F6", "#FFB946", "#EC4899"].map(c => (
                      <button key={c} onClick={() => setBrandColor(c)} className="w-7 h-7 rounded-full border-2 transition-all" style={{ background: c, borderColor: brandColor === c ? "#fff" : "transparent" }} />
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-f-muted mb-1.5">Logo</label>
                <div className="border-2 border-dashed border-f-border rounded-xl p-8 text-center hover:border-f-muted transition-colors cursor-pointer">
                  <svg className="mx-auto mb-2 opacity-40" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8888A0" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                  <p className="text-xs text-f-muted">Drop your logo here or <span className="text-f-accent font-semibold">browse</span></p>
                  <p className="text-[11px] text-f-muted mt-1">SVG, PNG, or JPG up to 5MB</p>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-f-surface border border-f-border rounded-xl p-6">
            <h2 className="text-base font-bold text-f-text mb-4">Portal Preview</h2>
            <div className="rounded-xl overflow-hidden border border-f-border">
              <div className="h-14 flex items-center px-6 gap-3" style={{ background: "rgba(250,250,248,0.95)", borderBottom: "1px solid #E8E6E1" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs" style={{ background: brandColor }}>{(brandName || name || "F").charAt(0)}</div>
                <div>
                  <p className="text-sm font-bold" style={{ color: "#1A1A1A" }}>{brandName || name || "Your Brand"}</p>
                  <p className="text-[10px]" style={{ color: "#7D7A72" }}>Client Portal</p>
                </div>
              </div>
              <div className="h-24 flex items-center justify-center" style={{ background: "#FAFAF8" }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: `${brandColor}20` }}>
                  <span className="text-2xl font-bold" style={{ color: brandColor }}>72%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-f-accent shadow-lg shadow-f-accent/25 transition-all disabled:opacity-60 flex items-center gap-2">
              {saved ? <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>Saved</> : saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {tab === "security" && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-f-surface border border-f-border rounded-xl p-6">
            <h2 className="text-base font-bold text-f-text mb-5">Change Password</h2>
            {pwError && <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">{pwError}</div>}
            {pwMsg && <div className="mb-4 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400">{pwMsg}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-f-muted mb-1.5">Current Password</label>
                <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-f-bg border border-f-border text-sm text-f-text placeholder-[#555] focus:border-f-accent focus:outline-none" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-f-muted mb-1.5">New Password</label>
                <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-f-bg border border-f-border text-sm text-f-text placeholder-[#555] focus:border-f-accent focus:outline-none" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-f-muted mb-1.5">Confirm New Password</label>
                <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-f-bg border border-f-border text-sm text-f-text placeholder-[#555] focus:border-f-accent focus:outline-none" placeholder="••••••••" />
              </div>
            </div>
            <div className="mt-5">
              <button onClick={handlePasswordChange} disabled={pwSaving || !newPw || !confirmPw} className="px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-f-accent shadow-lg shadow-f-accent/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                {pwSaving ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>

          <div className="bg-f-surface border border-f-border rounded-xl p-6">
            <h2 className="text-base font-bold text-f-text mb-2">Sessions</h2>
            <p className="text-sm text-f-muted mb-4">Sign out of your current session</p>
            <button onClick={handleSignOut} className="px-4 py-2.5 rounded-lg text-sm font-semibold text-f-muted border border-f-border hover:text-f-text hover:border-f-muted transition-all flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
              Sign Out
            </button>
          </div>

          <div className="bg-f-surface border border-red-500/20 rounded-xl p-6">
            <h2 className="text-base font-bold text-f-text mb-2">Danger Zone</h2>
            <p className="text-sm text-f-muted mb-4">Permanently delete your account and all data</p>
            <button className="px-4 py-2.5 rounded-lg text-sm font-semibold text-red-400 border border-red-400/30 hover:bg-red-400/10 transition-all">
              Delete Account
            </button>
          </div>
        </div>
      )}

      {tab === "billing" && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-f-surface border border-f-border rounded-xl p-6">
            <h2 className="text-base font-bold text-f-text mb-5">Plan</h2>
            <div className="space-y-3">
              {plans.map(p => (
                <div key={p.id} className={`rounded-xl p-4 flex items-center gap-4 border transition-all ${p.current ? "border-f-accent bg-f-accent/5" : "border-f-border hover:border-[#3A3A48]"}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-f-text">{p.name}</span>
                      {p.current && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-f-accent/15 text-f-accent-lt">Current</span>}
                    </div>
                    <p className="text-xs text-f-muted mt-0.5">{p.desc}</p>
                  </div>
                  <span className="text-lg font-bold text-f-text">{p.price}</span>
                  {!p.current && (
                    <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-f-accent border border-f-accent/30 hover:bg-f-accent/10 transition-all">
                      {p.id === "FREE" ? "Downgrade" : "Upgrade"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Toast message={toast.message} type={toast.type} show={toast.show} onClose={() => setToast(t => ({ ...t, show: false }))} />
    </>
  );
}
