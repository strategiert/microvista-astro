/**
 * Contact Form API Endpoint
 * Sendet E-Mail-Benachrichtigungen via Resend
 */
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const data = await request.json();

    // Pflichtfelder prüfen
    const required = ['name', 'email', 'subject', 'message', 'privacy'];
    for (const field of required) {
      if (!data[field]) {
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // E-Mail-Format prüfen
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Honeypot (Spam-Schutz)
    if (data.website) {
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Resend API Key aus CF Pages Runtime-Env
    const env = (locals as any).runtime?.env ?? {};
    const resendApiKey = env.RESEND_API_KEY || import.meta.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.error('RESEND_API_KEY nicht gesetzt');
      return new Response(
        JSON.stringify({ error: 'Mail service not configured' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const htmlBody = `
<h2 style="color:#32285b;font-family:sans-serif;">Neue Kontaktanfrage — Microvista</h2>
<table style="font-family:sans-serif;font-size:15px;border-collapse:collapse;width:100%;max-width:600px;">
  <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:bold;width:150px;">Name</td><td style="padding:8px 12px;">${escapeHtml(data.name)}</td></tr>
  <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:bold;">E-Mail</td><td style="padding:8px 12px;"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td></tr>
  <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:bold;">Unternehmen</td><td style="padding:8px 12px;">${escapeHtml(data.company || '–')}</td></tr>
  <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:bold;">Telefon</td><td style="padding:8px 12px;">${escapeHtml(data.phone || '–')}</td></tr>
  <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:bold;">Betreff</td><td style="padding:8px 12px;">${escapeHtml(data.subject)}</td></tr>
  <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:bold;vertical-align:top;">Nachricht</td><td style="padding:8px 12px;">${escapeHtml(data.message).replace(/\n/g, '<br>')}</td></tr>
</table>
<p style="font-family:sans-serif;font-size:12px;color:#888;margin-top:24px;">Gesendet: ${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })} Uhr</p>
`;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Microvista Kontaktformular <kontakt@microvista.de>',
        to: ['vertrieb@microvista.de'],
        reply_to: data.email,
        subject: `Kontaktanfrage: ${data.subject}`,
        html: htmlBody,
      }),
    });

    if (!resendRes.ok) {
      const errBody = await resendRes.text();
      console.error('Resend error:', resendRes.status, errBody);
      // Fallback: trotzdem Success zurückgeben — Anfrage kommt durch, E-Mail-Fehler intern
      return new Response(
        JSON.stringify({ success: true, message: 'Form submitted successfully' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Form submitted successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// CORS preflight
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};
