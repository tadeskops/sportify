import { escapeHtml as e } from "./dom.js";

export function ruleText(section) {
  return [
    section.title, section.caption,
    ...section.blocks.flatMap(block => [block.title || "", ...(block.paragraphs || []), ...(block.bullets || []), block.quote || ""])
  ].join(" ").toLowerCase();
}

export function matchingRules(sections, query) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return sections.filter(section => words.every(word => ruleText(section).includes(word)));
}

export function renderSections(sections, prefix) {
  return sections.map((section, index) => `
    <details class="rule-section" id="${prefix}-${e(section.id)}"${index === 0 ? " open" : ""}>
      <summary><h3 class="accordion-title"><span class="section-number">${String(index + 1).padStart(2, "0")}</span><span>${e(section.title)}<span class="section-caption">${e(section.caption)}</span></span><span class="expand-icon" aria-hidden="true">+</span></h3></summary>
      <div class="section-body">${section.blocks.map(block => `<div class="rule-item">
        ${block.title ? `<h4>${e(block.title)}</h4>` : ""}
        ${(block.paragraphs || []).map(text => `<p>${e(text)}</p>`).join("")}
        ${block.bullets ? `<ul>${block.bullets.map(text => `<li>${e(text)}</li>`).join("")}</ul>` : ""}
        ${block.quote ? `<blockquote>${e(block.quote)}</blockquote>` : ""}
      </div>`).join("")}</div>
    </details>`).join("");
}

export function mountRulebook({ general, football, config }) {
  let active = "general";
  let query = "";
  const rules = document.getElementById("rules");
  const contents = document.getElementById("rule-contents");
  const search = document.getElementById("rule-search");
  const status = document.getElementById("search-status");
  const heading = document.getElementById("book-title");
  const description = document.getElementById("book-description");

  function render() {
    const isFootball = active === "football";
    const sections = isFootball ? football : general;
    const matching = matchingRules(sections, query);
    heading.textContent = isFootball ? "Football rule book" : "One place for the ground rules.";
    description.textContent = isFootball
      ? "Football-specific rules. The general joining and resident-led coordination guidelines also apply."
      : "Shared rules for all pre-booked sports. Open a section or search below.";
    rules.innerHTML = renderSections(matching, active);
    if (query.trim()) rules.querySelectorAll("details").forEach(item => { item.open = true; });
    if (contents) {
      contents.innerHTML = `<p class="eyebrow">IN THIS RULE BOOK</p>${matching.map(section => `<a href="#${active}-${e(section.id)}">${e(section.title)}<span aria-hidden="true">&nearr;</span></a>`).join("")}`;
    }
    const empty = document.getElementById("empty-state");
    empty.hidden = matching.length !== 0;
    if (status) status.textContent = `${matching.length} of ${sections.length} sections${query.trim() ? ` match "${query.trim()}"` : ` in ${isFootball ? "Football" : "General"}`}.`;
    document.querySelectorAll("[data-sport]").forEach(button => {
      button.setAttribute("aria-pressed", String(button.dataset.sport === active));
    });
  }

  if (search) {
    search.addEventListener("input", () => { query = search.value; render(); });
    const clear = () => { query = ""; search.value = ""; render(); search.focus(); };
    document.getElementById("clear-search").addEventListener("click", clear);
    document.getElementById("reset-search").addEventListener("click", clear);
  }
  document.querySelectorAll("[data-sport]").forEach(button => {
    button.addEventListener("click", () => {
      active = button.dataset.sport;
      query = "";
      if (search) search.value = "";
      render();
    });
  });
  contents?.addEventListener("click", event => {
    const link = event.target.closest("a");
    if (!link) return;
    const section = document.getElementById(link.hash.slice(1));
    if (section) section.open = true;
  });

  function openFragment() {
    const id = location.hash.slice(1);
    if (id.startsWith("football-") && config.features.football && active !== "football") {
      active = "football"; query = ""; if (search) search.value = ""; render();
    } else if (id.startsWith("general-") && active !== "general") {
      active = "general"; query = ""; if (search) search.value = ""; render();
    }
    const section = document.getElementById(id);
    if (!section && query && (id.startsWith(`${active}-`))) {
      query = "";
      if (search) search.value = "";
      render();
    }
    const target = document.getElementById(id);
    if (target?.tagName === "DETAILS") { target.open = true; target.scrollIntoView(); }
  }
  render();
  openFragment();
  window.addEventListener("hashchange", openFragment);
}
