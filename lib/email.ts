import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Email configuration
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@bikfayalist.com'
const SITE_NAME = 'BikfayaList'
const SITE_URL = process.env.NEXTAUTH_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://bikfayalist.com')

export interface EmailTemplate {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailTemplate) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY not configured, email will not be sent')
      return { success: false, error: 'Email service not configured' }
    }

    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    })

    console.log('✅ Email sent successfully:', { to, subject, data })
    return { success: true, data }
  } catch (error) {
    console.error('❌ Failed to send email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export function generateVerificationEmailTemplate(email: string, token: string, name?: string) {
  const verificationUrl = `${SITE_URL}/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`
  
  return {
    to: email,
    subject: `Welcome to ${SITE_NAME}! Please verify your email`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - ${SITE_NAME}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 1px solid #eee;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
          }
          .content {
            padding: 30px 0;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #2563eb;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          }
          .footer {
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 14px;
            color: #666;
          }
          .code-block {
            background-color: #f8f9fa;
            padding: 10px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 16px;
            letter-spacing: 2px;
            text-align: center;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">${SITE_NAME}</div>
        </div>
        
        <div class="content">
          <h2>Welcome to ${SITE_NAME}${name ? `, ${name}` : ''}!</h2>
          
          <p>Thank you for signing up for ${SITE_NAME}, Lebanon's premier classified ads platform. To complete your registration and start posting listings, please verify your email address.</p>
          
          <p><strong>Click the button below to verify your email:</strong></p>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify My Email</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <div class="code-block">${verificationUrl}</div>
          
          <p><strong>Why verify your email?</strong></p>
          <ul>
            <li>Secure your account</li>
            <li>Receive important notifications about your listings</li>
            <li>Get contacted by interested buyers</li>
            <li>Recover your account if needed</li>
          </ul>
          
          <p>This verification link will expire in 24 hours for security reasons.</p>
        </div>
        
        <div class="footer">
          <p>If you didn't create an account with ${SITE_NAME}, you can safely ignore this email.</p>
          <p>Need help? Contact us at <a href="mailto:support@bikfayalist.com">support@bikfayalist.com</a></p>
          <p>&copy; ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.</p>
        </div>
      </body>
      </html>
    `
  }
}

export function generatePasswordResetEmailTemplate(email: string, token: string, name?: string) {
  const resetUrl = `${SITE_URL}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`
  
  return {
    to: email,
    subject: `Reset Your ${SITE_NAME} Password`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - ${SITE_NAME}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 1px solid #eee;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
          }
          .content {
            padding: 30px 0;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #dc2626;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          }
          .footer {
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 14px;
            color: #666;
          }
          .code-block {
            background-color: #f8f9fa;
            padding: 10px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 16px;
            letter-spacing: 2px;
            text-align: center;
            margin: 20px 0;
          }
          .warning {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">${SITE_NAME}</div>
        </div>
        
        <div class="content">
          <h2>Password Reset Request${name ? ` for ${name}` : ''}</h2>
          
          <p>We received a request to reset your password for your ${SITE_NAME} account (${email}).</p>
          
          <p><strong>Click the button below to reset your password:</strong></p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset My Password</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <div class="code-block">${resetUrl}</div>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong>
            <ul style="margin: 10px 0;">
              <li>This link will expire in 1 hour for security</li>
              <li>Only use this link if you requested a password reset</li>
              <li>Never share this link with anyone</li>
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Didn't request a password reset?</strong> If you didn't request this, you can safely ignore this email. Your password won't be changed.</p>
          <p>For security questions, contact us at <a href="mailto:support@bikfayalist.com">support@bikfayalist.com</a></p>
          <p>&copy; ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.</p>
        </div>
      </body>
      </html>
    `
  }
}

export async function sendVerificationEmail(email: string, token: string, name?: string) {
  const template = generateVerificationEmailTemplate(email, token, name)
  return await sendEmail(template)
}

export async function sendPasswordResetEmail(email: string, token: string, name?: string) {
  const template = generatePasswordResetEmailTemplate(email, token, name)
  return await sendEmail(template)
}