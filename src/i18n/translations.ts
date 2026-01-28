/**
 * Zentrale Übersetzungen für alle 5 Sprachen
 * DE (default), EN, FR, ES, IT
 */

export type Locale = 'de' | 'en' | 'fr' | 'es' | 'it';

export const localeNames: Record<Locale, string> = {
  de: 'Deutsch',
  en: 'English',
  fr: 'Français',
  es: 'Español',
  it: 'Italiano'
};

export const translations = {
  // Navigation
  nav: {
    labor: {
      de: 'Labor',
      en: 'Lab',
      fr: 'Laboratoire',
      es: 'Laboratorio',
      it: 'Laboratorio'
    },
    serie: {
      de: 'Serie',
      en: 'Series',
      fr: 'Série',
      es: 'Serie',
      it: 'Serie'
    },
    magazin: {
      de: 'Magazin',
      en: 'Magazine',
      fr: 'Magazine',
      es: 'Revista',
      it: 'Rivista'
    },
    wiki: {
      de: 'Wiki',
      en: 'Wiki',
      fr: 'Wiki',
      es: 'Wiki',
      it: 'Wiki'
    },
    branchen: {
      de: 'Branchen',
      en: 'Industries',
      fr: 'Secteurs',
      es: 'Sectores',
      it: 'Settori'
    },
    unternehmen: {
      de: 'Unternehmen',
      en: 'Company',
      fr: 'Entreprise',
      es: 'Empresa',
      it: 'Azienda'
    },
    kontakt: {
      de: 'Kontakt',
      en: 'Contact',
      fr: 'Contact',
      es: 'Contacto',
      it: 'Contatto'
    }
  },

  // Labor Sub-Navigation
  laborNav: {
    erstmusterpruefung: {
      de: 'Erstmusterprüfung',
      en: 'First Article Inspection',
      fr: 'Inspection premier article',
      es: 'Inspección de primera muestra',
      it: 'Ispezione primo articolo'
    },
    schadensanalyse: {
      de: 'Schadensanalyse',
      en: 'Failure Analysis',
      fr: 'Analyse de défaillance',
      es: 'Análisis de fallas',
      it: 'Analisi dei guasti'
    },
    reverseEngineering: {
      de: 'Reverse Engineering',
      en: 'Reverse Engineering',
      fr: 'Rétro-ingénierie',
      es: 'Ingeniería inversa',
      it: 'Reverse engineering'
    }
  },

  // Serie Sub-Navigation
  serieNav: {
    inlineCt: {
      de: 'Inline-CT',
      en: 'Inline CT',
      fr: 'CT en ligne',
      es: 'CT en línea',
      it: 'CT in linea'
    },
    hundertProzent: {
      de: '100% Prüfung',
      en: '100% Inspection',
      fr: 'Inspection 100%',
      es: 'Inspección 100%',
      it: 'Ispezione 100%'
    },
    kiAutomatisierung: {
      de: 'KI-Automatisierung',
      en: 'AI Automation',
      fr: 'Automatisation IA',
      es: 'Automatización IA',
      it: 'Automazione IA'
    }
  },

  // Footer
  footer: {
    tagline: {
      de: 'Industrielle Computertomographie. Anywhere. Anytime. Fast.',
      en: 'Industrial Computed Tomography. Anywhere. Anytime. Fast.',
      fr: 'Tomographie industrielle. Partout. À tout moment. Rapide.',
      es: 'Tomografía computarizada industrial. En cualquier lugar. En cualquier momento. Rápido.',
      it: 'Tomografia industriale. Ovunque. In qualsiasi momento. Veloce.'
    },
    ressourcen: {
      de: 'Ressourcen',
      en: 'Resources',
      fr: 'Ressources',
      es: 'Recursos',
      it: 'Risorse'
    },
    downloads: {
      de: 'Downloads',
      en: 'Downloads',
      fr: 'Téléchargements',
      es: 'Descargas',
      it: 'Download'
    },
    ueberUns: {
      de: 'Über uns',
      en: 'About Us',
      fr: 'À propos',
      es: 'Sobre nosotros',
      it: 'Chi siamo'
    },
    karriere: {
      de: 'Karriere',
      en: 'Careers',
      fr: 'Carrières',
      es: 'Carreras',
      it: 'Carriere'
    },
    impressum: {
      de: 'Impressum',
      en: 'Imprint',
      fr: 'Mentions légales',
      es: 'Aviso legal',
      it: 'Note legali'
    },
    datenschutz: {
      de: 'Datenschutz',
      en: 'Privacy',
      fr: 'Confidentialité',
      es: 'Privacidad',
      it: 'Privacy'
    },
    copyright: {
      de: 'Alle Rechte vorbehalten.',
      en: 'All rights reserved.',
      fr: 'Tous droits réservés.',
      es: 'Todos los derechos reservados.',
      it: 'Tutti i diritti riservati.'
    }
  },

  // Common UI
  common: {
    readMore: {
      de: 'Weiterlesen',
      en: 'Read more',
      fr: 'Lire la suite',
      es: 'Leer más',
      it: 'Leggi di più'
    },
    learnMore: {
      de: 'Mehr erfahren',
      en: 'Learn more',
      fr: 'En savoir plus',
      es: 'Más información',
      it: 'Scopri di più'
    },
    contact: {
      de: 'Kontaktieren',
      en: 'Contact',
      fr: 'Contacter',
      es: 'Contactar',
      it: 'Contattare'
    },
    back: {
      de: 'Zurück',
      en: 'Back',
      fr: 'Retour',
      es: 'Volver',
      it: 'Indietro'
    },
    search: {
      de: 'Suchen',
      en: 'Search',
      fr: 'Rechercher',
      es: 'Buscar',
      it: 'Cerca'
    },
    all: {
      de: 'Alle',
      en: 'All',
      fr: 'Tous',
      es: 'Todos',
      it: 'Tutti'
    },
    tags: {
      de: 'Tags',
      en: 'Tags',
      fr: 'Tags',
      es: 'Etiquetas',
      it: 'Tag'
    }
  },

  // Magazin
  magazin: {
    title: {
      de: 'Magazin',
      en: 'Magazine',
      fr: 'Magazine',
      es: 'Revista',
      it: 'Rivista'
    },
    subtitle: {
      de: 'Fachwissen, Trends und Einblicke aus der Welt der industriellen Computertomographie',
      en: 'Expert knowledge, trends and insights from the world of industrial computed tomography',
      fr: 'Expertise, tendances et perspectives du monde de la tomographie industrielle',
      es: 'Conocimientos, tendencias e información del mundo de la tomografía industrial',
      it: 'Competenze, tendenze e approfondimenti dal mondo della tomografia industriale'
    },
    featured: {
      de: 'Empfohlen',
      en: 'Featured',
      fr: 'À la une',
      es: 'Destacados',
      it: 'In evidenza'
    },
    latest: {
      de: 'Neueste Artikel',
      en: 'Latest Articles',
      fr: 'Derniers articles',
      es: 'Últimos artículos',
      it: 'Ultimi articoli'
    },
    categories: {
      de: 'Kategorien',
      en: 'Categories',
      fr: 'Catégories',
      es: 'Categorías',
      it: 'Categorie'
    },
    noArticles: {
      de: 'Noch keine Artikel vorhanden.',
      en: 'No articles yet.',
      fr: 'Aucun article pour le moment.',
      es: 'Aún no hay artículos.',
      it: 'Nessun articolo ancora.'
    }
  },

  // Wiki
  wiki: {
    title: {
      de: 'CT-Lexikon',
      en: 'CT Glossary',
      fr: 'Glossaire CT',
      es: 'Glosario CT',
      it: 'Glossario CT'
    },
    subtitle: {
      de: 'Fachbegriffe der industriellen Computertomographie verständlich erklärt',
      en: 'Industrial computed tomography terms explained clearly',
      fr: 'Termes de la tomographie industrielle expliqués clairement',
      es: 'Términos de tomografía industrial explicados claramente',
      it: 'Termini della tomografia industriale spiegati chiaramente'
    },
    searchPlaceholder: {
      de: 'Begriff suchen...',
      en: 'Search term...',
      fr: 'Rechercher un terme...',
      es: 'Buscar término...',
      it: 'Cerca termine...'
    },
    entries: {
      de: 'Einträge',
      en: 'entries',
      fr: 'entrées',
      es: 'entradas',
      it: 'voci'
    },
    relatedTerms: {
      de: 'Verwandte Begriffe',
      en: 'Related Terms',
      fr: 'Termes associés',
      es: 'Términos relacionados',
      it: 'Termini correlati'
    },
    backToGlossary: {
      de: 'Zurück zum Lexikon',
      en: 'Back to Glossary',
      fr: 'Retour au glossaire',
      es: 'Volver al glosario',
      it: 'Torna al glossario'
    }
  },

  // Branchen
  branchen: {
    title: {
      de: 'Branchen',
      en: 'Industries',
      fr: 'Secteurs',
      es: 'Sectores',
      it: 'Settori'
    },
    subtitle: {
      de: 'Industrielle CT-Lösungen für Ihre Branche',
      en: 'Industrial CT solutions for your industry',
      fr: 'Solutions CT industrielles pour votre secteur',
      es: 'Soluciones CT industriales para su sector',
      it: 'Soluzioni CT industriali per il tuo settore'
    },
    challenges: {
      de: 'Ihre Herausforderungen',
      en: 'Your Challenges',
      fr: 'Vos défis',
      es: 'Sus desafíos',
      it: 'Le tue sfide'
    },
    solutions: {
      de: 'Unsere Lösungen',
      en: 'Our Solutions',
      fr: 'Nos solutions',
      es: 'Nuestras soluciones',
      it: 'Le nostre soluzioni'
    },
    applications: {
      de: 'Anwendungen',
      en: 'Applications',
      fr: 'Applications',
      es: 'Aplicaciones',
      it: 'Applicazioni'
    },
    notListed: {
      de: 'Ihre Branche nicht dabei?',
      en: 'Your industry not listed?',
      fr: 'Votre secteur n\'est pas listé?',
      es: '¿Su sector no está en la lista?',
      it: 'Il tuo settore non è elencato?'
    }
  },

  // Kontakt
  kontakt: {
    title: {
      de: 'Kontakt',
      en: 'Contact',
      fr: 'Contact',
      es: 'Contacto',
      it: 'Contatto'
    },
    subtitle: {
      de: 'Sprechen Sie mit unseren Experten',
      en: 'Talk to our experts',
      fr: 'Parlez à nos experts',
      es: 'Hable con nuestros expertos',
      it: 'Parla con i nostri esperti'
    },
    form: {
      name: {
        de: 'Name',
        en: 'Name',
        fr: 'Nom',
        es: 'Nombre',
        it: 'Nome'
      },
      email: {
        de: 'E-Mail',
        en: 'Email',
        fr: 'E-mail',
        es: 'Correo electrónico',
        it: 'E-mail'
      },
      company: {
        de: 'Unternehmen',
        en: 'Company',
        fr: 'Entreprise',
        es: 'Empresa',
        it: 'Azienda'
      },
      phone: {
        de: 'Telefon',
        en: 'Phone',
        fr: 'Téléphone',
        es: 'Teléfono',
        it: 'Telefono'
      },
      subject: {
        de: 'Betreff',
        en: 'Subject',
        fr: 'Sujet',
        es: 'Asunto',
        it: 'Oggetto'
      },
      message: {
        de: 'Nachricht',
        en: 'Message',
        fr: 'Message',
        es: 'Mensaje',
        it: 'Messaggio'
      },
      privacy: {
        de: 'Ich stimme der Verarbeitung meiner Daten gemäß der Datenschutzerklärung zu.',
        en: 'I agree to the processing of my data according to the Privacy Policy.',
        fr: 'J\'accepte le traitement de mes données conformément à la politique de confidentialité.',
        es: 'Acepto el procesamiento de mis datos según la política de privacidad.',
        it: 'Accetto il trattamento dei miei dati secondo l\'informativa sulla privacy.'
      },
      submit: {
        de: 'Nachricht senden',
        en: 'Send message',
        fr: 'Envoyer le message',
        es: 'Enviar mensaje',
        it: 'Invia messaggio'
      },
      sending: {
        de: 'Wird gesendet...',
        en: 'Sending...',
        fr: 'Envoi en cours...',
        es: 'Enviando...',
        it: 'Invio in corso...'
      },
      success: {
        de: 'Vielen Dank! Wir melden uns zeitnah bei Ihnen.',
        en: 'Thank you! We will get back to you shortly.',
        fr: 'Merci! Nous vous répondrons rapidement.',
        es: '¡Gracias! Nos pondremos en contacto pronto.',
        it: 'Grazie! Ti risponderemo presto.'
      },
      error: {
        de: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
        en: 'Something went wrong. Please try again.',
        fr: 'Une erreur s\'est produite. Veuillez réessayer.',
        es: 'Algo salió mal. Por favor, inténtelo de nuevo.',
        it: 'Qualcosa è andato storto. Per favore riprova.'
      }
    },
    info: {
      title: {
        de: 'Kontaktinformationen',
        en: 'Contact Information',
        fr: 'Informations de contact',
        es: 'Información de contacto',
        it: 'Informazioni di contatto'
      },
      address: {
        de: 'Adresse',
        en: 'Address',
        fr: 'Adresse',
        es: 'Dirección',
        it: 'Indirizzo'
      },
      hours: {
        de: 'Erreichbarkeit',
        en: 'Availability',
        fr: 'Disponibilité',
        es: 'Disponibilidad',
        it: 'Disponibilità'
      },
      hoursValue: {
        de: 'Mo-Fr: 8:00-17:00 Uhr',
        en: 'Mon-Fri: 8:00-17:00',
        fr: 'Lun-Ven: 8:00-17:00',
        es: 'Lun-Vie: 8:00-17:00',
        it: 'Lun-Ven: 8:00-17:00'
      }
    }
  },

  // Category Labels
  categories: {
    technologie: {
      de: 'Technologie',
      en: 'Technology',
      fr: 'Technologie',
      es: 'Tecnología',
      it: 'Tecnologia'
    },
    branchen: {
      de: 'Branchen',
      en: 'Industries',
      fr: 'Secteurs',
      es: 'Sectores',
      it: 'Settori'
    },
    caseStudies: {
      de: 'Case Studies',
      en: 'Case Studies',
      fr: 'Études de cas',
      es: 'Casos de estudio',
      it: 'Casi di studio'
    },
    news: {
      de: 'News',
      en: 'News',
      fr: 'Actualités',
      es: 'Noticias',
      it: 'Notizie'
    },
    tipps: {
      de: 'Tipps & Tricks',
      en: 'Tips & Tricks',
      fr: 'Trucs et astuces',
      es: 'Consejos y trucos',
      it: 'Suggerimenti e trucchi'
    },
    verfahren: {
      de: 'Verfahren',
      en: 'Methods',
      fr: 'Méthodes',
      es: 'Métodos',
      it: 'Metodi'
    },
    materialien: {
      de: 'Materialien',
      en: 'Materials',
      fr: 'Matériaux',
      es: 'Materiales',
      it: 'Materiali'
    },
    normen: {
      de: 'Normen & Standards',
      en: 'Standards',
      fr: 'Normes',
      es: 'Normas',
      it: 'Norme'
    },
    software: {
      de: 'Software',
      en: 'Software',
      fr: 'Logiciel',
      es: 'Software',
      it: 'Software'
    },
    hardware: {
      de: 'Hardware',
      en: 'Hardware',
      fr: 'Matériel',
      es: 'Hardware',
      it: 'Hardware'
    },
    allgemein: {
      de: 'Allgemein',
      en: 'General',
      fr: 'Général',
      es: 'General',
      it: 'Generale'
    }
  }
};

// Helper function to get translation
export function t(key: string, locale: Locale = 'de'): string {
  const keys = key.split('.');
  let value: any = translations;

  for (const k of keys) {
    if (value[k] === undefined) return key;
    value = value[k];
  }

  if (typeof value === 'object' && value[locale]) {
    return value[locale];
  }

  return key;
}

// Helper to get locale from URL or default
export function getLocale(url: URL): Locale {
  const path = url.pathname;
  const match = path.match(/^\/(en|fr|es|it)\//);
  return (match ? match[1] : 'de') as Locale;
}

// Helper to build localized path
export function localePath(path: string, locale: Locale): string {
  if (locale === 'de') return path;
  return `/${locale}${path}`;
}
