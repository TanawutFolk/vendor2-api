import { GprCSelectionSqlSnippets } from '../_request-register/GprCSelectionSqlSnippets'
import { RequestVendorContactSqlSnippets } from '../_request-register/RequestVendorContactSqlSnippets'
import { RequestStatusSqlSnippets } from '../_request-register/RequestStatusSqlSnippets'


export const GprCApprovalSQL = {
  num: (value: any) => Number(value) || 0,

  nullableDate: (value: any) => (value === 'NOW()' ? 'NOW()' : 'NULL'),

  likeValue: (value: any) => `%${String(value ?? '').trim()}%`,

  buildLikeCondition: (column: any, rawValue: any) => {
    const value = String(rawValue ?? '').trim()
    if (!value) return ''
    let condition = column + ` LIKE 'dataItem.LIKE_VALUE'`
    condition = condition.replaceAll('dataItem.LIKE_VALUE', GprCApprovalSQL.likeValue(value))
    return condition
  },

  buildKeywordConditions: (dataItem: any, mapping: any) => {
    const conditions: any = []

    for (const filter of Array.isArray(dataItem.SEARCHFILTERS) ? dataItem.SEARCHFILTERS : []) {
      const columns = mapping[filter?.id || '']
      const value = String(filter?.value ?? '').trim()
      if (!columns?.length || !value) continue

      const clause = columns
        .map((column: any) => GprCApprovalSQL.buildLikeCondition(column, value))
        .filter(Boolean)
        .join(' OR ')

      if (clause) {
        conditions.push(`(${clause})`)
      }
    }

    return conditions
  },

  buildColumnFilterConditions: (dataItem: any, mapping: any) => {
    const conditions: any = []

    for (const filter of Array.isArray(dataItem.COLUMNFILTERS) ? dataItem.COLUMNFILTERS : []) {
      const column = mapping[filter?.id || '']
      const value = filter?.value
      const fn = String(filter?.columnFns || 'contains').trim()

      if (!column || value === null || value === undefined || value === '') continue

      if (Array.isArray(value)) {
        const values = value
          .map((item, index) => {
            let valueSql = `'dataItem.FILTER_VALUE_${index}'`
            valueSql = valueSql.replaceAll(`dataItem.FILTER_VALUE_${index}`, item)
            return valueSql
          })
          .filter(Boolean)
        if (values.length > 0) {
          let condition = column + ` IN (dataItem.FILTER_VALUES)`
          condition = condition.replaceAll('dataItem.FILTER_VALUES', values.join(', '))
          conditions.push(condition)
        }
        continue
      }

      const safeValue = value

      switch (fn) {
        case 'equals':
          {
            let condition = column + ` = 'dataItem.FILTER_VALUE'`
            condition = condition.replaceAll('dataItem.FILTER_VALUE', safeValue)
            conditions.push(condition)
          }
          break
        case 'notEqual':
          {
            let condition = column + ` <> 'dataItem.FILTER_VALUE'`
            condition = condition.replaceAll('dataItem.FILTER_VALUE', safeValue)
            conditions.push(condition)
          }
          break
        case 'startsWith':
          {
            let condition = column + ` LIKE 'dataItem.FILTER_VALUE%'`
            condition = condition.replaceAll('dataItem.FILTER_VALUE', safeValue)
            conditions.push(condition)
          }
          break
        case 'endsWith':
          {
            let condition = column + ` LIKE '%dataItem.FILTER_VALUE'`
            condition = condition.replaceAll('dataItem.FILTER_VALUE', safeValue)
            conditions.push(condition)
          }
          break
        case 'contains':
        default:
          {
            let condition = column + ` LIKE '%dataItem.FILTER_VALUE%'`
            condition = condition.replaceAll('dataItem.FILTER_VALUE', safeValue)
            conditions.push(condition)
          }
          break
      }
    }

    return conditions
  },

  buildOrderClause: (dataItem: any, mapping: any, fallback: any) => {
    const orderItems = (Array.isArray(dataItem.ORDER) ? dataItem.ORDER : [])
      .map((item: any) => {
        const column = mapping[item?.id || '']
        if (!column) return null
        return `${column} ${item?.desc ? 'DESC' : 'ASC'}`
      })
      .filter(Boolean)

    return orderItems.length > 0 ? orderItems.join(', ') : fallback
  },
  getSelectionIdByRequest: (dataItem: any) => {
    let sql = `
            SELECT REQUEST_VENDOR_SELECTIONS_ID
            FROM request_vendor_selections
            WHERE REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
              AND INUSE = 1
            ORDER BY REQUEST_VENDOR_SELECTIONS_ID DESC
            LIMIT 1
        `
    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', GprCApprovalSQL.num(dataItem.REQUEST_REGISTER_VENDOR_ID).toString())
    return sql
  },

  getFlowByRequestId: (dataItem: any) => {
    let sql = `
            SELECT *
            FROM REQUEST_VENDOR_GPR_C_FLOWS
            WHERE REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
              AND INUSE = 1
            ORDER BY REQUEST_VENDOR_GPR_C_FLOWS_ID DESC
            LIMIT 1
        `
    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', GprCApprovalSQL.num(dataItem.REQUEST_REGISTER_VENDOR_ID).toString())
    return sql
  },

  insertFlow: (dataItem: any) => {
    let sql = `
            INSERT INTO REQUEST_VENDOR_GPR_C_FLOWS (
                REQUEST_REGISTER_VENDOR_ID,
                REQUEST_VENDOR_SELECTIONS_ID,
                FLOW_STATUS,
                CURRENT_STEP_CODE,
                REQUESTER_EMPCODE,
                DESCRIPTION,
                CREATE_BY,
                UPDATE_BY,
                INUSE
            ) VALUES (
                dataItem.REQUEST_REGISTER_VENDOR_ID,
                dataItem.REQUEST_VENDOR_SELECTIONS_ID,
                'dataItem.FLOW_STATUS',
                'dataItem.CURRENT_STEP_CODE',
                'dataItem.REQUESTER_EMPCODE',
                LEFT(CONCAT('dataItem.FLOW_STATUS', ': ', 'dataItem.CURRENT_STEP_CODE'), 100),
                'dataItem.CREATE_BY',
                'dataItem.UPDATE_BY',
                1
            )
        `
    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', GprCApprovalSQL.num(dataItem.REQUEST_REGISTER_VENDOR_ID).toString())
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_SELECTIONS_ID', dataItem.REQUEST_VENDOR_SELECTIONS_ID ? GprCApprovalSQL.num(dataItem.REQUEST_VENDOR_SELECTIONS_ID).toString() : 'NULL')
    sql = sql.replaceAll('dataItem.FLOW_STATUS', String(dataItem.FLOW_STATUS || 'requester_setup').toLowerCase())
    sql = sql.replaceAll('dataItem.CURRENT_STEP_CODE', dataItem.CURRENT_STEP_CODE || 'REQUESTER_SETUP')
    sql = sql.replaceAll('dataItem.REQUESTER_EMPCODE', dataItem.REQUESTER_EMPCODE)
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem.CREATE_BY || 'SYSTEM')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem.UPDATE_BY || dataItem.CREATE_BY || 'SYSTEM')
    return sql
  },

  updateFlowSetup: (dataItem: any) => {
    let sql = `
            UPDATE REQUEST_VENDOR_GPR_C_FLOWS SET
                REQUEST_VENDOR_SELECTIONS_ID = dataItem.REQUEST_VENDOR_SELECTIONS_ID,
                FLOW_STATUS = 'dataItem.FLOW_STATUS',
                CURRENT_STEP_CODE = 'dataItem.CURRENT_STEP_CODE',
                REQUESTER_EMPCODE = 'dataItem.REQUESTER_EMPCODE',
                REQUESTER_SUBMITTED_AT = NOW(),
                GPR_C_APPROVER_EMPCODE = 'dataItem.GPR_C_APPROVER_EMPCODE',
                GPR_C_APPROVER_NAME = 'dataItem.GPR_C_APPROVER_NAME',
                GPR_C_APPROVER_EMAIL = 'dataItem.GPR_C_APPROVER_EMAIL',
                PC_PIC_NAME = 'dataItem.PC_PIC_NAME',
                PC_PIC_EMAIL = 'dataItem.PC_PIC_EMAIL',
                DESCRIPTION = LEFT(CONCAT('dataItem.FLOW_STATUS', ': ', 'dataItem.CURRENT_STEP_CODE'), 100),
                UPDATE_BY = 'dataItem.UPDATE_BY',
                UPDATE_DATE = NOW()
            WHERE REQUEST_VENDOR_GPR_C_FLOWS_ID = dataItem.REQUEST_VENDOR_GPR_C_FLOWS_ID
        `
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_SELECTIONS_ID', dataItem.REQUEST_VENDOR_SELECTIONS_ID ? GprCApprovalSQL.num(dataItem.REQUEST_VENDOR_SELECTIONS_ID).toString() : 'REQUEST_VENDOR_SELECTIONS_ID')
    sql = sql.replaceAll('dataItem.FLOW_STATUS', String(dataItem.FLOW_STATUS || 'in_progress').toLowerCase())
    sql = sql.replaceAll('dataItem.CURRENT_STEP_CODE', dataItem.CURRENT_STEP_CODE || 'REQUESTER_APPROVER')
    sql = sql.replaceAll('dataItem.REQUESTER_EMPCODE', dataItem.REQUESTER_EMPCODE)
    sql = sql.replaceAll('dataItem.GPR_C_APPROVER_EMPCODE', dataItem.GPR_C_APPROVER_EMPCODE)
    sql = sql.replaceAll('dataItem.GPR_C_APPROVER_NAME', dataItem.GPR_C_APPROVER_NAME)
    sql = sql.replaceAll('dataItem.GPR_C_APPROVER_EMAIL', dataItem.GPR_C_APPROVER_EMAIL)
    sql = sql.replaceAll('dataItem.PC_PIC_NAME', dataItem.PC_PIC_NAME)
    sql = sql.replaceAll('dataItem.PC_PIC_EMAIL', dataItem.PC_PIC_EMAIL)
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem.UPDATE_BY || 'SYSTEM')
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_GPR_C_FLOWS_ID', GprCApprovalSQL.num(dataItem.REQUEST_VENDOR_GPR_C_FLOWS_ID).toString())
    return sql
  },

  updateFlowStatus: (dataItem: any) => {
    let sql = `
            UPDATE REQUEST_VENDOR_GPR_C_FLOWS SET
                FLOW_STATUS = 'dataItem.FLOW_STATUS',
                CURRENT_STEP_CODE = dataItem.CURRENT_STEP_CODE,
                COMPLETED_AT = dataItem.COMPLETED_AT,
                REJECTED_AT = dataItem.REJECTED_AT,
                REJECTED_BY = 'dataItem.REJECTED_BY',
                REJECTED_REMARK = 'dataItem.REJECTED_REMARK',
                DESCRIPTION = LEFT(COALESCE(NULLIF('dataItem.REJECTED_REMARK', ''), 'dataItem.FLOW_STATUS'), 100),
                UPDATE_BY = 'dataItem.UPDATE_BY',
                UPDATE_DATE = NOW()
            WHERE REQUEST_VENDOR_GPR_C_FLOWS_ID = dataItem.REQUEST_VENDOR_GPR_C_FLOWS_ID
        `
    sql = sql.replaceAll('dataItem.FLOW_STATUS', String(dataItem.FLOW_STATUS || '').toLowerCase())
    sql = sql.replaceAll('dataItem.CURRENT_STEP_CODE', dataItem.CURRENT_STEP_CODE === null ? 'NULL' : `'${dataItem.CURRENT_STEP_CODE}'`)
    sql = sql.replaceAll('dataItem.COMPLETED_AT', GprCApprovalSQL.nullableDate(dataItem.COMPLETED_AT))
    sql = sql.replaceAll('dataItem.REJECTED_AT', GprCApprovalSQL.nullableDate(dataItem.REJECTED_AT))
    sql = sql.replaceAll('dataItem.REJECTED_BY', dataItem.REJECTED_BY)
    sql = sql.replaceAll('dataItem.REJECTED_REMARK', dataItem.REJECTED_REMARK)
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem.UPDATE_BY || 'SYSTEM')
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_GPR_C_FLOWS_ID', GprCApprovalSQL.num(dataItem.REQUEST_VENDOR_GPR_C_FLOWS_ID).toString())
    return sql
  },

  deactivateStepsByFlow: (dataItem: any) => {
    let sql = `
            UPDATE REQUEST_VENDOR_GPR_C_STEPS SET
                INUSE = 0,
                UPDATE_BY = 'dataItem.UPDATE_BY',
                UPDATE_DATE = NOW()
            WHERE REQUEST_VENDOR_GPR_C_FLOWS_ID = dataItem.REQUEST_VENDOR_GPR_C_FLOWS_ID
              AND INUSE = 1
        `
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem.UPDATE_BY || 'SYSTEM')
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_GPR_C_FLOWS_ID', GprCApprovalSQL.num(dataItem.REQUEST_VENDOR_GPR_C_FLOWS_ID).toString())
    return sql
  },

  insertStep: (dataItem: any) => {
    let sql = `
            INSERT INTO REQUEST_VENDOR_GPR_C_STEPS (
                REQUEST_VENDOR_GPR_C_FLOWS_ID,
                STEP_ORDER,
                STEP_CODE,
                STEP_NAME,
                APPROVER_EMPCODE,
                APPROVER_NAME,
                APPROVER_EMAIL,
                STEP_STATUS,
                DESCRIPTION,
                CREATE_BY,
                UPDATE_BY,
                INUSE
            ) VALUES (
                dataItem.REQUEST_VENDOR_GPR_C_FLOWS_ID,
                dataItem.STEP_ORDER,
                'dataItem.STEP_CODE',
                'dataItem.STEP_NAME',
                'dataItem.APPROVER_EMPCODE',
                'dataItem.APPROVER_NAME',
                'dataItem.APPROVER_EMAIL',
                'dataItem.STEP_STATUS',
                LEFT(COALESCE(NULLIF('dataItem.STEP_NAME', ''), 'dataItem.STEP_CODE'), 100),
                'dataItem.CREATE_BY',
                'dataItem.UPDATE_BY',
                1
            )
        `
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_GPR_C_FLOWS_ID', GprCApprovalSQL.num(dataItem.REQUEST_VENDOR_GPR_C_FLOWS_ID).toString())
    sql = sql.replaceAll('dataItem.STEP_ORDER', GprCApprovalSQL.num(dataItem.STEP_ORDER).toString())
    sql = sql.replaceAll('dataItem.STEP_CODE', dataItem.STEP_CODE)
    sql = sql.replaceAll('dataItem.STEP_NAME', dataItem.STEP_NAME)
    sql = sql.replaceAll('dataItem.APPROVER_EMPCODE', dataItem.APPROVER_EMPCODE)
    sql = sql.replaceAll('dataItem.APPROVER_NAME', dataItem.APPROVER_NAME)
    sql = sql.replaceAll('dataItem.APPROVER_EMAIL', dataItem.APPROVER_EMAIL)
    sql = sql.replaceAll('dataItem.STEP_STATUS', String(dataItem.STEP_STATUS || 'pending').toLowerCase())
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem.CREATE_BY || 'SYSTEM')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem.UPDATE_BY || dataItem.CREATE_BY || 'SYSTEM')
    return sql
  },
  getStepsByFlow: (dataItem: any) => {
    let sql = `
            SELECT
                s.*,
                f.REQUEST_REGISTER_VENDOR_ID
            FROM REQUEST_VENDOR_GPR_C_STEPS s
                JOIN REQUEST_VENDOR_GPR_C_FLOWS f
                    ON f.REQUEST_VENDOR_GPR_C_FLOWS_ID = s.REQUEST_VENDOR_GPR_C_FLOWS_ID
            WHERE s.REQUEST_VENDOR_GPR_C_FLOWS_ID = dataItem.REQUEST_VENDOR_GPR_C_FLOWS_ID
              AND s.INUSE = 1
            ORDER BY s.STEP_ORDER ASC
        `
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_GPR_C_FLOWS_ID', GprCApprovalSQL.num(dataItem.REQUEST_VENDOR_GPR_C_FLOWS_ID).toString())
    return sql
  },
  getCurrentStepByFlow: (dataItem: any) => {
    let sql = `
            SELECT
                s.*,
                f.REQUEST_REGISTER_VENDOR_ID
            FROM REQUEST_VENDOR_GPR_C_STEPS s
                JOIN REQUEST_VENDOR_GPR_C_FLOWS f
                    ON f.REQUEST_VENDOR_GPR_C_FLOWS_ID = s.REQUEST_VENDOR_GPR_C_FLOWS_ID
            WHERE s.REQUEST_VENDOR_GPR_C_FLOWS_ID = dataItem.REQUEST_VENDOR_GPR_C_FLOWS_ID
              AND s.STEP_STATUS = 'in_progress'
              AND s.INUSE = 1
            ORDER BY s.STEP_ORDER ASC
            LIMIT 1
        `
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_GPR_C_FLOWS_ID', GprCApprovalSQL.num(dataItem.REQUEST_VENDOR_GPR_C_FLOWS_ID).toString())
    return sql
  },
  updateStepAction: (dataItem: any) => {
    let sql = `
            UPDATE REQUEST_VENDOR_GPR_C_STEPS SET
                STEP_STATUS = 'dataItem.STEP_STATUS',
                ACTION_BY = 'dataItem.ACTION_BY',
                ACTION_TYPE = 'dataItem.ACTION_TYPE',
                DESCRIPTION = LEFT(COALESCE(NULLIF('dataItem.ACTION_REMARK', ''), 'dataItem.ACTION_TYPE'), 100),
                UPDATE_BY = 'dataItem.UPDATE_BY',
                UPDATE_DATE = NOW()
            WHERE REQUEST_VENDOR_GPR_C_STEPS_ID = dataItem.REQUEST_VENDOR_GPR_C_STEPS_ID
        `
    sql = sql.replaceAll('dataItem.STEP_STATUS', String(dataItem.STEP_STATUS || '').toLowerCase())
    sql = sql.replaceAll('dataItem.ACTION_BY', dataItem.ACTION_BY)
    sql = sql.replaceAll('dataItem.ACTION_TYPE', dataItem.ACTION_TYPE)
    sql = sql.replaceAll('dataItem.ACTION_REMARK', dataItem.ACTION_REMARK)
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem.UPDATE_BY || dataItem.ACTION_BY || 'SYSTEM')
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_GPR_C_STEPS_ID', GprCApprovalSQL.num(dataItem.REQUEST_VENDOR_GPR_C_STEPS_ID).toString())
    return sql
  },

  activateStep: (dataItem: any) => {
    let sql = `
            UPDATE REQUEST_VENDOR_GPR_C_STEPS SET
                STEP_STATUS = 'in_progress',
                UPDATE_BY = 'dataItem.UPDATE_BY',
                UPDATE_DATE = NOW()
            WHERE REQUEST_VENDOR_GPR_C_STEPS_ID = dataItem.REQUEST_VENDOR_GPR_C_STEPS_ID
        `
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem.UPDATE_BY || 'SYSTEM')
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_GPR_C_STEPS_ID', GprCApprovalSQL.num(dataItem.REQUEST_VENDOR_GPR_C_STEPS_ID).toString())
    return sql
  },

  skipPendingSteps: (dataItem: any) => {
    let sql = `
            UPDATE REQUEST_VENDOR_GPR_C_STEPS SET
                STEP_STATUS = 'skipped',
                UPDATE_BY = 'dataItem.UPDATE_BY',
                UPDATE_DATE = NOW()
            WHERE REQUEST_VENDOR_GPR_C_FLOWS_ID = dataItem.REQUEST_VENDOR_GPR_C_FLOWS_ID
              AND STEP_STATUS = 'pending'
              AND INUSE = 1
        `
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem.UPDATE_BY || 'SYSTEM')
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_GPR_C_FLOWS_ID', GprCApprovalSQL.num(dataItem.REQUEST_VENDOR_GPR_C_FLOWS_ID).toString())
    return sql
  },

  insertActionRequired: (dataItem: any) => {
    let sql = `
            INSERT INTO REQUEST_VENDOR_GPR_C_ACTION_REQUIRED (
                REQUEST_VENDOR_GPR_C_FLOWS_ID,
                REQUEST_VENDOR_GPR_C_STEPS_ID,
                STAGE_CODE,
                STAGE_NAME,
                PIC_NAME,
                PIC_EMAIL,
                REQUIRED_DETAIL,
                RESULT_STATUS,
                SENT_AT,
                DESCRIPTION,
                CREATE_BY,
                UPDATE_BY,
                INUSE
            ) VALUES (
                dataItem.REQUEST_VENDOR_GPR_C_FLOWS_ID,
                dataItem.REQUEST_VENDOR_GPR_C_STEPS_ID,
                'dataItem.STAGE_CODE',
                'dataItem.STAGE_NAME',
                'dataItem.PIC_NAME',
                'dataItem.PIC_EMAIL',
                'dataItem.REQUIRED_DETAIL',
                'dataItem.RESULT_STATUS',
                NOW(),
                LEFT(COALESCE(NULLIF('dataItem.REQUIRED_DETAIL', ''), 'dataItem.STAGE_NAME'), 100),
                'dataItem.CREATE_BY',
                'dataItem.UPDATE_BY',
                1
            )
        `
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_GPR_C_FLOWS_ID', GprCApprovalSQL.num(dataItem.REQUEST_VENDOR_GPR_C_FLOWS_ID).toString())
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_GPR_C_STEPS_ID', GprCApprovalSQL.num(dataItem.REQUEST_VENDOR_GPR_C_STEPS_ID).toString())
    sql = sql.replaceAll('dataItem.STAGE_CODE', dataItem.STAGE_CODE)
    sql = sql.replaceAll('dataItem.STAGE_NAME', dataItem.STAGE_NAME)
    sql = sql.replaceAll('dataItem.PIC_NAME', dataItem.PIC_NAME)
    sql = sql.replaceAll('dataItem.PIC_EMAIL', dataItem.PIC_EMAIL)
    sql = sql.replaceAll('dataItem.REQUIRED_DETAIL', dataItem.REQUIRED_DETAIL)
    sql = sql.replaceAll('dataItem.RESULT_STATUS', String(dataItem.RESULT_STATUS || 'pending').toLowerCase())
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem.CREATE_BY || 'SYSTEM')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem.UPDATE_BY || dataItem.CREATE_BY || 'SYSTEM')
    return sql
  },
  updateActionRequiredResult: (dataItem: any) => {
    let sql = `
            UPDATE REQUEST_VENDOR_GPR_C_ACTION_REQUIRED SET
                RESULT_STATUS = 'dataItem.RESULT_STATUS',
                RESULT_REMARK = 'dataItem.RESULT_REMARK',
                RESULT_BY = 'dataItem.RESULT_BY',
                RESULT_AT = NOW(),
                DESCRIPTION = LEFT(COALESCE(NULLIF('dataItem.RESULT_REMARK', ''), 'dataItem.RESULT_STATUS'), 100),
                UPDATE_BY = 'dataItem.UPDATE_BY',
                UPDATE_DATE = NOW()
            WHERE REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID = dataItem.REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID
              AND INUSE = 1
        `
    sql = sql.replaceAll('dataItem.RESULT_STATUS', String(dataItem.RESULT_STATUS || 'completed').toLowerCase())
    sql = sql.replaceAll('dataItem.RESULT_REMARK', dataItem.RESULT_REMARK)
    sql = sql.replaceAll('dataItem.RESULT_BY', dataItem.RESULT_BY)
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem.UPDATE_BY || dataItem.RESULT_BY || 'SYSTEM')
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID', GprCApprovalSQL.num(dataItem.REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID).toString())
    return sql
  },

  getActionRequiredById: (dataItem: any) => {
    let sql = `
            SELECT
                ar.*,
                f.REQUEST_REGISTER_VENDOR_ID
            FROM REQUEST_VENDOR_GPR_C_ACTION_REQUIRED ar
                JOIN REQUEST_VENDOR_GPR_C_FLOWS f
                    ON f.REQUEST_VENDOR_GPR_C_FLOWS_ID = ar.REQUEST_VENDOR_GPR_C_FLOWS_ID
            WHERE ar.REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID = dataItem.REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID
              AND ar.INUSE = 1
            LIMIT 1
        `
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID', GprCApprovalSQL.num(dataItem.REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID).toString())
    return sql
  },
  getActionRequiredQueueByPicEmail: (dataItem: any) => {
    let sql = `
            SELECT
                ar.*,
                f.FLOW_STATUS,
                f.CURRENT_STEP_CODE,
                s.STEP_NAME,
                rr.REQUEST_NUMBER,
                ${RequestStatusSqlSnippets.requestStatusExpr('rr')} AS REQUEST_STATUS,
                v.COMPANY_NAME
            FROM REQUEST_VENDOR_GPR_C_ACTION_REQUIRED ar
                JOIN REQUEST_VENDOR_GPR_C_FLOWS f
                    ON f.REQUEST_VENDOR_GPR_C_FLOWS_ID = ar.REQUEST_VENDOR_GPR_C_FLOWS_ID
                    AND f.INUSE = 1
                LEFT JOIN REQUEST_VENDOR_GPR_C_STEPS s
                    ON s.REQUEST_VENDOR_GPR_C_STEPS_ID = ar.REQUEST_VENDOR_GPR_C_STEPS_ID
                JOIN request_register_vendor rr
                    ON rr.REQUEST_REGISTER_VENDOR_ID = f.REQUEST_REGISTER_VENDOR_ID
                LEFT JOIN vendors v
                    ON v.VENDORS_ID = rr.VENDORS_ID
            WHERE ar.INUSE = 1
              AND LOWER(ar.PIC_EMAIL) = LOWER('dataItem.PIC_EMAIL')
              AND ar.RESULT_STATUS IN ('pending', 'incomplete')
            ORDER BY ar.SENT_AT DESC, ar.REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID DESC
        `
    sql = sql.replaceAll('dataItem.PIC_EMAIL', dataItem.PIC_EMAIL)
    return sql
  },

  getActionRequiredQueueByPicEmailPaginated: (dataItem: any) => {
    const conditions = [
      `t.PIC_EMAIL_NORMALIZED = LOWER('dataItem.PIC_EMAIL')`,
      't.RESULT_STATUS IN (\'pending\', \'incomplete\')',
      ...GprCApprovalSQL.buildKeywordConditions(dataItem, {
        request_number: ['t.REQUEST_NUMBER', 'CAST(t.REQUEST_REGISTER_VENDOR_ID AS CHAR)'],
        vendor_name: ['t.COMPANY_NAME'],
        step_keyword: ['t.STAGE_NAME', 't.STAGE_CODE'],
        status_keyword: ['t.RESULT_STATUS', 't.REQUEST_STATUS'],
      }),
      ...GprCApprovalSQL.buildColumnFilterConditions(dataItem, {
        request_number: 't.REQUEST_NUMBER',
        company_name: 't.COMPANY_NAME',
        STAGE_NAME: 't.STAGE_NAME',
        STAGE_CODE: 't.STAGE_CODE',
        REQUIRED_DETAIL: 't.REQUIRED_DETAIL',
        RESULT_STATUS: 't.RESULT_STATUS',
      }),
    ]

    let whereClause = ''
    if (conditions.length > 0) {
      whereClause = 'WHERE dataItem.CONDITIONS'
      whereClause = whereClause.replaceAll('dataItem.CONDITIONS', conditions.join('\n              AND '))
    }
    const orderClause = GprCApprovalSQL.buildOrderClause(
      dataItem,
      {
        REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID: 't.REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID',
        request_number: 't.REQUEST_NUMBER',
        company_name: 't.COMPANY_NAME',
        STAGE_NAME: 't.STAGE_NAME',
        STAGE_CODE: 't.STAGE_CODE',
        REQUIRED_DETAIL: 't.REQUIRED_DETAIL',
        RESULT_STATUS: 't.RESULT_STATUS',
        SENT_AT: 't.SENT_AT',
      },
      't.SENT_AT DESC, t.REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID DESC'
    )
    const offset = GprCApprovalSQL.num(dataItem.START)
    const limit = GprCApprovalSQL.num(dataItem.LIMIT) || 20
    const innerQuery = `
            (
                SELECT
                    ar.*,
                    f.REQUEST_REGISTER_VENDOR_ID,
                    LOWER(ar.PIC_EMAIL) AS PIC_EMAIL_NORMALIZED,
                    f.FLOW_STATUS,
                    f.CURRENT_STEP_CODE,
                    s.STEP_NAME,
                    rr.REQUEST_NUMBER,
                    ${RequestStatusSqlSnippets.requestStatusExpr('rr')} AS REQUEST_STATUS,
                    v.COMPANY_NAME
                FROM REQUEST_VENDOR_GPR_C_ACTION_REQUIRED ar
                    JOIN REQUEST_VENDOR_GPR_C_FLOWS f
                        ON f.REQUEST_VENDOR_GPR_C_FLOWS_ID = ar.REQUEST_VENDOR_GPR_C_FLOWS_ID
                        AND f.INUSE = 1
                    LEFT JOIN REQUEST_VENDOR_GPR_C_STEPS s
                        ON s.REQUEST_VENDOR_GPR_C_STEPS_ID = ar.REQUEST_VENDOR_GPR_C_STEPS_ID
                    JOIN request_register_vendor rr
                        ON rr.REQUEST_REGISTER_VENDOR_ID = f.REQUEST_REGISTER_VENDOR_ID
                    LEFT JOIN vendors v
                    ON v.VENDORS_ID = rr.VENDORS_ID
                WHERE ar.INUSE = 1
            ) t
        `

    let countSql = `
            SELECT COUNT(*) AS TOTAL_COUNT
            FROM dataItem.INNERQUERY
            dataItem.WHERECLAUSE
        `

    let dataSql = `
            SELECT t.*
            FROM dataItem.INNERQUERY
            dataItem.WHERECLAUSE
            ORDER BY dataItem.ORDERCLAUSE
            LIMIT dataItem.LIMIT OFFSET dataItem.OFFSET
        `
    countSql = countSql.replaceAll('dataItem.INNERQUERY', innerQuery)
    countSql = countSql.replaceAll('dataItem.WHERECLAUSE', whereClause)
    countSql = countSql.replaceAll('dataItem.PIC_EMAIL', dataItem.PIC_EMAIL)
    dataSql = dataSql.replaceAll('dataItem.INNERQUERY', innerQuery)
    dataSql = dataSql.replaceAll('dataItem.WHERECLAUSE', whereClause)
    dataSql = dataSql.replaceAll('dataItem.ORDERCLAUSE', orderClause)
    dataSql = dataSql.replaceAll('dataItem.LIMIT', limit.toString())
    dataSql = dataSql.replaceAll('dataItem.OFFSET', offset.toString())
    dataSql = dataSql.replaceAll('dataItem.PIC_EMAIL', dataItem.PIC_EMAIL)

    return [countSql, dataSql]
  },

  getQueueByApprover: (dataItem: any) => {
    let sql = `
            SELECT
                f.*,
                s.REQUEST_VENDOR_GPR_C_STEPS_ID,
                s.STEP_ORDER,
                s.STEP_CODE,
                s.STEP_NAME,
                s.APPROVER_EMPCODE,
                s.APPROVER_NAME,
                s.APPROVER_EMAIL,
                s.STEP_STATUS,
                rr.REQUEST_NUMBER,
                ${RequestStatusSqlSnippets.requestStatusExpr('rr')} AS REQUEST_STATUS,
                rr.SUPPORTPRODUCT_PROCESS,
                rr.PURCHASE_FREQUENCY,
                rr.REQUEST_BY_EMPLOYEECODE,
                rr.CREATE_DATE AS REQUEST_CREATE_DATE,
                v.COMPANY_NAME,
                v.ADDRESS,
                v.VENDOR_REGION,
                v.PROVINCE,
                v.POSTAL_CODE,
                v.COUNTRY,
                vc.CONTACT_NAME,
                COALESCE(vc_sel.EMAIL, vc.EMAIL, v.EMAILMAIN) AS vendor_email,
                vc.TEL_PHONE
            FROM REQUEST_VENDOR_GPR_C_FLOWS f
                JOIN REQUEST_VENDOR_GPR_C_STEPS s
                    ON s.REQUEST_VENDOR_GPR_C_FLOWS_ID = f.REQUEST_VENDOR_GPR_C_FLOWS_ID
                    AND s.STEP_STATUS = 'in_progress'
                    AND s.INUSE = 1
                JOIN request_register_vendor rr
                    ON rr.REQUEST_REGISTER_VENDOR_ID = f.REQUEST_REGISTER_VENDOR_ID
                LEFT JOIN vendors v
                    ON v.VENDORS_ID = rr.VENDORS_ID
                LEFT JOIN vendor_contacts vc
                    ON vc.VENDORS_ID = v.VENDORS_ID
                LEFT JOIN vendor_contacts vc_sel
                    ON vc_sel.VENDOR_CONTACTS_ID = ${RequestVendorContactSqlSnippets.primaryVendorContactIdExpr('rr')}
                    AND vc_sel.INUSE = 1
            WHERE f.INUSE = 1
              AND f.FLOW_STATUS = 'in_progress'
              AND s.APPROVER_EMPCODE = 'dataItem.APPROVER_EMPCODE'
            ORDER BY f.REQUEST_VENDOR_GPR_C_FLOWS_ID DESC
        `
    sql = sql.replaceAll('dataItem.APPROVER_EMPCODE', dataItem.APPROVER_EMPCODE)
    return sql
  },

  getQueueByApproverPaginated: (dataItem: any) => {
    const conditions = [
      `t.APPROVER_EMPCODE = 'dataItem.APPROVER_EMPCODE'`,
      ...GprCApprovalSQL.buildKeywordConditions(dataItem, {
        request_number: ['t.REQUEST_NUMBER', 'CAST(t.REQUEST_REGISTER_VENDOR_ID AS CHAR)'],
        vendor_name: ['t.COMPANY_NAME'],
        step_keyword: ['t.STEP_NAME', 't.STEP_CODE'],
        status_keyword: ['t.REQUEST_STATUS'],
      }),
      ...GprCApprovalSQL.buildColumnFilterConditions(dataItem, {
        request_number: 't.REQUEST_NUMBER',
        company_name: 't.COMPANY_NAME',
        STEP_NAME: 't.STEP_NAME',
        STEP_CODE: 't.STEP_CODE',
        request_status: 't.REQUEST_STATUS',
      }),
    ]

    let whereClause = ''
    if (conditions.length > 0) {
      whereClause = 'WHERE dataItem.CONDITIONS'
      whereClause = whereClause.replaceAll('dataItem.CONDITIONS', conditions.join('\n              AND '))
    }
    const orderClause = GprCApprovalSQL.buildOrderClause(
      dataItem,
      {
        REQUEST_VENDOR_GPR_C_FLOWS_ID: 't.REQUEST_VENDOR_GPR_C_FLOWS_ID',
        request_number: 't.REQUEST_NUMBER',
        company_name: 't.COMPANY_NAME',
        STEP_NAME: 't.STEP_NAME',
        STEP_CODE: 't.STEP_CODE',
        request_status: 't.REQUEST_STATUS',
        REQUEST_CREATE_DATE: 't.REQUEST_CREATE_DATE',
      },
      't.REQUEST_VENDOR_GPR_C_FLOWS_ID DESC'
    )
    const offset = GprCApprovalSQL.num(dataItem.START)
    const limit = GprCApprovalSQL.num(dataItem.LIMIT) || 20
    const innerQuery = `
            (
                SELECT
                    f.*,
                    s.REQUEST_VENDOR_GPR_C_STEPS_ID,
                    s.STEP_ORDER,
                    s.STEP_CODE,
                    s.STEP_NAME,
                    s.APPROVER_EMPCODE,
                    s.APPROVER_NAME,
                    s.APPROVER_EMAIL,
                    s.STEP_STATUS,
                    rr.REQUEST_NUMBER,
                    ${RequestStatusSqlSnippets.requestStatusExpr('rr')} AS REQUEST_STATUS,
                    rr.SUPPORTPRODUCT_PROCESS,
                    rr.PURCHASE_FREQUENCY,
                    rr.REQUEST_BY_EMPLOYEECODE,
                    rr.CREATE_DATE AS REQUEST_CREATE_DATE,
                    v.COMPANY_NAME,
                    v.ADDRESS,
                    v.VENDOR_REGION,
                    vc.CONTACT_NAME,
                    COALESCE(vc_sel.EMAIL, vc.EMAIL, v.EMAILMAIN) AS vendor_email,
                    vc.TEL_PHONE
                FROM REQUEST_VENDOR_GPR_C_FLOWS f
                    JOIN REQUEST_VENDOR_GPR_C_STEPS s
                        ON s.REQUEST_VENDOR_GPR_C_FLOWS_ID = f.REQUEST_VENDOR_GPR_C_FLOWS_ID
                        AND s.STEP_STATUS = 'in_progress'
                        AND s.INUSE = 1
                    JOIN request_register_vendor rr
                        ON rr.REQUEST_REGISTER_VENDOR_ID = f.REQUEST_REGISTER_VENDOR_ID
                    LEFT JOIN vendors v
                    ON v.VENDORS_ID = rr.VENDORS_ID
                    LEFT JOIN vendor_contacts vc
                        ON vc.VENDORS_ID = v.VENDORS_ID
                    LEFT JOIN vendor_contacts vc_sel
                        ON vc_sel.VENDOR_CONTACTS_ID = ${RequestVendorContactSqlSnippets.primaryVendorContactIdExpr('rr')}
                        AND vc_sel.INUSE = 1
                WHERE f.INUSE = 1
                  AND f.FLOW_STATUS = 'in_progress'
            ) t
        `

    let countSql = `
            SELECT COUNT(*) AS TOTAL_COUNT
            FROM dataItem.INNERQUERY
            dataItem.WHERECLAUSE
        `

    let dataSql = `
            SELECT t.*
            FROM dataItem.INNERQUERY
            dataItem.WHERECLAUSE
            ORDER BY dataItem.ORDERCLAUSE
            LIMIT dataItem.LIMIT OFFSET dataItem.OFFSET
        `
    countSql = countSql.replaceAll('dataItem.INNERQUERY', innerQuery)
    countSql = countSql.replaceAll('dataItem.WHERECLAUSE', whereClause)
    countSql = countSql.replaceAll('dataItem.APPROVER_EMPCODE', dataItem.APPROVER_EMPCODE)
    dataSql = dataSql.replaceAll('dataItem.INNERQUERY', innerQuery)
    dataSql = dataSql.replaceAll('dataItem.WHERECLAUSE', whereClause)
    dataSql = dataSql.replaceAll('dataItem.ORDERCLAUSE', orderClause)
    dataSql = dataSql.replaceAll('dataItem.LIMIT', limit.toString())
    dataSql = dataSql.replaceAll('dataItem.OFFSET', offset.toString())
    dataSql = dataSql.replaceAll('dataItem.APPROVER_EMPCODE', dataItem.APPROVER_EMPCODE)

    return [countSql, dataSql]
  },

  getTaskManagerQueue: () => {
    return `
            SELECT
                f.REQUEST_VENDOR_GPR_C_FLOWS_ID,
                f.REQUEST_REGISTER_VENDOR_ID,
                f.FLOW_STATUS,
                f.CURRENT_STEP_CODE,
                s.REQUEST_VENDOR_GPR_C_STEPS_ID,
                s.STEP_ORDER,
                s.STEP_CODE,
                s.STEP_NAME,
                s.APPROVER_EMPCODE,
                s.APPROVER_NAME,
                s.APPROVER_EMAIL,
                s.STEP_STATUS,
                rr.REQUEST_NUMBER,
                ${RequestStatusSqlSnippets.requestStatusExpr('rr')} AS REQUEST_STATUS,
                rr.SUPPORTPRODUCT_PROCESS,
                rr.PURCHASE_FREQUENCY,
                rr.REQUEST_BY_EMPLOYEECODE,
                rr.CREATE_DATE AS REQUEST_CREATE_DATE,
                v.COMPANY_NAME,
                v.VENDOR_REGION
            FROM REQUEST_VENDOR_GPR_C_FLOWS f
                JOIN REQUEST_VENDOR_GPR_C_STEPS s
                    ON s.REQUEST_VENDOR_GPR_C_FLOWS_ID = f.REQUEST_VENDOR_GPR_C_FLOWS_ID
                    AND s.STEP_STATUS = 'in_progress'
                    AND s.INUSE = 1
                JOIN request_register_vendor rr
                    ON rr.REQUEST_REGISTER_VENDOR_ID = f.REQUEST_REGISTER_VENDOR_ID
                    AND rr.INUSE = 1
                LEFT JOIN vendors v
                    ON v.VENDORS_ID = rr.VENDORS_ID
            WHERE f.INUSE = 1
              AND f.FLOW_STATUS = 'in_progress'
            ORDER BY f.REQUEST_VENDOR_GPR_C_FLOWS_ID DESC
        `
  },

  getStepById: (dataItem: any) => {
    let sql = `
            SELECT
                s.*,
                f.REQUEST_REGISTER_VENDOR_ID
            FROM REQUEST_VENDOR_GPR_C_STEPS s
                JOIN REQUEST_VENDOR_GPR_C_FLOWS f
                    ON f.REQUEST_VENDOR_GPR_C_FLOWS_ID = s.REQUEST_VENDOR_GPR_C_FLOWS_ID
            WHERE s.REQUEST_VENDOR_GPR_C_STEPS_ID = dataItem.REQUEST_VENDOR_GPR_C_STEPS_ID
              AND s.INUSE = 1
            LIMIT 1
        `
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_GPR_C_STEPS_ID', GprCApprovalSQL.num(dataItem.REQUEST_VENDOR_GPR_C_STEPS_ID).toString())
    return sql
  },
  updateStepApprover: (dataItem: any) => {
    let sql = `
            UPDATE REQUEST_VENDOR_GPR_C_STEPS SET
                APPROVER_EMPCODE = 'dataItem.APPROVER_EMPCODE',
                APPROVER_NAME = 'dataItem.APPROVER_NAME',
                APPROVER_EMAIL = 'dataItem.APPROVER_EMAIL',
                UPDATE_BY = 'dataItem.UPDATE_BY',
                UPDATE_DATE = NOW()
            WHERE REQUEST_VENDOR_GPR_C_STEPS_ID = dataItem.REQUEST_VENDOR_GPR_C_STEPS_ID
              AND INUSE = 1
        `
    sql = sql.replaceAll('dataItem.APPROVER_EMPCODE', dataItem.APPROVER_EMPCODE)
    sql = sql.replaceAll('dataItem.APPROVER_NAME', dataItem.APPROVER_NAME)
    sql = sql.replaceAll('dataItem.APPROVER_EMAIL', dataItem.APPROVER_EMAIL)
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem.UPDATE_BY || 'SYSTEM')
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_GPR_C_STEPS_ID', GprCApprovalSQL.num(dataItem.REQUEST_VENDOR_GPR_C_STEPS_ID).toString())
    return sql
  },

  getRequestSummary: (dataItem: any) => {
    let sql = `
            SELECT
                rr.REQUEST_REGISTER_VENDOR_ID,
                rr.REQUEST_NUMBER,
                ${RequestStatusSqlSnippets.requestStatusExpr('rr')} AS REQUEST_STATUS,
                rr.ASSIGN_TO,
                rr.REQUEST_BY_EMPLOYEECODE,
                rr.SUPPORTPRODUCT_PROCESS,
                rr.PURCHASE_FREQUENCY,
                rr.CREATE_DATE,
                v.VENDORS_ID,
                v.COMPANY_NAME,
                v.ADDRESS,
                v.VENDOR_REGION,
                v.PROVINCE,
                v.POSTAL_CODE,
                v.COUNTRY,
                v.EMAILMAIN,
                vc.CONTACT_NAME,
                vc.EMAIL AS vendor_email,
                vc.TEL_PHONE
            FROM request_register_vendor rr
                LEFT JOIN vendors v ON v.VENDORS_ID = rr.VENDORS_ID
                LEFT JOIN vendor_contacts vc ON vc.VENDOR_CONTACTS_ID = ${RequestVendorContactSqlSnippets.primaryVendorContactIdExpr('rr')}
            WHERE rr.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
            LIMIT 1
        `
    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', GprCApprovalSQL.num(dataItem.REQUEST_REGISTER_VENDOR_ID).toString())
    return sql
  },

  getMemberByEmpCode: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       EMPNAME
                                     , EMPSURNAME
                                     , EMPEMAIL
                            FROM
                                       person.member_fed
                            WHERE
                                       EMPCODE = 'dataItem.EMPCODE'
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.EMPCODE', dataItem['EMPCODE'] || '')

    return sql
  },

  getAssigneeByEmpCodeContact: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       EMPNAME
                                     , EMPEMAIL
                            FROM
                                       assignees_to
                            WHERE
                                       EMPCODE = 'dataItem.EMPCODE'
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.EMPCODE', dataItem['EMPCODE'] || '')

    return sql
  },

  getPeerCcRowsByNormalizedGroup: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       EMPCODE AS empcode
                                     , EMPNAME AS empName
                                     , EMPEMAIL AS empEmail
                                     , GROUP_CODE AS group_code
                                     , GROUP_NAME AS group_name
                            FROM
                                       assignees_to
                            WHERE
                                       (
                                           UPPER(TRIM(COALESCE(GROUP_CODE, ''))) = 'dataItem.TARGET_GROUP'
                                           OR REPLACE(REPLACE(REPLACE(REPLACE(UPPER(TRIM(COALESCE(GROUP_NAME, ''))), ' ', '_'), '(', ''), ')', ''), '-', '_')
                                               = 'dataItem.TARGET_GROUP'
                                           OR REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
                                               UPPER(TRIM(COALESCE(GROUP_CODE, ''))), ' ', ''), '_', ''), '-', ''), '(', ''), ')', ''), '.', '')
                                               = 'dataItem.TARGET_COMPACT'
                                           OR REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
                                               UPPER(TRIM(COALESCE(GROUP_NAME, ''))), ' ', ''), '_', ''), '-', ''), '(', ''), ')', ''), '.', '')
                                               = 'dataItem.TARGET_COMPACT'
                                       )
                                       AND INUSE = 1
                            ORDER BY
                                       ASSIGNEES_TO_ID ASC
        `

    sql = sql.replaceAll('dataItem.TARGET_GROUP', dataItem['TARGET_GROUP'] || '')
    sql = sql.replaceAll('dataItem.TARGET_COMPACT', dataItem['TARGET_COMPACT'] || '')

    return sql
  },

  getApprovalSteps: async (dataItem: any) => {
    let sql = `
                            SELECT 
                                       ras.REQUEST_APPROVAL_STEP_ID
                                     , ras.REQUEST_REGISTER_VENDOR_ID
                                     , ras.WORKFLOW_STEP_MASTER_ID
                                     , wsm.M_REQUEST_STATUS_ID AS M_REQUEST_STATUS_ID
                                     , ras.STEP_ORDER
                                     , ras.APPROVER_EMPCODE
                                     , ras.STEP_STATUS
                                     , mrs.STATUS_VALUE AS DESCRIPTION
                                     , wsm.STEP_CODE
                                     , wsm.ACTOR_TYPE
                                     , ras.GROUP_CODE
                                     , ras.ASSIGNMENT_MODE
                                     , ras.CREATE_BY
                                     , ras.CREATE_DATE
                                     , ras.UPDATE_BY
                                     , ras.UPDATE_DATE
                                     , mrs.STATUS_VALUE AS master_status_value
                                     , mrs.STATUS_VALUE AS master_status_label
                                     , CONCAT(m.EMPNAME, ' ', m.EMPSURNAME) AS approver_name
                            FROM
                                       request_approval_step ras
                                            INNER JOIN
                                       workflow_step_master wsm ON wsm.WORKFLOW_STEP_MASTER_ID = ras.WORKFLOW_STEP_MASTER_ID
                                                                           INNER JOIN
                                                                      m_request_status mrs ON mrs.M_REQUEST_STATUS_ID = wsm.M_REQUEST_STATUS_ID
                                            LEFT JOIN
                                       person.member_fed m ON m.EMPCODE = ras.APPROVER_EMPCODE
                            WHERE
                                       ras.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
                                       AND ras.INUSE = 1
                            ORDER BY
                                       ras.STEP_ORDER ASC
        `

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())

    return sql
  },

  updateApprovalStep: async (dataItem: any) => {
    let sql = `
                            UPDATE request_approval_step SET
                                       STEP_STATUS = LOWER('dataItem.STEP_STATUS')
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       REQUEST_APPROVAL_STEP_ID = dataItem.REQUEST_APPROVAL_STEP_ID;

                            UPDATE request_register_vendor rr
                            LEFT JOIN request_approval_step changed_step
                              ON changed_step.REQUEST_APPROVAL_STEP_ID = dataItem.REQUEST_APPROVAL_STEP_ID
                            LEFT JOIN request_approval_step active_step
                              ON active_step.REQUEST_REGISTER_VENDOR_ID = rr.REQUEST_REGISTER_VENDOR_ID
                             AND active_step.STEP_STATUS = 'in_progress'
                             AND active_step.INUSE = 1
                            LEFT JOIN workflow_step_master active_wsm
                              ON active_wsm.WORKFLOW_STEP_MASTER_ID = active_step.WORKFLOW_STEP_MASTER_ID
                            LEFT JOIN m_request_status active_status
                              ON active_status.M_REQUEST_STATUS_ID = active_wsm.M_REQUEST_STATUS_ID
                            LEFT JOIN m_request_status rejected_status
                              ON rejected_status.STATUS_VALUE = 'Rejected'
                              OR rejected_status.STATUS_VALUE = 'Rejected'
                            SET
                                       rr.REQUEST_STATE = CASE
                                           WHEN LOWER('dataItem.STEP_STATUS') = 'rejected' THEN 'rejected'
                                           WHEN active_step.REQUEST_APPROVAL_STEP_ID IS NOT NULL THEN 'in_progress'
                                           ELSE rr.REQUEST_STATE
                                       END
                                     , rr.CURRENT_REQUEST_APPROVAL_STEP_ID = CASE
                                           WHEN LOWER('dataItem.STEP_STATUS') = 'rejected' THEN changed_step.REQUEST_APPROVAL_STEP_ID
                                           WHEN active_step.REQUEST_APPROVAL_STEP_ID IS NOT NULL THEN active_step.REQUEST_APPROVAL_STEP_ID
                                           ELSE rr.CURRENT_REQUEST_APPROVAL_STEP_ID
                                       END
                                     , rr.CURRENT_M_REQUEST_STATUS_ID = CASE
                                           WHEN LOWER('dataItem.STEP_STATUS') = 'rejected' THEN rejected_status.M_REQUEST_STATUS_ID
                                           WHEN active_step.REQUEST_APPROVAL_STEP_ID IS NOT NULL THEN active_wsm.M_REQUEST_STATUS_ID
                                           ELSE rr.CURRENT_M_REQUEST_STATUS_ID
                                       END
                                     , rr.UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , rr.UPDATE_DATE = NOW()
                            WHERE
                                       rr.REQUEST_REGISTER_VENDOR_ID = changed_step.REQUEST_REGISTER_VENDOR_ID
        `

    sql = sql.replaceAll('dataItem.REQUEST_APPROVAL_STEP_ID', (dataItem['REQUEST_APPROVAL_STEP_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.STEP_STATUS', dataItem['STEP_STATUS'] || '')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || '')

    return sql
  },

  createApprovalLog: async (dataItem: any) => {
    let sql = `
                            INSERT INTO request_approval_log (
                                       REQUEST_REGISTER_VENDOR_ID
                                     , REQUEST_APPROVAL_STEP_ID
                                     , ACTION_BY
                                     , ACTION_BY_NAME
                                     , ACTION_TYPE
                                     , DESCRIPTION
                                     , REJECT_REASON
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , CREATE_DATE
                                     , UPDATE_DATE
                                     , INUSE
                            ) VALUES (
                                        dataItem.REQUEST_REGISTER_VENDOR_ID
                                     ,  dataItem.REQUEST_APPROVAL_STEP_ID
                                     , 'dataItem.ACTION_BY'
                                     , COALESCE(
                                           (SELECT CONCAT(pm.EMPNAME, ' ', pm.EMPSURNAME)
                                            FROM person.member_fed pm
                                            WHERE pm.EMPCODE = 'dataItem.ACTION_BY'
                                            LIMIT 1),
                                           'dataItem.ACTION_BY'
                                       )
                                     , 'dataItem.ACTION_TYPE'
                                     , LEFT('dataItem.REMARK', 100)
                                     , CASE
                                           WHEN LOWER('dataItem.ACTION_TYPE') IN ('rejected', 'vendor_disagreed') THEN LEFT('dataItem.REJECT_REASON', 500)
                                           ELSE NULL
                                       END
                                     , 'dataItem.ACTION_BY'
                                     , 'dataItem.ACTION_BY'
                                     , NOW()
                                     , NOW()
                                     , 1
                            )
        `

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.REQUEST_APPROVAL_STEP_ID', dataItem['REQUEST_APPROVAL_STEP_ID'] ? dataItem['REQUEST_APPROVAL_STEP_ID'].toString() : 'NULL')
    sql = sql.replaceAll('dataItem.ACTION_BY', dataItem['ACTION_BY'] || '')
    sql = sql.replaceAll('dataItem.ACTION_TYPE', dataItem['ACTION_TYPE'] || '')
    sql = sql.replaceAll('dataItem.REMARK', dataItem['REMARK'] || '')
    sql = sql.replaceAll('dataItem.REJECT_REASON', dataItem['REJECT_REASON'] ?? dataItem['REMARK'] ?? '')

    return sql
  },

  updateStatus: async (dataItem: any) => {
    let sql = `
                            UPDATE request_register_vendor SET
                                       CURRENT_M_REQUEST_STATUS_ID = COALESCE(${RequestStatusSqlSnippets.requestStatusIdByValueExpr("'dataItem.REQUEST_STATUS'")}, CURRENT_M_REQUEST_STATUS_ID)
                                     , REQUEST_STATE = CASE
                                           WHEN LOWER('dataItem.REQUEST_STATUS') = 'completed' THEN 'completed'
                                           WHEN LOWER('dataItem.REQUEST_STATUS') IN ('rejected', 'vendor disagreed') THEN 'rejected'
                                           ELSE REQUEST_STATE
                                       END
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
        `

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.REQUEST_STATUS', dataItem['REQUEST_STATUS'] || '')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || '')

    return sql
  },

  markRequestCompleted: async (dataItem: any) => {
    let sql = `
                            UPDATE request_register_vendor SET
                                       REQUEST_STATE = 'completed'
                                     , CURRENT_M_REQUEST_STATUS_ID = (
                                           SELECT M_REQUEST_STATUS_ID FROM workflow_step_master
                                           WHERE STEP_CODE = 'ACCOUNT_REGISTERED'
                                             AND INUSE = 1
                                           LIMIT 1
                                       )
                                     , CURRENT_REQUEST_APPROVAL_STEP_ID = NULL
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
        `

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || 'SYSTEM')

    return sql
  },

  getRequestStatusContext: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       rr.VENDORS_ID
                                     , rr.ASSIGN_TO
                                     , rvs.PROPOSED_VENDOR_CODE AS VENDOR_CODE_SELECTOR
                                      ${GprCSelectionSqlSnippets.gprCSelectionFields('rvs', 'rr')}
                                      , rvs.GPR_43_ACCEPTANCE_STATUS
                                      , v.VENDOR_REGION
                            FROM
                                       request_register_vendor rr
                                            LEFT JOIN
                                       vendors v ON v.VENDORS_ID = rr.VENDORS_ID
                                            LEFT JOIN
                                       request_vendor_selections rvs ON rvs.REQUEST_REGISTER_VENDOR_ID = rr.REQUEST_REGISTER_VENDOR_ID AND rvs.INUSE = 1
                            WHERE
                                       rr.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
                            ORDER BY
                                       rvs.REQUEST_VENDOR_SELECTIONS_ID DESC
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())

    return sql
  },

  updateVendorFftStatus: async (dataItem: any) => {
    let sql = `
                            UPDATE vendors SET
                                       FFT_STATUS = dataItem.FFT_STATUS
                            WHERE
                                       VENDORS_ID = dataItem.VENDORS_ID
        `

    sql = sql.replaceAll('dataItem.VENDORS_ID', (dataItem['VENDORS_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.FFT_STATUS', (dataItem['FFT_STATUS'] || 0).toString())

    return sql
  },

  getActiveAssigneeByEmpCodeAndGroupCode: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       ASSIGNEES_TO_ID
                                     , EMPCODE
                                     , EMPNAME
                                     , EMPEMAIL
                                     , GROUP_CODE
                                     , GROUP_NAME
                                     , INUSE
                            FROM
                                       assignees_to
                            WHERE
                                       EMPCODE = 'dataItem.EMPCODE'
                                       AND (
                                           UPPER(TRIM(COALESCE(GROUP_CODE, ''))) = 'dataItem.GROUP_CODE'
                                           OR REPLACE(REPLACE(REPLACE(REPLACE(UPPER(TRIM(COALESCE(GROUP_NAME, ''))), ' ', '_'), '(', ''), ')', ''), '-', '_')
                                               = 'dataItem.GROUP_CODE'
                                           OR REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
                                               UPPER(TRIM(COALESCE(GROUP_CODE, ''))), ' ', ''), '_', ''), '-', ''), '(', ''), ')', ''), '.', '')
                                               = 'dataItem.GROUP_COMPACT'
                                           OR REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
                                               UPPER(TRIM(COALESCE(GROUP_NAME, ''))), ' ', ''), '_', ''), '-', ''), '(', ''), ')', ''), '.', '')
                                               = 'dataItem.GROUP_COMPACT'
                                       )
                                       AND INUSE = 1
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.EMPCODE', dataItem['EMPCODE'] || '')
    sql = sql.replaceAll('dataItem.GROUP_CODE', dataItem['GROUP_CODE'] || '')
    sql = sql.replaceAll('dataItem.GROUP_COMPACT', dataItem['GROUP_COMPACT'] || '')

    return sql
  },
}


