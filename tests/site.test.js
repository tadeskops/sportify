import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import config from "../config/site.js";
import { validateConfig, appearanceEnabled, featureNames } from "../assets/js/config.js";
import { resolvePreferences } from "../assets/js/appearance.js";
import { generalRules } from "../assets/js/general.js";
import { footballRules, footballSource } from "../assets/js/football.js";
import { matchingRules, renderSections } from "../assets/js/rulebook.js";
import { escapeHtml } from "../assets/js/dom.js";
import { renderBookingGuide, renderContact, renderVenueDirectory, renderVenueSteps } from "../assets/js/venues.js";
import { build } from "../scripts/build.mjs";

test("configuration validates booleans, names, URLs and appearance defaults", () => {
  assert.equal(validateConfig(config), config);
  for (const name of featureNames) {
    const changed = structuredClone(config);
    changed.features[name] = "true";
    assert.throws(() => validateConfig(changed), /must be true or false/);
    changed.features[name] = false;
    assert.equal(validateConfig(changed), changed);
  }
  const typo = structuredClone(config);
  typo.features.fonts = true;
  assert.throws(() => validateConfig(typo), /Unknown feature/);
  const unsafe = structuredClone(config);
  unsafe.links.whatsapp = "javascript:alert(1)";
  assert.throws(() => validateConfig(unsafe), /valid HTTPS/);
  const delay = structuredClone(config);
  delay.appearance.idleDelayMs = 0;
  assert.throws(() => validateConfig(delay), /idle delay/);
  assert.equal(config.links.whatsapp, "https://chat.whatsapp.com/JLOrS75EOh9KTsF0OOIRYF");
  assert.equal(config.links.instagram, "https://www.instagram.com/theaddress_society");
});

test("disabled appearance controls ignore stale persisted preferences", () => {
  const saved = { theme: "dark", font: "modern", size: "large" };
  assert.equal(config.appearance.defaultTheme, "light");
  assert.deepEqual(resolvePreferences(config), { theme: "light", font: "classic", size: "standard" });
  assert.equal(config.features.fontPicker, false);
  assert.deepEqual(resolvePreferences(config, saved), { ...saved, font: "classic" });
  const withFontPicker = structuredClone(config);
  withFontPicker.features.fontPicker = true;
  assert.deepEqual(resolvePreferences(withFontPicker, saved), saved);
  const changed = structuredClone(config);
  changed.features.themePicker = false;
  assert.equal(resolvePreferences(changed, saved).theme, "light");
  changed.features.appearance = false;
  assert.equal(appearanceEnabled(changed), false);
  assert.deepEqual(resolvePreferences(changed, saved), { theme: "light", font: "classic", size: "standard" });
  changed.features.appearance = true;
  changed.features.fontPicker = false;
  changed.features.textSize = false;
  assert.equal(appearanceEnabled(changed), false);
  assert.deepEqual(resolvePreferences(config, { theme: "invalid" }), { theme: "light", font: "classic", size: "standard" });
  const privateVisit = structuredClone(config);
  privateVisit.features.rememberPreferences = false;
  assert.deepEqual(resolvePreferences(privateVisit, saved), { theme: "light", font: "classic", size: "standard" });
});

test("venue configuration allows reviewed entries and rejects unsafe or ambiguous listings", () => {
  const changed = structuredClone(config);
  assert.equal(changed.venues[0].url, "https://book.playspots.in/venues/4-lions-academy-pimple");
  changed.venues[0].enabled = false;
  assert.equal(validateConfig(changed), changed);
  changed.venues.push({ ...changed.venues[0] });
  assert.throws(() => validateConfig(changed), /unique lowercase slugs/);
  changed.venues.pop();
  changed.venues[0].url = "http://example.com/turf";
  assert.throws(() => validateConfig(changed), /must use HTTPS/);
  changed.venues[0].url = config.venues[0].url;
  changed.venues[0].contact = { name: "Public venue desk", phone: "+12025550100" };
  assert.equal(validateConfig(changed), changed);
  changed.venues[0].contact.phone = "javascript:alert(1)";
  assert.throws(() => validateConfig(changed), /international format/);
  changed.venues = [];
  assert.equal(validateConfig(changed), changed);
});

