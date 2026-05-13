import { MySQLExecute } from '@businessData/dbExecute'
import { RequestRegisterPageSQL } from '../../sql/_request-register/RequestRegisterPageSQL'
import { RowDataPacket, ResultSetHeader } from 'mysql2'
import {
  formatRequestNumber,
  GROUP_CODE,
  inferActorType,
  inferStepCode,
  isPicStep,
  isRejectedStatus,
  normalizeText,
  requiresVendorReply,
  resolveGroupCodeForStep,
} from './RegisterRequestWorkflowHelper'
import { sendAgreementEmail as sendAgreementEmailHelper, triggerCreationEmail as triggerCreationEmailHelper, triggerVendorDocumentEmail } from './RegisterRequestNotificationHelper'
import { RequestRegisterGprService } from './RequestRegisterGprService'
import { GprCApprovalService } from '../_approval-GPRC/GprCApprovalService'

const normalizeVendorContactIds = (dataItem: any): string[] => {
  const rawValue = dataItem.VENDOR_CONTACT_IDS || dataItem['VENDOR_CONTACT_IDS[]'] || dataItem.VENDOR_CONTACT_ID || []
  const rawList = Array.isArray(rawValue) ? rawValue : [rawValue]
  const seen = new Set<string>()

  return rawList
    .flatMap((value) => String(value || '').split(','))
    .map((value) => value.trim())
    .filter((value) => {
      if (!value || Number(value) <= 0 || seen.has(value)) return false
      seen.add(value)
      return true
    })
}

