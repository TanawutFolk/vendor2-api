import { ApprovalQueueModel } from '@src/_workspace/models/_approval-queue/ApprovalQueueModel'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'
import getSqlWhere_aggrid from '@src/helpers/getSqlWhere_aggrid'
import { requestStatusExpr } from '@src/_workspace/sql/_request-register/RequestStatusSqlSnippets'

const escapeSqlText = (value: unknown) =>
  String(value ?? '')
    .replaceAll('\\', '\\\\')
    .replaceAll("'", "\\'")

export const ApprovalQueueController = {
  getById: async (req: Request, res: Response) => {
    const dataItem = !req.body || Object.entries(req.body).length === 0 ? req.query : req.body

    try {
      const request_id = parseInt(dataItem.REQUEST_ID as string)

      if (!request_id || isNaN(request_id)) {
        return res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Get Registration Request By Id',
          Message: 'Invalid request_id',
        } as ResponseI)
      }

      const result = await ApprovalQueueModel.getById({ REQUEST_ID: request_id })

      return res.status(200).json({
        Status: true,
        ResultOnDb: result,
        TotalCountOnDb: result ? 1 : 0,
        MethodOnDb: 'Get Registration Request By Id',
        Message: 'Get Data Success',
      } as ResponseI)
    } catch (error: any) {
      console.error('Get Registration Request By Id Error:', error)
      return res.status(200).json({
        Status: false,
        ResultOnDb: {},
        TotalCountOnDb: 0,
        MethodOnDb: 'Get Registration Request By Id',
        Message: error?.message || 'Failed to get registration request',
      } as ResponseI)
    }
  },

  getAll: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    try {
      // Table mapping for AG Grid ColumnFilters and SearchFilters
      const tableIds = [
        { table: 'rr', id: 'request_id', Fns: '=' },
        { table: 'rr', id: 'supportProduct_Process', Fns: 'LIKE' },
        { table: 'rr', id: 'purchase_frequency', Fns: 'LIKE' },
        { table: 'rr', id: 'assign_to', Fns: '=' },
        { table: 'rr', id: 'PIC_Email', Fns: 'LIKE' },
        { table: 'rr', id: 'Request_By_EmployeeCode', Fns: '=' },
        // Vendor Info
        { table: 'v', id: 'company_name', Fns: 'LIKE' },
        { table: 'v', id: 'fft_vendor_code', Fns: 'LIKE' },
        { table: 'v', id: 'fft_status', Fns: '=' },
        { table: 'v', id: 'vendor_region', Fns: '=' },
        { table: 'v', id: 'province', Fns: 'LIKE' },
        { table: 'vt', id: 'vendor_type_name', alias: 'name', Fns: 'LIKE' },
      ]

      // Filter out null/empty values from SearchFilters before passing to helper
      if (dataItem.SEARCHFILTERS && Array.isArray(dataItem.SEARCHFILTERS)) {
        dataItem.SEARCHFILTERS = dataItem.SEARCHFILTERS.filter((item: any) => item.value !== null && item.value !== undefined && item.value !== '')
      }

      const requestStatusFilters: string[] = []
      if (Array.isArray(dataItem.SEARCHFILTERS)) {
        dataItem.SEARCHFILTERS = dataItem.SEARCHFILTERS.filter((item: any) => {
          if (item.id !== 'request_status') return true
          requestStatusFilters.push(String(item.value ?? ''))
          return false
        })
      }
      if (Array.isArray(dataItem.COLUMNFILTERS)) {
        dataItem.COLUMNFILTERS = dataItem.COLUMNFILTERS.filter((item: any) => {
          if (item.id !== 'request_status') return true
          requestStatusFilters.push(String(item.value ?? ''))
          return false
        })
      }

      // Create SQL WHERE, ORDER BY, and Offset using AG Grid-compatible helper
      getSqlWhere_aggrid(dataItem, tableIds, 'rr.request_id')

      // Default Limit if not provided by frontend
      dataItem.LIMIT = dataItem.LIMIT || 50

      // Extract sqlWhere from dataItem
      let sqlWhere = ''
      if (dataItem.SQLWHERE) {
        sqlWhere = dataItem.SQLWHERE.trim()
        sqlWhere = sqlWhere.replace(/^WHERE\s+/i, '')
      }

      // Manually add root-level filters (frontend passes these directly instead of via SearchFilters)
      const manualFilters: string[] = []
      const actorFilters: string[] = []
      if (dataItem.APPROVER_ID) {
        const queueStepCode = String(dataItem.QUEUE_STEP_CODE || '')
          .trim()
          .toUpperCase()
          .replace(/[^A-Z0-9_]/g, '')

        const queueStepCondition = (() => {
          if (!queueStepCode) return ''
          if (queueStepCode === 'DOC_CHECK') {
            return [
              '(UPPER(IFNULL(ras.step_code, \'\')) = \'DOC_CHECK\'',
              'OR LOWER(IFNULL(ras.description, \'\')) LIKE \'%checker%\'',
              'OR LOWER(IFNULL(ras.description, \'\')) LIKE \'%check all document%\')',
            ].join(' ')
          }
          if (queueStepCode === 'ACCOUNT_REGISTERED') {
            return [
              '(UPPER(IFNULL(ras.step_code, \'\')) = \'ACCOUNT_REGISTERED\'',
              'OR LOWER(IFNULL(ras.description, \'\')) LIKE \'%account%\')',
            ].join(' ')
          }
          if (queueStepCode === 'ISSUE_GPR_C') {
            return [
              '(UPPER(IFNULL(ras.step_code, \'\')) = \'ISSUE_GPR_C\'',
              'OR LOWER(IFNULL(ras.description, \'\')) LIKE \'%issue gpr c%\')',
            ].join(' ')
          }
          return `UPPER(IFNULL(ras.step_code, '')) = '${queueStepCode}'`
        })()

        // Approval pages (MD / PO GM / PO Mgr / Check Document):
        // Show requests where this approver has an in_progress OR already-actioned (approved/rejected) step.
        // Items stay visible after being actioned so the approver can track their work history.
        // The Approve/Reject buttons are hidden on the frontend when step_status is not 'in_progress'.
        if (queueStepCondition) {
          // Queue view: keep actionable + action history for this queue step.
          actorFilters.push(
            [
              'EXISTS (SELECT 1 FROM request_approval_step ras',
              'WHERE ras.request_id = rr.request_id',
              `AND ras.approver_id = '${dataItem.APPROVER_ID}'`,
              'AND ras.step_status IN (\'in_progress\', \'approved\', \'rejected\')',
              `AND ${queueStepCondition}`,
              'AND ras.INUSE = 1)',
            ].join(' ')
          )
        } else {
          // Fallback (legacy): include in-progress and action history for this approver.
          actorFilters.push(
            [
              'EXISTS (SELECT 1 FROM request_approval_step ras',
              'WHERE ras.request_id = rr.request_id',
              `AND ras.approver_id = '${dataItem.APPROVER_ID}'`,
              'AND ras.step_status IN (\'in_progress\', \'approved\', \'rejected\')',
              'AND ras.INUSE = 1)',
            ].join(' ')
          )
        }
      }
      if (dataItem.ASSIGN_TO) {
        // PIC dashboard: show requests assigned to PIC only.
        // Excludes approver step records so PIC doesn't see MD/GM/Mgr queues.
        actorFilters.push(`rr.assign_to = '${dataItem.ASSIGN_TO}'`)
      }
      if (actorFilters.length > 0) {
        manualFilters.push(`(${actorFilters.join(' OR ')})`)
      }
      if (dataItem.REQUEST_BY_EMPLOYEECODE) {
        manualFilters.push(`rr.Request_By_EmployeeCode = '${dataItem.REQUEST_BY_EMPLOYEECODE}'`)
      }
      if (dataItem.REQUEST_STATUS) {
        requestStatusFilters.push(String(dataItem.REQUEST_STATUS))
      }
      for (const statusFilter of requestStatusFilters.filter(Boolean)) {
        manualFilters.push(`${requestStatusExpr('rr')} = '${escapeSqlText(statusFilter)}'`)
      }

      // Combine AG Grid filters and manual root filters
      if (manualFilters.length > 0) {
        const combinedManual = manualFilters.join(' AND ')
        if (sqlWhere) {
          sqlWhere = `${sqlWhere} AND ${combinedManual}`
        } else {
          sqlWhere = combinedManual
        }
      }

      if (sqlWhere) {
        sqlWhere = ` AND ${sqlWhere}`
      }

      dataItem.SQLWHERE = sqlWhere
      dataItem['SQLWHERECOLUMNFILTER'] = ''

      const { data, totalCount } = await ApprovalQueueModel.getAllRequests(dataItem, sqlWhere)
      return res.status(200).json({
        Status: true,
        ResultOnDb: data,
        TotalCountOnDb: totalCount,
        MethodOnDb: 'Get All Registration Requests',
        Message: 'Get Data Success',
      } as ResponseI)
    } catch (error: any) {
      console.error('Get All Registration Requests Error:', error)
      return res.status(200).json({
        Status: false,
        ResultOnDb: [],
        TotalCountOnDb: 0,
        MethodOnDb: 'Get All Registration Requests',
        Message: error?.message || 'Failed to get registration requests',
      } as ResponseI)
    }
  },

  updateStatus: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    try {
      const request_id = parseInt((dataItem.REQUEST_ID ?? dataItem.request_id) as string)
      const requestStatus = dataItem.REQUEST_STATUS ?? dataItem.request_status ?? ''
      const workflowAction = dataItem.WORKFLOW_ACTION ?? dataItem.workflow_action ?? ''
      const actionType = dataItem.ACTION_TYPE ?? dataItem.action_type ?? ''
      const negotiationAction = dataItem.NEGOTIATION_ACTION ?? dataItem.negotiation_action ?? ''
      const approveBy = dataItem.APPROVE_BY ?? dataItem.approve_by ?? ''
      const approverRemark = dataItem.APPROVER_REMARK ?? dataItem.approver_remark ?? ''
      const updateBy = dataItem.UPDATE_BY ?? dataItem.update_by ?? 'SYSTEM'
      const isFinalStep = dataItem.ISFINALSTEP === true || dataItem.ISFINALSTEP === 'true' || dataItem.isFinalStep === true || dataItem.isFinalStep === 'true'

      if (!request_id || isNaN(request_id)) {
        return res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Update Request Status',
          Message: 'Invalid request_id',
        } as ResponseI)
      }

      // approve_date: set to 'NOW()' (DB CURRENT_TIMESTAMP) when Rejected, or when it's the final step
      const isFinalStepOrRejected = requestStatus === 'Rejected' || isFinalStep
      const result = await ApprovalQueueModel.updateStatus({
        REQUEST_ID: request_id,
        REQUEST_STATUS: requestStatus,
        WORKFLOW_ACTION: workflowAction,
        ACTION_TYPE: actionType,
        NEGOTIATION_ACTION: negotiationAction,
        APPROVE_BY: approveBy,
        APPROVE_DATE: isFinalStepOrRejected ? 'NOW()' : null,
        APPROVER_REMARK: approverRemark,
        UPDATE_BY: updateBy,
        ISFINALSTEP: isFinalStep,
      })

      res.status(200).json(result as ResponseI)
    } catch (error: any) {
      console.error('Update Status Error:', error)
      res.status(200).json({
        Status: false,
        ResultOnDb: {},
        TotalCountOnDb: 0,
        MethodOnDb: 'Update Request Status',
        Message: error?.message || 'Failed to update status',
      } as ResponseI)
    }
  },

  getStatusOptions: async (_req: Request, res: Response) => {
    try {
      const result = await ApprovalQueueModel.getStatusOptions()
      res.status(200).json({
        Status: true,
        ResultOnDb: result,
        TotalCountOnDb: result.length,
        MethodOnDb: 'Get Status Options',
        Message: 'Get Data Success',
      } as ResponseI)
    } catch (error: any) {
      console.error('Get Status Options Error:', error)
      res.status(200).json({
        Status: false,
        ResultOnDb: [],
        TotalCountOnDb: 0,
        MethodOnDb: 'Get Status Options',
        Message: error?.message || 'Failed to get status options',
      } as ResponseI)
    }
  },

  reassign: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    try {
      const request_id = parseInt(dataItem.REQUEST_ID as string)
      if (!request_id || isNaN(request_id)) {
        return res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Reassign Request',
          Message: 'Invalid request_id',
        } as ResponseI)
      }

      const result = await ApprovalQueueModel.reassignAssignment({
        REQUEST_ID: request_id,
        SCOPE: dataItem.SCOPE || '',
        TO_EMPCODE: dataItem.TO_EMPCODE || '',
        REASON: dataItem.REASON || '',
        UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
      })

      res.status(200).json(result as ResponseI)
    } catch (error: any) {
      console.error('Reassign Request Error:', error)
      res.status(200).json({
        Status: false,
        ResultOnDb: {},
        TotalCountOnDb: 0,
        MethodOnDb: 'Reassign Request',
        Message: error?.message || 'Failed to reassign request',
      } as ResponseI)
    }
  },
}
