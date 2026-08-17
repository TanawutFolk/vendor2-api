import { describe, expect, test } from 'bun:test'
import {
  inferActorType,
  inferStepCode,
  getVendorCodePrefix,
  isVendorCodeComplete,
  requiresVendorReply,
  resolveWorkflowAction,
  WORKFLOW_ACTION,
  WORKFLOW_STEP_CODE,
} from './RegisterRequestWorkflowHelper'

describe('RegisterRequestWorkflowHelper', () => {
  test('uses only configured step and actor identity, never display-label inference', () => {
    const submittedStep = {
      DESCRIPTION: 'Sent To PO & SCM (PIC)',
      STEP_CODE: 'REQUEST_SUBMITTED',
      ACTOR_TYPE: 'REQUESTER',
      REQUIRES_VENDOR_REPLY: 1,
    }
    const picReviewStep = {
      DESCRIPTION: 'PO & SCM approve (PIC)',
      STEP_CODE: 'PIC_REVIEW',
      ACTOR_TYPE: 'PIC',
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
      ACTOR_TYPE: 'APPROVER',
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

  test('uses the configured vendor-reply flag instead of a step-code default', () => {
    expect(requiresVendorReply({ STEP_CODE: WORKFLOW_STEP_CODE.PIC_REVIEW, REQUIRES_VENDOR_REPLY: 1 })).toBe(true)
    expect(requiresVendorReply({ STEP_CODE: WORKFLOW_STEP_CODE.PIC_REVIEW, REQUIRES_VENDOR_REPLY: 0 })).toBe(false)
  })

  test('does not alias a legacy code into a different workflow identity', () => {
    expect(inferStepCode({ STEP_CODE: 'PENDING_AGREEMENT' })).toBe('PENDING_AGREEMENT')
  })

  test('resolves RECHECK as a separate workflow action', () => {
    expect(resolveWorkflowAction({ ACTION_CODE: 'RECHECK' })).toBe(WORKFLOW_ACTION.RECHECK)
  })

  test('does not treat the local or oversea prefix as a completed vendor code', () => {
    expect(getVendorCodePrefix(false)).toBe('20030')
    expect(getVendorCodePrefix(true)).toBe('20031')
    expect(isVendorCodeComplete('20030', false)).toBe(false)
    expect(isVendorCodeComplete('20031', true)).toBe(false)
    expect(isVendorCodeComplete('20030FEC01', false)).toBe(true)
    expect(isVendorCodeComplete('20031ABC01', true)).toBe(true)
    expect(isVendorCodeComplete('20031ABC01', false)).toBe(false)
    expect(isVendorCodeComplete('20031ABC-01', true)).toBe(false)
  })
})
