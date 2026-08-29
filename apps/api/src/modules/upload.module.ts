import { Module } from '@nestjs/common'
import { UploadController } from '../presentation/upload.controller'
import { CloudinaryService } from '../infrastructure/storage/cloudinary.service'

@Module({
  controllers: [UploadController],
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class UploadModule {}
