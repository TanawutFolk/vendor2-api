import { ApprovalQueueService } from '../../services/_approval-queue/ApprovalQueueService'

export const ApprovalQueueModel = {
    getAllRequests: ApprovalQueueService.getAllRequests,
    updateStatus: ApprovalQueueService.updateStatus,
    getStatusOptions: ApprovalQueueService.getStatusOptions,
    reassignAssignment: ApprovalQueueService.reassignAssignment,
}
