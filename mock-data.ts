// ═══════════════════════════════════════
// MOCK DATA — single source of truth
// Delete this file when wiring to Prisma
// ═══════════════════════════════════════

export const CLIENTS = [
  { id: "c1", name: "Alex Morgan", email: "alex@bloomstudio.co", company: "Bloom Studio", avatar: "BS", color: "#6C5CE7" },
  { id: "c2", name: "Jamie Chen", email: "jamie@neonhealth.io", company: "Neon Health", avatar: "NH", color: "#00D68F" },
  { id: "c3", name: "Sam Rivera", email: "sam@trekfit.app", company: "TrekFit", avatar: "TF", color: "#FF5C35" },
  { id: "c4", name: "Luna Torres", email: "luna@madrecoffee.com", company: "Madre Coffee", avatar: "MC", color: "#FFB946" },
  { id: "c5", name: "Ravi Patel", email: "ravi@skyward.vc", company: "Skyward Ventures", avatar: "SV", color: "#a29bfe" },
];

export const PROJECTS = [
  { id: "p1", clientId: "c1", title: "Brand Refresh", status: "ACTIVE", progress: 72, due: "Apr 2, 2026", description: "Complete brand identity overhaul including logo, color system, typography, and brand guidelines document." },
  { id: "p2", clientId: "c2", title: "Website Redesign", status: "IN_REVIEW", progress: 90, due: "Mar 28, 2026", description: "Full redesign of the marketing site with new CMS integration and responsive layouts." },
  { id: "p3", clientId: "c3", title: "Mobile App UI", status: "ACTIVE", progress: 35, due: "Apr 18, 2026", description: "Design system and UI kit for the TrekFit mobile app, covering onboarding, dashboard, and workout tracking flows." },
  { id: "p4", clientId: "c4", title: "E-Commerce Store", status: "OVERDUE", progress: 60, due: "Mar 20, 2026", description: "Shopify storefront design with custom product pages, cart experience, and checkout flow." },
  { id: "p5", clientId: "c5", title: "Pitch Deck", status: "ACTIVE", progress: 15, due: "May 1, 2026", description: "Investor pitch deck for Series A fundraising with data visualizations and narrative structure." },
];

export const MILESTONES: Record<string, Array<{ id: string; title: string; done: boolean; due: string; approve?: boolean }>> = {
  p1: [
    { id: "m1", title: "Discovery & Research", done: true, due: "Feb 15" },
    { id: "m2", title: "Logo Concepts (3 directions)", done: true, due: "Mar 1" },
    { id: "m3", title: "Color & Typography System", done: true, due: "Mar 12" },
    { id: "m4", title: "Brand Guidelines Document", done: false, due: "Mar 28", approve: true },
    { id: "m5", title: "Final Delivery & Handoff", done: false, due: "Apr 2" },
  ],
  p2: [
    { id: "m6", title: "Wireframes & IA", done: true, due: "Feb 20" },
    { id: "m7", title: "Visual Design (Homepage)", done: true, due: "Mar 5" },
    { id: "m8", title: "Inner Pages Design", done: true, due: "Mar 15" },
    { id: "m9", title: "CMS Integration", done: false, due: "Mar 25", approve: true },
    { id: "m10", title: "QA & Launch", done: false, due: "Mar 28" },
  ],
  p3: [
    { id: "m11", title: "User Research", done: true, due: "Mar 5" },
    { id: "m12", title: "Design System Foundations", done: false, due: "Mar 25" },
    { id: "m13", title: "Core Screens", done: false, due: "Apr 8" },
    { id: "m14", title: "Prototype & Test", done: false, due: "Apr 15" },
    { id: "m15", title: "Final Handoff", done: false, due: "Apr 18" },
  ],
  p4: [
    { id: "m16", title: "Shopify Theme Setup", done: true, due: "Feb 28" },
    { id: "m17", title: "Product Page Design", done: true, due: "Mar 8" },
    { id: "m18", title: "Cart & Checkout", done: false, due: "Mar 15" },
    { id: "m19", title: "Final QA", done: false, due: "Mar 20" },
  ],
  p5: [
    { id: "m20", title: "Narrative Structure", done: false, due: "Apr 5" },
    { id: "m21", title: "Data Visualizations", done: false, due: "Apr 15" },
    { id: "m22", title: "Visual Design", done: false, due: "Apr 25" },
    { id: "m23", title: "Final Deck", done: false, due: "May 1" },
  ],
};

