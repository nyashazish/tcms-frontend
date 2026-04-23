import { ROLE_LABELS } from '@/lib/auth/roles';
import type { Role } from '@/lib/auth/roles';

interface InviteEmailParams {
  inviterEmail: string;
  role: Role;
  actionLink: string;
}

export function buildInviteEmail({ inviterEmail, role, actionLink }: InviteEmailParams): {
  subject: string;
  html: string;
} {
  const roleName = ROLE_LABELS[role];
  const subject = `You've been invited to TCMS`;

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
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0f172a;letter-spacing:-0.3px;">You're invited</h1>
              <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
                <strong style="color:#0f172a;">${inviterEmail}</strong> has invited you to join the TCMS Operations Dashboard.
              </p>

              <!-- Role badge -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="background:#f1f5f9;border-radius:8px;padding:16px 20px;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.6px;">Your role</p>
                    <p style="margin:0;font-size:15px;font-weight:600;color:#1A3D63;">${roleName}</p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#1A3D63;border-radius:8px;">
                    <a href="${actionLink}" target="_blank"
                       style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:0.1px;">
                      Accept Invitation &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;font-size:12px;color:#94a3b8;line-height:1.6;">
                This invitation link expires in 24 hours. If you did not expect this invitation, you can safely ignore this email.
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
