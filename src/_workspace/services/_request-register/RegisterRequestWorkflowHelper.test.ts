import { describe, expect, test } from 'bun:test'
import {
  inferActorType,
  inferStepCode,
  requiresVendorReply,
  WORKFLOW_STEP_CODE,
} from './RegisterRequestWorkflowHelper'

describe('RegisterRequestWorkflowHelper', () => {
  test('separates the submitted step from the PO PIC review step in legacy data', () => {
    const submittedStep = {
      DESCRIPTION: 'Sent To PO & SCM (PIC)',
      STEP_CODE: 'PIC_REVIEW',
      REQUIRES_VENDOR_REPLY: 1,
    }
    const picReviewStep = {
      DESCRIPTION: 'PO & SCM approve (PIC)',
      STEP_CODE: 'PIC_REVIEW',
      REQUIRES_VENDOR_REPLY: 1,
    }

    expect(inferStepCode(submittedStep)).toBe(WORKFLOW_STEP_CODE.REQUEST_SUBMITTED)
    expect(inferActorType(submittedStep)).toBe('REQUESTER')
    expect(inferStepCode(picReviewStep)).toBe(WORKFLOW_STEP_CODE.PIC_REVIEW)
    expect(inferActorType(picReviewStep)).toBe('PIC')
  })

  test('uses the configured code when a display label changes', () => {
    const renamedStep = {
      DESCRIPTION: 'A renamed display label',
      STEP_CODE: WORKFLOW_STEP_CODE.PO_MGR_APPROVAL,
    }

    expect(inferStepCode(renamedStep)).toBe(WORKFLOW_STEP_CODE.PO_MGR_APPROVAL)
    expect(inferActorType(renamedStep)).toBe('APPROVER')
  })

  test('does not let a legacy display label override a valid configured code', () => {
    expect(
      inferStepCode({
        DESCRIPTION: 'PO Mgr Approve',
        STEP_CODE: WORKFLOW_STEP_CODE.DOC_CHECK,
      })
    ).toBe(WORKFLOW_STEP_CODE.DOC_CHECK)
  })

  test('requires a vendor reply only for the PO PIC review step by default', () => {
    expect(requiresVendorReply({ STEP_CODE: WORKFLOW_STEP_CODE.PIC_REVIEW })).toBe(true)
    expect(requiresVendorReply({ STEP_CODE: WORKFLOW_STEP_CODE.PENDING_AGREEMENT })).toBe(false)
  })
})
