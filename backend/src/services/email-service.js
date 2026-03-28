/* email-service.js — Resend email delivery for magic links */

import { Resend } from 'resend'
import { checkRateLimit } from '../plugins/rate-limit.js'

const resend = new Resend(process.env.RESEND_API_KEY)

export { checkRateLimit }

export async function sendMagicLink(email, verifyUrl) {
  const from = process.env.FROM_EMAIL || 'noreply@example.com'

  await resend.emails.send({
    from,
    to: email,
    subject: 'Your Lean Storytelling login link',
    html: `
      <p>Click the link below to log in to Lean Storytelling. The link expires in 15 minutes and can only be used once.</p>
      <p><a href="${verifyUrl}" style="font-size:16px;font-weight:bold">Log in to Lean Storytelling</a></p>
      <p style="color:#888;font-size:13px">If you didn't request this, you can ignore this email.</p>
    `
  })
}
