"use client";

import { Avatar, Badge } from "@/components";
import { getClient } from "@/mock-data";

const PAYMENTS = [
  { id: "pay1", cid: "c1", inv: "#042", amt: "$1,800", method: "Stripe", date: "Mar 22, 2026", status: "completed" },
  { id: "pay2", cid: "c5", inv: "#041", amt: "$1,500", method: "Stripe", date: "Mar 18, 2026", status: "completed" },
  { id: "pay3", cid: "c3", inv: "#037", amt: "$2,400", method: "Stripe", date: "Feb 18, 2026", status: "completed" },
  { id: "pay4", cid: "c5", inv: "#036", amt: "$1,500", method: "Bank Transfer", date: "Feb 10, 2026", status: "completed" },
  { id: "pay5", cid: "c1", inv: "#035", amt: "$900", method: "Stripe", date: "Jan 28, 2026", status: "completed" },
];

const PENDING = [
  { id: "pend1", cid: "c2", inv: "#041", amt: "$3,200", due: "Mar 30, 2026" },
  { id: "pend2", cid: "c4", inv: "#038", amt: "$950", due: "Mar 20, 2026" },
];

export default function PaymentsView() {
  const totalReceived = "$8,100";
  const pendingTotal = "$4,150";

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-f-text tracking-tight font-display">Payments</h1>
        <p className="text-sm text-f-muted mt-1">Track received and pending payments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8">
        <div className="bg-f-surface border border-f-border rounded-xl p-4 sm:p-5">
          <p className="text-[11px] text-f-muted font-medium mb-1.5">Total Received</p>
          <p className="text-2xl sm:text-3xl font-bold text-f-text tracking-tight">{totalReceived}</p>
          <p className="text-[11px] font-semibold mt-1 text-emerald-400">{PAYMENTS.length} payments</p>
        </div>
        <div className="bg-f-surface border border-f-border rounded-xl p-4 sm:p-5">
          <p className="text-[11px] text-f-muted font-medium mb-1.5">Pending</p>
          <p className="text-2xl sm:text-3xl font-bold text-f-text tracking-tight">{pendingTotal}</p>
          <p className="text-[11px] font-semibold mt-1 text-amber-400">{PENDING.length} awaiting</p>
        </div>
        <div className="bg-f-surface border border-f-border rounded-xl p-4 sm:p-5">
          <p className="text-[11px] text-f-muted font-medium mb-1.5">Payment Method</p>
          <p className="text-2xl sm:text-3xl font-bold text-f-text tracking-tight">Stripe</p>
          <p className="text-[11px] font-semibold mt-1 text-f-muted">Primary gateway</p>
        </div>
      </div>

      {/* Pending payments */}
      {PENDING.length > 0 && (
        <div className="bg-f-surface border border-amber-500/30 rounded-xl overflow-hidden mb-6">
          <div className="px-4 sm:px-6 py-4 border-b border-f-border flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <h2 className="text-base font-bold text-f-text">Awaiting Payment</h2>
          </div>
          <div className="divide-y divide-f-border/50">
            {PENDING.map(p => {
              const cl = getClient(p.cid);
              const isOverdue = p.due < "Mar 27, 2026";
              return (
                <div key={p.id} className="px-4 sm:px-6 py-4 flex items-center gap-4 hover:bg-f-hover transition-colors">
                  <Avatar text={cl.avatar} color={cl.color} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-f-text truncate">{cl.company}</p>
                    <p className="text-xs text-f-muted">Invoice {p.inv} · Due {p.due}</p>
                  </div>
                  <span className="text-sm font-bold text-f-text">{p.amt}</span>
                  {isOverdue ? (
                    <Badge status="OVERDUE" />
                  ) : (
                    <Badge status="SENT" />
                  )}
                  <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-f-accent border border-f-accent/30 hover:bg-f-accent/10 transition-all hidden sm:block">
                    Send Reminder
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Payment history */}
      <div className="bg-f-surface border border-f-border rounded-xl overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-f-border">
          <h2 className="text-base font-bold text-f-text">Payment History</h2>
        </div>
        <div className="hidden sm:grid grid-cols-[1fr_90px_90px_120px_100px] gap-4 px-6 py-3 border-b border-f-border text-[11px] font-semibold text-f-muted uppercase tracking-wider">
          <span>Client</span>
          <span>Invoice</span>
          <span>Amount</span>
          <span>Date</span>
          <span>Method</span>
        </div>
        <div className="divide-y divide-f-border/50">
          {PAYMENTS.map(p => {
            const cl = getClient(p.cid);
            return (
              <div key={p.id} className="px-4 sm:px-6 py-4 flex items-center gap-4 hover:bg-f-hover transition-colors sm:grid sm:grid-cols-[1fr_90px_90px_120px_100px]">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar text={cl.avatar} color={cl.color} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-f-text truncate">{cl.company}</p>
                    <p className="text-xs text-f-muted sm:hidden">{p.inv} · {p.amt}</p>
                  </div>
                </div>
                <span className="text-sm text-f-text font-mono hidden sm:block">{p.inv}</span>
                <span className="text-sm font-bold text-emerald-400 hidden sm:block">{p.amt}</span>
                <span className="text-sm text-f-muted hidden sm:block">{p.date}</span>
                <span className="text-xs text-f-muted hidden sm:block">{p.method}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
