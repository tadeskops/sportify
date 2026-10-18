import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import config from "../config/site.js";
import { validateConfig, appearanceEnabled, featureNames } from "../assets/js/config.js";
import { resolvePreferences } from "../assets/js/appearance.js";
import { generalRules, turfBookingGuidelines } from "../assets/js/general.js";
import { footballRules, footballSource } from "../assets/js/football.js";
import { indexRules, matchingRules, renderSections, ruleBookCodes, ruleRefPattern } from "../assets/js/rulebook.js";
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
  assert.equal(general.length, 7);
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

test("organise-a-game guides explain posting and booking with only enabled links", () => {
  const all = { postGame: true, bookTurf: "#book-turf", whatsapp: config.links.whatsapp };
  const organise = indexRules(generalRules(config.features, all), "G").find(section => section.id === "organise");
  assert.equal(organise.ref, "G7");
  const [post, book] = organise.blocks;
  assert.deepEqual([post.ref, post.title, book.ref, book.title], ["G7.1", "Prepare and post the game list", "G7.2", "Book the turf"]);
  assert.match(post.bullets.join(" "), /\+ Add game.*Sat & Sun.*Share on WhatsApp/s);
  assert.match(book.bullets[0], /minimum count/);
  assert.deepEqual(post.links.map(link => link.href), ["#post-game", config.links.whatsapp]);
  assert.deepEqual(book.links.map(link => link.href), ["#book-turf", "#G3.3"]);
  const html = renderSections([organise], "general");
  assert.match(html, /<p class="rule-links"><a href="#post-game">Post a game/);
  assert.match(html, /href="https:\/\/chat\.whatsapp\.com\/[^"]+" target="_blank" rel="noopener noreferrer">Open Sportify group/);

  const bare = generalRules({ ...config.features, gamePost: false }).find(section => section.id === "organise");
  assert.deepEqual(bare.blocks[0].links, []);
  assert.deepEqual(bare.blocks[1].links.map(link => link.href), ["#G3.3"]);
  assert.match(bare.blocks[0].bullets.join(" "), /add names with the day/);
  assert.doesNotMatch(JSON.stringify(bare), /Post a game|Book a turf,/);
  const directory = generalRules(config.features, { bookTurf: "#venues" }).find(section => section.id === "organise");
  assert.equal(directory.blocks[1].links[0].href, "#venues");
});

test("general guidelines use concise, nonduplicated points", () => {
  for (const links of [{}, { postGame: true, bookTurf: "#book-turf", whatsapp: config.links.whatsapp }]) {
    const sections = generalRules(config.features, links);
    const words = list => list.join(" ").split(/\s+/).length;
    const pointsOf = list => list.flatMap(section => section.blocks.flatMap(block => block.bullets));
    const points = pointsOf(sections);
    assert.equal(new Set(points).size, points.length);
    for (const point of points) assert.ok(point.split(/\s+/).length <= 25, point);
    // Rules stay short; the step-by-step organise guides (G7) have their own budget.
    assert.ok(words(pointsOf(sections.filter(section => section.id !== "organise"))) <= 650);
    assert.ok(words(pointsOf(sections.filter(section => section.id === "organise"))) <= 230);
  }
});

