import { MySQLExecute } from '@businessData/dbExecute'
import { RowDataPacket } from 'mysql2'

import { ApprovalFlowSettingSQL } from '../../sql/_approval-flow-setting/ApprovalFlowSettingSQL'

type WorkflowDefinitionRow = RowDataPacket & {
  WORKFLOW_DEFINITION_ID: number
  VERSION_NO: number
  DEFINITION_STATUS: string
  INUSE: number
}

type WorkflowStepRow = RowDataPacket & {
  WORKFLOW_STEP_MASTER_ID: number
  WORKFLOW_DEFINITION_ID: number
  WORKFLOW_STEP_TYPE_ID: number
  STEP_CODE: string
  STEP_NAME: string
  IS_CONFIGURABLE: number
  IS_REQUIRED: number
  ACTOR_TYPE?: string
  DEFAULT_STEP_ORDER: number
  DEFAULT_APPROVAL_GROUP_ID?: number
  CAN_EDIT_SELECTION_SHEET?: number
  LOCK_SELECTION_SHEET_ON_APPROVE?: number
  INUSE: number
}

type WorkflowTransitionRow = RowDataPacket & {
  WORKFLOW_TRANSITION_ID: number
  FROM_WORKFLOW_STEP_MASTER_ID: number
  M_WORKFLOW_ACTION_ID: number
  ACTION_CODE: string
  TO_WORKFLOW_STEP_MASTER_ID?: number
  M_REQUEST_STATE_ID?: number
  INUSE: number
}

type WorkflowBehaviorConfigRow = RowDataPacket & {
  WORKFLOW_BEHAVIOR_CONFIG_ID: number
  M_FORWARD_ACTION_ID: number
  M_SELECTION_EDIT_CAPABILITY_ID: number
  M_SELECTION_LOCK_CAPABILITY_ID: number
}

type ApprovalGroupRow = RowDataPacket & {
  APPROVAL_GROUP_ID: number
  APPROVER_NAME?: string
  ACTIVE_MEMBER_COUNT: number
}

type SaveStepPayload = {
  WORKFLOW_STEP_MASTER_ID?: number
  WORKFLOW_STEP_TYPE_ID?: number
  DEFAULT_STEP_ORDER?: number
  DEFAULT_APPROVAL_GROUP_ID?: number
  CAN_EDIT_SELECTION_SHEET?: number | boolean
  LOCK_SELECTION_SHEET_ON_APPROVE?: number | boolean
  INUSE?: number | boolean
}

const toPositiveInteger = (value: unknown) => {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0
}

const toFlag = (value: unknown) => (value === true || Number(value) === 1 ? 1 : 0)

const response = (Status: boolean, Message: string, ResultOnDb: unknown, MethodOnDb: string, TotalCountOnDb = 0) => ({
  Status,
  Message,
  ResultOnDb,
  MethodOnDb,
  TotalCountOnDb: Status ? TotalCountOnDb : 0,
})

const loadDefinitions = async () => {
  const sql = await ApprovalFlowSettingSQL.getDefinitions()
  return (await MySQLExecute.search(sql)) as WorkflowDefinitionRow[]
}

const loadDefinition = async (workflowDefinitionId: number) => {
  const sql = await ApprovalFlowSettingSQL.getDefinitionById({ WORKFLOW_DEFINITION_ID: workflowDefinitionId })
  const rows = (await MySQLExecute.search(sql)) as WorkflowDefinitionRow[]
  return rows[0]
}

const resolveDefinitionId = async (requestedId: unknown) => {
  const workflowDefinitionId = toPositiveInteger(requestedId)
  if (workflowDefinitionId) return workflowDefinitionId

  const sql = await ApprovalFlowSettingSQL.getPreferredDefinition()
  const rows = (await MySQLExecute.search(sql)) as WorkflowDefinitionRow[]
  return toPositiveInteger(rows[0]?.WORKFLOW_DEFINITION_ID)
}