test("optional attendant contacts are safely rendered only when supplied", () => {
  assert.equal(renderContact(undefined), "");
  assert.equal(renderContact({ name: "", phone: "" }), "");
  assert.match(renderContact({ name: "Public desk", phone: "+12025550100" }), /href="tel:\+12025550100"/);
  assert.match(renderContact({ name: "<script>", phone: "" }), /&lt;script&gt;/);
  assert.doesNotMatch(renderContact({ name: "Public desk", phone: "" }), /tel:/);
  const directory = renderVenueDirectory(config.venues, true);
  assert.match(directory, /4 Lions Academy - Pimple Nilakh/);
  assert.match(directory, /https:\/\/book.playspots.in\/venues\/4-lions-academy-pimple/);
  assert.doesNotMatch(directory, /Venue attendant/);
});

test("general rules focus on joining and keep monthly booking rotation configurable", () => {
  const general = generalRules(config.features);
  assert.equal(general.length, 6);
  assert.ok(general.every(section => section.id !== "equipment"));
  assert.equal(general[0].id, "joining");
  const text = JSON.stringify(general);
  assert.ok(general.every(section => section.blocks.every(block => Array.isArray(block.bullets))));
  assert.doesNotMatch(text, /following week/);
  const withoutJoinGuide = generalRules({ ...config.features, join: false });
  assert.match(JSON.stringify(withoutJoinGuide), /following week/);
  assert.match(text, /No individual is its owner/);
  assert.match(text, /rotate monthly/);
  assert.doesNotMatch(JSON.stringify(generalRules({ ...config.features, monthlyRotation: false })), /Monthly booking responsibility|rotate monthly/);
  assert.deepEqual(matchingRules(general, "   MAIN   LIST ").map(section => section.id), ["joining"]);
  assert.deepEqual(matchingRules(withoutJoinGuide, "planned games").map(section => section.id), ["joining"]);
  assert.equal(matchingRules(general, "no-such-rule-zzzz").length, 0);
  assert.equal(matchingRules(general, "").length, general.length);
});

test("general guidelines use concise, nonduplicated points", () => {
  const points = generalRules(config.features).flatMap(section => section.blocks.flatMap(block => block.bullets));
  assert.equal(new Set(points).size, points.length);
  for (const point of points) assert.ok(point.split(/\s+/).length <= 25, point);
  assert.ok(points.join(" ").split(/\s+/).length <= 650);
});

