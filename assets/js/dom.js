export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

export function icon(name) {
  const paths = {
    whatsapp: '<path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.4-4.8A8.5 8.5 0 1 1 20.5 11.6Z"/><path d="M8 7.5c-.8.8-.4 3.2 1.8 5.4s4.6 2.6 5.4 1.8l.8-1.2-2.6-1.3-.9 1c-1.3-.5-2.8-2-3.3-3.3l1-.9L9 6.4Z"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6"/>',
    palette: '<path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1.4-3.4c-.7-.7-.2-1.9.8-1.9h2.3A3.5 3.5 0 0 0 21 12a9 9 0 0 0-9-9Z"/><circle cx="7.5" cy="10" r="1"/><circle cx="10.5" cy="6.5" r="1"/><circle cx="15" cy="7" r="1"/>',
    arrow: '<path d="m9 5 7 7-7 7"/>',
    up: '<path d="M12 19V5m-6 6 6-6 6 6"/>',
    grip: '<circle cx="9" cy="5" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="19" r="1"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 10h18m-10 5 2 2 4-4"/>'
  };
  if (!paths[name]) throw new Error(`Unknown icon: ${name}`);
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
}
