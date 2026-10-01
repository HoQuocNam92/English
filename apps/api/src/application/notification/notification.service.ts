import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ConfigService } from '@nestjs/config'
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app'
import { getMessaging, Messaging } from 'firebase-admin/messaging'
import { PrismaService } from '../../infrastructure/database/prisma.service'

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name)
  private readonly messaging: Messaging | null

  constructor(private readonly prisma: PrismaService, config: ConfigService) {
    try {
      const projectId = config.get<string>('FIREBASE_PROJECT_ID')
      const clientEmail = config.get<string>('FIREBASE_CLIENT_EMAIL')
      const privateKey = config.get<string>('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n')
      if ((!projectId || !clientEmail || !privateKey) && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        this.messaging = null
        this.logger.warn('Firebase chưa được cấu hình; thông báo từ máy chủ đang tạm tắt.')
        return
      }
      if (!getApps().length) {
        initializeApp(projectId && clientEmail && privateKey
          ? { credential: cert({ projectId, clientEmail, privateKey }) }
          : { credential: applicationDefault() })
      }
      this.messaging = getMessaging()
    } catch {
      this.messaging = null
      this.logger.warn('Firebase chưa được cấu hình; thông báo từ máy chủ đang tạm tắt.')
    }
  }

  register(userId: string, token: string, platform: string) {
    return this.prisma.pushSubscription.upsert({
      where: { token },
      create: { userId, token, platform, active: true },
      update: { userId, platform, active: true },
    })
  }

  remove(userId: string, token: string) {
    return this.prisma.pushSubscription.updateMany({ where: { userId, token }, data: { active: false } })
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async sendScheduledLearningReminders() {
    if (!this.messaging) return
    const profiles = await this.prisma.learnerProfile.findMany({
      where: { reminderEnabled: true, reminderTime: { not: null }, user: { pushSubscriptions: { some: { active: true } } } },
      include: { user: { include: { userDetail: true, pushSubscriptions: { where: { active: true } } } } },
    })
    const now = new Date()
    for (const profile of profiles) {
      const timezone = profile.user.userDetail?.timezone || 'Asia/Ho_Chi_Minh'
      const parts = new Intl.DateTimeFormat('en-GB', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false }).format(now)
      if (parts !== profile.reminderTime) continue
      const dateParts = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now)
      const part = (type: Intl.DateTimeFormatPartTypes) => dateParts.find(item => item.type === type)?.value || ''
      const localDate = `${part('year')}-${part('month')}-${part('day')}`
      for (const subscription of profile.user.pushSubscriptions) {
        if (subscription.lastSentDate?.toISOString().slice(0, 10) === localDate) continue
        try {
          await this.messaging.send({
            token: subscription.token,
            notification: { title: 'Đến giờ học rồi!', body: `Hôm nay bạn còn mục tiêu ${profile.dailyVocabularyTarget} từ và ${profile.dailyStudyTargetMinutes} phút học.` },
            data: { route: '/learn', type: 'learning_reminder' },
            webpush: { fcmOptions: { link: process.env.WEB_URL || '/learn' } },
            android: { notification: { channelId: 'learning-reminders' } },
          })
          await this.prisma.pushSubscription.update({ where: { id: subscription.id }, data: { lastSentDate: new Date(`${localDate}T00:00:00.000Z`) } })
        } catch (error: any) {
          const code = String(error?.code || '')
          if (code.includes('registration-token-not-registered') || code.includes('invalid-registration-token')) {
            await this.prisma.pushSubscription.update({ where: { id: subscription.id }, data: { active: false } })
          } else this.logger.warn(`Không gửi được thông báo: ${error?.message || code}`)
        }
      }
    }
  }
}
