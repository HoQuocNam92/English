import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20'
import { AuthService } from '../../application/auth/auth.service'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:3001/api/v1/auth/google/callback',
      scope: ['email', 'profile'],
    })
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) {
    const { emails, displayName, photos, id } = profile
    const email = emails?.[0]?.value
    if (!email) return done(new Error('No email from Google'), false)
    const avatarUrl = photos?.[0]?.value
    const user = await this.authService.findOrCreateGoogleUser({ googleId: id, email, displayName, avatarUrl })
    done(null, user)
  }
}
