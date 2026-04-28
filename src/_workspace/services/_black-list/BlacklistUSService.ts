import * as XLSX from 'xlsx'
import { connection } from '@businessData/db'
import { RowDataPacket } from 'mysql2'
import { MySQLExecute } from '@businessData/dbExecute'
import { BlacklistSQL } from '../../sql/_black-list/BlacklistSQL'
import { parseUsRows } from './BlacklistUtils'
import getSqlWhere_aggrid from '@src/helpers/getSqlWhere_aggrid'

export const BlacklistUSService = {
    searchAgGrid: async (dataItem: any) => {
        const payload = { ...(dataItem || {}) }
        const tableIds = [
            { table: 'bl', id: 'blacklist_id', Fns: '=' },
            { table: 'bl', id: 'group_code', Fns: '=' },
            { table: 'bl', id: 'vendor_name', Fns: 'LIKE' },
            { table: 'bl', id: 'source_name', Fns: 'LIKE' },
            { table: 'bl', id: 'entity_number', Fns: 'LIKE' },
            { table: 'bl', id: 'entity_type', Fns: 'LIKE' },
            { table: 'bl', id: 'programs', Fns: 'LIKE' },
            { table: 'bl', id: 'country', Fns: 'LIKE' },
            { table: 'bl', id: 'wmd_type', Fns: 'LIKE' },
            { table: 'bl', id: 'update_by', Fns: 'LIKE' },
            { table: 'bl', id: 'updated_date', Fns: '=' },
            { table: 'bl', id: 'create_date', Fns: '=' },
            { table: 'bl', id: 'in_use', Fns: '=' },
            { table: 'bl', id: 'alias_count', Fns: '=' },
        ]

        getSqlWhere_aggrid(payload, tableIds, 'updated_date')
        const sql = BlacklistSQL.searchAgGrid(payload)
        const result = await Promise.all(sql.map(item => MySQLExecute.search(item) as Promise<RowDataPacket[]>))

        return result
    },

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

            console.log('\n====== [BlacklistUS] Import File ======')
            console.log(`File name  : ${file.originalname}`)
            console.log(`All sheets : ${workbook.SheetNames.join(', ')}`)

            // Merge rows from ALL sheets that can be parsed as US format
            // (instruction/empty sheets produce 0 rows and are automatically ignored)
            const allParsedRows: ReturnType<typeof parseUsRows> = [] as any
            const usedSheets: string[] = []

            for (const sheetName of workbook.SheetNames) {
                const ws = workbook.Sheets[sheetName]
                if (!ws) continue
                const candidate = parseUsRows(ws)
                console.log(`  Sheet "${sheetName}" → ${candidate.length} rows parsed`)
                if (candidate.length > 0) {
                    allParsedRows.push(...candidate)
                    usedSheets.push(sheetName)
                }
            }

            const parsedRows = allParsedRows
            console.log(`Used sheets: [${usedSheets.join(', ')}]`)
            console.log(`Total rows  : ${parsedRows.length}`)
            console.log('======================================\n')

            if (parsedRows.length === 0) {
                throw new Error(
                    'No blacklist rows found in any sheet. ' +
                    `Sheets scanned: [${workbook.SheetNames.join(', ')}]. ` +
                    'Please verify this is a US blacklist file.'
                )
            }

            conn = await connection()
            await conn.beginTransaction()
            await conn.query(BlacklistSQL.deleteUs())

            let executionCount = 1

            for (const row of parsedRows) {
                const sqlInsert = BlacklistSQL.insertUs({
                    ...row,
                    CREATE_BY: createBy,
                    UPDATE_BY: updateBy || null,
                    INUSE: 1,
                })
                await conn.query(sqlInsert)
                executionCount += 1
            }

            await conn.commit()

            return {
                Status: true,
                Message: `Updated US blacklist successfully and replaced ${parsedRows.length} rows`,
                ResultOnDb: {
                    affectedRows: parsedRows.length,
                    source_format: 'US',
                    file_name: file.originalname,
                    CREATE_BY: createBy,
                    UPDATE_BY: updateBy,
                    executionCount,
                },
                MethodOnDb: 'Update Blacklist US',
                TotalCountOnDb: parsedRows.length,
            }
        } catch (error: any) {
            if (conn) await conn.rollback()
            return {
                Status: false,
                Message: error?.message || 'Failed to import US blacklist file',
                ResultOnDb: {},
                MethodOnDb: 'Update Blacklist US Failed',
                TotalCountOnDb: 0,
            }
        } finally {
            if (conn) conn.release()
        }
    },
}
