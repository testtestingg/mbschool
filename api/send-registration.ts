// File: api/send-registration.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface RegistrationData {
  fullName: string;
  email: string;
  studentPhone: string;
  school: string;
  address: string;
  additionalMessage: string;
  level: string;
  grade: string;
  section: string;
  courses: string[];
  moyenneGenerale: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const data: RegistrationData = req.body;

    // Basic Server-side Validation
    if (!data.fullName || !data.studentPhone || !data.level) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // HTML Email Template
    const emailHtml = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #03CCED 0%, #02aabf 100%); color: white; padding: 30px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 30px; color: #333; }
          .section-title { color: #0E2138; font-size: 18px; border-bottom: 2px solid #03CCED; padding-bottom: 8px; margin-bottom: 15px; margin-top: 25px; font-weight: bold; }
          .row { display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #f0f0f0; padding-bottom: 8px; }
          .label { font-weight: bold; color: #555; width: 40%; }
          .value { width: 60%; color: #000; text-align: left; }
          .tag { display: inline-block; background: #e0f7fa; color: #006064; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin: 2px; }
          .footer { background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📄 تسجيل جديد: MBSchool</h1>
          </div>
          <div class="content">
            
            <div class="section-title">👤 معلومات الطالب</div>
            <div class="row"><span class="label">الاسم الكامل:</span> <span class="value">${data.fullName}</span></div>
            <div class="row"><span class="label">الهاتف:</span> <span class="value"><a href="tel:${data.studentPhone}" style="color: #03CCED; text-decoration: none;">${data.studentPhone}</a></span></div>
            <div class="row"><span class="label">العنوان:</span> <span class="value">${data.address}</span></div>
            ${data.email ? `<div class="row"><span class="label">البريد:</span> <span class="value">${data.email}</span></div>` : ''}

            <div class="section-title">📚 المعلومات الدراسية</div>
            <div class="row"><span class="label">المعهد/المدرسة:</span> <span class="value">${data.school}</span></div>
            <div class="row"><span class="label">المعدل العام:</span> <span class="value" style="font-weight:bold; color:#03CCED;">${data.moyenneGenerale}</span></div>
            <div class="row"><span class="label">المرحلة:</span> <span class="value">${data.level}</span></div>
            ${data.grade ? `<div class="row"><span class="label">السنة:</span> <span class="value">${data.grade}</span></div>` : ''}
            ${data.section ? `<div class="row"><span class="label">الشعبة:</span> <span class="value">${data.section}</span></div>` : ''}

            <div class="section-title">📝 المواد المختارة</div>
            <div style="margin-bottom: 15px;">
              ${data.courses.map(c => `<span class="tag">${c}</span>`).join('')}
            </div>

            ${data.additionalMessage ? `
            <div class="section-title">💬 رسالة إضافية</div>
            <p style="background: #f9f9f9; padding: 15px; border-radius: 8px; border-right: 4px solid #03CCED;">${data.additionalMessage}</p>
            ` : ''}

          </div>
          <div class="footer">
            تم استلام هذا التسجيل بتاريخ ${new Date().toLocaleDateString('ar-TN')}
          </div>
        </div>
      </body>
      </html>
    `;

    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
        return res.status(500).json({ error: 'Server configuration error: ADMIN_EMAIL missing' });
    }

    const emailResponse = await resend.emails.send({
      from: 'MBSchool Registration <onboarding@resend.dev>',
      to: adminEmail,
      subject: `🔔 تسجيل جديد: ${data.fullName} (${data.level})`,
      html: emailHtml,
      replyTo: data.email || undefined
    });

    return res.status(200).json({ success: true, id: emailResponse.data?.id });

  } catch (error) {
    console.error('Registration Email Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to send registration email' });
  }
}