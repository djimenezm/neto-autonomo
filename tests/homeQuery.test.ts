import { describe, expect, it, vi } from 'vitest';
import { Children, isValidElement, type ReactNode } from 'react';
import Head from 'next/head';
import HomePage from '@/components/HomePage';
import IndexPage, { getServerSideProps } from '@/pages/index';
import { siteConfig } from '@/lib/site';

function pageMetadata(props: Parameters<typeof IndexPage>[0]) {
  const page = IndexPage(props);
  const children = Children.toArray(page.props.children);
  const head = children.find((child) => isValidElement(child) && child.type === Head);
  const home = children.find((child) => isValidElement(child) && child.type === HomePage);
  if (!isValidElement<{ children: ReactNode }>(head) || !isValidElement<{
    calculatorInitiallySubmitted: boolean;
    trackServerConversion: boolean;
  }>(home)) throw new Error('The page should retain its metadata and calculator.');
  const meta = Children.toArray(head.props.children);
  return {
    home: home.props,
    content(key: string) {
      const entry = meta.find((child) => isValidElement<{ name?: string; property?: string }>(child)
        && (child.props.name === key || child.props.property === key));
      if (!isValidElement<{ content: string }>(entry)) throw new Error(`Missing metadata: ${key}`);
      return entry.props.content;
    },
  };
}

describe('home calculator query', () => {
  it('prefills imported monthly costs without submitting or returning undefined props', async () => {
    const response = await getServerSideProps({
      query: {
        source: 'monthly-costs',
        monthlyExpenses: '100.00',
        monthlyNonDeductibleExpenses: '60.00',
        billableHours: '80',
        selfEmployedFeeMode: 'manual',
        selfEmployedFee: '320.00',
      },
      res: { setHeader: vi.fn() },
    } as unknown as Parameters<typeof getServerSideProps>[0]);

    expect(response).toHaveProperty('props');

    if (!('props' in response)) {
      return;
    }

    const props = await response.props;

    expect(props).toMatchObject({
      calculatorInitiallySubmitted: false,
      importedFromCosts: true,
      calculatorInitialValues: {
        monthlyExpenses: '100',
        monthlyNonDeductibleExpenses: '60',
        billableHours: '80',
        selfEmployedFeeMode: 'manual',
        selfEmployedFee: '320',
      },
    });
    expect(props).not.toHaveProperty('calculatorShareUrl');
    expect(Object.values(props)).not.toContain(undefined);
  });

  it.each([
    { targetNet: '' }, { targetNet: '0' }, { monthlyExpenses: '1,,50' }, { billableHours: '80.5' },
    { targetNet: '1800 USD', billableHours: '100 €', irpfMode: 'manual', irpfRate: '15 EUR' },
  ])('uses generic metadata for invalid values without changing submission or tracking flags: %j', async (query) => {
    const response = await getServerSideProps({ query, res: { setHeader: vi.fn() } } as unknown as Parameters<typeof getServerSideProps>[0]);
    if (!('props' in response)) throw new Error('Expected calculator props.');
    const props = await response.props;
    expect(props.calculatorInitiallySubmitted).toBe(true);
    const metadata = pageMetadata(props);

    expect(metadata.content('og:image')).toBe(`${siteConfig.url}/opengraph-image`);
    expect(metadata.content('twitter:image')).toBe(`${siteConfig.url}/opengraph-image`);
    expect(metadata.content('og:title')).toBe('Cuánto facturar como autónomo | Calculadora gratis');
    expect(metadata.content('twitter:title')).toBe('Cuánto facturar como autónomo | Calculadora gratis');
    expect(metadata.content('og:description')).toBe(siteConfig.description);
    expect(metadata.home.calculatorInitiallySubmitted).toBe(true);
    expect(metadata.home.trackServerConversion).toBe(true);
  });

  it('canonicalizes compatible amounts for the form, result link and image metadata without rounding precision', async () => {
    const response = await getServerSideProps({
      query: { targetNet: ['2.500,50', '0'], monthlyExpenses: '128,075', billableHours: '80', irpfMode: 'manual', irpfRate: '15', selfEmployedFeeMode: 'manual', selfEmployedFee: '320' },
      res: { setHeader: vi.fn() },
    } as unknown as Parameters<typeof getServerSideProps>[0]);
    if (!('props' in response)) throw new Error('Expected calculator props.');
    const props = await response.props;
    expect(props.calculatorInitialValues).toMatchObject({ targetNet: '2500.5', monthlyExpenses: '128.075' });
    const metadata = pageMetadata(props);
    const image = new URL(metadata.content('og:image'));
    const shared = new URL(props.calculatorShareUrl!);

    expect(image.pathname).toBe('/resultado-opengraph-image');
    expect(image.searchParams.get('targetNet')).toBe('2500.5');
    expect(image.searchParams.get('monthlyExpenses')).toBe('128.075');
    expect(shared.searchParams.get('targetNet')).toBe('2500.5');
    expect(shared.searchParams.get('monthlyExpenses')).toBe('128.075');
    expect(metadata.content('twitter:image')).toBe(image.toString());
    expect(metadata.home.calculatorInitiallySubmitted).toBe(true);
    expect(metadata.home.trackServerConversion).toBe(true);
  });
});
