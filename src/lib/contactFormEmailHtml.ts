function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function nl2br(escaped: string): string {
  return escaped.replace(/\n/g, '<br/>')
}

interface ContactEmailFields {
  fullName: string
  company: string
  email: string
  message: string
}

export function buildContactFormEmailHtml(fields: ContactEmailFields): string {
  const fullName = escapeHtml(fields.fullName.trim())
  const company = escapeHtml(fields.company.trim())
  const rawEmail = fields.email.trim()
  const emailDisplay = escapeHtml(rawEmail)
  const emailHref = `mailto:${encodeURIComponent(rawEmail)}`
  const message = nl2br(escapeHtml(fields.message.trim()))

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:24px;background:#f4f4f5;font-family:ui-sans-serif,system-ui,sans-serif;color:#18181b;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;padding:28px 32px;border:1px solid #e4e4e7;box-shadow:0 1px 2px rgba(0,0,0,0.05);">
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#18181b;">Contact Us form submitted</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#71717a;line-height:1.5;">The following details were submitted from the website contact form.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr>
        <td style="padding:10px 12px 10px 0;vertical-align:top;width:120px;color:#71717a;font-weight:600;">Full name</td>
        <td style="padding:10px 0;vertical-align:top;color:#18181b;">${fullName}</td>
      </tr>
      <tr>
        <td style="padding:10px 12px 10px 0;vertical-align:top;color:#71717a;font-weight:600;">Company</td>
        <td style="padding:10px 0;vertical-align:top;color:#18181b;">${company || '—'}</td>
      </tr>
      <tr>
        <td style="padding:10px 12px 10px 0;vertical-align:top;color:#71717a;font-weight:600;">Email</td>
        <td style="padding:10px 0;vertical-align:top;"><a href="${emailHref}" style="color:#e11d48;text-decoration:none;">${emailDisplay}</a></td>
      </tr>
      <tr>
        <td style="padding:10px 12px 10px 0;vertical-align:top;color:#71717a;font-weight:600;">Message</td>
        <td style="padding:10px 0;vertical-align:top;color:#18181b;line-height:1.6;">${message}</td>
      </tr>
    </table>
  </div>
</body>
</html>`
}
