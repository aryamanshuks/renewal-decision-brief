import { html } from "../../vendor/htm-preact.js";

// A few line icons, drawn on a 24 by 24 grid. Decorative: always hidden from screen readers.
const PATHS = {
  grid: ["M4 4h6v6H4z", "M14 4h6v6h-6z", "M4 14h6v6H4z", "M14 14h6v6h-6z"],
  inbox: ["M3 13h5l1.5 2.5h5L16 13h5", "M5.5 5h13L21 13v6H3v-6z"],
  check: ["M8 12.5l2.5 2.5L16 9.5", "M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"],
  plus: ["M12 5v14", "M5 12h14"],
  flask: ["M9.5 3h5", "M10.5 3v6.2L5.2 18.4A1.7 1.7 0 0 0 6.7 21h10.6a1.7 1.7 0 0 0 1.5-2.6L13.5 9.2V3", "M7.6 15h8.8"],
  info: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M12 16v-4.5", "M12 8h.01"],
  clock: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M12 7v5l3 2"],
  chevron: ["M9 6l6 6-6 6"],
  doc: ["M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z", "M14 3v5h5", "M9 13h6", "M9 17h4"],
  user: ["M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", "M4.5 20a7.5 7.5 0 0 1 15 0"],
  calendar: ["M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z", "M4 10h16", "M8 3v4", "M16 3v4"],
  menu: ["M4 7h16", "M4 12h16", "M4 17h16"],
  close: ["M6 6l12 12", "M18 6L6 18"],
  send: ["M21 3L10 14", "M21 3l-6.5 18-3.5-7-7-3.5z"],
  copy: ["M9 9h10v10H9z", "M5 15V5h10"],
  download: ["M12 4v11", "M7.5 10.5L12 15l4.5-4.5", "M5 20h14"],
};

export function Icon({ name, size = 18, cls = "" }) {
  return html`<svg class=${`icon ${cls}`} width=${size} height=${size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
    ${(PATHS[name] || []).map((d) => html`<path d=${d} />`)}
  </svg>`;
}

export function Mark({ size = 26 }) {
  // A renewal loop around a calendar day with a tick: the renewal date, proven.
  return html`<svg class="brand-mark" width=${size} height=${size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
    <rect width="32" height="32" rx="7.5" fill="#ffffff" />
    <path d="M24.46 12.92 A9 9 0 1 1 17.56 7.14" fill="none" stroke="#073439" stroke-width="2.6" stroke-linecap="round" />
    <path d="M20.6 7.7 L16.6 10.2 L17.6 4.1 Z" fill="#073439" stroke="#073439" stroke-width="0.8" stroke-linejoin="round" />
    <rect x="11.5" y="12.3" width="9" height="8.6" rx="2" fill="#ffe36e" stroke="#073439" stroke-width="0.9" />
    <rect x="13.3" y="10.6" width="1.7" height="3.2" rx="0.85" fill="#073439" />
    <rect x="17" y="10.6" width="1.7" height="3.2" rx="0.85" fill="#073439" />
    <path d="M13.6 16.8 L15.4 18.6 L18.6 15.2" fill="none" stroke="#073439" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
  </svg>`;
}

export function Avatar({ name = "", tone = "" }) {
  const initials = String(name).split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return html`<span class=${`avatar ${tone}`} aria-hidden="true">${initials}</span>`;
}
