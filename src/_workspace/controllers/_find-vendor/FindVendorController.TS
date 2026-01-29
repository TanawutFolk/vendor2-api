import { FindVendorModel } from '@src/_workspace/models/_find-vendor/FindVendorModel'
import { getSqlWhereByColumnFilters_elysia } from '@src/helpers/getSqlWhereByFilterColumn'
import getSqlWhere_elysia from '@src/helpers/getSqlWhere_elysia'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'
const xl = require('excel4node')

export const FindVendorController = {
    // Search vendors
    search: async (req: Request, res: Response) => {
        let dataItem

        if (!req.body || Object.entries(req.body).length === 0) {
            dataItem = req.query
        } else {
            dataItem = req.body
        }

        // Table mapping for ColumnFilters and SearchFilters
        const tableIds = [
            { table: 'v', id: 'company_name', Fns: 'LIKE' },
            { table: 'v', id: 'fft_vendor_code', Fns: 'LIKE' },
            { table: 'v', id: 'fft_status', Fns: '=' },
            { table: 'v', id: 'inuse', Fns: '=' },
            { table: 'v', id: 'province', Fns: 'LIKE' },
            { table: 'v', id: 'website', Fns: 'LIKE' },
            { table: 'v', id: 'address', Fns: 'LIKE' },
            { table: 'v', id: 'tel_center', Fns: 'LIKE' },
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
            { table: 'vc', id: 'UPDATE_DATE', Fns: '=' },
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

        console.log('dataItem:', dataItem)

        try {
            // ดึงข้อมูล vendors และ prones data พร้อมกัน
            const [{ resultData, totalCount }, pronesResponse] = await Promise.all([
                FindVendorModel.searchVendors(dataItem, sqlWhere),
                FindVendorModel.getPronesData({})
            ]);

            // ดึงเฉพาะ Rows จาก Prones (จัดการโครงสร้าง Oracle)
            const pronesRows = (pronesResponse as any)?.rows || [];

            // สร้าง Index สำหรับ Prones data เพื่อ lookup เร็ว O(1)
            const pronesTelMap = new Map();
            const pronesNameMap = new Map();

            pronesRows.forEach((p: any) => {
                const pTel = cleanTel(p.CUSTOMER_TEL);
                const pName = cleanName(p.CUSTOMER_NAME);
                if (pTel) pronesTelMap.set(pTel, p);
                if (pName) pronesNameMap.set(pName, p);
            });

            // Merge status_check เข้ากับ resultData
            const resultWithStatus = resultData.map((vendor: any) => {
                const mTel = cleanTel(vendor.tel_center);
                const mName = cleanName(vendor.company_name);
                const mAddress = vendor.address || '';

                let status_check = 'Not Registered';
                let pronesRef = null;

                // Step 1: เช็คจากเบอร์โทร (แม่นยำสุด)
                if (mTel && pronesTelMap.has(mTel)) {
                    status_check = 'Registered';
                    pronesRef = pronesTelMap.get(mTel);
                }
                // Step 2: เช็คจากชื่อบริษัท
                else if (mName && pronesNameMap.has(mName)) {
                    status_check = 'Registered';
                    pronesRef = pronesNameMap.get(mName);
                }
                // Step 3: เช็คจากความคล้ายของที่อยู่
                else {
                    const similarMatch = pronesRows.find((p: any) => {
                        const pFullAddr = `${p.CUSTOMER_ADDRESS1 || ''} ${p.CUSTOMER_ADDRESS2 || ''} ${p.CUSTOMER_ADDRESS3 || ''}`;
                        return calculateSimilarity(mAddress, pFullAddr) > 0.6;
                    });

                    if (similarMatch) {
                        status_check = 'Registered';
                        pronesRef = similarMatch;
                    }
                }

                return {
                    ...vendor,
                    status_check,
                    prones_code: pronesRef ? pronesRef.CUSTOMER_CODE : null,
                    prones_name_en: pronesRef ? pronesRef.CUSTOMER_NAME : null
                };
            });

            // Filter by Prones Status if requested
            // 1 = Registered, 0 = Not Registered
            const statusFilter = dataItem.SearchFilters?.find((item: any) => item.id === 'status');
            let finalResult = resultWithStatus;

            if (statusFilter && statusFilter.value) {
                const filterValue = statusFilter.value.toString();
                if (filterValue === '1') {
                    finalResult = finalResult.filter((item: any) => item.status_check === 'Registered');
                } else if (filterValue === '0') {
                    finalResult = finalResult.filter((item: any) => item.status_check === 'Not Registered');
                }
            }

            return res.status(200).json({
                Status: true,
                ResultOnDb: finalResult,
                TotalCountOnDb: totalCount,
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
                return res.status(200).json({
                    Status: true,
                    ResultOnDb: resultData[0],
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

    // Export vendors to Excel
    downloadFileForExport: async (req: Request, res: Response) => {
        try {
            let dataItem = Object.entries(req.body).length === 0 ? req.query : req.body
            const query = dataItem.DataForFetch || {}
            const exportType = dataItem.TYPE || 'AllPage' // 'currentPage' or 'AllPage'

            // Table mapping (same as search function)
            const tableIds = [
                { table: 'v', id: 'company_name', Fns: 'LIKE' },
                { table: 'v', id: 'fft_vendor_code', Fns: 'LIKE' },
                { table: 'v', id: 'fft_status', Fns: '=' },
                { table: 'v', id: 'inuse', Fns: '=' },
                { table: 'v', id: 'province', Fns: 'LIKE' },
                { table: 'v', id: 'website', Fns: 'LIKE' },
                { table: 'v', id: 'address', Fns: 'LIKE' },
                { table: 'v', id: 'tel_center', Fns: 'LIKE' },
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

            // Filter out null/empty values from SearchFilters before passing to helper
            if (query.SearchFilters && Array.isArray(query.SearchFilters)) {
                query.SearchFilters = query.SearchFilters.filter((item: any) =>
                    item.value !== null && item.value !== undefined && item.value !== ''
                )
            }

            // ใช้ helper function เพื่อสร้าง SQL WHERE อย่างปลอดภัย
            getSqlWhere_elysia(query, tableIds, 'company_name')

            // แปลงค่า sqlWhere จาก WHERE ... เป็น AND ...
            let sqlWhere = ''
            if (query.sqlWhere) {
                sqlWhere = query.sqlWhere.replace(/^WHERE\s+/i, '')
                if (sqlWhere) {
                    sqlWhere = ` AND ${sqlWhere}`
                }
            }

            // orderBy ถูกจัดการโดย helper function แล้วใน query.Order

            let data: any[] = []

            if (exportType === 'currentPage') {
                // Export current page only - use pagination
                const limit = query.Limit || 20
                const start = query.Start || 0
                const offset = start * limit

                const searchQuery = {
                    ...query,
                    Order: query.Order || 'v.company_name ASC',
                    Limit: limit,
                    Offset: offset,
                    sqlWhereColumnFilter: ''
                }

                // Use the search function which has pagination
                const result = await FindVendorModel.searchVendors(searchQuery, sqlWhere)
                data = result.resultData || []
            } else {
                // Export all data - no pagination
                const searchQuery = {
                    ...query,
                    Order: query.Order || 'v.company_name ASC',
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
                contact_name: 'Contact Name',
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
    },

    // Get prones data
    getPronesData: async (req: Request, res: Response) => {
        try {
            const dataItem = req.body;

            // 1. ดึงข้อมูลจากทั้ง 2 Source
            const pronesResponse = await FindVendorModel.getPronesData(dataItem) as any;
            const myVendors = await FindVendorModel.getAllVendorNames();

            // ดึงเฉพาะ Rows ออกมา (จัดการโครงสร้าง Oracle)
            const pronesRows = pronesResponse?.rows || [];

            // 2. สร้าง "Index" สำหรับข้อมูล Prones (เพื่อความเร็วระดับ O(1))
            // เราจะเอาเบอร์โทรและชื่อจาก Prones มาทำเป็น Key ไว้รอให้ฝั่งเราวิ่งมาเช็ค
            const pronesTelMap = new Map();
            const pronesNameMap = new Map();

            pronesRows.forEach((p: any) => {
                const pTel = cleanTel(p.CUSTOMER_TEL);
                const pName = cleanName(p.CUSTOMER_NAME);
                if (pTel) pronesTelMap.set(pTel, p);
                if (pName) pronesNameMap.set(pName, p);
            });

            // 3. เริ่มเปรียบเทียบโดยเอา "ข้อมูลฝั่งเรา (myVendors)" เป็นตัวตั้ง
            const resultRows = myVendors.map((myItem: any) => {
                const mTel = cleanTel(myItem.tel_center);
                const mName = cleanName(myItem.company_name);
                const mAddress = myItem.address || '';

                let status = 'Not Registered';
                let pronesRef = null;

                // --- Logic การ Match (เรียงลำดับความแม่นยำ) ---

                // Step 1: เช็คจากเบอร์โทร (แม่นยำสุด)
                if (mTel && pronesTelMap.has(mTel)) {
                    status = 'Registered';
                    pronesRef = pronesTelMap.get(mTel);
                }
                // Step 2: เช็คจากชื่อบริษัท (ถ้าเบอร์ไม่ตรง)
                else if (mName && pronesNameMap.has(mName)) {
                    status = 'Registered';
                    pronesRef = pronesNameMap.get(mName);
                }
                // Step 3: เช็คจากความคล้ายของที่อยู่ (ใช้เป็นทางเลือกสุดท้าย)
                else {
                    const similarMatch = pronesRows.find((p: any) => {
                        const pFullAddr = `${p.CUSTOMER_ADDRESS1 || ''} ${p.CUSTOMER_ADDRESS2 || ''} ${p.CUSTOMER_ADDRESS3 || ''}`;
                        return calculateSimilarity(mAddress, pFullAddr) > 0.6; // ปรับ Threshold ตามความเหมาะสม
                    });

                    if (similarMatch) {
                        status = 'Registered';
                        pronesRef = similarMatch;
                    }
                }

                // 4. Return ผลลัพธ์ในรูปแบบข้อมูลฝั่งเรา + สถานะ
                return {
                    company_name: myItem.company_name,
                    address: myItem.address,
                    tel_center: myItem.tel_center,
                    status_check: status,
                    // ข้อมูลอ้างอิงจาก Prones (ถ้า Match เจอ)
                    prones_code: pronesRef ? pronesRef.CUSTOMER_CODE : '-',
                    prones_name_en: pronesRef ? pronesRef.CUSTOMER_NAME : '-'
                };
            });

            // 5. ส่ง JSON กลับ
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
    // getPronesDataAll: async (req: Request, res: Response) => {
    //     // Simple fetch without status check
    //     try {
    //         const dataItem = req.body
    //         const resultData = await FindVendorModel.getPronesData(dataItem)
    //         return res.status(200).json({
    //             Status: true,
    //             ResultOnDb: resultData,
    //             TotalCountOnDb: resultData.length,
    //             MethodOnDb: 'Get Prones Data',
    //             Message: 'Get Data Success'
    //         } as ResponseI)
    //     } catch (error: any) {
    //         console.error('getPronesData error:', error)
    //         return res.status(500).json({
    //             Status: false,
    //             ResultOnDb: [],
    //             TotalCountOnDb: 0,
    //             MethodOnDb: 'Get Prones Data Failed',
    //             Message: error?.message || 'Failed to get prones data'
    //         } as ResponseI)
    //     }
    // }
}


// ------- Helper Functions  -------
const cleanTel = (raw: string) => {
    // เช็ค null/undefined ก่อน ถ้าไม่มีค่าให้คืน string ว่าง
    return raw ? raw.toString().replace(/[^0-9]/g, '') : '';
};

const cleanName = (raw: string) => {
    if (!raw) return '';
    return raw.toString().toLowerCase()
        .replace(/co\.,?ltd\.?/g, '')
        .replace(/limited/g, '')
        .replace(/ltd\.?/g, '')
        .replace(/company/g, '')
        .replace(/part\.,?ltd\.?/g, '')
        .replace(/หจก\./g, '')
        .replace(/บจก\./g, '')
        .replace(/บริษัท/g, '')
        .replace(/\s/g, '')
        .replace(/[^a-z0-9ก-๙]/g, '');
};

const calculateSimilarity = (str1: string, str2: string): number => {
    if (!str1 || !str2) return 0;

    const tokenize = (text: string) => {
        return text.toString().toLowerCase()
            .replace(/[^a-z0-9ก-๙\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 2);
    };

    const tokens1 = tokenize(str1);
    const tokens2 = tokenize(str2);

    let matches = 0;
    const set2 = new Set(tokens2);
    tokens1.forEach(token => { if (set2.has(token)) matches++; });

    const totalTokens = tokens1.length + tokens2.length;
    if (totalTokens === 0) return 0;

    return (2 * matches) / totalTokens;
};