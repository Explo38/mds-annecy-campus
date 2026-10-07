"use strict";

/* ---------- Icônes ---------- */
const icons = {
  home: "M3 11 12 3l9 8 M5 9.5V21h14V9.5 M10 21v-6h4v6",
  grid: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  box: "m12 3 9 5v9l-9 5-9-5V8z M3 8l9 5 9-5 M12 13v9",
  calendar: "M5 5h14a2 2 0 012 2v13H3V7a2 2 0 012-2 M7 3v4 M17 3v4 M3 10h18",
  clock: "M12 8v5l3 2 M21 12a9 9 0 11-18 0 9 9 0 0118 0",
  check: "m5 12 4 4L19 6",
  arrow: "M5 12h14 m-5-5 5 5-5 5",
  chevL: "m15 6-6 6 6 6",
  chevR: "m9 6 6 6-6 6",
  plus: "M12 5v14 M5 12h14",
  search: "M16 16l5 5 M18 10a8 8 0 11-16 0 8 8 0 0116 0",
  laptop: "M5 4h14v12H5z M2 20h20l-3-4H5z",
  camera: "M3 7h5l2-3h4l2 3h5v13H3z M16 13a4 4 0 11-8 0 4 4 0 018 0",
  key: "M14 9a5 5 0 11-10 0 5 5 0 0110 0 M12 12l9 9 M17 17l3-3",
  room: "M4 21V3h16v18 M2 21h20 M8 21V7h8v14 M13 13h.1",
  car: "m3 11 3-7h12l3 7v8H3z M3 11h18 M7 15h1 M16 15h1 M5 19v2 M19 19v2",
  code: "m8 6-6 6 6 6 M16 6l6 6-6 6 M14 3l-4 18",
  vr: "M3 7h18v11h-6l-3-3-3 3H3z M7 11h1 M16 11h1",
  settings: "M4 7h16 M4 17h16 M8 4v6 M16 14v6",
  close: "m6 6 12 12 M6 18 18 6",
  bag: "M5 7h14l2 14H3z M8 9V6a4 4 0 018 0v3",
  history: "M3 11a9 9 0 119 10 M3 4v7h7 M12 7v6l4 2",
  shield: "m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6z m-4 10 3 3 5-6",
  tag: "M3 3h8l10 10-8 8L3 11z M7.5 7.5h.01",
  alert: "M12 9v4 M12 17h.01 M10.3 3.9 1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z",
  pin: "M12 21s-7-6.2-7-11.5a7 7 0 0114 0C19 14.8 12 21 12 21z M14.5 9.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0",
  list: "M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01",
  edit: "M4 20h4L19 9l-4-4L4 16z M14 6l4 4",
  inbox: "M3 13h5l1 3h6l1-3h5 M5 5h14l2 8v6H3v-6z",
};
const ico = (n, cls = "") =>
  `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${icons[n] || icons.box}"/></svg>`;
const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const logo = `<svg class="logo-mark" viewBox="0 0 40 40" aria-hidden="true"><path d="M18 8a5 5 0 0 0-6 3 5 5 0 0 0-4 8 5 5 0 0 0 1 7 5 5 0 0 0 9 6z" fill="#3c3c3b"/><path d="M22 8a5 5 0 0 1 6 3 5 5 0 0 1 4 8 5 5 0 0 1-1 7 5 5 0 0 1-9 6z" fill="#2db8c5"/></svg>`;

/* ---------- Dates ---------- */
const pad = (n) => String(n).padStart(2, "0");
const localISO = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
const dayStart = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const sameDay = (a, b) => dayStart(a).getTime() === dayStart(b).getTime();
const weekStart = (d) => addDays(dayStart(d), -((new Date(d).getDay() + 6) % 7));
const atHour = (d, h) => {
  const x = dayStart(d);
  x.setHours(Math.floor(h), Math.round((h % 1) * 60));
  return x;
};
const stamp = (days, h = 9) => localISO(atHour(addDays(new Date(), days), h));
// Décalage (en jours) du n-ième jour ouvré à partir d’aujourd’hui, pour des données de démo réalistes.
const workday = (n) => {
  const isWork = (o) => addDays(new Date(), o).getDay() % 6 !== 0;
  const step = n < 0 ? -1 : 1;
  let off = 0,
    left = Math.abs(n);
  while (!isWork(off)) off += step;
  while (left > 0) {
    off += step;
    if (isWork(off)) left--;
  }
  return off;
};
const hhmm = (d) => new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
const fmt = (d, time = false) =>
  new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    ...(time ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
const longDay = (d) => {
  const s = new Date(d).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  return s[0].toUpperCase() + s.slice(1);
};
const relDay = (d) => {
  const diff = Math.round((dayStart(d) - dayStart(new Date())) / 864e5);
  if (diff === 0) return "aujourd’hui";
  if (diff === 1) return "demain";
  if (diff === -1) return "hier";
  if (diff > 1 && diff < 7) return new Date(d).toLocaleDateString("fr-FR", { weekday: "long" });
  return `le ${fmt(d)}`;
};

/* ---------- Données ---------- */
const STORE = "mds-campus-v4";
const types = {
  physical: "Matériel",
  key: "Clés",
  license: "Licences",
  room: "Salles",
  amphi: "Amphithéâtre",
  vehicle: "Véhicules",
};
const reserve = (t) => ["room", "amphi", "vehicle"].includes(t);

const seed = () => {
  const booking = (id, res, user, name, day, h1, h2, extra = {}) => {
    const d = workday(day);
    return {
      id,
      ids: [res],
      user,
      name,
      kind: "booking",
      start: stamp(d, h1),
      end: stamp(d, h2),
      status: "approved",
      purpose: "",
      created: stamp(Math.min(d, 0) - 2),
      ...extra,
    };
  };
  return {
    categories: [
      { id: "it", name: "Informatique", approval: false },
      { id: "av", name: "Audiovisuel", approval: true },
      { id: "vr", name: "Réalité virtuelle", approval: true },
      { id: "access", name: "Clés & accès", approval: false },
      { id: "soft", name: "Logiciels", approval: false },
      { id: "spaces", name: "Espaces de travail", approval: false },
      { id: "transport", name: "Véhicules", approval: true },
    ],
    resources: [
      { id: 1, name: "MacBook Pro 14″", code: "MDS-PC-001", type: "physical", cat: "it", icon: "laptop", qty: 4, status: "available", location: "Accueil · Bâtiment A" },
      { id: 2, name: "Canon EOS R50", code: "MDS-CAM-002", type: "physical", cat: "av", icon: "camera", qty: 3, status: "available", location: "Studio · Bâtiment B" },
      { id: 3, name: "Meta Quest 3", code: "MDS-VR-003", type: "physical", cat: "vr", icon: "vr", qty: 2, status: "available", location: "Lab immersif" },
      { id: 4, name: "Salle 204 — Créativité", code: "MDS-SAL-204", type: "room", cat: "spaces", icon: "room", status: "available", location: "Bâtiment A · 24 places" },
      { id: 5, name: "Adobe Creative Cloud", code: "MDS-LIC-005", type: "license", cat: "soft", icon: "code", qty: 10, status: "available", location: "Licences nominatives" },
      { id: 6, name: "Clé du studio photo", code: "MDS-CLE-006", type: "key", cat: "access", icon: "key", status: "available", location: "Accueil · Bâtiment B" },
      { id: 7, name: "Amphithéâtre des Alpes", code: "MDS-AMP-001", type: "amphi", cat: "spaces", icon: "room", status: "available", location: "Rez-de-chaussée · 120 places" },
      { id: 8, name: "Renault Kangoo", code: "MDS-VEH-001", type: "vehicle", cat: "transport", icon: "car", status: "available", location: "Parking du campus · 5 places" },
      { id: 9, name: "Dell Latitude 5440", code: "MDS-PC-009", type: "physical", cat: "it", icon: "laptop", qty: 2, status: "maintenance", location: "Service informatique" },
      { id: 10, name: "Kit câbles & adaptateurs", code: "MDS-ACC-010", type: "physical", cat: "it", icon: "box", qty: 6, status: "available", location: "Accueil · Bâtiment A" },
      { id: 11, name: "Salle 101 — Projet", code: "MDS-SAL-101", type: "room", cat: "spaces", icon: "room", status: "available", location: "Bâtiment A · 12 places" },
      { id: 12, name: "Studio photo", code: "MDS-STU-001", type: "room", cat: "av", icon: "camera", status: "available", location: "Bâtiment B · fond cyclo" },
      { id: 13, name: "Salle 108 — Mac", code: "MDS-SAL-108", type: "room", cat: "spaces", icon: "laptop", status: "available", location: "Bâtiment A · 20 postes" },
      { id: 14, name: "Micro Rode Wireless GO", code: "MDS-AUD-014", type: "physical", cat: "av", icon: "box", qty: 2, status: "available", location: "Studio · Bâtiment B" },
      { id: 15, name: "Trépied Manfrotto", code: "MDS-AV-015", type: "physical", cat: "av", icon: "camera", qty: 3, status: "available", location: "Studio · Bâtiment B" },
    ],
    requests: [
      { id: 1023, ids: [6], user: "other", name: "Léa Fontaine", group: "B3 Création digitale", kind: "loan", start: stamp(0, 8.5), end: stamp(0, 18), status: "approved", purpose: "Shooting au studio", created: stamp(-1) },
      { id: 1024, ids: [5], user: "other", name: "Nina Rossi", group: "M1 Expert digital", kind: "loan", start: stamp(-10), end: stamp(20, 18), status: "approved", purpose: "Projet de mémoire", created: stamp(-11) },
      { id: 1025, ids: [15, 10], qty: { 10: 2 }, user: "other", name: "Inès Moreau", group: "B2 Création digitale", kind: "loan", start: stamp(-2), end: stamp(0, 18), status: "approved", purpose: "Tournage court-métrage", created: stamp(-3) },
      { id: 1026, ids: [14], user: "other", name: "Hugo Bernard", group: "B1 Web", kind: "loan", start: stamp(workday(1), 9), end: stamp(workday(2), 18), status: "approved", purpose: "Interview podcast", created: stamp(-1) },
      { id: 1027, ids: [3], user: "other", name: "Thomas Girard", group: "B3 Développement web", kind: "loan", start: stamp(-1, 10), end: stamp(3, 18), status: "approved", purpose: "Prototype VR", created: stamp(-2) },
      { id: 1028, ids: [1], user: "other", name: "Thomas Girard", group: "B3 Développement web", kind: "loan", start: stamp(-1, 10), end: stamp(1, 18), status: "approved", purpose: "Hackathon", created: stamp(-2) },
      { id: 1001, ids: [1], user: "student", name: "Alex Martin", kind: "loan", start: stamp(-3), end: stamp(2, 18), status: "approved", purpose: "Projet de fin de semestre", created: stamp(-3) },
      { id: 1002, ids: [2], qty: { 2: 2 }, user: "professor", name: "Camille Laurent", kind: "loan", start: stamp(1), end: stamp(3, 18), status: "pending", group: "B2 Création digitale", purpose: "Atelier photo", created: stamp(-1) },
      { id: 1004, ids: [3], user: "professor", name: "Camille Laurent", kind: "loan", start: stamp(-5), end: stamp(-1, 18), status: "approved", purpose: "Atelier immersif", created: stamp(-5) },
      booking(1003, 4, "student", "Alex Martin", 1, 14, 16, { purpose: "Travail en groupe" }),
      booking(1005, 7, "professor", "Camille Laurent", 0, 9, 12, { purpose: "Conférence UX", group: "B3 Développement web" }),
      booking(1006, 11, "other", "BDE MyDigitalSchool", 0, 12, 14, { purpose: "Réunion du bureau" }),
      booking(1007, 4, "other", "Thomas Girard", 0, 10, 12, { purpose: "Révisions" }),
      booking(1008, 13, "professor", "Camille Laurent", 0, 14, 17.5, { purpose: "Cours After Effects", group: "B2 Création digitale" }),
      booking(1009, 12, "other", "Léa Fontaine", 1, 9.5, 12, { purpose: "Shooting portfolio", status: "pending" }),
      booking(1010, 7, "professor", "Camille Laurent", 2, 14, 16.5, { purpose: "Jury de projets", group: "M1 Expert digital" }),
      booking(1011, 12, "student", "Alex Martin", 3, 10, 12, { purpose: "Photos produit", status: "pending" }),
      booking(1012, 8, "other", "Service communication", 2, 8, 18, { purpose: "Salon de l’étudiant" }),
      booking(1013, 13, "other", "Hugo Bernard", 1, 9, 11, { purpose: "Montage vidéo" }),
      booking(1014, 4, "professor", "Camille Laurent", 4, 9, 12, { purpose: "Atelier branding", group: "B1 Web" }),
      booking(1015, 11, "other", "Inès Moreau", 4, 14, 16, { purpose: "Point d’équipe" }),
      booking(1016, 7, "other", "BDE MyDigitalSchool", 5, 18, 20, { purpose: "Soirée d’intégration" }),
      booking(1017, 11, "student", "Alex Martin", -1, 16, 18, { purpose: "Préparation de l’oral" }),
      booking(1018, 4, "other", "Thomas Girard", -2, 9, 11, { purpose: "Révisions" }),
      booking(1019, 13, "professor", "Camille Laurent", 2, 9, 12, { purpose: "Cours Figma", group: "B1 Web" }),
      booking(1020, 12, "other", "Nina Rossi", 2, 14, 17, { purpose: "Tournage clip" }),
      booking(1021, 4, "other", "Inès Moreau", 6, 10, 12, { purpose: "Atelier UX" }),
      booking(1022, 11, "student", "Alex Martin", 0, 15, 17, { purpose: "Réunion projet" }),
    ],
    events: [
      { text: "Réservation de la salle 204 confirmée", at: stamp(-1) },
      { text: "Nouvelle demande de Camille Laurent", at: stamp(-1) },
      { text: "MacBook Pro 14″ remis à Alex Martin", at: stamp(-3) },
    ],
  };
};

let db;
try {
  db = JSON.parse(localStorage.getItem(STORE)) || seed();
} catch {
  db = seed();
}

const users = {
  student: { name: "Alex Martin", label: "Étudiant", initials: "AM" },
  professor: { name: "Camille Laurent", label: "Professeur", initials: "CL" },
  admin: { name: "Sophie Dubois", label: "Gestionnaire", initials: "SD" },
};
const labels = {
  available: "Disponible",
  borrowed: "Emprunté",
  out: "Plus en stock",
  occupied: "Occupé",
  reserved: "Réservé",
  maintenance: "En maintenance",
  unavailable: "Indisponible",
  pending: "En attente",
  approved: "Validée",
  late: "En retard",
  active: "En cours",
  returned: "Rendue",
  finished: "Terminée",
  cancelled: "Annulée",
  rejected: "Refusée",
};

/* ---------- État de l’interface ---------- */
const mobile = matchMedia("(max-width: 760px)");
const motionOK = !matchMedia("(prefers-reduced-motion: reduce)").matches;
let role = "student",
  view = "dashboard",
  filter = "all",
  query = "",
  category = "",
  statusFilter = "",
  reqFilter = "all",
  trackFilter = "all",
  cart = {},
  planView = mobile.matches ? "day" : "week",
  planDate = dayStart(new Date()),
  planHidden = [],
  lastView = null,
  prevIndicator = null;

/* ---------- Sélecteurs métier ---------- */
const resource = (id) => db.resources.find((r) => r.id === id);
const cat = (id) => db.categories.find((c) => c.id === id);
const reservables = () => db.resources.filter((r) => reserve(r.type) && !r.retired);
const palette = ["#662483", "#e71d73", "#258695", "#a83fde", "#c90d58", "#2db8c5", "#7a2a9f", "#fd69b4"];
const colorOf = (id) => {
  const i = db.resources.filter((r) => reserve(r.type)).findIndex((r) => r.id === id);
  return palette[Math.max(0, i) % palette.length];
};
const reqStatus = (r) => {
  if (r.status !== "approved") return r.status;
  const now = new Date();
  if (r.kind === "loan" && new Date(r.end) < now) return "late";
  if (new Date(r.start) > now) return "approved";
  return r.kind === "booking" && new Date(r.end) < now ? "finished" : "active";
};
/* Stock : chaque ressource a une quantité (1 pour une salle ou un véhicule).
   Une demande réserve 1 unité par ressource, sauf précision dans r.qty. */
const stock = (r) => Math.max(0, r?.qty ?? 1);
const usable = (r) => (r.status === "available" && !r.retired ? Math.max(0, stock(r) - (r.maint || 0)) : 0);
const units = (q, id) => q.qty?.[id] ?? 1;
const holding = (r) =>
  db.requests.filter((q) => q.ids.includes(r.id) && q.status === "approved" && ["active", "late"].includes(reqStatus(q)));
const outNow = (r) => holding(r).reduce((n, q) => n + units(q, r.id), 0);
const availNow = (r) => Math.max(0, usable(r) - outNow(r));
const resStatus = (r) => {
  if (r.status !== "available") return r.status;
  if (reserve(r.type)) return outNow(r) ? "occupied" : "available";
  if (availNow(r) > 0) return "available";
  return (r.maint || 0) >= stock(r) ? "maintenance" : "out";
};
// Nom avec quantité, ex. « Kit câbles × 2 ».
const itemName = (q, id) => `${esc(resource(id)?.name)}${units(q, id) > 1 ? ` × ${units(q, id)}` : ""}`;
const badge = (s) => `<span class="badge s-${s}">${labels[s] || s}</span>`;
const mine = () => db.requests.filter((r) => role === "admin" || r.user === role);
const visible = (r) => role === "admin" || r.user === role;
const cartIds = () => Object.keys(cart).map(Number);
const cartCount = () => Object.values(cart).reduce((n, v) => n + v, 0);
const firstName = () => users[role].name.split(" ")[0];

function persist(text) {
  if (text) db.events.unshift({ text, at: new Date().toISOString() });
  try {
    localStorage.setItem(STORE, JSON.stringify(db));
  } catch {
    toast("Stockage local indisponible : vos changements ne seront pas conservés.", "warn");
  }
}

/* ---------- Animations ---------- */
const ease = "cubic-bezier(.2,.8,.2,1)";
function reveal(elements, { y = 14, step = 40, duration = 460, max = 14 } = {}) {
  if (!motionOK) return;
  elements.slice(0, max).forEach((el, i) =>
    el.animate([{ opacity: 0, transform: `translateY(${y}px)` }, { opacity: 1, transform: "none" }], {
      duration,
      delay: i * step,
      easing: ease,
      fill: "backwards",
    }),
  );
}
function slide(el, dir) {
  if (!motionOK || !el) return;
  el.animate([{ opacity: 0, transform: `translateX(${dir * 24}px)` }, { opacity: 1, transform: "none" }], {
    duration: 380,
    easing: ease,
  });
}
function pop(el) {
  if (!motionOK || !el) return;
  el.animate([{ transform: "scale(1)" }, { transform: "scale(1.35)" }, { transform: "scale(1)" }], {
    duration: 420,
    easing: "cubic-bezier(.3,1.6,.5,1)",
  });
}

function toast(text, tone = "ok") {
  const el = $("#toast");
  el.innerHTML = `${ico(tone === "warn" ? "alert" : "check")}<span>${esc(text)}</span>`;
  el.className = `show ${tone}`;
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => (el.className = tone), 3600);
}

