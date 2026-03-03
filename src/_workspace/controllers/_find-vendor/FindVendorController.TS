import { FindVendorModel } from '@src/_workspace/models/_find-vendor/FindVendorModel'
import { getSqlWhereByColumnFilters_elysia } from '@src/helpers/getSqlWhereByFilterColumn'
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

        // Intercept Order for SQL fallback (Fix: status_check is computed, cannot sort in SQL)
        let statusSort: any = null;
        if (dataItem.Order) {
            if (Array.isArray(dataItem.Order)) {

                const statusSortIdx = dataItem.Order.findIndex((o: any) => o.id === 'status_check');
                if (statusSortIdx > -1) {
                    statusSort = dataItem.Order[statusSortIdx];
                    // Remove status_check from SQL Order
                    dataItem.Order.splice(statusSortIdx, 1);
                    // If Order is empty after removal, add default
                    if (dataItem.Order.length === 0) {
                        dataItem.Order.push({ id: 'company_name', desc: false });
                    }
                }
            } else if (typeof dataItem.Order === 'string') {
                // Handle string format e.g. "status_check DESC" or "status_check ASC"
                if (dataItem.Order.includes('status_check')) {
                    const isDesc = dataItem.Order.toLowerCase().includes('desc');
                    statusSort = { id: 'status_check', desc: isDesc };
                    // Replace with default sort
                    dataItem.Order = 'v.company_name ASC';
                }
            }
        }

        // Intercept prones_code filter (Virtual Field)
        let pronesCodeFilterVal: string | null = null;
        if (dataItem.SearchFilters && Array.isArray(dataItem.SearchFilters)) {
            const pIdx = dataItem.SearchFilters.findIndex((item: any) => item.id === 'prones_code');
            if (pIdx > -1) {
                pronesCodeFilterVal = dataItem.SearchFilters[pIdx].value;
                // Remove from SQL SearchFilters to avoid "Unknown column"
                dataItem.SearchFilters.splice(pIdx, 1);
            }
        }

        // Table mapping for ColumnFilters and SearchFilters
        const tableIds = [
            { table: 'v', id: 'company_name', Fns: 'LIKE' },
            { table: 'v', id: 'fft_vendor_code', Fns: 'LIKE' },
            { table: 'v', id: 'fft_status', Fns: '=' },
            { table: 'v', id: 'inuse', Fns: '=' },
            { table: 'v', id: 'province', Fns: 'LIKE' },
            { table: 'v', id: 'vendor_region', Fns: '=' },
            { table: 'v', id: 'website', Fns: 'LIKE' },
            { table: 'v', id: 'address', Fns: 'LIKE' },
            { table: 'v', id: 'tel_center', Fns: 'LIKE' },
            { table: 'v', id: 'emailmain', Fns: 'LIKE' },
            { table: 'v', id: 'vendor_type_id', Fns: '=' },
            { table: 'vt', id: 'vendor_type_name', alias: 'name', Fns: 'LIKE' },
            { table: 'mpg', id: 'group_name', Fns: 'LIKE' },
            { table: 'vp', id: 'product_group_id', Fns: '=' },
            { table: 'vp', id: 'maker_name', Fns: 'LIKE' },
            { table: 'vp', id: 'product_name', Fns: 'LIKE' },
            { table: 'vp', id: 'model_list', Fns: 'LIKE' },
            { table: 'vc', id: 'contact_name', Fns: 'LIKE' },
            { table: 'vc', id: 'tel_phone', Fns: 'LIKE' },
            { table: 'vc', id: 'email', Fns: 'LIKE' },
            { table: 'vc', id: 'CREATE_BY', Fns: 'LIKE' },
            { table: 'vc', id: 'UPDATE_BY', Fns: 'LIKE' },
            { table: 'vc', id: 'CREATE_DATE', Fns: '=' },
            { table: 'vc', id: 'UPDATE_DATE', Fns: '=' },
            // { table: 'vc', id: 'UPDATE_DATE', Fns: '=' },
        ]

        // Filter out null/empty values from SearchFilters before passing to helper
        if (dataItem.SearchFilters && Array.isArray(dataItem.SearchFilters)) {
            dataItem.SearchFilters = dataItem.SearchFilters.filter((item: any) =>
                item.value !== null && item.value !== undefined && item.value !== ''
            )
        }

        // Create SQL WHERE and ORDER BY
        getSqlWhere_elysia(dataItem, tableIds, 'company_name')

        // Extract sqlWhere from dataItem (it now contains both SearchFilters and ColumnFilters)
        let sqlWhere = ''
        if (dataItem.sqlWhere) {
            sqlWhere = dataItem.sqlWhere.replace(/^WHERE\s+/i, '')
            if (sqlWhere) {
                sqlWhere = ` AND ${sqlWhere}`
            }
        }

        dataItem['sqlWhereColumnFilter'] = '' // No longer needed as it's merged into sqlWhere
        dataItem['Offset'] = Number(dataItem['Start'] || 0) * Number(dataItem['Limit'] || 20)


        // console.log('dataItem:', dataItem)

        try {
            console.time('[PERF] Total Search');

            console.time('[PERF] MySQL Query');
            const { resultData, totalCount } = await FindVendorModel.searchVendors(dataItem, sqlWhere);
            console.timeEnd('[PERF] MySQL Query');
            console.log(`[PERF] MySQL returned ${resultData.length} rows`);

            const statusFilter = dataItem.SearchFilters?.find((item: any) => item.id === 'status');
            const filterValue = statusFilter && statusFilter.value ? statusFilter.value.toString() : null;

            console.time('[PERF] Prones Matching');
            let finalResult = await matchVendorsWithPrones(resultData, filterValue);
            console.timeEnd('[PERF] Prones Matching');

            // Filter by prones_code (In-Memory)
            if (pronesCodeFilterVal) {
                const val = pronesCodeFilterVal.toString().trim().toLowerCase();
                finalResult = finalResult.filter((item: any) =>
                    item.prones_code && item.prones_code.toString().toLowerCase().includes(val)
                );
            }

            // Post-Fetch Sorting for 'status_check'
            if (statusSort) {
                const desc = statusSort.desc;
                finalResult.sort((a: any, b: any) => {
                    const valA = a.status_check || '';
                    const valB = b.status_check || '';
                    if (valA < valB) return desc ? 1 : -1;
                    if (valA > valB) return desc ? -1 : 1;
                    return 0;
                });
            }

            console.timeEnd('[PERF] Total Search');
            console.log(`[PERF] Returning ${finalResult.length} rows to client`);

            return res.status(200).json({
                Status: true,
                ResultOnDb: finalResult,
                TotalCountOnDb: totalCount, // Note: This might mismatch if we filter by prones_code, but for client-side pagination on resultData it's okay? 
                // Actually with client-side pagination (limit 10000), totalCount is less relevant than ResultOnDb.length
                MethodOnDb: 'Search Vendors',
                Message: 'Search Data Success'
            } as ResponseI)
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
                    ResultOnDb: [],
                    TotalCountOnDb: 0,
                    MethodOnDb: 'Get Vendor By ID',
                    Message: 'Invalid vendor ID'
                } as ResponseI)
            }

            const resultData = await FindVendorModel.getById(vendor_id)
            if (resultData && resultData.length > 0) {
                // Enrich with Prones Status Logic
                const enrichedData = await matchVendorsWithPrones(resultData, null)

                return res.status(200).json({
                    Status: true,
                    ResultOnDb: enrichedData[0],
                    TotalCountOnDb: 1,
                    MethodOnDb: 'Get Vendor By ID',
                    Message: 'Get Data Success'
                } as ResponseI)
            } else {
                return res.status(404).json({
                    Status: false,
                    ResultOnDb: [],
                    TotalCountOnDb: 0,
                    MethodOnDb: 'Get Vendor By ID',
                    Message: 'Vendor not found'
                } as ResponseI)
            }
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
            return res.status(200).json({
                Status: true,
                ResultOnDb: result,
                TotalCountOnDb: 1,
                MethodOnDb: 'Update Vendor',
                Message: 'Update Data Success'
            } as ResponseI)
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
            return res.status(200).json({
                Status: true,
                ResultOnDb: true,
                TotalCountOnDb: 1,
                MethodOnDb: 'Delete Vendor Contact',
                Message: 'Delete Success'
            } as ResponseI)
        } catch (error: any) {
            return res.status(500).json({
                Status: false,
                ResultOnDb: false,
                TotalCountOnDb: 0,
                MethodOnDb: 'Delete Vendor Contact Failed',
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
            return res.status(200).json({
                Status: true,
                ResultOnDb: true,
                TotalCountOnDb: 1,
                MethodOnDb: 'Delete Vendor Product',
                Message: 'Delete Success'
            } as ResponseI)
        } catch (error: any) {
            return res.status(500).json({
                Status: false,
                ResultOnDb: false,
                TotalCountOnDb: 0,
                MethodOnDb: 'Delete Vendor Product Failed',
                Message: error?.message || 'Failed to delete product'
            } as ResponseI)
        }
    },

    // Get vendor types for dropdown
    getVendorTypes: async (req: Request, res: Response) => {
        try {
            const result = await FindVendorModel.getVendorTypes()
            return res.status(200).json({
                Status: true,
                ResultOnDb: result,
                TotalCountOnDb: result.length,
                MethodOnDb: 'Get Vendor Types',
                Message: 'Get Data Success'
            } as ResponseI)
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
            return res.status(200).json({
                Status: true,
                ResultOnDb: result,
                TotalCountOnDb: result.length,
                MethodOnDb: 'Get Provinces',
                Message: 'Get Data Success'
            } as ResponseI)
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
            return res.status(200).json({
                Status: true,
                ResultOnDb: result,
                TotalCountOnDb: result.length,
                MethodOnDb: 'Get Product Groups',
                Message: 'Get Data Success'
            } as ResponseI)
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

    // Export vendors to Excel (Buffer / Template Approach)
    downloadFileForExport: async (req: Request, res: Response) => {
        try {
            let dataItem
            if (Object.entries(req.body).length === 0) {
                dataItem = req.query.data ? JSON.parse(req.query.data as any) : req.query
            } else {
                dataItem = req.body
            }

            const query = dataItem.DataForFetch || dataItem || {}

            // Table mapping
            const tableIds = [
                { table: 'v', id: 'company_name', Fns: 'LIKE' },
                { table: 'v', id: 'fft_vendor_code', Fns: 'LIKE' },
                { table: 'v', id: 'fft_status', Fns: '=' },
                { table: 'v', id: 'inuse', Fns: '=' },
                { table: 'v', id: 'province', Fns: 'LIKE' },
                { table: 'v', id: 'vendor_region', Fns: '=' },
                { table: 'v', id: 'website', Fns: 'LIKE' },
                { table: 'v', id: 'address', Fns: 'LIKE' },
                { table: 'v', id: 'tel_center', Fns: 'LIKE' },
                { table: 'v', id: 'emailmain', Fns: 'LIKE' },
                { table: 'v', id: 'vendor_type_id', Fns: '=' },
                { table: 'vt', id: 'vendor_type_name', alias: 'name', Fns: 'LIKE' },
                { table: 'mpg', id: 'group_name', Fns: 'LIKE' },
                { table: 'vp', id: 'product_group_id', Fns: '=' },
                { table: 'vp', id: 'maker_name', Fns: 'LIKE' },
                { table: 'vp', id: 'product_name', Fns: 'LIKE' },
                { table: 'vp', id: 'model_list', Fns: 'LIKE' },
                { table: 'vc', id: 'contact_name', Fns: 'LIKE' },
                { table: 'vc', id: 'tel_phone', Fns: 'LIKE' },
                { table: 'vc', id: 'email', Fns: 'LIKE' },
                { table: 'vc', id: 'CREATE_BY', Fns: 'LIKE' },
                { table: 'vc', id: 'UPDATE_BY', Fns: 'LIKE' },
                { table: 'vc', id: 'CREATE_DATE', Fns: '=' },
                { table: 'vc', id: 'UPDATE_DATE', Fns: '=' },
            ]

            if (query.SearchFilters && Array.isArray(query.SearchFilters)) {
                query.SearchFilters = query.SearchFilters.filter((item: any) =>
                    item.value !== null && item.value !== undefined && item.value !== ''
                )
            }

            const statusFilter = dataItem.DataForFetch?.SearchFilters?.find((item: any) => item.id === 'status');
            const requiredStatus = statusFilter && statusFilter.value ? statusFilter.value.toString() : null;

            // Intercept Order for SQL fallback
            let statusSort: any = null;
            if (query.Order && Array.isArray(query.Order)) {
                statusSort = query.Order.find((o: any) => o.id === 'status_check')
                if (statusSort) {
                    query.Order = [{ id: 'company_name', desc: false }]
                }
            }

            // Generate SQL Where
            getSqlWhere_elysia(query, tableIds, 'company_name')

            let sqlWhere = ''
            if (query.sqlWhere) {
                sqlWhere = query.sqlWhere.replace(/^WHERE\s+/i, '')
                if (sqlWhere) {
                    sqlWhere = ` AND ${sqlWhere}`
                }
            }

            // 1. Fetch Data
            const searchQuery = { ...query, sqlWhereColumnFilter: '', Order: query.Order || 'v.company_name ASC' };
            let vendorRows: any[] = [];

            if (query.vendor_ids && Array.isArray(query.vendor_ids) && query.vendor_ids.length > 0) {
                // CASE A: Export Specific IDs (Current Page from Client-Side)
                // We fetch these specific IDs.
                // We must modify sqlWhere to filter by these IDs.
                const ids = query.vendor_ids.join(',');
                const idsSqlWhere = ` AND v.vendor_id IN (${ids})`;
                // We use searchAllForExport but with specific IDs override
                // We ignore Order from SQL, because we will sort by ID order in JS
                vendorRows = await FindVendorModel.searchAllForExport(searchQuery, idsSqlWhere) as any[];

                // Re-sort in Memory to match input ID order
                const idMap = new Map();
                if (Array.isArray(query.vendor_ids)) {
                    query.vendor_ids.forEach((id: number, index: number) => idMap.set(id, index));
                }

                vendorRows.sort((a: any, b: any) => {
                    const idxA = idMap.has(a?.vendor_id) ? idMap.get(a.vendor_id) : 999999;
                    const idxB = idMap.has(b?.vendor_id) ? idMap.get(b.vendor_id) : 999999;
                    return (Number(idxA) || 0) - (Number(idxB) || 0);
                });

            } else if (dataItem.TYPE === 'currentPage') {
                // CASE B: Fallback Current Page (if no vendor_ids sent)
                searchQuery['Offset'] = Number(searchQuery['Start'] || 0) * Number(searchQuery['Limit'] || 20)
                const { resultData } = await FindVendorModel.searchVendors(searchQuery, sqlWhere);
                vendorRows = resultData;
            } else {
                // CASE C: All Pages
                vendorRows = await FindVendorModel.searchAllForExport(searchQuery, sqlWhere) as any[];
            }

            // 2. Fetch Prones Data & Match
            let resultData = await matchVendorsWithPrones(vendorRows, requiredStatus);

            // 2.1 Post-Fetch Sorting for 'status_check'
            if (statusSort) {
                const desc = statusSort.desc;
                resultData.sort((a: any, b: any) => {
                    const valA = a.status_check || '';
                    const valB = b.status_check || '';
                    if (valA < valB) return desc ? 1 : -1;
                    if (valA > valB) return desc ? -1 : 1;
                    return 0;
                });
            }

            // 3. Create Workbook & Worksheet (Memory Approach - like ClearTimeExport)
            // Note: If you have a template file, use workbook.xlsx.readFile('path/to/template.xlsx')
            const workbook = new excel.Workbook();
            const worksheet = workbook.addWorksheet('Vendor List');

            // 4. Setup Headers
            const headerMap: Record<string, string> = {
                fft_vendor_code: 'Vendor Code',
                status_check: 'Prones Status',
                company_name: 'Company Name',
                vendor_type_name: 'Vendor Type',
                vendor_region: 'Region',
                province: 'Province',
                website: 'Website',
                address: 'Address',
                tel_center: 'Tel Company',
                emailmain: 'Email (Main)',
                group_name: 'Group Name',
                maker_name: 'Maker Name',
                product_name: 'Product Name',
                model_list: 'Model List',
                contact_name: 'Contact Name',
                tel_phone: 'Tel Contact',
                email: 'Email Contact',
                CREATE_BY: 'Created By',
                UPDATE_BY: 'Updated By',
                CREATE_DATE: 'Created Date',
                UPDATE_DATE: 'Updated Date'
            }
            const visibleColumns = Object.keys(headerMap);

            // Set Title Row
            worksheet.getCell('A1').value = 'Export : Vendor List';
            worksheet.getCell('A1').font = { name: 'Aptos Display', size: 18, bold: true };

            // Set Header Row (Row 2)
            visibleColumns.forEach((col, idx) => {
                const cell = worksheet.getCell(2, idx + 1);
                cell.value = headerMap[col];
                cell.font = { name: 'Aptos Display', bold: true };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBCD8F1' } };
                cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                worksheet.getColumn(idx + 1).width = 20;
            });

            // 5. Populate Data (Row 3+)
            resultData.forEach((row: any, rIdx: number) => {
                const rowIndex = 3 + rIdx;

                visibleColumns.forEach((col, cIdx) => {
                    let cellValue = row[col];

                    // Date Fmt
                    if ((col === 'CREATE_DATE' || col === 'UPDATE_DATE') && cellValue) {
                        const date = new Date(cellValue);
                        cellValue = date.toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit' });
                    }
                    if (col === 'model_list' && cellValue) cellValue = cellValue.replace(/\n/g, ', ');

                    const finalValue = cellValue !== undefined && cellValue !== null ? cellValue.toString() : '';

                    const cell = worksheet.getCell(rowIndex, cIdx + 1);
                    cell.value = finalValue;
                    cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
                    cell.font = { name: 'Aptos Display', size: 11 };
                    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                });
            });

            // 6. Send Response logic (similar to ClearTime sendFile)
            const date = new Date()
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            const hours = String(date.getHours()).padStart(2, '0')
            const minutes = String(date.getMinutes()).padStart(2, '0')
            const seconds = String(date.getSeconds()).padStart(2, '0')
            const filename = `Vendor_List_${year}${month}${day}_${hours}${minutes}${seconds}.xlsx`

            const buffer = await workbook.xlsx.writeBuffer();

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', (buffer as any).length);

            res.end(buffer);

        } catch (error: any) {
            console.error('downloadFileForExport error:', error)
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
    //         const query = dataItem.DataForFetch || dataItem || {}
    //
    //         // Table mapping
    //         const tableIds = [
    //             { table: 'v', id: 'company_name', Fns: 'LIKE' },
    //             { table: 'v', id: 'fft_vendor_code', Fns: 'LIKE' },
    //             { table: 'v', id: 'fft_status', Fns: '=' },
    //             { table: 'v', id: 'inuse', Fns: '=' },
    //             { table: 'v', id: 'province', Fns: 'LIKE' },
    //             { table: 'v', id: 'website', Fns: 'LIKE' },
    //             { table: 'v', id: 'address', Fns: 'LIKE' },
    //             { table: 'v', id: 'tel_center', Fns: 'LIKE' },
    //             { table: 'v', id: 'vendor_type_id', Fns: '=' },
    //             { table: 'vt', id: 'vendor_type_name', alias: 'name', Fns: 'LIKE' },
    //             { table: 'mpg', id: 'group_name', Fns: 'LIKE' },
    //             { table: 'vp', id: 'product_group_id', Fns: '=' },
    //             { table: 'vp', id: 'maker_name', Fns: 'LIKE' },
    //             { table: 'vp', id: 'product_name', Fns: 'LIKE' },
    //             { table: 'vp', id: 'model_list', Fns: 'LIKE' },
    //             { table: 'vc', id: 'contact_name', Fns: 'LIKE' },
    //             { table: 'vc', id: 'tel_phone', Fns: 'LIKE' },
    //             { table: 'vc', id: 'email', Fns: 'LIKE' },
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
    //         const statusFilter = dataItem.DataForFetch?.SearchFilters?.find((item: any) => item.id === 'status');
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
            const dataItem = req.body;

            // 1. ดึงข้อมูล vendor ฝั่งเรา
            const myVendors = await FindVendorModel.getAllVendorNames();

            // 2. ใช้ Helper เพื่อ Match กับ Prones Data
            const resultRows = await matchVendorsWithPrones(myVendors);

            // 3. ส่ง JSON กลับ
            return res.status(200).json({
                Status: true,
                ResultOnDb: {
                    rows: resultRows
                },
                TotalCountOnDb: resultRows.length,
                MethodOnDb: 'Match Prones to MyVendors',
                Message: 'Comparison Success'
            } as ResponseI);

        } catch (error: any) {
            console.error('Match Error:', error);
            return res.status(500).json({
                Status: false,
                Message: error?.message || 'Internal Server Error'
            });
        }
    },
    // Get all vendor names
    getAllVendorNames: async (req: Request, res: Response) => {
        try {
            const resultData = await FindVendorModel.getAllVendorNames()
            return res.status(200).json({
                Status: true,
                ResultOnDb: resultData,
                TotalCountOnDb: resultData.length,
                MethodOnDb: 'Get All Vendor Names',
                Message: 'Get Data Success'
            } as ResponseI)
        } catch (error: any) {
            console.error('getAllVendorNames error:', error)
            return res.status(500).json({
                Status: false,
                ResultOnDb: [],
                TotalCountOnDb: 0,
                MethodOnDb: 'Get All Vendor Names Failed',
                Message: error?.message || 'Failed to get all vendor names'
            } as ResponseI)
        }
    },
    getPronesDataAll: async (req: Request, res: Response) => {
        // Simple fetch without status check
        try {
            const dataItem = req.body
            const resultData = await FindVendorModel.getPronesData(dataItem)
            return res.status(200).json({
                Status: true,
                ResultOnDb: resultData,
                TotalCountOnDb: resultData.length,
                MethodOnDb: 'Get Prones Data',
                Message: 'Get Data Success'
            } as ResponseI)
        } catch (error: any) {
            console.error('getPronesData error:', error)
            return res.status(500).json({
                Status: false,
                ResultOnDb: [],
                TotalCountOnDb: 0,
                MethodOnDb: 'Get Prones Data Failed',
                Message: error?.message || 'Failed to get prones data'
            } as ResponseI)
        }
    }
}


// ------- Helper Functions  -------
const matchVendorsWithPrones = async (vendors: any[], filterStatus: string | null = null) => {
    // Read pre-computed match results from vendor_match_result table
    const vendorIds = [...new Set(vendors.map((v: any) => v.vendor_id).filter(Boolean))] as number[]

    let matchMap = new Map<number, any>()

    if (vendorIds.length > 0) {
        const matchResults = await FindVendorModel.getMatchResultsByVendorIds(vendorIds) as any[]
        matchResults.forEach((r: any) => {
            matchMap.set(r.vendor_id, r)
        })
    }

    // Enrich vendors with match results
    let enrichedData = vendors.map((vendor: any) => {
        const match = matchMap.get(vendor.vendor_id)
        return {
            ...vendor,
            status_check: match ? match.status_check : 'Not Registered',
            prones_code: match ? match.prones_code : (vendor.fft_vendor_code || null),
            prones_name_en: match ? match.prones_name : null,
            match_method: match ? match.match_method : null,
        }
    })

    // Filter by Prones Status if requested
    if (filterStatus) {
        if (filterStatus === '1') {
            enrichedData = enrichedData.filter((item: any) => item.status_check === 'Registered')
        } else if (filterStatus === '0') {
            enrichedData = enrichedData.filter((item: any) => item.status_check === 'Not Registered')
        }
    }

    return enrichedData
}

