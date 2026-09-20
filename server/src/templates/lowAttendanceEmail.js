export const generateLowAttendanceEmail = ({
  memberName,
  attendancePercent,
  threshold,
  attendedCount,
  eligibleCount,
  eventName,
  portalUrl
}) => {
  const percentFormatted = attendancePercent !== null ? `${attendancePercent.toFixed(1)}%` : 'N/A';
  const thresholdFormatted = `${threshold}%`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Attendance Alert - E-Cell</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
    .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); color: #ffffff; padding: 28px 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0; color: #94a3b8; font-size: 14px; }
    .content { padding: 32px 28px; }
    .alert-banner { background-color: #fff1f2; border-left: 4px solid #e11d48; padding: 16px; border-radius: 6px; margin-bottom: 24px; }
    .alert-banner strong { color: #9f1239; font-size: 15px; }
    .stats-grid { display: flex; gap: 12px; margin: 20px 0; }
    .stat-card { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; text-align: center; }
    .stat-val { font-size: 24px; font-weight: 700; color: #e11d48; margin-bottom: 4px; }
    .stat-label { font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 0.5px; }
    .info-list { background: #f1f5f9; border-radius: 8px; padding: 16px 20px; margin: 20px 0; font-size: 14px; line-height: 1.6; }
    .btn-container { text-align: center; margin: 32px 0 16px; }
    .btn { display: inline-block; background: #4f46e5; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.3); }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Entrepreneurship Cell</h1>
      <p>Attendance Monitoring System</p>
    </div>
    <div class="content">
      <p style="font-size: 16px; margin-top: 0;">Dear <strong>${memberName}</strong>,</p>
      <div class="alert-banner">
        <strong>⚠️ Low Attendance Notification</strong>
        <p style="margin: 4px 0 0; color: #881337; font-size: 13px;">Your current attendance percentage has fallen below the minimum required standard of ${thresholdFormatted}.</p>
      </div>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
        <tr>
          <td style="padding: 12px; background: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; text-align: center; width: 50%;">
            <div style="font-size: 26px; font-weight: 800; color: #dc2626;">${percentFormatted}</div>
            <div style="font-size: 11px; text-transform: uppercase; color: #7f1d1d; font-weight: 600; margin-top: 4px;">Current Attendance</div>
          </td>
          <td style="width: 12px;"></td>
          <td style="padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center; width: 50%;">
            <div style="font-size: 26px; font-weight: 800; color: #334155;">${attendedCount} / ${eligibleCount}</div>
            <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; margin-top: 4px;">Events Attended</div>
          </td>
        </tr>
      </table>

      <div class="info-list">
        <div><strong>Trigger Event:</strong> ${eventName}</div>
        <div><strong>Required Threshold:</strong> ${thresholdFormatted}</div>
        <div><strong>Status:</strong> At Risk of Ineligibility</div>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #475569;">
        Active participation in vertical meetings, workshops, and general body meetings is vital to your contribution at E-Cell. We encourage you to attend upcoming sessions to bring your record back in good standing.
      </p>

      <div class="btn-container">
        <a href="${portalUrl}" class="btn" target="_blank">View Attendance Portal</a>
      </div>
    </div>
    <div class="footer">
      This is an automated notification from the E-Cell Student Attendance Portal.<br>
      Please contact your Vertical Secretary or Admin for any discrepancy.
    </div>
  </div>
</body>
</html>
  `;

  const text = `Dear ${memberName},

This is an attendance alert from the Entrepreneurship Cell.
Your current attendance is ${percentFormatted}, which is below the required threshold of ${thresholdFormatted}.

Events Attended: ${attendedCount} / ${eligibleCount}
Triggering Event: ${eventName}

Please log in to your portal to review your attendance history:
${portalUrl}

Best regards,
E-Cell Core Team`;

  return { html, text };
};
