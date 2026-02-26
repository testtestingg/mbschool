// File: api/dump-data.ts

import { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

// Initialize Resend with your API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // The data sent from your React component's `createEmailPayload` function
    const { to, subject, html, text } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Missing required email fields (to, subject, html)' });
    }
 
    console.log(`--- SENDING REGISTRATION EMAIL TO: mbsschoolmbs@gmail.com ---`);

    // Send the email using Resend
    const { data, error } = await resend.emails.send({
      // Using Resend's default domain for now
      from: 'MBSchool Registration <noreply@mbschool.tn>', 
      // Send to your account email for now (until domain is verified)
      to: ['mbsschoolmbs@gmail.com'],
      subject: subject,
      html: html, // The nice HTML version of the email
      text: text, // The plain text version of the email
    });

    if (error) {
      console.error('Error sending email via Resend:', error);
      return res.status(500).json({ error: 'Failed to send email.', details: error.message });
    }

    console.log('Registration email sent successfully!');
    return res.status(200).json({ message: 'Registration sent successfully!' });

  } catch (e: any) {
    console.error('Error in send-email API route:', e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}