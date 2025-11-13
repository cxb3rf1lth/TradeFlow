import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(options: SendEmailOptions) {
  const { to, subject, html, from = 'onboarding@resend.dev' } = options;
  
  if (!resend) {
    console.error('Resend API key not configured');
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

// Import sanitization from utils
export { formatEmailBody } from './utils/sanitize';
