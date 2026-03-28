"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseClient } from "@/lib";

export default function LoginView() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    const supabase = createSupabaseClient();

    if (mode === "signup") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // Create the Prisma User row via API route
      if (data.user) {
        try {
          await fetch("/api/auth/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: data.user.id,
              email: data.user.email,
              name: name || email.split("@")[0],
            }),
          });
        } catch {
          // Non-fatal — user row will be created on next login if this fails
        }
      }

      if (data.user && !data.session) {
        setSuccess("Check your email to confirm your account, then sign in.");
        setMode("login");
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } else {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      // Ensure Prisma User row exists on login too
      if (data.user) {
        try {
          await fetch("/api/auth/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.name || email.split("@")[0],
            }),
          });
        } catch { /* non-fatal */ }
      }

      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-f-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold bg-gradient-to-br from-f-accent to-f-accent-lt bg-clip-text text-transparent font-display">folio</Link>
          <p className="text-sm text-f-muted mt-2">Client portal for freelancers</p>
        </div>

        <div className="bg-f-surface border border-f-border rounded-2xl p-6">
          <div className="flex gap-1 mb-6 p-1 rounded-lg bg-f-bg">
            {(["login", "signup"] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }}
                className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${mode === m ? "bg-f-surface text-f-text shadow-sm" : "text-f-muted"}`}>
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>}
          {success && <div className="mb-4 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400">{success}</div>}

          <div className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-semibold text-f-muted mb-1.5">Full Name</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-f-bg border border-f-border text-sm text-f-text placeholder-[#555] focus:border-f-accent focus:outline-none" placeholder="Jane Doe" />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-f-muted mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-f-bg border border-f-border text-sm text-f-text placeholder-[#555] focus:border-f-accent focus:outline-none" placeholder="jane@example.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-f-muted mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && email && password) handleSubmit(); }}
                className="w-full px-4 py-2.5 rounded-lg bg-f-bg border border-f-border text-sm text-f-text placeholder-[#555] focus:border-f-accent focus:outline-none" placeholder="••••••••" />
            </div>
            <button onClick={handleSubmit} disabled={loading || !email || !password || (mode === "signup" && !name)}
              className="w-full py-2.5 rounded-lg text-sm font-bold text-white bg-f-accent shadow-lg shadow-f-accent/25 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" /></svg>
                  {mode === "login" ? "Signing in..." : "Creating account..."}
                </span>
              ) : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
