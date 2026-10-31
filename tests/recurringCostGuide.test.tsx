import { render, screen, within } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import Guide, { metadata } from '@/app/cuanto-cuesta-ser-autonomo/page';

describe('recurring-cost guide', () => {
  it('shows a reproducible example using the same initial payments as the calculator', () => {
    render(<Guide />);
    const region = screen.getByRole('region', { name: 'Ejemplo de costes con varias frecuencias' });
    const software = within(region).getByRole('rowheader', { name: 'Software y herramientas' }).closest('tr')!;
    expect(within(software).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['420,00 €', '1', '420,00 €', '35,00 €']);
    expect(within(region).getByRole('rowheader', { name: 'Total del ejemplo' }).closest('tr')).toHaveTextContent('5760,00');
    expect(screen.getByRole('link', { name: 'Ajustar pagos y frecuencias' })).toHaveAttribute('href', '#costes-mensuales');
    expect(screen.getByText(/Estos son los datos ficticios/)).toBeVisible();
    expect(screen.getByText(/Repartir 420 EUR entre 12 meses/)).toHaveTextContent('no cubre por sí sola el pago próximo');
    expect(screen.getByRole('link', { name: 'régimen general del IVA' })).toHaveAttribute('href', 'https://sede.agenciatributaria.gob.es/Sede/iva/regimenes-tributacion-iva/regimen-general.html');
  });

  it('renders the method and structured data in initial HTML without a signup gate', () => {
    const document = new DOMParser().parseFromString(renderToStaticMarkup(<Guide />), 'text/html');
    const schemas = [...document.querySelectorAll('script[type="application/ld+json"]')].map((script) => JSON.parse(script.textContent!));
    expect(schemas.map((schema) => schema['@type'])).toEqual(['WebPage', 'BreadcrumbList', 'FAQPage']);
    expect(schemas[0].dateModified).toBe('2026-10-31');
    expect(schemas[2].mainEntity).toHaveLength(7);
    for (const question of schemas[2].mainEntity) {
      expect(document.body.textContent).toContain(question.name);
      expect(document.body.textContent).toContain(question.acceptedAnswer.text);
    }
    expect(document.body.textContent).toContain('Conservamos los 100 EUR en el total anual');
    const method = document.querySelector('section[aria-labelledby="media-y-vencimientos"]')!;
    expect(method.textContent).toContain('Redondeamos cada pago a céntimos antes de repetirlo según su frecuencia');
    expect(method.textContent).toContain('128,075 EUR se redondean a 128,08 EUR');
    expect(method.textContent).toContain('128,08 × 12 = 1536,96 EUR al año');
    expect(method.textContent).toContain('128,08 × 4 = 512,32 EUR al año');
    expect(method.textContent).toContain('El reparto se redondea a céntimos y se muestra antes de abrir la calculadora');
    const calculatorIntro = document.querySelector('section[aria-labelledby="cost-calculator-heading"] .cost-calculator-copy')!;
    expect(calculatorIntro.textContent).toContain('Puedes sumar los pagos y ver la media mensual y el total anual sin indicar horas');
    expect(calculatorIntro.textContent).toContain('Al indicar horas válidas mayores que cero, verás también el coste por hora facturable');
    expect(calculatorIntro.textContent).toContain('Para trasladar estos costes a la tarifa, las horas deben ser enteras y mayores que cero');
    expect(document.querySelector('input[type="email"]')).toBeNull();
    expect(metadata.alternates?.canonical).toBe('/cuanto-cuesta-ser-autonomo');
    expect(document.querySelectorAll('h1')).toHaveLength(1);
  });

  it('renders a dated example and a direct route from the monthly plan without collecting account details', () => {
    const document = new DOMParser().parseFromString(renderToStaticMarkup(<Guide />), 'text/html');
    const section = document.querySelector('section[aria-labelledby="vencimientos-caja"]')!;
    const table = section.querySelector('table')!;
    expect(table.textContent).toContain('05/11/2026');
    expect(table.textContent).toContain('-800,00');
    expect(table.textContent).toContain('1600,00');
    expect(table.textContent).toContain('700,00');
    expect(section.textContent).toContain('todos los pagos antes de cualquier cobro');
    expect(section.textContent).toContain('saldo mínimo real podría ser mayor');
    expect(section.querySelectorAll('input:not([type="file"])')).toHaveLength(7);
    expect(section.querySelector('input[type="file"]')?.getAttribute('accept')).toBe('.json,application/json');
    expect(section.querySelector('#guardar-plan-caja')?.textContent).toBe('Conserva el plan para revisarlo otro día');
    expect(section.textContent).toContain('Antes de probar por primera vez las fechas ficticias');
    expect(section.textContent).toContain('aunque estén incompletos');
    expect(section.textContent).toContain('«Recuperar mi plan anterior» restaura esa copia y sustituye los cambios posteriores');
    expect(section.textContent).toContain('Editar los datos o repetir el ejemplo no reemplaza la copia');
    expect(section.textContent).toContain('Después de recuperarla, pulsa «Comprobar vencimientos» para actualizar los saldos');
    expect(section.textContent).toContain('Esta copia se pierde al salir o recargar; usa el archivo para conservar un plan comprobado');
    expect(section.textContent).toContain('Si el archivo no es válido, el plan actual se mantiene');
    expect(section.querySelectorAll('select')).toHaveLength(3);
    expect(section.querySelector('form')).toBeNull();
    expect(section.querySelectorAll('[name]')).toHaveLength(0);
    expect(document.querySelector('a[href="#vencimientos-caja"]')?.textContent).toBe('Revisar cobros y pagos por fecha');
    expect(document.querySelector('time')?.getAttribute('datetime')).toBe('2026-10-31');
    expect(document.querySelector('time')?.textContent).toBe('31 de octubre de 2026');
  });

  it('keeps the cash-flow method, earlier deficit and receipt-delay case in initial HTML', () => {
    render(<Guide />);
    const region = screen.getByRole('region', { name: 'Ejemplo ficticio de caja de tres meses' });
    const first = within(region).getByRole('rowheader', { name: 'Mes 1' }).closest('tr')!;
    expect(within(first).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['1000,00 €', '0,00 €', '1800,00 €', '-800,00 €']);
    expect(within(region).getByRole('rowheader', { name: 'Mes 3' }).closest('tr')).toHaveTextContent('700,00');
    const section = region.closest('section')!;
    expect(section).toHaveTextContent('-2600,00');
    expect(section).toHaveTextContent('antes de un cobro dentro del mes');
    expect(section.querySelector('form')).toBeNull();
    expect(section.querySelectorAll('input[name]')).toHaveLength(0);
    expect(screen.getByRole('link', { name: 'plan de cobros y pagos de tres meses' })).toHaveAttribute('href', '#plan-caja');
  });
});
