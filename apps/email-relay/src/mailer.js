import nodemailer from 'nodemailer'

// Create 163 SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.163.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE !== 'false', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // 163 email address
    pass: process.env.SMTP_PASS, // 163 authorization code (not password)
  },
})

/**
 * Send email via 163 SMTP
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content
 * @returns {Promise} Nodemailer response
 */
export async function sendEmail({ to, subject, html, text }) {
  try {
    // Verify SMTP connection on first use
    if (!transporter.isIdle?.()) {
      console.log('Verifying SMTP connection...')
      await transporter.verify()
      console.log('✅ SMTP connection verified')
    }

    const mailOptions = {
      from: `"TapCanvas" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text,
    }

    console.log(`📤 Sending email to ${to} with subject: ${subject}`)
    const info = await transporter.sendMail(mailOptions)
    console.log(`✅ Email sent: ${info.messageId}`)

    return info
  } catch (error) {
    console.error('❌ Email send failed:', error.message)
    throw error
  }
}

// Test connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP connection failed:', error.message)
    console.error('Please check SMTP_USER, SMTP_PASS, and other SMTP settings')
    process.exit(1)
  } else {
    console.log('✅ SMTP server is ready to take messages')
  }
})
