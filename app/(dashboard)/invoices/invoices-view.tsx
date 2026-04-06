"use client";
import { useState, useCallback } from "react";
import { Badge, Avatar, Modal, DatePicker, Toast } from "@/components";
import { INVOICES, CLIENTS, getClient } from "@/mock-data";
import { createInvoice } from "@/app/actions";

const ALL_INVOICES = [
  ...INVOICES,
  { id: "i4", cid: "c3", num: "#037", amt: "$2,400", status: "PAID", date: "Feb 18" },
  { id: "i5", cid: "c5", num: "#036", amt: "$1,500", status: "PAID", date: "Feb 10" },
  { id: "i6", cid: "c1", num: "#035", amt: "$900", status: "PAID", date: "Jan 28" },
  { id: "i7", cid: "c2", num: "#034", amt: "$1,200", status: "DRAFT", date: "Mar 25" },
];

// Enrich invoices with detail data for the modal
const INVOICE_DETAILS: Record<string, {
  amountTotal: number;
  amountPaid: number;
  dueDate: string;
  issuedDate: string;
  description: string;
  nextPaymentDate?: string;
  nextPaymentAmount?: number;
  lineItems: Array<{ desc: string; qty: number; rate: number; total: number }>;
}> = {
  i1: { amountTotal: 1800, amountPaid: 1800, dueDate: "Mar 22, 2026", issuedDate: "Mar 8, 2026", description: "Brand identity design services", lineItems: [{ desc: "Logo design", qty: 1, rate: 1200, total: 1200 }, { desc: "Color system", qty: 1, rate: 600, total: 600 }] },
  i2: { amountTotal: 3200, amountPaid: 0, dueDate: "Mar 30, 2026", issuedDate: "Mar 15, 2026", description: "Website redesign — phase 2", nextPaymentDate: "Mar 30, 2026", nextPaymentAmount: 3200, lineItems: [{ desc: "Design & development", qty: 1, rate: 2800, total: 2800 }, { desc: "CMS setup", qty: 1, rate: 400, total: 400 }] },
  i3: { amountTotal: 950, amountPaid: 0, dueDate: "Mar 20, 2026", issuedDate: "Mar 1, 2026", description: "E-commerce store design", nextPaymentDate: "Overdue", nextPaymentAmount: 950, lineItems: [{ desc: "Shopify theme design", qty: 1, rate: 950, total: 950 }] },
  i4: { amountTotal: 2400, amountPaid: 2400, dueDate: "Feb 18, 2026", issuedDate: "Feb 4, 2026", description: "Mobile app UI kit", lineItems: [{ desc: "UI components", qty: 1, rate: 2400, total: 2400 }] },
  i5: { amountTotal: 1500, amountPaid: 1500, dueDate: "Feb 10, 2026", issuedDate: "Jan 27, 2026", description: "Pitch deck design", lineItems: [{ desc: "Slide design (20 slides)", qty: 20, rate: 75, total: 1500 }] },
  i6: { amountTotal: 900, amountPaid: 900, dueDate: "Jan 28, 2026", issuedDate: "Jan 14, 2026", description: "Brand refresh — logo revision", lineItems: [{ desc: "Logo revision", qty: 1, rate: 900, total: 900 }] },
  i7: { amountTotal: 1200, amountPaid: 0, dueDate: "Apr 10, 2026", issuedDate: "Mar 25, 2026", description: "Website audit & recommendations", nextPaymentDate: "Apr 10, 2026", nextPaymentAmount: 1200, lineItems: [{ desc: "UX audit", qty: 1, rate: 800, total: 800 }, { desc: "Report & recommendations", qty: 1, rate: 400, total: 400 }] },
};

const FILTERS = ["all", "DRAFT", "SENT", "PAID", "OVERDUE"] as const;

type InvoiceRow = { id: string; cid: string; num: string; amt: string; status: string; date: string };

