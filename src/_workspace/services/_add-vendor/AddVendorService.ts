import { MySQLExecute } from '@businessData/dbExecute'
import { AddVendorSQL } from '@src/_workspace/sql/_add-vendor/AddVendorSQL'
import { BlacklistSQL } from '@src/_workspace/sql/_black-list/BlacklistSQL'
import { normalizeName } from '@src/_workspace/services/_black-list/BlacklistUtils'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

export const AddVendorService = {
  checkBlacklist: async (dataItem: any) => {
    const companyName = String(dataItem.company_name || '').trim()
    const normalizedName = normalizeName(companyName)
    const blacklistResult = normalizedName ? ((await MySQLExecute.search(BlacklistSQL.checkBlacklist(normalizedName))) as RowDataPacket[]) : []

    return {
      Status: true,
      isBlacklisted: blacklistResult.length > 0,
      blacklistMatches: blacklistResult,
      Message: blacklistResult.length > 0 ? `Vendor name matches ${blacklistResult.length} record(s) in the Blacklist` : 'No blacklist match found',
      ResultOnDb: blacklistResult,
      TotalCountOnDb: blacklistResult.length,
    }
  },

  // Check if vendor already exists + check against blacklist
  checkDuplicateVendor: async (dataItem: any) => {
    const companyName = String(dataItem.company_name || '').trim()
    const normalizedName = normalizeName(companyName)

    // Run both checks in parallel
    const [duplicateResult, blacklistResult] = await Promise.all([
      MySQLExecute.search(await AddVendorSQL.checkDuplicateVendor(dataItem)) as Promise<RowDataPacket[]>,
      normalizedName ? (MySQLExecute.search(BlacklistSQL.checkBlacklist(normalizedName)) as Promise<RowDataPacket[]>) : Promise.resolve([] as RowDataPacket[]),
    ])

    const isDuplicate = duplicateResult.length > 0
    const isBlacklisted = blacklistResult.length > 0

    if (isDuplicate) {
      return {
        Status: true,
        isDuplicate: true,
        existingVendorId: duplicateResult[0].vendor_id,
        isBlacklisted,
        blacklistMatches: blacklistResult,
        Message: 'Vendor already exists in the system',
      }
    }

    if (isBlacklisted) {
      return {
        Status: true,
        isDuplicate: false,
        existingVendorId: null,
        isBlacklisted: true,
        blacklistMatches: blacklistResult,
        Message: `Vendor name matches ${blacklistResult.length} record(s) in the Blacklist`,
      }
    }

    return {
      Status: true,
      isDuplicate: false,
      existingVendorId: null,
      isBlacklisted: false,
      blacklistMatches: [],
      Message: 'Vendor is available for registration',
    }
  },

  // Create vendor with contacts and products
  createVendor: async (dataItem: any) => {
    try {
      // Step 1: Check duplicate first
      const checkResult = await AddVendorService.checkDuplicateVendor(dataItem)

      if (checkResult.isDuplicate) {
        return {
          Status: false,
          Message: `Vendor already exists! (ID: ${checkResult.existingVendorId})`,
          ResultOnDb: [],
          MethodOnDb: 'Create Vendor Failed',
          TotalCountOnDb: 0,
        }
      }

      if (checkResult.isBlacklisted) {
        return {
          Status: false,
          Message: checkResult.Message || 'Vendor is blacklisted and cannot be registered',
          ResultOnDb: checkResult.blacklistMatches || [],
          MethodOnDb: 'Create Vendor Failed',
          TotalCountOnDb: checkResult.blacklistMatches?.length || 0,
        }
      }

      // Step 2: Insert main vendor
      const sqlCreateVendor = await AddVendorSQL.createVendor(dataItem)
      const resultVendor = (await MySQLExecute.execute(sqlCreateVendor)) as ResultSetHeader

      if (!resultVendor.insertId) {
        return {
          Status: false,
          Message: 'Failed to create vendor',
          ResultOnDb: [],
          MethodOnDb: 'Create Vendor Failed',
          TotalCountOnDb: 0,
        }
      }

      const vendorId = resultVendor.insertId
      const sqlList = []

      // Step 3: Prepare contacts
      if (dataItem.contacts && Array.isArray(dataItem.contacts)) {
        for (const contact of dataItem.contacts) {
          const contactData = {
            ...contact,
            vendor_id: vendorId,
            CREATE_BY: dataItem.CREATE_BY,
          }
          sqlList.push(await AddVendorSQL.createVendorContact(contactData))
        }
      }

      // Step 4: Prepare products
      if (dataItem.products && Array.isArray(dataItem.products)) {
        for (const product of dataItem.products) {
          const productData = {
            ...product,
            vendor_id: vendorId,
            CREATE_BY: dataItem.CREATE_BY,
          }
          sqlList.push(await AddVendorSQL.createVendorProduct(productData))
        }
      }

      // Step 5: Execute sub-queries
      let resultData = null
      if (sqlList.length > 0) {
        resultData = await MySQLExecute.executeList(sqlList)
      }

      return {
        Status: true,
        Message: 'บันทึกข้อมูลเรียบร้อยแล้ว Data has been saved successfully',
        ResultOnDb: { vendorId, subQueries: resultData },
        MethodOnDb: 'Create Vendor Success',
        TotalCountOnDb: 1,
      }
    } catch (error: any) {
      console.error('Error in AddVendorService.createVendor:', error)
      return {
        Status: false,
        Message: error?.message || 'Failed to create vendor',
        ResultOnDb: [],
        MethodOnDb: 'Create Vendor Failed',
        TotalCountOnDb: 0,
      }
    }
  },

  // Get vendor types for dropdown
  getVendorTypes: async (dataItem: any) => {
    const sql = await AddVendorSQL.getVendorTypes(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },

  // Get product groups for dropdown
  getProductGroups: async (dataItem: any) => {
    const sql = await AddVendorSQL.getProductGroups(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },

  // Create new product group
  createProductGroup: async (dataItem: any) => {
    try {
      // Check duplicate first
      const checkSql = await AddVendorSQL.checkDuplicateProductGroup(dataItem)
      const checkResult = (await MySQLExecute.search(checkSql)) as RowDataPacket[]

      if (checkResult.length > 0) {
        return {
          Status: false,
          Message: 'Product Group already exists!',
          ResultOnDb: [],
          MethodOnDb: 'Create Product Group Failed',
          TotalCountOnDb: 0,
        }
      }

      // Insert new product group
      const sql = await AddVendorSQL.createProductGroup(dataItem)
      const resultData = (await MySQLExecute.execute(sql)) as ResultSetHeader

      if (resultData.insertId) {
        return {
          Status: true,
          Message: 'Data has been saved successfully',
          ResultOnDb: { product_group_id: resultData.insertId },
          MethodOnDb: 'Create Product Group Success',
          TotalCountOnDb: 1,
        }
      }

      return {
        Status: false,
        Message: 'Failed to create product group',
        ResultOnDb: [],
        MethodOnDb: 'Create Product Group Failed',
        TotalCountOnDb: 0,
      }
    } catch (error: any) {
      console.error('Error in AddVendorService.createProductGroup:', error)
      return {
        Status: false,
        Message: error?.message || 'Failed to create product group',
        ResultOnDb: [],
        MethodOnDb: 'Create Product Group Failed',
        TotalCountOnDb: 0,
      }
    }
  },
}
