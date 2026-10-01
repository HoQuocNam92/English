import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { VocabStudyService } from '../application/vocab-study/vocab-study.service'
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard'

@ApiTags('Vocabulary Study')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vocab-study')
export class VocabStudyController {
  constructor(private readonly svc: VocabStudyService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get flashcards dashboard (stats, heatmap)' })
  getDashboard(@Request() req: any) {
    return this.svc.getDashboard(req.user.sub)
  }

  @Get('session')
  @ApiOperation({ summary: 'Get a study session (all words for given filters)' })
  getSession(
    @Request() req: any,
    @Query('domainCode') domainCode?: string,
    @Query('levelCode') levelCode?: string,
    @Query('continue') continueLearning?: string,
  ) {
    return this.svc.getStudySession(req.user.sub, { domainCode, levelCode, continueLearning: continueLearning === 'true' })
  }

  @Get('review-session')
  @ApiOperation({ summary: 'Get SRS review session (words due for review)' })
  getReviewSession(@Request() req: any) {
    return this.svc.getReviewSession(req.user.sub)
  }

  @Post('quiz')
  @ApiOperation({ summary: 'Generate quiz from vocabulary IDs' })
  generateQuiz(@Request() req: any, @Body() body: { vocabIds: string[]; repetitions?: Record<string, number> }) {
    return this.svc.generateQuiz(req.user.sub, body.vocabIds, body.repetitions)
  }

  @Post('answer')
  @ApiOperation({ summary: 'Submit answer and update SRS progress' })
  submitAnswer(@Request() req: any, @Body() body: { vocabularyId: string; isCorrect: boolean }) {
    return this.svc.submitAnswer(req.user.sub, body.vocabularyId, body.isCorrect)
  }

  @Post('rate')
  @ApiOperation({ summary: 'Rate word with 4-level SRS' })
  rateWord(@Request() req: any, @Body() body: { vocabularyId: string; rating: 'easy' | 'medium' | 'hard' | 'mastered' }) {
    return this.svc.rateWord(req.user.sub, body.vocabularyId, body.rating)
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get vocabulary study summary stats' })
  getSummary(@Request() req: any) {
    return this.svc.getSummary(req.user.sub)
  }

  @Get('history')
  @ApiOperation({ summary: 'Get vocabulary study history' })
  getHistory(
    @Request() req: any,
    @Query('period') period?: 'day' | 'month' | 'year' | 'all',
    @Query('rating') rating?: string,
  ) {
    return this.svc.getHistory(req.user.sub, period, rating)
  }
}
