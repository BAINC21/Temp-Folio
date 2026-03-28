"use client";

import { useState } from "react";
import { Badge, Avatar, Modal, DatePicker } from "@/components";
import { INVOICES, CLIENTS, getClient } from "@/mock-data";
import { createInvoice } from "@/app/actions";

const ALL_INVOICES = [
  ...INVOICES,
  { id: "i4", cid: "c3", num: "#037", amt: "$2,400", status: "PAID", date: "Feb 18" },
  { id: "i5", cid: "c5", num: "#036", amt: "$1,500", status: "PAID", date: "Feb 10" },
  { id: "i6", cid: "c1", num: "#035", amt: "$900", status: "PAID", date: "Jan 28" },
  { id: "i7", cid: "c2", num: "#034", amt: "$1,200", status: "DRAFT", date: "Mar 25" },
];

const FILTERS = ["all", "DRAFT", "SENT", "PAID", "OVERDUE"] as const;

export default function InvoicesView() {
  const [filter, setFilter] = useState<string>("all");
  const [modal, setModal] = useState(false);
  const [invClientId, setInvClientId] = useState("");
  const [invAmount, setInvAmount] = useState("");
  const [invDueDate, setInvDueDate] = useState("");
  const [invDesc, setInvDesc] = useState("");
  const [invSaving, setInvSaving] = useState(false);
  const [invError, setInvError] = useState("");

  const filtered = filter === "all" ? ALL_INVOICES : ALL_INVOICES.filter(i => i.status === filter);

  const totalPaid = ALL_INVOICES.filter(i => i.status === "PAID").length;
  const totalOutstanding = ALL_INVOICES.filter(i => i.status === "SENT" || i.status === "OVERDUE").length;

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-f-text tracking-tight font-display">Invoices</h1>
          <p className="text-sm text-f-muted mt-1">{ALL_INVOICES.length} total · {totalPaid} paid · {totalOutstanding} outstanding</p>
        </div>
        <button onClick={() => setModal(true)} className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-f-accent shadow-lg shadow-f-accent/25 hover:-translate-y-0.5 transition-all flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
          New Invoice
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {[
          { l: "Total Revenue", v: "$12,950", s: "All time", up: true },
          { l: "Outstanding", v: "$4,150", s: "2 invoices", up: false },
          { l: "Overdue", v: "$950", s: "1 invoice", up: false },
          { l: "Avg. Invoice", v: "$1,850", s: "This quarter", up: true },
        ].map((s, i) => (
          <div key={i} className="bg-f-surface border border-f-border rounded-xl p-4 sm:p-5">
            <p className="text-[11px] text-f-muted font-medium mb-1.5">{s.l}</p>
            <p className="text-2xl sm:text-3xl font-bold text-f-text tracking-tight">{s.v}</p>
            <p className={`text-[11px] font-semibold mt-1 ${s.up ? "text-emerald-400" : "text-red-400"}`}>{s.s}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 p-1 rounded-lg bg-f-surface border border-f-border w-fit mb-6">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${filter === f ? "bg-f-accent/15 text-f-accent-lt" : "text-f-muted hover:text-f-text"}`}>
            {f === "all" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Invoice list */}
      <div className="bg-f-surface border border-f-border rounded-xl overflow-hidden">
        <div className="hidden sm:grid grid-cols-[1fr_100px_100px_100px_80px] gap-4 px-6 py-3 border-b border-f-border text-[11px] font-semibold text-f-muted uppercase tracking-wider">
          <span>Client</span>
          <span>Invoice</span>
          <span>Amount</span>
          <span>Date</span>
          <span>Status</span>
        </div>
        <div className="divide-y divide-f-border/50">
          {filtered.map(inv => {
            const cl = getClient(inv.cid);
            return (
              <div key={inv.id} className="px-4 sm:px-6 py-4 flex items-center gap-4 hover:bg-f-hover transition-colors cursor-pointer sm:grid sm:grid-cols-[1fr_100px_100px_100px_80px]">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar text={cl.avatar} color={cl.color} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-f-text truncate">{cl.company}</p>
                    <p className="text-xs text-f-muted truncate">{cl.name}</p>
                  </div>
                </div>
                <span className="text-sm text-f-text font-mono hidden sm:block">{inv.num}</span>
                <span className="text-sm font-bold text-f-text hidden sm:block">{inv.amt}</span>
                <span className="text-sm text-f-muted hidden sm:block">{inv.date}</span>
                <Badge status={inv.status} />
              </div>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-f-muted text-sm">No invoices match this filter</p>
        </div>
      )}

      {/* New Invoice Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="New Invoice">
        <div className="p-6 space-y-4">
          {invError && <div className="px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">{invError}</div>}
          <div>
            <label className="block text-xs font-semibold text-f-muted mb-1.5">Client</label>
            <select value={invClientId} onChange={e => setInvClientId(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-f-bg border border-f-border text-sm text-f-text focus:border-f-accent focus:outline-none appearance-none">
              <option value="">Select a client...</option>
              {CLIENTS.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-f-muted mb-1.5">Amount</label>
            <input type="text" value={invAmount} onChange={e => setInvAmount(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-f-bg border border-f-border text-sm text-f-text placeholder-[#555] focus:border-f-accent focus:outline-none" placeholder="$0.00" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-f-muted mb-1.5">Due Date</label>
            <DatePicker value={invDueDate} onChange={setInvDueDate} placeholder="Select due date" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-f-muted mb-1.5">Description</label>
            <textarea rows={2} value={invDesc} onChange={e => setInvDesc(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-f-bg border border-f-border text-sm text-f-text placeholder-[#555] focus:border-f-accent focus:outline-none resize-none" placeholder="Line item description..." />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-f-border flex gap-3 justify-end">
          <button onClick={() => setModal(false)} className="px-4 py-2.5 rounded-lg text-sm font-semibold text-f-muted border border-f-border hover:text-f-text transition-all">Cancel</button>
          <button disabled={!invClientId || !invAmount || !invDueDate || invSaving} onClick={async () => {
            setInvSaving(true); setInvError("");
            try {
              await createInvoice({ clientId: invClientId, amount: invAmount, dueDate: invDueDate, description: invDesc || undefined });
              setModal(false); setInvClientId(""); setInvAmount(""); setInvDueDate(""); setInvDesc("");
            } catch (err: unknown) { setInvError(err instanceof Error ? err.message : "Failed to create invoice"); }
            finally { setInvSaving(false); }
          }} className="px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-f-accent shadow-lg shadow-f-accent/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            {invSaving ? "Creating..." : "Create Invoice"}
          </button>
        </div>
      </Modal>
    </>
  );
}
