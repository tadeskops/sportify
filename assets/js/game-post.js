import { escapeHtml as e, icon, openFromLink } from "./dom.js";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const clockTime = /^([01]\d|2[0-3]):([0-5]\d)$/;

function parseDate(iso) {
  if (!isoDate.test(iso)) throw new Error("Choose a valid date.");
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCMonth() !== month - 1) throw new Error("Choose a valid date.");
  return date;
}

function minutes(time) {
  const match = clockTime.exec(time);
  if (!match) throw new Error("Choose a valid time.");
  return Number(match[1]) * 60 + Number(match[2]);
}

function toIso(date) {
  return date.toISOString().slice(0, 10);
}

// Matches the group's existing style, for example "20 Oct Sun".
export function formatDateLabel(iso) {
  const date = parseDate(iso);
  return `${date.getUTCDate()} ${months[date.getUTCMonth()]} ${weekdays[date.getUTCDay()]}`;
}

function clock(total) {
  const hours24 = Math.floor(total / 60) % 24;
  const mins = total % 60;
  const hours = hours24 % 12 || 12;
  return { text: mins ? `${hours}:${String(mins).padStart(2, "0")}` : String(hours), period: hours24 < 12 ? "AM" : "PM" };
}

export function formatTimeRange(start, end) {
  const from = minutes(start);
  const to = minutes(end);
  if (to <= from) throw new Error("End time must be after the start time.");
  const a = clock(from);
  const b = clock(to);
  const hours = Math.round(((to - from) / 60) * 100) / 100;
  const range = a.period === b.period ? `${a.text}-${b.text} ${b.period}` : `${a.text} ${a.period}-${b.text} ${b.period}`;
  return `${range} (${hours} ${hours === 1 ? "Hr" : "Hrs"})`;
}

export function formatSlot(slot, tentative = false) {
  const time = slot.start && slot.end ? formatTimeRange(slot.start, slot.end) : "TBD";
  return [`Date: ${formatDateLabel(slot.date)}`, `Time: ${time}${tentative ? " (tentative)" : ""}`];
}

const divider = "——————————-";

function validateGame({ sport, date, start, end, minPlayers, maxPlayers }) {
  if (!sport?.name) throw new Error("Choose a sport.");
  if (!date) throw new Error("Choose a date.");
  parseDate(date);
  if (Boolean(start) !== Boolean(end)) throw new Error("Enter both start and end time, or leave both empty for time TBD.");
  if (start) formatTimeRange(start, end);
  if (minPlayers != null && (!Number.isInteger(minPlayers) || minPlayers < 1)) throw new Error("Minimum count must be a whole number of at least 1, or left empty.");
  if (!Number.isInteger(maxPlayers) || maxPlayers < 1) throw new Error("Count stops at must be a whole number of at least 1.");
  if (minPlayers != null && maxPlayers < minPlayers) throw new Error("Count stops at must be at least the minimum count.");
}

// The minimum line is only printed for unbooked games when a minimum is given.
function gameLines({ sport, gameNumber, venue, booked, date, start, end, tentative, minPlayers, maxPlayers, note }) {
  const venueName = venue?.trim() || "TBD";
  const isBooked = Boolean(booked) && venueName !== "TBD";
  const lines = [`${gameNumber ? `Game ${gameNumber}` : "Game"}: ${sport.name}`];
  lines.push(`Venue: ${venueName} (${isBooked ? "Booked" : "Not booked"})`);
  lines.push(...formatSlot({ date, start, end }, tentative));
  if (note?.trim()) lines.push(note.trim());
  lines.push("", "1. ", "");
  if (minPlayers != null && !isBooked) lines.push(`🚨 Minimum count required to book the venue: ${minPlayers} 🛑`);
  lines.push(`Count stops at ${maxPlayers} 🛑`);
  return lines;
}

// "Sat & Sun", "Mon, Sat & Sun"; full dates when a weekday repeats (e.g. two Saturdays).
export function gameDays(dates) {
  const unique = [...new Set(dates)].sort();
  const days = unique.map(iso => weekdays[parseDate(iso).getUTCDay()]);
  const labels = new Set(days).size === days.length ? days : unique.map(formatDateLabel);
  return labels.length > 1 ? `${labels.slice(0, -1).join(", ")} & ${labels.at(-1)}` : labels.join("");
}

