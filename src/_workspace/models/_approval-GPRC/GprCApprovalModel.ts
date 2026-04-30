import { GprCApprovalService } from '../../services/_approval-GPRC/GprCApprovalService'

export const GprCApprovalModel = {
    gprCApproveStep: async (dataItem: any) => GprCApprovalService.approveStep(dataItem),
    gprCRejectStep: async (dataItem: any) => GprCApprovalService.rejectStep(dataItem),
    gprCActionRequired: async (dataItem: any) => GprCApprovalService.actionRequired(dataItem),
    gprCRecordActionResult: async (dataItem: any) => GprCApprovalService.recordActionResult(dataItem),
    gprCQueue: async (dataItem: any) => GprCApprovalService.getQueue(dataItem),
    gprCActionRequiredQueue: async (dataItem: any) => GprCApprovalService.getActionRequiredQueue(dataItem),
}
