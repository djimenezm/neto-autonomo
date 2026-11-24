'use client';

import { preload } from 'react-dom';

export default function HeroImagePreload() {
  preload('/images/cost-hero-autonomo.webp', { as: 'image', fetchPriority: 'high' });
  return null;
}
