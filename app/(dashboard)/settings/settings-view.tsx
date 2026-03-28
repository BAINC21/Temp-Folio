"use client";

import { useState } from "react";
import { Avatar } from "@/components";

const PLANS = [
  { id: "FREE", name: "Free", price: "$0", desc: "1 client, 2 projects", current: false },
  { id: "PRO", name: "Pro", price: "$19/mo", desc: "Unlimited clients & projects", current: true },
  { id: "UNLIMITED", name: "Unlimited", price: "$49/mo", desc: "Custom domains, priority support", current: false },
];

export default function SettingsPage() {
  const [tab, setTab] = useState("profile");
  const [name, setName] = useState("Jane Doe");
  const [email] = useState("jane@janedoedesign.com");
  const [brandName, setBrandName] = useState("Jane Doe Design");
  const [brandColor, setBrandColor] = useState("#6C5CE7");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // TODO: Wire to Prisma
    console.log("Save settings:", { name, brandName, brandColor });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-f-text tracking-tight font-display">Settings</h1>
        <p className="text-sm text-f-muted mt-1">Manage your profile, branding, and account</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 p-1 rounded-lg bg-f-surface border border-f-border w-fit">
        {["profile", "branding", "billing"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-semibold capitalize transition-all ${tab === t ? "bg-f-accent/15 text-f-accent-lt" : "text-f-muted hover:text-f-text"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-f-surface border border-f-border rounded-xl p-6">
            <h2 className="text-base font-bold text-f-text mb-5">Profile</h2>
            <div className="flex items-center gap-5 mb-6">
              <Avatar text="JD" color={brandColor} size={56} />
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
            <button onClick={handleSave} className="px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-f-accent shadow-lg shadow-f-accent/25 transition-all flex items-center gap-2">
              {saved ? (
                <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>Saved</>
              ) : "Save Changes"}
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
            <h2 className="text-base font-bold text-f-text mb-4">Preview</h2>
            <div className="rounded-xl overflow-hidden border border-f-border">
              <div className="h-14 flex items-center px-6 gap-3" style={{ background: "rgba(250,250,248,0.95)", borderBottom: "1px solid #E8E6E1" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs" style={{ background: brandColor }}>{brandName.charAt(0)}</div>
                <div>
                  <p className="text-sm font-bold" style={{ color: "#1A1A1A" }}>{brandName || "Your Brand"}</p>
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
            <button onClick={handleSave} className="px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-f-accent shadow-lg shadow-f-accent/25 transition-all flex items-center gap-2">
              {saved ? (
                <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>Saved</>
              ) : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {tab === "billing" && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-f-surface border border-f-border rounded-xl p-6">
            <h2 className="text-base font-bold text-f-text mb-5">Plan</h2>
            <div className="space-y-3">
              {PLANS.map(p => (
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

          <div className="bg-f-surface border border-f-border rounded-xl p-6">
            <h2 className="text-base font-bold text-f-text mb-2">Danger Zone</h2>
            <p className="text-sm text-f-muted mb-4">Permanently delete your account and all data</p>
            <button className="px-4 py-2.5 rounded-lg text-sm font-semibold text-red-400 border border-red-400/30 hover:bg-red-400/10 transition-all">
              Delete Account
            </button>
          </div>
        </div>
      )}
    </>
  );
}
