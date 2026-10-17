import { cp, mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import config from "../config/site.js";
import { validateConfig } from "../assets/js/config.js";
import { photoDirectory, scanPhotos } from "./photos.mjs";

export const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const productionPaths = ["index.html", "assets", "config"];

export async function build(destination = join(root, "dist"), photoOptions = {}) {
  validateConfig(config);
  await mkdir(destination, { recursive: true });
  // An allowlist prevents local demos, context, and repository metadata being published.
  for (const path of productionPaths) {
    await cp(join(root, path), join(destination, path), {
      recursive: true, filter: source => resolve(source) !== photoDirectory
    });
  }
  const outputPhotos = join(destination, "assets", "photos");
  await mkdir(outputPhotos, { recursive: true });
  for (const entry of await readdir(outputPhotos, { withFileTypes: true })) {
    if (!entry.isFile()) throw new Error(`Unexpected directory in generated photo output: ${entry.name}`);
    await unlink(join(outputPhotos, entry.name));
  }
  const discovered = await scanPhotos(photoOptions);
  const active = config.features.photoBooth ? discovered.filter(photo => !photo.expired) : [];
  for (const photo of active) await cp(join(photoOptions.directory || photoDirectory, photo.file), join(outputPhotos, photo.file));
  await writeFile(join(destination, "assets", "photo-booth.json"), JSON.stringify(active.map(({ src, title, alt, addedAt, expiresAt }) => ({ src, title, alt, addedAt, expiresAt })), null, 2));
  await writeFile(join(destination, ".nojekyll"), "");
  const entries = await readdir(destination);
  const unexpected = entries.filter(entry => ![...productionPaths, ".nojekyll"].includes(entry));
  if (unexpected.length) throw new Error(`Unexpected files in publish output: ${unexpected.join(", ")}. Remove only those files and rebuild.`);
  const html = await readFile(join(destination, "index.html"), "utf8");
  if (html.includes("temp/")) throw new Error("Production HTML must not reference local demos.");
  console.log(`Built static site at ${destination}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await build();
