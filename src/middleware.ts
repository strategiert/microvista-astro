import { defineMiddleware } from "astro:middleware";

const NON_DEFAULT_LOCALES = ['en', 'fr', 'es', 'it'];

// Legacy EN redirects (alte WordPress-URLs → neue Astro-URLs)
// basePath = Pfad OHNE /en/ Präfix, z.B. "/posts/mein-artikel"
function getEnRedirect(basePath: string): string | null {
  // Wildcard: /posts/slug → /en/magazin/slug
  if (basePath === '/posts' || basePath === '/posts/') {
    return '/en/magazin';
  }
  if (basePath.startsWith('/posts/')) {
    return `/en/magazin${basePath.substring(6)}`;
  }
  // /presse-en/anything → /en/newsroom
  if (basePath.startsWith('/presse-en/') || basePath === '/presse-en') {
    return '/en/newsroom';
  }
  // /industrial-computed-tomography/inspection-tasks/slug → /en/pruefaufgaben/slug
  if (basePath.startsWith('/industrial-computed-tomography/inspection-tasks/')) {
    const TASK_SLUGS: Record<string, string> = {
      'porosity-analysis': 'porositaetsanalyse',
      'wall-thickness-measurement': 'wanddickenmessung',
      'assembly-and-joining-inspection': 'montage-fuegekontrolle',
      'burr-core-residues-and-chips': 'grat-kernreste-spaene',
      'quality-assurance-for-hairpin-stators': 'hairpin-stator-pruefung',
      'reverse-engineerin': 'reverse-engineering',
      'initial-sample-inspection-report': 'erstmusterpruefbericht',
    };
    const slug = basePath.split('/').filter(Boolean).pop() ?? '';
    if (TASK_SLUGS[slug]) return `/en/pruefaufgaben/${TASK_SLUGS[slug]}`;
    return '/en/pruefaufgaben';
  }
  // /industrial-computed-tomography/services/slug → /en/dienstleistungen/slug
  if (basePath.startsWith('/industrial-computed-tomography/services/')) {
    const SERVICE_SLUGS: Record<string, string> = {
      'ct-laboratory': 'ct-labor',
      'ct-data-analysis': 'ct-datenauswertung',
      'scanexpress-mobile-industrial-ct': 'scanexpress',
    };
    const slug = basePath.split('/').filter(Boolean).pop() ?? '';
    if (SERVICE_SLUGS[slug]) return `/en/dienstleistungen/${SERVICE_SLUGS[slug]}`;
    return '/en/dienstleistungen';
  }

  // Exakte Redirects (trailing slash egal)
  const normalized = basePath.replace(/\/$/, '');
  const EXACT: Record<string, string> = {
    '/press-releases': '/en/pressemitteilungen',
    '/media-library': '/en/mediathek',
    '/news-center': '/en/newsroom',
    '/industrial-computed-tomography/inspection-tasks': '/en/pruefaufgaben',
    '/cad-target-actual-comparison': '/en/pruefaufgaben/cad-soll-ist-vergleich',
    '/industrial-computed-tomography/services': '/en/dienstleistungen',
    '/industrial-computed-tomography/faq-2': '/en/faq',
    '/serial-testing': '/en/zerstoerungsfreie-serienpruefung',
    '/bonusprogramm': '/en/bonusprogramm',
    '/fragebogen': '/en/fragebogen',
    '/forschung-entwicklung': '/en/forschung-entwicklung',
    '/live-demo-scanexpress': '/en/live-demo-scanexpress',
    '/mediathek': '/en/mediathek',
    '/pressemitteilungen': '/en/pressemitteilungen',
    '/zerstoerungsfreie-serienpruefung': '/en/zerstoerungsfreie-serienpruefung',
    '/data-privacy': '/en/datenschutz',
    '/cookie-policy': '/en/datenschutz',
    '/imprint': '/en/impressum',
    '/general-terms-and-conditions': '/en/agb',
    '/contact': '/en/kontakt',
    '/employees': '/en/team',
    '/certificates': '/en/zertifizierungen',
    '/reward-program': '/en/bonusprogramm',
    '/newsletter-registration': '/en/newsletter',
    '/questionnaire': '/en/fragebogen',
    '/research-development': '/en/forschung-entwicklung',
    '/environmental-alliance-saxony-anhalt': '/en/zertifizierungen',
    '/drive-efficiency-eliminate-scrap-see-the-power-of-mobile-industrial-ct': '/en/dienstleistungen/scanexpress',
    '/registration-live-demo-scanexpress': '/en/live-demo-scanexpress',
    '/non-destructive-weld-testing-methods-procedures-and-techniques': '/en/pruefaufgaben/schweissnahtpruefung',
    '/measuring-geometric-tolerances-gdt-methods-and-procedures': '/en/pruefaufgaben/form-und-lagetoleranzen',
  };
  return EXACT[normalized] ?? null;
}

// Legacy FR redirects (alte WordPress-URLs → neue Astro-URLs)
// basePath = Pfad OHNE /fr/ Präfix
function getFrRedirect(basePath: string): string | null {
  const normalized = basePath.replace(/\/$/, '');
  const EXACT: Record<string, string> = {
    '/impression': '/impressum',
    '/declaration-de-confidentialite-ue': '/datenschutz',
    '/clause-de-non-responsabilite': '/datenschutz',
    '/politique-en-matiere-de-cookies': '/datenschutz',
    '/scanexpress-ct-industriel-mobile': '/dienstleistungen/scanexpress',
  };
  return EXACT[normalized] ?? null;
}

export const onRequest = defineMiddleware(async (context, next) => {
  // After rewrite, middleware re-runs — don't overwrite the locale
  if (context.locals.locale) {
    return next();
  }

  const { pathname } = context.url;

  // Keep Keystatic routes outside locale rewrites.
  if (pathname === '/keystatic') {
    context.locals.locale = 'de';
    return next();
  }

  if (pathname.startsWith('/keystatic/')) {
    context.locals.locale = 'de';
    return context.rewrite('/keystatic');
  }

  if (pathname.startsWith('/api/keystatic/')) {
    context.locals.locale = 'de';
    return next();
  }

  for (const locale of NON_DEFAULT_LOCALES) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      const basePath = pathname.substring(locale.length + 1) || '/';

      // Legacy-Redirects für alte WordPress-URLs (301 im Worker)
      if (locale === 'en') {
        const redirect = getEnRedirect(basePath);
        if (redirect) {
          return context.redirect(redirect, 301);
        }
      } else if (locale === 'fr') {
        const redirect = getFrRedirect(basePath);
        if (redirect) {
          return context.redirect(redirect, 301);
        }
      }

      context.locals.locale = locale;
      return context.rewrite(basePath);
    }
  }

  context.locals.locale = 'de';
  return next();
});
