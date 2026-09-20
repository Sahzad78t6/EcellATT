export const generateWelcomeEmail = ({
  memberName,
  email,
  memberId,
  tempPassword,
  role,
  verticalName,
  portalUrl
}) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to E-Cell Portal</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
    .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #0f172a 0%, #312e81 100%); color: #ffffff; padding: 28px 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
    .content { padding: 32px 28px; }
    .creds-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 20px; margin: 24px 0; }
    .cred-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 8px; }
    .cred-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .cred-label { color: #64748b; font-weight: 600; }
    .cred-val { font-family: monospace; font-weight: 700; color: #0f172a; font-size: 15px; }
    .alert-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #1e40af; margin-top: 16px; }
    .btn-container { text-align: center; margin: 28px 0 16px; }
    .btn { display: inline-block; background: #4f46e5; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.3); }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to E-Cell Portal</h1>
      <p style="margin: 6px 0 0; color: #c7d2fe; font-size: 14px;">Your official attendance and membership dashboard</p>
    </div>
    <div class="content">
      <p style="font-size: 16px; margin-top: 0;">Hello <strong>${memberName}</strong>,</p>
      <p style="font-size: 14px; line-height: 1.6; color: #475569;">
        Your account on the E-Cell Student Attendance Portal has been set up successfully.
      </p>

      <div class="creds-box">
        <table width="100%" cellpadding="6" cellspacing="0">
          <tr>
            <td style="color: #64748b; font-weight: 600; font-size: 13px;">Member ID:</td>
            <td style="font-family: monospace; font-weight: 700; color: #0f172a; font-size: 14px; text-align: right;">${memberId}</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-weight: 600; font-size: 13px;">Login Email:</td>
            <td style="font-family: monospace; font-weight: 700; color: #0f172a; font-size: 14px; text-align: right;">${email}</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-weight: 600; font-size: 13px;">Temporary Password:</td>
            <td style="font-family: monospace; font-weight: 700; color: #4338ca; font-size: 14px; text-align: right; background: #e0e7ff; padding: 4px 8px; border-radius: 4px;">${tempPassword}</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-weight: 600; font-size: 13px;">Role:</td>
            <td style="font-weight: 600; color: #0f172a; font-size: 13px; text-align: right;">${role}</td>
          </tr>
          ${
            verticalName
              ? `<tr>
                  <td style="color: #64748b; font-weight: 600; font-size: 13px;">Vertical:</td>
                  <td style="font-weight: 600; color: #0f172a; font-size: 13px; text-align: right;">${verticalName}</td>
                </tr>`
              : ''
          }
        </table>
      </div>

      <div class="alert-box">
        🔒 <strong>Security Notice:</strong> You will be prompted to choose a new private password upon your first login.
      </div>

      <div class="btn-container">
        <a href="${portalUrl}" class="btn" target="_blank">Log In to Portal</a>
      </div>
    </div>
    <div class="footer">
      E-Cell Student Attendance System • Automated Notification
    </div>
  </div>
</body>
</html>
  `;

  const text = `Hello ${memberName},

Your account on the E-Cell Student Attendance Portal is ready:

Member ID: ${memberId}
Login Email: ${email}
Temporary Password: ${tempPassword}
Role: ${role}
${verticalName ? `Vertical: ${verticalName}` : ''}

Log in at: ${portalUrl}

Note: You will be required to change your password on first login.

Best regards,
E-Cell Core Team`;

  return { html, text };
};
