import { MySQLExecute } from '@businessData/dbExecute'
import { AccRegisterSQL } from '../../sql/_Acc-register/AccRegisterSQL'
import { RowDataPacket } from 'mysql2'
import { triggerCompletionEmail } from '../_request-register/RegisterRequestNotificationHelper'

export const AccRegisterService = {
    completeRegistration: async (dataItem: any) => {
        try {
            const stepsSql = await AccRegisterSQL.getApprovalSteps(dataItem)
            const steps = (await MySQLExecute.search(stepsSql)) as RowDataPacket[]
            const currentStep = steps.find((s: any) => s.step_status === 'in_progress')

            const sqlList = []
            if (currentStep) {
                sqlList.push(await AccRegisterSQL.updateApprovalStep({
                    step_id: currentStep.step_id,
                    step_status: 'approved',
                    UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
                }))
                sqlList.push(await AccRegisterSQL.createApprovalLog({
                    request_id: dataItem.request_id,
                    step_id: currentStep.step_id,
                    action_by: dataItem.UPDATE_BY || 'SYSTEM',
                    action_type: 'approved',
                    remark: dataItem.vendor_code ? `Vendor Code: ${dataItem.vendor_code}` : 'Registration completed',
                }))
            }

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
                TotalCountOnDb: 1
            }
        } catch (error: any) {
            return {
                Status: false,
                Message: error?.message || 'Completion failed',
                ResultOnDb: [],
                MethodOnDb: 'Complete Registration Failed',
                TotalCountOnDb: 0
            }
        }
    }

}
