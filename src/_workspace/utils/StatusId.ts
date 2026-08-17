export const toStatusId = (value: unknown): number | null => {
  const statusId = Number(value)
  return Number.isInteger(statusId) && statusId > 0 ? statusId : null
}

export const requireStatusId = (value: unknown, fieldName: string): number => {
  const statusId = toStatusId(value)
  if (statusId === null) throw new Error(`${fieldName} must be a positive integer ID`)
  return statusId
}

export const toVendorStatusId = (value: unknown): number | null => {
  if (typeof value !== 'number' && typeof value !== 'string') return null
  if (typeof value === 'string' && value.trim() === '') return null

  const statusId = Number(value)
  return Number.isInteger(statusId) && statusId >= 0 ? statusId : null
}

export const requireVendorStatusId = (value: unknown, fieldName: string): number => {
  const statusId = toVendorStatusId(value)
  if (statusId === null) throw new Error(`${fieldName} must be a non-negative integer ID`)
  return statusId
}
