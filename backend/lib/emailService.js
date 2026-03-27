const nodemailer = require('nodemailer');

// Create transporter — uses Gmail SMTP via env vars
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const BRAND_COLOR = '#2563eb';
const BRAND_NAME  = 'ScholarConnect';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// ── Shared HTML wrapper ───────────────────────────────────────────────────────
const wrap = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${BRAND_NAME} Notification</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e3a8a,${BRAND_COLOR});border-radius:16px 16px 0 0;padding:32px;text-align:center;">
            <div style="display:inline-block;width:48px;height:48px;background:rgba(255,255,255,0.2);border-radius:12px;text-align:center;line-height:48px;font-size:24px;margin-bottom:12px;">🎓</div>
            <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;letter-spacing:-0.5px;">${BRAND_NAME}</h1>
            <p style="color:rgba(255,255,255,0.75);margin:4px 0 0;font-size:13px;">Scholarship Management Portal</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="background:#fff;padding:36px 40px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;">
            <p style="color:#94a3b8;font-size:12px;margin:0;">
              © ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.<br/>
              <a href="${FRONTEND_URL}" style="color:${BRAND_COLOR};text-decoration:none;">Visit Portal</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const btn = (text, url) =>
  `<a href="${url}" style="display:inline-block;margin-top:20px;padding:12px 28px;background:${BRAND_COLOR};color:#fff;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">${text}</a>`;

// ── send helper (fire-and-forget — never blocks a request) ───────────────────
const send = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[EMAIL SKIPPED — no credentials] To: ${to} | Subject: ${subject}`);
    return;
  }
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"${BRAND_NAME}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[EMAIL SENT] To: ${to} | ${subject}`);
  } catch (err) {
    console.error(`[EMAIL ERROR] ${err.message}`);
  }
};

// ══════════════════════════════════════════════════════════════════════════════
//  USER EMAILS
// ══════════════════════════════════════════════════════════════════════════════

exports.sendApplicationSubmitted = (user, scholarship) =>
  send({
    to: user.email,
    subject: `✅ Application Submitted — ${scholarship.title}`,
    html: wrap(`
      <h2 style="color:#1e293b;font-size:20px;margin:0 0 8px;">Application Received! 🎉</h2>
      <p style="color:#64748b;margin:0 0 20px;">Hi <strong>${user.name}</strong>, your application has been successfully submitted.</p>
      <div style="background:#eff6ff;border-left:4px solid ${BRAND_COLOR};border-radius:8px;padding:16px 20px;margin:20px 0;">
        <p style="margin:0;font-weight:600;color:#1e3a8a;">${scholarship.title}</p>
        <p style="margin:4px 0 0;color:#475569;font-size:13px;">Provider: ${scholarship.provider} &bull; ${scholarship.currency} ${Number(scholarship.amount).toLocaleString()}</p>
      </div>
      <p style="color:#64748b;font-size:14px;">We will notify you when the admin reviews your application. Good luck! 🍀</p>
      ${btn('View My Applications', `${FRONTEND_URL}/my-applications`)}
    `),
  });

exports.sendStatusChanged = (user, scholarship, status, notes) =>
  send({
    to: user.email,
    subject: `📋 Application Status Updated — ${scholarship.title}`,
    html: wrap(`
      <h2 style="color:#1e293b;font-size:20px;margin:0 0 8px;">Application Status Update</h2>
      <p style="color:#64748b;margin:0 0 20px;">Hi <strong>${user.name}</strong>, your application status has been updated.</p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:20px 0;">
        <p style="margin:0 0 8px;font-weight:600;color:#1e293b;">${scholarship.title}</p>
        <p style="margin:0;color:#64748b;font-size:13px;">New Status: <strong style="color:${
          status === 'Accepted' ? '#059669' :
          status === 'Rejected' ? '#dc2626' :
          status === 'Reviewed' ? '#2563eb' : '#d97706'
        };">${status}</strong></p>
        ${notes ? `<p style="margin:10px 0 0;color:#475569;font-size:13px;font-style:italic;">"${notes}"</p>` : ''}
      </div>
      ${btn('View Application', `${FRONTEND_URL}/my-applications`)}
    `),
  });

