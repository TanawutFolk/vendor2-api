import { PersonSqlSnippets } from '../common/PersonSqlSnippets'
import { RequestStateSqlSnippets } from '../_status-master/StatusMasterSQL'
import { AllRequestHistoryDetailSQL } from './AllRequestHistoryDetailSQL'
import { RequestStatusSqlSnippets } from '../common/RequestStatusSqlSnippets'
import type { AllRequestHistorySearchData } from '../../types/AllRequestHistory'

const escapeSqlLiteral = (value: unknown) => String(value ?? '').replaceAll("'", "''")

const sortableColumns: Record<string, string> = {
  REQUEST_REGISTER_VENDOR_ID: 'rr.REQUEST_REGISTER_VENDOR_ID',
  REQUEST_NUMBER: 'rr.REQUEST_NUMBER',
  REQUESTER_SECTION: 'rr.REQUESTER_SECTION',
  COMPANY_NAME: 'v.COMPANY_NAME',
  SUPPORTPRODUCT_PROCESS: 'rr.SUPPORTPRODUCT_PROCESS',
  ASSIGN_TO: 'rr.ASSIGN_TO',
  CREATE_DATE: 'rr.CREATE_DATE',
}

const buildOrderBy = (order: AllRequestHistorySearchData['ORDER']) => {
  const orderBy = (order || [])
    .map((item) => {
      const column = sortableColumns[String(item?.id || '')]
      if (!column) return ''

      let sql = 'dataItem.ORDER_COLUMN dataItem.ORDER_DIRECTION'
      sql = sql.replaceAll('dataItem.ORDER_COLUMN', column)
      sql = sql.replaceAll('dataItem.ORDER_DIRECTION', item.desc ? 'DESC' : 'ASC')
      return sql
    })
    .filter(Boolean)

  return orderBy.length > 0 ? orderBy.join(', ') : 'rr.REQUEST_REGISTER_VENDOR_ID DESC'
}

const buildWhere = (dataItem: AllRequestHistorySearchData) => {
  const conditions = ['rr.INUSE = 1']
  const section = String(dataItem.REQUESTER_SECTION || '').trim()

  if (section) {
    let sql = "rr.REQUESTER_SECTION = 'dataItem.REQUESTER_SECTION'"
    sql = sql.replaceAll('dataItem.REQUESTER_SECTION', escapeSqlLiteral(section))
    conditions.push(sql)
  }

  if (dataItem.REQUEST_YEAR) {
    const requestYear = Number(dataItem.REQUEST_YEAR)
    let fromSql = "rr.CREATE_DATE >= 'dataItem.REQUEST_YEAR_FROM-01-01 00:00:00'"
    fromSql = fromSql.replaceAll('dataItem.REQUEST_YEAR_FROM', String(requestYear))

    let toSql = "rr.CREATE_DATE < 'dataItem.REQUEST_YEAR_TO-01-01 00:00:00'"
    toSql = toSql.replaceAll('dataItem.REQUEST_YEAR_TO', String(requestYear + 1))

    conditions.push(fromSql, toSql)
  }

  return conditions.join('\n                                       AND ')
}

