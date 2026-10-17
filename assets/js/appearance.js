import { appearanceEnabled } from "./config.js";
import { icon } from "./dom.js";

const storageKey = "sportify-appearance-v1";
const choices = { theme: ["dark", "light"], font: ["classic", "modern"], size: ["standard", "large"] };

export function resolvePreferences(config, saved = {}) {
  const flags = config.features;
  const enabled = { theme: flags.appearance && flags.themePicker, font: flags.appearance && flags.fontPicker, size: flags.appearance && flags.textSize };
  const defaults = { theme: config.appearance.defaultTheme, font: config.appearance.defaultFont, size: config.appearance.defaultTextSize };
  return Object.fromEntries(Object.keys(choices).map(key => [
    key, enabled[key] && flags.rememberPreferences && choices[key].includes(saved?.[key]) ? saved[key] : defaults[key]
  ]));
}

export function mountAppearance(config) {
  let saved = {};
  const notify = message => {
    console.warn(`[Sportify appearance] ${message}`);
    document.getElementById("preference-status").textContent = message;
  };
  if (appearanceEnabled(config) && config.features.rememberPreferences) {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        saved = JSON.parse(stored);
        if (!saved || typeof saved !== "object" || Array.isArray(saved) ||
            Object.entries(saved).some(([key, value]) => !choices[key]?.includes(value))) {
          saved = {};
          notify("Saved appearance settings were invalid. Site defaults have been restored.");
        }
      }
    } catch (error) {
      notify(`Unable to read saved appearance settings. Using site defaults. ${error.message}`);
    }
  }
  const preferences = resolvePreferences(config, saved);
  function apply() {
    for (const [key, value] of Object.entries(preferences)) document.documentElement.dataset[key] = value;
    document.querySelector('meta[name="theme-color"]').content = preferences.theme === "light" ? "#faf7ef" : "#11110e";
    document.querySelectorAll("[data-preference]").forEach(button => {
      button.setAttribute("aria-pressed", String(preferences[button.dataset.preference] === button.dataset.value));
    });
  }
  apply();
  if (!appearanceEnabled(config)) return;

  const root = document.createElement("aside");
  root.className = "appearance";
  root.setAttribute("aria-label", "Appearance");
  const group = (key, title, values) => `<fieldset><legend class="sr-only">${title}</legend><div class="choice-row">${values.map(([value, label]) => `<button type="button" data-preference="${key}" data-value="${value}" aria-label="${label}" title="${label}">${key === "theme" ? `<span class="swatch ${value}" aria-hidden="true"></span>` : `<span class="sample-${value}" aria-hidden="true">A</span>`}</button>`).join("")}</div></fieldset>`;
  root.innerHTML = `<button type="button" class="appearance-toggle" id="appearance-toggle" aria-expanded="true" aria-controls="appearance-panel" aria-label="Collapse appearance settings" aria-describedby="appearance-drag-hint" title="Drag to move; click to collapse or expand"><span class="edge-arrow">${icon("arrow")}</span><span class="palette-icon">${icon("grip")}</span></button>
    <section class="appearance-panel" id="appearance-panel" aria-labelledby="appearance-title">
      <h2 id="appearance-title" class="sr-only">Theme and font settings</h2>
      <p id="appearance-drag-hint" class="sr-only">Drag the grip to move the palette. Use arrow keys on the grip to reposition it.</p>
      ${config.features.themePicker ? group("theme", "Colour", [["dark", "Midnight gold"], ["light", "Ivory gold"]]) : ""}
      ${config.features.fontPicker ? group("font", "Type style", [["classic", "Classic serif"], ["modern", "Modern sans"]]) : ""}
      ${config.features.textSize ? group("size", "Reading size", [["standard", "Standard"], ["large", "Larger"]]) : ""}
      <p class="sr-only">${config.features.rememberPreferences ? "Saved on this device when browser storage is available." : "Applies to this visit only."}</p>
    </section>`;
  document.body.append(root);
  const toggle = root.querySelector("#appearance-toggle");
  const panel = root.querySelector("#appearance-panel");
  let timer;
  let drag;
  let suppressClick = false;
  function position(left, top) {
    root.classList.add("is-positioned");
    root.style.left = `${Math.max(0, Math.min(left, window.innerWidth - root.offsetWidth))}px`;
    root.style.top = `${Math.max(0, Math.min(top, window.innerHeight - root.offsetHeight))}px`;
  }
  function keepInView() {
    if (!root.classList.contains("is-positioned")) return;
    const rect = root.getBoundingClientRect();
    position(rect.left, rect.top);
  }
  function setOpen(open, returnFocus = false) {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", `${open ? "Collapse" : "Expand"} appearance settings`);
    root.classList.remove("is-idle");
    keepInView();
    if (!open) {
      if (returnFocus) toggle.focus();
      scheduleIdle();
    }
  }
  function scheduleIdle() {
    clearTimeout(timer);
    if (drag || root.matches(":hover") || root.querySelector(":focus-visible")) return;
    timer = setTimeout(() => {
      if (window.matchMedia("(max-width: 600px)").matches && !root.classList.contains("is-positioned")) {
        panel.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Expand appearance settings");
      }
      root.classList.add("is-idle");
    }, config.appearance.idleDelayMs);
  }
  toggle.addEventListener("pointerdown", event => {
    if (!event.isPrimary || event.button !== 0) return;
    const rect = root.getBoundingClientRect();
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, left: rect.left, top: rect.top };
    suppressClick = false;
    clearTimeout(timer);
    toggle.setPointerCapture(event.pointerId);
  });
  toggle.addEventListener("pointermove", event => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!suppressClick && Math.hypot(dx, dy) < 5) return;
    suppressClick = true;
    root.classList.add("is-dragging");
    position(drag.left + dx, drag.top + dy);
  });
  const endDrag = event => {
    if (!drag || drag.id !== event.pointerId) return;
    drag = undefined;
    root.classList.remove("is-dragging");
    if (toggle.hasPointerCapture(event.pointerId)) toggle.releasePointerCapture(event.pointerId);
    scheduleIdle();
  };
  toggle.addEventListener("pointerup", endDrag);
  toggle.addEventListener("pointercancel", endDrag);
  toggle.addEventListener("lostpointercapture", endDrag);
  toggle.addEventListener("click", () => {
    if (suppressClick) { suppressClick = false; return; }
    setOpen(panel.hidden);
  });
  toggle.addEventListener("keydown", event => {
    const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault();
    const rect = root.getBoundingClientRect();
    position(rect.left + direction[0] * 20, rect.top + direction[1] * 20);
  });
  window.addEventListener("resize", keepInView);
  root.addEventListener("pointerenter", () => { clearTimeout(timer); root.classList.remove("is-idle"); });
  root.addEventListener("pointerleave", scheduleIdle);
  root.addEventListener("focusin", () => { clearTimeout(timer); root.classList.remove("is-idle"); });
  root.addEventListener("focusout", () => queueMicrotask(scheduleIdle));
  document.addEventListener("pointerdown", event => {
    if (!root.contains(event.target)) scheduleIdle();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !panel.hidden) setOpen(false, true);
  });
  root.querySelectorAll("[data-preference]").forEach(button => {
    button.addEventListener("click", () => {
      preferences[button.dataset.preference] = button.dataset.value;
      apply();
      keepInView();
      if (config.features.rememberPreferences) {
        try { localStorage.setItem(storageKey, JSON.stringify(preferences)); }
        catch (error) { notify(`Appearance changed for this visit but could not be saved. ${error.message}`); }
      }
    });
  });
  apply();
  scheduleIdle();
}