exports.sendForumActivity = (user, post, actorName, type) =>
  send({
    to: user.email,
    subject: `💬 New ${type === 'comment' ? 'Comment' : 'Upvote'} on Your Forum Post`,
    html: wrap(`
      <h2 style="color:#1e293b;font-size:20px;margin:0 0 8px;">Forum Activity Alert</h2>
      <p style="color:#64748b;margin:0 0 20px;">Hi <strong>${user.name}</strong>, 
        ${type === 'comment' ? `<strong>${actorName}</strong> commented on` : `<strong>${actorName}</strong> upvoted`} your post.
      </p>
      <div style="background:#f0fdf4;border-left:4px solid #059669;border-radius:8px;padding:16px 20px;margin:20px 0;">
        <p style="margin:0;font-weight:600;color:#166534;">${post.title}</p>
      </div>
      ${btn('View Post', `${FRONTEND_URL}/forum`)}
    `),
  });

// ══════════════════════════════════════════════════════════════════════════════
//  ADMIN EMAILS
// ══════════════════════════════════════════════════════════════════════════════

exports.sendAdminNewUser = (adminEmail, user) =>
  send({
    to: adminEmail,
    subject: `👤 New User Registered — ${user.name}`,
    html: wrap(`
      <h2 style="color:#1e293b;font-size:20px;margin:0 0 20px;">New User Registration 🎊</h2>
      <table style="width:100%;border-collapse:collapse;">
        ${[['Name', user.name], ['Email', user.email], ['Role', user.role], ['Joined', new Date().toLocaleString('en-IN')]]
          .map(([k,v]) => `
          <tr>
            <td style="padding:10px 12px;background:#f8fafc;border:1px solid #e2e8f0;font-weight:600;color:#475569;font-size:13px;width:30%;">${k}</td>
            <td style="padding:10px 12px;border:1px solid #e2e8f0;color:#1e293b;font-size:14px;">${v}</td>
          </tr>`).join('')}
      </table>
      ${btn('View Users', `${FRONTEND_URL}/admin`)}
    `),
  });

exports.sendAdminNewApplication = (adminEmail, student, scholarship) =>
  send({
    to: adminEmail,
    subject: `📋 New Application — ${scholarship.title}`,
    html: wrap(`
      <h2 style="color:#1e293b;font-size:20px;margin:0 0 20px;">New Scholarship Application</h2>
      <div style="background:#eff6ff;border-left:4px solid ${BRAND_COLOR};border-radius:8px;padding:16px 20px;margin:0 0 20px;">
        <p style="margin:0;font-weight:700;color:#1e3a8a;font-size:15px;">${scholarship.title}</p>
        <p style="margin:4px 0 0;color:#475569;font-size:13px;">Provider: ${scholarship.provider}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        ${[['Student', student.name], ['Email', student.email], ['Applied At', new Date().toLocaleString('en-IN')]]
          .map(([k,v]) => `
          <tr>
            <td style="padding:10px 12px;background:#f8fafc;border:1px solid #e2e8f0;font-weight:600;color:#475569;font-size:13px;width:30%;">${k}</td>
            <td style="padding:10px 12px;border:1px solid #e2e8f0;color:#1e293b;font-size:14px;">${v}</td>
          </tr>`).join('')}
      </table>
      ${btn('Review Application', `${FRONTEND_URL}/admin`)}
    `),
  });

exports.sendAdminNewScholarship = (adminEmail, scholarship, createdByName) =>
  send({
    to: adminEmail,
    subject: `🎓 New Scholarship Added — ${scholarship.title}`,
    html: wrap(`
      <h2 style="color:#1e293b;font-size:20px;margin:0 0 20px;">New Scholarship Published</h2>
      <table style="width:100%;border-collapse:collapse;">
        ${[
            ['Title', scholarship.title],
            ['Provider', scholarship.provider],
            ['Amount', `${scholarship.currency} ${Number(scholarship.amount).toLocaleString()}`],
            ['Deadline', new Date(scholarship.deadline).toLocaleDateString('en-IN')],
            ['Added By', createdByName],
          ].map(([k,v]) => `
          <tr>
            <td style="padding:10px 12px;background:#f8fafc;border:1px solid #e2e8f0;font-weight:600;color:#475569;font-size:13px;width:30%;">${k}</td>
            <td style="padding:10px 12px;border:1px solid #e2e8f0;color:#1e293b;font-size:14px;">${v}</td>
          </tr>`).join('')}
      </table>
      ${btn('View Scholarships', `${FRONTEND_URL}/admin`)}
    `),
  });
