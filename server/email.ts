import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(options: SendEmailOptions) {
  const { to, subject, html, from = 'onboarding@resend.dev' } = options;
  
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
