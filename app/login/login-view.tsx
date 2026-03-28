"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");

  const handleSubmit = async () => {
    setLoading(true);
    // TODO: Wire to Supabase Auth
    console.log(mode === "login" ? "Login:" : "Signup:", { email, password });
    setTimeout(() => setLoading(false), 1000);
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
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-md text-sm font-semibold capitalize transition-all ${mode === m ? "bg-f-surface text-f-text shadow-sm" : "text-f-muted"}`}>
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-semibold text-f-muted mb-1.5">Full Name</label>
                <input className="w-full px-4 py-2.5 rounded-lg bg-f-bg border border-f-border text-sm text-f-text placeholder-[#555] focus:border-f-accent focus:outline-none" placeholder="Jane Doe" />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-f-muted mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-f-bg border border-f-border text-sm text-f-text placeholder-[#555] focus:border-f-accent focus:outline-none" placeholder="jane@example.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-f-muted mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-f-bg border border-f-border text-sm text-f-text placeholder-[#555] focus:border-f-accent focus:outline-none" placeholder="••••••••" />
            </div>
            <button onClick={handleSubmit} disabled={loading || !email || !password}
              className="w-full py-2.5 rounded-lg text-sm font-bold text-white bg-f-accent shadow-lg shadow-f-accent/25 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              {loading ? "..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </div>

          {mode === "login" && (
            <p className="text-xs text-f-muted text-center mt-4">
              Forgot password? <button className="text-f-accent font-semibold hover:text-f-accent-lt">Reset it</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