const loadWorkflowData = async (workflowDefinitionId: number) => {
  const [definition, definitions, behaviorConfigRows, steps, transitions, approvalGroups, stepTypes, capabilities] = await Promise.all([
    loadDefinition(workflowDefinitionId),
    loadDefinitions(),
    (async () => {
      const sql = await ApprovalFlowSettingSQL.getBehaviorConfig({ WORKFLOW_DEFINITION_ID: workflowDefinitionId })
      return MySQLExecute.search(sql) as Promise<WorkflowBehaviorConfigRow[]>
    })(),
    (async () => {
      const sql = await ApprovalFlowSettingSQL.getSteps({ WORKFLOW_DEFINITION_ID: workflowDefinitionId })
      return MySQLExecute.search(sql) as Promise<WorkflowStepRow[]>
    })(),
    (async () => {
      const sql = await ApprovalFlowSettingSQL.getTransitions({ WORKFLOW_DEFINITION_ID: workflowDefinitionId })
      return MySQLExecute.search(sql) as Promise<WorkflowTransitionRow[]>
    })(),
    (async () => {
      const sql = await ApprovalFlowSettingSQL.getApprovalGroups()
      return MySQLExecute.search(sql) as Promise<ApprovalGroupRow[]>
    })(),
    (async () => {
      const sql = await ApprovalFlowSettingSQL.getStepTypes()
      return MySQLExecute.search(sql) as Promise<RowDataPacket[]>
    })(),
    (async () => {
      const sql = await ApprovalFlowSettingSQL.getCapabilities()
      return MySQLExecute.search(sql) as Promise<RowDataPacket[]>
    })(),
  ])

  if (!definition) throw new Error('Workflow definition was not found')
  const behaviorConfig = behaviorConfigRows[0]
  if (!behaviorConfig) throw new Error('Workflow behavior configuration was not found')

  return {
    DEFINITION: definition,
    DEFINITIONS: definitions,
    BEHAVIOR_CONFIG: behaviorConfig,
    STEPS: steps,
    TRANSITIONS: transitions,
    APPROVAL_GROUPS: approvalGroups,
    STEP_TYPES: stepTypes,
    CAPABILITIES: capabilities,
  }
}

const resolveWorkflowTopology = (workflowData: Awaited<ReturnType<typeof loadWorkflowData>>) => {
  const forwardActionId = Number(workflowData.BEHAVIOR_CONFIG.M_FORWARD_ACTION_ID)
  const configurableStepIds = new Set(
    workflowData.STEPS.filter((step) => Number(step.IS_CONFIGURABLE) === 1).map((step) => Number(step.WORKFLOW_STEP_MASTER_ID))
  )
  const stepsById = new Map(workflowData.STEPS.map((step) => [Number(step.WORKFLOW_STEP_MASTER_ID), step] as const))
  const forwardTransitions = workflowData.TRANSITIONS.filter(
    (transition) => Number(transition.M_WORKFLOW_ACTION_ID) === forwardActionId
  )
  const exitTransition = forwardTransitions
    .filter((transition) => {
      const targetStepId = toPositiveInteger(transition.TO_WORKFLOW_STEP_MASTER_ID)
      return configurableStepIds.has(Number(transition.FROM_WORKFLOW_STEP_MASTER_ID)) && targetStepId > 0 && !configurableStepIds.has(targetStepId)
    })
    .sort((left, right) => {
      const leftOrder = Number(stepsById.get(Number(left.FROM_WORKFLOW_STEP_MASTER_ID))?.DEFAULT_STEP_ORDER || 0)
      const rightOrder = Number(stepsById.get(Number(right.FROM_WORKFLOW_STEP_MASTER_ID))?.DEFAULT_STEP_ORDER || 0)
      return rightOrder - leftOrder
    })[0]

  return {
    forwardActionId,
    exitStep: stepsById.get(toPositiveInteger(exitTransition?.TO_WORKFLOW_STEP_MASTER_ID)),
    selectionEditorStep: workflowData.STEPS.find(
      (step) => Number(step.IS_CONFIGURABLE) !== 1 && Number(step.CAN_EDIT_SELECTION_SHEET) === 1
    ),
    selectionCheckpointStep: workflowData.STEPS.find(
      (step) => Number(step.IS_CONFIGURABLE) === 1 && Number(step.LOCK_SELECTION_SHEET_ON_APPROVE) === 1
    ),
  }
}

