import { defineCollection, z } from 'astro:content';

// Magazin (Blog) Collection
const magazin = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date(),
    updateDate: z.date().optional(),
    author: z.string().default('Microvista Team'),
    category: z.enum(['technologie', 'branchen', 'case-studies', 'news', 'tipps']),
    tags: z.array(z.string()).optional(),
    image: z.object({
      src: z.string(),
      alt: z.string()
    }).optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false)
  })
});

// Wiki Collection
const wiki = defineCollection({
  type: 'content',
  schema: z.object({
    term: z.string(),
    definition: z.string(),
    category: z.enum([
      'grundlagen',
      'verfahren',
      'qm',
      'materialien',
      'normen',
      'software',
      'hardware',
      'allgemein'
    ]),
    synonyms: z.array(z.string()).optional(),
    relatedTerms: z.array(z.string()).optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional()
  })
});

// Branchen Collection (YAML-basiert für programmatische Seiten)
const branchen = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    description: z.string(),
    heroImage: z.string(),
    challenges: z.array(z.object({
      title: z.string(),
      description: z.string()
    })),
    solutions: z.array(z.object({
      title: z.string(),
      description: z.string()
    })),
    useCases: z.array(z.string()),
    stats: z.array(z.object({
      value: z.string(),
      label: z.string()
    })).optional(),
    cta: z.object({
      title: z.string(),
      description: z.string()
    }),
    seo: z.object({
      title: z.string(),
      description: z.string()
    })
  })
});

// Prüfaufgaben Collection
const pruefaufgaben = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    description: z.string(),
    heroImage: z.string(),
    whatIs: z.string(),
    howItWorks: z.string(),
    benefits: z.array(z.string()),
    applications: z.array(z.string()),
    relatedBranchen: z.array(z.string()),
    relatedMaterialien: z.array(z.string()),
    faq: z.array(z.object({
      question: z.string(),
      answer: z.string()
    })).optional(),
    seo: z.object({
      title: z.string(),
      description: z.string()
    })
  })
});

// Materialien Collection
const materialien = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    description: z.string(),
    category: z.enum(['metalle', 'kunststoffe', 'verbundwerkstoffe', 'keramik', 'andere']),
    ctSuitability: z.enum(['sehr-gut', 'gut', 'mittel', 'schwierig']),
    density: z.string().optional(),
    typicalDefects: z.array(z.string()),
    applications: z.array(z.string()),
    relatedBranchen: z.array(z.string()),
    seo: z.object({
      title: z.string(),
      description: z.string()
    })
  })
});

export const collections = {
  magazin,
  wiki,
  branchen,
  pruefaufgaben,
  materialien
};
