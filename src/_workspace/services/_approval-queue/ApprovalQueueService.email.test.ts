import { describe, expect, mock, test } from 'bun:test'

// Verifies the email-notification wiring of the shared approval workflow
// (request-register / md-approval / poGm-approval / poMgr-approval / check-document all funnel here).
// DB + mail transport are mocked, so no real query runs and no real email is sent — we only assert
// that every Approve and Reject queues the correct notification.
//
// Mocks + import happen inside each test (matching GprCApprovalService.test.ts) so bun's global
// mock.module registry can't leak a partial helper mock in from another test file.

const approverStep = {
  REQUEST_APPROVAL_STEP_ID: 10,
  REQUEST_REGISTER_VENDOR_ID: 101,
  WORKFLOW_STEP_MASTER_ID: 306,
  M_APPROVAL_STEP_STATUS_ID: 2,
  STEP_ORDER: 3,
  STEP_STATUS: 'in_progress',
  STEP_CODE: 'MD_APPROVAL',
  ACTOR_TYPE: 'APPROVER',
  APPROVER_EMPCODE: 'S00001',
  DESCRIPTION: 'MD Approve',
}

const nextApproverStep = {
  REQUEST_APPROVAL_STEP_ID: 11,
  REQUEST_REGISTER_VENDOR_ID: 101,
  WORKFLOW_STEP_MASTER_ID: 304,
  M_APPROVAL_STEP_STATUS_ID: 1,
  STEP_ORDER: 4,
  STEP_STATUS: 'pending',
  STEP_CODE: 'PO_MGR_APPROVAL',
  ACTOR_TYPE: 'APPROVER',
  APPROVER_EMPCODE: 'S00002',
  GROUP_CODE: 'PO_MGR',
  DESCRIPTION: 'PO Mgr Approve',
}

const requestContext = {
  VENDORS_ID: 55,
  ASSIGN_TO: 'S00007',
  VENDOR_REGION: 'Local',
  REQUEST_NUMBER: 'Selection-26-N101',
  VENDOR_CODE_SELECTOR: '',
  M_REQUEST_STATE_ID: 1,
  REQUEST_STATE: 'in_progress',
  WORKFLOW_DEFINITION_ID: 1,
  CURRENT_REQUEST_APPROVAL_STEP_ID: 10,
  LOCK_VERSION: 0,
}

// Post-commit mail tasks are fire-and-forget (void runPostCommitTasks). Give them a tick to run.
const flushPostCommit = () => new Promise((resolve) => setTimeout(resolve, 30))

