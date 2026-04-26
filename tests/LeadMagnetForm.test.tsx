import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import LeadMagnetForm from '@/components/LeadMagnetForm';
import { siteConfig } from '@/lib/site';

describe('LeadMagnetForm', () => {
  it('submits to the configured contact inbox and includes the resource links', () => {
    render(<LeadMagnetForm source="test-source" />);

    const form = screen.getByRole('button', { name: /quiero el kit/i }).closest('form');
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const sourceInput = screen.getByDisplayValue('test-source');
    const autoresponseInput = screen.getByDisplayValue(/kit de tarifa para autónomos/i);

    expect(form).toHaveAttribute('action', `https://formsubmit.co/${siteConfig.contactEmail}`);
    expect(form).toHaveAttribute('method', 'POST');
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(sourceInput).toHaveAttribute('name', 'origen');
    expect(autoresponseInput).toHaveAttribute('name', '_autoresponse');
    expect((autoresponseInput as HTMLInputElement).value).toContain('/kit-tarifa-autonomo');
    expect((autoresponseInput as HTMLInputElement).value).toContain(
      '/recursos/kit-tarifa-autonomo.txt',
    );
  });
});
