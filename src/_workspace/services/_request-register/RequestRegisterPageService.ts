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
  const rawValue = dataItem.vendor_contact_ids || dataItem['vendor_contact_ids[]'] || dataItem.vendor_contact_id || []
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
        vendor_id: Number(dataItem.vendor_id) || 0,
      })
      const vendorRes = (await MySQLExecute.search(vendorCheckSql)) as RowDataPacket[]
      const vendorData = vendorRes[0] || {}
      const vendorRegion = vendorData.vendor_region || 'Local'
      const isOversea = String(vendorRegion).toLowerCase() === 'oversea'
      const assignmentGroupCode = isOversea ? GROUP_CODE.OVERSEA_PO_PIC : GROUP_CODE.LOCAL_PO_PIC
      const requestType = String(dataItem.request_type || '').trim().toUpperCase()
      const requestNumberPrefix = String(dataItem.request_number_prefix || '').trim().toUpperCase()
      const isReRegisterRequest = requestType === 'RE_REGISTER' || requestNumberPrefix === 'R'
      const selectedVendorContactIds = normalizeVendorContactIds(dataItem)
      if (selectedVendorContactIds.length > 0) {
        dataItem.vendor_contact_id = selectedVendorContactIds[0]
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
        group_code: assignmentGroupCode,
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
        is_oversea: isOversea,
      })
      const lastAssignRes = (await MySQLExecute.search(lastAssignSql)) as RowDataPacket[]
      const lastAssignTo = lastAssignRes[0]?.assign_to || ''
      const lastIdx = activeAssignees.findIndex((a: any) => a.empCode === lastAssignTo)
      const nextIndex = (lastIdx + 1) % activeAssignees.length
      const requesterEmpCode = String(dataItem.Request_By_EmployeeCode || dataItem.CREATE_BY || '').trim()
      const requesterAssignee = activeAssignees.find((a: any) => a.empCode === requesterEmpCode)
      const nextAssignee = isReRegisterRequest && requesterEmpCode
        ? {
          empName: requesterAssignee?.empName || requesterEmpCode,
          empCode: requesterEmpCode,
          empEmail: requesterAssignee?.empEmail || dataItem.PIC_Email || '',
        }
        : activeAssignees[nextIndex]

      dataItem.assign_to = nextAssignee.empCode || ''
      dataItem.PIC_Email = nextAssignee.empEmail || ''
      if (isReRegisterRequest) {
        dataItem.request_status = reRegisterInitialStatus
      }

      const sqlCreate = await RequestRegisterPageSQL.createRequest(dataItem)
      const result = (await MySQLExecute.execute(sqlCreate)) as ResultSetHeader
      const insertedId = result.insertId

      if (!insertedId) throw new Error('Failed to insert registration request')

      const requestNumberYear = new Date().getFullYear().toString().slice(-2)
      const requestNumberPrefixFinal = isReRegisterRequest ? 'R' : 'N'
      const runningSql = await RequestRegisterPageSQL.getNextRequestRunningNumber({
        request_number_year: requestNumberYear,
        request_number_prefix: requestNumberPrefixFinal,
      })
      const runningRows = (await MySQLExecute.search(runningSql)) as RowDataPacket[]
      const nextRunningNo = Number(runningRows[0]?.next_no || insertedId) || insertedId
      const requestNumber = formatRequestNumber(nextRunningNo, undefined, requestNumberPrefixFinal)
      const setRequestNumberSql = await RequestRegisterPageSQL.updateRequestNumber({
        request_id: insertedId,
        request_number: requestNumber,
        UPDATE_BY: dataItem.CREATE_BY || 'SYSTEM',
      })
      await MySQLExecute.execute(setRequestNumberSql)

      if (selectedVendorContactIds.length > 0) {
        const contactSqlList = await Promise.all(
          selectedVendorContactIds.map((contactId, index) =>
            RequestRegisterPageSQL.createRequestVendorContact({
              request_id: insertedId,
              vendor_contact_id: contactId,
              is_primary: index === 0 ? 1 : 0,
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
            request_id: insertedId,
            step_order: stepOrder,
            approver_id: stepOrder <= 2 || isPicOwnedStep ? nextAssignee.empCode : '',
            step_status: initialStatus,
            DESCRIPTION: ws.label,
            step_code: stepCode,
            actor_type: actorType,
            group_code: groupCode,
            assignment_mode: 'AUTO',
            CREATE_BY: dataItem.CREATE_BY || 'SYSTEM',
          })
        )
      }

      await MySQLExecute.executeList(sqlList)

      const firstStepSql = await RequestRegisterPageSQL.getApprovalSteps({ request_id: insertedId })
      const firstStepRows = (await MySQLExecute.search(firstStepSql)) as RowDataPacket[]
      const firstStepId = firstStepRows[0]?.step_id || null

      const logSql = await RequestRegisterPageSQL.createApprovalLog({
        request_id: insertedId,
        step_id: firstStepId,
        action_by: dataItem.Request_By_EmployeeCode || 'SYSTEM',
        action_type: 'submitted',
        remark: isReRegisterRequest ? 'Re-register request submitted by PO PIC' : 'Request submitted',
      })
      await MySQLExecute.execute(logSql)

      if (isReRegisterRequest) {
        const vendorStep = firstStepRows.find((step: any) => requiresVendorReply(step)) || firstStepRows[0]
        const vendorRequestLogSql = await RequestRegisterPageSQL.createApprovalLog({
          request_id: insertedId,
          step_id: vendorStep?.step_id || firstStepId,
          action_by: dataItem.Request_By_EmployeeCode || dataItem.CREATE_BY || 'SYSTEM',
          action_type: 'vendor_requested',
          remark: 'Re-register request skipped PO PIC review and sent agreement email to vendor',
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
      const requestId = Number(dataItem.request_id)
      if (!requestId) throw new Error('Invalid request_id')

      const checkSql = await RequestRegisterPageSQL.getRequestStatusAndAssign({ request_id: requestId })
      const checkRes = (await MySQLExecute.search(checkSql)) as RowDataPacket[]
      const request = checkRes[0]
      if (!request) throw new Error('Request not found')

      const stepsSql = await RequestRegisterPageSQL.getApprovalSteps({ request_id: requestId })
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
          request_id: requestId,
          step_id: currentStep.step_id,
          action_by: dataItem.UPDATE_BY || 'SYSTEM',
          action_type: 'edited',
          remark: 'PIC edited request details',
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
