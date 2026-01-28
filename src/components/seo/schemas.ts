/**
 * Schema.org Vorlagen für Microvista
 */

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Microvista GmbH",
  "url": "https://microvista.de",
  "logo": "https://microvista.de/images/logo.png",
  "description": "Industrielle Computertomographie für Labor und Serie. Anywhere. Anytime. Fast.",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "DE"
  },
  "sameAs": [
    "https://www.linkedin.com/company/microvista"
  ]
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Microvista",
  "url": "https://microvista.de",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://microvista.de/suche?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

export function articleSchema(options: {
  title: string;
  description: string;
  url: string;
  image: string;
  publishDate: Date;
  modifiedDate?: Date;
  author?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": options.title,
    "description": options.description,
    "url": options.url,
    "image": options.image,
    "datePublished": options.publishDate.toISOString(),
    "dateModified": (options.modifiedDate || options.publishDate).toISOString(),
    "author": {
      "@type": "Organization",
      "name": options.author || "Microvista"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Microvista",
      "logo": {
        "@type": "ImageObject",
        "url": "https://microvista.de/images/logo.png"
      }
    }
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

export function serviceSchema(options: {
  name: string;
  description: string;
  url: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": options.name,
    "description": options.description,
    "url": options.url,
    "provider": {
      "@type": "Organization",
      "name": "Microvista"
    },
    ...(options.image && { "image": options.image })
  };
}
