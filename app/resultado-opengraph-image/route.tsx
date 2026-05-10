import { ImageResponse } from 'next/og';
import {
  calculateFreelanceBilling,
  type AutonomousCommunity,
  type IrpfMode,
  type ReducedFeePeriod,
  type SelfEmployedFeeMode,
} from '@/lib/calculator';
import { formatCurrency } from '@/lib/format';
import { siteConfig } from '@/lib/site';

const size = {
  width: 1200,
  height: 630,
};

const irpfModes = ['progressive', 'manual'] satisfies readonly IrpfMode[];
const autonomousCommunities = [
  'common',
  'madrid',
  'catalunya',
  'andalucia',
  'valencia',
] satisfies readonly AutonomousCommunity[];
const selfEmployedFeeModes = ['auto', 'reduced', 'manual'] satisfies readonly SelfEmployedFeeMode[];
const reducedFeePeriods = ['initial', 'extended'] satisfies readonly ReducedFeePeriod[];

function parseNumber(value: string | null, fallback: number) {
  const parsedValue = Number(value?.replace(',', '.'));

  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

function getAllowedValue<T extends string>(value: string | null, allowedValues: readonly T[], fallback: T) {
  return value && allowedValues.includes(value as T) ? (value as T) : fallback;
}

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const result = calculateFreelanceBilling({
    targetNet: parseNumber(searchParams.get('targetNet'), 1500),
    monthlyExpenses: parseNumber(searchParams.get('monthlyExpenses'), 200),
    billableHours: parseNumber(searchParams.get('billableHours'), 80),
    irpfMode: getAllowedValue(searchParams.get('irpfMode'), irpfModes, 'progressive'),
    autonomousCommunity: getAllowedValue(
      searchParams.get('autonomousCommunity'),
      autonomousCommunities,
      'common',
    ),
    irpfRate: parseNumber(searchParams.get('irpfRate'), 15),
    hasIVA: searchParams.get('hasIVA') !== 'no',
    selfEmployedFeeMode: getAllowedValue(searchParams.get('selfEmployedFeeMode'), selfEmployedFeeModes, 'auto'),
    reducedFeePeriod: getAllowedValue(searchParams.get('reducedFeePeriod'), reducedFeePeriods, 'initial'),
    selfEmployedFee: parseNumber(searchParams.get('selfEmployedFee'), 0),
  });

  const stats = [
    ['Neto objetivo', `${formatCurrency(result.targetNet)}/mes`],
    ['Facturación sin IVA', `${formatCurrency(result.billingWithoutVAT)}/mes`],
    ['Tarifa orientativa', `${formatCurrency(result.hourlyRate)}/h`],
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '58px',
          background: '#f6f8fb',
          color: '#18212b',
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div
              style={{
                width: '66px',
                height: '66px',
                borderRadius: '18px',
                background: '#145da0',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                fontWeight: 800,
              }}
            >
              €
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', fontSize: '32px', fontWeight: 800 }}>{siteConfig.name}</div>
              <div style={{ display: 'flex', fontSize: '22px', color: '#5c6b7a' }}>
                Calculadora para autónomos y freelance en España
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              padding: '12px 18px',
              borderRadius: '999px',
              background: '#e5eef8',
              color: '#0e477d',
              fontSize: '22px',
              fontWeight: 800,
            }}
          >
            Resultado compartido
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div
            style={{
              display: 'flex',
              maxWidth: '980px',
              fontSize: '62px',
              fontWeight: 800,
              lineHeight: 1.08,
            }}
          >
            Para quedarte con {formatCurrency(result.targetNet)} netos al mes
          </div>
          <div
            style={{
              display: 'flex',
              maxWidth: '850px',
              fontSize: '28px',
              lineHeight: 1.35,
              color: '#5c6b7a',
            }}
          >
            Esta simulación estima cuánto tendrías que facturar y qué tarifa por hora usar como suelo
            orientativo antes de presupuestar.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          {stats.map(([label, value]) => (
            <div
              key={label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                flex: 1,
                padding: '24px',
                borderRadius: '20px',
                background: '#ffffff',
                border: '1px solid #d7e0ea',
                boxShadow: '0 14px 34px rgba(16, 24, 40, 0.08)',
              }}
            >
              <div style={{ display: 'flex', color: '#5c6b7a', fontSize: '22px', fontWeight: 700 }}>
                {label}
              </div>
              <div style={{ display: 'flex', color: '#145da0', fontSize: '38px', fontWeight: 800 }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5c6b7a', fontSize: '20px' }}>
          <div style={{ display: 'flex' }}>IVA aparte · IRPF estimado · cuota de autónomos 2026</div>
          <div style={{ display: 'flex' }}>cuantofacturar.es</div>
        </div>
      </div>
    ),
    size,
  );
}
