import { collection, config, fields, singleton } from '@keystatic/core';

const magazinCategoryOptions = [
  { label: 'Technologie', value: 'technologie' },
  { label: 'Branchen', value: 'branchen' },
  { label: 'Case Studies', value: 'case-studies' },
  { label: 'News', value: 'news' },
  { label: 'Tipps', value: 'tipps' },
] as const;

const wikiCategoryOptions = [
  { label: 'Grundlagen', value: 'grundlagen' },
  { label: 'Verfahren', value: 'verfahren' },
  { label: 'Qualitaetsmanagement', value: 'qm' },
  { label: 'Materialien', value: 'materialien' },
  { label: 'Normen', value: 'normen' },
  { label: 'Software', value: 'software' },
  { label: 'Hardware', value: 'hardware' },
  { label: 'Allgemein', value: 'allgemein' },
] as const;

const materialCategoryOptions = [
  { label: 'Metalle', value: 'metalle' },
  { label: 'Kunststoffe', value: 'kunststoffe' },
  { label: 'Verbundwerkstoffe', value: 'verbundwerkstoffe' },
  { label: 'Keramik', value: 'keramik' },
  { label: 'Andere', value: 'andere' },
] as const;

const ctSuitabilityOptions = [
  { label: 'Sehr gut', value: 'sehr-gut' },
  { label: 'Gut', value: 'gut' },
  { label: 'Mittel', value: 'mittel' },
  { label: 'Schwierig', value: 'schwierig' },
] as const;

const staticPageGroups = {
  Rechtliches: [
    'agb.md',
    'agb-en.md',
    'agb.fr.md',
    'agb.es.md',
    'agb.it.md',
    'datenschutz.md',
    'datenschutz-en.md',
    'datenschutz.fr.md',
    'datenschutz.es.md',
    'datenschutz.it.md',
    'impressum.md',
    'impressum-en.md',
    'impressum.fr.md',
    'impressum.es.md',
    'impressum.it.md',
    'cookie-richtlinie.md',
    'cookie-richtlinie-en.md',
  ],
  FAQ: ['faq-de.md', 'faq-en.md', 'faq.fr.md', 'faq.es.md', 'faq.it.md'],
  Unternehmen: [
    'team-de.md',
    'team-en.md',
    'team.fr.md',
    'team.es.md',
    'team.it.md',
    'zertifizierungen-de.md',
    'zertifizierungen-en.md',
    'zertifizierungen.fr.md',
    'zertifizierungen.es.md',
    'zertifizierungen.it.md',
    'forschung-entwicklung-de.md',
  ],
  Dienstleistungen: [
    'dienstleistung-ct-labor.md',
    'dienstleistung-ct-datenauswertung.md',
    'dienstleistung-scanexpress.md',
    'zerstoerungsfreie-serienpruefung-de.md',
    'live-demo-scanexpress-de.md',
  ],
  VertriebKampagnen: ['bonusprogramm-de.md', 'fragebogen-de.md'],
  NewsMedien: ['newsletter-de.md', 'newsroom-de.md', 'pressemitteilungen-de.md', 'mediathek-de.md'],
} as const;

const staticPageTitleOverrides: Record<string, string> = {
  agb: 'AGB',
  faq: 'FAQ',
  datenschutz: 'Datenschutz',
  impressum: 'Impressum',
  team: 'Team',
  zertifizierungen: 'Zertifizierungen',
  'cookie-richtlinie': 'Cookie Richtlinie',
  newsletter: 'Newsletter',
  newsroom: 'Newsroom',
  pressemitteilungen: 'Pressemitteilungen',
  mediathek: 'Mediathek',
};

const localeLabel: Record<string, string> = {
  de: 'DE',
  en: 'EN',
  fr: 'FR',
  es: 'ES',
  it: 'IT',
};

function createMagazinCollection(label: string, path: string) {
  return collection({
    label,
    path,
    entryLayout: 'content',
    slugField: 'title',
    format: { contentField: 'content' },
    columns: ['title', 'publishDate', 'category', 'featured', 'draft'],
    schema: {
      title: fields.text({ label: 'Titel', validation: { isRequired: true } }),
      description: fields.text({
        label: 'Beschreibung',
        multiline: true,
        validation: { isRequired: true },
      }),
      publishDate: fields.date({
        label: 'Veroeffentlichung',
        validation: { isRequired: true },
      }),
      updateDate: fields.date({ label: 'Update' }),
      author: fields.text({ label: 'Autor', defaultValue: 'Microvista Team' }),
      category: fields.select({
        label: 'Kategorie',
        options: magazinCategoryOptions,
        defaultValue: 'news',
      }),
      tags: fields.array(fields.text({ label: 'Tag' }), {
        label: 'Tags',
        itemLabel: (props) => `${props.value || 'Tag'}`,
      }),
      image: fields.object(
        {
          src: fields.text({ label: 'Bild URL' }),
          alt: fields.text({ label: 'Bild Alt-Text' }),
        },
        { label: 'Bild' },
      ),
      featured: fields.checkbox({ label: 'Featured' }),
      draft: fields.checkbox({ label: 'Entwurf', defaultValue: false }),
      content: fields.mdx({ label: 'Inhalt', extension: 'mdx' }),
    },
  });
}