async function setup(steps: any[], context: any, requester = 'S00009', options: { recheckToPic?: boolean } = {}) {
  const spies = {
    nextStep: mock(async () => undefined),
    recheckToPicByApprover: mock(async () => undefined),
    recheckToPicByPoMgr: mock(async () => undefined),
    actionRequired: mock(async () => undefined),
    gprCApproved: mock(async () => undefined),
    completed: mock(async () => undefined),
    rejected: mock(async () => undefined),
    incomplete: mock(async () => undefined),
    negotiation: mock(async () => undefined),
  }

  const search = mock(async (query: string) => {
    if (query.includes('workflow_transition wt')) {
      const transitionId = Number(query.match(/wt\.WORKFLOW_TRANSITION_ID = (\d+)/)?.[1] || 0)
      const isRecheck = transitionId === 3
      const isReject = transitionId === 2
      const nextStep = steps.find((step) => step.STEP_STATUS === 'pending')
      const transitionNextStep = isRecheck && options.recheckToPic ? steps.find((step) => step.STEP_CODE === 'PO_PIC_IN_PROGRESS') : nextStep
      return [
        {
          WORKFLOW_TRANSITION_ID: transitionId,
          ACTION_CODE: isReject ? 'REJECT' : isRecheck ? 'RECHECK' : 'APPROVE',
          TO_WORKFLOW_STEP_MASTER_ID: transitionNextStep?.WORKFLOW_STEP_MASTER_ID || null,
          TERMINAL_REQUEST_STATE_ID: isReject ? 3 : transitionNextStep ? null : 2,
          TERMINAL_STATE: isReject ? 'rejected' : transitionNextStep ? null : 'completed',
          TERMINAL_IS_TERMINAL: transitionNextStep ? 0 : 1,
          CONDITION_KEY: isRecheck && options.recheckToPic ? 'RECHECK_TO_PIC' : null,
          NEXT_REQUEST_APPROVAL_STEP_ID: transitionNextStep?.REQUEST_APPROVAL_STEP_ID || null,
          NEXT_STEP_ORDER: transitionNextStep?.STEP_ORDER,
          NEXT_APPROVER_EMPCODE: transitionNextStep?.APPROVER_EMPCODE,
          NEXT_STEP_STATUS_ID: transitionNextStep?.M_APPROVAL_STEP_STATUS_ID,
          NEXT_STEP_STATUS: transitionNextStep?.STEP_STATUS,
          NEXT_GROUP_CODE: transitionNextStep?.GROUP_CODE,
          NEXT_ASSIGNMENT_MODE: 'AUTO',
          NEXT_M_REQUEST_STATUS_ID: 2,
          NEXT_STEP_CODE: transitionNextStep?.STEP_CODE,
          NEXT_ACTOR_TYPE: transitionNextStep?.ACTOR_TYPE,
          NEXT_STATUS_VALUE: transitionNextStep?.DESCRIPTION,
        },
      ]
    }
    if (query.includes('request_approval_step ras')) return steps
    if (query.includes('REQUEST_BY_EMPLOYEECODE') && query.includes('request_register_vendor')) {
      return [{ REQUEST_BY_EMPLOYEECODE: requester }]
    }
    if (query.includes('VENDOR_CODE_SELECTOR') || query.includes('GPR_43_ACCEPTANCE_STATUS')) {
      return [context]
    }
    // resolveStepApprover -> isActiveAssigneeInGroup (only assignees_to query reached inside the service)
    if (query.includes('assignees_to')) {
      return [{ EMPCODE: 'S00002', EMPEMAIL: 'next.approver@example.com', GROUP_CODE: 'PO_MGR', INUSE: 1 }]
    }
    return []
  }) as any

  const executeGuardedList = mock(async () => [])

  mock.module('@businessData/dbExecute', () => ({
    MySQLExecute: {
      search,
      executeList: mock(async () => []),
      executeGuardedList,
      execute: mock(async () => ({ insertId: 1 })),
      searchList: mock(async () => []),
    },
  }))

  // Full superset of the helper exports ApprovalQueueService imports, so the import never fails.
  mock.module('../_request-register/RegisterRequestNotificationHelper', () => ({
    sendMail_ToApprover_NextStep: spies.nextStep,
    sendMail_ToPic_RecheckByApprover: spies.recheckToPicByApprover,
    sendMail_ToPic_RecheckByPoMgr: spies.recheckToPicByPoMgr,
    sendMail_ToUser_ActionRequired: spies.actionRequired,
    sendMail_ToRequester_GprCApproved: spies.gprCApproved,
    sendMail_ToRequester_RegistrationCompleted: spies.completed,
    sendMail_ToPic_RequestRejected: spies.rejected,
    sendMail_ToRequester_RegistrationIncomplete: spies.incomplete,
    sendMail_NegotiationStageDispatch: spies.negotiation,
  }))

  mock.module('../_status-master/StatusIdentityService', () => {
    const identity = {
      workflowStep: {
        requestSubmitted: 297,
        picReview: 298,
        poPicInProgress: 299,
        vendorDisagreed: 300,
        issueGprB: 301,
        issueGprC: 302,
        docCheck: 303,
        poMgrApproval: 304,
        poGmApproval: 305,
        mdApproval: 306,
        accountRegistered: 307,
      },
      approvalStep: { pending: 1, inProgress: 2, approved: 3, rejected: 4, skipped: 5 },
      requestState: { inProgress: 1, completed: 2, rejected: 3, cancelled: 4 },
      requestStatus: { rejected: 99 },
      vendor: { notRegistered: 1, registered: 2, inProgress: 3, cannotRegister: 4 },
      gprCFlow: { draft: 1, requesterSetup: 2, inProgress: 3, approved: 4, rejected: 5, recheckRequired: 6 },
      actionResult: { pending: 1, incomplete: 2, completed: 3 },
    }

    return {
      getWorkflowStepIdentity: mock(async () => identity.workflowStep),
      getApprovalStepStatusIdentity: mock(async () => identity.approvalStep),
      getRequestStateIdentity: mock(async () => identity.requestState),
      getRequestStatusIdentity: mock(async () => identity.requestStatus),
      getVendorStatusIdentity: mock(async () => identity.vendor),
      getGprCFlowStatusIdentity: mock(async () => identity.gprCFlow),
      getActionResultStatusIdentity: mock(async () => identity.actionResult),
    }
  })

  mock.module('@src/config/sendEmail', () => ({ default: mock(async () => ({ success: true })) }))

  const { ApprovalQueueService } = await import('./ApprovalQueueService')
  return { ApprovalQueueService, spies, executeGuardedList }
}

