import { MySQLExecute } from '@businessData/dbExecute'
import { FindVendorSQL } from '@src/_workspace/sql/_find-vendor/FindVendorSQL'
import { RowDataPacket } from 'mysql2'

export const FindVendorService = {
    // Search vendors with contacts
    searchVendors: async (dataItem: any) => {
        try {
            // Get data
            const sql = await FindVendorSQL.searchVendors(dataItem)
            const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

            // Get total count
            const countSql = await FindVendorSQL.countVendors(dataItem)
            const countResult = (await MySQLExecute.search(countSql)) as RowDataPacket[]
            const totalCount = countResult[0]?.total_count || 0

            return {
                Status: true,
                ResultOnDb: resultData,
                TotalCountOnDb: totalCount,
                MethodOnDb: 'Search Vendors',
                Message: 'Search Data Success'
            }
        } catch (error: any) {
            return {
                Status: false,
                ResultOnDb: [],
                TotalCountOnDb: 0,
                MethodOnDb: 'Search Vendors Failed',
                Message: error?.message || 'Failed to search vendors'
            }
        }
    }
}