function createWikiCollection(label: string, path: string) {
  return collection({
    label,
    path,
    entryLayout: 'content',
    slugField: 'term',
    format: { contentField: 'content' },
    columns: ['term', 'category'],
    schema: {
      term: fields.text({ label: 'Begriff', validation: { isRequired: true } }),
      definition: fields.text({
        label: 'Kurzdefinition',
        multiline: true,
        validation: { isRequired: true },
      }),
      category: fields.select({
        label: 'Kategorie',
        options: wikiCategoryOptions,
        defaultValue: 'allgemein',
      }),
      synonyms: fields.array(fields.text({ label: 'Synonym' }), {
        label: 'Synonyme',
      }),
      relatedTerms: fields.array(fields.text({ label: 'Verwandter Begriff' }), {
        label: 'Verwandte Begriffe',
      }),
      seoTitle: fields.text({ label: 'SEO Titel' }),
      seoDescription: fields.text({
        label: 'SEO Beschreibung',
        multiline: true,
      }),
      content: fields.mdx({ label: 'Inhalt', extension: 'mdx' }),
    },
  });
}

function parseStaticPageMetadata(fileName: string) {
  const baseName = fileName.replace(/\.md$/i, '');
  const dotLocaleMatch = baseName.match(/^(.*)\.(de|en|fr|es|it)$/i);
  if (dotLocaleMatch) {
    return {
      pageKey: dotLocaleMatch[1].toLowerCase(),
      locale: dotLocaleMatch[2].toLowerCase(),
    };
  }

  const dashLocaleMatch = baseName.match(/^(.*)-(de|en|fr|es|it)$/i);
  if (dashLocaleMatch) {
    return {
      pageKey: dashLocaleMatch[1].toLowerCase(),
      locale: dashLocaleMatch[2].toLowerCase(),
    };
  }

  return { pageKey: baseName.toLowerCase(), locale: 'de' };
}