function InvoiceDetailModal({ invoice, onClose }: { invoice: InvoiceRow; onClose: () => void }) {
  const cl = getClient(invoice.cid);
  const detail = INVOICE_DETAILS[invoice.id];
  if (!detail) return null;

  const outstanding = detail.amountTotal - detail.amountPaid;
  const paidPct = Math.round((detail.amountPaid / detail.amountTotal) * 100);
  const isPaid = invoice.status === "PAID";
  const isOverdue = invoice.status === "OVERDUE";

  const statusColor = isPaid
    ? { bar: "#00D68F", text: "text-emerald-400", bg: "bg-emerald-500/10" }
    : isOverdue
    ? { bar: "#FF6B6B", text: "text-red-400", bg: "bg-red-500/10" }
    : { bar: "#6C5CE7", text: "text-f-accent", bg: "bg-f-accent/10" };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#1C1C26] border border-f-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-f-border flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar text={cl.avatar} color={cl.color} size={40} />
            <div>
              <p className="text-sm font-bold text-f-text">{cl.company}</p>
              <p className="text-xs text-f-muted">{invoice.num} · Issued {invoice.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge status={invoice.status} />
            <button onClick={onClose} className="text-f-muted hover:text-f-text transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Amount hero */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] text-f-muted font-medium uppercase tracking-wider mb-1">Total Amount</p>
              <p className="text-3xl font-bold text-f-text tracking-tight">
                ${detail.amountTotal.toLocaleString()}
              </p>
            </div>
            {!isPaid && (
              <div className="text-right">
                <p className="text-[11px] text-f-muted font-medium uppercase tracking-wider mb-1">Outstanding</p>
                <p className={`text-xl font-bold ${statusColor.text}`}>
                  ${outstanding.toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Payment progress bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs font-semibold text-f-muted">Payment Progress</p>
              <p className="text-xs font-bold text-f-text">{paidPct}% paid</p>
            </div>
            <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${paidPct}%`, background: statusColor.bar }}
              />
            </div>
            {isPaid && (
              <p className="text-xs text-emerald-400 font-semibold mt-1.5">✓ Fully paid</p>
            )}
          </div>

          {/* Key dates grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-f-bg rounded-xl p-3.5">
              <p className="text-[10px] text-f-muted font-semibold uppercase tracking-wider mb-1">Due Date</p>
              <p className={`text-sm font-bold ${isOverdue ? "text-red-400" : "text-f-text"}`}>
                {detail.dueDate}
              </p>
              {isOverdue && <p className="text-[10px] text-red-400 mt-0.5">Overdue</p>}
            </div>
            <div className="bg-f-bg rounded-xl p-3.5">
              <p className="text-[10px] text-f-muted font-semibold uppercase tracking-wider mb-1">Issued</p>
              <p className="text-sm font-bold text-f-text">{detail.issuedDate}</p>
            </div>
            {detail.nextPaymentDate && (
              <div className="bg-f-bg rounded-xl p-3.5">
                <p className="text-[10px] text-f-muted font-semibold uppercase tracking-wider mb-1">Next Payment</p>
                <p className={`text-sm font-bold ${detail.nextPaymentDate === "Overdue" ? "text-red-400" : "text-f-text"}`}>
                  {detail.nextPaymentDate}
                </p>
              </div>
            )}
            {detail.nextPaymentAmount && (
              <div className="bg-f-bg rounded-xl p-3.5">
                <p className="text-[10px] text-f-muted font-semibold uppercase tracking-wider mb-1">Amount Due</p>
                <p className="text-sm font-bold text-f-accent">
                  ${detail.nextPaymentAmount.toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <p className="text-[10px] text-f-muted font-semibold uppercase tracking-wider mb-2">Description</p>
            <p className="text-sm text-f-text">{detail.description}</p>
          </div>

          {/* Line items */}
          <div>
            <p className="text-[10px] text-f-muted font-semibold uppercase tracking-wider mb-2">Line Items</p>
            <div className="bg-f-bg rounded-xl overflow-hidden">
              <div className="grid grid-cols-[1fr_40px_80px_80px] gap-2 px-4 py-2 text-[10px] font-semibold text-f-muted uppercase tracking-wider border-b border-f-border">
                <span>Item</span><span>Qty</span><span>Rate</span><span className="text-right">Total</span>
              </div>
              {detail.lineItems.map((li, i) => (
                <div key={i} className="grid grid-cols-[1fr_40px_80px_80px] gap-2 px-4 py-2.5 text-sm border-b border-f-border/50 last:border-0">
                  <span className="text-f-text">{li.desc}</span>
                  <span className="text-f-muted">{li.qty}</span>
                  <span className="text-f-muted">${li.rate.toLocaleString()}</span>
                  <span className="text-f-text font-semibold text-right">${li.total.toLocaleString()}</span>
                </div>
              ))}
              <div className="grid grid-cols-[1fr_40px_80px_80px] gap-2 px-4 py-2.5 border-t border-f-border bg-white/[0.02]">
                <span className="text-sm font-bold text-f-text col-span-3">Total</span>
                <span className="text-sm font-bold text-f-text text-right">${detail.amountTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        {!isPaid && (
          <div className="px-6 py-4 border-t border-f-border flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold text-f-muted border border-f-border hover:text-f-text transition-all"
            >
              Close
            </button>
            <button className="px-4 py-2.5 rounded-lg text-sm font-semibold text-f-muted border border-f-border hover:text-f-text transition-all flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6" />
              </svg>
              Send Reminder
            </button>
            <button className="px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-f-accent shadow-lg shadow-f-accent/25 hover:-translate-y-0.5 transition-all flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
              Mark as Paid
            </button>
          </div>
        )}
        {isPaid && (
          <div className="px-6 py-4 border-t border-f-border flex justify-end">
            <button onClick={onClose} className="px-4 py-2.5 rounded-lg text-sm font-semibold text-f-muted border border-f-border hover:text-f-text transition-all">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InvoicesView() {
  const [filter, setFilter] = useState<string>("all");
  const [modal, setModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRow | null>(null);
  const [invClientId, setInvClientId] = useState("");
  const [invAmount, setInvAmount] = useState("");
  const [invDueDate, setInvDueDate] = useState("");
  const [invDesc, setInvDesc] = useState("");
  const [invSaving, setInvSaving] = useState(false);
  const [invError, setInvError] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" as "success" | "error" });

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
  }, []);

  const filtered = filter === "all" ? ALL_INVOICES : ALL_INVOICES.filter((i) => i.status === filter);
  const totalPaid = ALL_INVOICES.filter((i) => i.status === "PAID").length;
  const totalOutstanding = ALL_INVOICES.filter((i) => i.status === "SENT" || i.status === "OVERDUE").length;

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-f-text tracking-tight font-display">Invoices</h1>
          <p className="text-sm text-f-muted mt-1">
            {ALL_INVOICES.length} total · {totalPaid} paid · {totalOutstanding} outstanding
          </p>
        </div>
        <button
          onClick={() => setModal(true)}
          className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-f-accent shadow-lg shadow-f-accent/25 hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
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
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${
              filter === f ? "bg-f-accent/15 text-f-accent-lt" : "text-f-muted hover:text-f-text"
            }`}
          >
            {f === "all" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Invoice list — each row clickable */}
      <div className="bg-f-surface border border-f-border rounded-xl overflow-hidden">
        <div className="hidden sm:grid grid-cols-[1fr_100px_100px_100px_80px] gap-4 px-6 py-3 border-b border-f-border text-[11px] font-semibold text-f-muted uppercase tracking-wider">
          <span>Client</span>
          <span>Invoice</span>
          <span>Amount</span>
          <span>Date</span>
          <span>Status</span>
        </div>
        <div className="divide-y divide-f-border/50">
          {filtered.map((inv) => {
            const cl = getClient(inv.cid);
            return (
              <button
                key={inv.id}
                onClick={() => setSelectedInvoice(inv)}
                className="w-full px-4 sm:px-6 py-4 flex items-center gap-4 hover:bg-f-hover transition-colors cursor-pointer sm:grid sm:grid-cols-[1fr_100px_100px_100px_80px] text-left group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar text={cl.avatar} color={cl.color} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-f-text truncate group-hover:text-f-accent-lt transition-colors">
                      {cl.company}
                    </p>
                    <p className="text-xs text-f-muted truncate">{cl.name}</p>
                  </div>
                </div>
                <span className="text-sm text-f-text font-mono hidden sm:block">{inv.num}</span>
                <span className="text-sm font-bold text-f-text hidden sm:block">{inv.amt}</span>
                <span className="text-sm text-f-muted hidden sm:block">{inv.date}</span>
                <Badge status={inv.status} />
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-f-muted text-sm">No invoices match this filter</p>
        </div>
      )}

      {/* Invoice detail modal */}
      {selectedInvoice && (
        <InvoiceDetailModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      )}

      {/* New Invoice Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="New Invoice">
        <div className="p-6 space-y-4">
          {invError && (
            <div className="px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {invError}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-f-muted mb-1.5">Client</label>
            <select
              value={invClientId}
              onChange={(e) => setInvClientId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-f-bg border border-f-border text-sm text-f-text focus:border-f-accent focus:outline-none appearance-none"
            >
              <option value="">Select a client...</option>
              {CLIENTS.map((c) => (
                <option key={c.id} value={c.id}>{c.company}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-f-muted mb-1.5">Amount</label>
            <input
              type="text"
              value={invAmount}
              onChange={(e) => setInvAmount(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-f-bg border border-f-border text-sm text-f-text placeholder-[#555] focus:border-f-accent focus:outline-none"
              placeholder="$0.00"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-f-muted mb-1.5">Due Date</label>
            <DatePicker value={invDueDate} onChange={setInvDueDate} placeholder="Select due date" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-f-muted mb-1.5">Description</label>
            <textarea
              rows={2}
              value={invDesc}
              onChange={(e) => setInvDesc(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-f-bg border border-f-border text-sm text-f-text placeholder-[#555] focus:border-f-accent focus:outline-none resize-none"
              placeholder="Line item description..."
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-f-border flex gap-3 justify-end">
          <button
            onClick={() => setModal(false)}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold text-f-muted border border-f-border hover:text-f-text transition-all"
          >
            Cancel
          </button>
          <button
            disabled={!invClientId || !invAmount || !invDueDate || invSaving}
            onClick={async () => {
              setInvSaving(true);
              setInvError("");
              try {
                const result = await createInvoice({
                  clientId: invClientId,
                  amount: invAmount,
                  dueDate: invDueDate,
                  description: invDesc || undefined,
                });
                setModal(false);
                setInvClientId(""); setInvAmount(""); setInvDueDate(""); setInvDesc("");
                showToast(`Invoice ${result.invoiceNumber} created successfully`);
              } catch (err: unknown) {
                setInvError(err instanceof Error ? err.message : "Failed to create invoice");
              } finally {
                setInvSaving(false);
              }
            }}
            className="px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-f-accent shadow-lg shadow-f-accent/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {invSaving ? "Creating..." : "Create Invoice"}
          </button>
        </div>
      </Modal>

      <Toast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
      />
    </>
  );
}
