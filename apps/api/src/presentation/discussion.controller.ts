import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard';
import { PermissionsGuard } from '../infrastructure/auth/permissions.guard';
import { PrismaService } from '../infrastructure/database/prisma.service';
import { CurrentUser, JwtPayload } from './decorators/current-user.decorator';
import { RequirePermissions } from './decorators/require-permissions.decorator';

export class CreatePostDto {
  @ApiProperty() @IsString() @IsNotEmpty() @MinLength(5) @MaxLength(300) title: string;
  @ApiProperty() @IsString() @IsNotEmpty() @MinLength(10) @MaxLength(10000) content: string;
  @ApiProperty({ type: [String], required: false }) @IsOptional() @IsArray() @ArrayMaxSize(10) @IsString({ each: true }) @MaxLength(30, { each: true }) tags?: string[];
}

export class CreateCommentDto {
  @ApiProperty() @IsString() @IsNotEmpty() @MinLength(2) @MaxLength(3000) content: string;
}

export class ModeratePostDto {
  @ApiProperty() @IsBoolean() locked: boolean;
  @ApiProperty({ required: false, maxLength: 500 }) @IsOptional() @IsString() @MaxLength(500) reason?: string;
}

@ApiTags('Community Discussion')
@Controller('discussion')
export class DiscussionController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('posts')
  @ApiOperation({ summary: 'Danh sách bài thảo luận từ cơ sở dữ liệu' })
  async getPosts(@Query('tag') tag?: string, @Query('page') page = '1') {
    const pageNumber = Math.max(1, Number.parseInt(page, 10) || 1);
    const where = tag ? { tags: { has: tag } } : {};
    const [posts, total] = await Promise.all([
      this.prisma.discussionPost.findMany({
        where, skip: (pageNumber - 1) * 20, take: 20,
        include: { user: { include: { userDetail: true } }, _count: { select: { comments: true, votes: true } } },
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.discussionPost.count({ where }),
    ]);
    return { posts: posts.map(({ user, ...post }) => ({ ...post, authorName: user.userDetail?.displayName || user.email.split('@')[0] })), total, page: pageNumber };
  }

  @Get('posts/:id')
  async getPost(@Param('id', ParseUUIDPipe) id: string) {
    const exists = await this.prisma.discussionPost.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException('Không tìm thấy bài viết');
    await this.prisma.discussionPost.update({ where: { id }, data: { viewCount: { increment: 1 } } });
    return this.prisma.discussionPost.findUnique({
      where: { id },
      include: { user: { include: { userDetail: true } }, comments: { include: { user: { include: { userDetail: true } } }, orderBy: { createdAt: 'asc' } }, votes: { include: { user: { include: { userDetail: true } } } }, _count: { select: { comments: true, votes: true } } },
    });
  }

  @Post('posts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createPost(@CurrentUser() user: JwtPayload, @Body() dto: CreatePostDto) {
    return this.prisma.discussionPost.create({ data: { userId: user.sub, title: dto.title.trim(), content: dto.content.trim(), tags: dto.tags?.map(tag => tag.trim()).filter(Boolean) || [] } });
  }

  @Post('posts/:id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async addComment(@Param('id', ParseUUIDPipe) postId: string, @CurrentUser() user: JwtPayload, @Body() dto: CreateCommentDto) {
    const post = await this.prisma.discussionPost.findUnique({ where: { id: postId }, select: { isLocked: true } });
    if (!post) throw new NotFoundException('Không tìm thấy bài viết');
    if (post.isLocked) throw new BadRequestException('Bài viết đã bị khóa và không nhận bình luận mới');
    return this.prisma.discussionComment.create({ data: { postId, userId: user.sub, content: dto.content.trim() } });
  }

  @Post('posts/:id/vote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async votePost(@Param('id', ParseUUIDPipe) postId: string, @CurrentUser() user: JwtPayload) {
    const post = await this.prisma.discussionPost.findUnique({ where: { id: postId }, select: { isLocked: true } });
    if (!post) throw new NotFoundException('Không tìm thấy bài viết');
    if (post.isLocked) throw new BadRequestException('Bài viết đã bị khóa');
    const key = { postId_userId: { postId, userId: user.sub } };
    const existing = await this.prisma.discussionVote.findUnique({ where: key });
    if (existing) { await this.prisma.discussionVote.delete({ where: key }); return { voted: false }; }
    await this.prisma.discussionVote.create({ data: { postId, userId: user.sub, value: 1 } });
    return { voted: true };
  }

  @Delete('posts/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async deleteOwnPost(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    const deleted = await this.prisma.discussionPost.deleteMany({ where: { id, userId: user.sub } });
    if (!deleted.count) throw new NotFoundException('Không tìm thấy bài viết hoặc bạn không có quyền xóa');
    return { success: true };
  }

  @Patch('admin/posts/:id/lock')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('community:manage')
  @ApiBearerAuth()
  async moderatePost(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ModeratePostDto) {
    const exists = await this.prisma.discussionPost.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException('Không tìm thấy bài viết');
    return this.prisma.discussionPost.update({ where: { id }, data: { isLocked: dto.locked, lockedAt: dto.locked ? new Date() : null, moderationReason: dto.locked ? dto.reason?.trim() || null : null } });
  }

  @Delete('admin/posts/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('community:manage')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAnyPost(@Param('id', ParseUUIDPipe) id: string) {
    const deleted = await this.prisma.discussionPost.deleteMany({ where: { id } });
    if (!deleted.count) throw new NotFoundException('Không tìm thấy bài viết');
  }

  @Get('trending')
  async getTrending() {
    return this.prisma.discussionPost.findMany({ take: 5, orderBy: [{ viewCount: 'desc' }, { createdAt: 'desc' }], include: { _count: { select: { comments: true, votes: true } } } });
  }

  @Get('top-members')
  async getTopMembers() {
    const members = await this.prisma.discussionPost.groupBy({ by: ['userId'], _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 5 });
    const users = await this.prisma.user.findMany({ where: { id: { in: members.map(member => member.userId) } }, include: { userDetail: true } });
    return members.map(member => ({ userId: member.userId, displayName: users.find(user => user.id === member.userId)?.userDetail?.displayName || 'Thành viên', postCount: member._count.id }));
  }

  @Get('ai-suggestions')
  async getSuggestions() {
    const posts = await this.prisma.discussionPost.findMany({ take: 5, orderBy: [{ viewCount: 'desc' }, { createdAt: 'desc' }], select: { id: true, title: true, tags: true, viewCount: true } });
    return { topics: posts, source: 'community_database' };
  }
}