/* ---------- Fenêtre modale ---------- */
let closeTimer;
function modal(title, body, actions = "", size = "") {
  const d = $("#modal");
  clearTimeout(closeTimer);
  d.classList.remove("closing");
  d.className = size;
  d.innerHTML = `<div class="modal-inner"><div class="modal-head"><h2>${title}</h2><button class="icon-btn ghost" data-close aria-label="Fermer">${ico("close")}</button></div>${body}${actions ? `<div class="modal-actions">${actions}</div>` : ""}</div>`;
  if (!d.open) d.showModal();
  else reveal([$(".modal-inner", d)], { y: 6, duration: 260 });
  $$("[data-close]", d).forEach((b) => (b.onclick = closeModal));
}
function closeModal() {
  const d = $("#modal");
  if (!d.open) return;
  if (!motionOK) return d.close();
  d.classList.add("closing");
  closeTimer = setTimeout(() => {
    d.classList.remove("closing");
    d.close();
  }, 180);
}
$("#modal").addEventListener("cancel", (e) => {
  e.preventDefault();
  closeModal();
});
$("#modal").addEventListener("click", (e) => {
  if (e.target.id === "modal") closeModal();
});

/* ---------- Navigation ---------- */
const pages = {
  dashboard: ["Accueil", "home"],
  catalog: ["Catalogue", "box"],
  planning: ["Réservations", "calendar"],
  requests: ["Mes demandes", "inbox"],
  history: ["Historique", "history"],
  tracking: ["Suivi", "clock"],
  approvals: ["À valider", "shield"],
  manage: ["Ressources", "settings"],
  categories: ["Catégories", "tag"],
};
const adminOnly = ["tracking", "approvals", "manage", "categories"];
const pageTitle = (v) => (v === "requests" && role === "admin" ? "Demandes" : pages[v][0]);
function navigate(v) {
  view = v;
  query = "";
  render();
  window.scrollTo({ top: 0, behavior: motionOK ? "smooth" : "auto" });
}
const navBtn = (v, count = 0) =>
  `<button data-nav="${v}" class="${view === v ? "active" : ""}" ${view === v ? 'aria-current="page"' : ""}>${ico(pages[v][1])}<span>${pageTitle(v)}</span>${count ? `<span class="count">${count}</span>` : ""}</button>`;

function renderChrome() {
  const u = users[role];
  const pending = db.requests.filter((r) => r.status === "pending").length;
  $("#sidebar").innerHTML = `
    <button class="brand" data-nav="dashboard" aria-label="Accueil">${logo}<span><b>Campus</b><small>MyDigitalSchool Annecy</small></span></button>
    <nav>
      <span class="nav-indicator" aria-hidden="true"></span>
      ${navBtn("dashboard")}${navBtn("catalog")}${navBtn("planning")}${navBtn("requests")}${navBtn("history")}
      ${role === "admin" ? `<div class="nav-label">Gestion</div>${navBtn("tracking", db.requests.filter((r) => reqStatus(r) === "late").length)}${navBtn("approvals", pending)}${navBtn("manage")}${navBtn("categories")}` : ""}
    </nav>
    <div class="side-bottom">
      <div class="profile"><span class="avatar">${u.initials}</span><span><b>${u.name}</b><small>${u.label}</small></span></div>
    </div>`;
  $("#tabbar").innerHTML = (role === "admin" ? ["dashboard", "tracking", "planning", "approvals"] : ["dashboard", "catalog", "planning", "requests"])
    .map(
      (v) =>
        `<button data-nav="${v}" class="${view === v ? "active" : ""}">${ico(pages[v][1])}<span>${v === "requests" ? "Demandes" : pages[v][0]}</span>${v === "approvals" && pending ? `<i>${pending}</i>` : ""}</button>`,
    )
    .join("");
  $("#topbar").innerHTML = `
    <button class="brand mobile-only" data-nav="dashboard" aria-label="Accueil">${logo}<b>Campus</b></button>
    <span class="today desktop-only">${longDay(new Date())}</span>
    <div class="top-actions">
      <label class="demo"><span>Mode démo</span><select id="role" aria-label="Changer de profil de démonstration">${Object.entries(users)
        .map(([k, x]) => `<option value="${k}" ${role === k ? "selected" : ""}>${x.label}</option>`)
        .join("")}</select></label>
      <button class="icon-btn cart-btn" data-action="cart" aria-label="Ma sélection de matériel (${cartCount()})">${ico("bag")}${cartCount() ? `<i>${cartCount()}</i>` : ""}</button>
    </div>`;
  placeIndicator();
  bindChrome();
}
function bindChrome() {
  $$("#sidebar [data-nav], #topbar [data-nav], #tabbar [data-nav]").forEach((b) => (b.onclick = () => navigate(b.dataset.nav)));
  $("#topbar [data-action=cart]").onclick = openCart;
  $("#role").onchange = (e) => {
    role = e.target.value;
    cart = {};
    prevIndicator = null;
    lastView = null;
    render();
    toast(`Vous voyez maintenant l’app comme ${users[role].label.toLowerCase()}.`);
  };
}
function placeIndicator() {
  const ind = $(".nav-indicator"),
    active = $("#sidebar nav button.active");
  if (!ind) return;
  if (!active) {
    ind.style.opacity = 0;
    prevIndicator = null;
    return;
  }
  const top = active.offsetTop;
  ind.style.cssText = `opacity:1;height:${active.offsetHeight}px;transform:translateY(${top}px)`;
  if (motionOK && prevIndicator !== null && prevIndicator !== top)
    ind.animate([{ transform: `translateY(${prevIndicator}px)` }, { transform: `translateY(${top}px)` }], {
      duration: 420,
      easing: "cubic-bezier(.3,1.3,.5,1)",
    });
  prevIndicator = top;
}

/* ---------- Rendu principal ---------- */
const head = (title, sub, action = "") =>
  `<div class="page-head"><div><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ""}</div>${action ? `<div class="page-actions">${action}</div>` : ""}</div>`;
const empty = (text, cta = "") => `<div class="empty">${ico("inbox")}<p>${text}</p>${cta}</div>`;

function render() {
  if (role !== "admin" && adminOnly.includes(view)) view = "dashboard";
  renderChrome();
  const main = $("#main");
  main.innerHTML = (views[view] || views.dashboard)();
  bind();
  if (lastView !== view) {
    reveal($$(":scope > *", main));
    reveal($$(".resource-card, .ev, .bar", main), { y: 8, step: 22, duration: 380, max: 30 });
  }
  lastView = view;
  scrollToNow();
}
// Sur petit écran, la frise du jour s’ouvre sur l’heure courante plutôt que sur 8 h.
function scrollToNow() {
  $$(".scroll-x").forEach((box) => {
    const tl = $(".timeline", box);
    if (!tl || box.scrollWidth <= box.clientWidth) return;
    const h = Math.min(H1 - 3, Math.max(H0, hourOf(new Date()) - 1));
    const track = $(".tl-track", tl);
    box.scrollLeft = ((h - H0) / (H1 - H0)) * track.offsetWidth;
  });
}