export const RequestRegisterPageService = {
  createRequest: async (dataItem: any) => {
    try {
      const vendorCheckSql = await RequestRegisterPageSQL.getVendorCreateContext({
        VENDOR_ID: Number(dataItem.VENDOR_ID) || 0,
      })
      const vendorRes = (await MySQLExecute.search(vendorCheckSql)) as RowDataPacket[]
      const vendorData = vendorRes[0] || {}
      const vendorRegion = vendorData.vendor_region || 'Local'
      const isOversea = String(vendorRegion).toLowerCase() === 'oversea'
      const assignmentGroupCode = isOversea ? GROUP_CODE.OVERSEA_PO_PIC : GROUP_CODE.LOCAL_PO_PIC
      const requestType = String(dataItem.REQUEST_TYPE || '').trim().toUpperCase()
      const requestNumberPrefix = String(dataItem.REQUEST_NUMBER_PREFIX || '').trim().toUpperCase()
      const isReRegisterRequest = requestType === 'RE_REGISTER' || requestNumberPrefix === 'R'
      const selectedVendorContactIds = normalizeVendorContactIds(dataItem)
      if (selectedVendorContactIds.length > 0) {
        dataItem.VENDOR_CONTACT_ID = selectedVendorContactIds[0]
      }

      const statusSql = await RequestRegisterPageSQL.getStatusOptions()
      const statusRows = (await MySQLExecute.search(statusSql)) as RowDataPacket[]
      const workflowStatuses = statusRows.filter((s: any) => !isRejectedStatus(s.value))
      const pendingAgreementStatus = workflowStatuses.find((s: any) => {
        const statusText = normalizeText(`${s.value || ''} ${s.label || ''}`.replace(/[_-]+/g, ' '))
        return statusText.includes('pending agreement')
      })
      const hasAgreementReachedStatus = workflowStatuses.some((s: any) => {
        const statusText = normalizeText(`${s.value || ''} ${s.label || ''}`.replace(/[_-]+/g, ' '))
        return statusText.includes('agreement reached')
      })
      const reRegisterInitialStatus = pendingAgreementStatus?.value || pendingAgreementStatus?.label || 'Pending Agreement'

      const fetchAssigneesSql = await RequestRegisterPageSQL.getActiveAssigneesByGroupCode({
        GROUP_CODE: assignmentGroupCode,
      })
      const assigneesRes = (await MySQLExecute.search(fetchAssigneesSql)) as RowDataPacket[]
      const activeAssignees = assigneesRes.map((row) => ({
        empName: row.empName || row.empcode || '',
        empCode: row.empcode || '',
        empEmail: row.empEmail || '',
      }))

      if (activeAssignees.length === 0) {
        activeAssignees.push({ empName: 'Admin', empCode: 'ADMIN', empEmail: 'admin@furukawaelectric.com' })
      }

      const lastAssignSql = await RequestRegisterPageSQL.getLastAssignedPicByVendorRegion({
        IS_OVERSEA: isOversea,
      })
      const lastAssignRes = (await MySQLExecute.search(lastAssignSql)) as RowDataPacket[]
      const lastAssignTo = lastAssignRes[0]?.assign_to || ''
      const lastIdx = activeAssignees.findIndex((a: any) => a.empCode === lastAssignTo)
      const nextIndex = (lastIdx + 1) % activeAssignees.length
      const requesterEmpCode = String(dataItem.REQUEST_BY_EMPLOYEECODE || dataItem.CREATE_BY || '').trim()
      const requesterAssignee = activeAssignees.find((a: any) => a.empCode === requesterEmpCode)
      const nextAssignee = isReRegisterRequest && requesterEmpCode
        ? {
          empName: requesterAssignee?.empName || requesterEmpCode,
          empCode: requesterEmpCode,
          empEmail: requesterAssignee?.empEmail || dataItem.PIC_EMAIL || '',
        }
        : activeAssignees[nextIndex]

      dataItem.ASSIGN_TO = nextAssignee.empCode || ''
      dataItem.PIC_EMAIL = nextAssignee.empEmail || ''
      if (isReRegisterRequest) {
        dataItem.REQUEST_STATUS = reRegisterInitialStatus
      }

      const sqlCreate = await RequestRegisterPageSQL.createRequest(dataItem)
      const result = (await MySQLExecute.execute(sqlCreate)) as ResultSetHeader
      const insertedId = result.insertId

      if (!insertedId) throw new Error('Failed to insert registration request')

      const requestNumberYear = new Date().getFullYear().toString().slice(-2)
      const requestNumberPrefixFinal = isReRegisterRequest ? 'R' : 'N'
      const runningSql = await RequestRegisterPageSQL.getNextRequestRunningNumber({
        REQUEST_NUMBER_YEAR: requestNumberYear,
        REQUEST_NUMBER_PREFIX: requestNumberPrefixFinal,
      })
      const runningRows = (await MySQLExecute.search(runningSql)) as RowDataPacket[]
      const nextRunningNo = Number(runningRows[0]?.next_no || insertedId) || insertedId
      const requestNumber = formatRequestNumber(nextRunningNo, undefined, requestNumberPrefixFinal)
      const setRequestNumberSql = await RequestRegisterPageSQL.updateRequestNumber({
        REQUEST_ID: insertedId,
        REQUEST_NUMBER: requestNumber,
        UPDATE_BY: dataItem.CREATE_BY || 'SYSTEM',
      })
      await MySQLExecute.execute(setRequestNumberSql)

      if (selectedVendorContactIds.length > 0) {
        const contactSqlList = await Promise.all(
          selectedVendorContactIds.map((contactId, index) =>
            RequestRegisterPageSQL.createRequestVendorContact({
              REQUEST_ID: insertedId,
              VENDOR_CONTACT_ID: contactId,
              IS_PRIMARY: index === 0 ? 1 : 0,
              CREATE_BY: dataItem.CREATE_BY || 'SYSTEM',
            })
          )
        )
        await MySQLExecute.executeList(contactSqlList)
      }

      const sqlList = []
      let reRegisterInProgressAssigned = false

      for (const [idx, ws] of workflowStatuses.entries()) {
        const stepOrder = idx + 1
        let initialStatus = 'pending'

        const stepCode = inferStepCode({
          step_code: ws.stepCode,
          DESCRIPTION: ws.label,
        })
        const actorType = inferActorType({
          actor_type: ws.actorType,
          step_code: stepCode,
          DESCRIPTION: ws.label,
        })
        const groupCode = (isOversea ? ws.defaultGroupCodeOversea : ws.defaultGroupCodeLocal) || resolveGroupCodeForStep({ step_code: stepCode, actor_type: actorType }, isOversea)
        const isPicOwnedStep = actorType === 'PIC'
        const statusText = normalizeText(`${ws.value || ''} ${ws.label || ''}`.replace(/[_-]+/g, ' '))
        const isPendingAgreementStep = statusText.includes('pending agreement')
        const isAgreementReachedStep = statusText.includes('agreement reached')
        const isVendorRequestStep = requiresVendorReply({ ...ws, step_code: stepCode, actor_type: actorType })

        if (isReRegisterRequest) {
          if (isVendorRequestStep) {
            initialStatus = 'approved'
          } else if (isPendingAgreementStep) {
            initialStatus = 'completed'
          } else if (!reRegisterInProgressAssigned && (isAgreementReachedStep || (!hasAgreementReachedStatus && stepOrder > 2))) {
            initialStatus = 'in_progress'
            reRegisterInProgressAssigned = true
          }
        } else {
          if (stepOrder === 1) initialStatus = 'completed'
          else if (stepOrder === 2) initialStatus = 'in_progress'
        }

        sqlList.push(
          await RequestRegisterPageSQL.createApprovalStep({
            REQUEST_ID: insertedId,
            STEP_ORDER: stepOrder,
            APPROVER_ID: stepOrder <= 2 || isPicOwnedStep ? nextAssignee.empCode : '',
            STEP_STATUS: initialStatus,
            DESCRIPTION: ws.label,
            STEP_CODE: stepCode,
            ACTOR_TYPE: actorType,
            GROUP_CODE: groupCode,
            ASSIGNMENT_MODE: 'AUTO',
            CREATE_BY: dataItem.CREATE_BY || 'SYSTEM',
          })
        )
      }

      await MySQLExecute.executeList(sqlList)

      const firstStepSql = await RequestRegisterPageSQL.getApprovalSteps({ REQUEST_ID: insertedId })
      const firstStepRows = (await MySQLExecute.search(firstStepSql)) as RowDataPacket[]
      const firstStepId = firstStepRows[0]?.step_id || null

      const logSql = await RequestRegisterPageSQL.createApprovalLog({
        REQUEST_ID: insertedId,
        STEP_ID: firstStepId,
        ACTION_BY: dataItem.REQUEST_BY_EMPLOYEECODE || 'SYSTEM',
        ACTION_TYPE: 'submitted',
        REMARK: isReRegisterRequest ? 'Re-register request submitted by PO PIC' : 'Request submitted',
      })
      await MySQLExecute.execute(logSql)

      if (isReRegisterRequest) {
        const vendorStep = firstStepRows.find((step: any) => requiresVendorReply(step)) || firstStepRows[0]
        const vendorRequestLogSql = await RequestRegisterPageSQL.createApprovalLog({
          REQUEST_ID: insertedId,
          STEP_ID: vendorStep?.step_id || firstStepId,
          ACTION_BY: dataItem.REQUEST_BY_EMPLOYEECODE || dataItem.CREATE_BY || 'SYSTEM',
          ACTION_TYPE: 'vendor_requested',
          REMARK: 'Re-register request skipped PO PIC review and sent agreement email to vendor',
        })
        await MySQLExecute.execute(vendorRequestLogSql)

        const mailResult = await triggerVendorDocumentEmail(insertedId, 'Re-register')
        if (!mailResult?.sent) {
          return {
            Status: false,
            Message: `Re-register request created but vendor email failed: ${mailResult?.reason || 'unknown error'}`,
            ResultOnDb: { insertedId, request_number: requestNumber },
            MethodOnDb: 'Create Re-register Request Email Failed',
            TotalCountOnDb: 1,
          }
        }
      } else {
        RequestRegisterPageService.triggerCreationEmail(dataItem, vendorData, nextAssignee, insertedId, requestNumber, assignmentGroupCode).catch(console.error)
      }

      return {
        Status: true,
        Message: isReRegisterRequest ? 'Re-register request created and sent to vendor successfully' : 'Request created successfully',
        ResultOnDb: { insertedId, request_number: requestNumber },
        MethodOnDb: 'Create Request Success',
        TotalCountOnDb: 1,
      }
    } catch (error: any) {
      console.error('Error in RequestRegisterPageService.createRequest:', error)
      return {
        Status: false,
        Message: error?.message || 'Failed to create request',
        ResultOnDb: [],
        MethodOnDb: 'Create Request Failed',
        TotalCountOnDb: 0,
      }
    }
  },

  triggerCreationEmail: async (dataItem: any, vendorData: any, nextAssignee: any, insertedId: number, persistedRequestNumber?: string, assigneeGroupCode?: string) => {
    return triggerCreationEmailHelper(dataItem, vendorData, nextAssignee, insertedId, persistedRequestNumber, assigneeGroupCode)
  },

  createDocument: async (dataItem: any) => {
    try {
      const sql = await RequestRegisterPageSQL.createDocument(dataItem)
      const result = (await MySQLExecute.execute(sql)) as ResultSetHeader
      return {
        Status: true,
        Message: 'Document uploaded successfully',
        ResultOnDb: { document_id: result.insertId },
        MethodOnDb: 'Create Document Success',
        TotalCountOnDb: 1,
      }
    } catch (error: any) {
      return {
        Status: false,
        Message: error?.message || 'Upload failed',
        ResultOnDb: [],
        MethodOnDb: 'Create Document Failed',
        TotalCountOnDb: 0,
      }
    }
  },

  sendAgreementEmail: async (dataItem: any) => {
    return sendAgreementEmailHelper(dataItem)
  },

  createApprovalStep: async (dataItem: any) => {
    const sql = await RequestRegisterPageSQL.createApprovalStep(dataItem)
    const result = (await MySQLExecute.execute(sql)) as ResultSetHeader
    return result.insertId
  },

  updateApprovalStep: async (dataItem: any) => {
    const sql = await RequestRegisterPageSQL.updateApprovalStep(dataItem)
    return await MySQLExecute.execute(sql)
  },

  createApprovalLog: async (dataItem: any) => {
    const sql = await RequestRegisterPageSQL.createApprovalLog(dataItem)
    const result = (await MySQLExecute.execute(sql)) as ResultSetHeader
    return result.insertId
  },

  updateCcEmails: async (dataItem: any) => {
    const sql = await RequestRegisterPageSQL.updateCcEmails(dataItem)
    return await MySQLExecute.execute(sql)
  },

  updateRequest: async (dataItem: any) => {
    try {
      const requestId = Number(dataItem.REQUEST_ID)
      if (!requestId) throw new Error('Invalid request_id')

      const checkSql = await RequestRegisterPageSQL.getRequestStatusAndAssign({ REQUEST_ID: requestId })
      const checkRes = (await MySQLExecute.search(checkSql)) as RowDataPacket[]
      const request = checkRes[0]
      if (!request) throw new Error('Request not found')

      const stepsSql = await RequestRegisterPageSQL.getApprovalSteps({ REQUEST_ID: requestId })
      const steps = (await MySQLExecute.search(stepsSql)) as RowDataPacket[]
      const currentStep = steps.find((s: any) => s.step_status === 'in_progress')

      if (!currentStep || !isPicStep(currentStep)) {
        throw new Error('Request can only be edited when it is in the PIC checking step')
      }

      if (dataItem.UPDATE_BY && request.assign_to && request.assign_to !== dataItem.UPDATE_BY) {
        throw new Error('Unauthorized assigned PIC only')
      }

      const sqlList = []
      sqlList.push(await RequestRegisterPageSQL.updateRequest(dataItem))
      sqlList.push(
        await RequestRegisterPageSQL.createApprovalLog({
          REQUEST_ID: requestId,
          STEP_ID: currentStep.step_id,
          ACTION_BY: dataItem.UPDATE_BY || 'SYSTEM',
          ACTION_TYPE: 'edited',
          REMARK: 'PIC edited request details',
        })
      )

      const resultData = await MySQLExecute.executeList(sqlList)
      return {
        Status: true,
        Message: 'Request updated successfully',
        ResultOnDb: resultData,
        MethodOnDb: 'Update Request Success',
        TotalCountOnDb: 1,
      }
    } catch (error: any) {
      return {
        Status: false,
        Message: error?.message || 'Update failed',
        ResultOnDb: [],
        MethodOnDb: 'Update Request Failed',
        TotalCountOnDb: 0,
      }
    }
  },

  saveGprForm: async (dataItem: any) => {
    return RequestRegisterGprService.saveGprForm(dataItem)
  },

  saveGprCNotification: async (dataItem: any) => {
    return RequestRegisterGprService.saveGprCNotification(dataItem)
  },

  gprCGetFlow: async (dataItem: any) => {
    return GprCApprovalService.getFlow(dataItem)
  },

  gprCSubmitSetup: async (dataItem: any) => {
    return GprCApprovalService.submitSetup(dataItem)
  },
}
