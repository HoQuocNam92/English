import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ConfigService } from '@nestjs/config'
import { dueReminderDate } from './reminder-time'
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app'
import { getMessaging, Messaging } from 'firebase-admin/messaging'
import { PrismaService } from '../../infrastructure/database/prisma.service'

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name)
  private readonly messaging: Messaging | null

  constructor(private readonly prisma: PrismaService, private readonly config: ConfigService) {
    try {
      const projectId = config.get<string>('FIREBASE_PROJECT_ID')
      const clientEmail = config.get<string>('FIREBASE_CLIENT_EMAIL')
      const privateKey = config.get<string>('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n')
      if ((!projectId || !clientEmail || !privateKey) && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        this.messaging = null
        this.logger.warn('Firebase chưa được cấu hình; chỉ thông báo đẩy đang tắt, lời nhắc trong web vẫn hoạt động.')
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
      this.logger.warn('Firebase chưa được cấu hình; chỉ thông báo đẩy đang tắt, lời nhắc trong web vẫn hoạt động.')
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
    if (this.config.get<string>('LEARNING_REMINDER_SCHEDULER') === 'external') return
    return this.dispatchLearningReminders()
  }

  getPending(userId: string) {
    return this.prisma.learningNotification.findMany({
      where: { userId, readAt: null, user: { learnerProfile: { reminderEnabled: true } } }, orderBy: { createdAt: 'desc' }, take: 20,
    })
  }

  markRead(userId: string, id: string) {
    return this.prisma.learningNotification.updateMany({ where: { id, userId, readAt: null }, data: { readAt: new Date() } })
  }

  async dispatchLearningReminders(now = new Date()) {
    const profiles = await this.prisma.learnerProfile.findMany({
      where: { reminderEnabled: true, reminderTime: { not: null }, user: { status: 'active', deletedAt: null } },
      include: { user: { include: { userDetail: true, pushSubscriptions: { where: { active: true } } } } },
    })
    let created = 0
    for (const profile of profiles) {
      const localDate = dueReminderDate(now, profile.reminderTime!, profile.user.userDetail?.timezone || 'Asia/Ho_Chi_Minh')
      if (!localDate) continue
      const title = 'Đến giờ học rồi!'
      const body = `Hôm nay bạn có mục tiêu ${profile.dailyVocabularyTarget} từ và ${profile.dailyStudyTargetMinutes} phút học.`
      const result = await this.prisma.learningNotification.createMany({
        data: [{ userId: profile.userId, localDate, title, body }], skipDuplicates: true,
      })
      created += result.count
      if (!this.messaging) continue
      for (const subscription of profile.user.pushSubscriptions) {
        if (subscription.lastSentDate?.toISOString().slice(0, 10) === localDate) continue
        try {
          await this.messaging.send({
            token: subscription.token,
            notification: { title, body },
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
    return { created }
  }
}