const views = {
  dashboard() {
    const now = new Date();
    const list = mine();
    const late = list.filter((r) => reqStatus(r) === "late");
    const current = list
      .filter((r) => ["active", "late"].includes(reqStatus(r)) || (["approved", "pending"].includes(r.status) && new Date(r.start) > now))
      .sort((a, b) => a.start.localeCompare(b.start))
      .slice(0, 5);
    const pending = db.requests.filter((r) => r.status === "pending");
    const available = db.resources.filter((r) => !r.retired && resStatus(r) === "available").length;
    const todayCount = db.requests.filter(
      (r) => r.kind === "booking" && ["approved", "pending"].includes(r.status) && sameDay(r.start, now),
    ).length;

    let alerts = "";
    if (role === "admin") {
      if (pending.length)
        alerts += `<button class="alert" data-nav="approvals">${ico("shield")}<span><b>${pending.length} demande${pending.length > 1 ? "s" : ""} à valider</b><small>La plus ancienne date du ${fmt(pending.map((r) => r.created).sort()[0])}.</small></span>${ico("arrow")}</button>`;
      const lateAll = db.requests.filter((r) => reqStatus(r) === "late");
      if (lateAll.length)
        alerts += `<button class="alert pink" data-nav="tracking">${ico("alert")}<span><b>${lateAll.length} retour${lateAll.length > 1 ? "s" : ""} en retard</b><small>${esc(resource(lateAll[0].ids[0])?.name)} · ${esc(lateAll[0].name)}, attendu le ${fmt(lateAll[0].end)}.</small></span>${ico("arrow")}</button>`;
    } else
      late.forEach(
        (r) =>
          (alerts += `<button class="alert pink" data-detail="${r.id}">${ico("alert")}<span><b>${esc(resource(r.ids[0])?.name)} à rendre</b><small>Le retour était prévu ${relDay(r.end)}. Merci de le rapporter à l’accueil.</small></span>${ico("arrow")}</button>`),
      );

    const actions =
      role === "admin"
        ? `<button class="btn" data-nav="tracking">${ico("clock")} Suivi des sorties</button><button class="btn primary" data-nav="approvals">Traiter les demandes</button>`
        : `<button class="btn" data-action="book">${ico("calendar")} Réserver une salle</button><button class="btn primary" data-action="loan">${ico("plus")} Emprunter du matériel</button>`;

    const loans = list.filter((r) => r.kind === "loan" && ["active", "late"].includes(reqStatus(r))).length;
    const next = list.filter((r) => r.kind === "booking" && ["approved", "pending"].includes(r.status) && new Date(r.end) > now).length;
    const summary =
      role === "admin"
        ? `${pending.length} demande${pending.length > 1 ? "s" : ""} en attente et ${todayCount} réservation${todayCount > 1 ? "s" : ""} aujourd’hui.`
        : loans || next
          ? `Vous avez ${loans ? `${loans} emprunt${loans > 1 ? "s" : ""} en cours` : ""}${loans && next ? " et " : ""}${next ? `${next} réservation${next > 1 ? "s" : ""} à venir` : ""}.`
          : "Rien de prévu pour l’instant.";
    return (
      head(`Bonjour ${firstName()}`, summary, actions) +
      (alerts ? `<div class="alerts">${alerts}</div>` : "") +
      `<div class="dash">
        <div class="dash-main">
          <section class="panel">
            <div class="panel-head"><h2>${role === "admin" ? "Demandes récentes" : "Vos emprunts et réservations"}</h2><button class="link" data-nav="requests">Tout voir</button></div>
            ${
              role === "admin"
                ? requestList(db.requests.slice().sort((a, b) => b.created.localeCompare(a.created)).slice(0, 5), true)
                : current.length
                  ? `<div class="upcoming">${current.map(upcomingRow).join("")}</div>`
                  : empty("Rien de prévu pour l’instant.", `<button class="btn small" data-nav="catalog">Parcourir le catalogue</button>`)
            }
          </section>
          <section class="panel">
            <div class="panel-head"><div><h2>Aujourd’hui sur le campus</h2><p>${todayCount} réservation${todayCount > 1 ? "s" : ""} · cliquez sur un créneau libre pour réserver</p></div><button class="link" data-nav="planning">Ouvrir le planning</button></div>
            <div class="scroll-x">${dayTimeline(dayStart(now), true)}</div>
          </section>
        </div>
        <div class="dash-side">
          <section class="panel figures">
            <div><strong>${available}</strong><span>ressources disponibles</span></div>
            <div><strong>${todayCount}</strong><span>réservations aujourd’hui</span></div>
            <div><strong>${role === "admin" ? pending.length : list.filter((r) => r.status === "pending").length}</strong><span>demande${pending.length > 1 ? "s" : ""} en attente</span></div>
          </section>
          <section class="panel">
            <div class="panel-head"><h2>Activité</h2></div>
            <ul class="feed">${(role === "admin"
              ? db.events
              : list
                  .slice()
                  .sort((a, b) => b.created.localeCompare(a.created))
                  .map((r) => ({ text: `${resource(r.ids[0])?.name} · ${labels[reqStatus(r)].toLowerCase()}`, at: r.created }))
            )
              .slice(0, 5)
              .map((e) => `<li><span></span><p>${esc(e.text)}<small>${fmt(e.at, true)}</small></p></li>`)
              .join("") || "<li class='muted'>Aucune activité.</li>"}</ul>
          </section>
          <section class="panel help">
            <h2>Comment ça marche ?</h2>
            <ol><li><span><b>Choisissez</b> du matériel ou un créneau.</span></li><li><span><b>Validation</b> immédiate, ou par l’accueil pour certains équipements.</span></li><li><span><b>Récupérez</b> et rendez le matériel à l’accueil du bâtiment A.</span></li></ol>
          </section>
        </div>
      </div>`
    );
  },

  catalog() {
    const manage = view === "manage";
    return (
      head(
        manage ? "Ressources" : "Catalogue",
        manage ? "Ajoutez, modifiez ou retirez les ressources proposées." : "Le matériel s’emprunte, les salles et véhicules se réservent.",
        manage
          ? `<button class="btn primary" data-action="add-resource">${ico("plus")} Ajouter une ressource</button>`
          : `<button class="btn ${cartCount() ? "primary" : ""}" data-action="cart">${ico("bag")} Ma sélection${cartCount() ? ` · ${cartCount()}` : ""}</button>`,
      ) +
      `<div class="toolbar">
        ${segmented("filter", filter, [["all", "Tout"], ["loan", "À emprunter"], ["booking", "À réserver"]])}
        <label class="search">${ico("search")}<input id="search" type="search" placeholder="Rechercher par nom ou référence" value="${esc(query)}"></label>
        <select id="category" aria-label="Catégorie"><option value="">Toutes les catégories</option>${db.categories.map((c) => `<option value="${c.id}" ${category === c.id ? "selected" : ""}>${esc(c.name)}</option>`).join("")}</select>
        <select id="status-filter" aria-label="Disponibilité"><option value="">Tous les états</option>${["available", "out", "occupied", "maintenance", "unavailable"].map((s) => `<option value="${s}" ${s === statusFilter ? "selected" : ""}>${labels[s]}</option>`).join("")}</select>
      </div>
      <div id="catalog-results">${catalogCards()}</div>`
    );
  },

  requests() {
    const all = mine()
      .slice()
      .sort((a, b) => b.created.localeCompare(a.created));
    const groups = {
      all: () => true,
      open: (r) => ["pending", "approved", "active", "late"].includes(reqStatus(r)),
      closed: (r) => ["returned", "finished", "cancelled", "rejected"].includes(reqStatus(r)),
    };
    const list = all.filter(groups[reqFilter]);
    return (
      head(
        role === "admin" ? "Demandes" : "Mes demandes",
        role === "admin" ? "Tous les emprunts et réservations du campus." : "Suivez vos emprunts et réservations.",
        role === "admin" ? "" : `<button class="btn primary" data-nav="catalog">${ico("plus")} Nouvelle demande</button>`,
      ) +
      `<div class="toolbar">${segmented("req", reqFilter, [["all", `Toutes · ${all.length}`], ["open", `En cours · ${all.filter(groups.open).length}`], ["closed", `Terminées · ${all.filter(groups.closed).length}`]])}</div>
      <section class="panel flush">${requestList(list, role === "admin")}</section>`
    );
  },

  tracking() {
    return head("Suivi", "Ce qui est sorti, chez qui, et ce qui doit revenir.") + `<div id="track-body">${trackingBody()}</div>`;
  },

  approvals() {
    const list = db.requests.filter((r) => r.status === "pending").sort((a, b) => a.start.localeCompare(b.start));
    return (
      head("À valider", "Les demandes qui concernent du matériel ou des espaces soumis à validation.") +
      (list.length
        ? `<div class="approvals">${list
            .map(
              (r) => `<article class="approval">
              <div class="approval-who"><span class="avatar">${esc(r.name.split(" ").map((w) => w[0]).join("").slice(0, 2))}</span><div><b>${esc(r.name)}</b><small>${esc(r.group || (users[r.user]?.label ?? "Externe"))} · demandé le ${fmt(r.created)}</small></div></div>
              <div class="approval-what">${r.ids.map((id) => `<span class="pill-res">${ico(resource(id)?.icon)}${itemName(r, id)}</span>`).join("")}</div>
              <p class="approval-when">${ico("calendar")} ${dateRange(r)}</p>
              ${r.purpose ? `<p class="approval-why">« ${esc(r.purpose)} »</p>` : ""}
              <div class="approval-actions"><button class="btn" data-reject="${r.id}">Refuser</button><button class="btn primary" data-approve="${r.id}">${ico("check")} Valider</button></div>
            </article>`,
            )
            .join("")}</div>`
        : `<section class="panel">${empty("Tout est à jour. Aucune demande en attente.")}</section>`)
    );
  },

  history() {
    const closed = mine()
      .filter((r) => ["returned", "finished", "cancelled", "rejected"].includes(reqStatus(r)))
      .sort((a, b) => b.end.localeCompare(a.end));
    let journal = "";
    if (role === "admin") {
      const byDay = {};
      db.events.slice(0, 40).forEach((e) => (byDay[dayStart(e.at).toISOString()] ??= []).push(e));
      journal = `<section class="panel"><div class="panel-head"><h2>Journal</h2></div>${Object.entries(byDay)
        .map(
          ([d, list]) =>
            `<div class="journal-day"><h3>${longDay(d)}</h3><ul class="feed">${list.map((e) => `<li><span></span><p>${esc(e.text)}<small>${hhmm(e.at)}</small></p></li>`).join("")}</ul></div>`,
        )
        .join("")}</section>`;
    }
    return (
      head("Historique", role === "admin" ? "Ce qui s’est passé sur le campus." : "Vos demandes terminées, rendues ou annulées.") +
      `<section class="panel flush">${requestList(closed, role === "admin", "Aucune demande terminée pour le moment.")}</section>` +
      journal
    );
  },

  manage() {
    return views.catalog();
  },

  categories() {
    return (
      head(
        "Catégories",
        "Choisissez les catégories dont les demandes doivent être validées par l’accueil.",
        `<button class="btn primary" data-action="add-category">${ico("plus")} Ajouter une catégorie</button>`,
      ) +
      `<section class="panel flush">${db.categories
        .map(
          (c) => `<div class="category-row"><div><b>${esc(c.name)}</b><small>${db.resources.filter((r) => r.cat === c.id && !r.retired).length} ressource(s)</small></div>
          <label class="switch"><input type="checkbox" data-cat="${c.id}" ${c.approval ? "checked" : ""}><span class="track"><span></span></span><span class="switch-label">Validation requise</span></label></div>`,
        )
        .join("")}</section>
      <p class="hint">La règle s’applique aux nouvelles demandes. Une demande contenant au moins une ressource soumise à validation est mise en attente.</p>`
    );
  },

  planning() {
    return (
      head(
        "Réservations",
        "Le planning des salles, de l’amphithéâtre et des véhicules.",
        `<button class="btn primary" data-action="book">${ico("plus")} Réserver</button>`,
      ) +
      `<div class="plan-bar">
        <div class="plan-nav">
          <button class="icon-btn" data-plan-step="-1" aria-label="Période précédente">${ico("chevL")}</button>
          <button class="btn small" data-plan-today>Aujourd’hui</button>
          <button class="icon-btn" data-plan-step="1" aria-label="Période suivante">${ico("chevR")}</button>
          <h2 id="plan-label">${planLabel()}</h2>
        </div>
        ${segmented("plan", planView, [["day", "Jour"], ["week", "Semaine"], ["list", "Liste"]])}
      </div>
      <div class="chips" id="plan-chips">${planChips()}</div>
      <section class="panel flush plan-panel"><div id="plan-body">${planBody()}</div></section>
      <div class="legend"><span><i class="lg-ok"></i>Validée</span><span><i class="lg-pending"></i>En attente de validation</span><span><i class="lg-mine"></i>Vos réservations</span></div>`
    );
  },
};

