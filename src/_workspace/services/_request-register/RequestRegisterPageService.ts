import { MySQLExecute } from '@businessData/dbExecute'
import { connection } from '@businessData/db'
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
    let conn: any = null
    let duplicateGuardLockKey = ''
    try {
      conn = await connection()
      await conn.beginTransaction()

      const queryRows = async (sql: string) => {
        const [rows] = await conn.query(sql)
        return rows as RowDataPacket[]
      }

      const executeSql = async (sql: string) => {
        const [result] = await conn.query(sql)
        return result as ResultSetHeader
      }

      const executeSqlList = async (sqlList: string[]) => {
        const results: ResultSetHeader[] = []
        for (const sql of sqlList) {
          const [result] = await conn.query(sql)
          results.push(result as ResultSetHeader)
        }
        return results
      }

      const vendorCheckSql = await RequestRegisterPageSQL.getVendorCreateContext({
        VENDOR_ID: Number(dataItem.VENDOR_ID) || 0,
      })
      const vendorRes = await queryRows(vendorCheckSql)
      const vendorRow = vendorRes[0] || {}
      const vendorData = {
        company_name: vendorRow.company_name || vendorRow.COMPANY_NAME || '',
        address: vendorRow.address || vendorRow.ADDRESS || '',
        vendor_region: vendorRow.vendor_region || vendorRow.VENDOR_REGION || '',
        emailmain: vendorRow.emailmain || vendorRow.EMAILMAIN || '',
        contact_name: vendorRow.contact_name || vendorRow.CONTACT_NAME || '',
        email: vendorRow.email || vendorRow.EMAIL || '',
        tel_phone: vendorRow.tel_phone || vendorRow.TEL_PHONE || '',
      }
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
      const requesterEmpCode = String(dataItem.REQUEST_BY_EMPLOYEECODE || dataItem.CREATE_BY || '').trim()
      if (!requesterEmpCode) {
        throw new Error('Requester employee code is required')
      }
      dataItem.REQUEST_BY_EMPLOYEECODE = requesterEmpCode
      duplicateGuardLockKey = `request-create:${Number(dataItem.VENDOR_ID) || 0}:${requesterEmpCode}`

      const [lockRows] = await conn.query('SELECT GET_LOCK(?, 10) AS lock_status', [duplicateGuardLockKey])
      const lockStatus = Number((lockRows as RowDataPacket[])[0]?.lock_status || 0)
      if (lockStatus !== 1) {
        throw new Error('Another create request is in progress for this vendor and requester')
      }

      const duplicateRequestSql = await RequestRegisterPageSQL.checkExistingActiveRequestByVendorRequester({
        VENDOR_ID: Number(dataItem.VENDOR_ID) || 0,
        REQUEST_BY_EMPLOYEECODE: requesterEmpCode,
      })
      const duplicateRequestRows = await queryRows(duplicateRequestSql)
      const existingActiveRequest = duplicateRequestRows[0]
      if (existingActiveRequest) {
        const existingRequestNumber = String(existingActiveRequest.REQUEST_NUMBER || existingActiveRequest.request_number || '').trim()
        const existingStatus = String(existingActiveRequest.REQUEST_STATUS || existingActiveRequest.request_status || '').trim()
        throw new Error(
          existingRequestNumber
            ? `Duplicate active request already exists: ${existingRequestNumber}${existingStatus ? ` (${existingStatus})` : ''}`
            : 'Duplicate active request already exists for this vendor and requester'
        )
      }

      const statusSql = await RequestRegisterPageSQL.getStatusOptions()
      const statusRows = await queryRows(statusSql)
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
      const assigneesRes = await queryRows(fetchAssigneesSql)
      const activeAssignees = assigneesRes.map((row) => ({
        empName: row.empName || row.EMPNAME || row.empcode || row.EMPCODE || '',
        empCode: row.empcode || row.EMPCODE || '',
        empEmail: row.empEmail || row.EMPEMAIL || '',
      }))

      if (activeAssignees.length === 0) {
        activeAssignees.push({ empName: 'Admin', empCode: 'ADMIN', empEmail: 'admin@furukawaelectric.com' })
      }

      const lastAssignSql = await RequestRegisterPageSQL.getLastAssignedPicByVendorRegion({
        IS_OVERSEA: isOversea,
      })
      const lastAssignRes = await queryRows(lastAssignSql)
      const lastAssignTo = lastAssignRes[0]?.assign_to || lastAssignRes[0]?.ASSIGN_TO || ''
      const lastIdx = activeAssignees.findIndex((a: any) => a.empCode === lastAssignTo)
      const nextIndex = (lastIdx + 1) % activeAssignees.length
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
      const result = await executeSql(sqlCreate)
      const insertedId = result.insertId

      if (!insertedId) throw new Error('Failed to insert registration request')

      const requestNumberYear = new Date().getFullYear().toString().slice(-2)
      const requestNumberPrefixFinal = isReRegisterRequest ? 'R' : 'N'
      const runningSql = await RequestRegisterPageSQL.getNextRequestRunningNumber({
        REQUEST_NUMBER_YEAR: requestNumberYear,
        REQUEST_NUMBER_PREFIX: requestNumberPrefixFinal,
      })
      const runningRows = await queryRows(runningSql)
      const nextRunningNo = Number(runningRows[0]?.next_no || insertedId) || insertedId
      const requestNumber = formatRequestNumber(nextRunningNo, undefined, requestNumberPrefixFinal)
      const setRequestNumberSql = await RequestRegisterPageSQL.updateRequestNumber({
        REQUEST_ID: insertedId,
        REQUEST_NUMBER: requestNumber,
        UPDATE_BY: dataItem.CREATE_BY || 'SYSTEM',
      })
      await executeSql(setRequestNumberSql)

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
        await executeSqlList(contactSqlList)
      }

      const uploadedFiles = Array.isArray(dataItem.UPLOADED_FILES) ? dataItem.UPLOADED_FILES : []
      if (uploadedFiles.length > 0) {
        const fileSqlList = await Promise.all(
          uploadedFiles.map((file: any) => {
            const fileName = Buffer.from(file.originalname || '', 'latin1').toString('utf8') || file.filename || ''
            return RequestRegisterPageSQL.createDocument({
              REQUEST_ID: insertedId,
              FILE_NAME: fileName,
              FILE_PATH: file.filename || '',
              FILE_SIZE: file.size || 0,
              FILE_TYPE: file.mimetype || '',
              CREATE_BY: dataItem.CREATE_BY || 'SYSTEM',
            })
          })
        )
        await executeSqlList(fileSqlList)
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

      await executeSqlList(sqlList)

      const firstStepSql = await RequestRegisterPageSQL.getApprovalSteps({ REQUEST_ID: insertedId })
      const firstStepRows = await queryRows(firstStepSql)
      const resolveStepId = (step: any) => Number(step?.step_id || step?.STEP_ID || 0) || null
      const firstStepId = resolveStepId(firstStepRows[0])
      if (!firstStepId) {
        throw new Error('Failed to resolve first approval step')
      }

      const logSql = await RequestRegisterPageSQL.createApprovalLog({
        REQUEST_ID: insertedId,
        STEP_ID: firstStepId,
        ACTION_BY: dataItem.REQUEST_BY_EMPLOYEECODE || 'SYSTEM',
        ACTION_TYPE: 'submitted',
        REMARK: isReRegisterRequest ? 'Re-register request submitted by PO PIC' : 'Request submitted',
      })
      await executeSql(logSql)

      if (isReRegisterRequest) {
        const vendorStep = firstStepRows.find((step: any) => requiresVendorReply(step)) || firstStepRows[0]
        const vendorStepId = resolveStepId(vendorStep) || firstStepId
        if (!vendorStepId) {
          throw new Error('Failed to resolve vendor approval step')
        }
        const vendorRequestLogSql = await RequestRegisterPageSQL.createApprovalLog({
          REQUEST_ID: insertedId,
          STEP_ID: vendorStepId,
          ACTION_BY: dataItem.REQUEST_BY_EMPLOYEECODE || dataItem.CREATE_BY || 'SYSTEM',
          ACTION_TYPE: 'vendor_requested',
          REMARK: 'Re-register request skipped PO PIC review and sent agreement email to vendor',
        })
        await executeSql(vendorRequestLogSql)
      }

      await conn.commit()
      if (duplicateGuardLockKey) {
        await conn.query('DO RELEASE_LOCK(?)', [duplicateGuardLockKey])
        duplicateGuardLockKey = ''
      }
      conn.release()
      conn = null

      let message = isReRegisterRequest ? 'Re-register request created and sent to vendor successfully' : 'Request created successfully'

      if (isReRegisterRequest) {
        const mailResult = await triggerVendorDocumentEmail(insertedId, 'Re-register')
        if (!mailResult?.sent) {
          message = `Re-register request created successfully, but vendor email failed: ${mailResult?.reason || 'unknown error'}`
        }
      } else {
        RequestRegisterPageService
          .triggerCreationEmail(dataItem, vendorData, nextAssignee, insertedId, requestNumber, assignmentGroupCode)
          .catch(console.error)
      }

      return {
        Status: true,
        Message: message,
        ResultOnDb: { insertedId, request_number: requestNumber },
        MethodOnDb: 'Create Request Success',
        TotalCountOnDb: 1,
      }
    } catch (error: any) {
      if (conn) {
        await conn.rollback()
        if (duplicateGuardLockKey) {
          await conn.query('DO RELEASE_LOCK(?)', [duplicateGuardLockKey])
          duplicateGuardLockKey = ''
        }
        conn.release()
        conn = null
      }
      console.error('Error in RequestRegisterPageService.createRequest:', error)
      return {
        Status: false,
        Message: error?.message || 'Failed to create request',
        ResultOnDb: [],
        MethodOnDb: 'Create Request Failed',
        TotalCountOnDb: 0,
      }
    } finally {
      if (conn) conn.release()
    }
  },

  triggerCreationEmail: async (dataItem: any, vendorData: any, nextAssignee: any, insertedId: number, persistedRequestNumber?: string, assigneeGroupCode?: string) => {
    return triggerCreationEmailHelper(dataItem, vendorData, nextAssignee, insertedId, persistedRequestNumber, assigneeGroupCode)
  },

  getBusinessCategories: async (dataItem: any = {}) => {
    const sql = await RequestRegisterPageSQL.getBusinessCategories(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },

  getCurrencies: async (dataItem: any = {}) => {
    const sql = await RequestRegisterPageSQL.getCurrencies(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
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
