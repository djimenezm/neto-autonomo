import AdSenseUnit from '@/components/AdSenseUnit';
import { adsConfig } from '@/lib/ads';

type AdPlacement = 'primary' | 'secondary';

export default function AdSlot({ placement }: { placement: AdPlacement }) {
  const slot = placement === 'primary' ? adsConfig.primarySlot : adsConfig.secondarySlot;

  if (!adsConfig.enabled || !slot) return null;

  return (
    <aside className={`ad-band ad-band-${placement}`} aria-label="Publicidad">
      <div className="container ad-placement">
        <span className="ad-label">Publicidad</span>
        <AdSenseUnit client={adsConfig.client} slot={slot} />
      </div>
    </aside>
  );
}
