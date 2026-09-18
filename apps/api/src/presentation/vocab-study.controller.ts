import { Controller, Get, Post, Body, Query, Param, UseGuards, Request } from '@nestjs/common'
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
  @ApiOperation({ summary: 'Get flashcards dashboard (stats, heatmap, studying lessons)' })
  getDashboard(@Request() req: any) {
    return this.svc.getDashboard(req.user.sub)
  }

  @Get('session')
  @ApiOperation({ summary: 'Get a study session (all words for given filters)' })
  getSession(
    @Request() req: any,
    @Query('domainCode') domainCode?: string,
    @Query('levelCode') levelCode?: string,
    @Query('lessonId') lessonId?: string,
  ) {
    return this.svc.getStudySession(req.user.sub, { domainCode, levelCode, lessonId })
  }

  @Get('lesson/:lessonId')
  @ApiOperation({ summary: 'Get lesson details and vocabulary list' })
  getLessonVocabList(
    @Request() req: any,
    @Param('lessonId') lessonId: string,
    @Query('sort') sort?: 'default' | 'random',
  ) {
    return this.svc.getLessonVocabList(req.user.sub, lessonId, sort)
  }

  @Get('practice-session/:lessonId')
  @ApiOperation({ summary: 'Get practice session vocabularies for a lesson' })
  getPracticeSession(
    @Request() req: any,
    @Param('lessonId') lessonId: string,
    @Query('onlyNew') onlyNew?: string,
  ) {
    return this.svc.getPracticeSession(req.user.sub, lessonId, {
      onlyNew: onlyNew === 'true',
    })
  }

  @Post('rate')
  @ApiOperation({ summary: 'Rate word memory level (easy, medium, hard, mastered)' })
  rateWord(
    @Request() req: any,
    @Body() body: { vocabularyId: string; rating: 'easy' | 'medium' | 'hard' | 'mastered' },
  ) {
    return this.svc.rateWord(req.user.sub, body.vocabularyId, body.rating)
  }

  @Post('toggle-studying')
  @ApiOperation({ summary: 'Toggle studying status of a lesson' })
  toggleStudyingList(
    @Request() req: any,
    @Body() body: { lessonId: string; isStudying: boolean },
  ) {
    return this.svc.toggleStudyingList(req.user.sub, body.lessonId, body.isStudying)
  }

  @Get('quiz')
  @ApiOperation({ summary: 'Generate quiz for given vocabulary IDs' })
  getQuiz(@Request() req: any, @Query('ids') ids: string) {
    const vocabIds = ids?.split(',').filter(Boolean) ?? []
    return this.svc.generateQuiz(req.user.sub, vocabIds)
  }

  @Post('answer')
  @ApiOperation({ summary: 'Submit quiz answer' })
  submitAnswer(@Request() req: any, @Body() body: { vocabularyId: string; isCorrect: boolean }) {
    return this.svc.submitAnswer(req.user.sub, body.vocabularyId, body.isCorrect)
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get vocabulary study summary stats' })
  getSummary(@Request() req: any) {
    return this.svc.getSummary(req.user.sub)
  }
}

