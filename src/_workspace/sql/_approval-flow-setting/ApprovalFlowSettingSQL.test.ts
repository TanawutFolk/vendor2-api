import { describe, expect, test } from 'bun:test'

import { ApprovalFlowSettingSQL } from './ApprovalFlowSettingSQL'

describe('ApprovalFlowSettingSQL', () => {
  test('loads stable step and action identities for a workflow version', async () => {
    const [behaviorSql, stepsSql, transitionsSql] = await Promise.all([
      ApprovalFlowSettingSQL.getBehaviorConfig({ WORKFLOW_DEFINITION_ID: 7 }),
      ApprovalFlowSettingSQL.getSteps({ WORKFLOW_DEFINITION_ID: 7 }),
      ApprovalFlowSettingSQL.getTransitions({ WORKFLOW_DEFINITION_ID: 7 }),
    ])

    expect(behaviorSql).toContain('behavior_config.M_FORWARD_ACTION_ID')
    expect(behaviorSql).toContain('workflow_definition.WORKFLOW_DEFINITION_ID = 7')
    expect(stepsSql).toContain('workflow_step.WORKFLOW_STEP_TYPE_ID')
    expect(stepsSql).toContain('behavior_config.M_SELECTION_EDIT_CAPABILITY_ID')
    expect(stepsSql).toContain('workflow_step.WORKFLOW_DEFINITION_ID = 7')
    expect(transitionsSql).toContain('transition_row.M_WORKFLOW_ACTION_ID')
    expect(transitionsSql).toContain('transition_row.WORKFLOW_DEFINITION_ID = 7')
    expect(behaviorSql).not.toContain('dataItem.')
    expect(stepsSql).not.toContain('dataItem.')
    expect(transitionsSql).not.toContain('dataItem.')
  })

  test('loads the primary active approver name for approval group options', async () => {
    const sql = await ApprovalFlowSettingSQL.getApprovalGroups()

    expect(sql).toContain('active_approver.EMPNAME')
    expect(sql).toContain('active_approver.IS_PRIMARY DESC')
    expect(sql).toContain('AS APPROVER_NAME')
  })

  test('clones a published version into an isolated draft', async () => {
    const sql = await ApprovalFlowSettingSQL.createDraft({
      SOURCE_WORKFLOW_DEFINITION_ID: 7,
      CREATE_BY: 'S00001',
      DESCRIPTION: 'Remove Document Checker',
    })

    expect(sql).toContain('START TRANSACTION')
    expect(sql).toContain("'DRAFT'")
    expect(sql).toContain('SOURCE_WORKFLOW_DEFINITION_ID')
    expect(sql).toContain('draft_from.WORKFLOW_STEP_TYPE_ID = source_from.WORKFLOW_STEP_TYPE_ID')
    expect(sql).toContain('draft_to.WORKFLOW_STEP_TYPE_ID = source_to.WORKFLOW_STEP_TYPE_ID')
    expect(sql).toContain('COMMIT')
    expect(sql).not.toContain('dataItem.')
  })

  test('prepares the hidden workflow draft inside the caller transaction', async () => {
    const sql = await ApprovalFlowSettingSQL.prepareAutomaticDraft({
      SOURCE_WORKFLOW_DEFINITION_ID: 7,
      UPDATE_BY: 'S00001',
      DESCRIPTION: 'Approval settings updated',
    })

    expect(sql).toContain('FOR UPDATE')
    expect(sql).toContain('@draft_workflow_definition_id')
    expect(sql).toContain("active_draft.DEFINITION_STATUS = 'RETIRED'")
    expect(sql).not.toContain('START TRANSACTION')
    expect(sql).not.toContain('COMMIT')
    expect(sql).not.toContain('dataItem.')
  })

  test('redirects the configurable approval chain with action master ID', async () => {
    const [incomingSql, approveSql] = await Promise.all([
      ApprovalFlowSettingSQL.updateIncomingConfigurableTransitions({
        WORKFLOW_DEFINITION_ID: 8,
        FIRST_WORKFLOW_STEP_MASTER_ID: 81,
        UPDATE_BY: 'S00001',
      }),
      ApprovalFlowSettingSQL.upsertForwardTransition({
        WORKFLOW_DEFINITION_ID: 8,
        FROM_WORKFLOW_STEP_MASTER_ID: 81,
        TO_WORKFLOW_STEP_MASTER_ID: 82,
        UPDATE_BY: 'S00001',
      }),
    ])

    expect(incomingSql).toContain('transition_row.TO_WORKFLOW_STEP_MASTER_ID = 81')
    expect(incomingSql).toContain('current_target_type.IS_CONFIGURABLE = 1')
    expect(incomingSql).toContain('behavior_config.M_FORWARD_ACTION_ID')
    expect(approveSql).toContain('action_master.M_WORKFLOW_ACTION_ID')
    expect(approveSql).toContain('behavior_config.M_FORWARD_ACTION_ID')
    expect(approveSql).not.toContain("action_master.ACTION_CODE = 'APPROVE'")
    expect(approveSql).not.toContain('dataItem.')
  })

  test('updates step capabilities with master IDs instead of capability codes', async () => {
    const sql = await ApprovalFlowSettingSQL.upsertStepCapability({
      WORKFLOW_DEFINITION_ID: 8,
      WORKFLOW_STEP_MASTER_ID: 81,
      M_WORKFLOW_CAPABILITY_ID: 2,
      INUSE: 1,
      UPDATE_BY: 'S00001',
    })

    expect(sql).toContain('capability.M_WORKFLOW_CAPABILITY_ID = 2')
    expect(sql).not.toContain('capability.CAPABILITY_CODE =')
    expect(sql).not.toContain('dataItem.')
  })

  test('publishes automatic settings by step type IDs without exposing a draft', async () => {
    const [stepSql, transitionSql, publishSql] = await Promise.all([
      ApprovalFlowSettingSQL.updateAutomaticDraftStep({
        WORKFLOW_STEP_TYPE_ID: 4,
        DEFAULT_STEP_ORDER: 7,
        DEFAULT_APPROVAL_GROUP_ID: 5,
        INUSE: 0,
        UPDATE_BY: 'S00001',
      }),
      ApprovalFlowSettingSQL.upsertAutomaticForwardTransition({
        FROM_WORKFLOW_STEP_TYPE_ID: 5,
        TO_WORKFLOW_STEP_TYPE_ID: 6,
        UPDATE_BY: 'S00001',
      }),
      ApprovalFlowSettingSQL.publishAutomaticDraft({ UPDATE_BY: 'S00001' }),
    ])

    expect(stepSql).toContain('workflow_step.WORKFLOW_DEFINITION_ID = @draft_workflow_definition_id')
    expect(stepSql).toContain('workflow_step.WORKFLOW_STEP_TYPE_ID = 4')
    expect(transitionSql).toContain('from_step.WORKFLOW_STEP_TYPE_ID = 5')
    expect(transitionSql).toContain('to_step.WORKFLOW_STEP_TYPE_ID = 6')
    expect(publishSql).toContain("workflow_definition.DEFINITION_STATUS = 'PUBLISHED'")
    expect(publishSql).not.toContain('START TRANSACTION')
    expect(stepSql + transitionSql + publishSql).not.toContain('dataItem.')
  })

  test('uses one approval group for every vendor type', async () => {
    const sql = await ApprovalFlowSettingSQL.updateDraftStep({
      WORKFLOW_DEFINITION_ID: 8,
      WORKFLOW_STEP_MASTER_ID: 81,
      DEFAULT_STEP_ORDER: 7,
      DEFAULT_APPROVAL_GROUP_ID: 5,
      INUSE: 1,
      UPDATE_BY: 'S00001',
    })

    expect(sql).toContain('workflow_step.DEFAULT_APPROVAL_GROUP_ID_LOCAL = 5')
    expect(sql).toContain('workflow_step.DEFAULT_APPROVAL_GROUP_ID_OVERSEA = 5')
    expect(sql).not.toContain('dataItem.')
  })
})