test("booking guidance keeps all four steps and respects monthly rotation", () => {
  const guide = renderBookingGuide(true);
  assert.equal((guide.match(/<li>/g) || []).length, 4);
  assert.match(guide, /month's booking coordinators check/);
  assert.match(guide, /cancellation, rescheduling and weather\/refund/);
  assert.match(guide, /Keep private receipts/);
  const withoutRotation = renderBookingGuide(false);
  assert.doesNotMatch(withoutRotation, /month's/);
  assert.match(withoutRotation, /Agree a session coordinator to check that/);
});

test("venue-specific provider steps show the five-step route and confirmation reminder", () => {
  const html = renderVenueSteps(config.venues[0]);
  assert.equal((html.match(/<li>/g) || []).length, 5);
  for (const text of ["calendar icon", "Cricket, then Cricket 6A", "8-9:30", "AM/PM", "advance", "Notify the game group"]) assert.ok(html.includes(text));
  assert.equal(renderVenueSteps({ provider: "Other venue" }), "");
  assert.match(renderVenueSteps({ provider: "<test>", bookingSteps: ["<script>"] }), /&lt;script&gt;/);
  for (const bookingSteps of [[], [" "], "invalid", [null]]) {
    const changed = structuredClone(config);
    changed.venues[0].bookingSteps = bookingSteps;
    assert.throws(() => validateConfig(changed), /bookingSteps/);
  }
});

test("one size preference scales typography without fixed-pixel font overrides", async () => {
  const css = await readFile(new URL("../assets/css/site.css", import.meta.url), "utf8");
  assert.match(css, /:root\[data-size="large"\]\s*\{[^}]*font-size:\s*120%/);
  for (const declaration of css.matchAll(/font(?:-size)?\s*:\s*([^;}]+)/g)) {
    assert.doesNotMatch(declaration[1], /\dpx/, declaration[0]);
  }
  assert.equal(config.features.fontPicker, false);
  assert.equal(config.appearance.defaultFont, "classic");
});

test("Ivory gold is the HTML, CSS and configured default in every viewport", async () => {
  const [html, css] = await Promise.all([
    readFile(new URL("../index.html", import.meta.url), "utf8"),
    readFile(new URL("../assets/css/site.css", import.meta.url), "utf8")
  ]);
  assert.equal(config.appearance.defaultTheme, "light");
  assert.match(html, /<html[^>]+data-theme="light"/);
  assert.match(html, /name="theme-color" content="#faf7ef"/);
  assert.match(css, /:root\s*\{[^}]*color-scheme:\s*light;[^}]*--bg:\s*#faf7ef/);
  assert.match(css, /:root\[data-theme="dark"\]/);
});

test("football retains all five source sections and exact sport-specific requirements", () => {
  assert.equal(footballRules.length, 5);
  const text = JSON.stringify(footballRules);
  for (const rule of [
    "Substitutions occur every 5 minutes in a cyclic rotation",
    "Players receive a sequence number (1–6) upon first substitution",
    "Players may re-substituted only after all 6 complete one full rotation",
    "Players preferring a single substitution should inform the captain before kickoff and will play one 15-minute shift",
    "Cannot say NO to goal keeping if asked upon or required. (Shall be executed rotation bases)",
    "Payment required, no penalties applied, except for the unavoidable-circumstances exemption below.",
    "For that match, the contribution will be equally divided among the remaining players (Total Players – 1)."
  ]) assert.ok(text.includes(rule), rule);
  assert.equal(footballSource.updated, "18 April, 2026");
  for (const title of ["1.1.3 Game Participation inclusivity", "1.4.4 Communicated Absence:", "2.2 Turf Payment Management", "3.3 Conflict Resolution", "4.4 On-Field Conduct", "5.5 Accountability"]) {
    assert.ok(footballRules.some(section => section.blocks.some(block => block.title === title)), title);
  }
  assert.equal(new Set(footballRules.map(section => section.id)).size, footballRules.length);
});

test("unavoidable circumstances exclude players from contributions in both rule books", () => {
  for (const rules of [generalRules(config.features), footballRules]) {
    const text = JSON.stringify(rules);
    assert.match(text, /player is excluded from the contribution share/);
    assert.match(text, /even without a replacement or after contribution details have been shared/);
    assert.doesNotMatch(text, /not adjusted afterwards|shall not be adjusted|does not waive an unrecovered/);
  }
});

test("rendering escapes rule content and prefixes anchors by sport", () => {
  assert.equal(escapeHtml('<a href="x">&'), "&lt;a href=&quot;x&quot;&gt;&amp;");
  const html = renderSections(footballRules, "football");
  assert.match(html, /id="football-substitution"/);
  assert.equal((html.match(/<details /g) || []).length, 5);
  assert.equal((html.match(/ open>/g) || []).length, 1);
});

test("build publishes allowlisted static files, never demos or repository context", async () => {
  const destination = await mkdtemp(join(tmpdir(), "sportify-build-"));
  try {
    await build(destination);
    assert.deepEqual((await readdir(destination)).sort(), [".nojekyll", "assets", "config", "index.html"]);
    const html = await readFile(join(destination, "index.html"), "utf8");
    assert.match(html, /src="assets\/js\/boot.js"/);
    assert.doesNotMatch(html, /temp\//);
    const workflow = await readFile(new URL("../.github/workflows/pages.yml", import.meta.url), "utf8");
    assert.match(workflow, /branches: \[main\]/);
    assert.match(workflow, /path: dist/);
    assert.match(workflow, /actions\/deploy-pages@v4/);
    await writeFile(join(destination, "CONTEXT.md"), "Not public");
    await assert.rejects(build(destination), /Unexpected files in publish output: CONTEXT.md/);
  } finally {
    await rm(destination, { recursive: true });
  }
});
