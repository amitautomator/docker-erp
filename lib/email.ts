import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  service: "gmail",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export type SendEmailOptions = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
};

export async function sendEmail(opts: SendEmailOptions): Promise<void> {
  const { to, subject, text, html } = opts;

  if (!text && !html) {
    throw new Error("Email must contain either text or html content.");
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || "no-reply@example.com", // Use environment variable for from address
    to,
    subject,
    text,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to:", to);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

// export type OrgInviteData = {
//   email: string;
//   invitedByUsername?: string;
//   invitedByEmail?: string;
//   teamName?: string;
//   inviteLink: string;
// };

// export async function sendOrganizationInvitation(
//   data: OrgInviteData
// ): Promise<void> {
//   const inviter = data.invitedByUsername ?? data.invitedByEmail ?? "Someone";

//   const teamName = data.teamName ?? "our team";

//   const subject = `Invitation to join ${teamName}`;

//   const text = `${inviter} invited you to join ${teamName}.

// Accept the invitation:
// ${data.inviteLink}
// `;

//   const html = `
//     <p><strong>${inviter}</strong> invited you to join <strong>${teamName}</strong>.</p>
//     <p>
//       <a href="${data.inviteLink}"
//          style="display:inline-block;padding:10px 16px;
//                 background:#2563eb;color:#fff;
//                 text-decoration:none;border-radius:6px;">
//         Accept Invitation
//       </a>
//     </p>
//     <p>If the button doesn’t work, copy and paste this link:</p>
//     <p>${data.inviteLink}</p>
//   `;

//   await sendEmail({
//     to: data.email,
//     subject,
//     text,
//     html,
//   });
// }
