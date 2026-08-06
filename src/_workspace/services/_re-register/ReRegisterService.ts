import { MySQLExecute, OracleExecute } from '@businessData/dbExecute'
import { ReRegisterSQL } from '../../sql/_re-register/ReRegisterSQL'
import { RowDataPacket } from 'mysql2'
import { mapVendorDetailRow } from '../Common/VendorDetailMapper'
import { prepareVendorSearchData } from '../Common/VendorSearchData'

export const ReRegisterService = {
  // Search vendors with contacts
  searchVendors: async (dataItem: any) => {
    prepareVendorSearchData(dataItem)
    let sqlWhere = dataItem.SQLWHERE || ''

    // Handle Global Search inside Service to match Bom pattern style
    const globalSearchFilter = dataItem.SEARCHFILTERS?.find((item: any) => item.id === 'global_search')
    if (globalSearchFilter?.value) {
      sqlWhere += ReRegisterSQL.generateGlobalSearchSql({ SEARCHKEYWORD: globalSearchFilter.value })
    }

    // Get SQL queries [countSql, dataSql]
    const sqlList = await ReRegisterSQL.search(dataItem, sqlWhere)

    // Execute queries via searchList for better structural consistency
    const result = (await MySQLExecute.searchList(sqlList)) as any[][]

    return {
      resultData: result[1] || [],
      totalCount: result[0]?.[0]?.TOTAL_COUNT || 0,
    }
  },

  // Shared query implementation behind each page-owned vendor detail endpoint.
  getVendorDetail: async (dataItem: any) => {
    const sql = await ReRegisterSQL.getVendorDetail(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData.length > 0 ? mapVendorDetailRow(resultData[0]) : null
  },

  // Update vendor
  updateVendor: async (dataItem: any) => {
    try {
      const sqlList = []

      // Update vendor main table
      if (dataItem.COMPANY_NAME !== undefined) {
        sqlList.push(await ReRegisterSQL.updateVendor(dataItem))
      }

      // Contact Logic
      if (dataItem.VENDOR_CONTACTS_ID) {
        sqlList.push(await ReRegisterSQL.updateVendorContact(dataItem))
      } else if (dataItem.VENDORS_ID && (dataItem.CONTACT_NAME !== undefined || dataItem.EMAIL !== undefined)) {
        sqlList.push(await ReRegisterSQL.createVendorContact(dataItem))
      }

      // Product Logic
      if (dataItem.VENDOR_PRODUCTS_ID) {
        sqlList.push(await ReRegisterSQL.updateVendorProduct(dataItem))
      } else if (dataItem.VENDORS_ID && (dataItem.PRODUCT_NAME !== undefined || dataItem.MAKER_NAME !== undefined)) {
        sqlList.push(await ReRegisterSQL.createVendorProduct(dataItem))
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
      // console.error('Error in ReRegisterService.updateVendor:', error)
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
        sqlList.push(await ReRegisterSQL.updateVendor({
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
          sqlList.push(await ReRegisterSQL.updateVendorContact(payload))
        } else if (payload.CONTACT_NAME || payload.EMAIL || payload.TEL_PHONE || payload.POSITION) {
          sqlList.push(await ReRegisterSQL.createVendorContact(payload))
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
          sqlList.push(await ReRegisterSQL.updateVendorProduct(payload))
        } else if (payload.PRODUCT_NAME || payload.MAKER_NAME || payload.MODEL_LIST || payload.MASTER_PRODUCT_GROUPS_ID) {
          sqlList.push(await ReRegisterSQL.createVendorProduct(payload))
        }
      }

      for (const contactId of dataItem.DELETED_CONTACT_IDS || []) {
        sqlList.push(await ReRegisterSQL.deleteVendorContact({
          VENDOR_CONTACTS_ID: contactId,
          UPDATE_BY: updateBy,
        }))
      }

      for (const productId of dataItem.DELETED_PRODUCT_IDS || []) {
        sqlList.push(await ReRegisterSQL.deleteVendorProduct({
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
      // console.error('Error in ReRegisterService.updateVendorComprehensive:', error)
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
      const sql = await ReRegisterSQL.deleteVendor(dataItem)
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
      const sql = await ReRegisterSQL.deleteVendorContact(dataItem)
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
      const sql = await ReRegisterSQL.deleteVendorProduct(dataItem)
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
    const sql = await ReRegisterSQL.getVendorBusinessCategoryName(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },

  getVendorTypes: async (dataItem: any) => ReRegisterService.getVendorBusinessCategoryName(dataItem),

  // Get provinces
  getProvinces: async (dataItem: any) => {
    const sql = await ReRegisterSQL.getProvinces(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  // Get countries
  getCountries: async (dataItem: any) => {
    const sql = await ReRegisterSQL.getCountries(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },


  // Get product groups
  getProductGroups: async (dataItem: any) => {
    const sql = await ReRegisterSQL.getProductGroups(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },

  // Search all vendors for export
  searchAllForExport: async (dataItem: any) => {
    let sqlWhere = dataItem.SQLWHERE || ''
    const globalSearchFilter = dataItem.SEARCHFILTERS?.find((item: any) => item.id === 'global_search')
    if (globalSearchFilter?.value) {
      sqlWhere += ReRegisterSQL.generateGlobalSearchSql({ SEARCHKEYWORD: globalSearchFilter.value })
    }

    const sql = await ReRegisterSQL.searchAllForExport(dataItem, sqlWhere)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },

  // Get prones raw data for testing (Oracle)
  getPronesRawTest: async (dataItem: any) => {
    const sql = await ReRegisterSQL.getPronesRawTest(dataItem)
    const resultData = (await OracleExecute.searchOracle(sql, 'PRONES')) as RowDataPacket[]
    return resultData
  },

  // Get all vendor names
  getAllVendorNames: async (dataItem: any) => {
    const sql = await ReRegisterSQL.getAllVendorNames(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },

}
