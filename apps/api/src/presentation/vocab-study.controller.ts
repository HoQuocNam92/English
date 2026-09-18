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