/* ---------- Composants ---------- */
function segmented(name, value, options) {
  const i = Math.max(0, options.findIndex(([v]) => v === value));
  return `<div class="segmented" role="tablist" data-seg="${name}" style="--n:${options.length};--i:${i}"><span class="thumb" aria-hidden="true"></span>${options
    .map(([v, t]) => `<button role="tab" aria-selected="${v === value}" data-${name}="${v}" class="${v === value ? "active" : ""}">${t}</button>`)
    .join("")}</div>`;
}

function dateRange(r) {
  const s = new Date(r.start),
    e = new Date(r.end);
  if (sameDay(s, e)) return `${longDay(s)} · ${hhmm(s)} – ${hhmm(e)}`;
  return `${fmt(s, true)} → ${fmt(e, true)}`;
}

function upcomingRow(r) {
  const s = reqStatus(r),
    res = resource(r.ids[0]);
  const when =
    r.kind === "loan"
      ? ["active", "late"].includes(s)
        ? `À rendre ${relDay(r.end)} à ${hhmm(r.end)}`
        : `Retrait ${relDay(r.start)} à ${hhmm(r.start)}`
      : `${relDay(r.start)[0].toUpperCase() + relDay(r.start).slice(1)} · ${hhmm(r.start)} – ${hhmm(r.end)}`;
  return `<button class="up-row" data-detail="${r.id}" style="--c:${r.kind === "booking" ? colorOf(res?.id) : "var(--purple)"}">
    <span class="res-icon">${ico(res?.icon)}</span>
    <span class="up-main"><b>${itemName(r, r.ids[0])}${r.ids.length > 1 ? ` + ${r.ids.length - 1}` : ""}</b><small>${when}</small></span>
    ${badge(s)}${ico("chevR", "chev")}
  </button>`;
}

const initials = (name) =>
  String(name)
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
const duration = (ms) => {
  const h = Math.round(Math.abs(ms) / 36e5);
  if (h < 24) return `${Math.max(1, h)} h`;
  const d = Math.round(h / 24);
  return `${d} jour${d > 1 ? "s" : ""}`;
};

/* ---------- Suivi (gestionnaire) ---------- */
function trackingData() {
  const now = new Date();
  const q = query.trim().toLowerCase();
  const match = (r) =>
    !q || `${r.name} ${r.group || ""} ${r.ids.map((id) => `${resource(id)?.name} ${resource(id)?.code}`).join(" ")}`.toLowerCase().includes(q);
  const open = db.requests.filter((r) => r.status === "approved" && match(r));
  const byEnd = (a, b) => a.end.localeCompare(b.end);
  return {
    q,
    late: open.filter((r) => reqStatus(r) === "late").sort(byEnd),
    out: open.filter((r) => r.kind === "loan" && reqStatus(r) === "active").sort(byEnd),
    rooms: open.filter((r) => r.kind === "booking" && reqStatus(r) === "active").sort(byEnd),
    soon: open
      .filter((r) => new Date(r.start) > now && new Date(r.start) < addDays(dayStart(now), 2))
      .sort((a, b) => a.start.localeCompare(b.start)),
  };
}
function trackingBody() {
  const now = new Date();
  const d = trackingData();
  const count = (list) => list.reduce((n, r) => n + r.ids.reduce((m, id) => m + units(r, id), 0), 0);
  const outCount = count(d.out) + count(d.late);
  const dueToday = d.out.filter((r) => sameDay(r.end, now)).length;
  const plural = (n, word) => `${word}${n > 1 ? "s" : ""}`;
  const sections = {
    late: ["En retard", d.late, "Matériel non rendu à la date prévue.", "pink"],
    out: ["Matériel prêté", d.out, "Sorti et pas encore rendu, du retour le plus proche au plus lointain.", ""],
    rooms: ["Espaces occupés maintenant", d.rooms, "Réservations en cours à cette heure.", ""],
    soon: ["À préparer", d.soon, "Retraits et réservations d’aujourd’hui et de demain.", ""],
    today: ["Retours attendus aujourd’hui", d.out.filter((r) => sameDay(r.end, now)), "Matériel qui doit revenir avant ce soir.", ""],
  };
  const keys = trackFilter === "all" ? ["late", "out", "rooms", "soon"] : [trackFilter];
  const figure = (key, n, label, tone = "") =>
    `<button class="${tone} ${trackFilter === key ? "on" : ""}" data-track-filter="${key}" aria-pressed="${trackFilter === key}"><strong>${n}</strong><span>${label}</span></button>`;
  const results = keys
    .map((k) => {
      const [title, list, sub, tone] = sections[k];
      if (!list.length && trackFilter === "all") return "";
      return `<section class="panel flush track-section ${tone}"><div class="panel-head"><div><h2>${title} <span class="n">${list.length}</span></h2><p>${sub}</p></div></div>${
        list.length ? `<div class="track-list">${list.map((r) => trackRow(r, k === "today" ? "out" : k)).join("")}</div>` : empty(d.q ? "Aucun résultat pour cette recherche." : "Rien à signaler ici.")
      }</section>`;
    })
    .join("");
  return `<div class="track-figures">
      ${figure("out", outCount, `${plural(outCount, "objet")} ${plural(outCount, "sorti")}`)}
      ${figure("late", d.late.length, `${plural(d.late.length, "retour")} en retard`, "pink")}
      ${figure("today", dueToday, `${plural(dueToday, "retour")} ${plural(dueToday, "attendu")} aujourd’hui`)}
      ${figure("rooms", d.rooms.length, `${plural(d.rooms.length, "espace")} ${plural(d.rooms.length, "occupé")}`)}
    </div>
    <div class="toolbar">
      ${segmented("tf", trackFilter === "today" ? "out" : trackFilter, [["all", "Tout"], ["late", "Retards"], ["out", "Prêtés"], ["rooms", "Espaces"], ["soon", "À venir"]])}
      <label class="search">${ico("search")}<input id="track-search" type="search" placeholder="Rechercher une personne, un objet, une référence" value="${esc(query)}"></label>
    </div>
    <div id="track-results">${results || `<section class="panel">${empty(d.q ? "Aucun résultat pour cette recherche." : "Rien n’est sorti pour le moment.")}</section>`}</div>`;
}
// Ligne du suivi : quoi, chez qui, depuis quand, jusqu’à quand.
function trackRow(r, kind) {
  const now = new Date(),
    s = new Date(r.start),
    e = new Date(r.end);
  const progress = Math.min(100, Math.max(0, ((now - s) / (e - s)) * 100));
  const res = r.ids.map(resource).filter(Boolean);
  let when;
  if (kind === "late") when = `<b class="t-late">En retard de ${duration(now - e)}</b><small>Attendu ${relDay(e)} à ${hhmm(e)}</small>`;
  else if (kind === "soon")
    when = `<b>${r.kind === "loan" ? "Retrait" : "Début"} ${relDay(s)} à ${hhmm(s)}</b><small>${r.kind === "loan" ? `Retour prévu le ${fmt(e)}` : `Jusqu’à ${hhmm(e)}`}</small>`;
  else if (kind === "rooms") when = `<b>Jusqu’à ${hhmm(e)}</b><small>Libre dans ${duration(e - now)}</small>`;
  else
    when = `<b class="${sameDay(e, now) ? "t-soon" : ""}">Retour ${relDay(e)} à ${hhmm(e)}</b><small>Sorti ${sameDay(s, now) ? `aujourd’hui à ${hhmm(s)}` : `le ${fmt(s)}`} · depuis ${duration(now - s)}</small>`;
  const meter = ["out", "rooms", "late"].includes(kind)
    ? `<span class="meter ${kind === "late" ? "late" : ""}" aria-hidden="true"><i style="width:${kind === "late" ? 100 : progress}%"></i></span>`
    : "";
  const action =
    r.kind === "loan" && (kind === "late" || kind === "out") ? `<button class="btn small" data-return="${r.id}">${ico("check")} Retour</button>` : "";
  return `<div class="track-row">
    <button class="track-what" data-detail="${r.id}">
      <span class="res-icon" style="--c:${r.kind === "booking" ? colorOf(res[0]?.id) : kind === "late" ? "var(--pink)" : "var(--purple)"}">${ico(res[0]?.icon)}</span>
      <span><b>${r.ids.map((id) => itemName(r, id)).join(", ")}</b><small>${res.map((x) => esc(x.code)).join(" · ")}</small></span>
    </button>
    <div class="track-who"><span class="avatar sm">${initials(r.name)}</span><span><b>${esc(r.name)}</b><small>${esc(r.group || users[r.user]?.label || "")}</small></span></div>
    <div class="track-when">${when}${meter}</div>
    <div class="track-action">${action}</div>
  </div>`;
}
// Re-rendu partiel : garde le focus dans la recherche et l’en-tête en place.
function refreshTracking(animate = true) {
  const box = $("#track-body");
  if (!box) return;
  const input = $("#track-search"),
    focused = document.activeElement === input,
    caret = input?.selectionStart;
  box.innerHTML = trackingBody();
  bindTracking();
  if (focused) {
    const el = $("#track-search");
    el.focus();
    el.setSelectionRange(caret, caret);
  }
  if (animate) reveal($$("#track-results .track-section"), { y: 8, step: 50, duration: 340 });
}
function bindTracking() {
  const setFilter = (v) => {
    trackFilter = v;
    const seg = $('[data-seg="tf"]');
    $$("[data-tf]", seg).forEach((x) => x.classList.toggle("active", x.dataset.tf === (v === "today" ? "out" : v)));
    moveThumb(seg);
    setTimeout(refreshTracking, motionOK ? 140 : 0);
  };
  $$("[data-tf]").forEach((b) => (b.onclick = () => setFilter(b.dataset.tf)));
  $$("[data-track-filter]").forEach((b) => (b.onclick = () => setFilter(trackFilter === b.dataset.trackFilter ? "all" : b.dataset.trackFilter)));
  $("#track-search").oninput = (e) => {
    query = e.target.value;
    refreshTracking(false);
  };
  $$("#track-body [data-detail]").forEach((b) => (b.onclick = () => detail(+b.dataset.detail)));
  $$("[data-return]").forEach((b) => (b.onclick = () => returnForm(db.requests.find((r) => r.id === +b.dataset.return))));
}

function requestList(list, showUser = false, emptyText = "Aucune demande pour le moment.") {
  if (!list.length) return empty(emptyText);
  return `<div class="req-list">${list
    .map((r) => {
      const res = resource(r.ids[0]);
      return `<button class="req-row" data-detail="${r.id}">
        <span class="res-icon">${ico(res?.icon)}</span>
        <span class="req-main"><b>${itemName(r, r.ids[0])}${r.ids.length > 1 ? ` + ${r.ids.length - 1}` : ""}</b><small>${r.kind === "loan" ? "Emprunt" : "Réservation"} · n° ${r.id}</small></span>
        ${showUser ? `<span class="req-user">${esc(r.name)}<small>${esc(r.group || users[r.user]?.label || "")}</small></span>` : ""}
        <span class="req-date">${dateRange(r)}</span>
        ${badge(reqStatus(r))}
        ${ico("chevR", "chev")}
      </button>`;
    })
    .join("")}</div>`;
}