const validateWorkflowData = (workflowData: Awaited<ReturnType<typeof loadWorkflowData>>) => {
  const issues: string[] = []
  const activeSteps = workflowData.STEPS.filter((step) => Number(step.INUSE) === 1)
  const activeStepIds = new Set(activeSteps.map((step) => Number(step.WORKFLOW_STEP_MASTER_ID)))
  const activeTransitions = workflowData.TRANSITIONS.filter((transition) => Number(transition.INUSE) === 1)
  const topology = resolveWorkflowTopology(workflowData)
  const groupsById = new Map(workflowData.APPROVAL_GROUPS.map((group) => [Number(group.APPROVAL_GROUP_ID), group] as const))

  const duplicateOrders = activeSteps.map((step) => Number(step.DEFAULT_STEP_ORDER)).filter((order, index, orders) => orders.indexOf(order) !== index)
  if (duplicateOrders.length > 0) issues.push('Active workflow steps must have unique step orders.')

  const requiredInactiveSteps = workflowData.STEPS.filter((step) => Number(step.IS_REQUIRED) === 1 && Number(step.INUSE) !== 1)
  requiredInactiveSteps.forEach((step) => issues.push(String(step.STEP_NAME || step.STEP_CODE) + ' is required.'))

  const configurableActiveSteps = activeSteps.filter((step) => Number(step.IS_CONFIGURABLE) === 1)
  if (configurableActiveSteps.length === 0) issues.push('At least one approval step from Document Checker through MD is required.')

  configurableActiveSteps.forEach((step) => {
    const approvalGroupId = toPositiveInteger(step.DEFAULT_APPROVAL_GROUP_ID)
    if (!approvalGroupId || Number(groupsById.get(approvalGroupId)?.ACTIVE_MEMBER_COUNT || 0) === 0) {
      issues.push(String(step.STEP_NAME || step.STEP_CODE) + ' requires an active approval group member.')
    }
  })

  activeTransitions.forEach((transition) => {
    if (!activeStepIds.has(Number(transition.FROM_WORKFLOW_STEP_MASTER_ID))) {
      issues.push('An active transition starts from an inactive workflow step.')
    }
    const targetStepId = toPositiveInteger(transition.TO_WORKFLOW_STEP_MASTER_ID)
    if (targetStepId && !activeStepIds.has(targetStepId)) {
      issues.push('An active transition targets an inactive workflow step.')
    }
    if (!targetStepId && !toPositiveInteger(transition.M_REQUEST_STATE_ID)) {
      issues.push('A transition without a target step must end in a request state.')
    }
  })

  if (!topology.exitStep || Number(topology.exitStep.INUSE) !== 1) issues.push('The approval chain requires an active exit step.')

  const orderedConfigurableSteps = configurableActiveSteps.sort((left, right) => Number(left.DEFAULT_STEP_ORDER) - Number(right.DEFAULT_STEP_ORDER))
  orderedConfigurableSteps.forEach((step, index) => {
    const expectedTargetId =
      index < orderedConfigurableSteps.length - 1
        ? Number(orderedConfigurableSteps[index + 1].WORKFLOW_STEP_MASTER_ID)
        : Number(topology.exitStep?.WORKFLOW_STEP_MASTER_ID || 0)
    const forwardTransition = activeTransitions.find(
      (transition) =>
        Number(transition.FROM_WORKFLOW_STEP_MASTER_ID) === Number(step.WORKFLOW_STEP_MASTER_ID) &&
        Number(transition.M_WORKFLOW_ACTION_ID) === topology.forwardActionId
    )
    if (!forwardTransition || Number(forwardTransition.TO_WORKFLOW_STEP_MASTER_ID || 0) !== expectedTargetId) {
      issues.push(String(step.STEP_NAME || step.STEP_CODE) + ' has an invalid forward target.')
    }
  })

  return Array.from(new Set(issues))
}

