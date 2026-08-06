import { MySQLExecute } from '@businessData/dbExecute'
import { AccRegisterSQL } from '../../sql/_Acc-register/AccRegisterSQL'
import { RowDataPacket } from 'mysql2'
import { sendMail_ToRequester_RegistrationCompleted } from '../_request-register/RegisterRequestNotificationHelper'
import {
  getApprovalStepStatusIdentity,
  getRequestStateIdentity,
  getVendorStatusIdentity,
  getWorkflowStepIdentity,
} from '../_status-master/StatusIdentityService'

const normalizeApprovalStep = (step: any) => ({
  ...step,
  step_id: Number(step?.step_id || step?.REQUEST_APPROVAL_STEP_ID || 0),
  workflow_step_id: Number(step?.workflow_step_id || step?.WORKFLOW_STEP_MASTER_ID || 0),
  approval_step_status_id: Number(step?.approval_step_status_id || step?.M_APPROVAL_STEP_STATUS_ID || 0),
})

export const AccRegisterService = {
  completeRegistration: async (dataItem: any) => {
    try {
      let vendorCode = String(dataItem.VENDOR_CODE || '').trim()
      if (!vendorCode) {
        const selectionSql = await AccRegisterSQL.getSelectionVendorCode(dataItem)
        const selectionRows = (await MySQLExecute.search(selectionSql)) as RowDataPacket[]
        vendorCode = String(selectionRows[0]?.VENDOR_CODE || '').trim()
      }
      if (!vendorCode) {
        throw new Error('Vendor Code is required in the Selection Sheet before completing registration.')
      }
      dataItem.VENDOR_CODE = vendorCode
      const [workflowStep, approvalStep, requestState, vendor] = await Promise.all([
        getWorkflowStepIdentity(),
        getApprovalStepStatusIdentity(),
        getRequestStateIdentity(),
        getVendorStatusIdentity(),
      ])

      const [stepsSql, contextSql] = await Promise.all([
        AccRegisterSQL.getApprovalSteps(dataItem),
        AccRegisterSQL.getWorkflowContext(dataItem),
      ])
      const [stepRows, contextRows] = await Promise.all([
        MySQLExecute.search(stepsSql) as Promise<RowDataPacket[]>,
        MySQLExecute.search(contextSql) as Promise<RowDataPacket[]>,
      ])
      const steps = stepRows.map(normalizeApprovalStep)
      const context = contextRows[0]
      const vendorId = Number(context?.VENDORS_ID || 0)
      const currentTaskId = Number(context?.CURRENT_REQUEST_APPROVAL_STEP_ID || 0)
      const lockVersion = Number(context?.LOCK_VERSION || 0)
      const payloadTaskId = Number(dataItem.CURRENT_TASK_ID || 0)
      const payloadLockVersion = Number(dataItem.LOCK_VERSION)
      const currentStep = steps.find(
        (s: any) =>
          s.step_id === currentTaskId &&
          s.approval_step_status_id === approvalStep.inProgress
      )
      if (!currentStep) {
        throw new Error('No active Account Registered step found.')
      }
      if (!payloadTaskId || payloadTaskId !== currentTaskId || !Number.isInteger(payloadLockVersion) || payloadLockVersion !== lockVersion) {
        throw new Error('Workflow state changed. Please refresh the request and try again.')
      }
      if (currentStep.workflow_step_id !== workflowStep.accountRegistered) {
        throw new Error('Registration can only be completed at Account Registered step.')
      }
      const transitionSql = await AccRegisterSQL.getWorkflowTransition({
        REQUEST_REGISTER_VENDOR_ID: dataItem.REQUEST_REGISTER_VENDOR_ID,
        CURRENT_WORKFLOW_STEP_MASTER_ID: context?.WORKFLOW_STEP_MASTER_ID,
        TERMINAL_REQUEST_STATE_ID: requestState.completed,
      })
      const transitionRows = (await MySQLExecute.search(transitionSql)) as RowDataPacket[]
      const transition = transitionRows[0]
      if (!transition || Number(transition.TERMINAL_REQUEST_STATE_ID || 0) !== requestState.completed) {
        throw new Error('A completion transition is not configured for Account Registered.')
      }
      if (!vendorId) {
        throw new Error('Vendor is not linked to this registration request.')
      }

      const sqlList = []
      sqlList.push(
        await AccRegisterSQL.updateApprovalStep({
          REQUEST_APPROVAL_STEP_ID: currentStep.step_id,
          M_APPROVAL_STEP_STATUS_ID: approvalStep.approved,
          UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
        })
      )
      sqlList.push(
        await AccRegisterSQL.createApprovalLog({
          REQUEST_REGISTER_VENDOR_ID: dataItem.REQUEST_REGISTER_VENDOR_ID,
          REQUEST_APPROVAL_STEP_ID: currentStep.step_id,
          ACTION_BY: dataItem.UPDATE_BY || 'SYSTEM',
          ACTION_TYPE: String(transition.ACTION_CODE || '').toLowerCase(),
          ACTION_CODE: transition.ACTION_CODE,
          REMARK: `Vendor Code: ${dataItem.VENDOR_CODE}`,
        })
      )

      sqlList.push(
        await AccRegisterSQL.updateVendorFftVendorCode({
          VENDORS_ID: vendorId,
          VENDOR_CODE: dataItem.VENDOR_CODE,
        })
      )
      sqlList.push(
        await AccRegisterSQL.updateVendorFftStatus({
          VENDORS_ID: vendorId,
          M_VENDOR_STATUS_ID: vendor.registered,
        })
      )
      sqlList.push(
        await AccRegisterSQL.completeRegistration({
          ...dataItem,
          M_REQUEST_COMPLETED_STATE_ID: requestState.completed,
        })
      )
      const guardSql = await AccRegisterSQL.acquireWorkflowLock({
        REQUEST_REGISTER_VENDOR_ID: dataItem.REQUEST_REGISTER_VENDOR_ID,
        CURRENT_TASK_ID: currentTaskId,
        LOCK_VERSION: lockVersion,
        M_REQUEST_IN_PROGRESS_STATE_ID: requestState.inProgress,
        UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
      })
      const resultData = await MySQLExecute.executeGuardedList(guardSql, sqlList)

      try {
        await sendMail_ToRequester_RegistrationCompleted(dataItem)
      } catch {
        // console.error('[completeRegistration] Completion email failed:', mailErr?.message)
      }

      return {
        Status: true,
        Message: 'Registration completed successfully',
        ResultOnDb: resultData,
        MethodOnDb: 'Complete Registration',
        TotalCountOnDb: 1,
      }
    } catch (error: any) {
      return {
        Status: false,
        Message: error?.message || 'Completion failed',
        ResultOnDb: [],
        MethodOnDb: 'Complete Registration Failed',
        TotalCountOnDb: 0,
      }
    }
  },
}