// One message for one or more games; each game has one date and time, its own name list and counts.
export function buildGamesMessage(games) {
  if (!Array.isArray(games) || !games.length) throw new Error("Add at least one game.");
  games.forEach((game, index) => {
    try {
      validateGame(game);
    } catch (problem) {
      throw new Error(games.length > 1 ? `Game ${index + 1}: ${problem.message}` : problem.message);
    }
  });
  const numbers = games.map(game => String(game.gameNumber ?? "").trim()).filter(Boolean);
  if (new Set(numbers).size !== numbers.length) throw new Error("Each game needs a different game number.");
  const lines = [];
  if (new Set(games.map(game => game.date)).size > 1) lines.push(`⚠️ Add names with Day (i.e., ${gameDays(games.map(game => game.date))})`, "————————————-");
  lines.push("⚠️ Those who wish to join kindly copy this message, add your name and paste.", divider);
  games.forEach((game, index) => {
    if (index) lines.push(divider);
    lines.push(...gameLines(game));
  });
  return lines.join("\n");
}

export function buildGameMessage(details) {
  return buildGamesMessage([details]);
}

export function whatsappShareUrl(text) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

// Next Saturday strictly after today, following the book-a-week-ahead rule.
export function nextSaturday(today = new Date()) {
  const base = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  base.setUTCDate(base.getUTCDate() + (((6 - base.getUTCDay() + 7) % 7) || 7));
  return toIso(base);
}

function nextDay(iso) {
  if (!isoDate.test(iso)) return "";
  const date = parseDate(iso);
  date.setUTCDate(date.getUTCDate() + 1);
  return toIso(date);
}

function gameCard(game, index, total, sports, venues) {
  const id = `g${index}`;
  const option = (value, label, selected) => `<option value="${e(value)}"${selected ? " selected" : ""}>${e(label)}</option>`;
  return `<section class="game-card" data-game data-booked="${game.booked ? "true" : "false"}" aria-labelledby="${id}-title">
    <div class="game-card-head"><h3 id="${id}-title">Game ${index + 1}</h3>${total > 1 ? `<button type="button" class="remove-game" data-remove-game aria-label="Remove game ${index + 1}">Remove</button>` : ""}</div>
    <div class="form-pair">
      <div><label for="${id}-sport">Sport</label><select id="${id}-sport" data-field="sport">${sports.map(sport => option(sport.id, sport.name, sport.id === game.sport)).join("")}</select></div>
      <div><label for="${id}-number">Game number <small>(optional)</small></label><input id="${id}-number" data-field="number" type="number" min="1" step="1" inputmode="numeric" placeholder="e.g. 5" value="${e(game.number)}"></div>
    </div>
    <label for="${id}-venue">Venue</label>
    <select id="${id}-venue" data-field="venue">${option("", "TBD (not decided yet)", !game.venue)}${venues.map(venue => option(venue.id, venue.shortName || venue.name, venue.id === game.venue)).join("")}${option("other", "Other venue...", game.venue === "other")}</select>
    <div data-other-row${game.venue === "other" ? "" : " hidden"}><label for="${id}-venue-other">Venue name</label><input id="${id}-venue-other" data-field="venueOther" type="text" maxlength="60" autocomplete="off" value="${e(game.venueOther)}"></div>
    <label class="check"><input data-field="booked" type="checkbox"${game.booked ? " checked" : ""}> Venue already booked</label>
    <fieldset class="slots"><legend>Date &amp; probable time</legend>
      <div class="slot-row">
        <div><label for="${id}-date">Date</label><input id="${id}-date" type="date" data-field="date" value="${e(game.date)}" required></div>
        <div><label for="${id}-start">Start</label><input id="${id}-start" type="time" data-field="start" value="${e(game.start)}"></div>
        <div><label for="${id}-end">End</label><input id="${id}-end" type="time" data-field="end" value="${e(game.end)}"></div>
      </div>
      <label class="check"><input data-field="tentative" type="checkbox"${game.tentative ? " checked" : ""}> Time is tentative</label>
    </fieldset>
    <div class="form-pair">
      <div><label for="${id}-min">Minimum to book <small>(optional)</small></label><input id="${id}-min" data-field="min" type="number" min="1" step="1" inputmode="numeric" placeholder="${game.booked ? "Booked" : "None"}" value="${e(game.booked ? "" : game.min)}"${game.booked ? " disabled" : ""}></div>
      <div><label for="${id}-max">Count stops at</label><input id="${id}-max" data-field="max" type="number" min="1" step="1" inputmode="numeric" required value="${e(game.max)}"></div>
    </div>
    <label for="${id}-note">Extra note <small>(optional)</small></label>
    <input id="${id}-note" data-field="note" type="text" maxlength="160" autocomplete="off" placeholder="e.g. Contribution approx. 150 per head" value="${e(game.note)}">
  </section>`;
}

