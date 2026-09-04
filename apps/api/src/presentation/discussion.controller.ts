import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard';
import { CurrentUser, JwtPayload } from './decorators/current-user.decorator';
import { PrismaService } from '../infrastructure/database/prisma.service';
import { IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() content: string;
  @ApiProperty({ type: [String], required: false }) @IsOptional() @IsArray() tags?: string[];
}

export class CreateCommentDto {
  @ApiProperty() @IsString() content: string;
}

@ApiTags('Community Discussion')
@Controller('discussion')
export class DiscussionController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('posts')
  @ApiOperation({ summary: 'Danh sách bài thảo luận' })
  async getPosts(@Query('tag') tag?: string, @Query('page') page = '1') {
    const skip = (parseInt(page) - 1) * 20;
    const where: any = {};
    if (tag) where.tags = { has: tag };
    const [posts, total] = await Promise.all([
      this.prisma.discussionPost.findMany({
        where, skip, take: 20,
        include: {
          user: { include: { userDetail: true } },
          _count: { select: { comments: true, votes: true } },
        },
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.discussionPost.count({ where }),
    ]);
    return { posts: posts.map(p => ({ ...p, authorName: p.user.userDetail?.displayName || p.user.email.split('@')[0], user: undefined })), total };
  }

  @Get('posts/:id')
  @ApiOperation({ summary: 'Chi tiết bài thảo luận' })
  async getPost(@Param('id') id: string) {
    await this.prisma.discussionPost.update({ where: { id }, data: { viewCount: { increment: 1 } } });
    return this.prisma.discussionPost.findUnique({
      where: { id },
      include: {
        user: { include: { userDetail: true } },
        comments: { include: { user: { include: { userDetail: true } } }, orderBy: { createdAt: 'asc' } },
        votes: true,
        _count: { select: { comments: true, votes: true } },
      },
    });
  }

  @Post('posts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo bài thảo luận mới' })
  async createPost(@CurrentUser() user: JwtPayload, @Body() dto: CreatePostDto) {
    return this.prisma.discussionPost.create({
      data: { userId: user.sub, title: dto.title, content: dto.content, tags: dto.tags || [] },
    });
  }

  @Post('posts/:id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thêm bình luận' })
  async addComment(@Param('id') postId: string, @CurrentUser() user: JwtPayload, @Body() dto: CreateCommentDto) {
    return this.prisma.discussionComment.create({
      data: { postId, userId: user.sub, content: dto.content },
    });
  }

  @Post('posts/:id/vote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upvote/Downvote bài viết' })
  async votePost(@Param('id') postId: string, @CurrentUser() user: JwtPayload) {
    const existing = await this.prisma.discussionVote.findUnique({ where: { postId_userId: { postId, userId: user.sub } } });
    if (existing) {
      await this.prisma.discussionVote.delete({ where: { postId_userId: { postId, userId: user.sub } } });
      return { voted: false };
    }
    await this.prisma.discussionVote.create({ data: { postId, userId: user.sub, value: 1 } });
    return { voted: true };
  }

  @Delete('posts/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa bài viết (chỉ author)' })
  async deletePost(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.prisma.discussionPost.deleteMany({ where: { id, userId: user.sub } });
    return { success: true };
  }
}
