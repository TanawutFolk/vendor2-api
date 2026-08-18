import { Router } from 'express'

import { ApprovalFlowSettingController } from '../../controllers/_approval-flow-setting/ApprovalFlowSettingController'

const router = Router()

router.post('/getWorkflowSetting', ApprovalFlowSettingController.getWorkflowSetting)
router.post('/getApprovalGroups', ApprovalFlowSettingController.getApprovalGroups)
router.post('/getWorkflowStepTypes', ApprovalFlowSettingController.getWorkflowStepTypes)
router.post('/saveWorkflowSetting', ApprovalFlowSettingController.saveWorkflowSetting)
router.post('/createWorkflowDraft', ApprovalFlowSettingController.createWorkflowDraft)
router.post('/saveWorkflowDraft', ApprovalFlowSettingController.saveWorkflowDraft)
router.post('/validateWorkflowDraft', ApprovalFlowSettingController.validateWorkflowDraft)
router.post('/publishWorkflow', ApprovalFlowSettingController.publishWorkflow)
router.post('/discardWorkflowDraft', ApprovalFlowSettingController.discardWorkflowDraft)

export default router
