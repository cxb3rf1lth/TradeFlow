import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(options: SendEmailOptions) {
  const { to, subject, html, from = 'onboarding@resend.dev' } = options;
  
  if (!resend) {
    console.warn('Email not configured - RESEND_API_KEY not set');
    return { success: false, error: 'Email service not configured' };
  }
  
  try {
    const data = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });
    
    return { success: true, data };
  } catch (error: any) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
}

export function formatEmailBody(body: string): string {
  // Convert plain text to HTML with basic formatting
  return body
    .split('\n\n')
    .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
    .join('');
}
