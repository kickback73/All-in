// Dynamic Full-Scale Rotating Background Engine
// Rotates diverse full-scale visual assets and transparent silhouettes from /images/

export const BACKGROUND_ASSETS = [
  {
    id: 'hero-power',
    path: '/images/hero_power.jpg',
    title: 'Neon Power Stance',
    subtitle: 'Triple Agonist Metabolic Calibre & Lean Retention',
    accentColour: 'emerald'
  },
  {
    id: 'runner-sprint',
    path: '/images/runner_sprint.jpg',
    title: 'Sprint Conditioning',
    subtitle: 'Explosive Neuromuscular & Cardiovascular Output',
    accentColour: 'cyan'
  },
  {
    id: 'man-outline',
    path: '/images/man outline.jfif',
    title: 'Athletic Blueprint',
    subtitle: 'Functional Calisthenics & Resistance Framework',
    accentColour: 'emerald'
  },
  {
    id: 'man-pose1',
    path: '/images/man pose1.jfif',
    title: 'Power Stance Alpha',
    subtitle: 'Progressive Band Tension & Heavy Loops',
    accentColour: 'cyan'
  },
  {
    id: 'man-pose2',
    path: '/images/man pose2.jfif',
    title: 'Focus Conditioning',
    subtitle: 'Endurance & Core Calibre',
    accentColour: 'violet'
  },
  {
    id: 'girl-pose1',
    path: '/images/girl pose1.jfif',
    title: 'Dynamic Agility',
    subtitle: 'Explosive Plyometrics & Joint Mobility',
    accentColour: 'rose'
  },
  {
    id: 'girl-pose2',
    path: '/images/girl pose2.jfif',
    title: 'Core Precision',
    subtitle: 'Ab Wheel Trunk Alignment & Anti-Extension',
    accentColour: 'amber'
  }
];

export function getRotatedBackground(rotationMode = 'daily') {
  const now = new Date();
  
  if (rotationMode === 'random') {
    const randomIndex = Math.floor(Math.random() * BACKGROUND_ASSETS.length);
    return BACKGROUND_ASSETS[randomIndex];
  }

  if (rotationMode === 'weekly') {
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now - startOfYear) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
    const index = weekNumber % BACKGROUND_ASSETS.length;
    return BACKGROUND_ASSETS[index];
  }

  // Default: Daily rotation based on day of month
  const dayOfMonth = now.getDate();
  const index = dayOfMonth % BACKGROUND_ASSETS.length;
  return BACKGROUND_ASSETS[index];
}
