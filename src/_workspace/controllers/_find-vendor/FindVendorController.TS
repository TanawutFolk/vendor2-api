import { FindVendorModel } from '@src/_workspace/models/_find-vendor/FindVendorModel'
import { getSqlWhereByColumnFilters_elysia } from '@src/helpers/getSqlWhereByFilterColumn'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'
const xl = require('excel4node')

// Helper function to get value from SearchFilters array
const getFilterValue = (searchFilters: any[], id: string) => {
    return searchFilters?.find((f: any) => f.id === id)?.value ?? ''
}

export const FindVendorController = {
    // Search vendors
    search: async (req: Request, res: Response) => {
        let dataItem

        if (!req.body || Object.entries(req.body).length === 0) {
            dataItem = req.query
        } else {
            dataItem = req.body
        }

        // Table mapping for ColumnFilters
        const tableIds = [
            { table: 'v', id: 'company_name' },
            { table: 'v', id: 'fft_vendor_code' },
            { table: 'v', id: 'fft_status' },
            { table: 'v', id: 'province' },
            { table: 'v', id: 'website' },
            { table: 'v', id: 'address' },
            { table: 'v', id: 'tel_center' },
            { table: 'vt', id: 'vendor_type_name', alias: 'name' },
            { table: 'mpg', id: 'group_name' },
            { table: 'vp', id: 'maker_name' },
            { table: 'vp', id: 'product_name' },
            { table: 'vp', id: 'model_list' },
            { table: 'vc', id: 'seller_name' },
            { table: 'vc', id: 'tel_phone' },
            { table: 'vc', id: 'email' },
            { table: 'vc', id: 'CREATE_BY' },
            { table: 'vc', id: 'UPDATE_BY' },
            { table: 'vc', id: 'CREATE_DATE' },
            { table: 'vc', id: 'UPDATE_DATE' },
        ]

        // 1. แปลง Start สำหรับ pagination (Start * Limit = Offset)
        dataItem['Offset'] = Number(dataItem['Start'] || 0) * Number(dataItem['Limit'] || 20)

        // 2. แปลง Order array เป็น SQL string
        let orderBy = ''
        if (!dataItem['Order'] || dataItem['Order'].length <= 0) {
            orderBy = 'v.company_name ASC'
        } else {
            for (let i = 0; i < dataItem['Order'].length; i++) {
                const word = dataItem['Order'][i]
                orderBy += word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
            }
            orderBy = orderBy.slice(0, -1) // ตัด comma ตัวสุดท้าย
        }
        dataItem['Order'] = orderBy

        // 3. แปลง ColumnFilters เป็น SQL WHERE
        let sqlWhereColumnFilter = ''
        if (dataItem?.ColumnFilters?.length > 0) {
            sqlWhereColumnFilter = getSqlWhereByColumnFilters_elysia(dataItem.ColumnFilters, tableIds)
        }
        dataItem['sqlWhereColumnFilter'] = sqlWhereColumnFilter

        // 4. สร้าง sqlWhere จาก SearchFilters
        const searchFilters = dataItem.SearchFilters || []
        const companyName = getFilterValue(searchFilters, 'company_name')
        const province = getFilterValue(searchFilters, 'province')
        const vendorTypeId = getFilterValue(searchFilters, 'vendor_type_id')
        const status = getFilterValue(searchFilters, 'status')
        const groupName = getFilterValue(searchFilters, 'group_name')
        const productName = getFilterValue(searchFilters, 'product_name')
        const makerName = getFilterValue(searchFilters, 'maker_name')
        const modelList = getFilterValue(searchFilters, 'model_list')

        let sqlWhere = ''
        if (companyName) sqlWhere += ` AND v.company_name LIKE '%${companyName}%'`
        if (province) sqlWhere += ` AND v.province LIKE '%${province}%'`
        if (vendorTypeId && vendorTypeId !== '' && vendorTypeId !== -1) {
            sqlWhere += ` AND v.vendor_type_id = ${vendorTypeId}`
        }
        if (status) sqlWhere += ` AND v.fft_status = '${status}'`
        if (groupName) sqlWhere += ` AND vp.product_group_id = ${groupName}`
        if (productName) sqlWhere += ` AND vp.product_name LIKE '%${productName}%'`
        if (makerName) sqlWhere += ` AND vp.maker_name LIKE '%${makerName}%'`
        if (modelList) sqlWhere += ` AND vp.model_list LIKE '%${modelList}%'`

        dataItem['sqlWhere'] = sqlWhere

        console.log('dataItem:', dataItem)

        try {
            const result = await FindVendorModel.searchVendors(dataItem, sqlWhere)
            return res.status(200).json(result as ResponseI)
        } catch (error: any) {
            return res.status(500).json({
                Status: false,
                ResultOnDb: [],
                TotalCountOnDb: 0,
                MethodOnDb: 'Search Vendors Failed',
                Message: error?.message || 'Failed to search vendors'
            } as ResponseI)
        }
    },

    // Get vendor by ID
    getById: async (req: Request, res: Response) => {
        let dataItem

        if (!req.body || Object.entries(req.body).length === 0) {
            dataItem = req.query
        } else {
            dataItem = req.body
        }

        try {
            const vendor_id = parseInt(dataItem.vendor_id as string)

            if (!vendor_id || isNaN(vendor_id)) {
                return res.status(400).json({
                    Status: false,
                    ResultOnDb: {},
                    TotalCountOnDb: 0,
                    MethodOnDb: 'Get Vendor By ID',
                    Message: 'Invalid vendor ID'
                } as ResponseI)
            }

            const result = await FindVendorModel.getById(vendor_id)
            return res.status(200).json(result as ResponseI)
        } catch (error: any) {
            return res.status(500).json({
                Status: false,
                ResultOnDb: {},
                TotalCountOnDb: 0,
                MethodOnDb: 'Get Vendor By ID Failed',
                Message: error?.message || 'Failed to get vendor'
            } as ResponseI)
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
            const vendor_id = parseInt(dataItem.vendor_id as string)

            if (!vendor_id || isNaN(vendor_id)) {
                return res.status(400).json({
                    Status: false,
                    ResultOnDb: {},
                    TotalCountOnDb: 0,
                    MethodOnDb: 'Update Vendor',
                    Message: 'Invalid vendor ID'
                } as ResponseI)
            }

            const updateData = {
                vendor_id,
                ...dataItem
            }

            const result = await FindVendorModel.updateVendor(updateData)
            return res.status(200).json(result as ResponseI)
        } catch (error: any) {
            return res.status(500).json({
                Status: false,
                ResultOnDb: {},
                TotalCountOnDb: 0,
                MethodOnDb: 'Update Vendor Failed',
                Message: error?.message || 'Failed to update vendor'
            } as ResponseI)
        }
    },

    // Get vendor types for dropdown
    getVendorTypes: async (req: Request, res: Response) => {
        try {
            const result = await FindVendorModel.getVendorTypes()
            return res.status(200).json(result as ResponseI)
        } catch (error: any) {
            return res.status(500).json({
                Status: false,
                ResultOnDb: [],
                TotalCountOnDb: 0,
                MethodOnDb: 'Get Vendor Types Failed',
                Message: error?.message || 'Failed to get vendor types'
            } as ResponseI)
        }
    },

    // Get provinces for dropdown
    getProvinces: async (req: Request, res: Response) => {
        try {
            const result = await FindVendorModel.getProvinces()
            return res.status(200).json(result as ResponseI)
        } catch (error: any) {
            return res.status(500).json({
                Status: false,
                ResultOnDb: [],
                TotalCountOnDb: 0,
                MethodOnDb: 'Get Provinces Failed',
                Message: error?.message || 'Failed to get provinces'
            } as ResponseI)
        }
    },

    // Get product groups for dropdown
    getProductGroups: async (req: Request, res: Response) => {
        try {
            const result = await FindVendorModel.getProductGroups()
            return res.status(200).json(result as ResponseI)
        } catch (error: any) {
            return res.status(500).json({
                Status: false,
                ResultOnDb: [],
                TotalCountOnDb: 0,
                MethodOnDb: 'Get Product Groups Failed',
                Message: error?.message || 'Failed to get product groups'
            } as ResponseI)
        }
    },

    // Export vendors to Excel
    downloadFileForExport: async (req: Request, res: Response) => {
        try {
            let dataItem = Object.entries(req.body).length === 0 ? req.query : req.body
            const query = dataItem.DataForFetch || {}
            const exportType = dataItem.TYPE || 'AllPage' // 'currentPage' or 'AllPage'

            // Build search where clause from SearchFilters
            const searchFilters = query.SearchFilters || []
            const companyName = getFilterValue(searchFilters, 'company_name')
            const province = getFilterValue(searchFilters, 'province')
            const vendorTypeId = getFilterValue(searchFilters, 'vendor_type_id')
            const status = getFilterValue(searchFilters, 'status')
            const groupName = getFilterValue(searchFilters, 'group_name')
            const productName = getFilterValue(searchFilters, 'product_name')
            const makerName = getFilterValue(searchFilters, 'maker_name')
            const modelList = getFilterValue(searchFilters, 'model_list')

            let sqlWhere = ''
            if (companyName) sqlWhere += ` AND v.company_name LIKE '%${companyName}%'`
            if (province) sqlWhere += ` AND v.province LIKE '%${province}%'`
            if (vendorTypeId && vendorTypeId !== '' && vendorTypeId !== -1) {
                sqlWhere += ` AND v.vendor_type_id = ${vendorTypeId}`
            }
            if (status) sqlWhere += ` AND v.fft_status = '${status}'`
            if (groupName) sqlWhere += ` AND vp.product_group_id = ${groupName}`
            if (productName) sqlWhere += ` AND vp.product_name LIKE '%${productName}%'`
            if (makerName) sqlWhere += ` AND vp.maker_name LIKE '%${makerName}%'`
            if (modelList) sqlWhere += ` AND vp.model_list LIKE '%${modelList}%'`

            // Set order
            let orderBy = 'v.company_name ASC'
            if (query.Order && query.Order.length > 0) {
                orderBy = query.Order.map((o: any) => `${o.id} ${o.desc ? 'DESC' : 'ASC'}`).join(', ')
            }

            let data: any[] = []

            if (exportType === 'currentPage') {
                // Export current page only - use pagination
                const limit = query.Limit || 20
                const start = query.Start || 0
                const offset = start * limit

                const searchQuery = {
                    ...query,
                    Order: orderBy,
                    Limit: limit,
                    Offset: offset,
                    sqlWhereColumnFilter: ''
                }

                // Use the search function which has pagination
                const result = await FindVendorModel.searchVendors(searchQuery, sqlWhere)
                data = result.ResultOnDb || []
            } else {
                // Export all data - no pagination
                const searchQuery = {
                    ...query,
                    Order: orderBy,
                    sqlWhereColumnFilter: ''
                }

                data = await FindVendorModel.searchAllForExport(searchQuery, sqlWhere)
            }

            if (!data || data.length === 0) {
                return res.status(400).json({ error: 'No data to export.' })
            }

            // Header mapping
            const headerMap: Record<string, string> = {
                fft_vendor_code: 'Vendor Code',
                fft_status: 'Prones Status',
                company_name: 'Company Name',
                vendor_type_name: 'Vendor Type',
                province: 'Province',
                website: 'Website',
                address: 'Address',
                tel_center: 'Tel Company',
                group_name: 'Group Name',
                maker_name: 'Maker Name',
                product_name: 'Product Name',
                model_list: 'Model List',
                seller_name: 'Contact Name',
                tel_phone: 'Tel Contact',
                email: 'Email Contact',
                CREATE_BY: 'Created By',
                UPDATE_BY: 'Updated By',
                CREATE_DATE: 'Created Date',
                UPDATE_DATE: 'Updated Date'
            }

            // Columns to export
            const visibleColumns = Object.keys(headerMap)

            // Create workbook
            const wb = new xl.Workbook()
            const ws = wb.addWorksheet('Vendor List')

            // Header style
            const headerStyle = wb.createStyle({
                font: { name: 'Aptos', size: 11, bold: true },
                alignment: { horizontal: 'center', vertical: 'center', wrapText: false },
                border: {
                    left: { style: 'thin' },
                    right: { style: 'thin' },
                    top: { style: 'thin' },
                    bottom: { style: 'thin' },
                },
                fill: {
                    type: 'pattern',
                    patternType: 'solid',
                    fgColor: '#D9D9D9',
                },
            })

            // Body style
            const bodyStyle = wb.createStyle({
                font: { name: 'Arial', size: 11 },
                alignment: { horizontal: 'left', vertical: 'center', wrapText: false },
            })

            // Add headers
            visibleColumns.forEach((col, colIndex) => {
                const headerText = headerMap[col] || col
                ws.cell(1, colIndex + 1).string(headerText).style(headerStyle)
            })
            ws.row(1).setHeight(25)

            // Track max column widths
            const maxColWidths: number[] = visibleColumns.map((col) => (headerMap[col] || col).length)

            // Add data rows
            data.forEach((row: any, rowIndex: number) => {
                visibleColumns.forEach((col, colIndex) => {
                    let cellValue = row[col]

                    // Format date fields
                    if ((col === 'CREATE_DATE' || col === 'UPDATE_DATE') && cellValue) {
                        const date = new Date(cellValue)
                        cellValue = date.toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        })
                    }

                    // Format model_list (replace newlines with commas)
                    if (col === 'model_list' && cellValue) {
                        cellValue = cellValue.replace(/\n/g, ', ')
                    }

                    const finalValue = cellValue !== undefined && cellValue !== null ? cellValue.toString() : ''
                    ws.cell(rowIndex + 2, colIndex + 1).string(finalValue).style(bodyStyle)
                    maxColWidths[colIndex] = Math.max(maxColWidths[colIndex], finalValue.length)
                })
            })

            // Set column widths
            maxColWidths.forEach((width, index) => {
                const finalWidth = Math.min(Math.ceil(width * 1.4), 50)
                ws.column(index + 1).setWidth(finalWidth)
            })

            // Generate filename with timestamp
            const now = new Date()
            const pad = (n: number) => n.toString().padStart(2, '0')
            const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
            const filename = `Vendor_List_${timestamp}.xlsx`

            // Send file
            wb.writeToBuffer()
                .then((buffer: any) => {
                    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
                    res.setHeader('Content-Disposition', `attachment; filename=${filename}`)
                    res.send(buffer)
                })
                .catch((err: any) => {
                    res.status(500).json({ error: 'Failed to generate file', err })
                })

        } catch (error: any) {
            console.error('downloadFileForExport error:', error)
            return res.status(500).json({ error: 'Export failed', message: error?.message })
        }
    }
}
