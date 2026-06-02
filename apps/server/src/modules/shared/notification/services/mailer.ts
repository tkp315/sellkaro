import nodemailer from 'nodemailer';
import SK from '@globals/index.js';

function getEnv(): Record<string, string | number> {
  return (SK.config.app as Record<string, unknown>)['env'] as Record<string, string | number>;
}

function createTransporter() {
  const env = getEnv();
  return nodemailer.createTransport({
    host: String(env['SMTP_HOST']),
    port: Number(env['SMTP_PORT']),
    auth: { user: String(env['SMTP_USER']), pass: String(env['SMTP_PASS']) },
  });
}

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Inter',system-ui,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 8px rgba(0,0,0,.08)">
        <tr><td style="background:#002f34;padding:24px 32px">
          <span style="color:#ffca28;font-size:24px;font-weight:900;letter-spacing:-1px">withSell</span>
        </td></tr>
        <tr><td style="padding:32px">
          ${content}
        </td></tr>
        <tr><td style="background:#f1f5f9;padding:16px 32px;text-align:center">
          <p style="margin:0;font-size:12px;color:#94a3b8">© withSell App · You're receiving this because you have an account with us.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const env = getEnv();
  try {
    await createTransporter().sendMail({ from: String(env['EMAIL_FROM']), to, subject, html });
  } catch {
    // never block main flow for email failures
  }
}

export function welcomeEmail(name: string): string {
  return baseTemplate(`
    <h2 style="margin:0 0 8px;color:#0f172a;font-size:22px">Welcome to withSell, ${name}! 🎉</h2>
    <p style="margin:0 0 20px;color:#64748b;font-size:15px;line-height:1.6">
      Your account is ready. Start browsing millions of listings or post your first ad — it's completely free.
    </p>
    <a href="${process.env['CLIENT_URL'] ?? 'http://localhost:5173'}"
       style="display:inline-block;background:#002f34;color:#ffca28;text-decoration:none;font-weight:700;padding:12px 28px;border-radius:10px;font-size:14px">
      Browse Ads
    </a>
  `);
}

export function newMessageEmail(senderName: string, adTitle: string, preview: string, chatUrl: string): string {
  return baseTemplate(`
    <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px">New message from ${senderName}</h2>
    <p style="margin:0 0 4px;color:#94a3b8;font-size:13px">Re: ${adTitle}</p>
    <div style="margin:16px 0;background:#f8fafc;border-left:3px solid #002f34;padding:12px 16px;border-radius:0 8px 8px 0">
      <p style="margin:0;color:#374151;font-size:14px;font-style:italic">"${preview}"</p>
    </div>
    <a href="${chatUrl}" style="display:inline-block;background:#002f34;color:#ffca28;text-decoration:none;font-weight:700;padding:12px 28px;border-radius:10px;font-size:14px">
      Reply Now
    </a>
  `);
}

export function interestShownEmail(buyerName: string, adTitle: string, adUrl: string): string {
  return baseTemplate(`
    <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px">Someone is interested in your ad!</h2>
    <p style="margin:0 0 16px;color:#64748b;font-size:15px;line-height:1.6">
      <strong>${buyerName}</strong> viewed your phone number for <strong>${adTitle}</strong>. They may contact you soon.
    </p>
    <a href="${adUrl}" style="display:inline-block;background:#002f34;color:#ffca28;text-decoration:none;font-weight:700;padding:12px 28px;border-radius:10px;font-size:14px">
      View Ad
    </a>
  `);
}

export function adRemovedEmail(adTitle: string, reason: string): string {
  return baseTemplate(`
    <h2 style="margin:0 0 8px;color:#dc2626;font-size:20px">Your ad has been removed</h2>
    <p style="margin:0 0 16px;color:#64748b;font-size:15px;line-height:1.6">
      Your listing <strong>"${adTitle}"</strong> was removed by our moderation team.
    </p>
    ${reason ? `<div style="margin:0 0 16px;background:#fef2f2;border:1px solid #fee2e2;padding:12px 16px;border-radius:8px"><p style="margin:0;color:#dc2626;font-size:14px">Reason: ${reason}</p></div>` : ''}
    <p style="margin:0;color:#94a3b8;font-size:13px">If you believe this was a mistake, please contact support.</p>
  `);
}
