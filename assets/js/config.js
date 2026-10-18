export const featureNames = [
  "join", "monthlyRotation", "venueBooking", "bookingPicker", "gamePost", "football", "search", "sectionNavigation",
  "appearance", "themePicker", "fontPicker", "textSize", "rememberPreferences",
  "socialLinks", "whatsapp", "instagram", "backToTop", "photoBooth"
];

export function validateConfig(config) {
  if (!config || typeof config !== "object") throw new Error("Site configuration must be an object.");
  for (const key of featureNames) {
    if (typeof config.features?.[key] !== "boolean") throw new Error(`features.${key} must be true or false.`);
  }
  for (const key of Object.keys(config.features)) {
    if (!featureNames.includes(key)) throw new Error(`Unknown feature flag: ${key}.`);
  }
  for (const key of ["name", "address", "location", "updated"]) {
    if (typeof config.community?.[key] !== "string" || !config.community[key].trim()) {
      throw new Error(`community.${key} must be nonempty text.`);
    }
  }
  for (const [key, host] of [["whatsapp", "chat.whatsapp.com"], ["instagram", "www.instagram.com"]]) {
    const url = new URL(config.links?.[key]);
    if (url.protocol !== "https:" || url.hostname !== host || url.username || url.password || url.pathname === "/") {
      throw new Error(`links.${key} must be a valid HTTPS ${host} link.`);
    }
  }
  if (!Array.isArray(config.venues)) throw new Error("venues must be an array.");
  const ids = new Set();
  for (const venue of config.venues) {
    if (!venue || typeof venue.enabled !== "boolean") throw new Error("Each venue needs an enabled boolean.");
    for (const key of ["id", "name", "provider", "sport", "url", "note"]) {
      if (typeof venue[key] !== "string" || !venue[key].trim()) throw new Error(`Venue ${key} must be nonempty text.`);
    }
    if (!/^[a-z0-9-]+$/.test(venue.id) || ids.has(venue.id)) throw new Error("Venue IDs must be unique lowercase slugs.");
    ids.add(venue.id);
    if (venue.shortName !== undefined && (typeof venue.shortName !== "string" || !venue.shortName.trim())) {
      throw new Error("Venue shortName must be nonempty text when provided.");
    }
    const url = new URL(venue.url);
    if (url.protocol !== "https:" || url.username || url.password) throw new Error("Venue links must use HTTPS without embedded credentials.");
    if (venue.bookingSteps !== undefined &&
        (!Array.isArray(venue.bookingSteps) || !venue.bookingSteps.length ||
         venue.bookingSteps.some(step => typeof step !== "string" || !step.trim()))) {
      throw new Error("Venue bookingSteps must be a nonempty array of nonempty text steps.");
    }
    if (venue.contact !== undefined) {
      if (!venue.contact || typeof venue.contact.name !== "string" || typeof venue.contact.phone !== "string") {
        throw new Error("Venue contact must have name and phone strings, left empty when unavailable.");
      }
      if (venue.contact.phone && !/^\+[1-9]\d{6,14}$/.test(venue.contact.phone)) {
        throw new Error("Venue contact phone must be international format, such as + followed by country code and digits.");
      }
    }
  }
  const post = config.gamePost;
  const time = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (!post || !time.test(post.defaultStart) || !time.test(post.defaultEnd) || post.defaultEnd <= post.defaultStart) {
    throw new Error("gamePost needs HH:MM defaultStart and a later defaultEnd.");
  }
  if (!Array.isArray(post.sports) || !post.sports.length) throw new Error("gamePost.sports must be a nonempty array.");
  const sportIds = new Set();
  for (const sport of post.sports) {
    if (!/^[a-z0-9-]+$/.test(sport?.id) || sportIds.has(sport.id)) throw new Error("gamePost sport IDs must be unique lowercase slugs.");
    sportIds.add(sport.id);
    if (typeof sport.name !== "string" || !sport.name.trim()) throw new Error("gamePost sport name must be nonempty text.");
    if (!Number.isInteger(sport.minPlayers) || sport.minPlayers < 1 ||
        !Number.isInteger(sport.maxPlayers) || sport.maxPlayers < sport.minPlayers) {
      throw new Error(`gamePost ${sport.id} needs whole-number minPlayers >= 1 and maxPlayers >= minPlayers.`);
    }
  }
  if (!["dark", "light"].includes(config.appearance?.defaultTheme)) throw new Error("Invalid default theme.");
  if (!["classic", "modern"].includes(config.appearance?.defaultFont)) throw new Error("Invalid default font.");
  if (!["standard", "large"].includes(config.appearance?.defaultTextSize)) throw new Error("Invalid default text size.");
  if (!Number.isInteger(config.appearance.idleDelayMs) || config.appearance.idleDelayMs < 1000) {
    throw new Error("Appearance idle delay must be an integer of at least 1000ms.");
  }
  if (typeof config.photoBooth?.autoRotate !== "boolean" ||
      !Number.isInteger(config.photoBooth.intervalMs) || config.photoBooth.intervalMs < 3000) {
    throw new Error("Photo booth needs an autoRotate boolean and intervalMs of at least 3000ms.");
  }
  return config;
}

export function appearanceEnabled(config) {
  const flags = config.features;
  return flags.appearance && (flags.themePicker || flags.fontPicker || flags.textSize);
}
