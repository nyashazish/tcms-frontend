interface ResetPasswordEmailParams {
  actionLink: string;
}

export function buildResetPasswordEmail({ actionLink }: ResetPasswordEmailParams): {
  subject: string;
  html: string;
} {
  const subject = 'Reset your TCMS password';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">

          <!-- Header -->
          <tr>
            <td style="background:#1A3D63;padding:32px 40px;">
              <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.3px;">TCMS</p>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">Operations Dashboard</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0f172a;letter-spacing:-0.3px;">Reset your password</h1>
              <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
                We received a request to reset your TCMS password. Click the button below to choose a new one.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="background:#1A3D63;border-radius:8px;">
                    <a href="${actionLink}" target="_blank"
                       style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:0.1px;">
                      Reset password &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
                This link expires in 1 hour. If you did not request a password reset, you can safely ignore this email — your password will not change.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #f1f5f9;">
              <p style="margin:0;font-size:11px;color:#cbd5e1;">TCMS &bull; Internal Operations Platform</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  return { subject, html };
}