// Stock restant : texte au-dessus, barre pleine largeur (libres · sortis · en réparation).
function stockLine(r, free, note = "") {
  const total = stock(r) || 1,
    maint = Math.min(total, r.maint || 0),
    used = Math.max(0, total - maint - free),
    pct = (n) => (n / total) * 100;
  return `<div class="stock ${free ? "" : "none"}">
    <div class="stock-text"><span><b>${free}</b> sur ${stock(r)} disponible${free > 1 ? "s" : ""}</span>${maint ? `<span class="stock-maint">${maint} en réparation</span>` : ""}</div>
    <div class="stock-bar" role="img" aria-label="${free} disponibles, ${used} sortis${maint ? `, ${maint} en réparation` : ""}"><i class="f" style="width:${pct(free)}%"></i><i class="u" style="width:${pct(used)}%"></i><i class="m" style="width:${pct(maint)}%"></i></div>
    ${note ? `<small>${note}</small>` : ""}
  </div>`;
}
// Même gabarit pour les espaces : heures encore libres aujourd’hui (8 h – 20 h).
function dayLine(r) {
  const now = new Date(),
    day = dayStart(now),
    span = H1 - H0;
  const segs = db.requests
    .filter((q) => q.ids.includes(r.id) && ["approved", "pending"].includes(q.status))
    .map((q) => segment(q, day))
    .filter(Boolean);
  const booked = segs.reduce((n, g) => n + (g.e - g.s) / 36e5, 0);
  const left = Math.max(0, Math.min(span, H1 - Math.max(H0, hourOf(now))));
  const freeLeft = Math.max(0, left - segs.reduce((n, g) => n + Math.max(0, (g.e - Math.max(g.s, now)) / 36e5), 0));
  const pct = (h) => (h / span) * 100;
  const fmtH = (h) => (h % 1 ? `${Math.floor(h)} h 30` : `${h} h`);
  return `<div class="stock ${freeLeft ? "" : "none"}">
    <div class="stock-text"><span><b>${fmtH(Math.round(freeLeft * 2) / 2)}</b> libre${freeLeft >= 2 ? "s" : ""} aujourd’hui</span></div>
    <div class="stock-bar" role="img" aria-label="${fmtH(Math.round(booked * 2) / 2)} réservées aujourd’hui"><i class="f" style="width:${pct(freeLeft)}%"></i><i class="u" style="width:${pct(span - freeLeft)}%"></i></div>
  </div>`;
}
// Pour le gestionnaire : qui a la ressource en ce moment. Résumé court, détail au clic.
function holderLine(res) {
  const list = holding(res).sort((a, b) => a.end.localeCompare(b.end));
  if (!list.length) return "";
  const lateCount = list.filter((q) => reqStatus(q) === "late").length;
  const q = list[0];
  const next = list.find((x) => reqStatus(x) !== "late");
  const when = (x) => (x.kind === "loan" ? `retour ${relDay(x.end)}` : `jusqu’à ${hhmm(x.end)}`);
  const single = list.length === 1;
  const title = single
    ? `${q.kind === "loan" ? "Chez" : "Occupé par"} ${esc(q.name)}${units(q, res.id) > 1 ? ` × ${units(q, res.id)}` : ""}`
    : `${list.length} emprunteurs`;
  const sub = lateCount
    ? single
      ? "En retard"
      : `Dont ${lateCount} en retard`
    : single
      ? when(q)[0].toUpperCase() + when(q).slice(1)
      : `Prochain ${when(next)}`;
  return `<button class="rc-holder ${lateCount ? "late" : ""}" ${single ? `data-detail="${q.id}"` : `data-holders="${res.id}"`}>
    <span class="avatar xs ${single ? "" : "more"}">${single ? initials(q.name) : list.length}</span>
    <span class="rc-holder-text"><b>${title}</b><small>${sub}</small></span>${ico("chevR", "chev")}</button>`;
}
// Liste complète des emprunteurs d’une ressource.
function holdersModal(id) {
  const res = resource(id);
  const list = holding(res).sort((a, b) => (reqStatus(b) === "late") - (reqStatus(a) === "late") || a.end.localeCompare(b.end));
  const out = outNow(res);
  modal(
    esc(res.name),
    `<div class="modal-body">
      <p class="muted">${out} exemplaire${out > 1 ? "s" : ""} sorti${out > 1 ? "s" : ""} sur ${stock(res)} · ${list.length} emprunteur${list.length > 1 ? "s" : ""}</p>
      <div class="holder-list">${list
        .map((q) => {
          const late = reqStatus(q) === "late";
          return `<div class="holder-row">
            <button class="holder-who" data-detail="${q.id}"><span class="avatar sm">${initials(q.name)}</span><span><b>${esc(q.name)}</b><small>${esc(q.group || users[q.user]?.label || "")}</small></span></button>
            <span class="holder-qty">${units(q, id) > 1 ? `× ${units(q, id)}` : ""}</span>
            <span class="holder-when ${late ? "t-late" : ""}">${late ? `En retard de ${duration(new Date() - new Date(q.end))}` : `Retour ${relDay(q.end)}`}<small>Sorti le ${fmt(q.start)}</small></span>
            ${q.kind === "loan" ? `<button class="btn small" data-return="${q.id}">Retour</button>` : ""}
          </div>`;
        })
        .join("")}</div>
    </div>`,
    `<button class="btn" data-close>Fermer</button>`,
  );
  $$("#modal [data-detail]").forEach((b) => (b.onclick = () => detail(+b.dataset.detail)));
  $$("#modal [data-return]").forEach((b) => (b.onclick = () => returnForm(db.requests.find((r) => r.id === +b.dataset.return))));
}
function catalogCards() {
  const manage = view === "manage";
  const list = db.resources.filter(
    (r) =>
      !r.retired &&
      (filter === "all" || reserve(r.type) === (filter === "booking")) &&
      (!category || r.cat === category) &&
      (!statusFilter || resStatus(r) === statusFilter) &&
      `${r.name} ${r.code} ${r.location}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  if (!list.length)
    return empty("Aucune ressource ne correspond à votre recherche.", `<button class="btn small" data-reset-filters>Effacer les filtres</button>`);
  return `<p class="count-line">${list.length} ressource${list.length > 1 ? "s" : ""}</p><div class="catalog">${list
    .map((r) => {
      const book = reserve(r.type),
        added = !!cart[r.id],
        s = resStatus(r),
        free = availNow(r),
        // Grisé : matériel dont tout le stock est sorti, ou ressource hors service.
        out = r.status !== "available" || (!book && free <= 0),
        c = cat(r.cat);
      // Prochain retour attendu (hors retards, dont la date est déjà passée).
      const nextBack = holding(r)
        .filter((q) => reqStatus(q) !== "late")
        .sort((a, b) => a.end.localeCompare(b.end))[0];
      const backNote = !nextBack ? (holding(r).length ? "Retour en retard" : "") : `Retour prévu ${relDay(nextBack.end)}`;
      const action = manage
        ? `<button class="btn small" data-edit="${r.id}">${ico("edit")} Modifier</button>`
        : book
          ? `<button class="btn small" data-book="${r.id}" ${out ? "disabled" : ""}>${ico("calendar")} Réserver</button>`
          : out
            ? `<button class="btn small" disabled>${r.status !== "available" ? "Indisponible" : "Plus en stock"}</button>`
            : `<button class="btn small ${added ? "selected" : ""}" data-add="${r.id}" aria-pressed="${added}">${ico(added ? "check" : "plus")} ${added ? `Ajouté${cart[r.id] > 1 ? ` × ${cart[r.id]}` : ""}` : "Ajouter"}</button>`;
      return `<article class="resource-card ${added ? "is-added" : ""} ${out ? "is-out" : ""}" style="--c:${book ? colorOf(r.id) : "var(--purple)"}">
        <div class="rc-top"><span class="res-icon big">${ico(r.icon)}</span>${s === "occupied" ? `<span class="badge s-occupied">Occupé jusqu’à ${hhmm(holding(r)[0].end)}</span>` : badge(s)}</div>
        <h3>${esc(r.name)}</h3>
        <p class="rc-meta">${ico("pin")}${esc(r.location)}</p>
        ${book ? dayLine(r) : stockLine(r, free, out && r.status === "available" ? backNote : "")}
        ${role === "admin" ? holderLine(r) : ""}
        <div class="rc-foot"><span class="rc-cat">${esc(c?.name)}${c?.approval ? `<em>Sur validation</em>` : ""}</span>${action}</div>
      </article>`;
    })
    .join("")}</div>`;
}

/* ---------- Planning ---------- */
const H0 = 8,
  H1 = 20,
  HOUR = 52;
const hourOf = (d) => new Date(d).getHours() + new Date(d).getMinutes() / 60;

function planLabel() {
  if (planView === "week") {
    const s = weekStart(planDate),
      e = addDays(s, 6);
    const sameMonth = s.getMonth() === e.getMonth();
    return `${s.getDate()}${sameMonth ? "" : " " + s.toLocaleDateString("fr-FR", { month: "short" })} – ${e.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`;
  }
  if (planView === "list") return "Les 30 prochains jours";
  return longDay(planDate);
}
function planChips() {
  const list = reservables();
  return (
    list
      .map(
        (r) =>
          `<button class="chip ${planHidden.includes(r.id) ? "off" : ""}" data-chip="${r.id}" style="--c:${colorOf(r.id)}" aria-pressed="${!planHidden.includes(r.id)}"><i></i>${esc(r.name.split(" — ")[0])}</button>`,
      )
      .join("") + (planHidden.length ? `<button class="chip reset" data-chip="all">Tout afficher</button>` : "")
  );
}
// Une entrée par ressource réservée et par jour traversé.
function bookingsBetween(from, to) {
  const out = [];
  db.requests
    .filter((r) => r.kind === "booking" && ["approved", "pending"].includes(r.status) && new Date(r.start) < to && new Date(r.end) > from)
    .forEach((r) => r.ids.forEach((id) => resource(id) && !planHidden.includes(id) && out.push({ r, res: resource(id) })));
  return out;
}
function segment(r, day) {
  const s = Math.max(new Date(r.start), atHour(day, H0)),
    e = Math.min(new Date(r.end), atHour(day, H1));
  return e > s ? { s: new Date(s), e: new Date(e) } : null;
}
function evLabel(r) {
  if (!visible(r)) return "Réservé";
  return esc(r.group || r.name);
}
function planBody() {
  if (planView === "week") return weekView();
  if (planView === "list") return agendaView();
  return `<div class="scroll-x">${dayTimeline(planDate)}</div>`;
}

function weekView() {
  const ws = weekStart(planDate),
    now = new Date();
  const days = [...Array(7)].map((_, i) => addDays(ws, i));
  const hours = [...Array(H1 - H0)].map((_, i) => H0 + i);
  const cols = days
    .map((day) => {
      const segs = bookingsBetween(atHour(day, H0), atHour(day, H1))
        .map((x) => ({ ...x, ...segment(x.r, day) }))
        .filter((x) => x.s);
      // Les créneaux de 6 h et plus (véhicule à la journée…) deviennent une bande étroite à gauche.
      const long = segs.filter((g) => g.e - g.s >= 6 * 36e5);
      const normal = segs.filter((g) => !long.includes(g));
      layoutLanes(normal);
      const off = long.length * 26;
      const nowLine =
        sameDay(day, now) && hourOf(now) >= H0 && hourOf(now) <= H1
          ? `<div class="now" style="top:${(hourOf(now) - H0) * HOUR}px"></div>`
          : "";
      return `<div class="day-col ${day.getDay() % 6 === 0 ? "weekend" : ""} ${sameDay(day, now) ? "today" : ""} ${day < dayStart(now) ? "past" : ""}" data-day="${localISO(day)}" style="height:${(H1 - H0) * HOUR}px">
        <div class="ghost" aria-hidden="true"></div>
        ${long
          .map((g, i) => {
            const top = (hourOf(g.s) - H0) * HOUR,
              h = ((g.e - g.s) / 36e5) * HOUR - 3;
            return `<button class="ev strip ${g.r.status} ${g.r.user === role ? "mine" : ""}" data-ev="${g.r.id}" style="--c:${colorOf(g.res.id)};top:${top + 1}px;height:${h}px;left:${3 + i * 26}px;width:22px" title="${esc(g.res.name)} · ${hhmm(g.r.start)} – ${hhmm(g.r.end)} · ${evLabel(g.r)}"><span>${esc(g.res.name)} · ${hhmm(g.s)} – ${hhmm(g.e)}</span></button>`;
          })
          .join("")}
        ${normal
          .map((g) => {
            const top = (hourOf(g.s) - H0) * HOUR,
              h = Math.max(22, ((g.e - g.s) / 36e5) * HOUR - 3);
            return `<button class="ev ${g.r.status} ${g.r.user === role ? "mine" : ""} ${h < 46 ? "short" : ""}" data-ev="${g.r.id}" style="--c:${colorOf(g.res.id)};top:${top + 1}px;height:${h}px;left:calc(${off}px + (100% - ${off}px) * ${g.lane / g.lanes} + 3px);width:calc((100% - ${off}px) / ${g.lanes} - 6px)" title="${esc(g.res.name)} · ${hhmm(g.r.start)} – ${hhmm(g.r.end)}">
              <b>${hhmm(g.s)} – ${hhmm(g.e)}</b><span>${esc(g.res.name.split(" — ")[0])}</span><small>${g.r.status === "pending" ? "En attente · " : ""}${evLabel(g.r)}</small></button>`;
          })
          .join("")}
        ${nowLine}
      </div>`;
    })
    .join("");
  return `<div class="scroll-x"><div class="week">
    <div class="week-head"><span></span>${days
      .map(
        (d) =>
          `<button class="${sameDay(d, now) ? "today" : ""} ${d.getDay() % 6 === 0 ? "weekend" : ""}" data-goto-day="${localISO(d)}"><small>${d.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", "")}</small><b>${d.getDate()}</b></button>`,
      )
      .join("")}</div>
    <div class="week-body"><div class="gutter">${hours.map((h) => `<span style="top:${(h - H0) * HOUR}px">${h}:00</span>`).join("")}</div>${cols}</div>
  </div></div>`;
}

function layoutLanes(segs) {
  segs.sort((a, b) => a.s - b.s || b.e - a.e);
  let cluster = [],
    end = 0;
  const flush = () => {
    const lanes = [];
    cluster.forEach((g) => {
      let i = lanes.findIndex((e) => e <= g.s);
      if (i < 0) i = lanes.push(0) - 1;
      lanes[i] = g.e;
      g.lane = i;
    });
    cluster.forEach((g) => (g.lanes = lanes.length));
    cluster = [];
    end = 0;
  };
  segs.forEach((g) => {
    if (cluster.length && g.s >= end) flush();
    cluster.push(g);
    end = Math.max(end, +g.e);
  });
  if (cluster.length) flush();
}

function dayTimeline(day, compact = false) {
  const now = new Date();
  const span = H1 - H0;
  const pct = (h) => ((h - H0) / span) * 100;
  const res = reservables().filter((r) => compact || !planHidden.includes(r.id));
  const all = db.requests.filter(
    (r) => r.kind === "booking" && ["approved", "pending"].includes(r.status) && new Date(r.start) < atHour(day, H1) && new Date(r.end) > atHour(day, H0),
  );
  const nowLine = sameDay(day, now) && hourOf(now) >= H0 && hourOf(now) <= H1 ? `<div class="now v" style="left:${pct(hourOf(now))}%"></div>` : "";
  return `<div class="timeline ${compact ? "compact" : ""}">
    <div class="tl-head"><span></span><div class="tl-hours">${[...Array(span + 1)]
      .map((_, i) => (i % (compact ? 2 : 1) === 0 ? `<span style="left:${(i / span) * 100}%">${H0 + i}h</span>` : ""))
      .join("")}</div></div>
    ${res
      .map((x) => {
        const bars = all
          .filter((r) => r.ids.includes(x.id))
          .map((r) => {
            const g = segment(r, day);
            if (!g) return "";
            return `<button class="bar ${r.status} ${r.user === role ? "mine" : ""}" data-ev="${r.id}" style="left:${pct(hourOf(g.s))}%;width:${pct(hourOf(g.e)) - pct(hourOf(g.s))}%" title="${hhmm(r.start)} – ${hhmm(r.end)} · ${evLabel(r)}"><b>${hhmm(g.s)}</b><span>${evLabel(r)}</span></button>`;
          })
          .join("");
        return `<div class="tl-row" style="--c:${colorOf(x.id)}">
          <div class="tl-name"><i></i><span><b>${esc(x.name.split(" — ")[0])}</b><small>${esc(x.location.split(" · ").pop())}</small></span></div>
          <div class="tl-track ${x.status !== "available" ? "blocked" : ""}" data-track="${x.id}" data-day="${localISO(day)}"><div class="ghost" aria-hidden="true"></div>${bars}${nowLine}</div>
        </div>`;
      })
      .join("")}
  </div>`;
}

function agendaView() {
  const from = dayStart(new Date()),
    to = addDays(from, 30);
  const list = bookingsBetween(from, to).sort((a, b) => a.r.start.localeCompare(b.r.start));
  if (!list.length) return empty("Aucune réservation sur cette période.");
  const byDay = {};
  list.forEach((x) => (byDay[dayStart(x.r.start).toISOString()] ??= []).push(x));
  return `<div class="agenda">${Object.entries(byDay)
    .map(
      ([d, items]) => `<div class="agenda-day"><h3><b>${new Date(d).getDate()}</b><span>${longDay(d).split(" ")[0]}<small>${new Date(d).toLocaleDateString("fr-FR", { month: "long" })}</small></span></h3>
      <div>${items
        .map(
          ({ r, res }) => `<button class="agenda-item ${r.status} ${r.user === role ? "mine" : ""}" data-ev="${r.id}" style="--c:${colorOf(res.id)}">
          <span class="agenda-time">${hhmm(r.start)}<small>${sameDay(r.start, r.end) ? hhmm(r.end) : fmt(r.end, true)}</small></span>
          <span class="agenda-main"><b>${esc(res.name)}</b><small>${evLabel(r)}${visible(r) && r.purpose ? ` · ${esc(r.purpose)}` : ""}</small></span>
          ${r.status === "pending" ? badge("pending") : r.user === role ? '<span class="badge s-mine">Vous</span>' : ""}
        </button>`,
        )
        .join("")}</div></div>`,
    )
    .join("")}</div>`;
}

function updatePlan(dir = 0) {
  $("#plan-label").textContent = planLabel();
  $("#plan-body").innerHTML = planBody();
  $("#plan-chips").innerHTML = planChips();
  bindPlan();
  scrollToNow();
  if (dir) slide($("#plan-body"), dir);
  else reveal($$("#plan-body .ev, #plan-body .bar, #plan-body .agenda-day"), { y: 6, step: 16, duration: 320, max: 40 });
}

function bindPlan() {
  $$("[data-chip]").forEach(
    (b) =>
      (b.onclick = () => {
        const id = b.dataset.chip;
        if (id === "all") planHidden = [];
        else {
          const n = +id;
          const visibleCount = reservables().length - planHidden.length;
          if (planHidden.includes(n)) planHidden = planHidden.filter((x) => x !== n);
          else if (visibleCount > 1) planHidden.push(n);
        }
        updatePlan();
      }),
  );
  $$("[data-goto-day]").forEach(
    (b) =>
      (b.onclick = () => {
        planDate = dayStart(b.dataset.gotoDay);
        planView = "day";
        render();
      }),
  );
  bindSlots();
}

// Créneaux libres : survol = aperçu, clic = nouvelle réservation pré-remplie.
function bindSlots(root = document) {
  const snap = (h) => Math.min(H1 - 1, Math.max(H0, Math.floor(h * 2) / 2));
  $$(".day-col", root).forEach((col) => {
    const ghost = $(".ghost", col);
    const hourAt = (e) => snap(H0 + (e.clientY - col.getBoundingClientRect().top) / HOUR);
    col.onmousemove = (e) => {
      if (e.target.closest(".ev") || col.classList.contains("past")) return (ghost.style.opacity = 0);
      const h = hourAt(e);
      ghost.style.cssText = `opacity:1;top:${(h - H0) * HOUR}px;height:${HOUR}px`;
      ghost.textContent = `+ ${pad(Math.floor(h))}:${h % 1 ? "30" : "00"}`;
    };
    col.onmouseleave = () => (ghost.style.opacity = 0);
    col.onclick = (e) => {
      if (e.target.closest(".ev")) return;
      openBooking({ date: dayStart(col.dataset.day), hour: hourAt(e) });
    };
  });
  $$(".tl-track", root).forEach((t) => {
    const ghost = $(".ghost", t);
    const hourAt = (e) => {
      const b = t.getBoundingClientRect();
      return snap(H0 + ((e.clientX - b.left) / b.width) * (H1 - H0));
    };
    t.onmousemove = (e) => {
      if (e.target.closest(".bar") || t.classList.contains("blocked")) return (ghost.style.opacity = 0);
      const h = hourAt(e);
      ghost.style.cssText = `opacity:1;left:${((h - H0) / (H1 - H0)) * 100}%;width:${100 / (H1 - H0)}%`;
    };
    t.onmouseleave = () => (ghost.style.opacity = 0);
    t.onclick = (e) => {
      if (e.target.closest(".bar") || t.classList.contains("blocked")) return;
      openBooking({ resId: +t.dataset.track, date: dayStart(t.dataset.day), hour: hourAt(e) });
    };
  });
  $$("[data-ev]", root).forEach(
    (b) =>
      (b.onclick = (e) => {
        e.stopPropagation();
        const r = db.requests.find((q) => q.id === +b.dataset.ev);
        if (visible(r)) detail(r.id);
        else toast(`${resource(r.ids[0])?.name} est réservé de ${hhmm(r.start)} à ${hhmm(r.end)}.`, "warn");
      }),
  );
}

/* ---------- Réservation d’un espace ---------- */
const timeOptions = (sel) =>
  [...Array((H1 - H0) * 2 + 1)]
    .map((_, i) => {
      const h = H0 + i / 2,
        v = `${pad(Math.floor(h))}:${h % 1 ? "30" : "00"}`;
      return `<option value="${v}" ${v === sel ? "selected" : ""}>${v}</option>`;
    })
    .join("");
const dateValue = (d) => localISO(d).slice(0, 10);

function openBooking({ resId, date, hour } = {}) {
  const list = reservables();
  const res = resource(resId) || list.find((r) => !planHidden.includes(r.id) && r.status === "available") || list[0];
  const now = new Date();
  date = date || dayStart(now);
  if (hour == null) hour = sameDay(date, now) ? Math.min(H1 - 2, Math.max(H0, Math.ceil(hourOf(now) * 2) / 2)) : 9;
  const t = (h) => `${pad(Math.floor(h))}:${h % 1 ? "30" : "00"}`;
  const groups = Object.entries(types)
    .filter(([k]) => reserve(k))
    .map(
      ([k, label]) =>
        `<optgroup label="${label}">${list
          .filter((r) => r.type === k)
          .map((r) => `<option value="${r.id}" ${r.id === res.id ? "selected" : ""} ${r.status !== "available" ? "disabled" : ""}>${esc(r.name)}</option>`)
          .join("")}</optgroup>`,
    )
    .join("");
  modal(
    "Réserver un espace",
    `<form id="booking-form" class="modal-body" novalidate>
      <label class="field">Espace ou véhicule<select name="res">${groups}</select></label>
      <div class="form-row three">
        <label class="field">Date<input name="date" type="date" required value="${dateValue(date)}" min="${dateValue(now)}"></label>
        <label class="field">De<select name="from">${timeOptions(t(hour))}</select></label>
        <label class="field">À<select name="to">${timeOptions(t(Math.min(H1, hour + 2)))}</select></label>
      </div>
      <label class="field vehicle-only">Retour du véhicule le<input name="endDate" type="date" value="${dateValue(date)}" min="${dateValue(now)}"></label>
      <div class="avail" id="avail"></div>
      <label class="field">Motif<input name="purpose" required maxlength="120" placeholder="Ex. travail de groupe, tournage, réunion…"></label>
      ${role === "professor" ? '<label class="field">Groupe ou classe <span class="opt">facultatif</span><input name="group" placeholder="Ex. B2 Création digitale" maxlength="80"></label>' : ""}
      <p class="form-note" id="booking-note"></p>
    </form>`,
    `<button class="btn" data-close>Annuler</button><button class="btn primary" form="booking-form" type="submit">Réserver</button>`,
  );
  const form = $("#booking-form");
  const read = () => {
    const f = Object.fromEntries(new FormData(form));
    const r = resource(+f.res);
    const endDate = r.type === "vehicle" && f.endDate ? f.endDate : f.date;
    return { r, f, start: `${f.date}T${f.from}`, end: `${endDate}T${f.to}` };
  };
  const check = () => {
    const { r, f, start, end } = read();
    form.classList.toggle("is-vehicle", r.type === "vehicle");
    $("#avail").innerHTML = availStrip(r, f.date, start, end);
    const note = $("#booking-note");
    const clash = conflict([r.id], start, end);
    let msg = "",
      tone = "";
    if (!f.date) msg = "Choisissez une date.";
    else if (new Date(start) < new Date()) (msg = "Ce créneau est déjà passé."), (tone = "error");
    else if (new Date(end) <= new Date(start)) (msg = "L’heure de fin doit être après l’heure de début."), (tone = "error");
    else if (clash)
      (msg = clash.start ? `Déjà réservé de ${hhmm(clash.start)} à ${hhmm(clash.end)}. Choisissez un autre horaire.` : "Cet espace n’est pas disponible."), (tone = "error");
    else if (cat(r.cat)?.approval) (msg = "Créneau libre. Cette réservation sera validée par l’accueil."), (tone = "info");
    else (msg = "Créneau libre. La réservation est confirmée immédiatement."), (tone = "ok");
    note.textContent = msg;
    note.className = `form-note ${tone}`;
    return tone === "ok" || tone === "info";
  };
  form.addEventListener("input", check);
  form.addEventListener("change", check);
  check();
  form.onsubmit = (e) => {
    e.preventDefault();
    if (!check()) return pop($("#booking-note"));
    const { r, f, start, end } = read();
    if (!f.purpose.trim()) {
      $("#booking-note").textContent = "Indiquez le motif de la réservation.";
      $("#booking-note").className = "form-note error";
      form.purpose.focus();
      return;
    }
    const status = cat(r.cat)?.approval ? "pending" : "approved";
    const req = {
      id: Math.max(1000, ...db.requests.map((q) => q.id)) + 1,
      ids: [r.id],
      user: role,
      name: users[role].name,
      kind: "booking",
      start,
      end,
      status,
      purpose: f.purpose.trim(),
      ...(f.group ? { group: f.group.trim() } : {}),
      created: new Date().toISOString(),
    };
    db.requests.push(req);
    persist(`${r.name} réservé par ${users[role].name} · ${labels[status]}`);
    closeModal();
    planDate = dayStart(start);
    if (view === "planning") updatePlan();
    else render();
    toast(status === "pending" ? "Réservation envoyée pour validation." : `C’est noté : ${r.name.split(" — ")[0]}, ${relDay(start)} de ${hhmm(start)} à ${hhmm(end)}.`);
  };
}

function availStrip(r, date, start, end) {
  if (!date) return "";
  const day = dayStart(date);
  const span = H1 - H0;
  const pct = (h) => Math.max(0, Math.min(100, ((h - H0) / span) * 100));
  const busy = db.requests
    .filter((q) => q.ids.includes(r.id) && ["approved", "pending"].includes(q.status))
    .map((q) => segment(q, day))
    .filter(Boolean);
  const sel = segment({ start, end }, day);
  return `<div class="avail-label"><span>Disponibilités ${relDay(day) === "aujourd’hui" ? "aujourd’hui" : relDay(day).replace(/^le /, "du ")}</span><span class="avail-key"><i class="k-busy"></i>Occupé <i class="k-sel"></i>Votre créneau</span></div>
    <div class="avail-track">${busy.map((g) => `<span class="busy" style="left:${pct(hourOf(g.s))}%;width:${pct(hourOf(g.e)) - pct(hourOf(g.s))}%"></span>`).join("")}${
      sel ? `<span class="sel" style="left:${pct(hourOf(sel.s))}%;width:${pct(hourOf(sel.e)) - pct(hourOf(sel.s))}%"></span>` : ""
    }</div>
    <div class="avail-hours">${[8, 10, 12, 14, 16, 18, 20].map((h) => `<span style="left:${pct(h)}%">${h}h</span>`).join("")}</div>`;
}

/* ---------- Sélection de matériel (emprunt) ---------- */
function openCart() {
  const items = cartIds().map(resource).filter(Boolean);
  const needsApproval = items.some((r) => cat(r.cat)?.approval);
  modal(
    "Ma sélection",
    items.length
      ? `<form id="request-form" class="modal-body">
        <div class="cart-list">${items
          .map(
            (r) => `<div class="cart-item"><span class="res-icon">${ico(r.icon)}</span><span><b>${esc(r.name)}</b><small>${availNow(r)} disponible${availNow(r) > 1 ? "s" : ""} en ce moment</small></span>
          ${usable(r) > 1 ? `<span class="stepper"><button type="button" data-step="-1" data-id="${r.id}" aria-label="Un de moins">−</button><output>${cart[r.id]}</output><button type="button" data-step="1" data-id="${r.id}" aria-label="Un de plus" ${cart[r.id] >= availNow(r) ? "disabled" : ""}>+</button></span>` : ""}
          <button type="button" class="icon-btn ghost" data-remove="${r.id}" aria-label="Retirer ${esc(r.name)}">${ico("close")}</button></div>`,
          )
          .join("")}</div>
        <div class="form-row"><label class="field">Retrait<input name="start" type="datetime-local" required value="${stamp(1)}" min="${stamp(0, 0)}"></label><label class="field">Retour<input name="end" type="datetime-local" required value="${stamp(3, 18)}"></label></div>
        ${role === "professor" ? '<label class="field">Groupe ou classe <span class="opt">facultatif</span><input name="group" placeholder="Ex. B2 Création digitale" maxlength="80"></label>' : ""}
        <label class="field">Pour quel projet ?<textarea name="purpose" rows="2" required placeholder="Quelques mots suffisent" maxlength="300"></textarea></label>
        <p class="form-note ${needsApproval ? "info" : "ok"}">${needsApproval ? "Une partie du matériel doit être validée par l’accueil. Vous recevrez une réponse sous 24 h." : "Le matériel est réservé dès l’envoi. Retrait à l’accueil du bâtiment A."}</p>
        <p id="form-error" class="form-note error" role="alert" hidden></p>
      </form>`
      : `<div class="modal-body">${empty("Votre sélection est vide.", `<button class="btn small" data-close data-nav="catalog">Parcourir le catalogue</button>`)}</div>`,
    items.length ? `<button class="btn" data-close>Continuer</button><button class="btn primary" form="request-form" type="submit">Envoyer la demande</button>` : "",
  );
  $$("#modal [data-nav]").forEach((b) => b.addEventListener("click", () => navigate(b.dataset.nav)));
  $$("[data-remove]").forEach(
    (b) =>
      (b.onclick = () => {
        delete cart[+b.dataset.remove];
        renderChrome();
        refreshCatalog();
        openCart();
      }),
  );
  $$("[data-step]").forEach(
    (b) =>
      (b.onclick = () => {
        const id = +b.dataset.id,
          n = (cart[id] || 1) + +b.dataset.step;
        if (n < 1) delete cart[id];
        else cart[id] = Math.min(n, Math.max(1, availNow(resource(id))));
        const keep = new FormData($("#request-form"));
        renderChrome();
        refreshCatalog();
        openCart();
        // Les champs déjà remplis survivent au changement de quantité.
        for (const [k, v] of keep) if ($(`#request-form [name="${k}"]`)) $(`#request-form [name="${k}"]`).value = v;
        if (!$("#request-form")) return;
        const out = $(`[data-id="${id}"]`)?.parentElement.querySelector("output");
        pop(out);
      }),
  );
  $("#request-form")?.addEventListener("submit", submitLoan);
}

