import { MySQLExecute, OracleExecute } from '@businessData/dbExecute'
import { connection } from '@businessData/db'
import { FindVendorSQL } from '../../sql/_find-vendor/FindVendorSQL'
import { RowDataPacket } from 'mysql2'

export const FindVendorService = {
  // Search vendors with contacts
  searchVendors: async (dataItem: any) => {
    let sqlWhere = dataItem.SQLWHERE || ''

    // Handle Global Search inside Service to match Bom pattern style
    const globalSearchFilter = dataItem.SEARCHFILTERS?.find((item: any) => item.id === 'global_search')
    if (globalSearchFilter?.value) {
      sqlWhere += FindVendorSQL.generateGlobalSearchSql({ SEARCHKEYWORD: globalSearchFilter.value })
    }

    // Get SQL queries [countSql, dataSql]
    const sqlList = await FindVendorSQL.search(dataItem, sqlWhere)

    // Execute queries via searchList for better structural consistency
    const result = (await MySQLExecute.searchList(sqlList)) as any[][]

    return {
      resultData: result[1] || [],
      totalCount: result[0]?.[0]?.TOTAL_COUNT || 0,
    }
  },

  // Get vendor by ID
  getById: async (dataItem: any) => {
    const sql = await FindVendorSQL.getById(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },

  // Update vendor
  updateVendor: async (dataItem: any) => {
    try {
      const sqlList = []

      // Update vendor main table
      if (dataItem.COMPANY_NAME !== undefined) {
        sqlList.push(await FindVendorSQL.updateVendor(dataItem))
      }

      // Contact Logic
      if (dataItem.VENDOR_CONTACTS_ID) {
        sqlList.push(await FindVendorSQL.updateVendorContact(dataItem))
      } else if (dataItem.VENDORS_ID && (dataItem.CONTACT_NAME !== undefined || dataItem.EMAIL !== undefined)) {
        sqlList.push(await FindVendorSQL.createVendorContact(dataItem))
      }

      // Product Logic
      if (dataItem.VENDOR_PRODUCTS_ID) {
        sqlList.push(await FindVendorSQL.updateVendorProduct(dataItem))
      } else if (dataItem.VENDORS_ID && (dataItem.PRODUCT_NAME !== undefined || dataItem.MAKER_NAME !== undefined)) {
        sqlList.push(await FindVendorSQL.createVendorProduct(dataItem))
      }

      let resultData = null
      if (sqlList.length > 0) {
        resultData = await MySQLExecute.executeList(sqlList)
      }

      return {
        Status: true,
        Message: 'Update Success',
        ResultOnDb: resultData,
        MethodOnDb: 'Update Vendor',
        TotalCountOnDb: sqlList.length,
      }
    } catch (error: any) {
      console.error('Error in FindVendorService.updateVendor:', error)
      return {
        Status: false,
        Message: error?.message || 'Update Failed',
        ResultOnDb: [],
        MethodOnDb: 'Update Vendor Failed',
        TotalCountOnDb: 0,
      }
    }
  },

  updateVendorComprehensive: async (dataItem: any) => {
    try {
      const vendorId = Number(dataItem.VENDORS_ID) || 0
      if (!vendorId) throw new Error('Invalid vendor_id')

      const updateBy = dataItem.UPDATE_BY || 'SYSTEM'
      const sqlList = []
      const vendor = dataItem.VENDOR || {}

      if (dataItem.VENDOR_CHANGED !== false) {
        sqlList.push(await FindVendorSQL.updateVendor({
          VENDORS_ID: vendorId,
          COMPANY_NAME: vendor.COMPANY_NAME || '',
          MASTER_VENDOR_TYPES_ID: vendor.MASTER_VENDOR_TYPES_ID ?? null,
          VENDOR_REGION: vendor.VENDOR_REGION || 'Local',
          PROVINCE: vendor.PROVINCE || '',
          POSTAL_CODE: vendor.POSTAL_CODE || '',
          COUNTRY: vendor.COUNTRY || '',
          WEBSITE: vendor.WEBSITE || '',
          ADDRESS: vendor.ADDRESS || '',
          TEL_CENTER: vendor.TEL_CENTER || '',
          EMAILMAIN: vendor.EMAILMAIN || '',
          INUSE: vendor.INUSE !== undefined && vendor.INUSE !== null ? vendor.INUSE : 1,
          UPDATE_BY: updateBy,
        }))
      }

      for (const contact of dataItem.CONTACTS || []) {
        const payload = {
          VENDORS_ID: vendorId,
          VENDOR_CONTACTS_ID: contact.VENDOR_CONTACTS_ID,
          CONTACT_NAME: contact.CONTACT_NAME || '',
          TEL_PHONE: contact.TEL_PHONE || '',
          EMAIL: contact.EMAIL || '',
          POSITION: contact.POSITION || '',
          UPDATE_BY: updateBy,
        }
        if (contact.VENDOR_CONTACTS_ID) {
          sqlList.push(await FindVendorSQL.updateVendorContact(payload))
        } else if (payload.CONTACT_NAME || payload.EMAIL || payload.TEL_PHONE || payload.POSITION) {
          sqlList.push(await FindVendorSQL.createVendorContact(payload))
        }
      }

      for (const product of dataItem.PRODUCTS || []) {
        const payload = {
          VENDORS_ID: vendorId,
          VENDOR_PRODUCTS_ID: product.VENDOR_PRODUCTS_ID,
          MASTER_PRODUCT_GROUPS_ID: product.MASTER_PRODUCT_GROUPS_ID || 0,
          MAKER_NAME: product.MAKER_NAME || '',
          PRODUCT_NAME: product.PRODUCT_NAME || '',
          MODEL_LIST: product.MODEL_LIST || '',
          UPDATE_BY: updateBy,
        }
        if (product.VENDOR_PRODUCTS_ID) {
          sqlList.push(await FindVendorSQL.updateVendorProduct(payload))
        } else if (payload.PRODUCT_NAME || payload.MAKER_NAME || payload.MODEL_LIST || payload.MASTER_PRODUCT_GROUPS_ID) {
          sqlList.push(await FindVendorSQL.createVendorProduct(payload))
        }
      }

      for (const contactId of dataItem.DELETED_CONTACT_IDS || []) {
        sqlList.push(await FindVendorSQL.deleteVendorContact({
          VENDOR_CONTACTS_ID: contactId,
          UPDATE_BY: updateBy,
        }))
      }

      for (const productId of dataItem.DELETED_PRODUCT_IDS || []) {
        sqlList.push(await FindVendorSQL.deleteVendorProduct({
          VENDOR_PRODUCTS_ID: productId,
          UPDATE_BY: updateBy,
        }))
      }

      const resultData = sqlList.length > 0 ? await MySQLExecute.executeList(sqlList) : []

      return {
        Status: true,
        Message: 'Update Vendor Success',
        ResultOnDb: resultData,
        MethodOnDb: 'Update Vendor Comprehensive',
        TotalCountOnDb: sqlList.length,
      }
    } catch (error: any) {
      console.error('Error in FindVendorService.updateVendorComprehensive:', error)
      return {
        Status: false,
        Message: error?.message || 'Update Failed',
        ResultOnDb: [],
        MethodOnDb: 'Update Vendor Comprehensive Failed',
        TotalCountOnDb: 0,
      }
    }
  },

  deleteVendor: async (dataItem: any) => {
    try {
      const sql = await FindVendorSQL.deleteVendor(dataItem)
      const resultData = await MySQLExecute.execute(sql)
      return {
        Status: true,
        Message: 'Delete Vendor Success',
        ResultOnDb: resultData,
        MethodOnDb: 'Delete Vendor',
        TotalCountOnDb: 1,
      }
    } catch (error: any) {
      return {
        Status: false,
        Message: error?.message || 'Delete Vendor Failed',
        ResultOnDb: [],
        MethodOnDb: 'Delete Vendor Failed',
        TotalCountOnDb: 0,
      }
    }
  },

  // Delete vendor contact
  deleteVendorContact: async (dataItem: any) => {
    try {
      const sql = await FindVendorSQL.deleteVendorContact(dataItem)
      const resultData = await MySQLExecute.execute(sql)
      return {
        Status: true,
        Message: 'Delete Success',
        ResultOnDb: resultData,
        MethodOnDb: 'Delete Vendor Contact',
        TotalCountOnDb: 1,
      }
    } catch (error: any) {
      return {
        Status: false,
        Message: error?.message || 'Delete Failed',
        ResultOnDb: [],
        MethodOnDb: 'Delete Vendor Contact Failed',
        TotalCountOnDb: 0,
      }
    }
  },

  // Delete vendor product
  deleteVendorProduct: async (dataItem: any) => {
    try {
      const sql = await FindVendorSQL.deleteVendorProduct(dataItem)
      const resultData = await MySQLExecute.execute(sql)
      return {
        Status: true,
        Message: 'Delete Success',
        ResultOnDb: resultData,
        MethodOnDb: 'Delete Vendor Product',
        TotalCountOnDb: 1,
      }
    } catch (error: any) {
      return {
        Status: false,
        Message: error?.message || 'Delete Failed',
        ResultOnDb: [],
        MethodOnDb: 'Delete Vendor Product Failed',
        TotalCountOnDb: 0,
      }
    }
  },

  // Get vendor business category names
  getVendorBusinessCategoryName: async (dataItem: any) => {
    const sql = await FindVendorSQL.getVendorBusinessCategoryName(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },

  getVendorTypes: async (dataItem: any) => FindVendorService.getVendorBusinessCategoryName(dataItem),

  // Get provinces
  getProvinces: async (dataItem: any) => {
    const sql = await FindVendorSQL.getProvinces(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },

  // Get product groups
  getProductGroups: async (dataItem: any) => {
    const sql = await FindVendorSQL.getProductGroups(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },

  // Search all vendors for export
  searchAllForExport: async (dataItem: any) => {
    let sqlWhere = dataItem.SQLWHERE || ''
    const globalSearchFilter = dataItem.SEARCHFILTERS?.find((item: any) => item.id === 'global_search')
    if (globalSearchFilter?.value) {
      sqlWhere += FindVendorSQL.generateGlobalSearchSql({ SEARCHKEYWORD: globalSearchFilter.value })
    }

    const sql = await FindVendorSQL.searchAllForExport(dataItem, sqlWhere)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },

  // Get prones data (Oracle)
  getPronesData: async (dataItem: any) => {
    const sql = await FindVendorSQL.getPronesData(dataItem)
    const resultData = (await OracleExecute.searchOracle(sql, 'PRONES')) as RowDataPacket[]
    return resultData
  },

  // Get prones raw data for testing (Oracle)
  getPronesRawTest: async (dataItem: any) => {
    const sql = await FindVendorSQL.getPronesRawTest(dataItem)
    const resultData = (await OracleExecute.searchOracle(sql, 'PRONES')) as RowDataPacket[]
    return resultData
  },

  // Get all vendor names
  getAllVendorNames: async (dataItem: any) => {
    const sql = await FindVendorSQL.getAllVendorNames(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },

  // Sync Prones data
  syncPronesToStaging: async (dataItem: any) => {
    try {
      // Step 1: SELECT from Oracle
      const oracleSql = await FindVendorSQL.getPronesData(dataItem)
      const oracleResult = (await OracleExecute.searchOracle(oracleSql, 'PRONES')) as any
      const rows = oracleResult?.rows || []

      if (rows.length === 0) {
        return {
          Status: true,
          Message: 'No data to sync',
          ResultOnDb: { synced: 0 },
          MethodOnDb: 'Sync Prones To Staging',
          TotalCountOnDb: 0,
        }
      }

      // Step 2: Truncate and Batch insert
      const sqlList = []
      sqlList.push(await FindVendorSQL.truncateStagingPrones(dataItem))

      const batchSize = 500
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize)
        sqlList.push(await FindVendorSQL.insertStagingPronesBatch(batch))
      }

      const resultData = await MySQLExecute.executeList(sqlList)

      return {
        Status: true,
        Message: `Synced ${rows.length} rows successfully`,
        ResultOnDb: resultData,
        MethodOnDb: 'Sync Prones To Staging',
        TotalCountOnDb: rows.length,
      }
    } catch (error: any) {
      console.error('Error in FindVendorService.syncPronesToStaging:', error)
      return {
        Status: false,
        Message: error?.message || 'Sync Failed',
        ResultOnDb: [],
        MethodOnDb: 'Sync Prones To Staging Failed',
        TotalCountOnDb: 0,
      }
    }
  },

  // Run matching
  runVendorMatching: async (dataItem: any) => {
    try {
      // 1. Read staging prones data
      const pronesRows = (await MySQLExecute.search(await FindVendorSQL.getStagingPronesData(dataItem))) as any[]
      if (pronesRows.length === 0) throw new Error('No staging data found')

      // 2. Read vendors
      const vendors = (await MySQLExecute.search(await FindVendorSQL.getVendorsForMatch(dataItem))) as any[]

      // 3. Match Logic (Simplified for Service context)
      const matchResults: any[] = []
      // ... (I'll keep the logic implementation same as before for correctness but wrap it)
      // [Omitting full logic for brevity, assuming same as original but matching standard returns]
      // Actually I must include it to ensure it remains functional.

      // --- Matching Logic Block ---
      const cleanTel = (raw: string) => (raw ? raw.toString().replace(/[^0-9]/g, '') : '')
      const cleanName = (raw: string) => {
        if (!raw) return ''
        return raw
          .toString()
          .toLowerCase()
          .replace(/co\.,?ltd\.?/g, '')
          .replace(/limited/g, '')
          .replace(/ltd\.?/g, '')
          .replace(/company/g, '')
          .replace(/part\.,?ltd\.?/g, '')
          .replace(/Ã Â¸Â«Ã Â¸Ë†Ã Â¸Â\./g, '')
          .replace(/Ã Â¸Å¡Ã Â¸Ë†Ã Â¸Â\./g, '')
          .replace(/Ã Â¸Å¡Ã Â¸Â£Ã Â¸Â´Ã Â¸Â©Ã Â¸Â±Ã Â¸â€”/g, '')
          .replace(/\s/g, '')
          .replace(/[^a-z0-9Ã Â¸Â-Ã Â¹â„¢]/g, '')
      }
      const calculateSimilarity = (str1: string, str2: string): number => {
        if (!str1 || !str2) return 0
        const tokenize = (text: string) =>
          text
            .toString()
            .toLowerCase()
            .replace(/[^a-z0-9Ã Â¸Â-Ã Â¹â„¢\s]/g, ' ')
            .split(/\s+/)
            .filter((w) => w.length > 2)
        const tokens1 = tokenize(str1),
          tokens2 = tokenize(str2)
        let matches = 0
        const set2 = new Set(tokens2)
        tokens1.forEach((token) => {
          if (set2.has(token)) matches++
        })
        const totalTokens = tokens1.length + tokens2.length
        return totalTokens === 0 ? 0 : (2 * matches) / totalTokens
      }

      for (const vendor of vendors) {
        const mTel = cleanTel(vendor.TEL_CENTER),
          mName = cleanName(vendor.COMPANY_NAME),
          mAddress = vendor.ADDRESS || ''
        let bestScore = 0,
          bestMethods: string[] = [],
          bestPronesRef: any = null
        for (const prones of pronesRows) {
          let score = 0,
            methods: string[] = []
          if (mName && cleanName(prones.CUSTOMER_NAME) === mName) {
            score++
            methods.push('name')
          }
          if (mTel && cleanTel(prones.CUSTOMER_TEL) === mTel) {
            score++
            methods.push('tel')
          }
          if (mAddress) {
            const pFullAddr = `${prones.CUSTOMER_ADDRESS1 || ''} ${prones.CUSTOMER_ADDRESS2 || ''} ${prones.CUSTOMER_ADDRESS3 || ''}`
            if (calculateSimilarity(mAddress, pFullAddr) > 0.7) {
              score++
              methods.push('address')
            }
          }
          if (score > bestScore) {
            bestScore = score
            bestMethods = methods
            bestPronesRef = prones
          }
          if (bestScore === 3) break
        }
        matchResults.push({
          VENDORS_ID: vendor.VENDORS_ID,
          STATUS_CHECK: bestScore >= 2 ? 'Registered' : 'Not Registered',
          PRONES_CODE: bestPronesRef ? bestPronesRef.CUSTOMER_CODE : '',
          PRONES_NAME: bestPronesRef ? bestPronesRef.CUSTOMER_NAME : '',
          MATCH_METHOD: bestMethods.join('+') || 'none',
        })
      }

      // 4. Truncate + Batch insert
      const sqlList = []
      sqlList.push(await FindVendorSQL.truncateMatchResult(dataItem))
      const batchSize = 500
      for (let i = 0; i < matchResults.length; i += batchSize) {
        const batch = matchResults.slice(i, i + batchSize)
        sqlList.push(await FindVendorSQL.insertMatchResultBatch(batch))
      }

      const resultData = await MySQLExecute.executeList(sqlList)
      return {
        Status: true,
        Message: 'Matching completed successfully',
        ResultOnDb: resultData,
        MethodOnDb: 'Run Vendor Matching',
        TotalCountOnDb: matchResults.length,
      }
    } catch (error: any) {
      console.error('Error in FindVendorService.runVendorMatching:', error)
      return {
        Status: false,
        Message: error?.message || 'Matching Failed',
        ResultOnDb: [],
        MethodOnDb: 'Run Vendor Matching Failed',
        TotalCountOnDb: 0,
      }
    }
  },

  // Get matching results
  getMatchResults: async (dataItem: any) => {
    const sql = await FindVendorSQL.getAllMatchResults(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },

  // Get match results by vendor IDs
  getMatchResultsByVendorIds: async (dataItem: any) => {
    if (!dataItem.VENDORIDS || dataItem.VENDORIDS.length === 0) return []
    const sql = await FindVendorSQL.getMatchResultByVendorIds(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
}
