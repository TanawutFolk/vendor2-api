import * as XLSX from 'xlsx'
import { connection } from '@businessData/db'
import { ResultSetHeader, RowDataPacket } from 'mysql2'
import { MySQLExecute } from '@businessData/dbExecute'
import { BlacklistSQL } from '../../sql/_black-list/BlacklistSQL'
import { parseCnRows, normalizeName } from './BlacklistUtils'

export const BlacklistCNService = {
  search: async (dataItem: any) => {
    const sql = BlacklistSQL.search(dataItem || {})
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },

  importFile: async (dataItem: { file?: Express.Multer.File; CREATE_BY?: string; UPDATE_BY?: string }) => {
    let conn: any = null
    try {
      const file = dataItem.file
      const createBy = String(dataItem.CREATE_BY || dataItem.UPDATE_BY || 'SYSTEM').trim() || 'SYSTEM'
      const updateBy = String(dataItem.UPDATE_BY || createBy).trim() || createBy

      if (!file?.buffer) {
        throw new Error('Missing upload file')
      }

      const workbook = XLSX.read(file.buffer, { type: 'buffer' })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]

      if (!worksheet) {
        throw new Error('Worksheet not found')
      }

      const parsedRows = parseCnRows(worksheet)

      if (parsedRows.length === 0) {
        throw new Error(['No blacklist rows found for CN format.', 'Please check the template and ensure the required vendor name column has data.'].join(' '))
      }

      conn = await connection()
      await conn.beginTransaction()
      await conn.query(BlacklistSQL.deleteCn())

      let executionCount = 1

      for (const row of parsedRows) {
        const sqlInsertVendor = BlacklistSQL.insertCn({
          ...row,
          DESCRIPTION: null,
          CREATE_BY: createBy,
          UPDATE_BY: updateBy || null,
          INUSE: 1,
        })

        const [vendorResult] = await conn.query(sqlInsertVendor)
        executionCount += 1

        const insertedVendorId = Number((vendorResult as ResultSetHeader).insertId || 0)

        if (!insertedVendorId) {
          throw new Error(`Failed to insert blacklist vendor "${row.primary_name}"`)
        }

        for (const aliasName of row.aliases) {
          const sqlInsertAlias = BlacklistSQL.insertAlias({
            vendor_id: insertedVendorId,
            alias_name: aliasName,
            normalized_alias_name: normalizeName(aliasName),
            DESCRIPTION: null,
            CREATE_BY: createBy,
            UPDATE_BY: updateBy || null,
            INUSE: 1,
          })
          await conn.query(sqlInsertAlias)
          executionCount += 1
        }
      }

      await conn.commit()

      return {
        Status: true,
        Message: `Updated CN blacklist successfully and replaced ${parsedRows.length} rows`,
        ResultOnDb: {
          affectedRows: parsedRows.length,
          source_format: 'CN',
          file_name: file.originalname,
          CREATE_BY: createBy,
          UPDATE_BY: updateBy,
          executionCount,
        },
        MethodOnDb: 'Update Blacklist CN',
        TotalCountOnDb: parsedRows.length,
      }
    } catch (error: any) {
      if (conn) await conn.rollback()
      return {
        Status: false,
        Message: error?.message || 'Failed to import CN blacklist file',
        ResultOnDb: {},
        MethodOnDb: 'Update Blacklist CN Failed',
        TotalCountOnDb: 0,
      }
    } finally {
      if (conn) conn.release()
    }
  },
}
