import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import userEvent from '@testing-library/user-event';
import Kit, { metadata } from '@/app/kit-tarifa-autonomo/page';
import HoursGuide from '@/app/horas-facturables-freelance/page';

vi.mock('@/components/LeadMagnetForm', () => ({ default: () => null }));

describe('the usable tariff worksheet', () => {
  it('previews the exact downloadable resource and keeps the existing public download URL', async () => {
    const user = userEvent.setup();
    render(<Kit />);
    expect(screen.getByRole('main')).toHaveAttribute('id', 'contenido-principal');
    expect(screen.queryByRole('textbox', { name: /email/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Descargar ficha y registro en texto' })).toHaveAttribute('href', '/recursos/kit-tarifa-autonomo.txt');
    expect(screen.getByRole('link', { name: 'Descargar ficha y registro en texto' })).toHaveAttribute('download');
    await user.click(screen.getByText('Leer la ficha completa antes de descargarla'));
    const preview = screen.getByRole('region', { name: 'Ficha completa en texto' });
    const resource = readFileSync(join(process.cwd(), 'public/recursos/kit-tarifa-autonomo.txt'), 'utf8');
    expect(preview.querySelector('pre')?.textContent?.replace(/\r\n/g, '\n')).toBe(resource.replace(/\r\n/g, '\n'));
    expect(preview).toHaveAttribute('tabindex', '0');
    expect(resource).toContain('Neto mensual objetivo (EUR): ____________________');
    expect(resource).toContain('Horas disponibles sin encargo (fuera del total trabajado)');
    expect(resource).toContain('Qué evidencia del registro me lleva a cambiarlo');
    expect(resource).toContain('96 h cobrables en 4 semanas = 24 h/semana.');
    expect(resource).toContain('5. REVISA UN ENCARGO TERMINADO');
    expect(resource).toContain('Horas reales registradas: ____________________');
    expect(resource).toContain('33,33 EUR/h');
    expect(resource).toContain('Costes específicos SIN IVA que no cubre tu referencia');
    expect(resource).toContain('29,17 EUR/h');
    expect(resource).toContain('480 + 50 = 530 EUR');
  });

  it('renders the complete worked log and distinguishes fictional numbers from observations', () => {
    render(<Kit />);
    const table = within(screen.getByRole('region', { name: 'Ejemplo ficticio de registro de horas' })).getByRole('table');
    const row = within(table).getByRole('rowheader', { name: 'Total registrado' }).closest('tr')!;
    expect(within(row).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['96', '34', '21', '9', '160']);
    expect(screen.getByText(/Las cifras siguientes están inventadas/)).toBeVisible();
    expect(screen.getByText(/El caso ficticio partía de/)).toHaveTextContent('28 h');
    expect(screen.getByText(/El caso ficticio partía de/)).toHaveTextContent('92 h/mes');
    expect(screen.getByText(/No copies esas/)).toHaveTextContent('92 horas');
    expect(screen.getByRole('region', { name: 'Ejemplo ficticio de registro de horas' })).toHaveAttribute('tabindex', '0');
  });

  it('includes the resource and matching Article/FAQ schemas in initial HTML without client scripts', () => {
    const document = new DOMParser().parseFromString(renderToStaticMarkup(<Kit />), 'text/html');
    const schemas = [...document.querySelectorAll('script[type="application/ld+json"]')].map((script) => JSON.parse(script.textContent!));
    expect(schemas.map((schema) => schema['@type'])).toEqual(['Article', 'BreadcrumbList', 'FAQPage']);
    expect(schemas[0].dateModified).toBe('2026-11-14');
    expect(schemas[0].mainEntityOfPage).toBe('https://www.cuantofacturar.es/kit-tarifa-autonomo');
    expect(schemas[2].mainEntity).toHaveLength(5);
    expect(document.querySelector('pre')?.textContent).toContain('RESUME LAS CUATRO SEMANAS');
    const projection = document.querySelector('section[aria-labelledby="revisar-horas"] form');
    expect(projection?.getAttribute('action')).toBeNull();
    expect(projection?.querySelectorAll('input[name]')).toHaveLength(0);
    const reviewSection = document.querySelector('section[aria-labelledby="revision-encargo"]');
    expect(reviewSection?.textContent).toContain('33,33');
    expect(reviewSection?.textContent).toContain('80,00');
    expect(reviewSection?.textContent).toContain('29,17');
    expect(reviewSection?.textContent).toContain('530,00');
    expect(reviewSection?.textContent).toContain('130,00');
    expect(reviewSection?.querySelectorAll('table')).toHaveLength(1);
    expect(reviewSection?.querySelectorAll('input')).toHaveLength(5);
    expect(reviewSection?.querySelectorAll('input[name]')).toHaveLength(0);
    expect(document.querySelector('time')?.getAttribute('datetime')).toBe('2026-11-14');
    for (const question of schemas[2].mainEntity) {
      expect(document.body.textContent).toContain(question.name);
      expect(document.body.textContent).toContain(question.acceptedAnswer.text);
    }
    expect(metadata.alternates?.canonical).toBe('/kit-tarifa-autonomo');
  });

  it('makes the worksheet discoverable exactly where the hours guide asks the reader to keep a log', () => {
    render(<HoursGuide />);
    expect(screen.getByRole('link', { name: 'ficha y registro de cuatro semanas' })).toHaveAttribute('href', '/kit-tarifa-autonomo#registro-horas');
  });

  it('uses a complete log to compare with the previous estimate, preserving exact whole-hour boundaries', () => {
    render(<Kit />);
    const tool = within(screen.getByRole('form', { name: 'Proyecta tus horas a partir de cuatro semanas' }));
    const hours = [6.43, 11.19, 11.19, 11.19].map((value, index) => ({
      input: tool.getByRole('textbox', { name: `Semana ${index + 1} (horas)` }),
      value: String(value).replace('.', ','),
    }));
    for (const { input, value } of hours) fireEvent.change(input, { target: { value } });
    const weeksOff = tool.getByRole('textbox', { name: 'Semanas sin actividad al año' });
    const previous = tool.getByRole('textbox', { name: /Horas de tu cálculo anterior/ });
    const calculate = tool.getByRole('button', { name: 'Calcular mi previsión de horas' });
    fireEvent.change(weeksOff, { target: { value: '1,6' } });
    fireEvent.change(previous, { target: { value: '50' } });
    fireEvent.click(calculate);
    expect(tool.getByText('Horas enteras al mes para tu cálculo').nextElementSibling).toHaveTextContent('42 h');
    expect(tool.getByRole('status')).toHaveTextContent('8 h menos al mes');

    fireEvent.change(hours[0].input, { target: { value: '' } });
    expect(tool.getByRole('status')).toBeEmptyDOMElement();
    fireEvent.click(calculate);
    expect(hours[0].input).toHaveFocus();
    expect(hours[0].input).toHaveAttribute('aria-invalid', 'true');

    fireEvent.change(hours[0].input, { target: { value: '0' } });
    fireEvent.change(weeksOff, { target: { value: '52' } });
    fireEvent.click(calculate);
    expect(tool.getByText('Horas enteras al mes para tu cálculo').nextElementSibling).toHaveTextContent('0 h');
    expect(tool.getByRole('status')).toHaveTextContent('Revisa el registro o las semanas de actividad');
  });
});
