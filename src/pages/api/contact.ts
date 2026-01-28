/**
 * Contact Form API Endpoint
 * Handles form submissions and sends emails via Cloudflare Workers
 */
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    // Validate required fields
    const required = ['name', 'email', 'subject', 'message', 'privacy'];
    for (const field of required) {
      if (!data[field]) {
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check honeypot (spam protection)
    if (data.website) {
      // Silent fail for bots
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // In production, send email via service (Resend, SendGrid, etc.)
    // For now, log the submission
    console.log('Contact form submission:', {
      name: data.name,
      email: data.email,
      company: data.company || '',
      phone: data.phone || '',
      subject: data.subject,
      message: data.message,
      timestamp: new Date().toISOString()
    });

    // TODO: Implement email sending
    // Example with Resend:
    // const resend = new Resend(import.meta.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'noreply@microvista.de',
    //   to: 'info@microvista.de',
    //   subject: `Kontaktanfrage: ${data.subject}`,
    //   html: `
    //     <h2>Neue Kontaktanfrage</h2>
    //     <p><strong>Name:</strong> ${data.name}</p>
    //     <p><strong>E-Mail:</strong> ${data.email}</p>
    //     <p><strong>Unternehmen:</strong> ${data.company || '-'}</p>
    //     <p><strong>Telefon:</strong> ${data.phone || '-'}</p>
    //     <p><strong>Betreff:</strong> ${data.subject}</p>
    //     <p><strong>Nachricht:</strong></p>
    //     <p>${data.message.replace(/\n/g, '<br>')}</p>
    //   `
    // });

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

// Handle OPTIONS for CORS
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
