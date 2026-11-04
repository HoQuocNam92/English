import { BadRequestException, Controller, ForbiddenException, Get, NotFoundException, Param, Query, UseGuards } from '@nestjs/common'
import { IsDateString, IsIn, IsInt, IsIP, IsOptional, IsString, IsUUID, Max, MaxLength, Min, isUUID } from 'class-validator'
import { Type } from 'class-transformer'
import { PrismaService } from '../infrastructure/database/prisma.service'
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard'
import { CurrentUser, JwtPayload } from './decorators/current-user.decorator'
import { safeValues } from '../infrastructure/audit/audit-events'

export class AuditQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(10000) page = 1
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 25
  @IsOptional() @IsString() @MaxLength(100) search?: string
  @IsOptional() @IsIn(['success', 'failure', 'noop', 'unknown']) outcome?: string
  @IsOptional() @IsDateString() from?: string
  @IsOptional() @IsDateString() to?: string
  @IsOptional() @IsString() @MaxLength(254) actor?: string
  @IsOptional() @IsString() @MaxLength(100) eventKey?: string
  @IsOptional() @IsIn(['user','role','user_role','permission','lesson','vocabulary','question','exam','certificate','level','mfa','audit']) targetType?: string
  @IsOptional() @IsIn(['info','warning','critical']) severity?: string
  @IsOptional() @IsIP() ip?: string
  @IsOptional() @IsIn(['asc','desc']) sort?: 'asc' | 'desc' = 'desc'
  @IsOptional() @IsUUID('all') cursor?: string
}
export const canReadAudit = (user: JwtPayload) => user.roles.includes('admin') || user.permissions.includes('audit:read')
const summary = { id:true,actorId:true,actorEmail:true,method:true,route:true,action:true,targetIds:true,statusCode:true,ipAddress:true,createdAt:true,eventKey:true,targetType:true,outcome:true,severity:true,requestId:true,requestedCount:true,updatedCount:true,skippedCount:true }

@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
export class AuditLogController {
  constructor(private prisma: PrismaService) {}
  private authorize(user: JwtPayload) { if (!canReadAudit(user)) throw new ForbiddenException('Bạn không có quyền xem nhật ký thao tác') }
  @Get('alerts')
  async alerts(@CurrentUser() user: JwtPayload) {
    this.authorize(user)
    return { data: await this.prisma.auditAlert.findMany({ orderBy: [{ createdAt:'desc' },{id:'desc'}], take: 25 }) }
  }
  @Get(':id')
  async detail(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    this.authorize(user)
    if (!isUUID(id,'all')) throw new BadRequestException('Mã sự kiện không hợp lệ')
    const item = await this.prisma.auditLog.findUnique({ where: { id } })
    if (!item) throw new NotFoundException('Không tìm thấy sự kiện')
    return { ...item, oldValues: item.oldValues == null ? null : safeValues(item.oldValues), newValues: item.newValues == null ? null : safeValues(item.newValues) }
  }
  @Get()
  async list(@CurrentUser() user: JwtPayload, @Query() query: AuditQueryDto) {
    this.authorize(user)
    const { page = 1, limit = 25, search, outcome, from, to, actor, eventKey, targetType, severity, ip, sort = 'desc', cursor } = query
    if (from && to && new Date(from) > new Date(to)) throw new BadRequestException('Ngày bắt đầu phải trước ngày kết thúc')
    const where: any = {
      ...(search ? { OR: [{ actorEmail: { contains: search, mode:'insensitive' } }, { route: { contains:search, mode:'insensitive' } }, ...(isUUID(search,'all') ? [{ requestId:search },{ targetIds:{has:search} },{id:search}] : [])] } : {}),
      ...(outcome ? outcome === 'unknown' ? {outcome:null} : {outcome} : {}),
      ...(actor ? isUUID(actor,'all') ? {actorId:actor} : {actorEmail:{contains:actor,mode:'insensitive'}} : {}),
      ...(eventKey ? {eventKey} : {}), ...(targetType ? {targetType} : {}), ...(severity ? {severity} : {}), ...(ip ? {ipAddress:ip} : {}),
      ...(from || to ? {createdAt:{...(from ? {gte:new Date(from)} : {}),...(to ? {lte:new Date(to)} : {})}} : {}),
    }
    if (cursor) {
      const anchor = await this.prisma.auditLog.findUnique({where:{id:cursor},select:{id:true,createdAt:true}})
      if (!anchor) throw new BadRequestException('Con trỏ phân trang không còn hợp lệ')
      where.AND = [{OR:[{createdAt:{[sort === 'desc' ? 'lt' : 'gt']:anchor.createdAt}},{createdAt:anchor.createdAt,id:{[sort === 'desc' ? 'lt' : 'gt']:anchor.id}}]}]
    }
    const [data,total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({where,select:summary,orderBy:[{createdAt:sort},{id:sort}],skip:cursor ? 0 : (page-1)*limit,take:limit}),
      this.prisma.auditLog.count({where}),
    ], { isolationLevel: 'RepeatableRead' })
    return {data,meta:{total,page,limit,totalPages:Math.ceil(total/limit),nextCursor:data.length === limit ? data[data.length-1].id : null}}
  }
}
