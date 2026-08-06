import getSqlWhere_aggrid from '@src/helpers/getSqlWhere_aggrid'
import { VendorSearchSqlSnippets } from '../../sql/common/VendorSearchSqlSnippets'
import { toVendorStatusId } from '../../utils/StatusId'

const vendorSearchTableIds = [
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

export const prepareVendorSearchData = (dataItem: any) => {
  if (dataItem.SQL_PREPARED) return dataItem

  if (Array.isArray(dataItem.SEARCHFILTERS)) {
    const statusIndex = dataItem.SEARCHFILTERS.findIndex(
      (item: any) => String(item?.id || '').trim().toUpperCase() === 'M_VENDOR_STATUS_ID',
    )
    if (statusIndex > -1) {
      dataItem.VENDOR_STATUS_ID = toVendorStatusId(
        dataItem.SEARCHFILTERS[statusIndex].value,
      )
      dataItem.SEARCHFILTERS.splice(statusIndex, 1)
    }

    dataItem.SEARCHFILTERS = dataItem.SEARCHFILTERS.filter(
      (item: any) => item.value !== null && item.value !== undefined && item.value !== '',
    )
  }

  getSqlWhere_aggrid(dataItem, vendorSearchTableIds, 'COMPANY_NAME')

  let sqlWhere = String(dataItem.SQLWHERE || '')
    .trim()
    .replace(/^WHERE\s+/i, '')

  if (sqlWhere) {
    sqlWhere = ' AND ' + sqlWhere
  }

  if (dataItem.VENDOR_STATUS_ID !== null && dataItem.VENDOR_STATUS_ID !== undefined) {
    sqlWhere += VendorSearchSqlSnippets.statusIdFilter({
      VENDOR_ALIAS: 'v',
      M_VENDOR_STATUS_ID: dataItem.VENDOR_STATUS_ID,
    })
  }

  dataItem.SQLWHERECOLUMNFILTER = ''
  dataItem.SQLWHERE = sqlWhere
  dataItem.SQL_PREPARED = true

  return dataItem
}
