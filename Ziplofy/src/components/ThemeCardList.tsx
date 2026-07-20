import React from 'react';
import ThemeCard, { type ThemeCardTheme } from './ThemeCard';

const DEMO_THEMES: ThemeCardTheme[] = [
  {
    _id: 'demo-1',
    name: 'Horizon',
    description: 'Spacious layout with bold imagery for lifestyle brands.',
    category: 'Minimal',
    thumbnailUrl: 'https://picsum.photos/seed/zf-horizon/400/300',
    rating: { average: 4.8 },
  },
  {
    _id: 'demo-2',
    name: 'Craft',
    description: 'Warm tones and serif accents for makers and studios.',
    category: 'Editorial',
    thumbnailUrl: 'https://picsum.photos/seed/zf-craft/400/300',
    rating: { average: 4.6 },
  },
  {
    _id: 'demo-3',
    name: 'Pulse',
    description: 'High-contrast blocks built for drops and flash sales.',
    category: 'Bold',
    thumbnailUrl: 'https://picsum.photos/seed/zf-pulse/400/300',
    rating: { average: 4.5 },
  },
  {
    _id: 'demo-4',
    name: 'Aurora',
    description: 'Soft gradients and rounded cards for wellness and beauty.',
    category: 'Modern',
    thumbnailUrl: 'https://picsum.photos/seed/zf-aurora/400/300',
    rating: { average: 4.9 },
  },
];

interface ThemeCardListProps {
  /** Defaults to 4 for the Online Store preview row */
  limit?: number;
}

export const ThemeCardList: React.FC<ThemeCardListProps> = ({ limit = 4 }) => {
  const themes = DEMO_THEMES.slice(0, limit);

  return (
    <>
      {themes.map((t) => (
        <ThemeCard key={t._id} theme={t} installedThemes={[]} onInstallClick={() => {}} />
      ))}
    </>
  );
};
