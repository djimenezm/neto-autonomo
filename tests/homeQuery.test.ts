import { describe, expect, it, vi } from 'vitest';
import { getServerSideProps } from '@/pages/index';

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
        monthlyExpenses: '100.00',
        monthlyNonDeductibleExpenses: '60.00',
        billableHours: '80',
        selfEmployedFeeMode: 'manual',
        selfEmployedFee: '320.00',
      },
    });
    expect(props).not.toHaveProperty('calculatorShareUrl');
    expect(Object.values(props)).not.toContain(undefined);
  });
});
