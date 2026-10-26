import { renderToStaticMarkup } from 'react-dom/server';
import Guide, { metadata } from '@/app/horas-facturables-freelance/page';
import BillingGuide from '@/components/CuantoFacturarAutonomoPage';
import TableGuide from '@/app/tabla-cuanto-facturar-autonomo/page';
import { getSiteUrl } from '@/lib/site';

vi.mock('@/components/LeadMagnetForm', () => ({ default: () => null }));

function htmlOf(page: React.ReactNode) {
  return new DOMParser().parseFromString(renderToStaticMarkup(page), 'text/html');
}

describe('billable hours guide crawlability', () => {
  it('includes valid structured data in HTML without running client scripts', () => {
    const document = htmlOf(<Guide />);
    const schemas = [...document.querySelectorAll('script[type="application/ld+json"]')]
      .map((script) => JSON.parse(script.textContent!));

    expect(schemas.map((schema) => schema['@type'])).toEqual(['Article', 'BreadcrumbList', 'FAQPage']);
    const url = new URL('/horas-facturables-freelance', getSiteUrl()).toString();
    expect(schemas[0].mainEntityOfPage).toBe(url);
    expect(schemas[1].itemListElement.at(-1).item).toBe(url);
    expect(schemas[2].mainEntity).toHaveLength(4);
    expect(document.querySelectorAll('h1')).toHaveLength(1);
    expect(metadata.alternates?.canonical).toBe('/horas-facturables-freelance');
  });

  it.each([BillingGuide, TableGuide])('links to the guide in related article content', (Page) => {
    const document = htmlOf(<Page />);
    const links = [...document.querySelectorAll('a[href="/horas-facturables-freelance"]')]
      .filter((link) => !link.closest('footer, header'));

    expect(links.length).toBeGreaterThan(0);
    expect(links[0].textContent).toMatch(/horas facturables/);
    const schemas = [...document.querySelectorAll('script[type="application/ld+json"]')]
      .map((script) => JSON.parse(script.textContent!));
    expect(schemas.map((schema) => schema['@type'])).toEqual(['Article', 'BreadcrumbList', 'FAQPage']);
    expect(schemas[0].mainEntityOfPage).not.toContain('/horas-facturables-freelance');
  });
});