test("booking guidance includes management policies and respects monthly rotation", () => {
  const guide = renderBookingGuide(true);
  assert.equal((guide.match(/<li>/g) || []).length, 10);
  assert.match(guide, /month's booking coordinators/);
  const management = generalRules(config.features).find(section => section.id === "coordination")
    .blocks.find(block => block.title === "Turf booking management");
  assert.deepEqual(management.bullets, turfBookingGuidelines);
  for (const point of turfBookingGuidelines) assert.ok(guide.includes(escapeHtml(point)));
  assert.match(guide, /one week in advance/);
  assert.match(guide, /Friday/);
  assert.match(guide, /booker must cancel at least 24 hours/);
  assert.match(guide, /game moderator is the person who booked the turf/);
  assert.match(guide, /recheck the listed player count 24 hours before the game/);
  assert.match(guide, /arrange any necessary booking changes/);
  assert.match(guide, /cancellation, rescheduling and weather\/refund/);
  assert.match(guide, /Keep private receipts/);
  const withoutRotation = renderBookingGuide(false);
  assert.doesNotMatch(withoutRotation, /month's/);
  assert.match(withoutRotation, /Agree a session coordinator to/);
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

test("hero badge has an isolated theme-aware rim with smooth, reduced-motion-safe rotation", async () => {
  const [app, css] = await Promise.all([
    readFile(new URL("../assets/js/app.js", import.meta.url), "utf8"),
    readFile(new URL("../assets/css/site.css", import.meta.url), "utf8")
  ]);
  assert.match(app, /class="hero-badge"><img[^>]+alt="Sportify community sports badge"[^>]*><span class="hero-badge-rim" aria-hidden="true"><\/span><\/div><span>MANY SPORTS/);
  assert.match(css, /\.hero-badge-rim\s*\{[^}]*pointer-events:\s*none;[^}]*filter:\s*drop-shadow/);
  assert.match(css, /\.hero-badge-rim::before\s*\{[^}]*conic-gradient\([^;]*var\(--accent\)[^}]*animation:\s*hero-badge-orbit 7s linear infinite;/);
  assert.match(css, /@keyframes hero-badge-orbit\s*\{\s*to\s*\{\s*transform:\s*rotate\(360deg\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)\s*\{[^}]*\.hero-badge-rim::before\s*\{\s*animation:\s*none;/);
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
  assert.throws(() => renderSections(footballRules, "football"), /Index rule sections/);
  const html = renderSections(indexRules(footballRules, "F"), "football");
  assert.match(html, /id="football-substitution"/);
  assert.equal((html.match(/<details /g) || []).length, 5);
  assert.equal((html.match(/ open>/g) || []).length, 1);
  assert.match(html, /<h3 class="accordion-title" id="F1"><span class="section-number">F1<\/span><span>Participation Guidelines/);
  assert.match(html, /id="F1.1.2">\s*<h4><a class="rule-ref" href="#F1.1.2" data-rule-ref="F1.1.2"[^>]*>F1.1.2<\/a> Guest Players<\/h4>/);
  assert.match(html, /<li class="rule-point" id="F2.2.1"><a[^>]*>F2.2.1<\/a> Rotation Basis:/);
});

test("every rule, sub-rule and point has a unique, stable shareable reference", () => {
  assert.equal(ruleBookCodes.general, "G");
  assert.equal(ruleBookCodes.football, "F");
  const codes = Object.values(ruleBookCodes);
  assert.equal(new Set(codes).size, codes.length);
  const sportInitials = config.gamePost.sports.map(sport => sport.name[0].toUpperCase());
  assert.ok(!sportInitials.includes(ruleBookCodes.general), "General prefix must not be a sport initial");
  for (const sport of config.gamePost.sports) assert.equal(ruleBookCodes[sport.id], sport.name[0].toUpperCase(), sport.id);

  const refsOf = sections => sections.flatMap(section => [section.ref, ...section.blocks.flatMap(block => [block.ref, ...block.points.map(point => point.ref)])]).filter(Boolean);
  const general = indexRules(generalRules(config.features), "G");
  const generalRefs = refsOf(general);
  assert.equal(new Set(generalRefs).size, generalRefs.length);
  assert.ok(generalRefs.every(ref => ruleRefPattern.test(ref)));
  assert.deepEqual(general.map(section => section.ref), ["G1", "G2", "G3", "G4", "G5", "G6", "G7"]);
  const joining = general[0].blocks;
  assert.deepEqual(joining.map(block => [block.ref, block.title]), [["G1.1", "Main List & Waitlist"], ["G1.2", "Guests"]]);
  assert.deepEqual(joining[0].points.map(point => point.ref), ["G1.1.1", "G1.1.2", "G1.1.3", "G1.1.4"]);
  assert.equal(general[5].blocks[0].points[0].ref, "G6.1.1");
  // Optional content never renumbers the rules around it.
  const fallback = indexRules(generalRules({ ...config.features, join: false, monthlyRotation: false }), "G");
  assert.deepEqual(fallback[0].blocks.map(block => block.ref), ["G1.1", "G1.2", "G1.3"]);
  assert.deepEqual(fallback[2].blocks.map(block => block.ref), ["G3.1", "G3.3", "G3.4"]);
  assert.deepEqual(general[2].blocks.map(block => block.ref), ["G3.1", "G3.2", "G3.3", "G3.4"]);

  const football = indexRules(footballRules, "F");
  const footballRefs = refsOf(football);
  assert.equal(new Set(footballRefs).size, footballRefs.length);
  const byRef = new Map(football.flatMap(section => section.blocks.flatMap(block => [[block.ref, block], ...block.points.map(point => [point.ref, point])])));
  assert.equal(byRef.get("F1.1.2").displayTitle, "Guest Players");
  assert.equal(byRef.get("F1.1.2.4").text, "Multiple guests must join the Waitlist");
  assert.equal(byRef.get("F2.2.3").text, "Payment Disclosure: Payment details (amount and payer name) must be shared in the group within 2–3 hours after the game");
  assert.equal(byRef.get("F4.1.7").title, "Alternative Option:");
  assert.match(byRef.get("F1.4.4.2").text, /excluded from the contribution share/);
  assert.equal(football[0].displayTitle, "Participation Guidelines");
  assert.deepEqual(matchingRules(football, "f4.1.7").map(section => section.ref), ["F4"]);

  assert.throws(() => indexRules([{ id: "x", title: "X", caption: "", blocks: [{ title: "Untitled number", bullets: ["a"] }] }], "G"), /needs a number/);
  assert.throws(() => indexRules([{ id: "x", title: "X", caption: "", blocks: [{ number: "1.1", bullets: ["a"] }, { number: "1.1", bullets: ["b"] }] }], "G"), /Duplicate rule reference G1.1/);
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
