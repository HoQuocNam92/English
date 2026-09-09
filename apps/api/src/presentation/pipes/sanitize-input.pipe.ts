import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common'

const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/

function sanitize(value: unknown): unknown {
  if (typeof value === 'string') {
    if (CONTROL_CHARACTERS.test(value)) {
      throw new BadRequestException('Dữ liệu chứa ký tự điều khiển không hợp lệ')
    }
    return value.trim().replace(/[ \t]+/g, ' ')
  }
  if (Array.isArray(value)) return value.map(sanitize)
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, sanitize(item)]))
  }
  return value
}

@Injectable()
export class SanitizeInputPipe implements PipeTransform {
  transform(value: unknown, _metadata: ArgumentMetadata) {
    return sanitize(value)
  }
}
