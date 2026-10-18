import { escapeHtml as e } from "./dom.js";

// One-letter rule-book prefixes. G (General) is deliberately not the initial of
// any sport; C, B and T are reserved for future Cricket, Badminton and Table Tennis books.
export const ruleBookCodes = { general: "G", football: "F", cricket: "C", badminton: "B", "table-tennis": "T" };
export const ruleRefPattern = /^([A-Z])(\d+(?:\.\d+)*)$/;

function leadingNumber(text, parent) {
  const match = /^(\d+(?:\.\d+)*)\.?\s+(\S[\s\S]*)$/.exec(text || "");
  if (!match || (match[1] !== parent && !match[1].startsWith(`${parent}.`))) return null;
  return { number: match[1], rest: match[2] };
}

// Gives every section, sub-rule and point a stable, shareable reference such as
// G2.1.3 or F1.1.2. Source numbering in titles/points is reused (shown with the
// prefix instead of repeated); otherwise blocks need an explicit `number` and
// points are numbered in display order.
export function indexRules(sections, code) {
  const seen = new Set();
  const claim = ref => {
    if (seen.has(ref)) throw new Error(`Duplicate rule reference ${ref}.`);
    seen.add(ref);
    return ref;
  };
  return sections.map((section, sectionIndex) => {
    const sectionNumber = String(sectionIndex + 1);
    const sectionTitle = leadingNumber(section.title, sectionNumber);
    return {
      ...section,
      ref: claim(`${code}${sectionNumber}`),
      displayTitle: sectionTitle ? sectionTitle.rest : section.title,
      blocks: section.blocks.map(block => {
        const parsed = leadingNumber(block.title, sectionNumber);
        const number = block.number || parsed?.number;
        if (!number) {
          if (block.title || block.paragraphs || block.bullets) throw new Error(`Rule block "${block.title || "untitled"}" in ${code}${sectionNumber} needs a number.`);
          return { ...block, points: [] };
        }
        const ref = claim(`${code}${number}`);
        let next = 0;
        const point = (kind, text) => {
          const own = leadingNumber(text, number);
          return { kind, ref: claim(own ? `${code}${own.number}` : `${ref}.${++next}`), text: own ? own.rest : text };
        };
        const points = [
          ...(block.paragraphs || []).map(text => point("p", text)),
          ...(block.bullets || []).map(text => point("li", text))
        ];
        if (block.quote) points.push(point("quote", block.quote));
        const displayTitle = parsed ? parsed.rest : block.title;
        return { ...block, ref, displayTitle, points };
      })
    };
  });
}

export function ruleText(section) {
  return [
    section.ref || "", section.title, section.caption,
    ...section.blocks.flatMap(block => [block.ref || "", block.title || "", ...(block.paragraphs || []), ...(block.bullets || []), block.quote || "",
      ...(block.points || []).map(point => point.ref)])
  ].join(" ").toLowerCase();
}

export function matchingRules(sections, query) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return sections.filter(section => words.every(word => ruleText(section).includes(word)));
}

const refLink = ref => `<a class="rule-ref" href="#${e(ref)}" data-rule-ref="${e(ref)}" title="Copy link to rule ${e(ref)}">${e(ref)}</a>`;

function renderPoints(points) {
  const items = points.filter(point => point.kind === "li");
  return [
    ...points.filter(point => point.kind === "p").map(point => `<p class="rule-point" id="${e(point.ref)}">${refLink(point.ref)} ${e(point.text)}</p>`),
    items.length ? `<ul>${items.map(point => `<li class="rule-point" id="${e(point.ref)}">${refLink(point.ref)} ${e(point.text)}</li>`).join("")}</ul>` : "",
    ...points.filter(point => point.kind === "quote").map(point => `<blockquote class="rule-point" id="${e(point.ref)}">${refLink(point.ref)} ${e(point.text)}</blockquote>`)
  ].join("");
}

function renderLinks(links = []) {
  if (!links.length) return "";
  return `<p class="rule-links">${links.map(link => link.external
    ? `<a href="${e(link.href)}" target="_blank" rel="noopener noreferrer">${e(link.label)}<span class="sr-only"> (opens in a new tab)</span> <span aria-hidden="true">&nearr;</span></a>`
    : `<a href="${e(link.href)}">${e(link.label)} <span aria-hidden="true">&rarr;</span></a>`).join("")}</p>`;
}

