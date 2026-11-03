import { escapeHtml as e, icon } from "./dom.js";

export const stickerCatalog = [
  {
    id: "sports-action", name: "Sportify sports action",
    webp: "assets/stickers/sportify_sticker/sportify_sports_action.webp",
    gif: "assets/stickers/sportify_sticker/sportify_sports_action.gif",
    mp4: "assets/stickers/sportify_sticker/sportify_sports_action.mp4",
    poster: "assets/stickers/sportify_sticker/sportify_sports_action.png"
  },
  {
    id: "feeling-sportified", name: "Feeling sportified",
    webp: "assets/stickers/feeling-sportified-sticker/feeling_sportified.webp",
    gif: "assets/stickers/feeling-sportified-sticker/feeling_sportified.gif",
    mp4: "assets/stickers/feeling-sportified-sticker/feeling_sportified.mp4",
    poster: "assets/stickers/feeling-sportified-sticker/feeling_sportified.png"
  }
];

export const stickerFormats = {
  webp: { label: "WhatsApp sticker (WebP)", type: "image/webp" },
  gif: { label: "Animated GIF", type: "image/gif" },
  mp4: { label: "Instagram video (MP4)", type: "video/mp4" }
};

export async function prepareStickerFile(sticker, format, fetcher = fetch) {
  if (!stickerFormats[format] || !sticker?.[format]) throw new Error("Choose an available sticker format.");
  const response = await fetcher(sticker[format]);
  if (!response.ok) throw new Error("The animated file could not be loaded. Please retry.");
  const blob = await response.blob();
  if (!blob.size) throw new Error("The animated file is empty. Please retry.");
  return new File([blob], sticker[format].split("/").at(-1), { type: stickerFormats[format].type });
}

export async function shareStickerFile(file, api = navigator) {
  if (!file || !api.share || !api.canShare?.({ files: [file] })) return "unsupported";
  try {
    await api.share({ files: [file] });
    return "shared";
  } catch (error) {
    if (error.name === "AbortError") return "cancelled";
    throw error;
  }
}

export function renderStickerSection(enabled) {
  if (!enabled) return "";
  return `<section class="sticker-section" id="stickers" aria-labelledby="stickers-title">
    <div class="sticker-intro"><p class="eyebrow">TAKE THE SPORTIFY SPIRIT</p><h2 id="stickers-title">Community stickers</h2></div>
    <div class="sticker-workspace">
      <figure class="sticker-preview"><img id="sticker-image" width="512" height="512" loading="lazy" alt="${e(stickerCatalog[0].name)}"><video id="sticker-video" width="512" height="512" muted loop playsinline preload="metadata" aria-label="Animated sticker video" hidden></video><button type="button" class="sticker-icon sticker-play" id="sticker-play" aria-label="Pause preview" title="Pause preview">${icon("pause")}</button></figure>
      <div class="sticker-controls">
        <div class="sticker-fields"><div><label for="sticker-choice">Sticker</label><select id="sticker-choice">${stickerCatalog.map(sticker => `<option value="${e(sticker.id)}">${e(sticker.name)}</option>`).join("")}</select></div>
        <div><label for="sticker-format">Share format</label><select id="sticker-format" title="WhatsApp sticker files may need importing in a compatible sticker app. Instagram uses MP4 video.">${Object.entries(stickerFormats).map(([format, details]) => `<option value="${format}">${e(details.label)}</option>`).join("")}</select></div></div>
        <div class="sticker-actions"><button type="button" id="sticker-share" disabled>${icon("share")}<span>Share file</span></button><a class="sticker-icon" id="sticker-download" aria-label="Download selected animation" title="Download selected animation" aria-disabled="true" tabindex="-1">${icon("download")}</a><button type="button" class="sticker-icon" id="sticker-retry" aria-label="Retry loading animation" title="Retry loading animation" hidden>${icon("refresh")}</button></div>
        <p id="sticker-status" class="sticker-status muted" role="status" aria-live="polite"></p>
      </div>
    </div>
  </section>`;
}

