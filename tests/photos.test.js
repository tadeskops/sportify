import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import config from "../config/site.js";
import { validateConfig } from "../assets/js/config.js";
import { activePhotos } from "../assets/js/photo-booth.js";
import { expiresAfterThreeMonths, scanPhotos, cleanupPhotos } from "../scripts/photos.mjs";
import { build } from "../scripts/build.mjs";

test("three calendar months retain UTC time and clamp month-end/leap dates", () => {
  for (const [start, end] of [
    ["2026-10-17T08:00:00.000Z", "2027-01-17T08:00:00.000Z"],
    ["2026-01-31T08:00:00.000Z", "2026-04-30T08:00:00.000Z"],
    ["2023-11-30T08:00:00.000Z", "2024-02-29T08:00:00.000Z"],
    ["2024-11-30T08:00:00.000Z", "2025-02-28T08:00:00.000Z"]
  ]) assert.equal(expiresAfterThreeMonths(start), end);
  assert.throws(() => expiresAfterThreeMonths("not a date"), /Invalid photo addition date/);
});

test("photo config validates rotation controls and rejects invalid intervals", () => {
  for (const intervalMs of [0, 2999, 6000.5, "6000"]) {
    const changed = structuredClone(config);
    changed.photoBooth.intervalMs = intervalMs;
    assert.throws(() => validateConfig(changed), /Photo booth/);
  }
  const changed = structuredClone(config);
  changed.photoBooth.autoRotate = false;
  changed.features.photoBooth = false;
  assert.equal(validateConfig(changed), changed);
  changed.photoBooth.autoRotate = "yes";
  assert.throws(() => validateConfig(changed), /Photo booth/);
});

test("discovery, exact expiration, safe cleanup and rebuild remove stale deployed photos", async () => {
  const fixture = await mkdtemp(join(tmpdir(), "sportify-photos-"));
  const directory = join(fixture, "source");
  const destination = join(fixture, "output");
  try {
    await mkdir(directory);
    await writeFile(join(directory, ".gitkeep"), "");
    const pixel = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=", "base64");
    await writeFile(join(directory, "match-one.png"), pixel);
    await writeFile(join(directory, "event two.PNG"), pixel);
    const firstAdded = async file => file === "match-one.png" ? "2026-07-17T08:00:00Z" : "2026-08-17T08:00:00Z";
    const options = { directory, now: new Date("2026-10-17T07:59:59.999Z"), firstAdded };
    let photos = await scanPhotos(options);
    assert.equal(photos.length, 2);
    assert.ok(photos.every(photo => !photo.expired));
    assert.equal(photos[0].src, "assets/photos/event%20two.PNG");
    assert.equal(photos[1].title, "match one");
    await build(destination, options);
    assert.equal((await readdir(join(destination, "assets", "photos"))).length, 2);
    const enabled = config.features.photoBooth;
    try {
      config.features.photoBooth = false;
      await build(destination, options);
      assert.deepEqual(JSON.parse(await readFile(join(destination, "assets", "photo-booth.json"), "utf8")), []);
      assert.deepEqual(await readdir(join(destination, "assets", "photos")), []);
    } finally {
      config.features.photoBooth = enabled;
    }
    options.now = new Date("2026-10-17T08:00:00Z");
    await build(destination, options);
    assert.deepEqual(await readdir(join(destination, "assets", "photos")), ["event two.PNG"]);
    const manifest = JSON.parse(await readFile(join(destination, "assets", "photo-booth.json"), "utf8"));
    assert.equal(manifest.length, 1);
    assert.deepEqual(activePhotos(photos, options.now.getTime()).map(photo => photo.file), ["event two.PNG"]);
    assert.deepEqual(await cleanupPhotos(options), ["match-one.png"]);
    assert.deepEqual((await readdir(directory)).sort(), [".gitkeep", "event two.PNG"]);
    assert.deepEqual(await cleanupPhotos(options), []);
    options.now = new Date("2026-11-17T08:00:00Z");
    assert.deepEqual(await cleanupPhotos(options), ["event two.PNG"]);
    await build(destination, options);
    assert.deepEqual(JSON.parse(await readFile(join(destination, "assets", "photo-booth.json"), "utf8")), []);
    assert.deepEqual(await readdir(join(destination, "assets", "photos")), []);
    await writeFile(join(directory, "unapproved.svg"), "<svg/>");
    await assert.rejects(scanPhotos(options), /Unsupported photo entry/);
  } finally {
    await rm(fixture, { recursive: true });
  }
});

test("manifest rejects invalid entries instead of silently treating them as an empty gallery", () => {
  assert.deepEqual(activePhotos([]), []);
  assert.throws(() => activePhotos({}), /must be an array/);
  assert.throws(() => activePhotos([{ src: "https://untrusted.example/photo.jpg" }]), /Invalid photo/);
  assert.throws(() => activePhotos([{ src: "assets/photos/photo.jpg", title: "Test", alt: "Test", addedAt: "bad", expiresAt: "bad" }]), /Invalid photo/);
});

test("daily cleanup precedes publication and has narrowly scoped deletion commits", async () => {
  const workflow = await readFile(new URL("../.github/workflows/pages.yml", import.meta.url), "utf8");
  assert.match(workflow, /cron: "17 3 \* \* \*"/);
  assert.match(workflow, /needs: cleanup/);
  assert.match(workflow, /fetch-depth: 0/);
  assert.match(workflow, /git add -u -- assets\/photos/);
  assert.match(workflow, /node scripts\/photos.mjs/);
});