// Un emprunt en retard occupe son unité jusqu’à son retour effectif.
const effEnd = (q) => (q.kind === "loan" && q.status === "approved" && new Date(q.end) < new Date() ? new Date(8.64e15) : new Date(q.end));
// Renvoie la première ressource dont le stock ne suffit pas sur la période, avec le nombre d’unités libres.
function conflict(ids, start, end, exclude, need = {}) {
  const s = new Date(start),
    e = new Date(end);
  for (const id of ids) {
    const r = resource(id);
    const list = db.requests.filter(
      (q) => q.id !== exclude && ["approved", "pending"].includes(q.status) && q.ids.includes(id) && s < effEnd(q) && e > new Date(q.start),
    );
    const points = [s, ...list.map((q) => new Date(q.start)).filter((d) => d > s && d < e)];
    const peak = Math.max(0, ...points.map((t) => list.filter((q) => new Date(q.start) <= t && effEnd(q) > t).reduce((n, q) => n + units(q, id), 0)));
    const free = Math.max(0, usable(r) - peak);
    if ((need[id] ?? 1) > free) return { ...(list[0] || {}), res: r, free };
  }
  return null;
}

function submitLoan(e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target)),
    ids = cartIds(),
    need = { ...cart };
  let error = "";
  if (!ids.length) error = "Sélectionnez au moins une ressource.";
  else if (new Date(data.start) < new Date()) error = "La date de retrait doit être dans le futur.";
  else if (new Date(data.end) <= new Date(data.start)) error = "Le retour doit être après le retrait.";
  else if (ids.some((id) => usable(resource(id)) < need[id])) error = "Une ressource n’est plus disponible en quantité suffisante.";
  else if (!data.purpose.trim()) error = "Indiquez en quelques mots votre projet.";
  else {
    const c = conflict(ids, data.start, data.end, undefined, need);
    if (c)
      error = c.free
        ? `Il ne reste ${c.free === 1 ? "qu’un seul exemplaire" : `que ${c.free} exemplaires`} de ${c.res.name} sur cette période. Réduisez la quantité ou changez les dates.`
        : `${c.res.name} n’est plus disponible sur cette période. Essayez d’autres dates.`;
  }
  if (error) {
    const el = $("#form-error");
    el.hidden = false;
    el.textContent = error;
    pop(el);
    return;
  }
  const status = ids.some((id) => cat(resource(id).cat).approval) ? "pending" : "approved";
  db.requests.push({
    id: Math.max(1000, ...db.requests.map((r) => r.id)) + 1,
    ids,
    ...(Object.values(need).some((n) => n > 1) ? { qty: need } : {}),
    user: role,
    name: users[role].name,
    kind: "loan",
    status,
    ...data,
    purpose: data.purpose.trim(),
    created: new Date().toISOString(),
  });
  cart = {};
  persist(`Nouvelle demande de ${users[role].name} · ${labels[status]}`);
  closeModal();
  navigate("requests");
  toast(status === "pending" ? "Demande envoyée. L’accueil vous répond sous 24 h." : "C’est réservé ! Retrait à l’accueil.");
}

