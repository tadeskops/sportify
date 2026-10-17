import { escapeHtml as e } from "./dom.js";

export function activePhotos(photos, now = Date.now()) {
  if (!Array.isArray(photos)) throw new Error("Photo manifest must be an array.");
  return photos.filter(photo => {
    if (!photo || typeof photo.src !== "string" || !/^assets\/photos\/[^/]+$/.test(photo.src) ||
        typeof photo.title !== "string" || typeof photo.alt !== "string" ||
        !Number.isFinite(Date.parse(photo.addedAt)) || !Number.isFinite(Date.parse(photo.expiresAt))) {
      throw new Error("Invalid photo manifest entry.");
    }
    return Date.parse(photo.expiresAt) > now;
  });
}

export async function mountPhotoBooth(config) {
  if (!config.features.photoBooth) return;
  const host = document.getElementById("photo-booth");
  try {
    const response = await fetch(new URL("../photo-booth.json", import.meta.url), { cache: "no-store" });
    if (!response.ok) throw new Error(`Photo list returned HTTP ${response.status}.`);
    let photos = activePhotos(await response.json());
    if (!photos.length) return;
    const link = document.createElement("a");
    link.href = "#photo-booth";
    link.textContent = "Photo booth \u2197";
    document.querySelector(".hero-actions").append(link);
    host.innerHTML = `<section class="photo-booth" aria-labelledby="photo-booth-title" aria-roledescription="carousel">
      <div class="section-intro"><p class="eyebrow">MOMENTS ON OUR SHARED GROUND</p><h2 id="photo-booth-title">Our sporting journey</h2><p class="muted">Games, events and memories from our community.</p></div>
      <figure class="photo-frame"><img id="journey-photo" width="1200" height="800" loading="lazy" alt=""><figcaption id="journey-caption"></figcaption></figure>
      <div class="photo-controls"><button type="button" id="photo-previous" aria-label="Previous photo">&larr;</button><span id="photo-position"></span><button type="button" id="photo-next" aria-label="Next photo">&rarr;</button><button type="button" id="photo-pause"></button></div>
      <p class="sr-only" id="photo-announcement" role="status" aria-live="polite"></p>
      <p class="photo-error" role="status"></p>
    </section>`;
    const section = host.querySelector("section");
    const image = host.querySelector("#journey-photo");
    const caption = host.querySelector("#journey-caption");
    const controls = host.querySelector(".photo-controls");
    const pause = host.querySelector("#photo-pause");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let index = 0;
    let paused = !config.photoBooth.autoRotate;
    let intersecting = false;
    let timer;
    let expiryTimer;
    let imageFailed = false;
    const observers = new IntersectionObserver(entries => {
      intersecting = entries[0].isIntersecting;
      schedule();
    });
    function schedule() {
      clearTimeout(timer);
      const enabled = config.photoBooth.autoRotate && !motion.matches;
      pause.hidden = !enabled || photos.length < 2;
      pause.textContent = paused ? "Play slideshow" : "Pause slideshow";
      if (!enabled || paused || imageFailed || photos.length < 2 || !intersecting ||
          document.hidden || section.matches(":hover, :focus-within")) return;
      timer = setTimeout(() => { index = (index + 1) % photos.length; render(); }, config.photoBooth.intervalMs);
    }
    function render(manual = false) {
      const photo = photos[index];
      imageFailed = false;
      host.querySelector(".photo-error").textContent = "";
      image.src = photo.src;
      image.alt = photo.alt;
      caption.textContent = photo.title;
      host.querySelector("#photo-position").textContent = `${index + 1} / ${photos.length}`;
      controls.hidden = photos.length < 2;
      if (manual) host.querySelector("#photo-announcement").textContent = `Photo ${index + 1} of ${photos.length}: ${photo.title}`;
      schedule();
    }
    function expire() {
      clearTimeout(expiryTimer);
      const current = photos[index]?.src;
      const remaining = activePhotos(photos);
      if (!remaining.length) {
        photos = [];
        clearTimeout(timer);
        observers.disconnect();
        motion.removeEventListener("change", schedule);
        document.removeEventListener("visibilitychange", visibilityChanged);
        host.replaceChildren();
        link.remove();
        return;
      }
      if (remaining.length !== photos.length) {
        photos = remaining;
        index = Math.max(0, photos.findIndex(photo => photo.src === current));
        render();
      }
      const delay = Math.min(...photos.map(photo => Date.parse(photo.expiresAt))) - Date.now();
      expiryTimer = setTimeout(expire, Math.min(Math.max(delay, 1), 2147483647));
    }
    function visibilityChanged() {
      expire();
      if (photos.length && host.childElementCount) schedule();
    }
    image.addEventListener("error", () => {
      if (!photos.length) return;
      imageFailed = true;
      clearTimeout(timer);
      console.error(`[Sportify photos] Unable to load ${image.getAttribute("src")}`);
      host.querySelector(".photo-error").textContent = "This photo could not load. Try another photo or reload the page.";
    });
    for (const [id, step] of [["photo-previous", -1], ["photo-next", 1]]) {
      host.querySelector(`#${id}`).addEventListener("click", () => {
        index = (index + step + photos.length) % photos.length;
        render(true);
      });
    }
    pause.addEventListener("click", () => { paused = !paused; schedule(); });
    section.addEventListener("pointerenter", schedule);
    section.addEventListener("pointerleave", schedule);
    section.addEventListener("focusin", schedule);
    section.addEventListener("focusout", () => queueMicrotask(schedule));
    motion.addEventListener("change", schedule);
    document.addEventListener("visibilitychange", visibilityChanged);
    render();
    expire();
    if (photos.length) observers.observe(section);
  } catch (error) {
    console.error("[Sportify photos] Unable to initialize photo booth.", error);
    host.innerHTML = `<p class="photo-error" role="status">The photo booth could not load. Please reload or ask a coordinator to check the photos. ${e(error.message)}</p>`;
  }
}
