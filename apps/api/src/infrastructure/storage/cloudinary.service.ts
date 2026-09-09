import { BadGatewayException, Injectable, ServiceUnavailableException } from '@nestjs/common'
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary'

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    })
  }

  async uploadImage(
    fileBuffer: Buffer,
    options: {
      folder?: string
      publicId?: string
      transformation?: object
    } = {}
  ): Promise<UploadApiResponse> {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new ServiceUnavailableException('Cloudinary chưa được cấu hình đủ CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY và CLOUDINARY_API_SECRET')
    }
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: options.folder ?? 'techenglish',
          public_id: options.publicId,
          transformation: options.transformation ?? [
            { width: 800, height: 800, crop: 'limit' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) {
            const message = String(error.message || '')
            if (/missing permissions|forbidden|not allowed/i.test(message)) {
              return reject(new BadGatewayException('Cloudinary từ chối tải ảnh: API key hiện tại chưa có quyền tạo tài nguyên (create). Hãy cấp quyền Upload/Create trong Cloudinary rồi thử lại.'))
            }
            return reject(new BadGatewayException(`Không thể tải ảnh lên Cloudinary: ${message || 'lỗi không xác định'}`))
          }
          resolve(result!)
        }
      )
      stream.end(fileBuffer)
    })
  }

  async uploadAvatar(fileBuffer: Buffer, userId: string): Promise<UploadApiResponse> {
    return this.uploadImage(fileBuffer, {
      folder: 'techenglish/avatars',
      publicId: `avatar-${userId}`,
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    })
  }

  async uploadLessonImage(fileBuffer: Buffer, lessonId: string): Promise<UploadApiResponse> {
    return this.uploadImage(fileBuffer, {
      folder: 'techenglish/lessons',
      publicId: `lesson-${lessonId}-${Date.now()}`,
    })
  }

  async uploadBannerImage(fileBuffer: Buffer, bannerId: string): Promise<UploadApiResponse> {
    return this.uploadImage(fileBuffer, {
      folder: 'techenglish/landing-banners',
      publicId: `banner-${bannerId}-${Date.now()}`,
      transformation: [
        { width: 1800, height: 700, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    })
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      const result = await cloudinary.uploader.destroy(publicId)
      if (result?.result && !['ok', 'not found'].includes(result.result)) throw new Error(result.result)
    } catch (error: any) {
      throw new BadGatewayException(`Không thể xóa ảnh trên Cloudinary: ${error?.message || 'lỗi không xác định'}`)
    }
  }

  getOptimizedUrl(publicId: string, width = 400, height = 400): string {
    return cloudinary.url(publicId, {
      width,
      height,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto',
    })
  }
}
