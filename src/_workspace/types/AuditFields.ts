export interface AuditFields {
  DESCRIPTION?: string | null
  CREATE_BY: string
  UPDATE_BY?: string | null
  CREATE_DATE?: string | Date | null
  UPDATE_DATE?: string | Date | null
  INUSE: number
}
