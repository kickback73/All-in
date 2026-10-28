// src/utils/backgroundEngine.js
// Non-duplicating randomized tile background engine and 12:01 AM daily reset logic

export const AVAILABLE_BACKGROUND_IMAGES = [
  '/images/hero_power.jpg',
  '/images/runner_sprint.jpg',
  '/images/man outline.jfif',
  '/images/man pose1.jfif',
  '/images/man pose2.jfif',
  '/images/girl pose1.jfif',
  '/images/girl pose2.jfif',
];

/**
 * Selects `count` unique background images at random from `/public/images/`.
 * Does not repeat images across tiles unless the image directory contains fewer images than tiles.
 */
export function selectUniqueTileBackgrounds(count = 4, pool = AVAILABLE_BACKGROUND_IMAGES) {
  const source = Array.isArray(pool) && pool.length > 0 ? [...pool] : [...AVAILABLE_BACKGROUND_IMAGES];

  // Fisher-Yates shuffle
  for (let i = source.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [source[i], source[j]] = [source[j], source[i]];
  }

  const selected = [];
  for (let i = 0; i < count; i++) {
    selected.push(source[i % source.length]);
  }
  return selected;
}

/**
 * Computes the active calendar cycle key anchored at 12:01 AM (00:01) local time.
 * At 12:01 AM local time, this key shifts and triggers a daily reset of all daily summary counters.
 */
export function getActiveCycleDateKey(now = new Date()) {
  // Shift by 1 minute so 00:00:00 - 00:00:59 belongs to previous cycle, 00:01:00 begins new day
  const adjusted = new Date(now.getTime() - 60 * 1000);
  const year = adjusted.getFullYear();
  const month = String(adjusted.getMonth() + 1).padStart(2, '0');
  const day = String(adjusted.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Filters any list of timestamped entries to only those recorded on or after 12:01 AM today.
 */
export function filterTodayEntries(entries = [], now = new Date()) {
  if (!Array.isArray(entries)) return [];
  const activeKey = getActiveCycleDateKey(now);
  return entries.filter((entry) => {
    if (!entry?.timestamp) return false;
    return getActiveCycleDateKey(new Date(entry.timestamp)) === activeKey;
  });
}
