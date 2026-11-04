import { Controller, ForbiddenException, Get, Query, UseGuards } from '@nestjs/common'
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { PrismaService } from '../infrastructure/database/prisma.service'
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard'
import { CurrentUser, JwtPayload } from './decorators/current-user.decorator'

class AuditQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(1000000) page = 1
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 25
  @IsOptional() @IsString() @MaxLength(100) search?: string
  @IsOptional() @IsIn(['success', 'failure']) outcome?: string
}

@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
export class AuditLogController {
  constructor(private prisma: PrismaService) {}
  @Get()
  async list(@CurrentUser() user: JwtPayload, @Query() query: AuditQueryDto) {
    if (!user.roles.includes('admin')) throw new ForbiddenException('Chỉ quản trị viên được xem nhật ký thao tác')
    const { page, limit, search, outcome } = query
    const where: any = {
      ...(search ? { OR: [{ actorEmail: { contains: search, mode: 'insensitive' } }, { route: { contains: search, mode: 'insensitive' } }] } : {}),
      ...(outcome ? { statusCode: outcome === 'success' ? { lt: 400 } : { gte: 400 } } : {}),
    }
    const [data, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({ where, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: (page - 1) * limit, take: limit }),
      this.prisma.auditLog.count({ where }),
    ])
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }
}
