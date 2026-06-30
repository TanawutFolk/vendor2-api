import { MySQLExecute } from '@businessData/dbExecute'
import { AccRegisterSQL } from '../../sql/_Acc-register/AccRegisterSQL'
import { RowDataPacket } from 'mysql2'
import { triggerCompletionEmail } from '../_request-register/RegisterRequestNotificationHelper'

const normalizeApprovalStep = (step: any) => ({
  ...step,
  step_id: Number(step?.step_id || step?.REQUEST_APPROVAL_STEP_ID || 0),
  step_status: String(step?.step_status || step?.STEP_STATUS || ''),
  step_code: String(step?.step_code || step?.STEP_CODE || '').trim().toUpperCase(),
  description: String(step?.description || step?.DESCRIPTION || '').trim().toLowerCase(),
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

      const stepsSql = await AccRegisterSQL.getApprovalSteps(dataItem)
      const steps = ((await MySQLExecute.search(stepsSql)) as RowDataPacket[]).map(normalizeApprovalStep)
      const currentStep = steps.find((s: any) => String(s.step_status || '').toLowerCase() === 'in_progress')
      if (!currentStep) {
        throw new Error('No active Account Registered step found.')
      }
      if (currentStep.step_code !== 'ACCOUNT_REGISTERED' && !currentStep.description.includes('account registered')) {
        throw new Error('Registration can only be completed at Account Registered step.')
      }

      const sqlList = []
      sqlList.push(
        await AccRegisterSQL.updateApprovalStep({
          REQUEST_APPROVAL_STEP_ID: currentStep.step_id,
          STEP_STATUS: 'approved',
          UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
        })
      )
      sqlList.push(
        await AccRegisterSQL.createApprovalLog({
          REQUEST_REGISTER_VENDOR_ID: dataItem.REQUEST_REGISTER_VENDOR_ID,
          REQUEST_APPROVAL_STEP_ID: currentStep.step_id,
          ACTION_BY: dataItem.UPDATE_BY || 'SYSTEM',
          ACTION_TYPE: 'approved',
          REMARK: `Vendor Code: ${dataItem.VENDOR_CODE}`,
        })
      )

      sqlList.push(await AccRegisterSQL.completeRegistration(dataItem))
      const resultData = await MySQLExecute.executeList(sqlList)

      try {
        await triggerCompletionEmail(dataItem)
      } catch (mailErr: any) {
        console.error('[completeRegistration] Completion email failed:', mailErr?.message)
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
