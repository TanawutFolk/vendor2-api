import { connection } from '@src/businessData/db'
import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import { CriteriaFileSQL } from '../../sql/_request-register/CriteriaFileSQL'

const MAX_FILES_PER_CRITERION = 3

type CreateCriteriaFileInput = {
  requestId: number
  criteriaNo: string
  filePath: string
  fileName: string
  fileSize?: number
  fileType?: string
  createBy?: string
}

type CriteriaFileRow = RowDataPacket & {
  VENDOR_SELECTION_CRITERIA_FILE_ID: number
  VENDOR_SELECTION_CRITERIA_ID: number
  REQUEST_VENDOR_SELECTIONS_ID: number
  CRITERIA_NO: string
  FILE_ORDER: number
  FILE_PATH: string
  FILE_NAME: string
  FILE_SIZE: number | null
  FILE_TYPE: string | null
}

export const CriteriaFileService = {
  create: async (input: CreateCriteriaFileInput) => {
    const requestId = Number(input.requestId || 0)
    const criteriaNo = String(input.criteriaNo || '').trim()
    const filePath = String(input.filePath || '').trim()
    const fileName = String(input.fileName || '').trim()
    const actor = String(input.createBy || 'SYSTEM').trim() || 'SYSTEM'

    if (!requestId || !criteriaNo || !filePath || !fileName) {
      throw new Error('Missing request, criteria, or file data')
    }

    const conn = await connection()

    try {
      await conn.beginTransaction()

      const selectionSql = CriteriaFileSQL.getSelectionForUpdate({
        REQUEST_REGISTER_VENDOR_ID: requestId,
      })
      const [selectionRows] = await conn.query<RowDataPacket[]>(selectionSql)
      const selectionId = Number(selectionRows[0]?.REQUEST_VENDOR_SELECTIONS_ID || 0)

      if (!selectionId) {
        throw new Error('Selection Sheet must be saved before uploading criteria files')
      }

      const upsertCriteriaSql = CriteriaFileSQL.upsertCriteria({
        REQUEST_VENDOR_SELECTIONS_ID: selectionId,
        CRITERIA_NO: criteriaNo,
        CREATE_BY: actor,
        UPDATE_BY: actor,
      })
      await conn.query<ResultSetHeader>(upsertCriteriaSql)

      const criteriaSql = CriteriaFileSQL.getCriteriaForUpdate({
        REQUEST_VENDOR_SELECTIONS_ID: selectionId,
        CRITERIA_NO: criteriaNo,
      })
      const [criteriaRows] = await conn.query<RowDataPacket[]>(criteriaSql)
      const criteriaId = Number(criteriaRows[0]?.VENDOR_SELECTION_CRITERIA_ID || 0)

      if (!criteriaId) {
        throw new Error('Criteria record was not found')
      }

      const activeFileOrdersSql = CriteriaFileSQL.getActiveFileOrdersForUpdate({
        VENDOR_SELECTION_CRITERIA_ID: criteriaId,
      })
      const [activeRows] = await conn.query<RowDataPacket[]>(activeFileOrdersSql)
      const activeSlots = new Set(activeRows.map((row) => Number(row.FILE_ORDER)))

      if (activeSlots.size >= MAX_FILES_PER_CRITERION) {
        throw new Error(`Each criterion supports a maximum of ${MAX_FILES_PER_CRITERION} files`)
      }

      const fileOrder = [1, 2, 3].find((slot) => !activeSlots.has(slot))
      if (!fileOrder) {
        throw new Error(`Each criterion supports a maximum of ${MAX_FILES_PER_CRITERION} files`)
      }

      const insertFileSql = CriteriaFileSQL.upsertCriteriaFile({
        VENDOR_SELECTION_CRITERIA_ID: criteriaId,
        FILE_ORDER: fileOrder,
        FILE_PATH: filePath,
        FILE_NAME: fileName,
        FILE_SIZE: Number(input.fileSize || 0) || null,
        FILE_TYPE: String(input.fileType || '').trim() || null,
        CREATE_BY: actor,
        UPDATE_BY: actor,
      })
      const [insertResult] = await conn.query<ResultSetHeader>(insertFileSql)

      const criteriaFileId = Number(insertResult.insertId || 0)
      await conn.commit()

      return {
        CRITERIA_FILE_ID: criteriaFileId,
        VENDOR_SELECTION_CRITERIA_FILE_ID: criteriaFileId,
        VENDOR_SELECTION_CRITERIA_ID: criteriaId,
        FILE_ORDER: fileOrder,
        FILE_PATH: filePath,
        FILE_NAME: fileName,
        FILE_SIZE: Number(input.fileSize || 0) || null,
        FILE_TYPE: String(input.fileType || '').trim() || null,
      }
    } catch (error) {
      await conn.rollback()
      throw error
    } finally {
      conn.release()
    }
  },

  getForDelete: async (requestId: number, criteriaFileId: number) => {
    const conn = await connection()

    try {
      const sql = CriteriaFileSQL.getForDelete({
        REQUEST_REGISTER_VENDOR_ID: requestId,
        VENDOR_SELECTION_CRITERIA_FILE_ID: criteriaFileId,
      })
      const [rows] = await conn.query<CriteriaFileRow[]>(sql)

      return rows[0] || null
    } finally {
      conn.release()
    }
  },

  softDelete: async (criteriaFileId: number, updateBy?: string) => {
    const conn = await connection()

    try {
      const sql = CriteriaFileSQL.softDelete({
        VENDOR_SELECTION_CRITERIA_FILE_ID: criteriaFileId,
        UPDATE_BY: String(updateBy || 'SYSTEM').trim() || 'SYSTEM',
      })
      const [result] = await conn.query<ResultSetHeader>(sql)

      if (Number(result.affectedRows || 0) !== 1) {
        throw new Error('Criteria file record was already removed')
      }
    } finally {
      conn.release()
    }
  },
}
