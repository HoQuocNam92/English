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

  @Get('recommendations')
  getRecommendations(@Request() req: any) {
    return this.svc.getRecommendations(req.user.sub)
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get flashcards dashboard (stats, heatmap)' })
  getDashboard(@Request() req: any, @Query('from') from?: string, @Query('to') to?: string) {
    return this.svc.getDashboard(req.user.sub, from, to)
  }

  @Get('session')
  @ApiOperation({ summary: 'Get a study session (all words for given filters)' })
  getSession(
    @Request() req: any,
    @Query('domainCode') domainCode?: string,
    @Query('levelCode') levelCode?: string,
    @Query('continue') continueLearning?: string,
    @Query('sourceLessonId') sourceLessonId?: string,
    @Query('topicId') topicId?: string,
    @Query('reviewOnly') reviewOnly?: string,
    @Query('onlyNew') onlyNew?: string,
  ) {
    return this.svc.getStudySession(req.user.sub, { domainCode, levelCode, sourceLessonId, topicId, onlyNew: onlyNew !== 'false', reviewOnly: reviewOnly === 'true', continueLearning: continueLearning === 'true' })
  }

  @Get('certificate-progress')
  getCertificateProgress(@Request() req: any, @Query('certificateId') certificateId: string) {
    return this.svc.getCertificateStudyProgress(req.user.sub, certificateId)
  }

  @Get('quiz-words')
  getQuizWords(@Request() req: any, @Query('sourceLessonId') sourceLessonId?: string) {
    return this.svc.getQuizWords(req.user.sub, sourceLessonId)
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
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.getHistory(req.user.sub, period, rating, Number(page ?? 1), Number(limit ?? 10))
  }
}
