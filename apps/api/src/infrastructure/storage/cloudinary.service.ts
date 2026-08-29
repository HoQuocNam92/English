import { Injectable } from '@nestjs/common'
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
          if (error) return reject(error)
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

  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId)
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
