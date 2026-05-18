import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import LeadMagnetForm from '@/components/LeadMagnetForm';
import { siteConfig } from '@/lib/site';

describe('LeadMagnetForm', () => {
  it('submits the kit request to Brevo with the expected fields', () => {
    render(<LeadMagnetForm source="test-source" />);

    const form = screen.getByRole('button', { name: /quiero el kit/i }).closest('form');
    const emailInput = screen.getByRole('textbox', { name: /email/i });

    expect(form).toHaveAttribute('action', siteConfig.brevoKitFormAction);
    expect(form).toHaveAttribute('method', 'POST');
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('name', 'EMAIL');
    expect(emailInput).toHaveAttribute('autocomplete', 'email');
    expect(document.querySelector('input[name="locale"]')).toHaveValue('es');
    expect(document.querySelector('input[name="html_type"]')).toHaveValue('simple');
    expect(document.querySelector('input[name="email_address_check"]')).toHaveValue('');
  });
});
