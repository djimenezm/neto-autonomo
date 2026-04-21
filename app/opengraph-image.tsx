import { ImageResponse } from 'next/og';
import { siteConfig } from '@/lib/site';

export const alt = `${siteConfig.name} - ${siteConfig.title}`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px',
          background:
            'linear-gradient(135deg, rgb(246,248,251) 0%, rgb(229,238,248) 55%, rgb(196,220,242) 100%)',
          color: '#18212b',
          fontFamily: 'Arial',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontSize: '32px',
            fontWeight: 700,
            color: '#0e477d',
          }}
        >
          <div
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '999px',
              background: '#145da0',
            }}
          />
          {siteConfig.name}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '920px' }}>
          <div style={{ fontSize: '68px', fontWeight: 800, lineHeight: 1.05 }}>
            Calcula cuanto debes facturar para llegar al neto que buscas
          </div>
          <div style={{ fontSize: '28px', lineHeight: 1.4, color: '#405261' }}>
            Cuota, IRPF, IVA y tarifa por hora en una calculadora clara y orientativa para autonomos en
            Espana.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '18px', color: '#405261', fontSize: '24px' }}>
          <div>IRPF progresivo simplificado</div>
          <div>Cuota por tramo 2026</div>
          <div>IVA aparte</div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
