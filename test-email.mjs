import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 32px; text-align: center; }
    .header h1 { margin: 0; color: white; font-size: 24px; }
    .content { padding: 32px; }
    .post { background: #0f172a; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
    .post-topic { color: #3b82f6; font-size: 12px; text-transform: uppercase; margin-bottom: 8px; }
    .post-content { color: #e2e8f0; line-height: 1.6; white-space: pre-wrap; }
    .btn { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px; }
    .footer { padding: 20px 32px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #334155; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 LinkedIn Content Generator</h1>
    </div>
    <div class="content">
      <p style="color: #94a3b8;">Hey Matt! This is a test email from your LinkedIn Content Generator.</p>
      
      <div class="post">
        <div class="post-topic">Sample Topic: Financial Planning</div>
        <div class="post-content">Here's what a generated post would look like in your digest emails.

Each post will have:
• A preview of the content
• The topic/theme
• An "Edit in App" button

You'll be able to click through to refine any post before copying it to LinkedIn.</div>
        <a href="#" class="btn">Edit in App →</a>
      </div>
      
      <p style="color: #94a3b8; text-align: center;">Email integration is working! 🚀</p>
    </div>
    <div class="footer">
      LinkedIn Content Generator • Powered by Jarvis 🔵
    </div>
  </div>
</body>
</html>
`;

async function sendTest() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'LinkedIn Generator <onboarding@resend.dev>',
      to: ['msgibson103@gmail.com'],
      subject: '✅ Test Email - LinkedIn Content Generator',
      html: html,
    });

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log('Email sent successfully!', data);
  } catch (e) {
    console.error('Failed:', e);
  }
}

sendTest();
