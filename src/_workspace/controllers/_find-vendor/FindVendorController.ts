import { FindVendorModel } from '@src/_workspace/models/_find-vendor/FindVendorModel'
import { getSqlWhereByColumnFilters_elysia } from '@src/helpers/getSqlWhereByFilterColumn'
import getSqlWhere_aggrid from '@src/helpers/getSqlWhere_aggrid'
import getSqlWhere_elysia from '@src/helpers/getSqlWhere_elysia'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'
import excel from 'exceljs'

export const FindVendorController = {
    // Search vendors
    search: async (req: Request, res: Response) => {
        let dataItem

        if (!req.body || Object.entries(req.body).length === 0) {
            dataItem = req.query
        } else {
            dataItem = req.body
        }

        // Intercept Order for SQL fallback (Removed: status_check is now natively supported in SQL)

        // Translate 'status' frontend filter ID to backend filter logic
        if (dataItem.SEARCHFILTERS && Array.isArray(dataItem.SEARCHFILTERS)) {
            const statusIdx = dataItem.SEARCHFILTERS.findIndex((item: any) => item.id === 'status')
            if (statusIdx > -1) {
                const val = dataItem.SEARCHFILTERS[statusIdx].value
                if (val === '1' || val === 1) {
                    dataItem.PRONESSTATUSFILTER = 'Registered'
                    dataItem.SEARCHFILTERS.splice(statusIdx, 1)
                } else if (val === '0' || val === 0) {
                    dataItem.PRONESSTATUSFILTER = 'Not Registered'
                    dataItem.SEARCHFILTERS.splice(statusIdx, 1)
                } else if (val === 'In Progress') {
                    dataItem.PRONESSTATUSFILTER = 'In Progress'
                    dataItem.SEARCHFILTERS.splice(statusIdx, 1)
                } else if (val === 'Cannot Register') {
                    dataItem.PRONESSTATUSFILTER = 'Cannot Register'
                    dataItem.SEARCHFILTERS.splice(statusIdx, 1)
                } else {
                    dataItem.SEARCHFILTERS.splice(statusIdx, 1)
                }
            }
        }

        // Table mapping for ColumnFilters and SearchFilters
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
            { table: 'vmr', id: 'PRONES_CODE', Fns: 'LIKE' },
        ]

        // Filter out null/empty values from SearchFilters before passing to helper
        if (dataItem.SEARCHFILTERS && Array.isArray(dataItem.SEARCHFILTERS)) {
            dataItem.SEARCHFILTERS = dataItem.SEARCHFILTERS.filter((item: any) =>
                item.value !== null && item.value !== undefined && item.value !== ''
            )
        }

        // Create SQL WHERE, ORDER BY, and Offset using AG Grid-compatible helper
        // (uses Start directly as row offset â€” no Start * Limit multiplication)
        getSqlWhere_aggrid(dataItem, tableIds, 'COMPANY_NAME')

        // Extract sqlWhere from dataItem (it now contains both SearchFilters and ColumnFilters)
        let sqlWhere = ''
        if (dataItem.SQLWHERE) {
            sqlWhere = dataItem.SQLWHERE.trim()
            sqlWhere = sqlWhere.replace(/^WHERE\s+/i, '')
            if (sqlWhere) {
                sqlWhere = ` AND ${sqlWhere}`
            }
        }
        // for prones Status
        if (dataItem.PRONESSTATUSFILTER) {
            const statusValue = String(dataItem.PRONESSTATUSFILTER).replace(/'/g, "\\'")
            sqlWhere += `
                AND (
                    CASE
                        WHEN v.FFT_STATUS = 2 THEN 'Cannot Register'
                        WHEN EXISTS (
                            SELECT 1
                            FROM request_register_vendor rrv_ip
                            WHERE rrv_ip.VENDORS_ID = v.VENDORS_ID
                              AND rrv_ip.INUSE = 1
                              AND rrv_ip.REQUEST_STATE = 'in_progress'
                        ) THEN 'In Progress'
                        ELSE IFNULL(vmr.STATUS_CHECK, 'Not Registered')
                    END
                ) = '${statusValue}'
            `
        }

        dataItem['SQLWHERECOLUMNFILTER'] = '' // No longer needed as it's merged into sqlWhere
        dataItem.SQLWHERE = sqlWhere

        // console.log('dataItem:', dataItem)

        try {
            const { resultData, totalCount } = await FindVendorModel.searchVendors(dataItem)
            const finalResult = resultData.map((row: any) => {
                delete row.CONTACTS_JSON
                delete row.PRODUCTS_JSON
                return row
            })

            return res.status(200).json({
                Status: true,
                ResultOnDb: finalResult,
                TotalCountOnDb: totalCount,
                MethodOnDb: 'Search Vendors',
                Message: 'Search Data Success'
            } as ResponseI)
        } catch (error: any) {
            // console.error('Search Vendors Error:', error);
            return res.status(200).json({
                Status: false,
                ResultOnDb: [],
                TotalCountOnDb: 0,
                MethodOnDb: 'Search Vendors',
                Message: error?.message || 'Failed to search vendors'
            } as ResponseI)
        }
    },

    // Get full vendor details for Find Vendor/Re-register modals
    getVendorDetails: async (req: Request, res: Response) => {
        let dataItem

        if (!req.body || Object.entries(req.body).length === 0) {
            dataItem = req.query
        } else {
            dataItem = req.body
        }

        try {
            const vendor_id = parseInt(String(dataItem.VENDORS_ID ?? dataItem.vendor_id ?? ''))

            if (!vendor_id || isNaN(vendor_id)) {
                return res.status(400).json({
                    Status: false,
                    ResultOnDb: [],
                    TotalCountOnDb: 0,
                    MethodOnDb: 'Get Vendor Details',
                    Message: 'Invalid vendor ID'
                } as ResponseI)
            }

            const resultData = await FindVendorModel.getVendorDetails(vendor_id)
            if (resultData && resultData.length > 0) {
                // Parse JSON_ARRAYAGG strings if they exist
                const row = resultData[0]
                let contacts = []
                let products = []

                try {
                    if (row.CONTACTS_JSON) {
                        contacts = typeof row.CONTACTS_JSON === 'string' ? JSON.parse(row.CONTACTS_JSON) : row.CONTACTS_JSON
                    }
                } catch (e) {
                    // console.warn('Failed to parse contacts_json for getVendorDetails VENDORS_ID ' + vendor_id)
                }

                try {
                    if (row.PRODUCTS_JSON) {
                        products = typeof row.PRODUCTS_JSON === 'string' ? JSON.parse(row.PRODUCTS_JSON) : row.PRODUCTS_JSON
                    }
                } catch (e) {
                    // console.warn('Failed to parse products_json for getVendorDetails VENDORS_ID ' + vendor_id)
                }

                // Filter out [null] from empty JSON_ARRAYAGG
                if (contacts.length === 1 && contacts[0] === null) contacts = []
                if (products.length === 1 && products[0] === null) products = []

                delete row.CONTACTS_JSON
                delete row.PRODUCTS_JSON

                const vendorObj = { ...row, CONTACTS: contacts, PRODUCTS: products }

                // Enrich with Prones Status Logic (helper expects array)
                const enrichedData = await matchVendorsWithPrones([vendorObj], null)

                return res.status(200).json({
                    Status: true,
                    ResultOnDb: enrichedData[0],
                    TotalCountOnDb: 1,
                    MethodOnDb: 'Get Vendor Details',
                    Message: 'Get Data Success'
                } as ResponseI)
            } else {

                return res.status(200).json({
                    Status: false,
                    ResultOnDb: [],
                    TotalCountOnDb: 0,
                    MethodOnDb: 'Get Vendor Details',
                    Message: 'Vendor not found'
                } as ResponseI)
            }
        } catch (error: any) {
            // console.error('Get Vendor Details Error:', error);
            return res.status(200).json({
                Status: false,
                ResultOnDb: {},
                TotalCountOnDb: 0,
                MethodOnDb: 'Get Vendor Details',
                Message: error?.message || 'Failed to get vendor details'
            } as ResponseI)
        }
    },

    // Legacy alias kept for older callers.
    getById: async (req: Request, res: Response) => FindVendorController.getVendorDetails(req, res),

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
            res.status(200).json({
                Status: true,
                ResultOnDb: result,
                TotalCountOnDb: 1,
                MethodOnDb: 'Update Vendor',
                Message: 'Update Data Success'
            } as ResponseI)
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
                return res.status(400).json({
                    Status: false,
                    ResultOnDb: {},
                    TotalCountOnDb: 0,
                    MethodOnDb: 'Update Vendor Comprehensive',
                    Message: 'Invalid vendor ID'
                } as ResponseI)
            }

            const result = await FindVendorModel.updateVendorComprehensive({
                ...dataItem,
                VENDORS_ID: vendor_id,
            })

            return res.status(200).json(result as ResponseI)
        } catch (error: any) {
            // console.error('Update Vendor Comprehensive Error:', error)
            return res.status(200).json({
                Status: false,
                ResultOnDb: {},
                TotalCountOnDb: 0,
                MethodOnDb: 'Update Vendor Comprehensive',
                Message: error?.message || 'Failed to update vendor'
            } as ResponseI)
        }
    },

    deleteVendor: async (req: Request, res: Response) => {
        const dataItem = !req.body || Object.entries(req.body).length === 0 ? req.query : req.body

        try {
            const vendor_id = parseInt(String(dataItem.VENDORS_ID ?? dataItem.vendor_id ?? ''))

            if (!vendor_id || isNaN(vendor_id)) {
                return res.status(400).json({
                    Status: false,
                    ResultOnDb: {},
                    TotalCountOnDb: 0,
                    MethodOnDb: 'Delete Vendor',
                    Message: 'Invalid vendor ID'
                } as ResponseI)
            }

            const result = await FindVendorModel.deleteVendor({
                VENDORS_ID: vendor_id,
                UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
            })

            return res.status(200).json(result as ResponseI)
        } catch (error: any) {
            // console.error('Delete Vendor Error:', error)
            return res.status(200).json({
                Status: false,
                ResultOnDb: {},
                TotalCountOnDb: 0,
                MethodOnDb: 'Delete Vendor',
                Message: error?.message || 'Failed to delete vendor'
            } as ResponseI)
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
            await FindVendorModel.deleteVendorContact(dataItem)
            res.status(200).json({
                Status: true,
                ResultOnDb: true,
                TotalCountOnDb: 1,
                MethodOnDb: 'Delete Vendor Contact',
                Message: 'Delete Success'
            } as ResponseI)
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
            await FindVendorModel.deleteVendorProduct(dataItem)
            res.status(200).json({
                Status: true,
                ResultOnDb: true,
                TotalCountOnDb: 1,
                MethodOnDb: 'Delete Vendor Product',
                Message: 'Delete Success'
            } as ResponseI)
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
    getVendorBusinessCategoryName: async (req: Request, res: Response) => {
        let dataItem

        if (!req.body || Object.entries(req.body).length === 0) {
            dataItem = req.query
        } else {
            dataItem = req.body
        }

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
    getProvinces: async (req: Request, res: Response) => {
        let dataItem

        if (!req.body || Object.entries(req.body).length === 0) {
            dataItem = req.query
        } else {
            dataItem = req.body
        }

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
    getCountries: async (req: Request, res: Response) => {
        let dataItem

        if (!req.body || Object.entries(req.body).length === 0) {
            dataItem = req.query
        } else {
            dataItem = req.body
        }

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
    getProductGroups: async (req: Request, res: Response) => {
        let dataItem

        if (!req.body || Object.entries(req.body).length === 0) {
            dataItem = req.query
        } else {
            dataItem = req.body
        }

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

            const statusFilter = dataItem.DATAFORFETCH?.SEARCHFILTERS?.find((item: any) => item.id === 'status')
            const requiredStatus = statusFilter && statusFilter.value ? statusFilter.value.toString() : null

            // Intercept Order for SQL fallback
            let statusSort: any = null
            if (query.ORDER && Array.isArray(query.ORDER)) {
                statusSort = query.ORDER.find((o: any) => o.id === 'status_check' || o.id === 'STATUS_CHECK')
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
                searchQuery['OFFSET'] = Number(searchQuery['START'] || 0) * Number(searchQuery['LIMIT'] || 20)
                searchQuery.SQLWHERE = sqlWhere
                const { resultData } = await FindVendorModel.searchVendors(searchQuery)
                vendorRows = resultData
            } else {
                // CASE C: All Pages
                searchQuery.SQLWHERE = sqlWhere
                vendorRows = await FindVendorModel.searchAllForExport(searchQuery) as any[]
            }

            // 2. Fetch Prones Data & Match
            let resultData = await matchVendorsWithPrones(vendorRows, requiredStatus)

            // 2.1 Post-Fetch Sorting for 'STATUS_CHECK'
            if (statusSort) {
                const desc = statusSort.desc
                resultData.sort((a: any, b: any) => {
                    const valA = a.STATUS_CHECK || ''
                    const valB = b.STATUS_CHECK || ''
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
            const headerMap: Record<string, string> = {
                FFT_VENDOR_CODE: 'Vendor Code',
                STATUS_CHECK: 'Prones Status',
                COMPANY_NAME: 'Company Name',
                VENDOR_TYPE_NAME: 'Vendor Type',
                VENDOR_REGION: 'Region',
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
            const visibleColumns = Object.keys(headerMap)

            // Set Title Row
            worksheet.getCell('A1').value = 'Export : Vendor List'
            worksheet.getCell('A1').font = { name: 'Aptos Display', size: 18, bold: true }

            // Set Header Row (Row 2)
            visibleColumns.forEach((col, idx) => {
                const cell = worksheet.getCell(2, idx + 1)
                cell.value = headerMap[col]
                cell.font = { name: 'Aptos Display', bold: true }
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBCD8F1' } }
                cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
                cell.alignment = { vertical: 'middle', horizontal: 'center' }
                worksheet.getColumn(idx + 1).width = 20
            })

            // 5. Populate Data (Row 3+)
            resultData.forEach((row: any, rIdx: number) => {
                const rowIndex = 3 + rIdx

                visibleColumns.forEach((col, cIdx) => {
                    let cellValue = row[col]

                    // Date Fmt
                    if ((col === 'CREATE_DATE' || col === 'UPDATE_DATE') && cellValue) {
                        const date = new Date(cellValue)
                        cellValue = date.toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit' })
                    }
                    if (col === 'MODEL_LIST' && cellValue) cellValue = cellValue.replace(/\n/g, ', ')

                    const finalValue = cellValue !== undefined && cellValue !== null ? cellValue.toString() : ''

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
            if (!res.headersSent) return res.status(500).json({ error: 'Export failed', message: error?.message })
        }
    },

    // Export vendors to Excel (Streaming)
    // downloadFileForExport_Streaming: async (req: Request, res: Response) => {
    //     try {
    //         let dataItem
    //         if (Object.entries(req.body).length === 0) {
    //             dataItem = req.query.data ? JSON.parse(req.query.data as any) : req.query
    //         } else {
    //             dataItem = req.body
    //         }
    //
    //         const query = dataItem.DATAFORFETCH || dataItem || {}
    //
    //         // Table mapping
    //         const tableIds = [
    //             { table: 'v', id: 'COMPANY_NAME', Fns: 'LIKE' },
    //             { table: 'v', id: 'FFT_VENDOR_CODE', Fns: 'LIKE' },
    //             { table: 'v', id: 'FFT_STATUS', Fns: '=' },
    //             { table: 'v', id: 'INUSE', Fns: '=' },
    //             { table: 'v', id: 'PROVINCE', Fns: 'LIKE' },
    //             { table: 'v', id: 'COUNTRY', Fns: 'LIKE' },
    //             { table: 'v', id: 'WEBSITE', Fns: 'LIKE' },
    //             { table: 'v', id: 'ADDRESS', Fns: 'LIKE' },
    //             { table: 'v', id: 'TEL_CENTER', Fns: 'LIKE' },
    //             { table: 'v', id: 'vendor_type_id', Fns: '=' },
    //             { table: 'vt', id: 'VENDOR_TYPE_NAME', alias: 'name', Fns: 'LIKE' },
    //             { table: 'mpg', id: 'GROUP_NAME', Fns: 'LIKE' },
    //             { table: 'vp', id: 'product_group_id', Fns: '=' },
    //             { table: 'vp', id: 'MAKER_NAME', Fns: 'LIKE' },
    //             { table: 'vp', id: 'PRODUCT_NAME', Fns: 'LIKE' },
    //             { table: 'vp', id: 'MODEL_LIST', Fns: 'LIKE' },
    //             { table: 'vc', id: 'CONTACT_NAME', Fns: 'LIKE' },
    //             { table: 'vc', id: 'TEL_PHONE', Fns: 'LIKE' },
    //             { table: 'vc', id: 'EMAIL', Fns: 'LIKE' },
    //             { table: 'vc', id: 'CREATE_BY', Fns: 'LIKE' },
    //             { table: 'vc', id: 'UPDATE_BY', Fns: 'LIKE' },
    //             { table: 'vc', id: 'CREATE_DATE', Fns: '=' },
    //             { table: 'vc', id: 'UPDATE_DATE', Fns: '=' },
    //         ]
    //
    //         // Filter out 'status' to prevent SQL errors (status is computed)
    //         if (query.SearchFilters && Array.isArray(query.SearchFilters)) {
    //             query.SearchFilters = query.SearchFilters.filter((item: any) =>
    //                 item.value !== null && item.value !== undefined && item.value !== ''
    //             )
    //         }
    //
    //         const statusFilter = dataItem.DATAFORFETCH?.SearchFilters?.find((item: any) => item.id === 'status');
    //         const requiredStatus = statusFilter && statusFilter.value ? statusFilter.value.toString() : null;
    //
    //         // Intercept Order: if 'status_check', use default for SQL, but we generally can't sort effective streaming by computed field easily.
    //         // For streaming large datasets, sorting by computed field is expensive/impossible without buffering.
    //         // We will fallback to company_name ASC for SQL if status_check is requested.
    //         if (query.Order && Array.isArray(query.Order)) {
    //             const statusSort = query.Order.find((o: any) => o.id === 'status_check')
    //             if (statusSort) {
    //                 query.Order = [{ id: 'company_name', desc: false }]
    //             }
    //         }
    //
    //         // Generate SQL Where
    //         getSqlWhere_elysia(query, tableIds, 'company_name')
    //
    //         let sqlWhere = ''
    //         if (query.sqlWhere) {
    //             sqlWhere = query.sqlWhere.replace(/^WHERE\s+/i, '')
    //             if (sqlWhere) {
    //                 sqlWhere = ` AND ${sqlWhere}`
    //             }
    //         }
    //
    //         // 1. Prepare Response Headers for Streaming
    //         res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    //         res.setHeader('Content-Disposition', `attachment; filename=Vendor_List_${new Date().getTime()}.xlsx`);
    //
    //         // 2. Initialize Excel Streaming Writer
    //         const options = {
    //             stream: res,
    //             useStyles: true,
    //             useSharedStrings: true
    //         };
    //         const workbook = new excel.stream.xlsx.WorkbookWriter(options);
    //         const worksheet = workbook.addWorksheet('Vendor List');
    //
    //         // 3. Define Columns & Headers
    //         const headerMap: Record<string, string> = {
    //             fft_vendor_code: 'Vendor Code',
    //             status_check: 'Prones Status',
    //             company_name: 'Company Name',
    //             vendor_type_name: 'Vendor Type',
    //             province: 'Province',
    //             website: 'Website',
    //             address: 'Address',
    //             tel_center: 'Tel Company',
    //             group_name: 'Group Name',
    //             maker_name: 'Maker Name',
    //             product_name: 'Product Name',
    //             model_list: 'Model List',
    //             contact_name: 'Contact Name',
    //             tel_phone: 'Tel Contact',
    //             email: 'Email Contact',
    //             CREATE_BY: 'Created By',
    //             UPDATE_BY: 'Updated By',
    //             CREATE_DATE: 'Created Date',
    //             UPDATE_DATE: 'Updated Date'
    //         }
    //
    //         const visibleColumns = Object.keys(headerMap);
    //
    //         // Set Title
    //         worksheet.getCell('A1').value = 'Export : Vendor List';
    //         worksheet.getCell('A1').font = { name: 'Aptos Display', size: 18, bold: true };
    //
    //         // Set Headers
    //         visibleColumns.forEach((col, idx) => {
    //             const cell = worksheet.getCell(2, idx + 1);
    //             cell.value = headerMap[col];
    //             cell.font = { name: 'Aptos Display', bold: true };
    //             cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBCD8F1' } };
    //             cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    //             cell.alignment = { vertical: 'middle', horizontal: 'center' };
    //             // Manually set width as best effort since auto-fit isn't perfect in stream
    //             worksheet.getColumn(idx + 1).width = 20;
    //         });
    //         worksheet.commit(); // Commit headers
    //
    //         // 4. Fetch Prones Lookup Data (Cache in Memory)
    //         const pronesResponse = await FindVendorModel.getPronesData({}) as any;
    //         const pronesRows = pronesResponse?.rows || [];
    //
    //         // Build Lookup Maps
    //         const pronesTelMap = new Map();
    //         const pronesNameMap = new Map();
    //         pronesRows.forEach((p: any) => {
    //             const pTel = cleanTel(p.CUSTOMER_TEL);
    //             const pName = cleanName(p.CUSTOMER_NAME);
    //             if (pTel) pronesTelMap.set(pTel, p);
    //             if (pName) pronesNameMap.set(pName, p);
    //         });
    //
    //         // 5. Start DB Stream
    //         const searchQuery = { ...query, sqlWhereColumnFilter: '', Order: query.Order || 'v.company_name ASC' }; // Ensure order
    //         const { stream, connection } = await FindVendorModel.streamAllForExport(searchQuery, sqlWhere);
    //
    //         let rowIndex = 3;
    //
    //         stream.on('data', (row: any) => {
    //             // Determine Prones Status
    //             const mTel = cleanTel(row.tel_center);
    //             const mName = cleanName(row.company_name);
    //             const mAddress = row.address || '';
    //
    //             let status_check = 'Not Registered';
    //
    //             if (mTel && pronesTelMap.has(mTel)) {
    //                 status_check = 'Registered';
    //             } else if (mName && pronesNameMap.has(mName)) {
    //                 status_check = 'Registered';
    //             } else {
    //                 // Similar match logic - might be eager but included for completeness logic
    //                 const similarMatch = pronesRows.find((p: any) => {
    //                     const pFullAddr = `${p.CUSTOMER_ADDRESS1 || ''} ${p.CUSTOMER_ADDRESS2 || ''} ${p.CUSTOMER_ADDRESS3 || ''}`;
    //                     return calculateSimilarity(mAddress, pFullAddr) > 0.7;
    //                 });
    //                 if (similarMatch) status_check = 'Registered';
    //             }
    //
    //             // Filter on the fly
    //             if (requiredStatus) {
    //                 if (requiredStatus === '1' && status_check !== 'Registered') return; // Skip
    //                 if (requiredStatus === '0' && status_check !== 'Not Registered') return; // Skip
    //             }
    //
    //             row.status_check = status_check;
    //
    //             // Write Row
    //             visibleColumns.forEach((col, colIndex) => {
    //                 let cellValue = row[col];
    //
    //                 // Date Fmt
    //                 if ((col === 'CREATE_DATE' || col === 'UPDATE_DATE') && cellValue) {
    //                     const date = new Date(cellValue);
    //                     cellValue = date.toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit' });
    //                 }
    //                 if (col === 'model_list' && cellValue) cellValue = cellValue.replace(/\n/g, ', ');
    //
    //                 const finalValue = cellValue !== undefined && cellValue !== null ? cellValue.toString() : '';
    //
    //                 const cell = worksheet.getCell(rowIndex, colIndex + 1);
    //                 cell.value = finalValue;
    //                 cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    //                 cell.font = { name: 'Aptos Display', size: 11 };
    //                 cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    //             });
    //
    //             worksheet.getRow(rowIndex).commit();
    //             rowIndex++;
    //         });
    //
    //         stream.on('end', async () => {
    //             connection.release(); // Important: Release DB connection
    //             await workbook.commit(); // Finish Excel file
    //         });
    //
    //         stream.on('error', (err: any) => {
    //             console.error('Stream Error:', err);
    //             connection.release();
    //             if (!res.headersSent) res.status(500).send('Error generating file');
    //         });
    //
    //     } catch (error: any) {
    //         console.error('downloadFileForExport error:', error)
    //         if (!res.headersSent) return res.status(500).json({ error: 'Export failed', message: error?.message })
    //     }
    // },

    // Get prones data
    getPronesData: async (req: Request, res: Response) => {
        try {
            let dataItem

            if (!req.body || Object.entries(req.body).length === 0) {
                dataItem = req.query
            } else {
                dataItem = req.body
            }

            // 1. à¸”à¸¶à¸‡à¸‚à¹‰à¸­à¸¡à¸¹à¸¥ vendor à¸à¸±à¹ˆà¸‡à¹€à¸£à¸²
            const myVendors = await FindVendorModel.getAllVendorNames()

            // 2. à¹ƒà¸Šà¹‰ Helper à¹€à¸žà¸·à¹ˆà¸­ Match à¸à¸±à¸š Prones Data
            const resultRows = await matchVendorsWithPrones(myVendors)

            // 3. à¸ªà¹ˆà¸‡ JSON à¸à¸¥à¸±à¸š
            res.status(200).json({
                Status: true,
                ResultOnDb: {
                    rows: resultRows
                },
                TotalCountOnDb: resultRows.length,
                MethodOnDb: 'Comparison Prones',
                Message: 'Comparison Success'
            } as ResponseI)

        } catch (error: any) {
            // console.error('Match Prones Error:', error);
            res.status(200).json({
                Status: false,
                ResultOnDb: [],
                TotalCountOnDb: 0,
                MethodOnDb: 'Comparison Prones',
                Message: error?.message || 'Internal Server Error'
            } as ResponseI)
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
    getPronesDataAll: async (req: Request, res: Response) => {
        // Simple fetch without status check
        try {
            let dataItem

            if (!req.body || Object.entries(req.body).length === 0) {
                dataItem = req.query
            } else {
                dataItem = req.body
            }

            const resultData = await FindVendorModel.getPronesData(dataItem)
            res.status(200).json({
                Status: true,
                ResultOnDb: resultData,
                TotalCountOnDb: resultData.length,
                MethodOnDb: 'Get Prones Data All',
                Message: 'Get Data Success'
            } as ResponseI)
        } catch (error: any) {
            // console.error('Get Prones Data All Error:', error)
            res.status(200).json({
                Status: false,
                ResultOnDb: [],
                TotalCountOnDb: 0,
                MethodOnDb: 'Get Prones Data All',
                Message: error?.message || 'Failed to get prones data'
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


// ------- Helper Functions  -------
const matchVendorsWithPrones = async (vendors: any[], filterStatus: string | null = null) => {
    // Read pre-computed match results from vendor_match_result table
    const vendorIds = [...new Set(vendors.map((v: any) => v.VENDORS_ID).filter(Boolean))] as number[]

    let matchMap = new Map<number, any>()

    if (vendorIds.length > 0) {
        const matchResults = await FindVendorModel.getMatchResultsByVendorIds(vendorIds) as any[]
        matchResults.forEach((r: any) => {
            matchMap.set(r.VENDORS_ID, r)
        })
    }

    // Enrich vendors with match results
    let enrichedData = vendors.map((vendor: any) => {
        const match = matchMap.get(vendor.VENDORS_ID)

        let finalStatus = match ? match.STATUS_CHECK : 'Not Registered'
        if (vendor.FFT_STATUS == 2 || vendor.FFT_STATUS === 'Cannot Register') {
            finalStatus = 'Cannot Register'
        }

        return {
            ...vendor,
            STATUS_CHECK: finalStatus,
            PRONES_CODE: match ? match.PRONES_CODE : (vendor.FFT_VENDOR_CODE || null),
            PRONES_NAME_EN: match ? match.PRONES_NAME : null,
            MATCH_METHOD: match ? match.MATCH_METHOD : null,
        }
    })

    // Filter by Prones Status if requested
    if (filterStatus) {
        if (filterStatus === '1') {
            enrichedData = enrichedData.filter((item: any) => item.STATUS_CHECK === 'Registered')
        } else if (filterStatus === '0') {
            enrichedData = enrichedData.filter((item: any) => item.STATUS_CHECK === 'Not Registered')
        }
    }

    return enrichedData
}