export const FILES: Record<string, Array<{ id: string; name: string; cat: string; size: string; date: string; isNew: boolean }>> = {
  p1: [
    { id: "f1", name: "logo-v3-final.svg", cat: "deliverable", size: "142 KB", date: "Mar 22", isNew: true },
    { id: "f2", name: "color-palette.pdf", cat: "deliverable", size: "1.2 MB", date: "Mar 18", isNew: false },
    { id: "f3", name: "brand-brief.docx", cat: "brief", size: "86 KB", date: "Feb 10", isNew: false },
    { id: "f4", name: "competitor-analysis.pdf", cat: "asset", size: "3.4 MB", date: "Feb 12", isNew: false },
  ],
  p2: [
    { id: "f5", name: "homepage-final.fig", cat: "deliverable", size: "8.2 MB", date: "Mar 20", isNew: true },
    { id: "f6", name: "inner-pages-v2.fig", cat: "deliverable", size: "12.1 MB", date: "Mar 18", isNew: true },
    { id: "f7", name: "sitemap.pdf", cat: "asset", size: "420 KB", date: "Feb 22", isNew: false },
    { id: "f8", name: "content-doc.docx", cat: "brief", size: "156 KB", date: "Feb 18", isNew: false },
  ],
  p3: [
    { id: "f9", name: "user-research.pdf", cat: "asset", size: "2.8 MB", date: "Mar 10", isNew: false },
    { id: "f10", name: "design-tokens.json", cat: "deliverable", size: "18 KB", date: "Mar 22", isNew: true },
  ],
  p4: [
    { id: "f11", name: "product-page-mockup.png", cat: "deliverable", size: "3.1 MB", date: "Mar 10", isNew: false },
    { id: "f12", name: "shopify-theme.zip", cat: "deliverable", size: "4.5 MB", date: "Mar 8", isNew: false },
  ],
  p5: [
    { id: "f13", name: "pitch-outline.docx", cat: "brief", size: "64 KB", date: "Mar 24", isNew: true },
  ],
};

export const ACTIVITIES = [
  { id: "a1", pid: "p1", actor: "Bloom Studio", action: "approved the logo concepts", time: "12 min ago", type: "success" },
  { id: "a2", pid: "p2", actor: "You", action: "uploaded 3 files to Website Redesign", time: "2 hours ago", type: "info" },
  { id: "a3", pid: "p3", actor: "TrekFit", action: "left a comment on wireframes", time: "Yesterday", type: "warning" },
  { id: "a4", pid: "p5", actor: "Skyward Ventures", action: "paid invoice #041", time: "Yesterday", type: "success" },
  { id: "a5", pid: "p4", actor: "System", action: "Invoice #038 for Madre Coffee is overdue", time: "3 days ago", type: "danger" },
];

export const INVOICES = [
  { id: "i1", cid: "c1", num: "#042", amt: "$1,800", status: "PAID", date: "Mar 22" },
  { id: "i2", cid: "c2", num: "#041", amt: "$3,200", status: "SENT", date: "Mar 15" },
  { id: "i3", cid: "c4", num: "#038", amt: "$950", status: "OVERDUE", date: "Mar 1" },
];

export const REV = [3200, 4100, 3800, 5200, 4600, 6100, 5400, 7200, 6800, 7600, 8100, 8420];

export const NOTIFS = [
  { id: "n1", text: "Bloom Studio approved logo concepts", time: "12m ago", read: false },
  { id: "n2", text: "New comment on TrekFit wireframes", time: "Yesterday", read: false },
  { id: "n3", text: "Invoice #038 is overdue", time: "3 days ago", read: true },
];

// Helpers
export const getClient = (id: string) => CLIENTS.find(c => c.id === id)!;
export const getProject = (id: string) => PROJECTS.find(p => p.id === id)!;

export const ALL_FILES = Object.entries(FILES).flatMap(([pid, files]) => {
  const proj = PROJECTS.find(p => p.id === pid);
  return files.map(f => ({ ...f, projectId: pid, projectTitle: proj?.title ?? "" }));
});
