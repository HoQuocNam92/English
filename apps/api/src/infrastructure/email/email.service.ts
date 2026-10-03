import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as nodemailer from 'nodemailer'

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)

  constructor(private configService: ConfigService) {}

  async sendPasswordResetLink(toEmail: string, resetUrl: string): Promise<boolean> {
    const smtpHost = this.configService.getOrThrow<string>('SMTP_HOST')
    const smtpPort = Number(this.configService.getOrThrow<string>('SMTP_PORT'))
    if (!Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535) {
      throw new Error('SMTP_PORT must be an integer between 1 and 65535')
    }
    const smtpSecure = (this.configService.get<string>('SMTP_SECURE') || process.env.SMTP_SECURE) === 'true'
    const smtpUser = this.configService.get<string>('SMTP_USER') || process.env.SMTP_USER
    const smtpPass = this.configService.get<string>('SMTP_PASS') || process.env.SMTP_PASS
    const smtpFrom = this.configService.getOrThrow<string>('SMTP_FROM')

    if (!smtpUser || !smtpPass || smtpUser === 'user@example.com') {
      this.logger.warn('SMTP credentials not configured; password reset email was not sent.')
      return false
    }

    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      })

      const safeUrl = resetUrl.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
      const htmlContent = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px">
        <h2 style="color:#3525cd">TechEnglish Pro</h2>
        <p>Bạn đã yêu cầu đặt lại mật khẩu. Nhấn nút bên dưới để tạo mật khẩu mới.</p>
        <p><a href="${safeUrl}" style="display:inline-block;padding:14px 24px;background:#3525cd;color:white;border-radius:12px;text-decoration:none">Đặt lại mật khẩu</a></p>
        <p>Liên kết có hiệu lực trong 15 phút và chỉ dùng được một lần để đổi mật khẩu. Không chia sẻ liên kết này.</p>
        <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
      </div>`

      await transporter.sendMail({
        from: smtpFrom,
        to: toEmail,
        subject: '[TechEnglish Pro] Liên kết đặt lại mật khẩu',
        html: htmlContent,
        text: `Đặt lại mật khẩu: ${resetUrl}\nLiên kết có hiệu lực 15 phút và chỉ dùng một lần.`,
      })

      this.logger.log(`✅ Email khôi phục mật khẩu đã được gửi thành công đến ${toEmail}`)
      return true
    } catch (error: any) {
      this.logger.error(`❌ Lỗi gửi email qua SMTP: ${error.message}`, error.stack)
      return false
    }
  }
}
