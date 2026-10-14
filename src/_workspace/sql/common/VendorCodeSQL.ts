import { REQUEST_STATE_ID_SQL } from '../_status-master/StatusMasterSQL'

const escapeSqlText = (value: unknown) => String(value ?? '').replaceAll('\\', '\\\\').replaceAll("'", "''")

export const VendorCodeSQL = {
  // Vendor of the registration request whose Vendor Code is being verified
  getRequestVendor: (dataItem: any) => {
    let sql = `
                            SELECT
                                       rr.VENDORS_ID
                                     , v.COMPANY_NAME
                                     , v.VENDOR_REGION
                            FROM
                                       request_register_vendor rr
                                            INNER JOIN
                                       vendors v ON v.VENDORS_ID = rr.VENDORS_ID
                            WHERE
                                       rr.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
                                       AND rr.INUSE = 1
                            LIMIT 1
        `

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (Number(dataItem['REQUEST_REGISTER_VENDOR_ID']) || 0).toString())

    return sql
  },

  // Another vendor already owns this code, or another in-progress request has proposed it
  getVendorCodeUsage: (dataItem: any) => {
    let sql = `
                            SELECT
                                       'VENDOR' AS USAGE_SOURCE
                                     , v.VENDORS_ID
                                     , v.COMPANY_NAME
                                     , NULL AS REQUEST_NUMBER
                            FROM
                                       vendors v
                            WHERE
                                       TRIM(v.FFT_VENDOR_CODE) = 'dataItem.VENDOR_CODE'
                                       AND v.VENDORS_ID <> dataItem.VENDORS_ID
                                       AND v.INUSE = 1

                            UNION ALL

                            SELECT
                                       'REQUEST' AS USAGE_SOURCE
                                     , v.VENDORS_ID
                                     , v.COMPANY_NAME
                                     , rr.REQUEST_NUMBER
                            FROM
                                       request_vendor_selections rvs
                                            INNER JOIN
                                       request_register_vendor rr ON rr.REQUEST_REGISTER_VENDOR_ID = rvs.REQUEST_REGISTER_VENDOR_ID
                                            INNER JOIN
                                       vendors v ON v.VENDORS_ID = rr.VENDORS_ID
                            WHERE
                                       TRIM(rvs.PROPOSED_VENDOR_CODE) = 'dataItem.VENDOR_CODE'
                                       AND rvs.REQUEST_REGISTER_VENDOR_ID <> dataItem.REQUEST_REGISTER_VENDOR_ID
                                       AND rr.VENDORS_ID <> dataItem.VENDORS_ID
                                       AND rr.M_REQUEST_STATE_ID = dataItem.REQUEST_IN_PROGRESS_STATE_ID
                                       AND rvs.INUSE = 1
                                       AND rr.INUSE = 1
                            LIMIT 1
        `

    sql = sql.replaceAll('dataItem.VENDOR_CODE', escapeSqlText(dataItem['VENDOR_CODE']))
    sql = sql.replaceAll('dataItem.VENDORS_ID', (Number(dataItem['VENDORS_ID']) || 0).toString())
    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (Number(dataItem['REQUEST_REGISTER_VENDOR_ID']) || 0).toString())
    sql = sql.replaceAll('dataItem.REQUEST_IN_PROGRESS_STATE_ID', REQUEST_STATE_ID_SQL.IN_PROGRESS)

    return sql
  },

  // PRONES (Oracle): exact Vendor Code lookup. Values go through Oracle binds (:VENDOR_CODE, :VENDOR_CODE_LIKE);
  // the LIKE prefix lets Oracle use the I_DL_CD index while RTRIM handles the CHAR padding.
  getPronesVendorByCode: () => {
    const sql = `
                            SELECT
                                       RTRIM(I_DL_CD) AS VENDOR_CODE
                                     , RTRIM(I_DL_ARG_DESC) AS VENDOR_NAME
                            FROM
                                       FFT.T_TRADE_MS
                            WHERE
                                       I_DL_CD LIKE :VENDOR_CODE_LIKE
                                       AND RTRIM(I_DL_CD) = :VENDOR_CODE
                                       AND ROWNUM = 1
        `

    return sql
  },
}
