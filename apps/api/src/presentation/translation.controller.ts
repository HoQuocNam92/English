import { Body, Controller, HttpException, HttpStatus, Post, Req } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { SelectionTranslationService } from '../application/vocabulary/selection-translation.service'

@ApiTags('Translation')
@Controller('translation')
export class TranslationController {
  private readonly requests = new Map<string, { count: number; resetAt: number }>()
  constructor(private readonly service: SelectionTranslationService) {}
  @Post('selection')
  translate(@Body() body: { text?: unknown; context?: unknown }, @Req() req: any) {
    this.limit(req)
    return this.service.translate(body?.text, body?.context)
  }
  @Post('pronunciation')
  pronounce(@Body() body: { text?: unknown }, @Req() req: any) {
    this.limit(req)
    return this.service.pronounce(body?.text)
  }
  private limit(req: any) {
    const now = Date.now()
    const ip = req.ip ?? req.socket?.remoteAddress ?? 'unknown'
    const window = this.requests.get(ip)
    if (window && window.resetAt > now) {
      if (window.count >= 60) throw new HttpException('Bạn đang dịch quá nhanh. Hãy thử lại sau một phút.', HttpStatus.TOO_MANY_REQUESTS)
      window.count++
    } else {
      for (const [key, value] of this.requests) if (value.resetAt <= now) this.requests.delete(key)
      if (this.requests.size >= 10000) throw new HttpException('Dịch tự động đang bận. Vui lòng thử lại.', HttpStatus.TOO_MANY_REQUESTS)
      this.requests.set(ip, { count: 1, resetAt: now + 60000 })
    }
  }
}
