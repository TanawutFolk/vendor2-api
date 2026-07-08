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
  requiresVendorReply,
  resolveGroupCodeForStep,
  WORKFLOW_STEP_CODE,
} from './RegisterRequestWorkflowHelper'
import { sendMail_ToSupplier_RequestFormA, sendMail_ToPic_NewRequest, sendMail_NegotiationStageDispatch } from './RegisterRequestNotificationHelper'
import { RequestRegisterGprService } from './RequestRegisterGprService'
import { GprCApprovalService } from '../_approval-GPRC/GprCApprovalService'
import { SelectionFileService } from './SelectionFileService'

const normalizeVendorContactIds = (dataItem: any): string[] => {
  const rawValue = dataItem.VENDOR_CONTACT_IDS || dataItem['VENDOR_CONTACT_IDS[]'] || dataItem.VENDOR_CONTACTS_ID || []
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
        VENDORS_ID: Number(dataItem.VENDORS_ID) || 0,
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
        dataItem.VENDOR_CONTACTS_ID = selectedVendorContactIds[0]
      }
      const requesterEmpCode = String(dataItem.REQUEST_BY_EMPLOYEECODE || dataItem.CREATE_BY || '').trim()
      if (!requesterEmpCode) {
        throw new Error('Requester employee code is required')
      }
      dataItem.REQUEST_BY_EMPLOYEECODE = requesterEmpCode
      duplicateGuardLockKey = `request-create:${Number(dataItem.VENDORS_ID) || 0}:${requesterEmpCode}`

      const [lockRows] = await conn.query('SELECT GET_LOCK(?, 10) AS lock_status', [duplicateGuardLockKey])
      const lockStatus = Number((lockRows as RowDataPacket[])[0]?.lock_status || 0)
      if (lockStatus !== 1) {
        throw new Error('Another create request is in progress for this vendor and requester')
      }

      const duplicateRequestSql = await RequestRegisterPageSQL.checkExistingActiveRequestByVendorRequester({
        VENDORS_ID: Number(dataItem.VENDORS_ID) || 0,
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
      const getConfiguredStepCode = (status: any) =>
        inferStepCode({
          step_code: status.STEP_CODE,
          DESCRIPTION: status.label || status.value,
        })
      const pendingAgreementStatus = workflowStatuses.find(
        (status: any) => getConfiguredStepCode(status) === WORKFLOW_STEP_CODE.PENDING_AGREEMENT
      )
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

      const groupAssigneeCache = new Map<string, string>()
      const resolvePrimaryAssigneeByGroupCode = async (groupCodeRaw: string) => {
        const groupCode = String(groupCodeRaw || '').trim().toUpperCase()
        if (!groupCode) return ''
        if (groupAssigneeCache.has(groupCode)) return groupAssigneeCache.get(groupCode) || ''

        const assigneeSql = await RequestRegisterPageSQL.getActiveAssigneesByGroupCode({
          GROUP_CODE: groupCode,
        })
        const assigneeRows = await queryRows(assigneeSql)
        const empCode = String(assigneeRows[0]?.empcode || assigneeRows[0]?.EMPCODE || '').trim()
        groupAssigneeCache.set(groupCode, empCode)

        return empCode
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
      const nextRunningNo = Number(runningRows[0]?.NEXT_NO || insertedId) || insertedId
      const requestNumber = formatRequestNumber(nextRunningNo, undefined, requestNumberPrefixFinal)
      const setRequestNumberSql = await RequestRegisterPageSQL.updateRequestNumber({
        REQUEST_REGISTER_VENDOR_ID: insertedId,
        REQUEST_NUMBER: requestNumber,
        UPDATE_BY: dataItem.CREATE_BY || 'SYSTEM',
      })
      await executeSql(setRequestNumberSql)

      if (selectedVendorContactIds.length > 0) {
        const contactSqlList = await Promise.all(
          selectedVendorContactIds.map((contactId, index) =>
            RequestRegisterPageSQL.createRequestVendorContact({
              REQUEST_REGISTER_VENDOR_ID: insertedId,
              VENDOR_CONTACTS_ID: contactId,
              IS_PRIMARY: index === 0 ? 1 : 0,
              CREATE_BY: dataItem.CREATE_BY || 'SYSTEM',
            })
          )
        )
        await executeSqlList(contactSqlList)
      }

      const uploadedFiles = Array.isArray(dataItem.UPLOADED_FILES) ? dataItem.UPLOADED_FILES : []
      const requestDocsToRelocate: Array<{ documentId: number; filename: string; originalName: string }> = []
      if (uploadedFiles.length > 0) {
        const normalizedFiles: Array<{ file: any; originalName: string }> = uploadedFiles.map((file: any) => ({
          file,
          originalName: Buffer.from(file.originalname || '', 'latin1').toString('utf8') || file.filename || '',
        }))
        const fileSqlList = await Promise.all(
          normalizedFiles.map(({ file, originalName }) =>
            RequestRegisterPageSQL.createDocument({
              REQUEST_REGISTER_VENDOR_ID: insertedId,
              FILE_NAME: originalName,
              FILE_PATH: file.filename || '',
              FILE_SIZE: file.size || 0,
              FILE_TYPE: file.mimetype || '',
              CREATE_BY: dataItem.CREATE_BY || 'SYSTEM',
            })
          )
        )
        const fileInsertResults = await executeSqlList(fileSqlList)
        normalizedFiles.forEach(({ file, originalName }, index) => {
          const documentId = Number(fileInsertResults[index]?.insertId || 0)
          if (documentId && file?.filename) {
            requestDocsToRelocate.push({ documentId, filename: file.filename, originalName })
          }
        })
      }

      const sqlList = []
      let reRegisterInProgressAssigned = false

      for (const [idx, ws] of workflowStatuses.entries()) {
        const stepOrder = idx + 1
        let initialStatus = 'pending'

        const stepCode = inferStepCode({
          step_code: ws.STEP_CODE,
          DESCRIPTION: ws.label || ws.value,
        })
        const actorType = inferActorType({
          actor_type: ws.ACTOR_TYPE,
          step_code: stepCode,
          DESCRIPTION: ws.label,
        })
        const groupCode =
          (isOversea ? ws.DEFAULT_GROUP_CODE_OVERSEA : ws.DEFAULT_GROUP_CODE_LOCAL) ||
          resolveGroupCodeForStep({ step_code: stepCode, actor_type: actorType }, isOversea)
        const isPicOwnedStep = actorType === 'PIC'
        const isRequestSubmittedStep = stepCode === WORKFLOW_STEP_CODE.REQUEST_SUBMITTED
        const isPicReviewStep = stepCode === WORKFLOW_STEP_CODE.PIC_REVIEW
        const isPendingAgreementStep = stepCode === WORKFLOW_STEP_CODE.PENDING_AGREEMENT
        const isVendorRequestStep = requiresVendorReply({ ...ws, step_code: stepCode, actor_type: actorType })
        const approverId = (stepOrder <= 2 || isPicOwnedStep)
          ? nextAssignee.empCode
          : groupCode
            ? await resolvePrimaryAssigneeByGroupCode(groupCode)
            : ''

        if (isReRegisterRequest) {
          if (isRequestSubmittedStep) {
            initialStatus = 'approved'
          } else if (isPicReviewStep || isVendorRequestStep) {
            initialStatus = 'approved'
          } else if (isPendingAgreementStep) {
            initialStatus = 'approved'
          } else if (!reRegisterInProgressAssigned && stepOrder > 2) {
            initialStatus = 'in_progress'
            reRegisterInProgressAssigned = true
          }
        } else {
          if (isRequestSubmittedStep) initialStatus = 'approved'
          else if (isPicReviewStep) initialStatus = 'in_progress'
        }

        sqlList.push(
          await RequestRegisterPageSQL.createApprovalStep({
            REQUEST_REGISTER_VENDOR_ID: insertedId,
            WORKFLOW_STEP_MASTER_ID: ws.WORKFLOW_STEP_MASTER_ID,
            M_REQUEST_STATUS_ID: ws.M_REQUEST_STATUS_ID,
            STEP_ORDER: stepOrder,
            APPROVER_EMPCODE: approverId,
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
      await executeSql(
        await RequestRegisterPageSQL.syncRequestWorkflowState({
          REQUEST_REGISTER_VENDOR_ID: insertedId,
          UPDATE_BY: dataItem.CREATE_BY || 'SYSTEM',
        })
      )

      const firstStepSql = await RequestRegisterPageSQL.getApprovalSteps({ REQUEST_REGISTER_VENDOR_ID: insertedId })
      const firstStepRows = await queryRows(firstStepSql)
      const resolveStepId = (step: any) => Number(step?.step_id || step?.REQUEST_APPROVAL_STEP_ID || 0) || null
      const firstStepId = resolveStepId(firstStepRows[0])
      if (!firstStepId) {
        throw new Error('Failed to resolve first approval step')
      }

      const logSql = await RequestRegisterPageSQL.createApprovalLog({
        REQUEST_REGISTER_VENDOR_ID: insertedId,
        REQUEST_APPROVAL_STEP_ID: firstStepId,
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
          REQUEST_REGISTER_VENDOR_ID: insertedId,
          REQUEST_APPROVAL_STEP_ID: vendorStepId,
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

      // Always provision the request's folder structure ({year}/{requestNumber}/00.Sending,
      // 01.Receiving, 02.Request Documents) as soon as the request is created — even with no
      // attachments — so 02.Request Documents exists up front. If the request is later rejected,
      // the folders are simply left in place. Runs after commit and never fails the request.
      try {
        SelectionFileService.createFolderStructure(requestNumber)
      } catch (folderError: any) {
        // console.warn('[SelectionFile] Failed to ensure request folder structure:', folderError?.message)
      }

      // Move the requester's attached files into 02.Request Documents and repoint each
      // request_register_file row to the network path (single source of truth — no uploads/documents
      // copy is kept). Per-file failure is isolated so a network-share hiccup on one file cannot
      // fail the request or block the others.
      for (const doc of requestDocsToRelocate) {
        try {
          const { destPath } = SelectionFileService.moveToRequestDocuments(requestNumber, doc.filename, doc.originalName)
          await MySQLExecute.execute(
            RequestRegisterPageSQL.updateDocumentFilePath({
              REQUEST_REGISTER_FILE_ID: doc.documentId,
              FILE_PATH: destPath,
              UPDATE_BY: dataItem.CREATE_BY || 'SYSTEM',
            })
          )
        } catch (fileError: any) {
          // Leave this file in uploads/documents with its original DB FILE_PATH so it still downloads.
          // console.warn(`[SelectionFile] Failed to move request document ${doc.filename} to 02.Request Documents:`, fileError?.message)
        }
      }

      let message = isReRegisterRequest ? 'Re-register request created and sent to vendor successfully' : 'Request created successfully'

      if (isReRegisterRequest) {
        const mailResult = await sendMail_NegotiationStageDispatch(insertedId, 'Re-register')
        if (!mailResult?.sent) {
          message = `Re-register request created successfully, but vendor email failed: ${mailResult?.reason || 'unknown error'}`
        }
      } else {
        RequestRegisterPageService
          .sendMail_ToPic_NewRequest(dataItem, vendorData, nextAssignee, insertedId, requestNumber, assignmentGroupCode)
          .catch(() => undefined /* console.error */)
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
      // console.error('Error in RequestRegisterPageService.createRequest:', error)
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

  sendMail_ToPic_NewRequest: async (dataItem: any, vendorData: any, nextAssignee: any, insertedId: number, persistedRequestNumber?: string, assigneeGroupCode?: string) => {
    return sendMail_ToPic_NewRequest(dataItem, vendorData, nextAssignee, insertedId, persistedRequestNumber, assigneeGroupCode)
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

  updateGprBFile: async (dataItem: any) => {
    try {
      const sql = RequestRegisterPageSQL.updateGprBFile(dataItem)
      await MySQLExecute.execute(sql)
      return {
        Status: true,
        Message: 'GPR B file saved successfully',
        ResultOnDb: { gpr_b_file_path: dataItem.GPR_B_FILE_PATH || '', gpr_b_file_name: dataItem.GPR_B_FILE_NAME || '' },
        MethodOnDb: 'Update GPR B File Success',
        TotalCountOnDb: 1,
      }
    } catch (error: any) {
      return {
        Status: false,
        Message: error?.message || 'Failed to save GPR B file',
        ResultOnDb: [],
        MethodOnDb: 'Update GPR B File Failed',
        TotalCountOnDb: 0,
      }
    }
  },

  getCriteriaFileForDelete: async (dataItem: any) => {
    const sql = await RequestRegisterPageSQL.getCriteriaFileForDelete(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },

  clearCriteriaUploadedFile: async (dataItem: any) => {
    const sql = await RequestRegisterPageSQL.clearCriteriaUploadedFile(dataItem)
    return await MySQLExecute.execute(sql)
  },

  sendMail_ToSupplier_RequestFormA: async (dataItem: any) => {
    return sendMail_ToSupplier_RequestFormA(dataItem)
  },

  createApprovalStep: async (dataItem: any) => {
    const stepCode = String(dataItem.STEP_CODE || '').trim().toUpperCase()
    if (!stepCode) throw new Error('STEP_CODE is required')
    if (!/^[A-Z0-9_]+$/.test(stepCode)) throw new Error('Invalid STEP_CODE format')

    const [statusRows, requestRows] = await Promise.all([
      MySQLExecute.search(await RequestRegisterPageSQL.getStatusByStepCode({ STEP_CODE: stepCode })) as Promise<RowDataPacket[]>,
      MySQLExecute.search(
        await RequestRegisterPageSQL.getRequestVendorRegion({ REQUEST_REGISTER_VENDOR_ID: dataItem.REQUEST_REGISTER_VENDOR_ID })
      ) as Promise<RowDataPacket[]>,
    ])
    const status = statusRows[0]
    if (!status) throw new Error(`Unknown or inactive STEP_CODE: ${stepCode}`)
    const request = requestRows[0]
    if (!request) throw new Error('Request not found')

    const isOversea = String(request.VENDOR_REGION || '').trim().toLowerCase() === 'oversea'
    const groupCode = isOversea
      ? status.DEFAULT_GROUP_CODE_OVERSEA
      : status.DEFAULT_GROUP_CODE_LOCAL
    let approverId = String(dataItem.APPROVER_EMPCODE || '').trim()

    if (!approverId && groupCode) {
      const assigneeRows = (await MySQLExecute.search(
        await RequestRegisterPageSQL.getActiveAssigneesByGroupCode({ GROUP_CODE: groupCode })
      )) as RowDataPacket[]
      approverId = String(assigneeRows[0]?.empcode || assigneeRows[0]?.EMPCODE || '').trim()
    }

    const sql = await RequestRegisterPageSQL.createApprovalStep({
      ...dataItem,
      WORKFLOW_STEP_MASTER_ID: status.WORKFLOW_STEP_MASTER_ID,
      M_REQUEST_STATUS_ID: status.M_REQUEST_STATUS_ID,
      APPROVER_EMPCODE: approverId,
      STEP_CODE: status.STEP_CODE,
      ACTOR_TYPE: status.ACTOR_TYPE || '',
      GROUP_CODE: groupCode || '',
      DESCRIPTION: dataItem.DESCRIPTION || status.STATUS_VALUE,
    })
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
      const requestId = Number(dataItem.REQUEST_REGISTER_VENDOR_ID)
      if (!requestId) throw new Error('Invalid request_id')

      const checkSql = await RequestRegisterPageSQL.getRequestStatusAndAssign({ REQUEST_REGISTER_VENDOR_ID: requestId })
      const checkRes = (await MySQLExecute.search(checkSql)) as RowDataPacket[]
      const request = checkRes[0]
      if (!request) throw new Error('Request not found')

      const stepsSql = await RequestRegisterPageSQL.getApprovalSteps({ REQUEST_REGISTER_VENDOR_ID: requestId })
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
          REQUEST_REGISTER_VENDOR_ID: requestId,
          REQUEST_APPROVAL_STEP_ID: currentStep.step_id,
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

  assertSelectionSheetEditable: async (requestId: number) => {
    return RequestRegisterGprService.assertSelectionSheetEditable(requestId)
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
