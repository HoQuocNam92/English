import {
  Controller, Post, UseGuards, UseInterceptors,
  UploadedFile, BadRequestException, Param, Body
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger'
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard'
import { CloudinaryService } from '../infrastructure/storage/cloudinary.service'
import { CurrentUser, JwtPayload } from './decorators/current-user.decorator'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

@ApiTags('Upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(private cloudinary: CloudinaryService) {}

  @Post('avatar')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (_, file, cb) => {
      if (!ALLOWED_TYPES.includes(file.mimetype)) {
        return cb(new BadRequestException('Chỉ cho phép ảnh JPG, PNG, WEBP, GIF'), false)
      }
      cb(null, true)
    },
  }))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!file) throw new BadRequestException('Vui lòng chọn file ảnh')
    const result = await this.cloudinary.uploadAvatar(file.buffer, user.sub)
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    }
  }

  @Post('avatar-base64')
  async uploadAvatarBase64(
    @Body() body: { base64?: string; mimeType?: string },
    @CurrentUser() user: JwtPayload,
  ) {
    const mimeType = body?.mimeType || 'image/jpeg'
    if (!ALLOWED_TYPES.includes(mimeType)) {
      throw new BadRequestException('Chỉ cho phép ảnh JPG, PNG, WEBP hoặc GIF')
    }
    const encoded = body?.base64?.replace(/^data:image\/[^;]+;base64,/, '')
    if (!encoded) throw new BadRequestException('Dữ liệu ảnh không hợp lệ')
    const fileBuffer = Buffer.from(encoded, 'base64')
    if (!fileBuffer.length) throw new BadRequestException('Ảnh đã chọn bị trống hoặc không đọc được')
    if (fileBuffer.length > MAX_FILE_SIZE) throw new BadRequestException('Ảnh không được lớn hơn 5 MB')
    const result = await this.cloudinary.uploadAvatar(fileBuffer, user.sub)
    return { url: result.secure_url, publicId: result.public_id, width: result.width, height: result.height }
  }
}