export function renderSections(sections, prefix) {
  return sections.map((section, index) => {
    if (!section.ref) throw new Error("Index rule sections before rendering.");
    return `
    <details class="rule-section" id="${prefix}-${e(section.id)}"${index === 0 ? " open" : ""}>
      <summary><h3 class="accordion-title" id="${e(section.ref)}"><span class="section-number">${e(section.ref)}</span><span>${e(section.displayTitle)}<span class="section-caption">${e(section.caption)}</span></span><span class="expand-icon" aria-hidden="true">+</span></h3></summary>
      <div class="section-body">${section.blocks.map(block => block.ref ? `<div class="rule-item" id="${e(block.ref)}">
        <h4>${refLink(block.ref)}${block.displayTitle ? ` ${e(block.displayTitle)}` : ""}</h4>
        ${renderPoints(block.points)}${renderLinks(block.links)}
      </div>` : `<div class="rule-item"><blockquote>${e(block.quote)}</blockquote></div>`).join("")}</div>
    </details>`;
  }).join("");
}

export function mountRulebook({ general, football, config }) {
  const books = { general: indexRules(general, ruleBookCodes.general), football: indexRules(football, ruleBookCodes.football) };
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
    const sections = books[active];
    const matching = matchingRules(sections, query);
    heading.textContent = isFootball ? "Football rule book" : "One place for the ground rules.";
    description.textContent = isFootball
      ? `Football-specific rules (F). The general (G) joining and resident-led coordination guidelines also apply. Tap a rule number to copy its link.`
      : "Shared rules for all pre-booked sports (G). Open a section or search below; tap a rule number to copy its link.";
    rules.innerHTML = renderSections(matching, active);
    if (query.trim()) rules.querySelectorAll("details").forEach(item => { item.open = true; });
    if (contents) {
      contents.innerHTML = `<p class="eyebrow">IN THIS RULE BOOK</p>${matching.map(section => `<a href="#${active}-${e(section.id)}"><span><span class="contents-ref">${e(section.ref)}</span> ${e(section.displayTitle)}</span><span aria-hidden="true">&nearr;</span></a>`).join("")}`;
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

  const linkStatus = document.createElement("p");
  linkStatus.className = "preference-status";
  linkStatus.setAttribute("role", "status");
  linkStatus.setAttribute("aria-live", "polite");
  document.body.append(linkStatus);
  let statusTimer;
  function announce(message) {
    linkStatus.textContent = message;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => { linkStatus.textContent = ""; }, 3500);
  }
  rules.addEventListener("click", async event => {
    const link = event.target.closest("[data-rule-ref]");
    if (!link) return;
    const ref = link.dataset.ruleRef;
    const url = `${location.origin}${location.pathname}#${ref}`;
    try {
      await navigator.clipboard.writeText(url);
      announce(`Link to rule ${ref} copied. Paste it in the group.`);
    } catch (problem) {
      console.error("[Sportify rules] Clipboard copy failed.", problem);
      announce(`Copy blocked. Share this link: ${url}`);
    }
  });

  let highlightTimer;
  function showTarget(target) {
    target.closest("details").open = true;
    target.scrollIntoView({ block: target.tagName === "H3" ? "start" : "center" });
    const marked = target.tagName === "H3" ? target.closest("details") : target;
    rules.querySelectorAll(".rule-highlight").forEach(item => item.classList.remove("rule-highlight"));
    marked.classList.add("rule-highlight");
    clearTimeout(highlightTimer);
    highlightTimer = setTimeout(() => marked.classList.remove("rule-highlight"), 4000);
  }

  function switchBook(book) {
    active = book; query = ""; if (search) search.value = ""; render();
  }

  function openFragment() {
    const raw = decodeURIComponent(location.hash.slice(1));
    const ref = ruleRefPattern.exec(raw.toUpperCase());
    if (ref) {
      const book = Object.keys(books).find(key => ruleBookCodes[key] === ref[1]);
      if (!book || (book === "football" && !config.features.football)) return;
      if (book !== active) switchBook(book);
      let target = document.getElementById(ref[0]);
      if (!target && query) { switchBook(active); target = document.getElementById(ref[0]); }
      if (target) showTarget(target);
      else announce(`Rule ${ref[0]} was not found. It may have been renumbered or removed.`);
      return;
    }
    const id = raw;
    if (id.startsWith("football-") && config.features.football && active !== "football") switchBook("football");
    else if (id.startsWith("general-") && active !== "general") switchBook("general");
    if (!document.getElementById(id) && query && id.startsWith(`${active}-`)) switchBook(active);
    const target = document.getElementById(id);
    if (target?.tagName === "DETAILS") { target.open = true; target.scrollIntoView(); }
  }
  render();
  openFragment();
  window.addEventListener("hashchange", openFragment);
}