describe('ApprovalQueueService.updateStatus email notifications', () => {
  test('PO_MGR RECHECK reopens PO PIC and resets Document Check', async () => {
    const poMgrStep = {
      ...approverStep,
      WORKFLOW_STEP_MASTER_ID: 304,
      STEP_CODE: 'PO_MGR_APPROVAL',
      DESCRIPTION: 'PO Mgr Approval',
    }
    const docCheckStep = {
      ...nextApproverStep,
      REQUEST_APPROVAL_STEP_ID: 9,
      WORKFLOW_STEP_MASTER_ID: 303,
      M_APPROVAL_STEP_STATUS_ID: 3,
      STEP_ORDER: 2,
      STEP_STATUS: 'approved',
      STEP_CODE: 'DOC_CHECK',
      APPROVER_EMPCODE: 'S00002',
      GROUP_CODE: 'PO_CHECKER_MAIN',
      DESCRIPTION: 'PO & SCM Check All Document',
    }
    const poPicStep = {
      ...nextApproverStep,
      REQUEST_APPROVAL_STEP_ID: 8,
      WORKFLOW_STEP_MASTER_ID: 299,
      M_APPROVAL_STEP_STATUS_ID: 3,
      STEP_ORDER: 1,
      STEP_STATUS: 'approved',
      STEP_CODE: 'PO_PIC_IN_PROGRESS',
      ACTOR_TYPE: 'PIC',
      APPROVER_EMPCODE: 'S00007',
      GROUP_CODE: 'LOCAL_PO_PIC',
      DESCRIPTION: 'PO PIC In Progress',
    }
    const { ApprovalQueueService, spies, executeGuardedList } = await setup([poPicStep, docCheckStep, poMgrStep], requestContext, 'S00009', { recheckToPic: true })

    const result = await ApprovalQueueService.updateStatus({
      REQUEST_REGISTER_VENDOR_ID: 101,
      CURRENT_TASK_ID: 10,
      LOCK_VERSION: 0,
      WORKFLOW_TRANSITION_ID: 3,
      APPROVE_BY: 'S00001',
      UPDATE_BY: 'S00001',
      APPROVER_REMARK: 'Please check the supporting documents again',
    } as any)

    expect(result.Status).toBe(true)
    const sqlList = (executeGuardedList as any).mock.calls[0]?.[1] as string[]
    const sql = sqlList.join('\n')
    expect(sql).toMatch(/,\s*'recheck'\s*,\s*'RECHECK'/)
    expect(sql).toContain('RECHECK_REASON')
    expect(sql).toContain('RECHECK')
    expect(sql).toContain('REQUEST_APPROVAL_STEP_ID = 10')
    expect(sql).toContain('M_APPROVAL_STEP_STATUS_ID = 1')
    expect(sql).toContain('REQUEST_APPROVAL_STEP_ID = 9')
    expect(sql).toContain('REQUEST_APPROVAL_STEP_ID = 8')
    expect(sql).toContain('M_APPROVAL_STEP_STATUS_ID = 2')
    expect(sql).not.toContain('UPDATE vendors SET')
    const docCheckResetSql = sqlList.find((statement) => statement.includes('UPDATE request_approval_step SET') && statement.includes('REQUEST_APPROVAL_STEP_ID = 9'))
    const poPicReopenSql = sqlList.find((statement) => statement.includes('UPDATE request_approval_step SET') && statement.includes('REQUEST_APPROVAL_STEP_ID = 8'))
    expect(docCheckResetSql).toContain('M_APPROVAL_STEP_STATUS_ID = 1')
    expect(poPicReopenSql).toContain('M_APPROVAL_STEP_STATUS_ID = 2')

    await flushPostCommit()
    expect(spies.recheckToPicByPoMgr).toHaveBeenCalledTimes(1)
    expect(spies.recheckToPicByApprover).not.toHaveBeenCalled()
    expect(spies.nextStep).not.toHaveBeenCalled()
    expect(spies.rejected).not.toHaveBeenCalled()
    expect(spies.incomplete).not.toHaveBeenCalled()
  })

  test('DOC_CHECK RECHECK reopens the PO PIC task without using Reject', async () => {
    const docCheckStep = {
      ...approverStep,
      WORKFLOW_STEP_MASTER_ID: 303,
      STEP_CODE: 'DOC_CHECK',
      DESCRIPTION: 'PO & SCM Check All Document',
    }
    const poPicStep = {
      ...nextApproverStep,
      REQUEST_APPROVAL_STEP_ID: 9,
      WORKFLOW_STEP_MASTER_ID: 299,
      M_APPROVAL_STEP_STATUS_ID: 3,
      STEP_ORDER: 2,
      STEP_STATUS: 'approved',
      STEP_CODE: 'PO_PIC_IN_PROGRESS',
      ACTOR_TYPE: 'PIC',
      APPROVER_EMPCODE: 'S00007',
      GROUP_CODE: 'LOCAL_PO_PIC',
      DESCRIPTION: 'PO PIC In Progress',
    }
    const { ApprovalQueueService, spies, executeGuardedList } = await setup([poPicStep, docCheckStep], requestContext, 'S00009', { recheckToPic: true })

    const result = await ApprovalQueueService.updateStatus({
      REQUEST_REGISTER_VENDOR_ID: 101,
      CURRENT_TASK_ID: 10,
      LOCK_VERSION: 0,
      WORKFLOW_TRANSITION_ID: 3,
      APPROVE_BY: 'S00001',
      UPDATE_BY: 'S00001',
      APPROVER_REMARK: 'Please correct the missing documents',
    } as any)

    expect(result.Status).toBe(true)
    const sqlList = (executeGuardedList as any).mock.calls[0]?.[1] as string[]
    const sql = sqlList.join('\n')
    expect(sql).toMatch(/,\s*'recheck'\s*,\s*'RECHECK'/)
    expect(sql).toContain('RECHECK_REASON')
    expect(sql).toContain('REQUEST_APPROVAL_STEP_ID = 10')
    expect(sql).toContain('M_APPROVAL_STEP_STATUS_ID = 1')
    expect(sql).toContain('REQUEST_APPROVAL_STEP_ID = 9')
    expect(sql).toContain('M_APPROVAL_STEP_STATUS_ID = 2')
    expect(sql).not.toContain('UPDATE vendors SET')

    await flushPostCommit()
    expect(spies.recheckToPicByApprover).toHaveBeenCalledTimes(1)
    expect(spies.recheckToPicByPoMgr).not.toHaveBeenCalled()
    expect(spies.rejected).not.toHaveBeenCalled()
    expect(spies.incomplete).not.toHaveBeenCalled()
  })

  test('REJECT queues a rejection email to the PIC', async () => {
    const { ApprovalQueueService, spies } = await setup([approverStep], requestContext)

    const result = await ApprovalQueueService.updateStatus({
      REQUEST_REGISTER_VENDOR_ID: 101,
      CURRENT_TASK_ID: 10,
      LOCK_VERSION: 0,
      WORKFLOW_TRANSITION_ID: 2,
      APPROVE_BY: 'S00001',
      UPDATE_BY: 'S00001',
      APPROVER_REMARK: 'Documents incomplete',
    } as any)

    expect(result.Status).toBe(true)
    await flushPostCommit()

    expect(spies.rejected).toHaveBeenCalledTimes(1)
    expect(spies.nextStep).not.toHaveBeenCalled()
  })

  test('APPROVE queues a next-step approval email', async () => {
    const { ApprovalQueueService, spies } = await setup([approverStep, nextApproverStep], requestContext)

    const result = await ApprovalQueueService.updateStatus({
      REQUEST_REGISTER_VENDOR_ID: 101,
      CURRENT_TASK_ID: 10,
      LOCK_VERSION: 0,
      WORKFLOW_TRANSITION_ID: 1,
      APPROVE_BY: 'S00001',
      UPDATE_BY: 'S00001',
    } as any)

    expect(result.Status).toBe(true)
    await flushPostCommit()

    expect(spies.nextStep).toHaveBeenCalledTimes(1)
    expect(spies.rejected).not.toHaveBeenCalled()
  })

  test('final-step APPROVE queues the registration-completed email to the requester', async () => {
    // No pending step after the current one -> workflow completes -> requester completion email.
    const { ApprovalQueueService, spies } = await setup([approverStep], requestContext)

    const result = await ApprovalQueueService.updateStatus({
      REQUEST_REGISTER_VENDOR_ID: 101,
      CURRENT_TASK_ID: 10,
      LOCK_VERSION: 0,
      WORKFLOW_TRANSITION_ID: 1,
      APPROVE_BY: 'S00001',
      UPDATE_BY: 'S00001',
    } as any)

    expect(result.Status).toBe(true)
    await flushPostCommit()

    expect(spies.completed).toHaveBeenCalledTimes(1)
    expect(spies.rejected).not.toHaveBeenCalled()
  })
})
