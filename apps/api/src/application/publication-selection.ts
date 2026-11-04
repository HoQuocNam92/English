import { BadRequestException } from '@nestjs/common'
import { isUUID } from 'class-validator'

export const MAX_BULK_SELECTION = 10000
export function selectedIdentifiers(ids: unknown): string[] {
  if (!Array.isArray(ids) || !ids.length || ids.length > MAX_BULK_SELECTION || ids.some(id => typeof id !== 'string' || !isUUID(id, 'all')) || new Set(ids).size !== ids.length) {
    throw new BadRequestException('Chọn từ 1 đến 10.000 mã định danh hợp lệ, không trùng lặp')
  }
  return ids
}
export function publicationSelection(dto: { ids?: unknown; status?: unknown }) {
  if (dto.status !== 'draft' && dto.status !== 'published') throw new BadRequestException('Trạng thái đích chỉ được là bản nháp hoặc đã xuất bản')
  return { id: { in: selectedIdentifiers(dto.ids) }, status: dto.status === 'published' ? 'draft' as const : 'published' as const }
}
export function activitySelection(dto: { ids?: unknown; isActive?: unknown }) {
  if (typeof dto.isActive !== 'boolean') throw new BadRequestException('Trạng thái hoạt động phải là giá trị boolean')
  return { id: { in: selectedIdentifiers(dto.ids) }, isActive: !dto.isActive }
}