export function mountStickers() {
  const section = document.getElementById("stickers");
  if (!section) return;
  const find = id => section.querySelector(`#${id}`);
  const choice = find("sticker-choice");
  const format = find("sticker-format");
  const image = find("sticker-image");
  const video = find("sticker-video");
  const play = find("sticker-play");
  const share = find("sticker-share");
  const download = find("sticker-download");
  const retry = find("sticker-retry");
  const status = find("sticker-status");
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let paused = motion.matches;
  let file;
  let objectUrl;
  let request = 0;
  let previewRequest = 0;
  let controller;
  const selected = () => stickerCatalog.find(sticker => sticker.id === choice.value);

  function updatePreview() {
    const current = ++previewRequest;
    const sticker = selected();
    const showVideo = format.value === "mp4";
    image.hidden = showVideo;
    video.hidden = !showVideo;
    if (showVideo) {
      video.setAttribute("aria-label", `${sticker.name} video`);
      video.poster = sticker.poster;
      video.muted = true;
      if (video.getAttribute("src") !== sticker.mp4) video.src = sticker.mp4;
      if (paused) video.pause();
      else video.play().catch(() => {
        if (current !== previewRequest) return;
        paused = true;
        play.innerHTML = icon("play");
        play.title = play.ariaLabel = "Play preview";
      });
    } else {
      video.pause();
      image.alt = sticker.name;
      image.src = paused ? sticker.poster : sticker.webp;
    }
    play.innerHTML = icon(paused ? "play" : "pause");
    play.title = play.ariaLabel = paused ? "Play preview" : "Pause preview";
  }

  async function prepare() {
    const current = ++request;
    controller?.abort();
    controller = new AbortController();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    file = undefined;
    objectUrl = undefined;
    share.disabled = true;
    download.removeAttribute("href");
    download.setAttribute("aria-disabled", "true");
    download.tabIndex = -1;
    retry.hidden = true;
    status.textContent = "Loading animation...";
    try {
      const prepared = await prepareStickerFile(selected(), format.value, source => fetch(source, { signal: controller.signal }));
      if (current !== request) return;
      file = prepared;
      objectUrl = URL.createObjectURL(file);
      download.href = objectUrl;
      download.download = file.name;
      download.setAttribute("aria-disabled", "false");
      download.tabIndex = 0;
      const supported = Boolean(navigator.share && navigator.canShare?.({ files: [file] }));
      share.disabled = !supported;
      share.title = supported ? "Share the selected animated file" : "File sharing is unavailable; download is ready";
      status.textContent = `${format.value.toUpperCase()} / ${Math.round(file.size / 1024).toLocaleString()} KB${supported ? "" : " / Download ready"}`;
    } catch (error) {
      if (current !== request || error.name === "AbortError") return;
      status.textContent = "Animation unavailable. Please retry.";
      retry.hidden = false;
    }
  }

  choice.addEventListener("change", () => { updatePreview(); prepare(); });
  format.addEventListener("change", () => { updatePreview(); prepare(); });
  play.addEventListener("click", () => { paused = !paused; updatePreview(); });
  motion.addEventListener("change", event => { paused = event.matches; updatePreview(); });
  const previewError = () => { status.textContent = "Preview unavailable. Choose another sticker or retry."; retry.hidden = false; };
  image.addEventListener("error", previewError);
  video.addEventListener("error", previewError);
  retry.addEventListener("click", () => { updatePreview(); prepare(); });
  download.addEventListener("click", event => { if (!file) event.preventDefault(); });
  share.addEventListener("click", async () => {
    if (!file) return;
    share.disabled = true;
    choice.disabled = format.disabled = true;
    try {
      const result = await shareStickerFile(file);
      status.textContent = result === "shared" ? "File handed to the share sheet." : result === "cancelled" ? "Sharing cancelled." : "File sharing unavailable. Download is ready.";
    } catch (error) {
      status.textContent = "Sharing unavailable. Download is ready.";
    } finally {
      choice.disabled = format.disabled = false;
      share.disabled = false;
    }
  });
  window.addEventListener("pagehide", event => {
    if (!event.persisted) { controller?.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); }
  });
  updatePreview();
  prepare();
}