export function mountGamePost(config, venues) {
  const triggers = [...document.querySelectorAll("[data-post-game]")];
  if (!triggers.length) return;
  const { sports, defaultStart, defaultEnd } = config.gamePost;
  const groupLink = config.features.whatsapp ? config.links.whatsapp : "";
  const sportById = id => sports.find(sport => sport.id === id);
  let returnFocus = triggers[0];
  const firstSport = sports[0];
  let games = [{
    sport: firstSport.id, number: "", venue: "", venueOther: "", booked: false, tentative: false, note: "",
    min: firstSport.minPlayers, max: firstSport.maxPlayers,
    date: nextSaturday(), start: defaultStart, end: defaultEnd
  }];
  const dialog = document.createElement("dialog");
  dialog.id = "post-game-dialog";
  dialog.className = "booking-dialog post-game-dialog";
  dialog.setAttribute("aria-labelledby", "post-game-title");
  dialog.setAttribute("aria-describedby", "post-game-description");
  dialog.innerHTML = `<div class="panel-heading"><h2 id="post-game-title">Post a game list</h2><button type="button" id="close-post-game" aria-label="Close game list composer">&times;</button></div>
    <p id="post-game-description" class="muted">Each game has one date and time. Add more games with + Add game, then check or edit the message. Share opens WhatsApp with it ready; choose the Sportify group and send it from your own account.</p>
    <form id="post-game-form" novalidate>
      <div id="post-games"></div>
      <button type="button" id="add-game" class="add-game">+ Add game</button>
    </form>
    <div class="preview-head"><h3 class="preview-title" id="post-preview-label">Preview &amp; edit</h3><button type="button" id="post-reset" hidden>Undo my edits</button></div>
    <p id="post-error" class="post-error" role="alert" hidden></p>
    <p id="post-edit-hint" class="muted post-edit-hint">You can type in the message below to change anything before sharing.</p>
    <textarea id="post-preview" class="post-preview" rows="14" spellcheck="true" aria-labelledby="post-preview-label" aria-describedby="post-edit-hint"></textarea>
    <div class="post-actions">
      <a id="post-share" class="share-whatsapp" href="#" target="_blank" rel="noopener noreferrer">${icon("whatsapp")}<span>Share on WhatsApp</span><span class="sr-only"> (opens WhatsApp in a new tab)</span></a>
      <button type="button" id="post-copy">Copy message</button>
      ${groupLink ? `<a id="post-open-group" href="${e(groupLink)}" target="_blank" rel="noopener noreferrer">Open Sportify group<span class="sr-only"> (opens in a new tab)</span></a>` : ""}
    </div>
    <p id="post-status" class="muted post-status" role="status" aria-live="polite"></p>
    <p class="muted post-hint">On WhatsApp, pick the Sportify group, check the message, then tap Send. Copy works as a fallback: paste it into the group yourself.</p>`;
  document.body.append(dialog);
  const $ = selector => dialog.querySelector(selector);
  const form = $("#post-game-form");
  const gameList = $("#post-games");
  const preview = $("#post-preview");
  const error = $("#post-error");
  const hint = $("#post-edit-hint");
  const reset = $("#post-reset");
  const share = $("#post-share");
  const copy = $("#post-copy");
  const status = $("#post-status");
  let generated = "";
  let edited = false;

  function readGames() {
    games = [...gameList.querySelectorAll("[data-game]")].map(card => {
      const field = name => card.querySelector(`[data-field="${name}"]`);
      return {
        sport: field("sport").value, number: field("number").value.trim(), venue: field("venue").value,
        venueOther: field("venueOther").value, booked: field("booked").checked, tentative: field("tentative").checked,
        min: field("min").value, max: field("max").value, note: field("note").value,
        date: field("date").value, start: field("start").value, end: field("end").value
      };
    });
  }

  function venueName(game) {
    if (game.venue === "other") return game.venueOther;
    const venue = venues.find(item => item.id === game.venue);
    return venue ? venue.shortName || venue.name : "";
  }

  function renderGames() {
    gameList.innerHTML = games.map((game, index) => gameCard(game, index, games.length, sports, venues)).join("");
  }

  function syncCards() {
    gameList.querySelectorAll("[data-game]").forEach((card, index) => {
      const game = games[index];
      card.querySelector("[data-other-row]").hidden = game.venue !== "other";
      const booked = card.querySelector('[data-field="booked"]');
      booked.disabled = !venueName(game).trim();
      if (booked.disabled) { booked.checked = false; game.booked = false; }
      const min = card.querySelector('[data-field="min"]');
      if (String(game.booked) !== card.dataset.booked) {
        min.value = game.booked ? "" : sportById(game.sport).minPlayers;
        game.min = min.value;
        card.dataset.booked = String(game.booked);
      }
      min.disabled = game.booked;
      min.placeholder = game.booked ? "Booked" : "None";
    });
  }

  function refreshActions() {
    const text = preview.value;
    const ready = Boolean(text.trim()) && (edited || !error.textContent);
    if (ready) {
      share.href = whatsappShareUrl(text);
      share.removeAttribute("aria-disabled");
    } else {
      share.removeAttribute("href");
      share.setAttribute("aria-disabled", "true");
    }
    copy.disabled = !ready;
    reset.hidden = !edited;
    hint.textContent = edited
      ? "You edited the message, so form changes no longer update it. Use Undo my edits to rebuild it from the form."
      : "You can type in the message below to change anything before sharing.";
    hint.classList.toggle("is-edited", edited);
  }

  function update() {
    readGames();
    syncCards();
    try {
      generated = buildGamesMessage(games.map(game => ({
        sport: sportById(game.sport),
        gameNumber: game.number,
        venue: venueName(game),
        booked: game.booked,
        date: game.date,
        start: game.start,
        end: game.end,
        tentative: game.tentative,
        minPlayers: game.booked || String(game.min).trim() === "" ? null : Number(game.min),
        maxPlayers: Number(game.max),
        note: game.note
      })));
      error.textContent = "";
      error.hidden = true;
      if (!edited) preview.value = generated;
    } catch (problem) {
      generated = "";
      error.textContent = problem.message;
      error.hidden = false;
      if (!edited) preview.value = "";
    }
    status.textContent = "";
    refreshActions();
  }

  form.addEventListener("input", update);
  form.addEventListener("change", event => {
    if (event.target.dataset.field === "sport") {
      const card = event.target.closest("[data-game]");
      const sport = sportById(event.target.value);
      const booked = card.querySelector('[data-field="booked"]').checked;
      card.querySelector('[data-field="min"]').value = booked ? "" : sport.minPlayers;
      card.querySelector('[data-field="max"]').value = sport.maxPlayers;
    }
    update();
  });
  gameList.addEventListener("click", event => {
    if (!event.target.closest("[data-remove-game]")) return;
    const card = event.target.closest("[data-game]");
    readGames();
    const index = [...gameList.querySelectorAll("[data-game]")].indexOf(card);
    if (games.length > 1) games.splice(index, 1);
    renderGames();
    update();
    gameList.querySelector(`[data-game]:nth-child(${Math.max(1, index)}) select`)?.focus();
    status.textContent = `Game removed. ${games.length} game${games.length === 1 ? "" : "s"} in the message.`;
  });
  $("#add-game").addEventListener("click", () => {
    readGames();
    const last = games.at(-1);
    // A copy of the previous game on the following day; only the differences need changing.
    games.push({ ...last, number: /^\d+$/.test(last.number) ? String(Number(last.number) + 1) : "", date: nextDay(last.date), note: "" });
    renderGames();
    update();
    const added = gameList.querySelector("[data-game]:last-child");
    added.scrollIntoView({ block: "start" });
    added.querySelector("select").focus({ preventScroll: true });
    status.textContent = `Game ${games.length} added on the next day. Change what differs.`;
  });
  preview.addEventListener("input", () => {
    edited = preview.value !== generated;
    status.textContent = "";
    refreshActions();
  });
  reset.addEventListener("click", () => {
    edited = false;
    update();
    preview.focus();
    status.textContent = "Message rebuilt from the form.";
  });
  share.addEventListener("click", event => {
    if (share.getAttribute("aria-disabled") === "true") event.preventDefault();
  });
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(preview.value);
      status.textContent = "Message copied. Open the Sportify group and paste it.";
    } catch (problem) {
      console.error("[Sportify game post] Clipboard copy failed.", problem);
      preview.focus();
      preview.select();
      status.textContent = "Copy was blocked by the browser. The message is selected: copy it manually.";
    }
  });

  function open(source) {
    returnFocus = source;
    dialog.showModal();
    dialog.scrollTop = 0;
    gameList.querySelector("select").focus();
  }
  for (const trigger of triggers) trigger.addEventListener("click", () => open(trigger));
  $("#close-post-game").addEventListener("click", () => dialog.close());
  dialog.addEventListener("keydown", event => {
    if (event.key === "Escape" && !event.defaultPrevented) {
      event.preventDefault();
      dialog.close();
    }
  });
  dialog.addEventListener("close", () => returnFocus.focus());
  dialog.addEventListener("click", event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });

  renderGames();
  update();
  openFromLink(dialog, "#post-game", () => open(triggers[0]));
}
