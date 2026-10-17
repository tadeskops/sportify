import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readdir, stat, unlink } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const exec = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const photoDirectory = join(root, "assets", "photos");
const supported = /\.(jpe?g|png|webp|avif)$/i;

export function expiresAfterThreeMonths(addedAt) {
  const added = new Date(addedAt);
  if (!Number.isFinite(added.getTime())) throw new Error(`Invalid photo addition date: ${addedAt}`);
  const expiry = new Date(added);
  expiry.setUTCDate(1);
  expiry.setUTCMonth(expiry.getUTCMonth() + 3);
  const lastDay = new Date(Date.UTC(expiry.getUTCFullYear(), expiry.getUTCMonth() + 1, 0)).getUTCDate();
  expiry.setUTCDate(Math.min(added.getUTCDate(), lastDay));
  return expiry.toISOString();
}

async function verifyHistoryAccess() {
  const automation = process.env.GITHUB_ACTIONS === "true" && process.env.GITHUB_REPOSITORY === "tadeskops/sportify";
  if (!automation) {
    const { stdout } = await exec("gh", ["api", "--hostname", "github.com", "user", "--jq", ".login"]);
    if (stdout.trim() !== "tadeskops") throw new Error("Photo history requires the tadeskops GitHub account.");
  }
  const { stdout } = await exec("git", ["rev-parse", "--is-shallow-repository"], { cwd: root });
  if (stdout.trim() !== "false") throw new Error("Photo retention needs full Git history. Fetch complete history before building.");
}

async function gitFirstAdded(file) {
  const path = relative(root, join(photoDirectory, file));
  const { stdout } = await exec("git", ["log", "--follow", "--diff-filter=A", "--format=%cI", "--", path], { cwd: root });
  const first = stdout.trim().split(/\r?\n/).filter(Boolean).at(-1);
  if (first) return first;
  if (process.env.GITHUB_ACTIONS === "true") throw new Error(`Photo is missing addition history: ${file}`);
  const info = await stat(join(photoDirectory, file));
  console.warn(`[Sportify photos] ${file} is uncommitted. Preview uses its creation date; publication uses its first Git addition.`);
  return info.birthtime.toISOString();
}

export async function scanPhotos({ directory = photoDirectory, now = new Date(), firstAdded } = {}) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = entries.filter(entry => entry.name !== ".gitkeep");
  for (const entry of files) {
    if (!entry.isFile() || !supported.test(entry.name)) {
      throw new Error(`Unsupported photo entry: ${entry.name}. Use JPG, PNG, WebP or AVIF files directly in assets/photos.`);
    }
  }
  if (files.length && !firstAdded) await verifyHistoryAccess();
  const photos = [];
  for (const entry of files.sort((a, b) => a.name.localeCompare(b.name, "en"))) {
    const addedAt = new Date(await (firstAdded || gitFirstAdded)(entry.name)).toISOString();
    const expiresAt = expiresAfterThreeMonths(addedAt);
    const title = entry.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() || "Community sports moment";
    photos.push({
      file: entry.name, src: `assets/photos/${encodeURIComponent(entry.name)}`,
      title, alt: title, addedAt, expiresAt, expired: now.getTime() >= Date.parse(expiresAt)
    });
  }
  return photos;
}

export async function cleanupPhotos(options = {}) {
  const photos = await scanPhotos(options);
  const expired = photos.filter(photo => photo.expired);
  for (const photo of expired) {
    await unlink(join(options.directory || photoDirectory, photo.file));
    console.log(`[Sportify photos] Removed expired photo: ${photo.file} (expired ${photo.expiresAt})`);
  }
  console.log(`[Sportify photos] ${expired.length} expired photo(s) removed; ${photos.length - expired.length} retained.`);
  return expired.map(photo => photo.file);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await cleanupPhotos();
