import { ROLE_LABELS } from '@/lib/auth/roles';
import type { Role } from '@/lib/auth/roles';

type NotificationType = 'role_changed' | 'suspended' | 'unsuspended' | 'deleted';

interface AccountNotificationParams {
  type: NotificationType;
  userEmail: string;
  newRole?: Role;
  supportEmail?: string;
}

export function buildAccountNotificationEmail({
  type,
  userEmail,
  newRole,
  supportEmail = 'support@apexbytes.dev',
}: AccountNotificationParams): { subject: string; html: string } {
  const configs: Record<
    NotificationType,
    { subject: string; title: string; body: string; accentColor: string }
  > = {
    role_changed: {
      subject: 'Your TCMS role has been updated',
      title: 'Role Updated',
      body: `Your account role has been updated to <strong style="color:#1A3D63;">${ROLE_LABELS[newRole!]}</strong>. This change takes effect immediately.`,
      accentColor: '#3b82f6',
    },
    suspended: {
      subject: 'Your TCMS account has been suspended',
      title: 'Account Suspended',
      body: 'Your account has been suspended by an administrator. Access to the TCMS platform has been temporarily disabled.',
      accentColor: '#f59e0b',
    },
    unsuspended: {
      subject: 'Your TCMS account has been reactivated',
      title: 'Account Reactivated',
      body: 'Your account has been reactivated by an administrator. You can sign in to the TCMS platform again.',
      accentColor: '#22c55e',
    },
    deleted: {
      subject: 'Your TCMS account has been removed',
      title: 'Account Removed',
      body: 'Your TCMS account has been permanently removed from the platform.',
      accentColor: '#ef4444',
    },
  };

  const { subject, title, body, accentColor } = configs[type];

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

          <!-- Accent stripe -->
          <tr>
            <td style="background:${accentColor};height:3px;line-height:3px;font-size:3px;">&nbsp;</td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;letter-spacing:-0.3px;">${title}</h1>
              <p style="margin:0 0 24px;font-size:12px;color:#94a3b8;">Account: ${userEmail}</p>
              <p style="margin:0 0 32px;font-size:15px;color:#475569;line-height:1.6;">
                ${body}
              </p>
              <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.7;">
                If you have any questions or believe this change was made in error, please contact
                <a href="mailto:${supportEmail}" style="color:#1A3D63;text-decoration:underline;">${supportEmail}</a>.
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
