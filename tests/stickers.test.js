import test from "node:test";
import assert from "node:assert/strict";
import { stickerCatalog, stickerFormats, prepareStickerFile, shareStickerFile, renderStickerSection } from "../assets/js/stickers.js";
import { readFile } from "node:fs/promises";

test("sticker catalog offers both unique animations in all animated formats", () => {
  assert.deepEqual(stickerCatalog.map(sticker => sticker.id), ["sports-action", "feeling-sportified"]);
  for (const sticker of stickerCatalog) {
    for (const format of Object.keys(stickerFormats)) {
      assert.match(sticker[format], new RegExp(`^assets/stickers/.+\\.${format}$`));
    }
  }
});

test("file preparation preserves original animated bytes and correct filename/type", async () => {
  const bytes = new Uint8Array([82, 73, 70, 70, 1, 2, 3]);
  for (const format of Object.keys(stickerFormats)) {
    const file = await prepareStickerFile(stickerCatalog[0], format, async source => {
      assert.equal(source, stickerCatalog[0][format]);
      return new Response(bytes);
    });
    assert.equal(file.name, `sportify_sports_action.${format}`);
    assert.equal(file.type, stickerFormats[format].type);
    assert.deepEqual(new Uint8Array(await file.arrayBuffer()), bytes);
  }
  await assert.rejects(prepareStickerFile(stickerCatalog[0], "png"), /available sticker format/);
  await assert.rejects(prepareStickerFile(stickerCatalog[0], "webp", async () => new Response(null, { status: 404 })), /could not be loaded/);
  await assert.rejects(prepareStickerFile(stickerCatalog[0], "webp", async () => new Response()), /empty/);
});

test("native sharing sends the actual file, never a URL or flattened preview", async () => {
  const file = new File(["animated"], "sticker.webp", { type: "image/webp" });
  let shared;
  assert.equal(await shareStickerFile(file, {
    canShare: data => data.files[0] === file,
    share: async data => { shared = data; }
  }), "shared");
  assert.deepEqual(shared, { files: [file] });
  assert.equal(await shareStickerFile(file, {}), "unsupported");
  assert.equal(await shareStickerFile(file, { share: async () => {}, canShare: () => false }), "unsupported");
  assert.equal(await shareStickerFile(file, { canShare: () => true, share: async () => { throw new DOMException("Cancelled", "AbortError"); } }), "cancelled");
  await assert.rejects(shareStickerFile(file, { canShare: () => true, share: async () => { throw new Error("Sharing failed"); } }), /Sharing failed/);
});

test("the compact section is feature-gated and has labelled selection, preview and file actions", () => {
  assert.equal(renderStickerSection(false), "");
  const html = renderStickerSection(true);
  assert.match(html, /id="stickers"/);
  assert.match(html, /label for="sticker-choice"/);
  assert.match(html, /label for="sticker-format"/);
  assert.match(html, /aria-label="Pause preview"/);
  assert.match(html, /aria-label="Download selected animation"/);
  assert.equal((html.match(/<option value="(?:sports-action|feeling-sportified)"/g) || []).length, 2);
  assert.doesNotMatch(html, /wa\.me|instagram:\/\//);
});

test("all selected formats and reduced-motion posters exist as real media", async () => {
  for (const sticker of stickerCatalog) {
    for (const format of ["webp", "gif", "mp4", "poster"]) {
      const bytes = await readFile(new URL(`../${sticker[format]}`, import.meta.url));
      assert.ok(bytes.length > 1000);
      if (format === "webp") {
        assert.equal(bytes.toString("ascii", 8, 12), "WEBP");
        assert.ok(bytes.includes(Buffer.from("ANIM")));
        assert.ok(bytes.length <= 500 * 1024);
      }
      if (format === "gif") assert.match(bytes.toString("ascii", 0, 6), /^GIF8[79]a$/);
      if (format === "mp4") {
        assert.equal(bytes.toString("ascii", 4, 8), "ftyp");
        assert.ok(bytes.includes(Buffer.from("avc1")));
      }
    }
  }
});