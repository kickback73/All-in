// src/utils/backgroundEngine.js
// Tile background engine using local /public/images/ assets + 12:01 AM daily reset logic

export const AVAILABLE_BACKGROUND_IMAGES = [
  '/images/girl pose1.jfif',
  '/images/girl pose2.jfif',
  '/images/man outline.jfif',
  '/images/man pose1.jfif',
  '/images/man pose2.jfif',
  '/images/hero_power.jpg',
  '/images/runner_sprint.jpg',
];

export const VISUAL_ASSET_LIBRARY = [
  { id: 'hero_power', label: 'Hero Power', url: '/images/hero_power.jpg' },
  { id: 'runner_sprint', label: 'Runner Sprint', url: '/images/runner_sprint.jpg' },
  { id: 'man_pose1', label: 'Athletic Pose 1', url: encodeURI('/images/man pose1.jfif') },
  { id: 'man_pose2', label: 'Athletic Pose 2', url: encodeURI('/images/man pose2.jfif') },
  { id: 'man_outline', label: 'Physique Outline', url: encodeURI('/images/man outline.jfif') },
  { id: 'girl_pose1', label: 'Sculpt Pose 1', url: encodeURI('/images/girl pose1.jfif') },
  { id: 'girl_pose2', label: 'Sculpt Pose 2', url: encodeURI('/images/girl pose2.jfif') },
];

export const TILE_BACKGROUNDS = {
  stacks: encodeURI('/images/man pose2.jfif'),
  nutrition: '/images/hero_power.jpg',
  peptides: encodeURI('/images/man outline.jfif'),
  activity: '/images/runner_sprint.jpg',
  hydration: encodeURI('/images/man pose1.jfif'),
  mtor: encodeURI('/images/girl pose1.jfif'),
};

export function selectUniqueTileBackgrounds(count = 6, pool = AVAILABLE_BACKGROUND_IMAGES) {
  const source = Array.isArray(pool) && pool.length > 0 ? [...pool] : [...AVAILABLE_BACKGROUND_IMAGES];
  for (let i = source.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [source[i], source[j]] = [source[j], source[i]];
  }
  const selected = [];
  for (let i = 0; i < count; i++) {
    selected.push(encodeURI(source[i % source.length]));
  }
  return selected;
}

export function getActiveCycleDateKey(now = new Date()) {
  const adjusted = new Date(now.getTime() - 60 * 1000);
  const year = adjusted.getFullYear();
  const month = String(adjusted.getMonth() + 1).padStart(2, '0');
  const day = String(adjusted.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function filterTodayEntries(entries = [], now = new Date()) {
  if (!Array.isArray(entries)) return [];
  const activeKey = getActiveCycleDateKey(now);
  return entries.filter((entry) => {
    if (!entry?.timestamp) return false;
    return getActiveCycleDateKey(new Date(entry.timestamp)) === activeKey;
  });
}