/* ---------- Détail d’une demande ---------- */
function steps(r) {
  const s = reqStatus(r);
  if (s === "rejected") return `<div class="callout pink">${ico("alert")}<span><b>Demande refusée</b>${r.reason ? esc(r.reason) : ""}</span></div>`;
  if (s === "cancelled") return `<div class="callout">${ico("close")}<span><b>Demande annulée</b></span></div>`;
  const list = r.kind === "loan" ? ["Envoyée", "Validée", "En cours", "Rendue"] : ["Envoyée", "Validée", "En cours", "Terminée"];
  const idx = { pending: 1, approved: 2, active: 3, late: 3, returned: 4, finished: 4 }[s] ?? 0;
  return `<ol class="steps">${list
    .map((t, i) => `<li class="${i < idx - 1 || idx === list.length ? "done" : i === idx - 1 ? "current" : ""} ${s === "late" && i === 2 ? "late" : ""}"><span>${i < idx - 1 || idx === list.length ? ico("check") : ""}</span>${s === "late" && i === 2 ? "En retard" : t}</li>`)
    .join("")}</ol>`;
}

function detail(id) {
  const r = db.requests.find((x) => x.id === id);
  if (!r || !visible(r)) return;
  const s = reqStatus(r);
  const canCancel = ["pending", "approved"].includes(r.status) && new Date(r.start) > new Date();
  modal(
    `${r.kind === "loan" ? "Emprunt" : "Réservation"} n° ${r.id}`,
    `<div class="modal-body">
      ${steps(r)}
      <div class="cart-list">${r.ids
        .map(
          (rid) =>
            `<div class="cart-item"><span class="res-icon">${ico(resource(rid)?.icon)}</span><span><b>${itemName(r, rid)}</b><small>${esc(resource(rid)?.location)}</small></span>${r.conditions ? badge(r.conditions[rid] === "RAS" ? "returned" : r.conditions[rid] === "Endommagé" ? "maintenance" : "unavailable") : ""}</div>`,
        )
        .join("")}</div>
      <dl class="facts">
        <div><dt>Quand</dt><dd>${dateRange(r)}</dd></div>
        <div><dt>Demandé par</dt><dd>${esc(r.name)}${r.group ? ` · ${esc(r.group)}` : ""}</dd></div>
        ${r.purpose ? `<div><dt>Motif</dt><dd>${esc(r.purpose)}</dd></div>` : ""}
        ${r.status === "returned" ? `<div><dt>Retour</dt><dd>Contrôlé par ${esc(r.returnBy)} le ${fmt(r.returnAt, true)}</dd></div>` : ""}
      </dl>
      ${s === "late" ? `<div class="callout pink">${ico("alert")}<span><b>Retour en retard</b>Prévu le ${fmt(r.end, true)}.</span></div>` : ""}
    </div>`,
    `${canCancel ? '<button class="btn danger-text" id="cancel-request">Annuler la demande</button>' : ""}
     ${role === "admin" && r.status === "pending" ? `<button class="btn" data-reject="${r.id}">Refuser</button><button class="btn primary" data-approve="${r.id}">${ico("check")} Valider</button>` : ""}
     ${role === "admin" && r.kind === "loan" && ["active", "late"].includes(s) ? '<button class="btn primary" id="return">Enregistrer le retour</button>' : ""}
     ${!canCancel && !(role === "admin" && (r.status === "pending" || ["active", "late"].includes(s))) ? '<button class="btn" data-close>Fermer</button>' : ""}`,
  );
  $("#cancel-request")?.addEventListener("click", () => {
    if (!confirm("Annuler cette demande ?")) return;
    r.status = "cancelled";
    persist(`Demande n° ${r.id} annulée par ${users[role].name}`);
    closeModal();
    refresh();
    toast("Demande annulée.");
  });
  bindDecisions($("#modal"));
  $("#return")?.addEventListener("click", () => returnForm(r));
}

function approve(r) {
  if (role !== "admin") return;
  if (conflict(r.ids, r.start, r.end, r.id, r.qty || {}))
    return toast("Impossible de valider : une ressource n’est plus disponible.", "warn");
  if (new Date(r.end) <= new Date()) return toast("Cette demande a expiré. Refusez-la pour libérer le créneau.", "warn");
  r.status = "approved";
  persist(`Demande n° ${r.id} validée par ${users[role].name}`);
  closeModal();
  const card = $(`.approval [data-approve="${r.id}"]`)?.closest(".approval");
  const done = () => {
    refresh();
    toast(`Demande de ${r.name} validée.`);
  };
  if (card && motionOK)
    card.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateX(40px)" }], { duration: 260, easing: ease }).onfinish = done;
  else done();
}
function reject(r) {
  modal(
    "Refuser la demande",
    `<form id="reject-form" class="modal-body"><p class="muted">${esc(r.name)} recevra ce message.</p><label class="field">Motif du refus<textarea name="reason" required maxlength="300" rows="3" placeholder="Ex. le matériel est déjà prévu pour un cours ce jour-là."></textarea></label></form>`,
    `<button class="btn" data-close>Annuler</button><button type="submit" form="reject-form" class="btn primary">Refuser la demande</button>`,
  );
  $("#reject-form").onsubmit = (e) => {
    e.preventDefault();
    if (role !== "admin") return;
    r.status = "rejected";
    r.reason = new FormData(e.target).get("reason").trim();
    persist(`Demande n° ${r.id} refusée : ${r.reason}`);
    closeModal();
    refresh();
    toast("Demande refusée.");
  };
}
function bindDecisions(root = document) {
  $$("[data-approve]", root).forEach((b) => (b.onclick = () => approve(db.requests.find((r) => r.id === +b.dataset.approve))));
  $$("[data-reject]", root).forEach((b) => (b.onclick = () => reject(db.requests.find((r) => r.id === +b.dataset.reject))));
}

