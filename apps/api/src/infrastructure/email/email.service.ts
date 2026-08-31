import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as nodemailer from 'nodemailer'

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)

  constructor(private configService: ConfigService) {}

  async sendPasswordResetOtp(toEmail: string, otp: string): Promise<boolean> {
    const smtpHost = this.configService.get<string>('SMTP_HOST') || process.env.SMTP_HOST || 'smtp.gmail.com'
    const smtpPort = Number(this.configService.get<string>('SMTP_PORT') || process.env.SMTP_PORT || '587')
    const smtpSecure = (this.configService.get<string>('SMTP_SECURE') || process.env.SMTP_SECURE) === 'true'
    const smtpUser = this.configService.get<string>('SMTP_USER') || process.env.SMTP_USER
    const smtpPass = this.configService.get<string>('SMTP_PASS') || process.env.SMTP_PASS
    const smtpFrom = this.configService.get<string>('SMTP_FROM') || process.env.SMTP_FROM || '"TechEnglish Pro" <no-reply@techenglish.pro>'

    // DEV FALLBACK LOGGING
    this.logger.log(`=======================================================`)
    this.logger.log(`🔑 [PASSWORD RESET OTP] Target: ${toEmail} | OTP: ${otp}`)
    this.logger.log(`=======================================================`)

    if (!smtpUser || !smtpPass || smtpUser === 'user@example.com') {
      this.logger.warn(`SMTP credentials not configured. Using DEV LOG fallback only. Check console for OTP.`)
      return true
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

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #4f46e5; text-align: center;">TechEnglish Pro</h2>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p>Xin chào,</p>
          <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản <strong>${toEmail}</strong> trên nền tảng TechEnglish Pro.</p>
          <p>Mã xác thực (OTP) của bạn là:</p>
          <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 8px; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #1e1b4b; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #64748b; font-size: 13px;">Mã OTP này có hiệu lực trong vòng <strong>15 phút</strong>. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
        </div>
      `

      await transporter.sendMail({
        from: smtpFrom,
        to: toEmail,
        subject: '[TechEnglish Pro] Mã OTP Khôi Phục Mật Khẩu',
        html: htmlContent,
      })

      this.logger.log(`✅ Email khôi phục mật khẩu đã được gửi thành công đến ${toEmail}`)
      return true
    } catch (error: any) {
      this.logger.error(`❌ Lỗi gửi email qua SMTP: ${error.message}`, error.stack)
      return false
    }
  }
}
