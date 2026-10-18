import test from "node:test";
import assert from "node:assert/strict";
import config from "../config/site.js";
import { validateConfig } from "../assets/js/config.js";
import { buildGameMessage, buildGamesMessage, formatDateLabel, gameDays, formatTimeRange, nextSaturday, whatsappShareUrl } from "../assets/js/game-post.js";

const cricket = config.gamePost.sports.find(sport => sport.id === "cricket");
const base = { sport: cricket, venue: "4 Lions", booked: false, minPlayers: 8, maxPlayers: 8 };

test("a game message matches the group's existing template with Venue wording", () => {
  const message = buildGameMessage({ ...base, gameNumber: "5", date: "2026-10-25", start: "07:30", end: "09:00" });
  assert.equal(message, [
    "⚠️ Those who wish to join kindly copy this message, add your name and paste.",
    "——————————-",
    "Game 5: Cricket",
    "Venue: 4 Lions (Not booked)",
    "Date: 25 Oct Sun",
    "Time: 7:30-9 AM (1.5 Hrs)",
    "",
    "1. ",
    "",
    "🚨 Minimum count required to book the venue: 8 🛑",
    "Count stops at 8 🛑"
  ].join("\n"));
});

test("TBD venue, TBD time, tentative flag and note", () => {
  const lines = buildGameMessage({ ...base, venue: "", booked: true, tentative: true, note: "Contribution approx. 150", date: "2026-10-24", start: "", end: "" }).split("\n");
  assert.ok(lines.includes("Game: Cricket"));
  assert.ok(lines.includes("Venue: TBD (Not booked)"), "TBD venue can never be shown as booked");
  assert.equal(lines[lines.indexOf("Date: 24 Oct Sat") + 1], "Time: TBD (tentative)");
  assert.ok(lines.includes("Contribution approx. 150"));
  assert.ok(!lines.some(line => line.includes("Add names with Day")), "one date per game needs no day choice");
  const booked = buildGameMessage({ ...base, booked: true, tentative: true, date: "2026-10-24", start: "07:30", end: "09:00" });
  assert.match(booked, /Venue: 4 Lions \(Booked\)\nDate: 24 Oct Sat\nTime: 7:30-9 AM \(1.5 Hrs\) \(tentative\)/);
});

test("several games share one message, each with one date, its own list and counts", () => {
  const football = config.gamePost.sports.find(sport => sport.id === "football");
  const message = buildGamesMessage([
    { ...base, gameNumber: "5", date: "2026-10-24", start: "07:30", end: "09:00" },
    { sport: football, gameNumber: "6", venue: "", minPlayers: 8, maxPlayers: 10, date: "2026-10-25", start: "18:00", end: "19:00" }
  ]);
  const lines = message.split("\n");
  assert.deepEqual(lines.slice(0, 4), ["⚠️ Add names with Day (i.e., Sat & Sun)", "————————————-", "⚠️ Those who wish to join kindly copy this message, add your name and paste.", "——————————-"]);
  assert.equal(lines.filter(line => line === "1. ").length, 2);
  assert.equal(lines.filter(line => line.startsWith("Date: ")).length, 2);
  const second = lines.indexOf("Game 6: Football");
  assert.deepEqual(lines.slice(second - 2, second), ["Count stops at 8 🛑", "——————————-"], "no blank line before the divider");
  assert.ok(lines.indexOf("Count stops at 8 🛑") < second);
  assert.deepEqual(lines.slice(second + 1), [
    "Venue: TBD (Not booked)", "Date: 25 Oct Sun", "Time: 6-7 PM (1 Hr)", "", "1. ", "",
    "🚨 Minimum count required to book the venue: 8 🛑", "Count stops at 10 🛑"
  ]);
  const single = { ...base, gameNumber: "5", date: "2026-10-25", start: "07:30", end: "09:00" };
  assert.equal(buildGamesMessage([single]), buildGameMessage(single));
  assert.ok(!buildGamesMessage([single, { ...single, gameNumber: "6", sport: football }]).includes("Add names with Day"), "games on the same date need no day line");
  assert.throws(() => buildGamesMessage([]), /at least one game/);
  assert.throws(() => buildGamesMessage([single, { ...single, gameNumber: "6", date: "" }]), /^Error: Game 2: Choose a date/);
  assert.throws(() => buildGamesMessage([single, { ...single, gameNumber: "6", end: "" }]), /^Error: Game 2: Enter both start and end/);
  assert.throws(() => buildGamesMessage([single, single]), /different game number/);
});

test("day line lists each game day in date order", () => {
  assert.equal(gameDays(["2026-10-25", "2026-10-24"]), "Sat & Sun");
  assert.equal(gameDays(["2026-10-24", "2026-10-19", "2026-10-25", "2026-10-24"]), "Mon, Sat & Sun");
  assert.equal(gameDays(["2026-10-31", "2026-10-24"]), "24 Oct Sat & 31 Oct Sat");
  const games = ["2026-10-25", "2026-10-19", "2026-10-24"].map((date, index) => ({ ...base, gameNumber: String(index + 1), date }));
  assert.equal(buildGamesMessage(games).split("\n")[0], "⚠️ Add names with Day (i.e., Mon, Sat & Sun)");
});

test("time and date formatting handles meridiem, durations and invalid input", () => {
  assert.equal(formatTimeRange("06:00", "07:00"), "6-7 AM (1 Hr)");
  assert.equal(formatTimeRange("11:00", "12:30"), "11 AM-12:30 PM (1.5 Hrs)");
  assert.equal(formatTimeRange("18:15", "20:00"), "6:15-8 PM (1.75 Hrs)");
  assert.throws(() => formatTimeRange("09:00", "07:30"), /after the start/);
  assert.equal(formatDateLabel("2026-01-04"), "4 Jan Sun");
  assert.throws(() => formatDateLabel("2026-02-30"), /valid date/);
  assert.throws(() => buildGameMessage({ ...base, date: "2026-10-24", start: "09:00", end: "07:30" }), /after the start/);
  assert.throws(() => buildGameMessage({ ...base, maxPlayers: 4, date: "2026-10-24" }), /at least the minimum/);
});

test("share link and next Saturday helper", () => {
  const url = new URL(whatsappShareUrl("Game: Cricket & co\n1. "));
  assert.equal(url.origin, "https://wa.me");
  assert.equal(url.searchParams.get("text"), "Game: Cricket & co\n1. ");
  assert.equal(nextSaturday(new Date(2026, 9, 18)), "2026-10-24");
  assert.equal(nextSaturday(new Date(2026, 9, 24)), "2026-10-31");
  assert.equal(nextSaturday(new Date(2026, 9, 21)), "2026-10-24");
});
test("game post configuration is validated", () => {
  assert.deepEqual(config.gamePost.sports.map(sport => sport.name), ["Cricket", "Football", "Badminton", "Table Tennis"]);
  const changed = structuredClone(config);
  changed.gamePost.sports[0].maxPlayers = 2;
  assert.throws(() => validateConfig(changed), /maxPlayers >= minPlayers/);
  const dup = structuredClone(config);
  dup.gamePost.sports.push({ ...dup.gamePost.sports[0] });
  assert.throws(() => validateConfig(dup), /unique lowercase slugs/);
  const times = structuredClone(config);
  times.gamePost.defaultEnd = "07:00";
  assert.throws(() => validateConfig(times), /later defaultEnd/);
  const venue = structuredClone(config);
  venue.venues[0].shortName = " ";
  assert.throws(() => validateConfig(venue), /shortName/);
});