function returnForm(r) {
  modal(
    "Contrôler le retour",
    `<form id="return-form" class="modal-body"><p class="muted">Indiquez l’état de chaque ressource.</p>${r.ids
      .map(
        (id) => `<fieldset class="condition"><legend>${itemName(r, id)}</legend>${["RAS", "Endommagé", "Perdu"]
          .map((s, i) => `<label><input type="radio" name="${id}" value="${s}" required ${i === 0 ? "checked" : ""}><span>${s === "RAS" ? "Bon état" : s}</span></label>`)
          .join("")}</fieldset>`,
      )
      .join("")}<p class="hint">Endommagé : les unités passent en réparation. Perdu : elles sont retirées du stock.</p></form>`,
    `<button class="btn" data-close>Annuler</button><button class="btn primary" form="return-form">Confirmer le retour</button>`,
  );
  $("#return-form").onsubmit = (e) => {
    e.preventDefault();
    if (role !== "admin") return;
    r.conditions = Object.fromEntries(new FormData(e.target));
    for (const [id, state] of Object.entries(r.conditions)) {
      const res = resource(+id),
        n = units(r, +id);
      if (state === "RAS") continue;
      // Ressource unique : elle change d’état. Sinon seules les unités concernées sortent du stock.
      if (stock(res) <= 1) res.status = state === "Endommagé" ? "maintenance" : "unavailable";
      else if (state === "Endommagé") res.maint = Math.min(stock(res), (res.maint || 0) + n);
      else res.qty = Math.max(0, stock(res) - n);
    }
    r.status = "returned";
    r.returnAt = new Date().toISOString();
    r.returnBy = users[role].name;
    persist(`Retour n° ${r.id} contrôlé par ${r.returnBy} · ${Object.entries(r.conditions).map(([id, s]) => resource(+id).name + " : " + s).join(", ")}`);
    closeModal();
    refresh();
    toast("Retour enregistré.");
  };
}

/* ---------- Gestion ---------- */
function editResource(id) {
  if (role !== "admin") return;
  const r = id ? resource(id) : { name: "", code: "", type: "physical", cat: db.categories[0].id, location: "", status: "available" };
  const busy =
    id && db.requests.some((q) => q.ids.includes(id) && ["pending", "approved"].includes(q.status) && (q.kind === "loan" || new Date(q.end) > new Date()));
  modal(
    id ? "Modifier la ressource" : "Nouvelle ressource",
    `<form id="resource-form" class="modal-body">
      <label class="field">Nom<input name="name" value="${esc(r.name)}" required maxlength="100"></label>
      <div class="form-row"><label class="field">Référence<input name="code" value="${esc(r.code)}" required maxlength="50"></label>
      <label class="field">Type<select name="type" ${id ? "disabled" : ""}>${Object.entries(types).map(([k, t]) => `<option value="${k}" ${r.type === k ? "selected" : ""}>${t}</option>`).join("")}</select></label></div>
      <label class="field">Catégorie<select name="cat">${db.categories.map((c) => `<option value="${c.id}" ${r.cat === c.id ? "selected" : ""}>${esc(c.name)}</option>`).join("")}</select></label>
      <label class="field">Emplacement<input name="location" value="${esc(r.location)}" required maxlength="120" placeholder="Ex. Bâtiment A · 24 places"></label>
      <div class="form-row stock-fields"><label class="field">Quantité en stock<input name="qty" type="number" min="1" max="999" value="${stock(r) || 1}" required></label>
      <label class="field">Dont en réparation<input name="maint" type="number" min="0" max="999" value="${r.maint || 0}"></label></div>
      <label class="field">État<select name="status" ${busy ? "disabled" : ""}>${["available", "maintenance", "unavailable"].map((s) => `<option value="${s}" ${r.status === s ? "selected" : ""}>${labels[s]}</option>`).join("")}</select></label>
      ${busy ? '<p class="form-note info">Une demande est en cours sur cette ressource : son état et son retrait sont bloqués jusqu’à sa clôture.</p>' : ""}
      <p id="resource-error" hidden class="form-note error"></p>
    </form>`,
    `${id ? `<button type="button" class="btn danger-text" id="retire" ${busy ? "disabled" : ""}>Retirer du catalogue</button>` : ""}<button class="btn" data-close>Annuler</button><button class="btn primary" form="resource-form">Enregistrer</button>`,
  );
  // Une salle ou un véhicule est unique : pas de quantité à saisir.
  const syncStock = () => ($(".stock-fields").hidden = reserve(id ? r.type : $("#resource-form [name=type]").value));
  syncStock();
  $("#resource-form [name=type]").onchange = syncStock;
  $("#resource-form").onsubmit = (e) => {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.target));
    const type = id ? r.type : values.type;
    if (reserve(type)) {
      values.qty = 1;
      values.maint = 0;
    } else {
      values.qty = Math.max(1, parseInt(values.qty, 10) || 1);
      values.maint = Math.min(values.qty, Math.max(0, parseInt(values.maint, 10) || 0));
    }
    if (id && values.qty - values.maint < outNow(r)) {
      $("#resource-error").hidden = false;
      $("#resource-error").textContent = `${outNow(r)} unité(s) sont actuellement sorties : le stock utilisable ne peut pas être inférieur.`;
      return;
    }
    if (db.resources.some((x) => x.id !== id && x.code.toLowerCase() === values.code.trim().toLowerCase())) {
      $("#resource-error").hidden = false;
      $("#resource-error").textContent = "Cette référence est déjà utilisée.";
      return;
    }
    if (id) Object.assign(r, values);
    else
      db.resources.push({
        ...values,
        id: Math.max(...db.resources.map((x) => x.id)) + 1,
        icon: { physical: "laptop", key: "key", license: "code", room: "room", amphi: "room", vehicle: "car" }[values.type],
      });
    persist(`Ressource ${id ? "modifiée" : "ajoutée"} : ${values.name}`);
    closeModal();
    render();
    toast("Ressource enregistrée.");
  };
  $("#retire")?.addEventListener("click", () => {
    if (busy || !confirm(`Retirer « ${r.name} » du catalogue ? Son historique est conservé.`)) return;
    r.retired = true;
    persist(`Ressource retirée du catalogue : ${r.name}`);
    closeModal();
    render();
    toast("Ressource retirée du catalogue.");
  });
}

function addCategory() {
  if (role !== "admin") return;
  modal(
    "Nouvelle catégorie",
    `<form id="category-form" class="modal-body"><label class="field">Nom<input name="name" required maxlength="70"></label>
      <label class="switch"><input name="approval" type="checkbox"><span class="track"><span></span></span><span class="switch-label">Les demandes doivent être validées</span></label>
      <p id="category-error" class="form-note error" hidden></p></form>`,
    `<button class="btn" data-close>Annuler</button><button class="btn primary" form="category-form">Créer</button>`,
  );
  $("#category-form").onsubmit = (e) => {
    e.preventDefault();
    const f = new FormData(e.target),
      name = f.get("name").trim();
    if (!name || db.categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      const el = $("#category-error");
      el.hidden = false;
      el.textContent = "Ce nom existe déjà ou est vide.";
      return;
    }
    db.categories.push({ id: "cat-" + Date.now(), name, approval: f.has("approval") });
    persist(`Catégorie créée : ${name}`);
    closeModal();
    render();
    toast("Catégorie ajoutée.");
  };
}

/* ---------- Liaisons ---------- */
function refresh() {
  if (view === "planning") {
    renderChrome();
    updatePlan();
  } else render();
}
function refreshCatalog() {
  const box = $("#catalog-results");
  if (!box) return;
  box.innerHTML = catalogCards();
  bindCards();
}

function moveThumb(seg) {
  const btns = $$("button", seg);
  seg.style.setProperty("--i", btns.findIndex((b) => b.classList.contains("active")));
}

function bind() {
  $$("#main [data-nav]").forEach((b) => (b.onclick = () => navigate(b.dataset.nav)));
  $$("#main [data-action]").forEach(
    (b) =>
      (b.onclick = () => {
        const a = b.dataset.action;
        if (a === "cart") openCart();
        else if (a === "book") openBooking({ date: view === "planning" ? planDate : undefined });
        else if (a === "loan") {
          filter = "loan";
          navigate("catalog");
        } else if (a === "add-resource") editResource();
        else if (a === "add-category") addCategory();
      }),
  );
  $$("[data-detail]").forEach((b) => (b.onclick = () => detail(+b.dataset.detail)));
  bindDecisions();

  // Contrôles segmentés : la pastille glisse avant le nouveau rendu.
  $$("[data-filter]").forEach(
    (b) =>
      (b.onclick = () => {
        filter = b.dataset.filter;
        $$("[data-filter]").forEach((x) => x.classList.toggle("active", x === b));
        moveThumb(b.parentElement);
        refreshCatalog();
        reveal($$(".resource-card"), { y: 8, step: 20, duration: 320 });
      }),
  );
  $$("[data-req]").forEach(
    (b) =>
      (b.onclick = () => {
        reqFilter = b.dataset.req;
        moveThumb(b.parentElement);
        setTimeout(() => {
          render();
          reveal($$(".req-row"), { y: 6, step: 25, duration: 300 });
        }, motionOK ? 160 : 0);
      }),
  );
  $$("[data-plan]").forEach(
    (b) =>
      (b.onclick = () => {
        planView = b.dataset.plan;
        $$("[data-plan]").forEach((x) => x.classList.toggle("active", x === b));
        moveThumb(b.parentElement);
        updatePlan();
      }),
  );
  $$("[data-plan-step]").forEach(
    (b) =>
      (b.onclick = () => {
        const dir = +b.dataset.planStep;
        planDate = addDays(planDate, dir * (planView === "week" ? 7 : planView === "list" ? 0 : 1));
        updatePlan(dir);
      }),
  );
  $("[data-plan-today]")?.addEventListener("click", () => {
    const dir = Math.sign(dayStart(new Date()) - planDate);
    planDate = dayStart(new Date());
    updatePlan(-dir);
  });

  $("#search")?.addEventListener("input", (e) => {
    query = e.target.value;
    refreshCatalog();
  });
  $("#category")?.addEventListener("change", (e) => {
    category = e.target.value;
    refreshCatalog();
  });
  $("#status-filter")?.addEventListener("change", (e) => {
    statusFilter = e.target.value;
    refreshCatalog();
  });
  $$("[data-cat]").forEach(
    (c) =>
      (c.onchange = () => {
        if (role !== "admin") return;
        cat(c.dataset.cat).approval = c.checked;
        persist(`Règle de validation modifiée : ${cat(c.dataset.cat).name}`);
        toast(c.checked ? "Les nouvelles demandes devront être validées." : "Les nouvelles demandes seront acceptées directement.");
      }),
  );
  bindCards();
  bindSlots();
  if (view === "planning") bindPlan();
  if (view === "tracking") bindTracking();
}

function bindCards() {
  $$("[data-add]").forEach(
    (b) =>
      (b.onclick = () => {
        const r = resource(+b.dataset.add);
        const added = !!cart[r.id];
        if (added) delete cart[r.id];
        else cart[r.id] = 1;
        b.classList.toggle("selected", !added);
        b.setAttribute("aria-pressed", !added);
        b.innerHTML = `${ico(added ? "plus" : "check")} ${added ? "Ajouter" : "Ajouté"}`;
        b.closest(".resource-card").classList.toggle("is-added", !added);
        renderChrome();
        // Le bouton de sélection dans l’en-tête de page suit le compteur.
        const pageCart = $(".page-actions [data-action=cart]");
        if (pageCart) {
          pageCart.innerHTML = `${ico("bag")} Ma sélection${cartCount() ? ` · ${cartCount()}` : ""}`;
          pageCart.classList.toggle("primary", cartCount() > 0);
        }
        pop($(".cart-btn i"));
        pop(b);
        if (!added) toast(`${r.name} ajouté à votre sélection.`);
      }),
  );
  $$("[data-book]").forEach((b) => (b.onclick = () => openBooking({ resId: +b.dataset.book })));
  $$("#catalog-results [data-detail]").forEach((b) => (b.onclick = () => detail(+b.dataset.detail)));
  $$("#catalog-results [data-holders]").forEach((b) => (b.onclick = () => holdersModal(+b.dataset.holders)));
  $$("[data-edit]").forEach((b) => (b.onclick = () => editResource(+b.dataset.edit)));
  $$("[data-reset-filters]").forEach(
    (b) =>
      (b.onclick = () => {
        query = category = statusFilter = "";
        filter = "all";
        render();
      }),
  );
}
render();

/* ---------- Outil WebMCP (si disponible) ---------- */
if (document.modelContext?.registerTool) {
  try {
    Promise.resolve(
      document.modelContext.registerTool({
        name: "stage_resource_request",
        description:
          "Préparer une demande sans l’envoyer : ajoute du matériel à la sélection d’emprunt, ou ouvre le formulaire de réservation pour un espace.",
        inputSchema: {
          type: "object",
          properties: { ids: { type: "array", items: { type: "integer" }, minItems: 1 } },
          required: ["ids"],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false },
        execute(input) {
          if (
            !input ||
            !Array.isArray(input.ids) ||
            !input.ids.length ||
            input.ids.some((id) => !Number.isInteger(id) || !resource(id) || usable(resource(id)) < 1)
          )
            throw Error("Ressources invalides");
          const kinds = new Set(input.ids.map((id) => (reserve(resource(id).type) ? "booking" : "loan")));
          if (kinds.size !== 1) throw Error("Séparer emprunts et réservations");
          const kind = [...kinds][0];
          if (kind === "booking") {
            if (input.ids.length > 1) throw Error("Un seul espace par réservation");
            openBooking({ resId: input.ids[0] });
            return { staged: input.ids, kind, submitted: false };
          }
          cart = Object.fromEntries([...new Set(input.ids)].map((id) => [id, 1]));
          render();
          openCart();
          return { staged: cartIds(), kind, submitted: false };
        },
      }),
    ).catch(() => {});
  } catch {}
}