function humanizePageKey(pageKey: string): string {
  const override = staticPageTitleOverrides[pageKey];
  if (override) return override;
  return pageKey
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function toStaticKey(fileName: string): string {
  return `static_${fileName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')}`;
}

function createStaticPageSingleton(fileName: string) {
  const { pageKey, locale } = parseStaticPageMetadata(fileName);
  const pageLabel = humanizePageKey(pageKey);
  const localeShort = localeLabel[locale] || locale.toUpperCase();
  return singleton({
    label: `${pageLabel} (${localeShort})`,
    path: `src/data/static-pages/${fileName}`,
    format: { contentField: 'content' },
    schema: {
      content: fields.mdx({ label: 'Inhalt', extension: 'md' }),
    },
  });
}

const staticSingletons = Object.fromEntries(
  Object.values(staticPageGroups)
    .flat()
    .map((fileName) => [toStaticKey(fileName), createStaticPageSingleton(fileName)]),
);

const staticNavigation = Object.fromEntries(
  Object.entries(staticPageGroups).map(([section, fileNames]) => [
    section,
    fileNames.map(toStaticKey),
  ]),
);

export default config({
  storage: { kind: 'local' },
  ui: {
    brand: { name: 'Microvista CMS' },
    navigation: {
      Inhalt: [
        'magazin_de',
        'magazin_en',
        'wiki_de',
        'branchen',
        'pruefaufgaben',
        'materialien',
      ],
      ...staticNavigation,
    } as any,
  },
  collections: {
    magazin_de: createMagazinCollection('Magazin (DE)', 'src/content/magazin/de/*'),
    magazin_en: createMagazinCollection('Magazin (EN)', 'src/content/magazin/en/*'),
    wiki_de: createWikiCollection('Wiki (DE)', 'src/content/wiki/de/*'),
    branchen: collection({
      label: 'Branchen',
      path: 'src/content/branchen/*',
      slugField: 'slug',
      format: 'yaml',
      columns: ['name', 'slug'],
      schema: {
        name: fields.text({ label: 'Name', validation: { isRequired: true } }),
        slug: fields.text({ label: 'Slug', validation: { isRequired: true } }),
        description: fields.text({
          label: 'Beschreibung',
          multiline: true,
          validation: { isRequired: true },
        }),
        heroImage: fields.text({ label: 'Hero Bild', validation: { isRequired: true } }),
        challenges: fields.array(
          fields.object({
            title: fields.text({ label: 'Titel' }),
            description: fields.text({ label: 'Beschreibung', multiline: true }),
          }),
          { label: 'Herausforderungen' },
        ),
        solutions: fields.array(
          fields.object({
            title: fields.text({ label: 'Titel' }),
            description: fields.text({ label: 'Beschreibung', multiline: true }),
          }),
          { label: 'Loesungen' },
        ),
        useCases: fields.array(fields.text({ label: 'Anwendungsfall' }), {
          label: 'Anwendungsfaelle',
        }),
        stats: fields.array(
          fields.object({
            value: fields.text({ label: 'Wert' }),
            label: fields.text({ label: 'Label' }),
          }),
          { label: 'Kennzahlen' },
        ),
        cta: fields.object(
          {
            title: fields.text({ label: 'CTA Titel' }),
            description: fields.text({ label: 'CTA Beschreibung', multiline: true }),
          },
          { label: 'CTA' },
        ),
        seo: fields.object(
          {
            title: fields.text({ label: 'SEO Titel' }),
            description: fields.text({ label: 'SEO Beschreibung', multiline: true }),
          },
          { label: 'SEO' },
        ),
      },
    }),
    pruefaufgaben: collection({
      label: 'Pruefaufgaben',
      path: 'src/content/pruefaufgaben/*',
      slugField: 'slug',
      format: 'yaml',
      columns: ['name', 'slug'],
      schema: {
        name: fields.text({ label: 'Name', validation: { isRequired: true } }),
        slug: fields.text({ label: 'Slug', validation: { isRequired: true } }),
        description: fields.text({
          label: 'Beschreibung',
          multiline: true,
          validation: { isRequired: true },
        }),
        heroImage: fields.text({ label: 'Hero Bild', validation: { isRequired: true } }),
        whatIs: fields.text({ label: 'Was ist das?', multiline: true }),
        howItWorks: fields.text({ label: 'Wie funktioniert es?', multiline: true }),
        benefits: fields.array(fields.text({ label: 'Vorteil' }), { label: 'Vorteile' }),
        applications: fields.array(fields.text({ label: 'Anwendung' }), { label: 'Anwendungen' }),
        relatedBranchen: fields.array(fields.text({ label: 'Branchen Slug' }), {
          label: 'Verwandte Branchen',
        }),
        relatedMaterialien: fields.array(fields.text({ label: 'Material Slug' }), {
          label: 'Verwandte Materialien',
        }),
        faq: fields.array(
          fields.object({
            question: fields.text({ label: 'Frage' }),
            answer: fields.text({ label: 'Antwort', multiline: true }),
          }),
          { label: 'FAQ' },
        ),
        seo: fields.object(
          {
            title: fields.text({ label: 'SEO Titel' }),
            description: fields.text({ label: 'SEO Beschreibung', multiline: true }),
          },
          { label: 'SEO' },
        ),
      },
    }),
    materialien: collection({
      label: 'Materialien',
      path: 'src/content/materialien/*',
      slugField: 'slug',
      format: 'yaml',
      columns: ['name', 'slug', 'category', 'ctSuitability'],
      schema: {
        name: fields.text({ label: 'Name', validation: { isRequired: true } }),
        slug: fields.text({ label: 'Slug', validation: { isRequired: true } }),
        description: fields.text({
          label: 'Beschreibung',
          multiline: true,
          validation: { isRequired: true },
        }),
        category: fields.select({
          label: 'Kategorie',
          options: materialCategoryOptions,
          defaultValue: 'metalle',
        }),
        ctSuitability: fields.select({
          label: 'CT Eignung',
          options: ctSuitabilityOptions,
          defaultValue: 'gut',
        }),
        density: fields.text({ label: 'Dichte' }),
        typicalDefects: fields.array(fields.text({ label: 'Defekt' }), {
          label: 'Typische Defekte',
        }),
        applications: fields.array(fields.text({ label: 'Anwendung' }), {
          label: 'Anwendungen',
        }),
        relatedBranchen: fields.array(fields.text({ label: 'Branchen Slug' }), {
          label: 'Verwandte Branchen',
        }),
        seo: fields.object(
          {
            title: fields.text({ label: 'SEO Titel' }),
            description: fields.text({ label: 'SEO Beschreibung', multiline: true }),
          },
          { label: 'SEO' },
        ),
      },
    }),
  },
  singletons: staticSingletons as any,
});
