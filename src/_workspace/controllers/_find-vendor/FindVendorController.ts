import { FindVendorModel } from '@src/_workspace/models/_find-vendor/FindVendorModel'
import getSqlWhere_elysia from '@src/helpers/getSqlWhere_elysia'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'
import excel from 'exceljs'
import { toVendorStatusId } from '@src/_workspace/utils/StatusId'

export const FindVendorController = {
    // Search vendors
    search: async (req: Request, res: Response) => {
        const dataItem = !req.body || Object.entries(req.body).length === 0 ? req.query : req.body

        try {
            const { resultData, totalCount } = await FindVendorModel.searchVendors(dataItem)
            const finalResult = resultData.map((row: any) => {
                delete row.CONTACTS_JSON
                delete row.PRODUCTS_JSON
                return row
            })

            res.status(200).json({
                Status: true,
                ResultOnDb: finalResult,
                TotalCountOnDb: totalCount,
                MethodOnDb: 'Search Vendors',
                Message: 'Search Data Success'
            } as ResponseI)
            return
        } catch (error: any) {
            res.status(200).json({
                Status: false,
                ResultOnDb: [],
                TotalCountOnDb: 0,
                MethodOnDb: 'Search Vendors',
                Message: error?.message || 'Failed to search vendors'
            } as ResponseI)
            return
        }
    },

    // Find Vendor owns this detail contract. The response already matches the frontend form.
    getVendorDetail: async (req: Request, res: Response) => {
        let dataItem

        if (!req.body || Object.entries(req.body).length === 0) {
            dataItem = req.query
        } else {
            dataItem = req.body
        }

        try {
            const vendor_id = parseInt(String(dataItem.VENDORS_ID ?? dataItem.vendor_id ?? ''))

            if (!vendor_id || isNaN(vendor_id)) {
                res.status(400).json({
                    Status: false,
                    ResultOnDb: [],
                    TotalCountOnDb: 0,
                    MethodOnDb: 'Get Vendor Detail',
                    Message: 'Invalid vendor ID'
                } as ResponseI)
                return
            }

            const resultData = await FindVendorModel.getVendorDetail(vendor_id)
            if (resultData) {
                res.status(200).json({
                    Status: true,
                    ResultOnDb: resultData,
                    TotalCountOnDb: 1,
                    MethodOnDb: 'Get Vendor Detail',
                    Message: 'Get Data Success'
                } as ResponseI)
                return
            } else {

                res.status(200).json({
                    Status: false,
                    ResultOnDb: [],
                    TotalCountOnDb: 0,
                    MethodOnDb: 'Get Vendor Detail',
                    Message: 'Vendor not found'
                } as ResponseI)
                return
            }
        } catch (error: any) {
            // console.error('Get Vendor Details Error:', error);
            res.status(200).json({
                Status: false,
                ResultOnDb: {},
                TotalCountOnDb: 0,
                MethodOnDb: 'Get Vendor Detail',
                Message: error?.message || 'Failed to get vendor details'
            } as ResponseI)
            return
        }
    },

    // Update vendor
    update: async (req: Request, res: Response) => {
        let dataItem

        if (!req.body || Object.entries(req.body).length === 0) {
            dataItem = req.query
        } else {
            dataItem = req.body
        }

        try {
            const vendor_id = parseInt(String(dataItem.VENDORS_ID ?? dataItem.vendor_id ?? ''))

            if (!vendor_id || isNaN(vendor_id)) {
                res.status(400).json({
                    Status: false,
                    ResultOnDb: {},
                    TotalCountOnDb: 0,
                    MethodOnDb: 'Update Vendor',
                    Message: 'Invalid vendor ID'
                } as ResponseI)
                return
            }

            const updateData = {
                vendor_id,
                ...dataItem
            }

            const result = await FindVendorModel.updateVendor(updateData)
            res.status(200).json(result as ResponseI)
        } catch (error: any) {
            // console.error('Update Vendor Error:', error);
            res.status(200).json({
                Status: false,
                ResultOnDb: {},
                TotalCountOnDb: 0,
                MethodOnDb: 'Update Vendor',
                Message: error?.message || 'Failed to update vendor'
            } as ResponseI)
        }
    },

    updateComprehensive: async (req: Request, res: Response) => {
        const dataItem = !req.body || Object.entries(req.body).length === 0 ? req.query : req.body

        try {
            const vendor_id = parseInt(String(dataItem.VENDORS_ID ?? dataItem.vendor_id ?? ''))

            if (!vendor_id || isNaN(vendor_id)) {
                res.status(400).json({
                    Status: false,
                    ResultOnDb: {},
                    TotalCountOnDb: 0,
                    MethodOnDb: 'Update Vendor Comprehensive',
                    Message: 'Invalid vendor ID'
                } as ResponseI)
                return
            }

            const result = await FindVendorModel.updateVendorComprehensive({
                ...dataItem,
                VENDORS_ID: vendor_id,
            })

            res.status(200).json(result as ResponseI)
            return
        } catch (error: any) {
            // console.error('Update Vendor Comprehensive Error:', error)
            res.status(200).json({
                Status: false,
                ResultOnDb: {},
                TotalCountOnDb: 0,
                MethodOnDb: 'Update Vendor Comprehensive',
                Message: error?.message || 'Failed to update vendor'
            } as ResponseI)
            return
        }
    },

    deleteVendor: async (req: Request, res: Response) => {
        const dataItem = !req.body || Object.entries(req.body).length === 0 ? req.query : req.body

        try {
            const vendor_id = parseInt(String(dataItem.VENDORS_ID ?? dataItem.vendor_id ?? ''))

            if (!vendor_id || isNaN(vendor_id)) {
                res.status(400).json({
                    Status: false,
                    ResultOnDb: {},
                    TotalCountOnDb: 0,
                    MethodOnDb: 'Delete Vendor',
                    Message: 'Invalid vendor ID'
                } as ResponseI)
                return
            }

            const result = await FindVendorModel.deleteVendor({
                VENDORS_ID: vendor_id,
                UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
            })

            res.status(200).json(result as ResponseI)
            return
        } catch (error: any) {
            // console.error('Delete Vendor Error:', error)
            res.status(200).json({
                Status: false,
                ResultOnDb: {},
                TotalCountOnDb: 0,
                MethodOnDb: 'Delete Vendor',
                Message: error?.message || 'Failed to delete vendor'
            } as ResponseI)
            return
        }
    },

    // Delete vendor contact
    deleteVendorContact: async (req: Request, res: Response) => {
        let dataItem
        if (!req.body || Object.entries(req.body).length === 0) {
            dataItem = req.query
        } else {
            dataItem = req.body
        }

        try {
            const result = await FindVendorModel.deleteVendorContact(dataItem)
            res.status(200).json(result as ResponseI)
        } catch (error: any) {
            // console.error('Delete Vendor Contact Error:', error);
            res.status(200).json({
                Status: false,
                ResultOnDb: false,
                TotalCountOnDb: 0,
                MethodOnDb: 'Delete Vendor Contact',
                Message: error?.message || 'Failed to delete contact'
            } as ResponseI)
        }
    },

    // Delete vendor product
    deleteVendorProduct: async (req: Request, res: Response) => {
        let dataItem
        if (!req.body || Object.entries(req.body).length === 0) {
            dataItem = req.query
        } else {
            dataItem = req.body
        }

        try {
            const result = await FindVendorModel.deleteVendorProduct(dataItem)
            res.status(200).json(result as ResponseI)
        } catch (error: any) {
            // console.error('Delete Vendor Product Error:', error);
            res.status(200).json({
                Status: false,
                ResultOnDb: false,
                TotalCountOnDb: 0,
                MethodOnDb: 'Delete Vendor Product',
                Message: error?.message || 'Failed to delete product'
            } as ResponseI)
        }
    },

    // Get vendor business category names for dropdown
    getVendorBusinessCategoryName: async (_req: Request, res: Response) => {
        try {
            const result = await FindVendorModel.getVendorBusinessCategoryName()
            res.status(200).json({
                Status: true,
                ResultOnDb: result,
                TotalCountOnDb: result.length,
                MethodOnDb: 'Get Vendor Business Category Name',
                Message: 'Get Data Success'
            } as ResponseI)
        } catch (error: any) {
            // console.error('Get Vendor Business Category Name Error:', error);
            res.status(200).json({
                Status: false,
                ResultOnDb: [],
                TotalCountOnDb: 0,
                MethodOnDb: 'Get Vendor Business Category Name',
                Message: error?.message || 'Failed to get vendor business category names'
            } as ResponseI)
        }
    },

    // Get provinces for dropdown
    getProvinces: async (_req: Request, res: Response) => {
        try {
            const result = await FindVendorModel.getProvinces()
            res.status(200).json({
                Status: true,
                ResultOnDb: result,
                TotalCountOnDb: result.length,
                MethodOnDb: 'Get Provinces',
                Message: 'Get Data Success'
            } as ResponseI)
        } catch (error: any) {
            // console.error('Get Provinces Error:', error);
            res.status(200).json({
                Status: false,
                ResultOnDb: [],
                TotalCountOnDb: 0,
                MethodOnDb: 'Get Provinces',
                Message: error?.message || 'Failed to get provinces'
            } as ResponseI)
        }
    },
    // Get countries for dropdown
    getCountries: async (_req: Request, res: Response) => {
        try {
            const result = await FindVendorModel.getCountries()
            res.status(200).json({
                Status: true,
                ResultOnDb: result,
                TotalCountOnDb: result.length,
                MethodOnDb: 'Get Countries',
                Message: 'Get Data Success'
            } as ResponseI)
        } catch (error: any) {
            res.status(200).json({
                Status: false,
                ResultOnDb: [],
                TotalCountOnDb: 0,
                MethodOnDb: 'Get Countries',
                Message: error?.message || 'Failed to get countries'
            } as ResponseI)
        }
    },


    // Get product groups for dropdown
    getProductGroups: async (_req: Request, res: Response) => {
        try {
            const result = await FindVendorModel.getProductGroups()
            res.status(200).json({
                Status: true,
                ResultOnDb: result,
                TotalCountOnDb: result.length,
                MethodOnDb: 'Get Product Groups',
                Message: 'Get Data Success'
            } as ResponseI)
        } catch (error: any) {
            // console.error('Get Product Groups Error:', error);
            res.status(200).json({
                Status: false,
                ResultOnDb: [],
                TotalCountOnDb: 0,
                MethodOnDb: 'Get Product Groups',
                Message: error?.message || 'Failed to get product groups'
            } as ResponseI)
        }
    },

    // Export vendors to Excel (Buffer / Template Approach)
    downloadFileForExport: async (req: Request, res: Response) => {
        try {
            let dataItem
            if (Object.entries(req.body).length === 0) {
                dataItem = req.query.data ? JSON.parse(req.query.data as any) : req.query
            } else {
                dataItem = req.body
            }

            const query = dataItem.DATAFORFETCH || dataItem || {}

            // Table mapping
            const tableIds = [
                { table: 'v', id: 'COMPANY_NAME', Fns: 'LIKE' },
                { table: 'v', id: 'FFT_VENDOR_CODE', Fns: 'LIKE' },
                { table: 'v', id: 'FFT_STATUS', Fns: '=' },
                { table: 'v', id: 'INUSE', Fns: '=' },
                { table: 'v', id: 'PROVINCE', Fns: 'LIKE' },
                { table: 'v', id: 'COUNTRY', Fns: 'LIKE' },
                { table: 'v', id: 'VENDOR_REGION', Fns: '=' },
                { table: 'v', id: 'WEBSITE', Fns: 'LIKE' },
                { table: 'v', id: 'ADDRESS', Fns: 'LIKE' },
                { table: 'v', id: 'TEL_CENTER', Fns: 'LIKE' },
                { table: 'v', id: 'EMAILMAIN', Fns: 'LIKE' },
                { table: 'v', id: 'MASTER_VENDOR_TYPES_ID', column: 'BUSINESS_CATEGORY_ID', Fns: '=' },
                { table: 'vt', id: 'VENDOR_TYPE_NAME', alias: 'BUSINESS_CATEGORY_NAME', Fns: 'LIKE' },
                { table: 'mpg', id: 'GROUP_NAME', Fns: 'LIKE' },
                { table: 'vp', id: 'MASTER_PRODUCT_GROUPS_ID', Fns: '=' },
                { table: 'vp', id: 'MAKER_NAME', Fns: 'LIKE' },
                { table: 'vp', id: 'PRODUCT_NAME', Fns: 'LIKE' },
                { table: 'vp', id: 'MODEL_LIST', Fns: 'LIKE' },
                { table: 'vc', id: 'CONTACT_NAME', Fns: 'LIKE' },
                { table: 'vc', id: 'TEL_PHONE', Fns: 'LIKE' },
                { table: 'vc', id: 'EMAIL', Fns: 'LIKE' },
                { table: 'vc', id: 'CREATE_BY', Fns: 'LIKE' },
                { table: 'vc', id: 'UPDATE_BY', Fns: 'LIKE' },
                { table: 'vc', id: 'CREATE_DATE', Fns: '=' },
                { table: 'vc', id: 'UPDATE_DATE', Fns: '=' },
            ]

            if (query.SEARCHFILTERS && Array.isArray(query.SEARCHFILTERS)) {
                query.SEARCHFILTERS = query.SEARCHFILTERS.filter((item: any) =>
                    item.value !== null && item.value !== undefined && item.value !== ''
                )
            }

            const statusFilter = query.SEARCHFILTERS?.find(
                (item: any) => String(item?.id || '').trim().toUpperCase() === 'M_VENDOR_STATUS_ID'
            )
            const requiredStatusId = statusFilter ? toVendorStatusId(statusFilter.value) : null
            if (statusFilter && requiredStatusId === null) {
                throw new Error('Invalid vendor status ID')
            }
            if (statusFilter) {
                query.SEARCHFILTERS = query.SEARCHFILTERS.filter((item: any) => item !== statusFilter)
            }

            // Intercept Order for SQL fallback
            let statusSort: any = null
            if (query.ORDER && Array.isArray(query.ORDER)) {
                statusSort = query.ORDER.find((o: any) =>
                    ['VENDOR_STATUS_CODE', 'VENDOR_STATUS_LABEL'].includes(String(o.id || '').toUpperCase())
                )
                if (statusSort) {
                    query.ORDER = [{ id: 'COMPANY_NAME', desc: false }]
                }
            }

            // Generate SQL Where
            getSqlWhere_elysia(query, tableIds, 'COMPANY_NAME')

            let sqlWhere = ''
            if (query.SQLWHERE) {
                sqlWhere = query.SQLWHERE.replace(/^WHERE\s+/i, '')
                if (sqlWhere) {
                    sqlWhere = ` AND ${sqlWhere}`
                }
            }

            // 1. Fetch Data
            const searchQuery = { ...query, SQLWHERECOLUMNFILTER: '', ORDER: query.ORDER || 'v.COMPANY_NAME ASC' }
            let vendorRows: any[] = []

            const vendorIds = query.VENDOR_IDS || []
            if (Array.isArray(vendorIds) && vendorIds.length > 0) {
                // CASE A: Export Specific IDs (Current Page from Client-Side)
                // We fetch these specific IDs.
                // We must modify sqlWhere to filter by these IDs.
                const ids = vendorIds.join(',')
                const idsSqlWhere = ` AND v.VENDORS_ID IN (${ids})`
                // We use searchAllForExport but with specific IDs override
                // We ignore Order from SQL, because we will sort by ID order in JS
                searchQuery.SQLWHERE = idsSqlWhere
                vendorRows = await FindVendorModel.searchAllForExport(searchQuery) as any[]

                // Re-sort in Memory to match input ID order
                const idMap = new Map()
                if (Array.isArray(vendorIds)) {
                    vendorIds.forEach((id: number, index: number) => idMap.set(id, index))
                }

                vendorRows.sort((a: any, b: any) => {
                    const idxA = idMap.has(a?.VENDORS_ID) ? idMap.get(a.VENDORS_ID) : 999999
                    const idxB = idMap.has(b?.VENDORS_ID) ? idMap.get(b.VENDORS_ID) : 999999
                    return (Number(idxA) || 0) - (Number(idxB) || 0)
                })

            } else if (dataItem.TYPE === 'currentPage') {
                // CASE B: Fallback Current Page (if no vendor_ids sent)
                // START from the AG Grid pages is already a row offset — do not multiply by LIMIT
                // (getSqlWhere_elysia above has also already applied its own START scaling).
                searchQuery['OFFSET'] = Number(searchQuery['START'] || 0)
                searchQuery.SQLWHERE = sqlWhere
                const { resultData } = await FindVendorModel.searchVendors(searchQuery)
                vendorRows = resultData
            } else {
                // CASE C: All Pages
                searchQuery.SQLWHERE = sqlWhere
                vendorRows = await FindVendorModel.searchAllForExport(searchQuery) as any[]
            }

            // 2. Apply the computed vendor-status filter for export paths that do
            // not pass through the normal search controller.
            let resultData = requiredStatusId !== null
                ? vendorRows.filter((row: any) => Number(row.M_VENDOR_STATUS_ID) === requiredStatusId)
                : vendorRows

            // 2.1 Post-fetch sorting for the computed Vendor Status column.
            if (statusSort) {
                const desc = statusSort.desc
                resultData.sort((a: any, b: any) => {
                    const valA = a.VENDOR_STATUS_LABEL || ''
                    const valB = b.VENDOR_STATUS_LABEL || ''
                    if (valA < valB) return desc ? 1 : -1
                    if (valA > valB) return desc ? -1 : 1
                    return 0
                })
            }

            // 3. Create Workbook & Worksheet (Memory Approach - like ClearTimeExport)
            // Note: If you have a template file, use workbook.xlsx.readFile('path/to/template.xlsx')
            const workbook = new excel.Workbook()
            const worksheet = workbook.addWorksheet('Vendor List')

            // 4. Setup Headers
            // The grid sends its own visible columns (id + header, in display order) so the sheet
            // mirrors exactly what the user sees. Fall back to the full column set when it doesn't.
            const defaultHeaderMap: Record<string, string> = {
                FFT_VENDOR_CODE: 'Vendor Code',
                VENDOR_STATUS_LABEL: 'Vendor Status',
                COMPANY_NAME: 'Company Name',
                VENDOR_TYPE_NAME: 'Vendor Type',
                VENDOR_REGION: 'Trade Term',
                PROVINCE: 'Province',
                WEBSITE: 'Website',
                ADDRESS: 'Address',
                TEL_CENTER: 'Tel Company',
                EMAILMAIN: 'Email (Main)',
                GROUP_NAME: 'Group Name',
                MAKER_NAME: 'Maker Name',
                PRODUCT_NAME: 'Product Name',
                MODEL_LIST: 'Model List',
                CONTACT_NAME: 'Contact Name',
                TEL_PHONE: 'Tel Contact',
                EMAIL: 'Email Contact',
                CREATE_BY: 'Created By',
                UPDATE_BY: 'Updated By',
                CREATE_DATE: 'Created Date',
                UPDATE_DATE: 'Updated Date'
            }

            type ExportColumn = { id: string; header: string; empty: string; width: number }

            const requestedColumns: ExportColumn[] = (Array.isArray(query.COLUMNS) ? query.COLUMNS : [])
                .map((col: any) => ({
                    id: String(col?.id || '').trim(),
                    header: String(col?.header || defaultHeaderMap[String(col?.id || '')] || col?.id || ''),
                    // Placeholder the grid's valueFormatter renders for a blank cell (e.g. '-').
                    empty: String(col?.empty ?? ''),
                    width: Number(col?.width) > 0 ? Math.round(Number(col.width) / 7) : 20,
                }))
                .filter((col: ExportColumn) => Boolean(col.id))

            const visibleColumns: ExportColumn[] = requestedColumns.length > 0
                ? requestedColumns
                : Object.entries(defaultHeaderMap).map(([id, header]) => ({ id, header, empty: '', width: 20 }))

            // Set Title Row
            worksheet.getCell('A1').value = 'Export : Vendor List'
            worksheet.getCell('A1').font = { name: 'Aptos Display', size: 18, bold: true }

            // Set Header Row (Row 2)
            visibleColumns.forEach((col, idx) => {
                const cell = worksheet.getCell(2, idx + 1)
                cell.value = col.header
                cell.font = { name: 'Aptos Display', bold: true }
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBCD8F1' } }
                cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
                cell.alignment = { vertical: 'middle', horizontal: 'center' }
                worksheet.getColumn(idx + 1).width = col.width
            })

            // 5. Populate Data (Row 3+)
            resultData.forEach((row: any, rIdx: number) => {
                const rowIndex = 3 + rIdx

                visibleColumns.forEach((col, cIdx) => {
                    let cellValue = row[col.id]

                    // Date Fmt
                    if ((col.id === 'CREATE_DATE' || col.id === 'UPDATE_DATE') && cellValue) {
                        const date = new Date(cellValue)
                        cellValue = date.toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit' })
                    }
                    if (col.id === 'MODEL_LIST' && cellValue) cellValue = cellValue.replace(/\n/g, ', ')

                    const finalValue = cellValue !== undefined && cellValue !== null && cellValue !== ''
                        ? cellValue.toString()
                        : col.empty

                    const cell = worksheet.getCell(rowIndex, cIdx + 1)
                    cell.value = finalValue
                    cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
                    cell.font = { name: 'Aptos Display', size: 11 }
                    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
                })
            })

            // 6. Send Response logic (similar to ClearTime sendFile)
            const date = new Date()
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            const hours = String(date.getHours()).padStart(2, '0')
            const minutes = String(date.getMinutes()).padStart(2, '0')
            const seconds = String(date.getSeconds()).padStart(2, '0')
            const filename = `Vendor_List_${year}${month}${day}_${hours}${minutes}${seconds}.xlsx`

            const buffer = await workbook.xlsx.writeBuffer()

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
            res.setHeader('Content-Length', (buffer as any).length)

            res.end(buffer)

        } catch (error: any) {
            // console.error('downloadFileForExport error:', error)
            if (!res.headersSent) {
                res.status(500).json({ error: 'Export failed', message: error?.message })
            }
        }
    },

    // Get all vendor names
    getAllVendorNames: async (req: Request, res: Response) => {
        try {
            const resultData = await FindVendorModel.getAllVendorNames()
            res.status(200).json({
                Status: true,
                ResultOnDb: resultData,
                TotalCountOnDb: resultData.length,
                MethodOnDb: 'Get All Vendor Names',
                Message: 'Get Data Success'
            } as ResponseI)
        } catch (error: any) {
            // console.error('Get All Vendor Names Error:', error)
            res.status(200).json({
                Status: false,
                ResultOnDb: [],
                TotalCountOnDb: 0,
                MethodOnDb: 'Get All Vendor Names',
                Message: error?.message || 'Failed to get all vendor names'
            } as ResponseI)
        }
    },
    getPronesRawTest: async (req: Request, res: Response) => {
        try {
            let dataItem

            if (!req.body || Object.entries(req.body).length === 0) {
                dataItem = req.query
            } else {
                dataItem = req.body
            }

            const resultData = await FindVendorModel.getPronesRawTest(dataItem)
            res.status(200).json({
                Status: true,
                ResultOnDb: resultData,
                TotalCountOnDb: resultData.length,
                MethodOnDb: 'Get Prones Raw Test',
                Message: 'Get Prones Raw Test Success'
            } as ResponseI)
        } catch (error: any) {
            // console.error('Get Prones Raw Test Error:', error)
            res.status(200).json({
                Status: false,
                ResultOnDb: [],
                TotalCountOnDb: 0,
                MethodOnDb: 'Get Prones Raw Test',
                Message: error?.message || 'Failed to get raw prones data'
            } as ResponseI)
        }
    }
}
