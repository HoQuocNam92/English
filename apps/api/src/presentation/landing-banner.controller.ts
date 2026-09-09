import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, ParseUUIDPipe, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../infrastructure/database/prisma.service';
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard';
import { PermissionsGuard } from '../infrastructure/auth/permissions.guard';
import { RequirePermissions } from './decorators/require-permissions.decorator';
import { CreateLandingBannerDto, UpdateLandingBannerDto } from './http-dto/landing-banner.dto';
import { CloudinaryService } from '../infrastructure/storage/cloudinary.service';

const BANNER_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

@ApiTags('Landing Banners')
@Controller('landing-banners')
export class LandingBannerController {
  constructor(private prisma: PrismaService, private cloudinary: CloudinaryService) {}

  @Get('active')
  @ApiOperation({ summary: 'Danh sách banner đang hiển thị trên landing page' })
  getActive(@Query('placement') placement?: string) {
    const now = new Date();
    return this.prisma.landingBanner.findMany({
      where: { isActive: true, ...(placement ? { placement } : {}), AND: [{ OR: [{ startsAt: null }, { startsAt: { lte: now } }] }, { OR: [{ endsAt: null }, { endsAt: { gte: now } }] }] },
      orderBy: [{ placement: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  @Get()
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, PermissionsGuard) @RequirePermissions('content:write')
  async list(@Query('page') page = '1', @Query('limit') limit = '20') {
    const p = Math.max(1, Number(page) || 1); const l = Math.min(100, Math.max(1, Number(limit) || 20));
    const [data, total] = await Promise.all([this.prisma.landingBanner.findMany({ skip: (p - 1) * l, take: l, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] }), this.prisma.landingBanner.count()]);
    return { data, meta: { page: p, limit: l, total, totalPages: Math.ceil(total / l) } };
  }

  @Post()
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, PermissionsGuard) @RequirePermissions('content:write')
  create(@Body() dto: CreateLandingBannerDto) { this.validateDates(dto.startsAt, dto.endsAt); return this.prisma.landingBanner.create({ data: this.toData(dto) as any }); }

  @Patch(':id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, PermissionsGuard) @RequirePermissions('content:write')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateLandingBannerDto) {
    const current = await this.prisma.landingBanner.findUnique({ where: { id } }); if (!current) throw new NotFoundException('Banner không tồn tại');
    this.validateDates(dto.startsAt ?? current.startsAt?.toISOString(), dto.endsAt ?? current.endsAt?.toISOString());
    return this.prisma.landingBanner.update({ where: { id }, data: this.toData(dto) as any });
  }

  @Patch(':id/toggle')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, PermissionsGuard) @RequirePermissions('content:write')
  async toggle(@Param('id', ParseUUIDPipe) id: string) { const row = await this.prisma.landingBanner.findUnique({ where: { id } }); if (!row) throw new NotFoundException('Banner không tồn tại'); return this.prisma.landingBanner.update({ where: { id }, data: { isActive: !row.isActive } }); }

  @Post(':id/image')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, PermissionsGuard) @RequirePermissions('content:write')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 8 * 1024 * 1024 }, fileFilter: (_, file, cb) => BANNER_IMAGE_TYPES.includes(file.mimetype) ? cb(null, true) : cb(new BadRequestException('Chỉ chấp nhận JPG, PNG hoặc WEBP'), false) }))
  async uploadImage(@Param('id', ParseUUIDPipe) id: string, @UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Vui lòng chọn ảnh banner');
    const banner = await this.prisma.landingBanner.findUnique({ where: { id } }); if (!banner) throw new NotFoundException('Banner không tồn tại');
    const uploaded = await this.cloudinary.uploadBannerImage(file.buffer, id);
    try {
      const updated = await this.prisma.landingBanner.update({ where: { id }, data: { imageUrl: uploaded.secure_url, imagePublicId: uploaded.public_id } });
      if (banner.imagePublicId) await this.cloudinary.deleteImage(banner.imagePublicId);
      return updated;
    } catch (error) { await this.cloudinary.deleteImage(uploaded.public_id); throw error; }
  }

  @Delete(':id/image')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, PermissionsGuard) @RequirePermissions('content:write')
  async removeImage(@Param('id', ParseUUIDPipe) id: string) {
    const banner = await this.prisma.landingBanner.findUnique({ where: { id } }); if (!banner) throw new NotFoundException('Banner không tồn tại');
    if (banner.imagePublicId) await this.cloudinary.deleteImage(banner.imagePublicId);
    return this.prisma.landingBanner.update({ where: { id }, data: { imageUrl: null, imagePublicId: null } });
  }

  @Delete(':id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, PermissionsGuard) @RequirePermissions('content:write') @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) { const banner = await this.prisma.landingBanner.findUnique({ where: { id } }); if (!banner) throw new NotFoundException('Banner không tồn tại'); if (banner.imagePublicId) await this.cloudinary.deleteImage(banner.imagePublicId); await this.prisma.landingBanner.delete({ where: { id } }); }

  private validateDates(start?: string, end?: string) { if (start && end && new Date(start) >= new Date(end)) throw new BadRequestException('endsAt phải sau startsAt'); }
  private toData(dto: any) { return { ...dto, ...(dto.displayMode === 'image_only' && !dto.title ? { title: 'Banner hình ảnh' } : {}), ...(dto.startsAt !== undefined ? { startsAt: dto.startsAt ? new Date(dto.startsAt) : null } : {}), ...(dto.endsAt !== undefined ? { endsAt: dto.endsAt ? new Date(dto.endsAt) : null } : {}) }; }
}
