import { GprCSelectionSqlSnippets } from '../common/GprCSelectionSqlSnippets'
import { RequestVendorContactSqlSnippets } from '../common/RequestVendorContactSqlSnippets'
import { RequestStatusSqlSnippets } from '../common/RequestStatusSqlSnippets'
import {
  APPROVAL_STEP_STATUS_ID_SQL,
  ApprovalMasterSqlSnippets,
} from '../_status-master/StatusMasterSQL'
import { RequestStateSqlSnippets } from '../_status-master/StatusMasterSQL'
import {
  GPR_C_FLOW_STATUS_ID_SQL,
  GprStatusSqlSnippets,
} from '../_status-master/StatusMasterSQL'
import { PersonSqlSnippets } from '../common/PersonSqlSnippets'
import { requireStatusId, requireVendorStatusId } from '../../utils/StatusId'

const escapeSqlText = (value: any) => String(value ?? '').replaceAll("'", "''")


export const GprCApprovalSQL = {
  num: (value: any) => Number(value) || 0,

  nullableDate: (value: any) => (value === 'NOW()' ? 'NOW()' : 'NULL'),

  likeValue: (value: any) => {
    let sql = '%dataItem.LIKE_VALUE%'
    sql = sql.replaceAll('dataItem.LIKE_VALUE', String(String(value ?? '').trim()))
    return sql
  },

  buildLikeCondition: (column: any, rawValue: any) => {
    const value = String(rawValue ?? '').trim()
    if (!value) return ''
    let condition = column + ' LIKE \'dataItem.LIKE_VALUE\''
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
        let sql = '(dataItem.FILTER_CLAUSE)'
        sql = sql.replaceAll('dataItem.FILTER_CLAUSE', clause)
        conditions.push(sql)
      }
    }

    return conditions
  },

  buildIdConditions: (dataItem: any, mapping: Record<string, string>) => {
    const conditions: string[] = []

    for (const filter of Array.isArray(dataItem.SEARCHFILTERS) ? dataItem.SEARCHFILTERS : []) {
      const column = mapping[String(filter?.id || '')]
      if (!column || filter?.value === null || filter?.value === undefined || filter?.value === '') continue

      const id = Number(filter.value)
      if (!Number.isInteger(id) || id <= 0) {
        throw new Error('Invalid status ID for ' + String(filter?.id || ''))
      }

      let sql = 'dataItem.STATUS_COLUMN = dataItem.STATUS_ID'
      sql = sql.replaceAll('dataItem.STATUS_COLUMN', column)
      sql = sql.replaceAll('dataItem.STATUS_ID', id.toString())
      conditions.push(sql)
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
          .map((item) => {
            let valueSql = '\'dataItem.FILTER_VALUE\''
            valueSql = valueSql.replaceAll('dataItem.FILTER_VALUE', escapeSqlText(item))
            return valueSql
          })
          .filter(Boolean)
        if (values.length > 0) {
          let condition = column + ' IN (dataItem.FILTER_VALUES)'
          condition = condition.replaceAll('dataItem.FILTER_VALUES', values.join(', '))
          conditions.push(condition)
        }
        continue
      }

      const safeValue = escapeSqlText(value)

      switch (fn) {
        case 'equals':
          {
            let condition = column + ' = \'dataItem.FILTER_VALUE\''
            condition = condition.replaceAll('dataItem.FILTER_VALUE', safeValue)
            conditions.push(condition)
          }
          break
        case 'notEqual':
          {
            let condition = column + ' <> \'dataItem.FILTER_VALUE\''
            condition = condition.replaceAll('dataItem.FILTER_VALUE', safeValue)
            conditions.push(condition)
          }
          break
        case 'startsWith':
          {
            let condition = column + ' LIKE \'dataItem.FILTER_VALUE%\''
            condition = condition.replaceAll('dataItem.FILTER_VALUE', safeValue)
            conditions.push(condition)
          }
          break
        case 'endsWith':
          {
            let condition = column + ' LIKE \'%dataItem.FILTER_VALUE\''
            condition = condition.replaceAll('dataItem.FILTER_VALUE', safeValue)
            conditions.push(condition)
          }
          break
        case 'contains':
        default:
          {
            let condition = column + ' LIKE \'%dataItem.FILTER_VALUE%\''
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
        let sql = 'dataItem.SORT_COLUMN dataItem.SORT_DIRECTION'
        sql = sql.replaceAll('dataItem.SORT_COLUMN', String(column))
        sql = sql.replaceAll('dataItem.SORT_DIRECTION', String(item?.desc ? 'DESC' : 'ASC'))
        return sql
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
            SELECT
                f.*,
                dataItem.GPR_C_FLOW_STATUS_SQL AS FLOW_STATUS
            FROM REQUEST_VENDOR_GPR_C_FLOWS f
            WHERE f.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
              AND f.INUSE = 1
            ORDER BY f.REQUEST_VENDOR_GPR_C_FLOWS_ID DESC
            LIMIT 1
        `
    sql = sql.replaceAll('dataItem.GPR_C_FLOW_STATUS_SQL', String(GprStatusSqlSnippets.flowStatusCodeExpr('f')))
    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', GprCApprovalSQL.num(dataItem.REQUEST_REGISTER_VENDOR_ID).toString())
    return sql
  },

  insertFlow: (dataItem: any) => {
    let sql = `
            INSERT INTO REQUEST_VENDOR_GPR_C_FLOWS (
                REQUEST_REGISTER_VENDOR_ID,
                REQUEST_VENDOR_SELECTIONS_ID,
                M_GPR_C_FLOW_STATUS_ID,
                CURRENT_STEP_CODE,
                REQUESTER_EMPCODE,
                DESCRIPTION,
                CREATE_BY,
                UPDATE_BY,
                INUSE
            ) VALUES (
                dataItem.REQUEST_REGISTER_VENDOR_ID,
                dataItem.REQUEST_VENDOR_SELECTIONS_ID,
                dataItem.M_GPR_C_FLOW_STATUS_ID,
                'dataItem.CURRENT_STEP_CODE',
                'dataItem.REQUESTER_EMPCODE',
                LEFT(CONCAT('dataItem.FLOW_STATUS', ': ', 'dataItem.CURRENT_STEP_CODE'), 100),
                'dataItem.CREATE_BY',
                'dataItem.UPDATE_BY',
                1
            )
        `
    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', GprCApprovalSQL.num(dataItem.REQUEST_REGISTER_VENDOR_ID).toString())
    sql = sql.replaceAll(
      'dataItem.REQUEST_VENDOR_SELECTIONS_ID',
      dataItem.REQUEST_VENDOR_SELECTIONS_ID ? GprCApprovalSQL.num(dataItem.REQUEST_VENDOR_SELECTIONS_ID).toString() : 'NULL'
    )
    const flowStatusId = requireStatusId(dataItem.M_GPR_C_FLOW_STATUS_ID, 'M_GPR_C_FLOW_STATUS_ID')
    sql = sql.replaceAll(
      'dataItem.M_GPR_C_FLOW_STATUS_ID',
      flowStatusId.toString()
    )
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
                M_GPR_C_FLOW_STATUS_ID = dataItem.M_GPR_C_FLOW_STATUS_ID,
                CURRENT_STEP_CODE = 'dataItem.CURRENT_STEP_CODE',
                REQUESTER_EMPCODE = 'dataItem.REQUESTER_EMPCODE',
                REQUESTER_SUBMITTED_AT = NOW(),
                GPR_C_APPROVER_EMPCODE = 'dataItem.GPR_C_APPROVER_EMPCODE',
                GPR_C_APPROVER_NAME = 'dataItem.GPR_C_APPROVER_NAME',
                GPR_C_APPROVER_EMAIL = 'dataItem.GPR_C_APPROVER_EMAIL',
                PC_PIC_EMPCODE = 'dataItem.PC_PIC_EMPCODE',
                PC_PIC_NAME = 'dataItem.PC_PIC_NAME',
                PC_PIC_EMAIL = 'dataItem.PC_PIC_EMAIL',
                DESCRIPTION = LEFT(CONCAT('dataItem.FLOW_STATUS', ': ', 'dataItem.CURRENT_STEP_CODE'), 100),
                UPDATE_BY = 'dataItem.UPDATE_BY',
                UPDATE_DATE = NOW()
            WHERE REQUEST_VENDOR_GPR_C_FLOWS_ID = dataItem.REQUEST_VENDOR_GPR_C_FLOWS_ID
        `
    sql = sql.replaceAll(
      'dataItem.REQUEST_VENDOR_SELECTIONS_ID',
      dataItem.REQUEST_VENDOR_SELECTIONS_ID ? GprCApprovalSQL.num(dataItem.REQUEST_VENDOR_SELECTIONS_ID).toString() : 'REQUEST_VENDOR_SELECTIONS_ID'
    )
    const flowStatusId = requireStatusId(dataItem.M_GPR_C_FLOW_STATUS_ID, 'M_GPR_C_FLOW_STATUS_ID')
    sql = sql.replaceAll(
      'dataItem.M_GPR_C_FLOW_STATUS_ID',
      flowStatusId.toString()
    )
    sql = sql.replaceAll('dataItem.FLOW_STATUS', String(dataItem.FLOW_STATUS || 'in_progress').toLowerCase())
    sql = sql.replaceAll('dataItem.CURRENT_STEP_CODE', dataItem.CURRENT_STEP_CODE || 'REQUESTER_APPROVER')
    sql = sql.replaceAll('dataItem.REQUESTER_EMPCODE', dataItem.REQUESTER_EMPCODE)
    sql = sql.replaceAll('dataItem.GPR_C_APPROVER_EMPCODE', dataItem.GPR_C_APPROVER_EMPCODE)
    sql = sql.replaceAll('dataItem.GPR_C_APPROVER_NAME', dataItem.GPR_C_APPROVER_NAME)
    sql = sql.replaceAll('dataItem.GPR_C_APPROVER_EMAIL', dataItem.GPR_C_APPROVER_EMAIL)
    sql = sql.replaceAll('dataItem.PC_PIC_EMPCODE', dataItem.PC_PIC_EMPCODE)
    sql = sql.replaceAll('dataItem.PC_PIC_NAME', dataItem.PC_PIC_NAME)
    sql = sql.replaceAll('dataItem.PC_PIC_EMAIL', dataItem.PC_PIC_EMAIL)
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem.UPDATE_BY || 'SYSTEM')
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_GPR_C_FLOWS_ID', GprCApprovalSQL.num(dataItem.REQUEST_VENDOR_GPR_C_FLOWS_ID).toString())
    return sql
  },

  updateFlowStatus: (dataItem: any) => {
    let sql = `
            UPDATE REQUEST_VENDOR_GPR_C_FLOWS SET
                M_GPR_C_FLOW_STATUS_ID = dataItem.M_GPR_C_FLOW_STATUS_ID,
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
    const flowStatusId = requireStatusId(dataItem.M_GPR_C_FLOW_STATUS_ID, 'M_GPR_C_FLOW_STATUS_ID')
    sql = sql.replaceAll(
      'dataItem.M_GPR_C_FLOW_STATUS_ID',
      flowStatusId.toString()
    )
    sql = sql.replaceAll('dataItem.FLOW_STATUS', String(dataItem.FLOW_STATUS || '').toLowerCase())
    const currentStepCode = dataItem.CURRENT_STEP_CODE === null || dataItem.CURRENT_STEP_CODE === undefined
      ? 'Finished'
      : String(dataItem.CURRENT_STEP_CODE)
    sql = sql.replaceAll('dataItem.CURRENT_STEP_CODE', "'" + currentStepCode + "'")
    sql = sql.replaceAll('dataItem.COMPLETED_AT', GprCApprovalSQL.nullableDate(dataItem.COMPLETED_AT))
    sql = sql.replaceAll('dataItem.REJECTED_AT', GprCApprovalSQL.nullableDate(dataItem.REJECTED_AT))
    sql = sql.replaceAll('dataItem.REJECTED_BY', escapeSqlText(dataItem.REJECTED_BY))
    sql = sql.replaceAll('dataItem.REJECTED_REMARK', escapeSqlText(dataItem.REJECTED_REMARK))
    sql = sql.replaceAll('dataItem.UPDATE_BY', escapeSqlText(dataItem.UPDATE_BY || 'SYSTEM'))
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
                M_APPROVAL_STEP_STATUS_ID,
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
                dataItem.M_APPROVAL_STEP_STATUS_ID,
                LEFT(COALESCE(NULLIF('dataItem.STEP_NAME', ''), 'dataItem.STEP_CODE'), 100),
                'dataItem.CREATE_BY',
                'dataItem.UPDATE_BY',
                1
            )
        `
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_GPR_C_FLOWS_ID', GprCApprovalSQL.num(dataItem.REQUEST_VENDOR_GPR_C_FLOWS_ID).toString())
    sql = sql.replaceAll('dataItem.STEP_ORDER', GprCApprovalSQL.num(dataItem.STEP_ORDER).toString())
    sql = sql.replaceAll('dataItem.STEP_CODE', escapeSqlText(dataItem.STEP_CODE))
    sql = sql.replaceAll('dataItem.STEP_NAME', escapeSqlText(dataItem.STEP_NAME))
    sql = sql.replaceAll('dataItem.APPROVER_EMPCODE', escapeSqlText(dataItem.APPROVER_EMPCODE))
    sql = sql.replaceAll('dataItem.APPROVER_NAME', escapeSqlText(dataItem.APPROVER_NAME))
    sql = sql.replaceAll('dataItem.APPROVER_EMAIL', escapeSqlText(dataItem.APPROVER_EMAIL))
    const approvalStatusId = requireStatusId(dataItem.M_APPROVAL_STEP_STATUS_ID, 'M_APPROVAL_STEP_STATUS_ID')
    sql = sql.replaceAll(
      'dataItem.M_APPROVAL_STEP_STATUS_ID',
      approvalStatusId.toString()
    )
    sql = sql.replaceAll('dataItem.CREATE_BY', escapeSqlText(dataItem.CREATE_BY || 'SYSTEM'))
    sql = sql.replaceAll('dataItem.UPDATE_BY', escapeSqlText(dataItem.UPDATE_BY || dataItem.CREATE_BY || 'SYSTEM'))
    return sql
  },
  getStepsByFlow: (dataItem: any) => {
    let sql = `
            SELECT
                s.*,
                dataItem.APPROVAL_STEP_STATUS_SQL AS STEP_STATUS,
                f.REQUEST_REGISTER_VENDOR_ID
            FROM REQUEST_VENDOR_GPR_C_STEPS s
                JOIN REQUEST_VENDOR_GPR_C_FLOWS f
                    ON f.REQUEST_VENDOR_GPR_C_FLOWS_ID = s.REQUEST_VENDOR_GPR_C_FLOWS_ID
            WHERE s.REQUEST_VENDOR_GPR_C_FLOWS_ID = dataItem.REQUEST_VENDOR_GPR_C_FLOWS_ID
              AND s.INUSE = 1
            ORDER BY s.STEP_ORDER ASC
        `
    sql = sql.replaceAll('dataItem.APPROVAL_STEP_STATUS_SQL', String(ApprovalMasterSqlSnippets.stepStatusCodeExpr('s')))
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_GPR_C_FLOWS_ID', GprCApprovalSQL.num(dataItem.REQUEST_VENDOR_GPR_C_FLOWS_ID).toString())
    return sql
  },
  getCurrentStepByFlow: (dataItem: any) => {
    let sql = `
            SELECT
                s.*,
                dataItem.APPROVAL_STEP_STATUS_SQL AS STEP_STATUS,
                f.REQUEST_REGISTER_VENDOR_ID
            FROM REQUEST_VENDOR_GPR_C_STEPS s
                JOIN REQUEST_VENDOR_GPR_C_FLOWS f
                    ON f.REQUEST_VENDOR_GPR_C_FLOWS_ID = s.REQUEST_VENDOR_GPR_C_FLOWS_ID
            WHERE s.REQUEST_VENDOR_GPR_C_FLOWS_ID = dataItem.REQUEST_VENDOR_GPR_C_FLOWS_ID
              AND s.M_APPROVAL_STEP_STATUS_ID = dataItem.APPROVAL_STEP_IN_PROGRESS_STATUS_ID
              AND s.INUSE = 1
            ORDER BY s.STEP_ORDER ASC
            LIMIT 1
        `
    sql = sql.replaceAll('dataItem.APPROVAL_STEP_STATUS_SQL', String(ApprovalMasterSqlSnippets.stepStatusCodeExpr('s')))
    sql = sql.replaceAll('dataItem.APPROVAL_STEP_IN_PROGRESS_STATUS_ID', String(APPROVAL_STEP_STATUS_ID_SQL.IN_PROGRESS))
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_GPR_C_FLOWS_ID', GprCApprovalSQL.num(dataItem.REQUEST_VENDOR_GPR_C_FLOWS_ID).toString())
    return sql
  },
  updateStepAction: (dataItem: any) => {
    let sql = `
            UPDATE REQUEST_VENDOR_GPR_C_STEPS SET
                M_APPROVAL_STEP_STATUS_ID = dataItem.M_APPROVAL_STEP_STATUS_ID,
                ACTION_BY = 'dataItem.ACTION_BY',
                ACTION_TYPE = 'dataItem.ACTION_TYPE',
                DESCRIPTION = LEFT(COALESCE(NULLIF('dataItem.ACTION_REMARK', ''), 'dataItem.ACTION_TYPE'), 100),
                UPDATE_BY = 'dataItem.UPDATE_BY',
                UPDATE_DATE = NOW()
            WHERE REQUEST_VENDOR_GPR_C_STEPS_ID = dataItem.REQUEST_VENDOR_GPR_C_STEPS_ID
        `
    const approvalStatusId = requireStatusId(dataItem.M_APPROVAL_STEP_STATUS_ID, 'M_APPROVAL_STEP_STATUS_ID')
    sql = sql.replaceAll(
      'dataItem.M_APPROVAL_STEP_STATUS_ID',
      approvalStatusId.toString()
    )
    sql = sql.replaceAll('dataItem.ACTION_BY', escapeSqlText(dataItem.ACTION_BY))
    sql = sql.replaceAll('dataItem.ACTION_TYPE', escapeSqlText(dataItem.ACTION_TYPE))
    sql = sql.replaceAll('dataItem.ACTION_REMARK', escapeSqlText(dataItem.ACTION_REMARK))
    sql = sql.replaceAll('dataItem.UPDATE_BY', escapeSqlText(dataItem.UPDATE_BY || dataItem.ACTION_BY || 'SYSTEM'))
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_GPR_C_STEPS_ID', GprCApprovalSQL.num(dataItem.REQUEST_VENDOR_GPR_C_STEPS_ID).toString())
    return sql
  },

  activateStep: (dataItem: any) => {
    let sql = `
            UPDATE REQUEST_VENDOR_GPR_C_STEPS SET
                M_APPROVAL_STEP_STATUS_ID = dataItem.M_APPROVAL_STEP_STATUS_ID,
                UPDATE_BY = 'dataItem.UPDATE_BY',
                UPDATE_DATE = NOW()
            WHERE REQUEST_VENDOR_GPR_C_STEPS_ID = dataItem.REQUEST_VENDOR_GPR_C_STEPS_ID
        `
    sql = sql.replaceAll(
      'dataItem.M_APPROVAL_STEP_STATUS_ID',
      requireStatusId(dataItem.M_APPROVAL_STEP_STATUS_ID, 'M_APPROVAL_STEP_STATUS_ID').toString()
    )
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem.UPDATE_BY || 'SYSTEM')
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_GPR_C_STEPS_ID', GprCApprovalSQL.num(dataItem.REQUEST_VENDOR_GPR_C_STEPS_ID).toString())
    return sql
  },

  skipPendingSteps: (dataItem: any) => {
    let sql = `
            UPDATE REQUEST_VENDOR_GPR_C_STEPS SET
                M_APPROVAL_STEP_STATUS_ID = dataItem.M_APPROVAL_STEP_SKIPPED_STATUS_ID,
                UPDATE_BY = 'dataItem.UPDATE_BY',
                UPDATE_DATE = NOW()
            WHERE REQUEST_VENDOR_GPR_C_FLOWS_ID = dataItem.REQUEST_VENDOR_GPR_C_FLOWS_ID
              AND M_APPROVAL_STEP_STATUS_ID = dataItem.M_APPROVAL_STEP_PENDING_STATUS_ID
              AND INUSE = 1
        `
    sql = sql.replaceAll(
      'dataItem.M_APPROVAL_STEP_SKIPPED_STATUS_ID',
      requireStatusId(dataItem.M_APPROVAL_STEP_SKIPPED_STATUS_ID, 'M_APPROVAL_STEP_SKIPPED_STATUS_ID').toString()
    )
    sql = sql.replaceAll(
      'dataItem.M_APPROVAL_STEP_PENDING_STATUS_ID',
      requireStatusId(dataItem.M_APPROVAL_STEP_PENDING_STATUS_ID, 'M_APPROVAL_STEP_PENDING_STATUS_ID').toString()
    )
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
                M_ACTION_RESULT_STATUS_ID,
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
                dataItem.M_ACTION_RESULT_STATUS_ID,
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
    const actionResultStatusId = requireStatusId(dataItem.M_ACTION_RESULT_STATUS_ID, 'M_ACTION_RESULT_STATUS_ID')
    sql = sql.replaceAll(
      'dataItem.M_ACTION_RESULT_STATUS_ID',
      actionResultStatusId.toString()
    )
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem.CREATE_BY || 'SYSTEM')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem.UPDATE_BY || dataItem.CREATE_BY || 'SYSTEM')
    return sql
  },
  updateActionRequiredResult: (dataItem: any) => {
    const actionResultStatusId = GprCApprovalSQL.num(dataItem.M_ACTION_RESULT_STATUS_ID)
    if (!actionResultStatusId) throw new Error('Invalid action result status ID')

    let sql = `
            UPDATE REQUEST_VENDOR_GPR_C_ACTION_REQUIRED SET
                M_ACTION_RESULT_STATUS_ID = dataItem.M_ACTION_RESULT_STATUS_ID,
                RESULT_REMARK = 'dataItem.RESULT_REMARK',
                RESULT_BY = 'dataItem.RESULT_BY',
                RESULT_AT = NOW(),
                DESCRIPTION = LEFT(COALESCE(
                    NULLIF('dataItem.RESULT_REMARK', ''),
                    (SELECT status_master.STATUS_LABEL_EN
                     FROM m_action_result_status status_master
                     WHERE status_master.M_ACTION_RESULT_STATUS_ID = dataItem.M_ACTION_RESULT_STATUS_ID
                       AND status_master.INUSE = 1
                     LIMIT 1)
                ), 100),
                UPDATE_BY = 'dataItem.UPDATE_BY',
                UPDATE_DATE = NOW()
            WHERE REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID = dataItem.REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID
              AND INUSE = 1
              AND EXISTS (
                  SELECT 1
                  FROM m_action_result_status status_master
                  WHERE status_master.M_ACTION_RESULT_STATUS_ID = dataItem.M_ACTION_RESULT_STATUS_ID
                    AND status_master.INUSE = 1
              )
        `
    sql = sql.replaceAll('dataItem.M_ACTION_RESULT_STATUS_ID', actionResultStatusId.toString())
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
                dataItem.ACTION_RESULT_STATUS_SQL AS RESULT_STATUS,
                f.REQUEST_REGISTER_VENDOR_ID
            FROM REQUEST_VENDOR_GPR_C_ACTION_REQUIRED ar
                JOIN REQUEST_VENDOR_GPR_C_FLOWS f
                    ON f.REQUEST_VENDOR_GPR_C_FLOWS_ID = ar.REQUEST_VENDOR_GPR_C_FLOWS_ID
            WHERE ar.REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID = dataItem.REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID
              AND ar.INUSE = 1
            LIMIT 1
        `
    sql = sql.replaceAll('dataItem.ACTION_RESULT_STATUS_SQL', String(GprStatusSqlSnippets.actionResultStatusCodeExpr('ar')))
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID', GprCApprovalSQL.num(dataItem.REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID).toString())
    return sql
  },
  getActionRequiredQueueByPicEmail: (dataItem: any) => {
    let sql = `
            SELECT
                ar.*,
                dataItem.ACTION_RESULT_STATUS_SQL AS RESULT_STATUS,
                dataItem.GPR_C_FLOW_STATUS_SQL AS FLOW_STATUS,
                f.CURRENT_STEP_CODE,
                s.STEP_NAME,
                rr.REQUEST_NUMBER,
                dataItem.REQUEST_STATUS_SQL AS REQUEST_STATUS,
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
              AND ar.M_ACTION_RESULT_STATUS_ID IN (
                  dataItem.NON_TERMINAL_ACTION_RESULT_STATUS_IDS_SQL
              )
            ORDER BY ar.SENT_AT DESC, ar.REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID DESC
        `
    sql = sql.replaceAll('dataItem.ACTION_RESULT_STATUS_SQL', String(GprStatusSqlSnippets.actionResultStatusCodeExpr('ar')))
    sql = sql.replaceAll('dataItem.GPR_C_FLOW_STATUS_SQL', String(GprStatusSqlSnippets.flowStatusCodeExpr('f')))
    sql = sql.replaceAll('dataItem.REQUEST_STATUS_SQL', String(RequestStatusSqlSnippets.requestStatusExpr('rr')))
    sql = sql.replaceAll('dataItem.NON_TERMINAL_ACTION_RESULT_STATUS_IDS_SQL', String(GprStatusSqlSnippets.nonTerminalActionResultStatusIdsExpr()))
    sql = sql.replaceAll('dataItem.PIC_EMAIL', dataItem.PIC_EMAIL)
    return sql
  },

  getActionRequiredQueueByPicEmailPaginated: (dataItem: any) => {
    let actionResultStatusSql = 't.M_ACTION_RESULT_STATUS_ID IN (dataItem.ACTION_RESULT_STATUS_IDS)'
    actionResultStatusSql = actionResultStatusSql.replaceAll(
      'dataItem.ACTION_RESULT_STATUS_IDS',
      GprStatusSqlSnippets.nonTerminalActionResultStatusIdsExpr(),
    )

    const conditions = [
      't.PIC_EMAIL_NORMALIZED = LOWER(\'dataItem.PIC_EMAIL\')',
      actionResultStatusSql,
      ...GprCApprovalSQL.buildKeywordConditions(dataItem, {
        request_number: ['t.REQUEST_NUMBER', 'CAST(t.REQUEST_REGISTER_VENDOR_ID AS CHAR)'],
        vendor_name: ['t.COMPANY_NAME'],
        step_keyword: ['t.STAGE_NAME', 't.STAGE_CODE'],
      }),
      ...GprCApprovalSQL.buildIdConditions(dataItem, {
        M_REQUEST_STATUS_ID: 't.M_REQUEST_STATUS_ID',
      }),
      ...GprCApprovalSQL.buildColumnFilterConditions(dataItem, {
        request_number: 't.REQUEST_NUMBER',
        company_name: 't.COMPANY_NAME',
        STAGE_NAME: 't.STAGE_NAME',
        STAGE_CODE: 't.STAGE_CODE',
        REQUIRED_DETAIL: 't.REQUIRED_DETAIL',
        M_ACTION_RESULT_STATUS_ID: 't.M_ACTION_RESULT_STATUS_ID',
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
        M_ACTION_RESULT_STATUS_ID: 't.M_ACTION_RESULT_STATUS_ID',
        SENT_AT: 't.SENT_AT',
      },
      't.SENT_AT DESC, t.REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID DESC'
    )
    const offset = GprCApprovalSQL.num(dataItem.START)
    const limit = GprCApprovalSQL.num(dataItem.LIMIT) || 20
    let innerQuery = `
            (
                SELECT
                    ar.*,
                    dataItem.ACTION_RESULT_STATUS_SQL AS RESULT_STATUS,
                    f.REQUEST_REGISTER_VENDOR_ID,
                    LOWER(ar.PIC_EMAIL) AS PIC_EMAIL_NORMALIZED,
                    dataItem.GPR_C_FLOW_STATUS_SQL AS FLOW_STATUS,
                    f.CURRENT_STEP_CODE,
                    s.STEP_NAME,
                    rr.REQUEST_NUMBER,
                    rr.CURRENT_M_REQUEST_STATUS_ID AS M_REQUEST_STATUS_ID,
                    dataItem.REQUEST_STATUS_SQL AS REQUEST_STATUS,
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
    innerQuery = innerQuery.replaceAll('dataItem.ACTION_RESULT_STATUS_SQL', String(GprStatusSqlSnippets.actionResultStatusCodeExpr('ar')))
    innerQuery = innerQuery.replaceAll('dataItem.GPR_C_FLOW_STATUS_SQL', String(GprStatusSqlSnippets.flowStatusCodeExpr('f')))
    innerQuery = innerQuery.replaceAll('dataItem.REQUEST_STATUS_SQL', String(RequestStatusSqlSnippets.requestStatusExpr('rr')))

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
                dataItem.GPR_C_FLOW_STATUS_SQL AS FLOW_STATUS,
                s.REQUEST_VENDOR_GPR_C_STEPS_ID,
                s.STEP_ORDER,
                s.STEP_CODE,
                s.STEP_NAME,
                s.APPROVER_EMPCODE,
                s.APPROVER_NAME,
                s.APPROVER_EMAIL,
                s.M_APPROVAL_STEP_STATUS_ID,
                dataItem.APPROVAL_STEP_STATUS_SQL AS STEP_STATUS,
                rr.REQUEST_NUMBER,
                dataItem.REQUEST_STATUS_SQL AS REQUEST_STATUS,
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
                COALESCE(vc_sel.CONTACT_NAME, vc_fallback.CONTACT_NAME) AS CONTACT_NAME,
                COALESCE(vc_sel.EMAIL, vc_fallback.EMAIL, v.EMAILMAIN) AS VENDOR_EMAIL,
                COALESCE(vc_sel.TEL_PHONE, vc_fallback.TEL_PHONE) AS TEL_PHONE
            FROM REQUEST_VENDOR_GPR_C_FLOWS f
                JOIN REQUEST_VENDOR_GPR_C_STEPS s
                    ON s.REQUEST_VENDOR_GPR_C_FLOWS_ID = f.REQUEST_VENDOR_GPR_C_FLOWS_ID
                    -- Keep actionable steps plus this approver's action history (approved/rejected),
                    -- so a task stays visible after it has been actioned.
                    AND s.M_APPROVAL_STEP_STATUS_ID IN (
                        dataItem.APPROVAL_STEP_IN_PROGRESS_STATUS_ID,
                        dataItem.APPROVAL_STEP_APPROVED_STATUS_ID,
                        dataItem.APPROVAL_STEP_REJECTED_STATUS_ID
                    )
                    AND s.INUSE = 1
                JOIN request_register_vendor rr
                    ON rr.REQUEST_REGISTER_VENDOR_ID = f.REQUEST_REGISTER_VENDOR_ID
                LEFT JOIN vendors v
                    ON v.VENDORS_ID = rr.VENDORS_ID
                LEFT JOIN vendor_contacts vc_sel
                    ON vc_sel.VENDOR_CONTACTS_ID = dataItem.PRIMARY_VENDOR_CONTACT_ID_SQL
                    AND vc_sel.INUSE = 1
                LEFT JOIN vendor_contacts vc_fallback
                    ON vc_fallback.VENDOR_CONTACTS_ID = dataItem.FIRST_ACTIVE_VENDOR_CONTACT_ID_SQL
                    AND vc_fallback.INUSE = 1
            WHERE f.INUSE = 1
              AND s.APPROVER_EMPCODE = 'dataItem.APPROVER_EMPCODE'
            ORDER BY f.REQUEST_VENDOR_GPR_C_FLOWS_ID DESC
        `
    sql = sql.replaceAll('dataItem.GPR_C_FLOW_STATUS_SQL', String(GprStatusSqlSnippets.flowStatusCodeExpr('f')))
    sql = sql.replaceAll('dataItem.APPROVAL_STEP_STATUS_SQL', String(ApprovalMasterSqlSnippets.stepStatusCodeExpr('s')))
    sql = sql.replaceAll('dataItem.REQUEST_STATUS_SQL', String(RequestStatusSqlSnippets.requestStatusExpr('rr')))
    sql = sql.replaceAll(
      'dataItem.APPROVAL_STEP_IN_PROGRESS_STATUS_ID',
      String(GprCApprovalSQL.num(dataItem.M_APPROVAL_STEP_IN_PROGRESS_STATUS_ID) || APPROVAL_STEP_STATUS_ID_SQL.IN_PROGRESS)
    )
    sql = sql.replaceAll('dataItem.APPROVAL_STEP_APPROVED_STATUS_ID', String(APPROVAL_STEP_STATUS_ID_SQL.APPROVED))
    sql = sql.replaceAll('dataItem.APPROVAL_STEP_REJECTED_STATUS_ID', String(APPROVAL_STEP_STATUS_ID_SQL.REJECTED))
    sql = sql.replaceAll('dataItem.PRIMARY_VENDOR_CONTACT_ID_SQL', String(RequestVendorContactSqlSnippets.primaryVendorContactIdExpr('rr')))
    sql = sql.replaceAll('dataItem.FIRST_ACTIVE_VENDOR_CONTACT_ID_SQL', String(RequestVendorContactSqlSnippets.firstActiveVendorContactIdExpr('v')))
    sql = sql.replaceAll('dataItem.APPROVER_EMPCODE', dataItem.APPROVER_EMPCODE)
    return sql
  },

  getQueueByApproverPaginated: (dataItem: any) => {
    const conditions = [
      't.APPROVER_EMPCODE = \'dataItem.APPROVER_EMPCODE\'',
      ...GprCApprovalSQL.buildKeywordConditions(dataItem, {
        request_number: ['t.REQUEST_NUMBER', 'CAST(t.REQUEST_REGISTER_VENDOR_ID AS CHAR)'],
        vendor_name: ['t.COMPANY_NAME'],
        step_keyword: ['t.STEP_NAME', 't.STEP_CODE'],
      }),
      ...GprCApprovalSQL.buildIdConditions(dataItem, {
        M_REQUEST_STATUS_ID: 't.M_REQUEST_STATUS_ID',
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
    let innerQuery = `
            (
                SELECT
                    f.*,
                    dataItem.GPR_C_FLOW_STATUS_SQL AS FLOW_STATUS,
                    s.REQUEST_VENDOR_GPR_C_STEPS_ID,
                    s.STEP_ORDER,
                    s.STEP_CODE,
                    s.STEP_NAME,
                    s.APPROVER_EMPCODE,
                    s.APPROVER_NAME,
                    s.APPROVER_EMAIL,
                    s.M_APPROVAL_STEP_STATUS_ID,
                    dataItem.APPROVAL_STEP_STATUS_SQL AS STEP_STATUS,
                    rr.REQUEST_NUMBER,
                    rr.CURRENT_M_REQUEST_STATUS_ID AS M_REQUEST_STATUS_ID,
                    dataItem.REQUEST_STATUS_SQL AS REQUEST_STATUS,
                    rr.SUPPORTPRODUCT_PROCESS,
                    rr.PURCHASE_FREQUENCY,
                    rr.REQUEST_BY_EMPLOYEECODE,
                    rr.CREATE_DATE AS REQUEST_CREATE_DATE,
                    v.COMPANY_NAME,
                    v.ADDRESS,
                    v.VENDOR_REGION,
                    COALESCE(vc_sel.CONTACT_NAME, vc_fallback.CONTACT_NAME) AS CONTACT_NAME,
                    COALESCE(vc_sel.EMAIL, vc_fallback.EMAIL, v.EMAILMAIN) AS VENDOR_EMAIL,
                    COALESCE(vc_sel.TEL_PHONE, vc_fallback.TEL_PHONE) AS TEL_PHONE
                FROM REQUEST_VENDOR_GPR_C_FLOWS f
                    JOIN REQUEST_VENDOR_GPR_C_STEPS s
                        ON s.REQUEST_VENDOR_GPR_C_FLOWS_ID = f.REQUEST_VENDOR_GPR_C_FLOWS_ID
                        -- Keep actionable steps plus this approver's action history (approved/rejected),
                        -- so a task stays visible after it has been actioned. The Approve/Reject/Action
                        -- Required buttons are hidden on the frontend when STEP_STATUS is not 'in_progress'.
                        AND s.M_APPROVAL_STEP_STATUS_ID IN (
                            dataItem.APPROVAL_STEP_IN_PROGRESS_STATUS_ID,
                            dataItem.APPROVAL_STEP_APPROVED_STATUS_ID,
                            dataItem.APPROVAL_STEP_REJECTED_STATUS_ID
                        )
                        AND s.INUSE = 1
                    JOIN request_register_vendor rr
                        ON rr.REQUEST_REGISTER_VENDOR_ID = f.REQUEST_REGISTER_VENDOR_ID
                    LEFT JOIN vendors v
                        ON v.VENDORS_ID = rr.VENDORS_ID
                    LEFT JOIN vendor_contacts vc_sel
                        ON vc_sel.VENDOR_CONTACTS_ID = dataItem.PRIMARY_VENDOR_CONTACT_ID_SQL
                        AND vc_sel.INUSE = 1
                    LEFT JOIN vendor_contacts vc_fallback
                        ON vc_fallback.VENDOR_CONTACTS_ID = dataItem.FIRST_ACTIVE_VENDOR_CONTACT_ID_SQL
                        AND vc_fallback.INUSE = 1
                WHERE f.INUSE = 1
            ) t
        `
    innerQuery = innerQuery.replaceAll('dataItem.GPR_C_FLOW_STATUS_SQL', String(GprStatusSqlSnippets.flowStatusCodeExpr('f')))
    innerQuery = innerQuery.replaceAll('dataItem.APPROVAL_STEP_STATUS_SQL', String(ApprovalMasterSqlSnippets.stepStatusCodeExpr('s')))
    innerQuery = innerQuery.replaceAll('dataItem.REQUEST_STATUS_SQL', String(RequestStatusSqlSnippets.requestStatusExpr('rr')))
    innerQuery = innerQuery.replaceAll('dataItem.APPROVAL_STEP_IN_PROGRESS_STATUS_ID', String(APPROVAL_STEP_STATUS_ID_SQL.IN_PROGRESS))
    innerQuery = innerQuery.replaceAll('dataItem.APPROVAL_STEP_APPROVED_STATUS_ID', String(APPROVAL_STEP_STATUS_ID_SQL.APPROVED))
    innerQuery = innerQuery.replaceAll('dataItem.APPROVAL_STEP_REJECTED_STATUS_ID', String(APPROVAL_STEP_STATUS_ID_SQL.REJECTED))
    innerQuery = innerQuery.replaceAll('dataItem.PRIMARY_VENDOR_CONTACT_ID_SQL', String(RequestVendorContactSqlSnippets.primaryVendorContactIdExpr('rr')))
    innerQuery = innerQuery.replaceAll('dataItem.FIRST_ACTIVE_VENDOR_CONTACT_ID_SQL', String(RequestVendorContactSqlSnippets.firstActiveVendorContactIdExpr('v')))

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
    let sql = `
            SELECT
                f.REQUEST_VENDOR_GPR_C_FLOWS_ID,
                f.REQUEST_REGISTER_VENDOR_ID,
                f.M_GPR_C_FLOW_STATUS_ID,
                dataItem.GPR_C_FLOW_STATUS_SQL AS FLOW_STATUS,
                f.CURRENT_STEP_CODE,
                s.REQUEST_VENDOR_GPR_C_STEPS_ID,
                s.STEP_ORDER,
                s.STEP_CODE,
                s.STEP_NAME,
                s.APPROVER_EMPCODE,
                s.APPROVER_NAME,
                s.APPROVER_EMAIL,
                s.M_APPROVAL_STEP_STATUS_ID,
                dataItem.APPROVAL_STEP_STATUS_SQL AS STEP_STATUS,
                rr.REQUEST_NUMBER,
                dataItem.REQUEST_STATUS_SQL AS REQUEST_STATUS,
                rr.SUPPORTPRODUCT_PROCESS,
                rr.PURCHASE_FREQUENCY,
                rr.REQUEST_BY_EMPLOYEECODE,
                rr.CREATE_DATE AS REQUEST_CREATE_DATE,
                v.COMPANY_NAME,
                v.VENDOR_REGION
            FROM REQUEST_VENDOR_GPR_C_FLOWS f
                JOIN REQUEST_VENDOR_GPR_C_STEPS s
                    ON s.REQUEST_VENDOR_GPR_C_FLOWS_ID = f.REQUEST_VENDOR_GPR_C_FLOWS_ID
                    AND s.M_APPROVAL_STEP_STATUS_ID = dataItem.APPROVAL_STEP_IN_PROGRESS_STATUS_ID
                    AND s.INUSE = 1
                JOIN request_register_vendor rr
                    ON rr.REQUEST_REGISTER_VENDOR_ID = f.REQUEST_REGISTER_VENDOR_ID
                    AND rr.INUSE = 1
                LEFT JOIN vendors v
                    ON v.VENDORS_ID = rr.VENDORS_ID
            WHERE f.INUSE = 1
              AND f.M_GPR_C_FLOW_STATUS_ID = dataItem.GPR_C_FLOW_IN_PROGRESS_STATUS_ID
            ORDER BY f.REQUEST_VENDOR_GPR_C_FLOWS_ID DESC
        `
    sql = sql.replaceAll('dataItem.GPR_C_FLOW_STATUS_SQL', String(GprStatusSqlSnippets.flowStatusCodeExpr('f')))
    sql = sql.replaceAll('dataItem.APPROVAL_STEP_STATUS_SQL', String(ApprovalMasterSqlSnippets.stepStatusCodeExpr('s')))
    sql = sql.replaceAll('dataItem.REQUEST_STATUS_SQL', String(RequestStatusSqlSnippets.requestStatusExpr('rr')))
    sql = sql.replaceAll('dataItem.APPROVAL_STEP_IN_PROGRESS_STATUS_ID', String(APPROVAL_STEP_STATUS_ID_SQL.IN_PROGRESS))
    sql = sql.replaceAll('dataItem.GPR_C_FLOW_IN_PROGRESS_STATUS_ID', String(GPR_C_FLOW_STATUS_ID_SQL.IN_PROGRESS))
    return sql
  },

  getStepById: (dataItem: any) => {
    let sql = `
            SELECT
                s.*,
                dataItem.APPROVAL_STEP_STATUS_SQL AS STEP_STATUS,
                f.REQUEST_REGISTER_VENDOR_ID
            FROM REQUEST_VENDOR_GPR_C_STEPS s
                JOIN REQUEST_VENDOR_GPR_C_FLOWS f
                    ON f.REQUEST_VENDOR_GPR_C_FLOWS_ID = s.REQUEST_VENDOR_GPR_C_FLOWS_ID
            WHERE s.REQUEST_VENDOR_GPR_C_STEPS_ID = dataItem.REQUEST_VENDOR_GPR_C_STEPS_ID
              AND s.INUSE = 1
            LIMIT 1
        `
    sql = sql.replaceAll('dataItem.APPROVAL_STEP_STATUS_SQL', String(ApprovalMasterSqlSnippets.stepStatusCodeExpr('s')))
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
                dataItem.REQUEST_STATUS_SQL AS REQUEST_STATUS,
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
                vc.EMAIL AS VENDOR_EMAIL,
                vc.TEL_PHONE
            FROM request_register_vendor rr
                LEFT JOIN vendors v ON v.VENDORS_ID = rr.VENDORS_ID
                LEFT JOIN vendor_contacts vc ON vc.VENDOR_CONTACTS_ID = dataItem.PRIMARY_VENDOR_CONTACT_ID_SQL
            WHERE rr.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
            LIMIT 1
        `
    sql = sql.replaceAll('dataItem.REQUEST_STATUS_SQL', String(RequestStatusSqlSnippets.requestStatusExpr('rr')))
    sql = sql.replaceAll('dataItem.PRIMARY_VENDOR_CONTACT_ID_SQL', String(RequestVendorContactSqlSnippets.primaryVendorContactIdExpr('rr')))
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
                                       dataItem.MEMBER_TABLE
                            WHERE
                                       EMPCODE = 'dataItem.EMPCODE'
                            LIMIT
                                       1
        `
    sql = sql.replaceAll('dataItem.MEMBER_TABLE', String(PersonSqlSnippets.memberTable()))

    sql = sql.replaceAll('dataItem.EMPCODE', dataItem['EMPCODE'] || '')

    return sql
  },

  getAssigneeByEmpCodeContact: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       EMPNAME
                                     , EMPEMAIL
                            FROM
                                       approval_group_member
                            WHERE
                                       EMPCODE = 'dataItem.EMPCODE'
                                       AND INUSE = 1
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.EMPCODE', dataItem['EMPCODE'] || '')

    return sql
  },

  getPeerCcRowsByNormalizedGroup: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       agm.EMPCODE
                                     , agm.EMPNAME
                                     , agm.EMPEMAIL
                                     , ag.GROUP_CODE
                                     , ag.GROUP_NAME
                                     , ag.APPROVAL_GROUP_ID
                                     , agm.APPROVAL_GROUP_MEMBER_ID
                            FROM
                                       approval_group_member agm
                                            JOIN
                                       approval_group ag ON ag.APPROVAL_GROUP_ID = agm.APPROVAL_GROUP_ID
                            WHERE
                                       ag.GROUP_CODE = 'dataItem.TARGET_GROUP'
                                       AND ag.INUSE = 1
                                       AND agm.INUSE = 1
                            ORDER BY
                                       agm.IS_PRIMARY DESC
                                     , agm.PRIORITY_NO ASC
                                     , agm.APPROVAL_GROUP_MEMBER_ID ASC
        `

    sql = sql.replaceAll('dataItem.TARGET_GROUP', dataItem['TARGET_GROUP'] || '')
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
                                     , ras.APPROVAL_GROUP_MEMBER_ID
                                     , ras.M_APPROVAL_STEP_STATUS_ID
                                     , LOWER(task_status.STATUS_CODE) AS STEP_STATUS
                                     , mrs.STATUS_VALUE AS DESCRIPTION
                                     , wsm.STEP_CODE
                                     , wsm.ACTOR_TYPE
                                     , ras.APPROVAL_GROUP_ID
                                     , task_group.GROUP_CODE
                                     , task_group.GROUP_NAME
                                     , ras.ASSIGNMENT_MODE
                                     , ras.CREATE_BY
                                     , ras.CREATE_DATE
                                     , ras.UPDATE_BY
                                     , ras.UPDATE_DATE
                                     , mrs.STATUS_VALUE AS MASTER_STATUS_VALUE
                                     , mrs.STATUS_VALUE AS MASTER_STATUS_LABEL
                                     , COALESCE(task_member.EMPNAME, ras.APPROVER_EMPCODE) AS APPROVER_NAME
                            FROM
                                       request_approval_step ras
                                            INNER JOIN
                                       workflow_step_master wsm ON wsm.WORKFLOW_STEP_MASTER_ID = ras.WORKFLOW_STEP_MASTER_ID
                                                                           INNER JOIN
                                                                       m_request_status mrs ON mrs.M_REQUEST_STATUS_ID = wsm.M_REQUEST_STATUS_ID
                                            INNER JOIN
                                       m_approval_step_status task_status
                                         ON task_status.M_APPROVAL_STEP_STATUS_ID = ras.M_APPROVAL_STEP_STATUS_ID
                                            LEFT JOIN
                                       approval_group task_group
                                         ON task_group.APPROVAL_GROUP_ID = ras.APPROVAL_GROUP_ID
                                            LEFT JOIN
                                       approval_group_member task_member
                                         ON task_member.APPROVAL_GROUP_MEMBER_ID = ras.APPROVAL_GROUP_MEMBER_ID
                            WHERE
                                       ras.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
                                       AND ras.INUSE = 1
                            ORDER BY
                                       ras.STEP_ORDER ASC
        `

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())

    return sql
  },

  getMainWorkflowTransition: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       wt.WORKFLOW_TRANSITION_ID
                                     , wt.ACTION_CODE
                                     , wt.TO_WORKFLOW_STEP_MASTER_ID
                                     , wt.M_REQUEST_STATE_ID AS TERMINAL_REQUEST_STATE_ID
                                     , dataItem.TERMINAL_REQUEST_STATE_CODE_SQL AS TERMINAL_STATE
                                     , dataItem.TERMINAL_REQUEST_STATE_FLAG_SQL AS TERMINAL_IS_TERMINAL
                                     , wt.CONDITION_KEY
                                     , target_task.REQUEST_APPROVAL_STEP_ID AS NEXT_REQUEST_APPROVAL_STEP_ID
                                     , target_task.STEP_ORDER AS NEXT_STEP_ORDER
                                     , target_task.APPROVER_EMPCODE AS NEXT_APPROVER_EMPCODE
                                     , target_task.APPROVAL_GROUP_MEMBER_ID AS NEXT_APPROVAL_GROUP_MEMBER_ID
                                     , target_task.M_APPROVAL_STEP_STATUS_ID AS NEXT_STEP_STATUS_ID
                                     , LOWER(target_task_status.STATUS_CODE) AS NEXT_STEP_STATUS
                                     , target_wsm.M_REQUEST_STATUS_ID AS NEXT_M_REQUEST_STATUS_ID
                                     , target_wsm.STEP_CODE AS NEXT_STEP_CODE
                                     , target_wsm.ACTOR_TYPE AS NEXT_ACTOR_TYPE
                                     , target_status.STATUS_VALUE AS NEXT_STATUS_VALUE
                            FROM request_register_vendor rr
                            INNER JOIN workflow_transition wt
                             ON wt.WORKFLOW_DEFINITION_ID = rr.WORKFLOW_DEFINITION_ID
                             AND wt.FROM_WORKFLOW_STEP_MASTER_ID = dataItem.CURRENT_WORKFLOW_STEP_MASTER_ID
                             AND wt.ACTION_CODE = 'dataItem.ACTION_CODE'
                             AND dataItem.TRANSITION_IDENTITY_CONDITION
                             AND wt.INUSE = 1
                            LEFT JOIN workflow_step_master target_wsm
                              ON target_wsm.WORKFLOW_STEP_MASTER_ID = wt.TO_WORKFLOW_STEP_MASTER_ID
                            LEFT JOIN m_request_status target_status
                              ON target_status.M_REQUEST_STATUS_ID = target_wsm.M_REQUEST_STATUS_ID
                            LEFT JOIN request_approval_step target_task
                              ON target_task.REQUEST_REGISTER_VENDOR_ID = rr.REQUEST_REGISTER_VENDOR_ID
                             AND target_task.WORKFLOW_STEP_MASTER_ID = wt.TO_WORKFLOW_STEP_MASTER_ID
                             AND target_task.INUSE = 1
                            LEFT JOIN m_approval_step_status target_task_status
                              ON target_task_status.M_APPROVAL_STEP_STATUS_ID = target_task.M_APPROVAL_STEP_STATUS_ID
                            WHERE rr.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
                              AND rr.M_REQUEST_STATE_ID = dataItem.REQUEST_IN_PROGRESS_STATE_ID
                              AND rr.INUSE = 1
                            ORDER BY wt.PRIORITY_NO, wt.WORKFLOW_TRANSITION_ID
                            LIMIT 1
        `
    sql = sql.replaceAll('dataItem.TERMINAL_REQUEST_STATE_CODE_SQL', String(RequestStateSqlSnippets.requestStateCodeByIdExpr('wt.M_REQUEST_STATE_ID')))
    sql = sql.replaceAll('dataItem.TERMINAL_REQUEST_STATE_FLAG_SQL', String(RequestStateSqlSnippets.requestStateIsTerminalByIdExpr('wt.M_REQUEST_STATE_ID')))
    sql = sql.replaceAll(
      'dataItem.REQUEST_IN_PROGRESS_STATE_ID',
      requireStatusId(dataItem.M_REQUEST_IN_PROGRESS_STATE_ID, 'M_REQUEST_IN_PROGRESS_STATE_ID').toString()
    )
    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.CURRENT_WORKFLOW_STEP_MASTER_ID', (dataItem['CURRENT_WORKFLOW_STEP_MASTER_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.ACTION_CODE', escapeSqlText(dataItem.ACTION_CODE))
    const targetWorkflowStepMasterId = GprCApprovalSQL.num(dataItem.TARGET_WORKFLOW_STEP_MASTER_ID)
    const terminalRequestStateId = GprCApprovalSQL.num(dataItem.TERMINAL_REQUEST_STATE_ID)
    let transitionIdentityCondition = targetWorkflowStepMasterId
      ? 'wt.TO_WORKFLOW_STEP_MASTER_ID = dataItem.TARGET_WORKFLOW_STEP_MASTER_ID'
      : terminalRequestStateId
        ? 'wt.TO_WORKFLOW_STEP_MASTER_ID IS NULL AND wt.M_REQUEST_STATE_ID = dataItem.TERMINAL_REQUEST_STATE_ID'
        : 'wt.TO_WORKFLOW_STEP_MASTER_ID IS NOT NULL AND wt.M_REQUEST_STATE_ID IS NULL'
    transitionIdentityCondition = transitionIdentityCondition.replaceAll(
      'dataItem.TARGET_WORKFLOW_STEP_MASTER_ID',
      targetWorkflowStepMasterId.toString()
    )
    transitionIdentityCondition = transitionIdentityCondition.replaceAll(
      'dataItem.TERMINAL_REQUEST_STATE_ID',
      terminalRequestStateId.toString()
    )
    sql = sql.replaceAll('dataItem.TRANSITION_IDENTITY_CONDITION', transitionIdentityCondition)
    return sql
  },

  updateApprovalStep: async (dataItem: any) => {
    const stepStatusId = requireStatusId(dataItem['M_APPROVAL_STEP_STATUS_ID'], 'M_APPROVAL_STEP_STATUS_ID')
    const inProgressStatusId = requireStatusId(
      dataItem.M_APPROVAL_STEP_IN_PROGRESS_STATUS_ID,
      'M_APPROVAL_STEP_IN_PROGRESS_STATUS_ID'
    )
    const rejectedApprovalStatusId = requireStatusId(
      dataItem.M_APPROVAL_STEP_REJECTED_STATUS_ID,
      'M_APPROVAL_STEP_REJECTED_STATUS_ID'
    )
    const rejectedRequestStateId = requireStatusId(
      dataItem.M_REQUEST_REJECTED_STATE_ID,
      'M_REQUEST_REJECTED_STATE_ID'
    )
    const inProgressRequestStateId = requireStatusId(
      dataItem.M_REQUEST_IN_PROGRESS_STATE_ID,
      'M_REQUEST_IN_PROGRESS_STATE_ID'
    )
    const rejectedRequestStatusId = requireStatusId(
      dataItem.M_REQUEST_REJECTED_STATUS_ID,
      'M_REQUEST_REJECTED_STATUS_ID'
    )
    let sql = `
                            UPDATE request_approval_step SET
                                       M_APPROVAL_STEP_STATUS_ID = dataItem.M_APPROVAL_STEP_STATUS_ID
                                     , ASSIGNED_DATE = CASE
                                           WHEN dataItem.M_APPROVAL_STEP_STATUS_ID = dataItem.APPROVAL_STEP_IN_PROGRESS_STATUS_ID
                                             THEN COALESCE(ASSIGNED_DATE, NOW())
                                           ELSE ASSIGNED_DATE
                                       END
                                     , COMPLETED_DATE = CASE
                                           WHEN dataItem.M_APPROVAL_STEP_STATUS_ID IN (
                                               dataItem.TERMINAL_APPROVAL_STEP_STATUS_IDS_SQL
                                           ) THEN COALESCE(COMPLETED_DATE, NOW())
                                           ELSE NULL
                                       END
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       REQUEST_APPROVAL_STEP_ID = dataItem.REQUEST_APPROVAL_STEP_ID;

                            UPDATE request_register_vendor rr
                            LEFT JOIN request_approval_step changed_step
                              ON changed_step.REQUEST_APPROVAL_STEP_ID = dataItem.REQUEST_APPROVAL_STEP_ID
                            LEFT JOIN request_approval_step active_step
                              ON active_step.REQUEST_REGISTER_VENDOR_ID = rr.REQUEST_REGISTER_VENDOR_ID
                             AND active_step.M_APPROVAL_STEP_STATUS_ID = dataItem.APPROVAL_STEP_IN_PROGRESS_STATUS_ID
                             AND active_step.INUSE = 1
                            LEFT JOIN workflow_step_master active_wsm
                              ON active_wsm.WORKFLOW_STEP_MASTER_ID = active_step.WORKFLOW_STEP_MASTER_ID
                            SET
                                       rr.M_REQUEST_STATE_ID = CASE
                                           WHEN dataItem.M_APPROVAL_STEP_STATUS_ID = dataItem.APPROVAL_STEP_REJECTED_STATUS_ID THEN dataItem.REQUEST_REJECTED_STATE_ID
                                           WHEN active_step.REQUEST_APPROVAL_STEP_ID IS NOT NULL THEN dataItem.REQUEST_IN_PROGRESS_STATE_ID
                                           ELSE rr.M_REQUEST_STATE_ID
                                       END
                                     , rr.CURRENT_REQUEST_APPROVAL_STEP_ID = CASE
                                           WHEN dataItem.M_APPROVAL_STEP_STATUS_ID = dataItem.APPROVAL_STEP_REJECTED_STATUS_ID
                                             THEN changed_step.REQUEST_APPROVAL_STEP_ID
                                           WHEN active_step.REQUEST_APPROVAL_STEP_ID IS NOT NULL THEN active_step.REQUEST_APPROVAL_STEP_ID
                                           ELSE rr.CURRENT_REQUEST_APPROVAL_STEP_ID
                                       END
                                     , rr.CURRENT_M_REQUEST_STATUS_ID = CASE
                                           WHEN dataItem.M_APPROVAL_STEP_STATUS_ID = dataItem.APPROVAL_STEP_REJECTED_STATUS_ID
                                             THEN dataItem.REQUEST_REJECTED_STATUS_ID
                                           WHEN active_step.REQUEST_APPROVAL_STEP_ID IS NOT NULL THEN active_wsm.M_REQUEST_STATUS_ID
                                           ELSE rr.CURRENT_M_REQUEST_STATUS_ID
                                       END
                                     , rr.UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , rr.UPDATE_DATE = NOW()
                            WHERE
                                       rr.REQUEST_REGISTER_VENDOR_ID = changed_step.REQUEST_REGISTER_VENDOR_ID
        `
    sql = sql.replaceAll('dataItem.APPROVAL_STEP_IN_PROGRESS_STATUS_ID', inProgressStatusId.toString())
    sql = sql.replaceAll('dataItem.TERMINAL_APPROVAL_STEP_STATUS_IDS_SQL', String(ApprovalMasterSqlSnippets.terminalStepStatusIdsExpr()))
    sql = sql.replaceAll(
      'dataItem.APPROVAL_STEP_REJECTED_STATUS_ID',
      rejectedApprovalStatusId.toString()
    )
    sql = sql.replaceAll(
      'dataItem.REQUEST_REJECTED_STATE_ID',
      rejectedRequestStateId.toString()
    )
    sql = sql.replaceAll(
      'dataItem.REQUEST_IN_PROGRESS_STATE_ID',
      inProgressRequestStateId.toString()
    )
    sql = sql.replaceAll('dataItem.REQUEST_REJECTED_STATUS_ID', rejectedRequestStatusId.toString())

    sql = sql.replaceAll('dataItem.REQUEST_APPROVAL_STEP_ID', (dataItem['REQUEST_APPROVAL_STEP_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.M_APPROVAL_STEP_STATUS_ID', stepStatusId.toString())
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || '')

    return sql
  },

  updateMainApprovalStepApprover: async (dataItem: any) => {
    let sql = `
                            UPDATE request_approval_step SET
                                       APPROVER_EMPCODE = 'dataItem.APPROVER_EMPCODE'
                                     , ASSIGNMENT_MODE = 'AUTO'
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       REQUEST_APPROVAL_STEP_ID = dataItem.REQUEST_APPROVAL_STEP_ID
                                       AND INUSE = 1
        `
    sql = sql.replaceAll('dataItem.REQUEST_APPROVAL_STEP_ID', GprCApprovalSQL.num(dataItem.REQUEST_APPROVAL_STEP_ID).toString())
    sql = sql.replaceAll('dataItem.APPROVER_EMPCODE', escapeSqlText(dataItem.APPROVER_EMPCODE))
    sql = sql.replaceAll('dataItem.UPDATE_BY', escapeSqlText(dataItem.UPDATE_BY || 'SYSTEM'))
    return sql
  },

  createApprovalLog: async (dataItem: any) => {
    let sql = `
                            INSERT INTO request_approval_log (
                                       REQUEST_REGISTER_VENDOR_ID
                                     , REQUEST_APPROVAL_STEP_ID
                                     , WORKFLOW_STEP_MASTER_ID
                                     , ACTION_BY
                                     , ACTION_BY_NAME
                                     , ACTION_TYPE
                                     , ACTION_CODE
                                     , STEP_CODE_SNAPSHOT
                                     , STATUS_LABEL_SNAPSHOT
                                     , DESCRIPTION
                                     , REJECT_REASON
                                     , RECHECK_REASON
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , CREATE_DATE
                                     , UPDATE_DATE
                                     , INUSE
                            ) VALUES (
                                        dataItem.REQUEST_REGISTER_VENDOR_ID
                                     ,  dataItem.REQUEST_APPROVAL_STEP_ID
                                     , (SELECT ras.WORKFLOW_STEP_MASTER_ID
                                        FROM request_approval_step ras
                                        WHERE ras.REQUEST_APPROVAL_STEP_ID = dataItem.REQUEST_APPROVAL_STEP_ID
                                          AND ras.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
                                        LIMIT 1)
                                     , 'dataItem.ACTION_BY'
                                     , COALESCE(
                                           (SELECT agm.EMPNAME
                                            FROM approval_group_member agm
                                            WHERE agm.EMPCODE = 'dataItem.ACTION_BY'
                                              AND agm.INUSE = 1
                                            ORDER BY agm.IS_PRIMARY DESC, agm.PRIORITY_NO ASC
                                            LIMIT 1),
                                           'dataItem.ACTION_BY'
                                       )
                                     , 'dataItem.ACTION_TYPE'
                                     , 'dataItem.ACTION_CODE'
                                     , (SELECT wsm.STEP_CODE
                                        FROM request_approval_step ras
                                        JOIN workflow_step_master wsm ON wsm.WORKFLOW_STEP_MASTER_ID = ras.WORKFLOW_STEP_MASTER_ID
                                        WHERE ras.REQUEST_APPROVAL_STEP_ID = dataItem.REQUEST_APPROVAL_STEP_ID
                                          AND ras.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
                                        LIMIT 1)
                                     , (SELECT COALESCE(mrs.STATUS_LABEL_EN, mrs.STATUS_VALUE)
                                        FROM request_approval_step ras
                                        JOIN workflow_step_master wsm ON wsm.WORKFLOW_STEP_MASTER_ID = ras.WORKFLOW_STEP_MASTER_ID
                                        JOIN m_request_status mrs ON mrs.M_REQUEST_STATUS_ID = wsm.M_REQUEST_STATUS_ID
                                        WHERE ras.REQUEST_APPROVAL_STEP_ID = dataItem.REQUEST_APPROVAL_STEP_ID
                                          AND ras.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
                                        LIMIT 1)
                                     , LEFT('dataItem.REMARK', 100)
                                     , CASE
                                           WHEN LOWER('dataItem.ACTION_TYPE') IN ('rejected', 'vendor_disagreed') THEN LEFT('dataItem.REJECT_REASON', 500)
                                           ELSE NULL
                                       END
                                     , CASE
                                           WHEN UPPER('dataItem.ACTION_CODE') = 'RECHECK' THEN LEFT('dataItem.RECHECK_REASON', 500)
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
    sql = sql.replaceAll('dataItem.ACTION_BY', escapeSqlText(dataItem['ACTION_BY'] || ''))
    sql = sql.replaceAll('dataItem.ACTION_TYPE', escapeSqlText(dataItem['ACTION_TYPE'] || ''))
    sql = sql.replaceAll(
      'dataItem.ACTION_CODE',
      escapeSqlText(String(dataItem['ACTION_CODE'] || dataItem['ACTION_TYPE'] || '').trim().toUpperCase())
    )
    sql = sql.replaceAll('dataItem.REMARK', escapeSqlText(dataItem['REMARK'] || ''))
    sql = sql.replaceAll('dataItem.REJECT_REASON', escapeSqlText(dataItem['REJECT_REASON'] ?? dataItem['REMARK'] ?? ''))
    sql = sql.replaceAll('dataItem.RECHECK_REASON', escapeSqlText(dataItem['RECHECK_REASON'] ?? ''))

    return sql
  },

  getRequestStatusContext: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       rr.VENDORS_ID
                                     , rr.ASSIGN_TO
                                     , rr.M_REQUEST_STATE_ID
                                     , dataItem.REQUEST_STATE_SQL AS REQUEST_STATE
                                     , rr.WORKFLOW_DEFINITION_ID
                                     , rr.CURRENT_REQUEST_APPROVAL_STEP_ID
                                     , rr.LOCK_VERSION
                                     , rvs.PROPOSED_VENDOR_CODE AS VENDOR_CODE_SELECTOR
                                      dataItem.GPR_C_SELECTION_FIELDS_SQL
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
    sql = sql.replaceAll('dataItem.REQUEST_STATE_SQL', String(RequestStateSqlSnippets.requestStateCodeExpr('rr')))
    sql = sql.replaceAll('dataItem.GPR_C_SELECTION_FIELDS_SQL', String(GprCSelectionSqlSnippets.gprCSelectionFields('rvs', 'rr')))

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())

    return sql
  },

  acquireWorkflowLock: async (dataItem: any) => {
    let sql = `
                            UPDATE request_register_vendor
                            SET LOCK_VERSION = LOCK_VERSION + 1,
                                UPDATE_BY = 'dataItem.UPDATE_BY',
                                UPDATE_DATE = NOW()
                            WHERE REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
                              AND CURRENT_REQUEST_APPROVAL_STEP_ID = dataItem.CURRENT_TASK_ID
                              AND LOCK_VERSION = dataItem.LOCK_VERSION
                              AND M_REQUEST_STATE_ID = dataItem.REQUEST_IN_PROGRESS_STATE_ID
                              AND INUSE = 1
        `
    sql = sql.replaceAll(
      'dataItem.REQUEST_IN_PROGRESS_STATE_ID',
      requireStatusId(dataItem.M_REQUEST_IN_PROGRESS_STATE_ID, 'M_REQUEST_IN_PROGRESS_STATE_ID').toString()
    )
    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.CURRENT_TASK_ID', (dataItem['CURRENT_TASK_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.LOCK_VERSION', Number(dataItem['LOCK_VERSION'] || 0).toString())
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || 'SYSTEM')
    return sql
  },

  updateVendorFftStatus: async (dataItem: any) => {
    const vendorStatusId = requireVendorStatusId(dataItem['M_VENDOR_STATUS_ID'], 'M_VENDOR_STATUS_ID')
    let sql = `
                            UPDATE vendors SET
                                       FFT_STATUS = dataItem.FFT_STATUS_ID
                            WHERE
                                       VENDORS_ID = dataItem.VENDORS_ID
        `

    sql = sql.replaceAll('dataItem.VENDORS_ID', (dataItem['VENDORS_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.FFT_STATUS_ID', vendorStatusId.toString())

    return sql
  },

  getActiveAssigneeByEmpCodeAndGroupCode: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       agm.APPROVAL_GROUP_MEMBER_ID AS ASSIGNEES_TO_ID
                                     , agm.APPROVAL_GROUP_MEMBER_ID
                                     , ag.APPROVAL_GROUP_ID
                                     , agm.EMPCODE
                                     , agm.EMPNAME
                                     , agm.EMPEMAIL
                                     , ag.GROUP_CODE
                                     , ag.GROUP_NAME
                                     , agm.INUSE
                            FROM
                                       approval_group_member agm
                                            JOIN
                                       approval_group ag ON ag.APPROVAL_GROUP_ID = agm.APPROVAL_GROUP_ID
                            WHERE
                                       agm.EMPCODE = 'dataItem.EMPCODE'
                                       AND ag.GROUP_CODE = 'dataItem.GROUP_CODE'
                                       AND ag.INUSE = 1
                                       AND agm.INUSE = 1
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.EMPCODE', dataItem['EMPCODE'] || '')
    sql = sql.replaceAll('dataItem.GROUP_CODE', dataItem['GROUP_CODE'] || '')
    return sql
  },
}


