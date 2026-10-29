import { BadRequestException, ConflictException } from '@nestjs/common'

// Keep this equivalent to canonical_phone in the identity-index migration.
export function normalizePhone(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null
  if (typeof value !== 'string' || !/^\+?[\d\s().-]+$/.test(value)) throw new BadRequestException('Số điện thoại không hợp lệ')
  let digits = value.replace(/\D/g, '')
  if (!digits) return null
  if (digits.startsWith('00')) digits = digits.slice(2)
  if (digits.length === 10 && digits.startsWith('0')) digits = `84${digits.slice(1)}`
  if (digits.length < 9 || digits.length > 15) throw new BadRequestException('Số điện thoại phải có từ 9 đến 15 chữ số')
  return `+${digits}`
}

export function identityConflict(error: unknown): never {
  const failure = error as { code?: string; meta?: { target?: unknown } }
  if (failure?.code === 'P2002') {
    const target = JSON.stringify(failure.meta?.target ?? '')
    if (/email/i.test(target)) throw new ConflictException('Email này đã được sử dụng')
    if (/phone/i.test(target)) throw new ConflictException('Số điện thoại này đã được sử dụng')
    throw new ConflictException('Email hoặc số điện thoại này đã được sử dụng')
  }
  throw error
}