export const AllRequestHistorySQL = {
  search: async (dataItem: AllRequestHistorySearchData) => {
    const whereSql = buildWhere(dataItem)
    const orderBySql = buildOrderBy(dataItem.ORDER)
    const offset = Math.max(0, Math.trunc(Number(dataItem.START) || 0))
    const limit = Math.min(200, Math.max(1, Math.trunc(Number(dataItem.LIMIT) || 50)))

    let countSql = `
                            SELECT
                                       COUNT(*) AS TOTAL_COUNT
                            FROM
                                       request_register_vendor rr
                            WHERE
                                       dataItem.WHERE_SQL
    `
    countSql = countSql.replaceAll('dataItem.WHERE_SQL', String(whereSql))

    let dataSql = `
                            SELECT
                                       rr.REQUEST_REGISTER_VENDOR_ID
                                     , rr.REQUEST_NUMBER
                                     , rr.VENDORS_ID
                                     , dataItem.REQUEST_STATUS_SQL AS REQUEST_STATUS
                                     , rr.M_REQUEST_STATE_ID
                                     , dataItem.REQUEST_STATE_SQL AS REQUEST_STATE
                                     , rr.CURRENT_M_REQUEST_STATUS_ID
                                     , rr.CURRENT_REQUEST_APPROVAL_STEP_ID
                                     , rr.SUPPORTPRODUCT_PROCESS
                                     , rr.PURCHASE_FREQUENCY
                                     , rr.ASSIGN_TO
                                     , rr.PIC_EMAIL
                                     , rr.REQUESTER_REMARK
                                     , rr.APPROVED_VENDOR_CODE AS VENDOR_CODE
                                     , rr.REQUEST_BY_EMPLOYEECODE AS EMPLOYEE_CODE
                                     , CONCAT(m.EMPNAME, ' ', m.EMPSURNAME) AS FULL_NAME
                                     , m.EMPDEPT AS EMPLOYEE_DEPT
                                     , rr.REQUESTER_SECTION
                                     , rr.CREATE_DATE
                                     , YEAR(rr.CREATE_DATE) AS REQUEST_YEAR
                                     , v.COMPANY_NAME
                                     , v.FFT_VENDOR_CODE
                                     , v.FFT_STATUS
                                     , v.VENDOR_REGION
                                     , v.PROVINCE
                                     , v.POSTAL_CODE
                                     , v.COUNTRY
                                     , v.ADDRESS
                                     , v.TEL_CENTER
                                     , v.WEBSITE
                                     , v.EMAILMAIN
                                     , vt.BUSINESS_CATEGORY_NAME AS VENDOR_TYPE_NAME
                                     , (
                                           SELECT COUNT(*)
                                           FROM request_register_file rrf
                                           WHERE rrf.REQUEST_REGISTER_VENDOR_ID = rr.REQUEST_REGISTER_VENDOR_ID
                                             AND rrf.INUSE = 1
                                       ) AS DOCUMENTS_COUNT
                            FROM
                                       request_register_vendor rr
                                            LEFT JOIN
                                       vendors v ON v.VENDORS_ID = rr.VENDORS_ID
                                            LEFT JOIN
                                       info_business_category vt ON vt.BUSINESS_CATEGORY_ID = v.BUSINESS_CATEGORY_ID
                                            LEFT JOIN
                                       dataItem.MEMBER_TABLE m ON m.EMPCODE = rr.REQUEST_BY_EMPLOYEECODE
                            WHERE
                                       dataItem.WHERE_SQL
                            ORDER BY
                                       dataItem.ORDER_BY_SQL
                            LIMIT
                                       dataItem.LIMIT OFFSET dataItem.OFFSET
    `
    dataSql = dataSql.replaceAll('dataItem.REQUEST_STATUS_SQL', String(RequestStatusSqlSnippets.requestStatusExpr('rr')))
    dataSql = dataSql.replaceAll('dataItem.REQUEST_STATE_SQL', String(RequestStateSqlSnippets.requestStateCodeExpr('rr')))
    dataSql = dataSql.replaceAll('dataItem.MEMBER_TABLE', String(PersonSqlSnippets.memberTable()))
    dataSql = dataSql.replaceAll('dataItem.WHERE_SQL', String(whereSql))
    dataSql = dataSql.replaceAll('dataItem.ORDER_BY_SQL', String(orderBySql))
    dataSql = dataSql.replaceAll('dataItem.LIMIT', String(limit))
    dataSql = dataSql.replaceAll('dataItem.OFFSET', String(offset))

    return [countSql, dataSql]
  },

  getFilterOptions: async () => {
    let sql = `
                            SELECT DISTINCT
                                       TRIM(section_master.SECT_NAME) AS REQUESTER_SECTION
                                     , NULL AS REQUEST_YEAR
                            FROM
                                       dataItem.SECTION_TABLE section_master
                            WHERE
                                       NULLIF(TRIM(section_master.SECT_NAME), '') IS NOT NULL

                            UNION ALL

                            SELECT DISTINCT
                                       NULL AS REQUESTER_SECTION
                                     , YEAR(rr.CREATE_DATE) AS REQUEST_YEAR
                            FROM
                                       request_register_vendor rr
                            WHERE
                                       rr.INUSE = 1
                                       AND rr.CREATE_DATE IS NOT NULL
                            ORDER BY
                                       REQUEST_YEAR DESC
                                     , REQUESTER_SECTION ASC
    `

    sql = sql.replaceAll('dataItem.SECTION_TABLE', String(PersonSqlSnippets.sectionTable()))

    return sql
  },

  getById: async (dataItem: { REQUEST_REGISTER_VENDOR_ID: number }) => AllRequestHistoryDetailSQL.getById(dataItem),
}
