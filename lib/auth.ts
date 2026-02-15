import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/drizzle/src/db/db";
import * as schema from "@/drizzle/schema";
import { sendEmail } from "./email"; // your email sending function
import {
  openAPI,
  multiSession,
  organization,
  lastLoginMethod,
  role,
} from "better-auth/plugins";

import { ac, admin, member, owner, manager } from "./permissions";

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL!,
  secret: process.env.BETTER_AUTH_SECRET!,
  basePath: "/api/auth",

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      users: schema.users,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
      organization: schema.organization,
      member: schema.member,
      invitation: schema.invitation,
    },
  }),

  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,
    // 1 day (every 1 day the session expiration is updated)
  },

  rateLimit: {
    enabled: true,
    window: 10,
    max: 100,
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      try {
        await sendEmail({
          to: user.email,
          subject: "Verify your email address - Automate Ideas",
          text: `Hi ${
            user.name || "there"
          },\n\nThank you for signing up! Please verify your email address by clicking the link below:\n\n${url}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, please ignore this email.`,
          html: `
            <!DOCTYPE html>
            <html>
                                     <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td align="center" style="padding: 40px 20px;">
                      <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
                        <!-- Header -->
                        <tr>
                          <td style="padding: 40px 40px 20px; text-align: center;">
                            <h1 style="margin: 0; color: #18181b; font-size: 24px; font-weight: 600;">
                              Verify Your Email Address
                            </h1>
                          </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                          <td style="padding: 0 40px 30px;">
                            <p style="margin: 0 0 20px; color: #52525b; font-size: 16px; line-height: 1.5;">
                              Hi ${user.name || "there"},
                            </p>
                            <p style="margin: 0 0 20px; color: #52525b; font-size: 16px; line-height: 1.5;">
                              Thank you for signing up for <strong>Automate Ideas</strong>! To complete your registration and start using our platform, please verify your email address.
                            </p>
                            
                            <!-- Button -->
                            <table role="presentation" style="margin: 30px 0;">
                              <tr>
                                <td align="center">
                                  <a href="${url}" 
                                     style="display: inline-block; padding: 14px 32px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 500;">
                                    Verify Email Address
                                  </a>
                                </td>
                              </tr>
                            </table>
                            
                            <p style="margin: 20px 0 0; color: #71717a; font-size: 14px; line-height: 1.5;">
                              If the button doesn't work, copy and paste this link into your browser:
                            </p>
                            <p style="margin: 10px 0 0; word-break: break-all;">
                              <a href="${url}" style="color: #2563eb; text-decoration: underline; font-size: 14px;">
                                ${url}
                              </a>
                            </p>
                          </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                          <td style="padding: 30px 40px; border-top: 1px solid #e4e4e7;">
                            <p style="margin: 0; color: #71717a; font-size: 13px; line-height: 1.5;">
                              This verification link will expire in <strong>24 hours</strong>.
                            </p>
                            <p style="margin: 10px 0 0; color: #71717a; font-size: 13px; line-height: 1.5;">
                              If you didn't create an account with Automate Ideas, you can safely ignore this email.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
            </html>
          `,
        });
        console.log(`✅ Verification email sent to: ${user.email}`);
      } catch (error) {
        console.error("❌ Failed to send verification email:", error);
        // Don't throw error to prevent signup failure
      }
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  emailAndPassword: {
    sendResetPassword: async ({ user, url, token }, request) => {
      try {
        await sendEmail({
          to: user.email,
          subject: "Reset your password - Automate Ideas",
          text: `Hi ${
            user.name || "there"
          },\n\nWe received a request to reset your password. Click the link below to create a new password:\n\n${url}\n\nThis link will expire in 1 hour.\n\nIf you didn't request a password reset, please ignore this email.`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td align="center" style="padding: 40px 20px;">
                      <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
                        <!-- Header -->
                        <tr>
                          <td style="padding: 40px 40px 20px; text-align: center;">
                            <h1 style="margin: 0; color: #18181b; font-size: 24px; font-weight: 600;">
                              Reset Your Password
                            </h1>
                          </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                          <td style="padding: 0 40px 30px;">
                            <p style="margin: 0 0 20px; color: #52525b; font-size: 16px; line-height: 1.5;">
                              Hi ${user.name || "there"},
                            </p>
                            <p style="margin: 0 0 20px; color: #52525b; font-size: 16px; line-height: 1.5;">
                              We received a request to reset the password for your <strong>Automate Ideas</strong> account.
                            </p>
                            
                            <!-- Button -->
                            <table role="presentation" style="margin: 30px 0;">
                              <tr>
                                <td align="center">
                                  <a href="${url}" 
                                     style="display: inline-block; padding: 14px 32px; background-color: #dc2626; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 500;">
                                    Reset Password
                                  </a>
                                </td>
                              </tr>
                            </table>
                            
                            <p style="margin: 20px 0 0; color: #71717a; font-size: 14px; line-height: 1.5;">
                              If the button doesn't work, copy and paste this link into your browser:
                            </p>
                            <p style="margin: 10px 0 0; word-break: break-all;">
                              <a href="${url}" style="color: #2563eb; text-decoration: underline; font-size: 14px;">
                                ${url}
                              </a>
                            </p>
                          </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                          <td style="padding: 30px 40px; border-top: 1px solid #e4e4e7;">
                            <p style="margin: 0; color: #71717a; font-size: 13px; line-height: 1.5;">
                              This password reset link will expire in <strong>1 hour</strong>.
                            </p>
                            <p style="margin: 10px 0 0; color: #71717a; font-size: 13px; line-height: 1.5;">
                              If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
            </html>
          `,
        });
        console.log(`✅ Password reset email sent to: ${user.email}`);
      } catch (error) {
        console.error("❌ Failed to send password reset email:", error);
        throw new Error("Failed to send password reset email");
      }
    },
    enabled: true,
    requireEmailVerification: true,
  },

  plugins: [
    nextCookies(),
    lastLoginMethod({ storeInDatabase: true }),
    openAPI(),
    multiSession(),
    organization({
      requireEmailVerificationOnInvitation: true,
      async sendInvitationEmail(data: any) {
        const invitationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/accept-invitation/${data.id}`;
        await sendEmail({
          to: data.email,
          subject: `You've been invited to join ${data.organization.name}`,
          html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="padding: 40px 40px 20px; text-align: center;">
                        <h1 style="margin: 0; color: #18181b; font-size: 24px; font-weight: 600;">
                          You've Been Invited! 🎉
                        </h1>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 0 40px 30px;">
                        <p style="margin: 0 0 20px; color: #52525b; font-size: 16px; line-height: 1.5;">
                          Hi there,
                        </p>
                        
                        <!-- Button -->
                        <table role="presentation" style="margin: 30px 0;">
                          <tr>
                            <td align="center">
                              <a href="${invitationLink}" 
                                 style="display: inline-block; padding: 14px 32px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 500;">
                                Accept Invitation
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="margin: 20px 0 0; color: #71717a; font-size: 14px; line-height: 1.5;">
                          If the button doesn't work, copy and paste this link into your browser:
                        </p>
                        <p style="margin: 10px 0 0; word-break: break-all;">
                          <a href="${invitationLink}" style="color: #2563eb; text-decoration: underline; font-size: 14px;">
                            ${invitationLink}
                          </a>
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="padding: 30px 40px; border-top: 1px solid #e4e4e7;">
                        <p style="margin: 0; color: #71717a; font-size: 13px; line-height: 1.5;">
                          This invitation will expire in <strong>7 days</strong>.
                        </p>
                        <p style="margin: 10px 0 0; color: #71717a; font-size: 13px; line-height: 1.5;">
                          If you didn't expect this invitation, you can safely ignore this email.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
          text: `Hi there,

  You've been invited to join ${data.organization.name} as a ${data.role}.
 
   Accept your invitation by clicking this link:
                           ${invitationLink}

This invitation will expire in 7 days.

If you didn't expect this invitation, you can safely ignore this email.`,
        });
      },
      ac,
      roles: { admin, member, owner, manager },
    }),
  ],
  user: {
    modelName: "users",
    additionalFields: {
      phone: { type: "string", required: false, input: true },
      dob: { type: "date", required: false, input: true },
      doj: { type: "date", required: false, input: true },
      isActive: {
        type: "boolean",
        required: false,
        defaultValue: true,
        input: false,
      },
      status: { type: "string", required: false, input: true },
      transferDate: { type: "date", required: false, input: true },
      transferReason: { type: "string", required: false, input: true },
      subscriptionType: { type: "string", required: false, input: false },
      subscriptionStartedAt: { type: "date", required: false, input: false },
      subscriptionExpiresAt: { type: "date", required: false, input: false },
      subscriptionStatus: { type: "string", required: false, input: false },
    },
  },
  organization: {
    additionalFields: {
      business_type: {
        type: "string",
        required: false,
        input: true,
        fieldName: "business_type",
      },
      team_size: {
        type: "number",
        required: false,
        input: true,
        fieldName: "team_size",
      },
      isActive: {
        type: "boolean",
        required: false,
        input: false,
        fieldName: "is_active",
      },
      gst: {
        type: "string",
        required: false,
        input: true,
        fieldName: "gst",
      },
      business_address: {
        type: "string",
        required: false,
        input: true,
        fieldName: "business_address",
      },
      business_website: {
        type: "string",
        required: false,
        input: true,
        fieldName: "business_website",
      },
      business_phone: {
        // ADD THIS
        type: "string",
        required: false,
        input: true,
        fieldName: "business_phone",
      },
      business_email: {
        // ADD THIS
        type: "string",
        required: false,
        input: true,
        fieldName: "business_email",
      },
    },
  },
});
