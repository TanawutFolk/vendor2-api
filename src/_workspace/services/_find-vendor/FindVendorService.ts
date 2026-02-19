import { MySQLExecute, OracleExecute } from '@businessData/dbExecute'
import { connection } from '@businessData/db'
import { FindVendorSQL } from '../../sql/_find-vendor/FindVendorSQL'
import { RowDataPacket } from 'mysql2'

export const FindVendorService = {
    // Search vendors with contacts
    searchVendors: async (dataItem: any, sqlWhere: string = '') => {
        // Check for Global Search
        const globalSearchFilter = dataItem.SearchFilters?.find((item: any) => item.id === 'global_search')
        if (globalSearchFilter?.value) {
            sqlWhere += FindVendorSQL.generateGlobalSearchSql(globalSearchFilter.value)
        }

        // Get SQL queries [countSql, dataSql]
        const sqlList = await FindVendorSQL.search(dataItem, sqlWhere)

        // Execute count query
        const countResult = (await MySQLExecute.search(sqlList[0])) as RowDataPacket[]
        const totalCount = countResult[0]?.TOTAL_COUNT || 0

        // Execute data query
        const resultData = (await MySQLExecute.search(sqlList[1])) as RowDataPacket[]

        return {
            resultData,
            totalCount
        }
    },

    // Get vendor by ID
    getById: async (vendor_id: number) => {
        const sql = await FindVendorSQL.getById(vendor_id)
        const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
        return resultData
    },

    // Update vendor
    updateVendor: async (dataItem: any) => {
        // Update vendor ONLY if company_name is provided (means vendor update)
        if (dataItem.company_name !== undefined) {
            const vendorSql = await FindVendorSQL.updateVendor(dataItem)
            await MySQLExecute.execute(vendorSql)
        }

        // Contact Logic
        if (dataItem.vendor_contact_id) {
            // Update Existing Contact
            const contactSql = await FindVendorSQL.updateVendorContact(dataItem)
            await MySQLExecute.execute(contactSql)
        } else if (dataItem.vendor_id && (dataItem.contact_name !== undefined || dataItem.email !== undefined)) {
            // Create New Contact
            const contactCreateSql = await FindVendorSQL.createVendorContact(dataItem)
            await MySQLExecute.execute(contactCreateSql)
        }

        // Product Logic
        if (dataItem.vendor_product_id) {
            // Update Existing Product
            const productSql = await FindVendorSQL.updateVendorProduct(dataItem)
            await MySQLExecute.execute(productSql)
        } else if (dataItem.vendor_id && (dataItem.product_name !== undefined || dataItem.maker_name !== undefined)) {
            // Create New Product
            const productCreateSql = await FindVendorSQL.createVendorProduct(dataItem)
            await MySQLExecute.execute(productCreateSql)
        }

        return dataItem
    },

    // Delete vendor contact
    deleteVendorContact: async (dataItem: any) => {
        const sql = await FindVendorSQL.deleteVendorContact(dataItem)
        await MySQLExecute.execute(sql)
        return true
    },

    // Delete vendor product
    deleteVendorProduct: async (dataItem: any) => {
        const sql = await FindVendorSQL.deleteVendorProduct(dataItem)
        await MySQLExecute.execute(sql)
        return true
    },

    // Get vendor types
    getVendorTypes: async () => {
        const sql = await FindVendorSQL.getVendorTypes()
        const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
        return resultData
    },

    // Get provinces
    getProvinces: async () => {
        const sql = await FindVendorSQL.getProvinces()
        const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
        return resultData
    },

    // Get product groups
    getProductGroups: async () => {
        const sql = await FindVendorSQL.getProductGroups()
        const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
        return resultData
    },

    // Search all vendors for export (no pagination)
    searchAllForExport: async (dataItem: any, sqlWhere: string = '') => {
        // Check for Global Search
        const globalSearchFilter = dataItem.SearchFilters?.find((item: any) => item.id === 'global_search')
        if (globalSearchFilter?.value) {
            sqlWhere += FindVendorSQL.generateGlobalSearchSql(globalSearchFilter.value)
        }

        const sql = await FindVendorSQL.searchAllForExport(dataItem, sqlWhere)
        const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
        return resultData
    },

    // Stream all vendors for export
    streamAllForExport: async (dataItem: any, sqlWhere: string = '') => {
        // Check for Global Search
        const globalSearchFilter = dataItem.SearchFilters?.find((item: any) => item.id === 'global_search')
        if (globalSearchFilter?.value) {
            sqlWhere += FindVendorSQL.generateGlobalSearchSql(globalSearchFilter.value)
        }

        const sql = await FindVendorSQL.searchAllForExport(dataItem, sqlWhere)

        const conn = await connection()
        // Access the underlying raw connection from the promise wrapper
        const rawConn = (conn as any).connection

        return {
            stream: rawConn.query(sql).stream(),
            connection: conn
        }
    },


    // Get prones data
    getPronesData: async () => {
        const sql = await FindVendorSQL.getPronesData()
        const resultData = (await OracleExecute.searchOracle(sql, 'PRONES')) as RowDataPacket[]
        return resultData
    },

    // Get all vendor names
    getAllVendorNames: async () => {
        const sql = await FindVendorSQL.getAllVendorNames()
        const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
        return resultData
    },

    // Sync Prones data from Oracle → MySQL staging_prones_data
    syncPronesToStaging: async () => {
        // Step 1: SELECT from Oracle
        const sql = FindVendorSQL.getPronesData()
        const oracleResult = (await OracleExecute.searchOracle(sql, 'PRONES')) as any
        const rows = oracleResult?.rows || []

        if (rows.length === 0) {
            console.log('[Prones Sync] No data from Oracle, skipping.')
            return { synced: 0 }
        }

        // Step 2: Truncate staging table
        await MySQLExecute.execute(FindVendorSQL.truncateStagingPrones())

        // Step 3: Batch insert (500 rows per batch)
        const batchSize = 500
        for (let i = 0; i < rows.length; i += batchSize) {
            const batch = rows.slice(i, i + batchSize)
            const insertSql = FindVendorSQL.insertStagingPronesBatch(batch)
            await MySQLExecute.execute(insertSql)
        }

        console.log(`[Prones Sync] Synced ${rows.length} rows to staging_prones_data`)
        return { synced: rows.length }
    },

    // Run vendor matching: staging_prones_data × vendors → vendor_match_result (2 of 3 logic)
    runVendorMatching: async () => {
        // 1. Read staging prones data (MySQL)
        const pronesRows = (await MySQLExecute.search(FindVendorSQL.getStagingPronesData())) as any[]

        if (pronesRows.length === 0) {
            console.log('[Vendor Match] No staging prones data, skipping.')
            return { matched: 0 }
        }

        // 2. Read vendors
        const vendors = (await MySQLExecute.search(FindVendorSQL.getVendorsForMatch())) as any[]

        // 3. Build index maps for O(1) lookup
        const pronesTelMap = new Map<string, any>()
        const pronesNameMap = new Map<string, any>()

        pronesRows.forEach((p: any) => {
            const pTel = cleanTel(p.customer_tel)
            const pName = cleanName(p.customer_name)
            if (pTel) pronesTelMap.set(pTel, p)
            if (pName) pronesNameMap.set(pName, p)
        })

        // 4. Match each vendor (2-of-3 logic — ต้องเป็น Prones record ตัวเดียวกัน)
        const matchResults: any[] = []

        for (const vendor of vendors) {
            const mTel = cleanTel(vendor.tel_center)
            const mName = cleanName(vendor.company_name)
            const mAddress = vendor.address || ''

            let bestScore = 0
            let bestMethods: string[] = []
            let bestPronesRef: any = null

            // Loop ทุก Prones record → เช็ค 3 เงื่อนไขกับ record เดียวกัน
            for (const prones of pronesRows) {
                let score = 0
                const methods: string[] = []

                // Check 1: Name match
                const pName = cleanName(prones.customer_name)
                if (mName && pName && mName === pName) {
                    score++
                    methods.push('name')
                }

                // Check 2: Tel match
                const pTel = cleanTel(prones.customer_tel)
                if (mTel && pTel && mTel === pTel) {
                    score++
                    methods.push('tel')
                }

                // Check 3: Address fuzzy match
                if (mAddress) {
                    const pFullAddr = `${prones.customer_address1 || ''} ${prones.customer_address2 || ''} ${prones.customer_address3 || ''}`
                    if (calculateSimilarity(mAddress, pFullAddr) > 0.7) {
                        score++
                        methods.push('address')
                    }
                }

                // เก็บ record ที่ score สูงสุด
                if (score > bestScore) {
                    bestScore = score
                    bestMethods = methods
                    bestPronesRef = prones
                }

                // ถ้าได้ 3/3 แล้วไม่ต้องหาต่อ
                if (bestScore === 3) break
            }

            // 2 of 3 = Registered (ต้องมาจาก record เดียวกัน)
            const status_check = bestScore >= 2 ? 'Registered' : 'Not Registered'

            matchResults.push({
                vendor_id: vendor.vendor_id,
                status_check,
                prones_code: bestPronesRef ? bestPronesRef.customer_code : '',
                prones_name: bestPronesRef ? bestPronesRef.customer_name : '',
                match_method: bestMethods.join('+') || 'none',
            })
        }

        // 5. Truncate + Batch insert results
        await MySQLExecute.execute(FindVendorSQL.truncateMatchResult())

        const batchSize = 500
        for (let i = 0; i < matchResults.length; i += batchSize) {
            const batch = matchResults.slice(i, i + batchSize)
            const insertSql = FindVendorSQL.insertMatchResultBatch(batch)
            await MySQLExecute.execute(insertSql)
        }

        const registered = matchResults.filter(r => r.status_check === 'Registered').length
        console.log(`[Vendor Match] Done — ${matchResults.length} vendors checked, ${registered} registered`)
        return { total: matchResults.length, registered }
    },

    // Get all match results (for API usage)
    getMatchResults: async () => {
        const sql = FindVendorSQL.getAllMatchResults()
        const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
        return resultData
    },

    // Get match results by vendor IDs
    getMatchResultsByVendorIds: async (vendorIds: number[]) => {
        if (vendorIds.length === 0) return []
        const sql = FindVendorSQL.getMatchResultByVendorIds(vendorIds)
        const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
        return resultData
    },
}

// ------- Helper Functions -------
const cleanTel = (raw: string) => {
    return raw ? raw.toString().replace(/[^0-9]/g, '') : ''
}

const cleanName = (raw: string) => {
    if (!raw) return ''
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
        .replace(/[^a-z0-9ก-๙]/g, '')
}

const calculateSimilarity = (str1: string, str2: string): number => {
    if (!str1 || !str2) return 0

    const tokenize = (text: string) => {
        return text.toString().toLowerCase()
            .replace(/[^a-z0-9ก-๙\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 2)
    }

    const tokens1 = tokenize(str1)
    const tokens2 = tokenize(str2)

    let matches = 0
    const set2 = new Set(tokens2)
    tokens1.forEach(token => { if (set2.has(token)) matches++ })

    const totalTokens = tokens1.length + tokens2.length
    if (totalTokens === 0) return 0

    return (2 * matches) / totalTokens
}