export const ApprovalFlowSettingService = {
  getWorkflowSetting: async (dataItem: any = {}) => {
    try {
      const workflowDefinitionId = await resolveDefinitionId(dataItem.WORKFLOW_DEFINITION_ID)
      if (!workflowDefinitionId) throw new Error('No active Vendor Registration workflow was found')
      const workflowData = await loadWorkflowData(workflowDefinitionId)
      return response(true, 'Approval flow loaded successfully', workflowData, 'Get Workflow Setting', 1)
    } catch (error: unknown) {
      return response(false, error instanceof Error ? error.message : 'Failed to load approval flow', {}, 'Get Workflow Setting')
    }
  },

  getApprovalGroups: async () => {
    try {
      const sql = await ApprovalFlowSettingSQL.getApprovalGroups()
      const rows = (await MySQLExecute.search(sql)) as ApprovalGroupRow[]
      return response(true, 'Approval groups loaded successfully', rows, 'Get Approval Groups', rows.length)
    } catch (error: unknown) {
      return response(false, error instanceof Error ? error.message : 'Failed to load approval groups', [], 'Get Approval Groups')
    }
  },

  getWorkflowStepTypes: async () => {
    try {
      const sql = await ApprovalFlowSettingSQL.getStepTypes()
      const rows = (await MySQLExecute.search(sql)) as RowDataPacket[]
      return response(true, 'Workflow step types loaded successfully', rows, 'Get Workflow Step Types', rows.length)
    } catch (error: unknown) {
      return response(false, error instanceof Error ? error.message : 'Failed to load workflow step types', [], 'Get Workflow Step Types')
    }
  },

  saveWorkflowSetting: async (dataItem: any) => {
    try {
      const definitions = await loadDefinitions()
      const publishedDefinition = definitions.find(
        (definition) => definition.DEFINITION_STATUS === 'PUBLISHED' && Number(definition.INUSE) === 1
      )
      if (!publishedDefinition) throw new Error('No active published workflow was found')

      const publishedData = await loadWorkflowData(Number(publishedDefinition.WORKFLOW_DEFINITION_ID))
      const topology = resolveWorkflowTopology(publishedData)
      if (!topology.exitStep || !topology.selectionEditorStep) {
        throw new Error('The workflow behavior configuration is incomplete')
      }

      const configurableSteps = publishedData.STEPS.filter((step) => Number(step.IS_CONFIGURABLE) === 1)
      const configurableStepTypeIds = new Set(configurableSteps.map((step) => Number(step.WORKFLOW_STEP_TYPE_ID)))
      const payloadSteps = Array.isArray(dataItem.STEPS) ? (dataItem.STEPS as SaveStepPayload[]) : []
      if (payloadSteps.length !== configurableSteps.length) {
        throw new Error('All configurable workflow steps are required when saving the settings')
      }

      const payloadByStepTypeId = new Map(
        payloadSteps.map((step) => [toPositiveInteger(step.WORKFLOW_STEP_TYPE_ID), step] as const)
      )
      if ([...configurableStepTypeIds].some((stepTypeId) => !payloadByStepTypeId.has(stepTypeId))) {
        throw new Error('The workflow settings contain an unknown or missing step')
      }

      const approvalGroupsById = new Map(
        publishedData.APPROVAL_GROUPS.map((group) => [Number(group.APPROVAL_GROUP_ID), group] as const)
      )
      const configurableStepOrder = Math.min(...configurableSteps.map((step) => Number(step.DEFAULT_STEP_ORDER)))
      const normalizedSteps = configurableSteps.map((currentStep, index) => {
        const payload = payloadByStepTypeId.get(Number(currentStep.WORKFLOW_STEP_TYPE_ID)) as SaveStepPayload
        const inUse = Number(currentStep.IS_REQUIRED) === 1 ? 1 : toFlag(payload.INUSE)
        const approvalGroupId = toPositiveInteger(payload.DEFAULT_APPROVAL_GROUP_ID)

        if (inUse === 1 && (!approvalGroupId || Number(approvalGroupsById.get(approvalGroupId)?.ACTIVE_MEMBER_COUNT || 0) === 0)) {
          throw new Error(String(currentStep.STEP_NAME || currentStep.STEP_CODE) + ' requires an active approval group member')
        }

        return {
          ...currentStep,
          DEFAULT_STEP_ORDER: configurableStepOrder + index,
          DEFAULT_APPROVAL_GROUP_ID: approvalGroupId || currentStep.DEFAULT_APPROVAL_GROUP_ID,
          CAN_EDIT_SELECTION_SHEET: toFlag(currentStep.CAN_EDIT_SELECTION_SHEET),
          LOCK_SELECTION_SHEET_ON_APPROVE: toFlag(currentStep.LOCK_SELECTION_SHEET_ON_APPROVE),
          INUSE: inUse,
        }
      })
      const activeConfigurableSteps = normalizedSteps.filter((step) => Number(step.INUSE) === 1)
      if (activeConfigurableSteps.length === 0) throw new Error('At least one approval step is required')

      const selectionCheckpointStep = normalizedSteps.find(
        (step) => Number(step.WORKFLOW_STEP_TYPE_ID) === Number(topology.selectionCheckpointStep?.WORKFLOW_STEP_TYPE_ID)
      )
      const updateBy = String(dataItem.UPDATE_BY || 'SYSTEM')
      const sqlList: string[] = [
        await ApprovalFlowSettingSQL.prepareAutomaticDraft({
          SOURCE_WORKFLOW_DEFINITION_ID: publishedDefinition.WORKFLOW_DEFINITION_ID,
          DESCRIPTION: dataItem.DESCRIPTION || 'Approval flow settings updated',
          UPDATE_BY: updateBy,
        }),
      ]

      for (const step of normalizedSteps) {
        sqlList.push(
          await ApprovalFlowSettingSQL.updateAutomaticDraftStep({
            WORKFLOW_STEP_TYPE_ID: step.WORKFLOW_STEP_TYPE_ID,
            DEFAULT_STEP_ORDER: step.DEFAULT_STEP_ORDER,
            DEFAULT_APPROVAL_GROUP_ID: step.DEFAULT_APPROVAL_GROUP_ID,
            INUSE: step.INUSE,
            UPDATE_BY: updateBy,
          })
        )
        sqlList.push(
          await ApprovalFlowSettingSQL.updateAutomaticStepTransitionState({
            WORKFLOW_STEP_TYPE_ID: step.WORKFLOW_STEP_TYPE_ID,
            INUSE: step.INUSE,
            UPDATE_BY: updateBy,
          })
        )
        sqlList.push(
          await ApprovalFlowSettingSQL.upsertAutomaticStepCapability({
            WORKFLOW_STEP_TYPE_ID: step.WORKFLOW_STEP_TYPE_ID,
            M_WORKFLOW_CAPABILITY_ID: publishedData.BEHAVIOR_CONFIG.M_SELECTION_EDIT_CAPABILITY_ID,
            INUSE: step.CAN_EDIT_SELECTION_SHEET,
            UPDATE_BY: updateBy,
          })
        )
        sqlList.push(
          await ApprovalFlowSettingSQL.upsertAutomaticStepCapability({
            WORKFLOW_STEP_TYPE_ID: step.WORKFLOW_STEP_TYPE_ID,
            M_WORKFLOW_CAPABILITY_ID: publishedData.BEHAVIOR_CONFIG.M_SELECTION_LOCK_CAPABILITY_ID,
            INUSE: step.LOCK_SELECTION_SHEET_ON_APPROVE,
            UPDATE_BY: updateBy,
          })
        )
      }

      sqlList.push(
        await ApprovalFlowSettingSQL.upsertAutomaticStepCapability({
          WORKFLOW_STEP_TYPE_ID: topology.selectionEditorStep.WORKFLOW_STEP_TYPE_ID,
          M_WORKFLOW_CAPABILITY_ID: publishedData.BEHAVIOR_CONFIG.M_SELECTION_EDIT_CAPABILITY_ID,
          INUSE: 1,
          UPDATE_BY: updateBy,
        })
      )
      sqlList.push(
        await ApprovalFlowSettingSQL.upsertAutomaticStepCapability({
          WORKFLOW_STEP_TYPE_ID: topology.selectionEditorStep.WORKFLOW_STEP_TYPE_ID,
          M_WORKFLOW_CAPABILITY_ID: publishedData.BEHAVIOR_CONFIG.M_SELECTION_LOCK_CAPABILITY_ID,
          INUSE: Number(selectionCheckpointStep?.INUSE) === 1 ? 0 : 1,
          UPDATE_BY: updateBy,
        })
      )
      sqlList.push(await ApprovalFlowSettingSQL.disableAutomaticConfigurableForwardTransitions({ UPDATE_BY: updateBy }))
      sqlList.push(
        await ApprovalFlowSettingSQL.updateAutomaticIncomingConfigurableTransitions({
          FIRST_WORKFLOW_STEP_TYPE_ID: activeConfigurableSteps[0].WORKFLOW_STEP_TYPE_ID,
          UPDATE_BY: updateBy,
        })
      )

      for (let index = 0; index < activeConfigurableSteps.length; index += 1) {
        const fromStep = activeConfigurableSteps[index]
        const toStep = activeConfigurableSteps[index + 1] || topology.exitStep
        sqlList.push(
          await ApprovalFlowSettingSQL.upsertAutomaticForwardTransition({
            FROM_WORKFLOW_STEP_TYPE_ID: fromStep.WORKFLOW_STEP_TYPE_ID,
            TO_WORKFLOW_STEP_TYPE_ID: toStep.WORKFLOW_STEP_TYPE_ID,
            UPDATE_BY: updateBy,
          })
        )
      }

      sqlList.push(await ApprovalFlowSettingSQL.publishAutomaticDraft({ UPDATE_BY: updateBy }))
      sqlList.push(await ApprovalFlowSettingSQL.getAutomaticDraftId())

      const results = await MySQLExecute.executeList(sqlList)
      const draftIdRows = results[results.length - 1] as RowDataPacket[]
      const publishedWorkflowDefinitionId = toPositiveInteger(draftIdRows?.[0]?.WORKFLOW_DEFINITION_ID)
      if (!publishedWorkflowDefinitionId) {
        throw new Error('The published workflow changed while saving. Please refresh and try again')
      }

      const workflowData = await loadWorkflowData(publishedWorkflowDefinitionId)
      const issues = validateWorkflowData(workflowData)
      if (issues.length > 0) {
        throw new Error(issues.join(' '))
      }

      return response(true, 'Approval flow settings saved successfully', workflowData, 'Save Workflow Setting', 1)
    } catch (error: unknown) {
      return response(false, error instanceof Error ? error.message : 'Failed to save approval flow settings', {}, 'Save Workflow Setting')
    }
  },

  createWorkflowDraft: async (dataItem: any) => {
    try {
      const definitions = await loadDefinitions()
      const existingDraft = definitions.find((definition) => definition.DEFINITION_STATUS === 'DRAFT' && Number(definition.INUSE) === 1)
      if (existingDraft) {
        const workflowData = await loadWorkflowData(Number(existingDraft.WORKFLOW_DEFINITION_ID))
        return response(true, 'The existing draft was loaded', workflowData, 'Create Workflow Draft', 1)
      }

      const publishedDefinition = definitions.find((definition) => definition.DEFINITION_STATUS === 'PUBLISHED' && Number(definition.INUSE) === 1)
      if (!publishedDefinition) throw new Error('No published Vendor Registration workflow was found')

      const sql = await ApprovalFlowSettingSQL.createDraft({
        SOURCE_WORKFLOW_DEFINITION_ID: publishedDefinition.WORKFLOW_DEFINITION_ID,
        CREATE_BY: dataItem.CREATE_BY || 'SYSTEM',
        DESCRIPTION: dataItem.DESCRIPTION || 'Draft approval flow',
      })
      await MySQLExecute.execute(sql)

      const refreshedDefinitions = await loadDefinitions()
      const draft = refreshedDefinitions.find((definition) => definition.DEFINITION_STATUS === 'DRAFT' && Number(definition.INUSE) === 1)
      if (!draft) throw new Error('Failed to create workflow draft')

      const workflowData = await loadWorkflowData(Number(draft.WORKFLOW_DEFINITION_ID))
      return response(true, 'Workflow draft created successfully', workflowData, 'Create Workflow Draft', 1)
    } catch (error: unknown) {
      return response(false, error instanceof Error ? error.message : 'Failed to create workflow draft', {}, 'Create Workflow Draft')
    }
  },

  saveWorkflowDraft: async (dataItem: any) => {
    try {
      const workflowDefinitionId = toPositiveInteger(dataItem.WORKFLOW_DEFINITION_ID)
      const definition = await loadDefinition(workflowDefinitionId)
      if (!definition || definition.DEFINITION_STATUS !== 'DRAFT' || Number(definition.INUSE) !== 1) {
        throw new Error('Only an active workflow draft can be changed')
      }

      const currentData = await loadWorkflowData(workflowDefinitionId)
      const topology = resolveWorkflowTopology(currentData)
      if (!topology.exitStep || !topology.selectionEditorStep) {
        throw new Error('The workflow behavior configuration is incomplete')
      }
      const configurableSteps = currentData.STEPS.filter((step) => Number(step.IS_CONFIGURABLE) === 1)
      const configurableStepIds = new Set(configurableSteps.map((step) => Number(step.WORKFLOW_STEP_MASTER_ID)))
      const payloadSteps = Array.isArray(dataItem.STEPS) ? (dataItem.STEPS as SaveStepPayload[]) : []
      if (payloadSteps.length !== configurableSteps.length) {
        throw new Error('All configurable workflow steps are required when saving the draft')
      }

      const payloadById = new Map(payloadSteps.map((step) => [toPositiveInteger(step.WORKFLOW_STEP_MASTER_ID), step] as const))
      if ([...configurableStepIds].some((stepId) => !payloadById.has(stepId))) {
        throw new Error('The workflow draft contains an unknown or missing step')
      }

      const approvalGroupsById = new Map(currentData.APPROVAL_GROUPS.map((group) => [Number(group.APPROVAL_GROUP_ID), group] as const))
      const configurableStepOrder = Math.min(...configurableSteps.map((step) => Number(step.DEFAULT_STEP_ORDER)))
      const normalizedSteps = configurableSteps.map((currentStep, index) => {
        const payload = payloadById.get(Number(currentStep.WORKFLOW_STEP_MASTER_ID)) as SaveStepPayload
        const isRequired = Number(currentStep.IS_REQUIRED) === 1
        const inUse = isRequired ? 1 : toFlag(payload.INUSE)
        const approvalGroupId = toPositiveInteger(payload.DEFAULT_APPROVAL_GROUP_ID)

        if (inUse === 1) {
          if (!approvalGroupId || Number(approvalGroupsById.get(approvalGroupId)?.ACTIVE_MEMBER_COUNT || 0) === 0) {
            throw new Error(String(currentStep.STEP_NAME || currentStep.STEP_CODE) + ' requires an active approval group member')
          }
        }

        return {
          ...currentStep,
          DEFAULT_STEP_ORDER: configurableStepOrder + index,
          DEFAULT_APPROVAL_GROUP_ID: approvalGroupId || currentStep.DEFAULT_APPROVAL_GROUP_ID,
          CAN_EDIT_SELECTION_SHEET: toFlag(currentStep.CAN_EDIT_SELECTION_SHEET),
          LOCK_SELECTION_SHEET_ON_APPROVE: toFlag(currentStep.LOCK_SELECTION_SHEET_ON_APPROVE),
          INUSE: inUse,
        }
      })

      const activeConfigurableSteps = normalizedSteps.filter((step) => Number(step.INUSE) === 1)
      if (activeConfigurableSteps.length === 0) {
        throw new Error('At least one approval step from Document Checker through MD is required')
      }

      const updateBy = String(dataItem.UPDATE_BY || 'SYSTEM')
      const sqlList: string[] = []
      sqlList.push(
        await ApprovalFlowSettingSQL.updateDraftDescription({
          WORKFLOW_DEFINITION_ID: workflowDefinitionId,
          DESCRIPTION: dataItem.DESCRIPTION || definition.DESCRIPTION || 'Draft approval flow',
          UPDATE_BY: updateBy,
        })
      )

      for (const step of normalizedSteps) {
        sqlList.push(
          await ApprovalFlowSettingSQL.updateDraftStep({
            WORKFLOW_DEFINITION_ID: workflowDefinitionId,
            WORKFLOW_STEP_MASTER_ID: step.WORKFLOW_STEP_MASTER_ID,
            DEFAULT_STEP_ORDER: step.DEFAULT_STEP_ORDER,
            DEFAULT_APPROVAL_GROUP_ID: step.DEFAULT_APPROVAL_GROUP_ID,
            INUSE: step.INUSE,
            UPDATE_BY: updateBy,
          })
        )
        sqlList.push(
          await ApprovalFlowSettingSQL.updateStepTransitionState({
            WORKFLOW_DEFINITION_ID: workflowDefinitionId,
            WORKFLOW_STEP_MASTER_ID: step.WORKFLOW_STEP_MASTER_ID,
            INUSE: step.INUSE,
            UPDATE_BY: updateBy,
          })
        )
        sqlList.push(
          await ApprovalFlowSettingSQL.upsertStepCapability({
            WORKFLOW_DEFINITION_ID: workflowDefinitionId,
            WORKFLOW_STEP_MASTER_ID: step.WORKFLOW_STEP_MASTER_ID,
            M_WORKFLOW_CAPABILITY_ID: currentData.BEHAVIOR_CONFIG.M_SELECTION_EDIT_CAPABILITY_ID,
            INUSE: step.CAN_EDIT_SELECTION_SHEET,
            UPDATE_BY: updateBy,
          })
        )
        sqlList.push(
          await ApprovalFlowSettingSQL.upsertStepCapability({
            WORKFLOW_DEFINITION_ID: workflowDefinitionId,
            WORKFLOW_STEP_MASTER_ID: step.WORKFLOW_STEP_MASTER_ID,
            M_WORKFLOW_CAPABILITY_ID: currentData.BEHAVIOR_CONFIG.M_SELECTION_LOCK_CAPABILITY_ID,
            INUSE: step.LOCK_SELECTION_SHEET_ON_APPROVE,
            UPDATE_BY: updateBy,
          })
        )
      }

      const selectionCheckpointStep = normalizedSteps.find(
        (step) => Number(step.WORKFLOW_STEP_MASTER_ID) === Number(topology.selectionCheckpointStep?.WORKFLOW_STEP_MASTER_ID)
      )
      sqlList.push(
        await ApprovalFlowSettingSQL.upsertStepCapability({
          WORKFLOW_DEFINITION_ID: workflowDefinitionId,
          WORKFLOW_STEP_MASTER_ID: topology.selectionEditorStep.WORKFLOW_STEP_MASTER_ID,
          M_WORKFLOW_CAPABILITY_ID: currentData.BEHAVIOR_CONFIG.M_SELECTION_EDIT_CAPABILITY_ID,
          INUSE: 1,
          UPDATE_BY: updateBy,
        })
      )
      sqlList.push(
        await ApprovalFlowSettingSQL.upsertStepCapability({
          WORKFLOW_DEFINITION_ID: workflowDefinitionId,
          WORKFLOW_STEP_MASTER_ID: topology.selectionEditorStep.WORKFLOW_STEP_MASTER_ID,
          M_WORKFLOW_CAPABILITY_ID: currentData.BEHAVIOR_CONFIG.M_SELECTION_LOCK_CAPABILITY_ID,
          INUSE: Number(selectionCheckpointStep?.INUSE) === 1 ? 0 : 1,
          UPDATE_BY: updateBy,
        })
      )

      sqlList.push(
        await ApprovalFlowSettingSQL.disableConfigurableForwardTransitions({
          WORKFLOW_DEFINITION_ID: workflowDefinitionId,
          UPDATE_BY: updateBy,
        })
      )
      sqlList.push(
        await ApprovalFlowSettingSQL.updateIncomingConfigurableTransitions({
          WORKFLOW_DEFINITION_ID: workflowDefinitionId,
          FIRST_WORKFLOW_STEP_MASTER_ID: activeConfigurableSteps[0].WORKFLOW_STEP_MASTER_ID,
          UPDATE_BY: updateBy,
        })
      )

      for (let index = 0; index < activeConfigurableSteps.length; index += 1) {
        const fromStep = activeConfigurableSteps[index]
        const toStep = activeConfigurableSteps[index + 1] || topology.exitStep
        sqlList.push(
          await ApprovalFlowSettingSQL.upsertForwardTransition({
            WORKFLOW_DEFINITION_ID: workflowDefinitionId,
            FROM_WORKFLOW_STEP_MASTER_ID: fromStep.WORKFLOW_STEP_MASTER_ID,
            TO_WORKFLOW_STEP_MASTER_ID: toStep.WORKFLOW_STEP_MASTER_ID,
            UPDATE_BY: updateBy,
          })
        )
      }

      await MySQLExecute.executeList(sqlList)
      const workflowData = await loadWorkflowData(workflowDefinitionId)
      const issues = validateWorkflowData(workflowData)
      if (issues.length > 0) {
        return response(false, issues.join(' '), { ISSUES: issues }, 'Save Workflow Draft')
      }

      return response(true, 'Workflow draft saved successfully', workflowData, 'Save Workflow Draft', 1)
    } catch (error: unknown) {
      return response(false, error instanceof Error ? error.message : 'Failed to save workflow draft', {}, 'Save Workflow Draft')
    }
  },

  validateWorkflowDraft: async (dataItem: any) => {
    try {
      const workflowDefinitionId = toPositiveInteger(dataItem.WORKFLOW_DEFINITION_ID)
      const definition = await loadDefinition(workflowDefinitionId)
      if (!definition || definition.DEFINITION_STATUS !== 'DRAFT' || Number(definition.INUSE) !== 1) {
        throw new Error('Only an active workflow draft can be validated')
      }
      const workflowData = await loadWorkflowData(workflowDefinitionId)
      const issues = validateWorkflowData(workflowData)
      if (issues.length > 0) {
        return response(false, issues.join(' '), { ISSUES: issues }, 'Validate Workflow Draft')
      }
      return response(true, 'Workflow draft is valid', { ISSUES: [] }, 'Validate Workflow Draft', 1)
    } catch (error: unknown) {
      return response(false, error instanceof Error ? error.message : 'Failed to validate workflow draft', {}, 'Validate Workflow Draft')
    }
  },

  publishWorkflow: async (dataItem: any) => {
    try {
      const workflowDefinitionId = toPositiveInteger(dataItem.WORKFLOW_DEFINITION_ID)
      const definition = await loadDefinition(workflowDefinitionId)
      if (!definition || definition.DEFINITION_STATUS !== 'DRAFT' || Number(definition.INUSE) !== 1) {
        throw new Error('Only an active workflow draft can be published')
      }

      const workflowData = await loadWorkflowData(workflowDefinitionId)
      const issues = validateWorkflowData(workflowData)
      if (issues.length > 0) {
        return response(false, issues.join(' '), { ISSUES: issues }, 'Publish Workflow')
      }

      const sql = await ApprovalFlowSettingSQL.publishDraft({
        WORKFLOW_DEFINITION_ID: workflowDefinitionId,
        PUBLISH_BY: dataItem.PUBLISH_BY || dataItem.UPDATE_BY || 'SYSTEM',
      })
      await MySQLExecute.execute(sql)

      const publishedData = await loadWorkflowData(workflowDefinitionId)
      return response(true, 'Workflow published successfully. New requests will use this version.', publishedData, 'Publish Workflow', 1)
    } catch (error: unknown) {
      return response(false, error instanceof Error ? error.message : 'Failed to publish workflow', {}, 'Publish Workflow')
    }
  },

  discardWorkflowDraft: async (dataItem: any) => {
    try {
      const workflowDefinitionId = toPositiveInteger(dataItem.WORKFLOW_DEFINITION_ID)
      const definition = await loadDefinition(workflowDefinitionId)
      if (!definition || definition.DEFINITION_STATUS !== 'DRAFT' || Number(definition.INUSE) !== 1) {
        throw new Error('Only an active workflow draft can be discarded')
      }
      const sql = await ApprovalFlowSettingSQL.discardDraft({
        WORKFLOW_DEFINITION_ID: workflowDefinitionId,
        UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
      })
      await MySQLExecute.execute(sql)
      return response(true, 'Workflow draft discarded successfully', {}, 'Discard Workflow Draft', 1)
    } catch (error: unknown) {
      return response(false, error instanceof Error ? error.message : 'Failed to discard workflow draft', {}, 'Discard Workflow Draft')
    }
  },
}
