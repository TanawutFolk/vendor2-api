import { GprCApprovalService } from '../../services/_approval-GPRC/GprCApprovalService'

export const GprCApprovalModel = {
    gprCApproveStep: GprCApprovalService.approveStep,
    gprCRejectStep: GprCApprovalService.rejectStep,
    gprCActionRequired: GprCApprovalService.actionRequired,
    gprCRecordActionResult: GprCApprovalService.recordActionResult,
    gprCQueue: GprCApprovalService.getQueue,
    gprCActionRequiredQueue: GprCApprovalService.getActionRequiredQueue,
}
