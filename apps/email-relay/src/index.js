import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { sendEmail } from './mailer.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'email-relay' })
})

// Send email endpoint
app.post('/send', async (req, res) => {
  try {
    const { to, subject, html, text } = req.body

    // Validate required fields
    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, subject, and (html or text)',
      })
    }

    // Send email via nodemailer
    const result = await sendEmail({ to, subject, html, text })

    res.json({
      success: true,
      message: 'Email sent successfully',
      messageId: result.messageId,
    })
  } catch (error) {
    console.error('Email send error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send email',
    })
  }
})

// Send verification code
app.post('/send-code', async (req, res) => {
  try {
    const { to, code, purpose } = req.body

    if (!to || !code) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, code',
      })
    }

    const purposes = {
      signup: '注册验证',
      reset: '密码重置',
      verify: '邮箱验证',
    }

    const purposeText = purposes[purpose] || '身份验证'
    const subject = `TapCanvas - ${purposeText}码`

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 500px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .code-box { background: white; border: 2px solid #667eea; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
            .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 4px; font-family: monospace; }
            .expires { color: #999; font-size: 12px; margin-top: 10px; }
            .footer { margin-top: 20px; font-size: 12px; color: #999; text-align: center; }
            .warning { color: #d32f2f; font-size: 12px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>TapCanvas</h1>
              <p>${purposeText}码</p>
            </div>
            <div class="content">
              <p>亲爱的用户，</p>
              <p>感谢您使用 TapCanvas。您的 ${purposeText}码为：</p>
              <div class="code-box">
                <div class="code">${code}</div>
                <div class="expires">此验证码有效期为 10 分钟</div>
              </div>
              <p>如果这不是您的操作，请忽略此邮件。</p>
              <p class="warning">⚠️ 请勿将此验证码分享给任何人。</p>
              <div class="footer">
                <p>© 2026 TapCanvas. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    const result = await sendEmail({ to, subject, html })

    res.json({
      success: true,
      message: 'Verification code sent successfully',
      messageId: result.messageId,
    })
  } catch (error) {
    console.error('Verification code send error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send verification code',
    })
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  })
})

app.listen(PORT, () => {
  console.log(`📧 Email relay service running on http://localhost:${PORT}`)
  console.log(`Provider: 163 SMTP (nodemailer)`)
})
