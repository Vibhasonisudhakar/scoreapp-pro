const nodemailer = require("nodemailer");

const PROVIDER_PRESETS = {
  gmail: {
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
  },
  resend: {
    host: "smtp.resend.com",
    port: 587,
    secure: false,
  },
  sendgrid: {
    host: "smtp.sendgrid.net",
    port: 587,
    secure: false,
  },
};

function getProviderKey() {
  return String(process.env.EMAIL_PROVIDER || "custom").trim().toLowerCase();
}

function getSmtpConfig() {
  const providerKey = getProviderKey();
  const preset = PROVIDER_PRESETS[providerKey] || {};
  const host = process.env.SMTP_HOST || preset.host;
  const port = Number(process.env.SMTP_PORT || preset.port || 587);
  const secure =
    process.env.SMTP_SECURE === "true"
      ? true
      : process.env.SMTP_SECURE === "false"
      ? false
      : Boolean(preset.secure);

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  return {
    providerKey,
    host,
    port,
    secure,
    user,
    pass,
  };
}

function isEmailConfigured() {
  const smtp = getSmtpConfig();
  return Boolean(
    smtp.host &&
      smtp.user &&
      smtp.pass &&
      process.env.RESET_FROM_EMAIL
  );
}

function createTransporter() {
  const smtp = getSmtpConfig();

  return nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  });
}

async function sendPasswordResetEmail({ to, resetUrl, expiryMinutes = 15 }) {
  const transporter = createTransporter();
  const brandName = process.env.RESET_BRAND_NAME || "ScoreApp";
  const supportEmail = process.env.RESET_SUPPORT_EMAIL || process.env.RESET_FROM_EMAIL;

  const subject = `${brandName} password reset`;
  const text = [
    `You requested a password reset for your ${brandName} account.`,
    `Reset link: ${resetUrl}`,
    `This link expires in ${expiryMinutes} minutes.`,
    "If you did not request this, ignore this email.",
    supportEmail ? `Support: ${supportEmail}` : "",
  ].join("\n\n");

  const html = `
    <div style="background:#f4f3ef;padding:24px 12px;font-family:Segoe UI,Arial,sans-serif;color:#1f2a2e;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#fffaf0;border:1px solid #d6cdc0;border-radius:14px;overflow:hidden;">
        <tr>
          <td style="background:linear-gradient(120deg,#ece8df,#f4f3ef);padding:20px 24px;border-bottom:1px solid #d6cdc0;">
            <p style="margin:0;text-transform:uppercase;letter-spacing:.08em;font-size:11px;color:#5f6d73;">${brandName}</p>
            <h1 style="margin:8px 0 0;font-size:24px;line-height:1.2;color:#1f2a2e;">Reset your password</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:24px;">
            <p style="margin:0 0 12px;font-size:14px;line-height:1.6;">We received a request to reset your ${brandName} account password.</p>
            <p style="margin:0 0 20px;font-size:14px;line-height:1.6;">This reset link expires in <strong>${expiryMinutes} minutes</strong>.</p>
            <p style="margin:0 0 20px;">
              <a href="${resetUrl}" style="display:inline-block;background:#be5a38;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:600;">Reset Password</a>
            </p>
            <p style="margin:0 0 8px;font-size:13px;color:#5f6d73;line-height:1.6;">If the button does not work, copy and paste this link into your browser:</p>
            <p style="margin:0 0 18px;word-break:break-word;font-size:12px;color:#3b474c;">${resetUrl}</p>
            <p style="margin:0;font-size:12px;color:#5f6d73;">If you did not request this, you can safely ignore this email.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:14px 24px;background:#f7f1e7;border-top:1px solid #e4d9ca;font-size:12px;color:#6a777d;">
            ${supportEmail ? `Need help? Contact ${supportEmail}` : ""}
          </td>
        </tr>
      </table>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.RESET_FROM_EMAIL,
    to,
    subject,
    text,
    html,
    replyTo: supportEmail || undefined,
  });
}

module.exports = {
  isEmailConfigured,
  sendPasswordResetEmail,
};
