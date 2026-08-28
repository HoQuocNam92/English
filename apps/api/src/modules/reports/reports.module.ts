import { Module } from '@nestjs/common'
import { ReportsService } from './reports.service'
import { ReportsController } from './presentation/controllers/reports.controller'
@Module({ providers: [ReportsService], controllers: [ReportsController] })
export class ReportsModule {}
