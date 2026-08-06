import { VendorStatusSqlSnippets } from '../_status-master/StatusMasterSQL'

export const VendorSearchSqlSnippets = {
  statusIdFilter: (dataItem: any) => {
    const statusId = Number(dataItem.M_VENDOR_STATUS_ID)
    if (!Number.isInteger(statusId) || statusId < 0) {
      throw new Error('Invalid vendor status ID')
    }

    let sql = `
      AND (dataItem.VENDOR_STATUS_ID_SQL) = dataItem.M_VENDOR_STATUS_ID
    `
    sql = sql.replaceAll(
      'dataItem.VENDOR_STATUS_ID_SQL',
      VendorStatusSqlSnippets.effectiveStatusIdExpr(dataItem.VENDOR_ALIAS || 'v'),
    )
    sql = sql.replaceAll('dataItem.M_VENDOR_STATUS_ID', statusId.toString())
    return sql
  },
}
