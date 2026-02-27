import { defineMiddleware } from "astro:middleware";

const NON_DEFAULT_LOCALES = ['en', 'fr', 'es', 'it'];

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
      context.locals.locale = locale;
      return context.rewrite(basePath);
    }
  }

  context.locals.locale = 'de';
  return next();
});
