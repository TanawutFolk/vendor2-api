const escapeSqlText = (value: unknown) => String(value ?? '').replaceAll("'", "''")

const toPositiveInteger = (value: unknown) => {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0
}

export const ApprovalFlowSettingSQL = {
  getDefinitions: async () => `
                            SELECT
                                       workflow_definition.WORKFLOW_DEFINITION_ID
                                     , workflow_definition.WORKFLOW_CODE
                                     , workflow_definition.WORKFLOW_NAME
                                     , workflow_definition.VERSION_NO
                                     , workflow_definition.SOURCE_WORKFLOW_DEFINITION_ID
                                     , workflow_definition.DEFINITION_STATUS
                                     , workflow_definition.PUBLISHED_DATE
                                     , workflow_definition.PUBLISHED_BY
                                     , workflow_definition.RETIRED_DATE
                                     , workflow_definition.DESCRIPTION
                                     , workflow_definition.CREATE_BY
                                     , workflow_definition.CREATE_DATE
                                     , workflow_definition.UPDATE_BY
                                     , workflow_definition.UPDATE_DATE
                                     , workflow_definition.INUSE
                            FROM
                                       workflow_definition
                                            INNER JOIN
                                       workflow_behavior_config behavior_config
                                             ON behavior_config.WORKFLOW_CODE = workflow_definition.WORKFLOW_CODE
                                             AND behavior_config.INUSE = 1
                            WHERE
                                       workflow_definition.DEFINITION_STATUS IN ('DRAFT', 'PUBLISHED', 'RETIRED')
                            ORDER BY
                                       workflow_definition.VERSION_NO DESC
  `,

  getDefinitionById: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       workflow_definition.WORKFLOW_DEFINITION_ID
                                     , workflow_definition.WORKFLOW_CODE
                                     , workflow_definition.WORKFLOW_NAME
                                     , workflow_definition.VERSION_NO
                                     , workflow_definition.SOURCE_WORKFLOW_DEFINITION_ID
                                     , workflow_definition.DEFINITION_STATUS
                                     , workflow_definition.PUBLISHED_DATE
                                     , workflow_definition.PUBLISHED_BY
                                     , workflow_definition.RETIRED_DATE
                                     , workflow_definition.DESCRIPTION
                                     , workflow_definition.CREATE_BY
                                     , workflow_definition.CREATE_DATE
                                     , workflow_definition.UPDATE_BY
                                     , workflow_definition.UPDATE_DATE
                                     , workflow_definition.INUSE
                            FROM
                                       workflow_definition
                                            INNER JOIN
                                       workflow_behavior_config behavior_config
                                             ON behavior_config.WORKFLOW_CODE = workflow_definition.WORKFLOW_CODE
                                             AND behavior_config.INUSE = 1
                            WHERE
                                       workflow_definition.WORKFLOW_DEFINITION_ID = dataItem.WORKFLOW_DEFINITION_ID
                            LIMIT 1
    `
    sql = sql.replaceAll('dataItem.WORKFLOW_DEFINITION_ID', toPositiveInteger(dataItem['WORKFLOW_DEFINITION_ID']).toString())
    return sql
  },

  getPreferredDefinition: async () => `
                            SELECT
                                       workflow_definition.WORKFLOW_DEFINITION_ID
                                     , workflow_definition.DEFINITION_STATUS
                            FROM
                                       workflow_definition
                                            INNER JOIN
                                       workflow_behavior_config behavior_config
                                             ON behavior_config.WORKFLOW_CODE = workflow_definition.WORKFLOW_CODE
                                             AND behavior_config.INUSE = 1
                            WHERE
                                       workflow_definition.INUSE = 1
                                       AND workflow_definition.DEFINITION_STATUS = 'PUBLISHED'
                            ORDER BY
                                       workflow_definition.VERSION_NO DESC
                            LIMIT 1
  `,

  getBehaviorConfig: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       behavior_config.WORKFLOW_BEHAVIOR_CONFIG_ID
                                     , behavior_config.M_FORWARD_ACTION_ID
                                     , behavior_config.M_SELECTION_EDIT_CAPABILITY_ID
                                     , behavior_config.M_SELECTION_LOCK_CAPABILITY_ID
                            FROM
                                       workflow_definition workflow_definition
                                            INNER JOIN
                                       workflow_behavior_config behavior_config
                                             ON behavior_config.WORKFLOW_CODE = workflow_definition.WORKFLOW_CODE
                                             AND behavior_config.INUSE = 1
                            WHERE
                                       workflow_definition.WORKFLOW_DEFINITION_ID = dataItem.WORKFLOW_DEFINITION_ID
                            LIMIT 1
    `
    sql = sql.replaceAll('dataItem.WORKFLOW_DEFINITION_ID', toPositiveInteger(dataItem['WORKFLOW_DEFINITION_ID']).toString())
    return sql
  },

  getSteps: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       workflow_step.WORKFLOW_STEP_MASTER_ID
                                     , workflow_step.WORKFLOW_DEFINITION_ID
                                     , workflow_step.WORKFLOW_STEP_TYPE_ID
                                     , step_type.STEP_CODE
                                     , step_type.STEP_NAME
                                     , step_type.IS_CONFIGURABLE
                                     , step_type.IS_REQUIRED
                                     , workflow_step.M_REQUEST_STATUS_ID
                                     , request_status.STATUS_LABEL_EN AS STATUS_LABEL
                                     , workflow_step.ACTOR_TYPE
                                     , workflow_step.HANDLER_KEY
                                     , workflow_step.DEFAULT_STEP_ORDER
                                     , workflow_step.IS_OPTIONAL
                                     , COALESCE(
                                           workflow_step.DEFAULT_APPROVAL_GROUP_ID_LOCAL,
                                           workflow_step.DEFAULT_APPROVAL_GROUP_ID_OVERSEA
                                       ) AS DEFAULT_APPROVAL_GROUP_ID
                                     , approval_group.GROUP_CODE AS APPROVAL_GROUP_CODE
                                     , approval_group.GROUP_NAME AS APPROVAL_GROUP_NAME
                                     , workflow_step.REQUIRES_VENDOR_REPLY
                                     , workflow_step.REQUIRES_VENDOR_CODE
                                     , workflow_step.DESCRIPTION
                                     , workflow_step.INUSE
                                     , MAX(
                                           CASE
                                             WHEN capability.M_WORKFLOW_CAPABILITY_ID = behavior_config.M_SELECTION_EDIT_CAPABILITY_ID
                                               AND step_capability.INUSE = 1 THEN 1
                                             ELSE 0
                                           END
                                       ) AS CAN_EDIT_SELECTION_SHEET
                                     , MAX(
                                           CASE
                                             WHEN capability.M_WORKFLOW_CAPABILITY_ID = behavior_config.M_SELECTION_LOCK_CAPABILITY_ID
                                               AND step_capability.INUSE = 1 THEN 1
                                             ELSE 0
                                           END
                                       ) AS LOCK_SELECTION_SHEET_ON_APPROVE
                            FROM
                                       workflow_step_master workflow_step
                                            INNER JOIN
                                       workflow_definition workflow_definition
                                             ON workflow_definition.WORKFLOW_DEFINITION_ID = workflow_step.WORKFLOW_DEFINITION_ID
                                            INNER JOIN
                                       workflow_behavior_config behavior_config
                                             ON behavior_config.WORKFLOW_CODE = workflow_definition.WORKFLOW_CODE
                                             AND behavior_config.INUSE = 1
                                            INNER JOIN
                                       m_workflow_step_type step_type
                                             ON step_type.WORKFLOW_STEP_TYPE_ID = workflow_step.WORKFLOW_STEP_TYPE_ID
                                            INNER JOIN
                                       m_request_status request_status
                                             ON request_status.M_REQUEST_STATUS_ID = workflow_step.M_REQUEST_STATUS_ID
                                            LEFT JOIN
                                       approval_group approval_group
                                             ON approval_group.APPROVAL_GROUP_ID = COALESCE(
                                                  workflow_step.DEFAULT_APPROVAL_GROUP_ID_LOCAL,
                                                  workflow_step.DEFAULT_APPROVAL_GROUP_ID_OVERSEA
                                                )
                                            LEFT JOIN
                                       workflow_step_capability step_capability
                                             ON step_capability.WORKFLOW_STEP_MASTER_ID = workflow_step.WORKFLOW_STEP_MASTER_ID
                                            LEFT JOIN
                                       m_workflow_capability capability
                                             ON capability.M_WORKFLOW_CAPABILITY_ID = step_capability.M_WORKFLOW_CAPABILITY_ID
                            WHERE
                                       workflow_step.WORKFLOW_DEFINITION_ID = dataItem.WORKFLOW_DEFINITION_ID
                            GROUP BY
                                       workflow_step.WORKFLOW_STEP_MASTER_ID
                                     , workflow_step.WORKFLOW_DEFINITION_ID
                                     , workflow_step.WORKFLOW_STEP_TYPE_ID
                                     , step_type.STEP_CODE
                                     , step_type.STEP_NAME
                                     , step_type.IS_CONFIGURABLE
                                     , step_type.IS_REQUIRED
                                     , workflow_step.M_REQUEST_STATUS_ID
                                     , request_status.STATUS_LABEL_EN
                                     , workflow_step.ACTOR_TYPE
                                     , workflow_step.HANDLER_KEY
                                     , workflow_step.DEFAULT_STEP_ORDER
                                     , workflow_step.IS_OPTIONAL
                                     , workflow_step.DEFAULT_APPROVAL_GROUP_ID_LOCAL
                                     , workflow_step.DEFAULT_APPROVAL_GROUP_ID_OVERSEA
                                     , approval_group.GROUP_CODE
                                     , approval_group.GROUP_NAME
                                     , workflow_step.REQUIRES_VENDOR_REPLY
                                     , workflow_step.REQUIRES_VENDOR_CODE
                                     , workflow_step.DESCRIPTION
                                     , workflow_step.INUSE
                                     , behavior_config.M_SELECTION_EDIT_CAPABILITY_ID
                                     , behavior_config.M_SELECTION_LOCK_CAPABILITY_ID
                            ORDER BY
                                       workflow_step.DEFAULT_STEP_ORDER ASC
                                     , workflow_step.WORKFLOW_STEP_MASTER_ID ASC
    `
    sql = sql.replaceAll('dataItem.WORKFLOW_DEFINITION_ID', toPositiveInteger(dataItem['WORKFLOW_DEFINITION_ID']).toString())
    return sql
  },

  getTransitions: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       transition_row.WORKFLOW_TRANSITION_ID
                                     , transition_row.WORKFLOW_DEFINITION_ID
                                     , transition_row.FROM_WORKFLOW_STEP_MASTER_ID
                                     , from_type.WORKFLOW_STEP_TYPE_ID AS FROM_WORKFLOW_STEP_TYPE_ID
                                     , from_type.STEP_CODE AS FROM_STEP_CODE
                                     , transition_row.M_WORKFLOW_ACTION_ID
                                     , action_master.ACTION_CODE
                                     , action_master.ACTION_LABEL
                                     , transition_row.TO_WORKFLOW_STEP_MASTER_ID
                                     , to_type.WORKFLOW_STEP_TYPE_ID AS TO_WORKFLOW_STEP_TYPE_ID
                                     , to_type.STEP_CODE AS TO_STEP_CODE
                                     , transition_row.M_REQUEST_STATE_ID
                                     , request_state.STATE_CODE AS TERMINAL_STATE_CODE
                                     , transition_row.CONDITION_KEY
                                     , transition_row.PRIORITY_NO
                                     , transition_row.DESCRIPTION
                                     , transition_row.INUSE
                            FROM
                                       workflow_transition transition_row
                                            INNER JOIN
                                       workflow_step_master from_step
                                             ON from_step.WORKFLOW_STEP_MASTER_ID = transition_row.FROM_WORKFLOW_STEP_MASTER_ID
                                            INNER JOIN
                                       m_workflow_step_type from_type
                                             ON from_type.WORKFLOW_STEP_TYPE_ID = from_step.WORKFLOW_STEP_TYPE_ID
                                            INNER JOIN
                                       m_workflow_action action_master
                                             ON action_master.M_WORKFLOW_ACTION_ID = transition_row.M_WORKFLOW_ACTION_ID
                                            LEFT JOIN
                                       workflow_step_master to_step
                                             ON to_step.WORKFLOW_STEP_MASTER_ID = transition_row.TO_WORKFLOW_STEP_MASTER_ID
                                            LEFT JOIN
                                       m_workflow_step_type to_type
                                             ON to_type.WORKFLOW_STEP_TYPE_ID = to_step.WORKFLOW_STEP_TYPE_ID
                                            LEFT JOIN
                                       m_request_state request_state
                                             ON request_state.M_REQUEST_STATE_ID = transition_row.M_REQUEST_STATE_ID
                            WHERE
                                       transition_row.WORKFLOW_DEFINITION_ID = dataItem.WORKFLOW_DEFINITION_ID
                            ORDER BY
                                       from_step.DEFAULT_STEP_ORDER ASC
                                     , transition_row.PRIORITY_NO ASC
                                     , transition_row.WORKFLOW_TRANSITION_ID ASC
    `
    sql = sql.replaceAll('dataItem.WORKFLOW_DEFINITION_ID', toPositiveInteger(dataItem['WORKFLOW_DEFINITION_ID']).toString())
    return sql
  },

  getApprovalGroups: async () => `
                            SELECT
                                       approval_group.APPROVAL_GROUP_ID
                                     , approval_group.GROUP_CODE
                                     , approval_group.GROUP_NAME
                                     , (
                                           SELECT active_approver.EMPNAME
                                           FROM approval_group_member active_approver
                                           WHERE active_approver.APPROVAL_GROUP_ID = approval_group.APPROVAL_GROUP_ID
                                             AND active_approver.INUSE = 1
                                           ORDER BY
                                                      active_approver.IS_PRIMARY DESC
                                                    , active_approver.PRIORITY_NO ASC
                                                    , active_approver.APPROVAL_GROUP_MEMBER_ID ASC
                                           LIMIT 1
                                       ) AS APPROVER_NAME
                                     , COUNT(active_member.APPROVAL_GROUP_MEMBER_ID) AS ACTIVE_MEMBER_COUNT
                            FROM
                                       approval_group
                                            LEFT JOIN
                                       approval_group_member active_member
                                             ON active_member.APPROVAL_GROUP_ID = approval_group.APPROVAL_GROUP_ID
                                             AND active_member.INUSE = 1
                            WHERE
                                       approval_group.INUSE = 1
                            GROUP BY
                                       approval_group.APPROVAL_GROUP_ID
                                     , approval_group.GROUP_CODE
                                     , approval_group.GROUP_NAME
                            ORDER BY
                                       approval_group.GROUP_NAME ASC
                                     , approval_group.APPROVAL_GROUP_ID ASC
  `,

  getStepTypes: async () => `
                            SELECT
                                       step_type.WORKFLOW_STEP_TYPE_ID
                                     , step_type.STEP_CODE
                                     , step_type.STEP_NAME
                                     , step_type.IS_CONFIGURABLE
                                     , step_type.IS_REQUIRED
                                     , step_type.SORT_ORDER
                                     , step_type.INUSE
                            FROM
                                       m_workflow_step_type step_type
                            WHERE
                                       step_type.INUSE = 1
                            ORDER BY
                                       step_type.SORT_ORDER ASC
                                     , step_type.WORKFLOW_STEP_TYPE_ID ASC
  `,

  getCapabilities: async () => `
                            SELECT
                                       capability.M_WORKFLOW_CAPABILITY_ID
                                     , capability.CAPABILITY_CODE
                                     , capability.CAPABILITY_NAME
                                     , capability.SORT_ORDER
                            FROM
                                       m_workflow_capability capability
                            WHERE
                                       capability.INUSE = 1
                            ORDER BY
                                       capability.SORT_ORDER ASC
                                     , capability.M_WORKFLOW_CAPABILITY_ID ASC
  `,

  createDraft: async (dataItem: any) => {
    let sql = `
                            START TRANSACTION;

                            SET @source_workflow_definition_id = dataItem.SOURCE_WORKFLOW_DEFINITION_ID;
                            SET @draft_workflow_definition_id = 0;

                            INSERT INTO workflow_definition (
                                       WORKFLOW_CODE
                                     , WORKFLOW_NAME
                                     , VERSION_NO
                                     , SOURCE_WORKFLOW_DEFINITION_ID
                                     , DEFINITION_STATUS
                                     , PUBLISHED_DATE
                                     , PUBLISHED_BY
                                     , RETIRED_DATE
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , DESCRIPTION
                                     , INUSE
                            )
                            SELECT
                                       source_definition.WORKFLOW_CODE
                                     , source_definition.WORKFLOW_NAME
                                     , (
                                           SELECT COALESCE(MAX(existing_definition.VERSION_NO), 0) + 1
                                           FROM workflow_definition existing_definition
                                           WHERE existing_definition.WORKFLOW_CODE = source_definition.WORKFLOW_CODE
                                       )
                                     , source_definition.WORKFLOW_DEFINITION_ID
                                     , 'DRAFT'
                                     , NULL
                                     , NULL
                                     , NULL
                                     , 'dataItem.CREATE_BY'
                                     , 'dataItem.CREATE_BY'
                                     , LEFT('dataItem.DESCRIPTION', 100)
                                     , 1
                            FROM
                                       workflow_definition source_definition
                                            INNER JOIN
                                       workflow_behavior_config behavior_config
                                             ON behavior_config.WORKFLOW_CODE = source_definition.WORKFLOW_CODE
                                             AND behavior_config.INUSE = 1
                            WHERE
                                       source_definition.WORKFLOW_DEFINITION_ID = @source_workflow_definition_id
                                       AND source_definition.DEFINITION_STATUS = 'PUBLISHED'
                                       AND source_definition.INUSE = 1
                                       AND NOT EXISTS (
                                           SELECT 1
                                           FROM workflow_definition active_draft
                                           WHERE active_draft.WORKFLOW_CODE = source_definition.WORKFLOW_CODE
                                             AND active_draft.DEFINITION_STATUS = 'DRAFT'
                                             AND active_draft.INUSE = 1
                                       );

                            SET @draft_workflow_definition_id = IF(ROW_COUNT() = 1, LAST_INSERT_ID(), 0);

                            INSERT INTO workflow_step_master (
                                       WORKFLOW_DEFINITION_ID
                                     , WORKFLOW_STEP_TYPE_ID
                                     , M_REQUEST_STATUS_ID
                                     , STEP_CODE
                                     , ACTOR_TYPE
                                     , HANDLER_KEY
                                     , DEFAULT_GROUP_CODE_LOCAL
                                     , DEFAULT_GROUP_CODE_OVERSEA
                                     , DEFAULT_APPROVAL_GROUP_ID_LOCAL
                                     , DEFAULT_APPROVAL_GROUP_ID_OVERSEA
                                     , REQUIRES_VENDOR_REPLY
                                     , REQUIRES_VENDOR_CODE
                                     , DEFAULT_STEP_ORDER
                                     , IS_OPTIONAL
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , DESCRIPTION
                                     , INUSE
                            )
                            SELECT
                                       @draft_workflow_definition_id
                                     , source_step.WORKFLOW_STEP_TYPE_ID
                                     , source_step.M_REQUEST_STATUS_ID
                                     , source_step.STEP_CODE
                                     , source_step.ACTOR_TYPE
                                     , source_step.HANDLER_KEY
                                     , source_step.DEFAULT_GROUP_CODE_LOCAL
                                     , source_step.DEFAULT_GROUP_CODE_OVERSEA
                                     , source_step.DEFAULT_APPROVAL_GROUP_ID_LOCAL
                                     , source_step.DEFAULT_APPROVAL_GROUP_ID_OVERSEA
                                     , source_step.REQUIRES_VENDOR_REPLY
                                     , source_step.REQUIRES_VENDOR_CODE
                                     , source_step.DEFAULT_STEP_ORDER
                                     , source_step.IS_OPTIONAL
                                     , 'dataItem.CREATE_BY'
                                     , 'dataItem.CREATE_BY'
                                     , source_step.DESCRIPTION
                                     , source_step.INUSE
                            FROM
                                       workflow_step_master source_step
                            WHERE
                                       source_step.WORKFLOW_DEFINITION_ID = @source_workflow_definition_id
                                       AND @draft_workflow_definition_id > 0;

                            INSERT INTO workflow_transition (
                                       WORKFLOW_DEFINITION_ID
                                     , FROM_WORKFLOW_STEP_MASTER_ID
                                     , M_WORKFLOW_ACTION_ID
                                     , ACTION_CODE
                                     , TO_WORKFLOW_STEP_MASTER_ID
                                     , M_REQUEST_STATE_ID
                                     , CONDITION_KEY
                                     , PRIORITY_NO
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , DESCRIPTION
                                     , INUSE
                            )
                            SELECT
                                       @draft_workflow_definition_id
                                     , draft_from.WORKFLOW_STEP_MASTER_ID
                                     , source_transition.M_WORKFLOW_ACTION_ID
                                     , source_transition.ACTION_CODE
                                     , draft_to.WORKFLOW_STEP_MASTER_ID
                                     , source_transition.M_REQUEST_STATE_ID
                                     , source_transition.CONDITION_KEY
                                     , source_transition.PRIORITY_NO
                                     , 'dataItem.CREATE_BY'
                                     , 'dataItem.CREATE_BY'
                                     , source_transition.DESCRIPTION
                                     , source_transition.INUSE
                            FROM
                                       workflow_transition source_transition
                                            INNER JOIN
                                       workflow_step_master source_from
                                             ON source_from.WORKFLOW_STEP_MASTER_ID = source_transition.FROM_WORKFLOW_STEP_MASTER_ID
                                            INNER JOIN
                                       workflow_step_master draft_from
                                             ON draft_from.WORKFLOW_DEFINITION_ID = @draft_workflow_definition_id
                                             AND draft_from.WORKFLOW_STEP_TYPE_ID = source_from.WORKFLOW_STEP_TYPE_ID
                                            LEFT JOIN
                                       workflow_step_master source_to
                                             ON source_to.WORKFLOW_STEP_MASTER_ID = source_transition.TO_WORKFLOW_STEP_MASTER_ID
                                            LEFT JOIN
                                       workflow_step_master draft_to
                                             ON draft_to.WORKFLOW_DEFINITION_ID = @draft_workflow_definition_id
                                             AND draft_to.WORKFLOW_STEP_TYPE_ID = source_to.WORKFLOW_STEP_TYPE_ID
                            WHERE
                                       source_transition.WORKFLOW_DEFINITION_ID = @source_workflow_definition_id
                                       AND @draft_workflow_definition_id > 0;

                            INSERT INTO workflow_step_capability (
                                       WORKFLOW_STEP_MASTER_ID
                                     , M_WORKFLOW_CAPABILITY_ID
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , DESCRIPTION
                                     , INUSE
                            )
                            SELECT
                                       draft_step.WORKFLOW_STEP_MASTER_ID
                                     , source_capability.M_WORKFLOW_CAPABILITY_ID
                                     , 'dataItem.CREATE_BY'
                                     , 'dataItem.CREATE_BY'
                                     , source_capability.DESCRIPTION
                                     , source_capability.INUSE
                            FROM
                                       workflow_step_capability source_capability
                                            INNER JOIN
                                       workflow_step_master source_step
                                             ON source_step.WORKFLOW_STEP_MASTER_ID = source_capability.WORKFLOW_STEP_MASTER_ID
                                            INNER JOIN
                                       workflow_step_master draft_step
                                             ON draft_step.WORKFLOW_DEFINITION_ID = @draft_workflow_definition_id
                                             AND draft_step.WORKFLOW_STEP_TYPE_ID = source_step.WORKFLOW_STEP_TYPE_ID
                            WHERE
                                       source_step.WORKFLOW_DEFINITION_ID = @source_workflow_definition_id
                                       AND @draft_workflow_definition_id > 0;

                            COMMIT;
    `
    sql = sql.replaceAll('dataItem.SOURCE_WORKFLOW_DEFINITION_ID', toPositiveInteger(dataItem['SOURCE_WORKFLOW_DEFINITION_ID']).toString())
    sql = sql.replaceAll('dataItem.CREATE_BY', escapeSqlText(dataItem['CREATE_BY'] || 'SYSTEM'))
    sql = sql.replaceAll('dataItem.DESCRIPTION', escapeSqlText(dataItem['DESCRIPTION'] || 'Draft approval flow'))
    return sql
  },

  prepareAutomaticDraft: async (dataItem: any) => {
    let sql = `
                            SET @source_workflow_definition_id = 0;
                            SET @draft_workflow_definition_id = 0;

                            SELECT
                                       source_definition.WORKFLOW_DEFINITION_ID
                            INTO
                                       @source_workflow_definition_id
                            FROM
                                       workflow_definition source_definition
                                            INNER JOIN
                                       workflow_behavior_config behavior_config
                                             ON behavior_config.WORKFLOW_CODE = source_definition.WORKFLOW_CODE
                                             AND behavior_config.INUSE = 1
                            WHERE
                                       source_definition.WORKFLOW_DEFINITION_ID = dataItem.SOURCE_WORKFLOW_DEFINITION_ID
                                       AND source_definition.DEFINITION_STATUS = 'PUBLISHED'
                                       AND source_definition.INUSE = 1
                            FOR UPDATE;

                            UPDATE workflow_definition active_draft
                            INNER JOIN workflow_definition source_definition
                              ON source_definition.WORKFLOW_DEFINITION_ID = @source_workflow_definition_id
                             AND source_definition.WORKFLOW_CODE = active_draft.WORKFLOW_CODE
                            SET
                                       active_draft.DEFINITION_STATUS = 'RETIRED'
                                     , active_draft.RETIRED_DATE = CURRENT_TIMESTAMP()
                                     , active_draft.UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , active_draft.UPDATE_DATE = CURRENT_TIMESTAMP()
                                     , active_draft.INUSE = 0
                            WHERE
                                       active_draft.DEFINITION_STATUS = 'DRAFT'
                                       AND active_draft.INUSE = 1;

                            INSERT INTO workflow_definition (
                                       WORKFLOW_CODE
                                     , WORKFLOW_NAME
                                     , VERSION_NO
                                     , SOURCE_WORKFLOW_DEFINITION_ID
                                     , DEFINITION_STATUS
                                     , PUBLISHED_DATE
                                     , PUBLISHED_BY
                                     , RETIRED_DATE
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , DESCRIPTION
                                     , INUSE
                            )
                            SELECT
                                       source_definition.WORKFLOW_CODE
                                     , source_definition.WORKFLOW_NAME
                                     , (
                                           SELECT COALESCE(MAX(existing_definition.VERSION_NO), 0) + 1
                                           FROM workflow_definition existing_definition
                                           WHERE existing_definition.WORKFLOW_CODE = source_definition.WORKFLOW_CODE
                                       )
                                     , source_definition.WORKFLOW_DEFINITION_ID
                                     , 'DRAFT'
                                     , NULL
                                     , NULL
                                     , NULL
                                     , 'dataItem.UPDATE_BY'
                                     , 'dataItem.UPDATE_BY'
                                     , LEFT('dataItem.DESCRIPTION', 100)
                                     , 1
                            FROM
                                       workflow_definition source_definition
                            WHERE
                                       source_definition.WORKFLOW_DEFINITION_ID = @source_workflow_definition_id
                                       AND @source_workflow_definition_id > 0;

                            SET @draft_workflow_definition_id = IF(ROW_COUNT() = 1, LAST_INSERT_ID(), 0);

                            INSERT INTO workflow_step_master (
                                       WORKFLOW_DEFINITION_ID
                                     , WORKFLOW_STEP_TYPE_ID
                                     , M_REQUEST_STATUS_ID
                                     , STEP_CODE
                                     , ACTOR_TYPE
                                     , HANDLER_KEY
                                     , DEFAULT_GROUP_CODE_LOCAL
                                     , DEFAULT_GROUP_CODE_OVERSEA
                                     , DEFAULT_APPROVAL_GROUP_ID_LOCAL
                                     , DEFAULT_APPROVAL_GROUP_ID_OVERSEA
                                     , REQUIRES_VENDOR_REPLY
                                     , REQUIRES_VENDOR_CODE
                                     , DEFAULT_STEP_ORDER
                                     , IS_OPTIONAL
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , DESCRIPTION
                                     , INUSE
                            )
                            SELECT
                                       @draft_workflow_definition_id
                                     , source_step.WORKFLOW_STEP_TYPE_ID
                                     , source_step.M_REQUEST_STATUS_ID
                                     , source_step.STEP_CODE
                                     , source_step.ACTOR_TYPE
                                     , source_step.HANDLER_KEY
                                     , source_step.DEFAULT_GROUP_CODE_LOCAL
                                     , source_step.DEFAULT_GROUP_CODE_OVERSEA
                                     , source_step.DEFAULT_APPROVAL_GROUP_ID_LOCAL
                                     , source_step.DEFAULT_APPROVAL_GROUP_ID_OVERSEA
                                     , source_step.REQUIRES_VENDOR_REPLY
                                     , source_step.REQUIRES_VENDOR_CODE
                                     , source_step.DEFAULT_STEP_ORDER
                                     , source_step.IS_OPTIONAL
                                     , 'dataItem.UPDATE_BY'
                                     , 'dataItem.UPDATE_BY'
                                     , source_step.DESCRIPTION
                                     , source_step.INUSE
                            FROM
                                       workflow_step_master source_step
                            WHERE
                                       source_step.WORKFLOW_DEFINITION_ID = @source_workflow_definition_id
                                       AND @draft_workflow_definition_id > 0;

                            INSERT INTO workflow_transition (
                                       WORKFLOW_DEFINITION_ID
                                     , FROM_WORKFLOW_STEP_MASTER_ID
                                     , M_WORKFLOW_ACTION_ID
                                     , ACTION_CODE
                                     , TO_WORKFLOW_STEP_MASTER_ID
                                     , M_REQUEST_STATE_ID
                                     , CONDITION_KEY
                                     , PRIORITY_NO
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , DESCRIPTION
                                     , INUSE
                            )
                            SELECT
                                       @draft_workflow_definition_id
                                     , draft_from.WORKFLOW_STEP_MASTER_ID
                                     , source_transition.M_WORKFLOW_ACTION_ID
                                     , source_transition.ACTION_CODE
                                     , draft_to.WORKFLOW_STEP_MASTER_ID
                                     , source_transition.M_REQUEST_STATE_ID
                                     , source_transition.CONDITION_KEY
                                     , source_transition.PRIORITY_NO
                                     , 'dataItem.UPDATE_BY'
                                     , 'dataItem.UPDATE_BY'
                                     , source_transition.DESCRIPTION
                                     , source_transition.INUSE
                            FROM
                                       workflow_transition source_transition
                                            INNER JOIN
                                       workflow_step_master source_from
                                             ON source_from.WORKFLOW_STEP_MASTER_ID = source_transition.FROM_WORKFLOW_STEP_MASTER_ID
                                            INNER JOIN
                                       workflow_step_master draft_from
                                             ON draft_from.WORKFLOW_DEFINITION_ID = @draft_workflow_definition_id
                                             AND draft_from.WORKFLOW_STEP_TYPE_ID = source_from.WORKFLOW_STEP_TYPE_ID
                                            LEFT JOIN
                                       workflow_step_master source_to
                                             ON source_to.WORKFLOW_STEP_MASTER_ID = source_transition.TO_WORKFLOW_STEP_MASTER_ID
                                            LEFT JOIN
                                       workflow_step_master draft_to
                                             ON draft_to.WORKFLOW_DEFINITION_ID = @draft_workflow_definition_id
                                             AND draft_to.WORKFLOW_STEP_TYPE_ID = source_to.WORKFLOW_STEP_TYPE_ID
                            WHERE
                                       source_transition.WORKFLOW_DEFINITION_ID = @source_workflow_definition_id
                                       AND @draft_workflow_definition_id > 0;

                            INSERT INTO workflow_step_capability (
                                       WORKFLOW_STEP_MASTER_ID
                                     , M_WORKFLOW_CAPABILITY_ID
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , DESCRIPTION
                                     , INUSE
                            )
                            SELECT
                                       draft_step.WORKFLOW_STEP_MASTER_ID
                                     , source_capability.M_WORKFLOW_CAPABILITY_ID
                                     , 'dataItem.UPDATE_BY'
                                     , 'dataItem.UPDATE_BY'
                                     , source_capability.DESCRIPTION
                                     , source_capability.INUSE
                            FROM
                                       workflow_step_capability source_capability
                                            INNER JOIN
                                       workflow_step_master source_step
                                             ON source_step.WORKFLOW_STEP_MASTER_ID = source_capability.WORKFLOW_STEP_MASTER_ID
                                            INNER JOIN
                                       workflow_step_master draft_step
                                             ON draft_step.WORKFLOW_DEFINITION_ID = @draft_workflow_definition_id
                                             AND draft_step.WORKFLOW_STEP_TYPE_ID = source_step.WORKFLOW_STEP_TYPE_ID
                            WHERE
                                       source_step.WORKFLOW_DEFINITION_ID = @source_workflow_definition_id
                                       AND @draft_workflow_definition_id > 0;
    `
    sql = sql.replaceAll('dataItem.SOURCE_WORKFLOW_DEFINITION_ID', toPositiveInteger(dataItem['SOURCE_WORKFLOW_DEFINITION_ID']).toString())
    sql = sql.replaceAll('dataItem.UPDATE_BY', escapeSqlText(dataItem['UPDATE_BY'] || 'SYSTEM'))
    sql = sql.replaceAll('dataItem.DESCRIPTION', escapeSqlText(dataItem['DESCRIPTION'] || 'Approval flow settings updated'))
    return sql
  },

  updateAutomaticDraftStep: async (dataItem: any) => {
    let sql = `
                            UPDATE workflow_step_master workflow_step
                            INNER JOIN workflow_definition workflow_definition
                              ON workflow_definition.WORKFLOW_DEFINITION_ID = workflow_step.WORKFLOW_DEFINITION_ID
                            INNER JOIN m_workflow_step_type step_type
                              ON step_type.WORKFLOW_STEP_TYPE_ID = workflow_step.WORKFLOW_STEP_TYPE_ID
                            INNER JOIN approval_group approval_group
                              ON approval_group.APPROVAL_GROUP_ID = dataItem.DEFAULT_APPROVAL_GROUP_ID
                             AND approval_group.INUSE = 1
                            SET
                                       workflow_step.DEFAULT_STEP_ORDER = dataItem.DEFAULT_STEP_ORDER
                                     , workflow_step.DEFAULT_APPROVAL_GROUP_ID_LOCAL = approval_group.APPROVAL_GROUP_ID
                                     , workflow_step.DEFAULT_APPROVAL_GROUP_ID_OVERSEA = approval_group.APPROVAL_GROUP_ID
                                     , workflow_step.DEFAULT_GROUP_CODE_LOCAL = approval_group.GROUP_CODE
                                     , workflow_step.DEFAULT_GROUP_CODE_OVERSEA = approval_group.GROUP_CODE
                                     , workflow_step.IS_OPTIONAL = CASE WHEN step_type.IS_REQUIRED = 1 THEN 0 ELSE 1 END
                                     , workflow_step.INUSE = CASE WHEN step_type.IS_REQUIRED = 1 THEN 1 ELSE dataItem.INUSE END
                                     , workflow_step.UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , workflow_step.UPDATE_DATE = CURRENT_TIMESTAMP()
                            WHERE
                                       workflow_step.WORKFLOW_DEFINITION_ID = @draft_workflow_definition_id
                                       AND workflow_step.WORKFLOW_STEP_TYPE_ID = dataItem.WORKFLOW_STEP_TYPE_ID
                                       AND workflow_definition.DEFINITION_STATUS = 'DRAFT'
                                       AND workflow_definition.INUSE = 1
                                       AND step_type.IS_CONFIGURABLE = 1
    `
    sql = sql.replaceAll('dataItem.DEFAULT_STEP_ORDER', toPositiveInteger(dataItem['DEFAULT_STEP_ORDER']).toString())
    sql = sql.replaceAll('dataItem.DEFAULT_APPROVAL_GROUP_ID', toPositiveInteger(dataItem['DEFAULT_APPROVAL_GROUP_ID']).toString())
    sql = sql.replaceAll('dataItem.WORKFLOW_STEP_TYPE_ID', toPositiveInteger(dataItem['WORKFLOW_STEP_TYPE_ID']).toString())
    sql = sql.replaceAll('dataItem.INUSE', Number(dataItem['INUSE']) === 1 ? '1' : '0')
    sql = sql.replaceAll('dataItem.UPDATE_BY', escapeSqlText(dataItem['UPDATE_BY'] || 'SYSTEM'))
    return sql
  },

  updateAutomaticStepTransitionState: async (dataItem: any) => {
    let sql = `
                            UPDATE workflow_transition transition_row
                            INNER JOIN workflow_step_master from_step
                              ON from_step.WORKFLOW_STEP_MASTER_ID = transition_row.FROM_WORKFLOW_STEP_MASTER_ID
                            INNER JOIN m_workflow_step_type step_type
                              ON step_type.WORKFLOW_STEP_TYPE_ID = from_step.WORKFLOW_STEP_TYPE_ID
                            SET
                                       transition_row.INUSE = dataItem.INUSE
                                     , transition_row.UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , transition_row.UPDATE_DATE = CURRENT_TIMESTAMP()
                            WHERE
                                       transition_row.WORKFLOW_DEFINITION_ID = @draft_workflow_definition_id
                                       AND from_step.WORKFLOW_STEP_TYPE_ID = dataItem.WORKFLOW_STEP_TYPE_ID
                                       AND step_type.IS_CONFIGURABLE = 1
    `
    sql = sql.replaceAll('dataItem.WORKFLOW_STEP_TYPE_ID', toPositiveInteger(dataItem['WORKFLOW_STEP_TYPE_ID']).toString())
    sql = sql.replaceAll('dataItem.INUSE', Number(dataItem['INUSE']) === 1 ? '1' : '0')
    sql = sql.replaceAll('dataItem.UPDATE_BY', escapeSqlText(dataItem['UPDATE_BY'] || 'SYSTEM'))
    return sql
  },

  upsertAutomaticStepCapability: async (dataItem: any) => {
    let sql = `
                            INSERT INTO workflow_step_capability (
                                       WORKFLOW_STEP_MASTER_ID
                                     , M_WORKFLOW_CAPABILITY_ID
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , DESCRIPTION
                                     , INUSE
                            )
                            SELECT
                                       workflow_step.WORKFLOW_STEP_MASTER_ID
                                     , capability.M_WORKFLOW_CAPABILITY_ID
                                     , 'dataItem.UPDATE_BY'
                                     , 'dataItem.UPDATE_BY'
                                     , LEFT(capability.CAPABILITY_NAME, 100)
                                     , dataItem.INUSE
                            FROM
                                       workflow_step_master workflow_step
                                            INNER JOIN
                                       workflow_definition workflow_definition
                                             ON workflow_definition.WORKFLOW_DEFINITION_ID = workflow_step.WORKFLOW_DEFINITION_ID
                                            INNER JOIN
                                       m_workflow_capability capability
                                             ON capability.M_WORKFLOW_CAPABILITY_ID = dataItem.M_WORKFLOW_CAPABILITY_ID
                                             AND capability.INUSE = 1
                            WHERE
                                       workflow_step.WORKFLOW_DEFINITION_ID = @draft_workflow_definition_id
                                       AND workflow_step.WORKFLOW_STEP_TYPE_ID = dataItem.WORKFLOW_STEP_TYPE_ID
                                       AND workflow_definition.DEFINITION_STATUS = 'DRAFT'
                                       AND workflow_definition.INUSE = 1
                            ON DUPLICATE KEY UPDATE
                                       INUSE = dataItem.INUSE
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = CURRENT_TIMESTAMP()
    `
    sql = sql.replaceAll('dataItem.WORKFLOW_STEP_TYPE_ID', toPositiveInteger(dataItem['WORKFLOW_STEP_TYPE_ID']).toString())
    sql = sql.replaceAll('dataItem.M_WORKFLOW_CAPABILITY_ID', toPositiveInteger(dataItem['M_WORKFLOW_CAPABILITY_ID']).toString())
    sql = sql.replaceAll('dataItem.INUSE', Number(dataItem['INUSE']) === 1 ? '1' : '0')
    sql = sql.replaceAll('dataItem.UPDATE_BY', escapeSqlText(dataItem['UPDATE_BY'] || 'SYSTEM'))
    return sql
  },

  disableAutomaticConfigurableForwardTransitions: async (dataItem: any) => {
    let sql = `
                            UPDATE workflow_transition transition_row
                            INNER JOIN workflow_step_master from_step
                              ON from_step.WORKFLOW_STEP_MASTER_ID = transition_row.FROM_WORKFLOW_STEP_MASTER_ID
                            INNER JOIN m_workflow_step_type step_type
                              ON step_type.WORKFLOW_STEP_TYPE_ID = from_step.WORKFLOW_STEP_TYPE_ID
                            INNER JOIN workflow_definition workflow_definition
                              ON workflow_definition.WORKFLOW_DEFINITION_ID = transition_row.WORKFLOW_DEFINITION_ID
                            INNER JOIN workflow_behavior_config behavior_config
                              ON behavior_config.WORKFLOW_CODE = workflow_definition.WORKFLOW_CODE
                             AND behavior_config.INUSE = 1
                            SET
                                       transition_row.INUSE = 0
                                     , transition_row.UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , transition_row.UPDATE_DATE = CURRENT_TIMESTAMP()
                            WHERE
                                       transition_row.WORKFLOW_DEFINITION_ID = @draft_workflow_definition_id
                                       AND step_type.IS_CONFIGURABLE = 1
                                       AND transition_row.M_WORKFLOW_ACTION_ID = behavior_config.M_FORWARD_ACTION_ID
    `
    sql = sql.replaceAll('dataItem.UPDATE_BY', escapeSqlText(dataItem['UPDATE_BY'] || 'SYSTEM'))
    return sql
  },

  updateAutomaticIncomingConfigurableTransitions: async (dataItem: any) => {
    let sql = `
                            UPDATE workflow_transition transition_row
                            INNER JOIN workflow_step_master from_step
                              ON from_step.WORKFLOW_STEP_MASTER_ID = transition_row.FROM_WORKFLOW_STEP_MASTER_ID
                            INNER JOIN m_workflow_step_type from_type
                              ON from_type.WORKFLOW_STEP_TYPE_ID = from_step.WORKFLOW_STEP_TYPE_ID
                            INNER JOIN workflow_step_master current_target
                              ON current_target.WORKFLOW_STEP_MASTER_ID = transition_row.TO_WORKFLOW_STEP_MASTER_ID
                            INNER JOIN m_workflow_step_type current_target_type
                              ON current_target_type.WORKFLOW_STEP_TYPE_ID = current_target.WORKFLOW_STEP_TYPE_ID
                            INNER JOIN workflow_definition workflow_definition
                              ON workflow_definition.WORKFLOW_DEFINITION_ID = transition_row.WORKFLOW_DEFINITION_ID
                            INNER JOIN workflow_behavior_config behavior_config
                              ON behavior_config.WORKFLOW_CODE = workflow_definition.WORKFLOW_CODE
                             AND behavior_config.INUSE = 1
                            INNER JOIN workflow_step_master first_active_step
                              ON first_active_step.WORKFLOW_DEFINITION_ID = @draft_workflow_definition_id
                             AND first_active_step.WORKFLOW_STEP_TYPE_ID = dataItem.FIRST_WORKFLOW_STEP_TYPE_ID
                            SET
                                       transition_row.TO_WORKFLOW_STEP_MASTER_ID = first_active_step.WORKFLOW_STEP_MASTER_ID
                                     , transition_row.UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , transition_row.UPDATE_DATE = CURRENT_TIMESTAMP()
                            WHERE
                                       transition_row.WORKFLOW_DEFINITION_ID = @draft_workflow_definition_id
                                       AND from_type.IS_CONFIGURABLE = 0
                                       AND current_target_type.IS_CONFIGURABLE = 1
                                       AND transition_row.M_WORKFLOW_ACTION_ID = behavior_config.M_FORWARD_ACTION_ID
                                       AND transition_row.INUSE = 1
    `
    sql = sql.replaceAll('dataItem.FIRST_WORKFLOW_STEP_TYPE_ID', toPositiveInteger(dataItem['FIRST_WORKFLOW_STEP_TYPE_ID']).toString())
    sql = sql.replaceAll('dataItem.UPDATE_BY', escapeSqlText(dataItem['UPDATE_BY'] || 'SYSTEM'))
    return sql
  },

  upsertAutomaticForwardTransition: async (dataItem: any) => {
    let sql = `
                            INSERT INTO workflow_transition (
                                       WORKFLOW_DEFINITION_ID
                                     , FROM_WORKFLOW_STEP_MASTER_ID
                                     , M_WORKFLOW_ACTION_ID
                                     , ACTION_CODE
                                     , TO_WORKFLOW_STEP_MASTER_ID
                                     , M_REQUEST_STATE_ID
                                     , CONDITION_KEY
                                     , PRIORITY_NO
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , DESCRIPTION
                                     , INUSE
                            )
                            SELECT
                                       @draft_workflow_definition_id
                                     , from_step.WORKFLOW_STEP_MASTER_ID
                                     , action_master.M_WORKFLOW_ACTION_ID
                                     , action_master.ACTION_CODE
                                     , to_step.WORKFLOW_STEP_MASTER_ID
                                     , NULL
                                     , NULL
                                     , 1
                                     , 'dataItem.UPDATE_BY'
                                     , 'dataItem.UPDATE_BY'
                                     , 'Configured approval flow'
                                     , 1
                            FROM
                                       workflow_definition workflow_definition
                                            INNER JOIN
                                       workflow_behavior_config behavior_config
                                             ON behavior_config.WORKFLOW_CODE = workflow_definition.WORKFLOW_CODE
                                             AND behavior_config.INUSE = 1
                                            INNER JOIN
                                       m_workflow_action action_master
                                             ON action_master.M_WORKFLOW_ACTION_ID = behavior_config.M_FORWARD_ACTION_ID
                                             AND action_master.INUSE = 1
                                            INNER JOIN
                                       workflow_step_master from_step
                                             ON from_step.WORKFLOW_DEFINITION_ID = @draft_workflow_definition_id
                                             AND from_step.WORKFLOW_STEP_TYPE_ID = dataItem.FROM_WORKFLOW_STEP_TYPE_ID
                                            INNER JOIN
                                       workflow_step_master to_step
                                             ON to_step.WORKFLOW_DEFINITION_ID = @draft_workflow_definition_id
                                             AND to_step.WORKFLOW_STEP_TYPE_ID = dataItem.TO_WORKFLOW_STEP_TYPE_ID
                            WHERE
                                       workflow_definition.WORKFLOW_DEFINITION_ID = @draft_workflow_definition_id
                                       AND workflow_definition.DEFINITION_STATUS = 'DRAFT'
                                       AND workflow_definition.INUSE = 1
                            ON DUPLICATE KEY UPDATE
                                       M_WORKFLOW_ACTION_ID = VALUES(M_WORKFLOW_ACTION_ID)
                                     , TO_WORKFLOW_STEP_MASTER_ID = VALUES(TO_WORKFLOW_STEP_MASTER_ID)
                                     , M_REQUEST_STATE_ID = NULL
                                     , CONDITION_KEY = NULL
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = CURRENT_TIMESTAMP()
                                     , INUSE = 1
    `
    sql = sql.replaceAll('dataItem.FROM_WORKFLOW_STEP_TYPE_ID', toPositiveInteger(dataItem['FROM_WORKFLOW_STEP_TYPE_ID']).toString())
    sql = sql.replaceAll('dataItem.TO_WORKFLOW_STEP_TYPE_ID', toPositiveInteger(dataItem['TO_WORKFLOW_STEP_TYPE_ID']).toString())
    sql = sql.replaceAll('dataItem.UPDATE_BY', escapeSqlText(dataItem['UPDATE_BY'] || 'SYSTEM'))
    return sql
  },

  publishAutomaticDraft: async (dataItem: any) => {
    let sql = `
                            UPDATE workflow_definition published_definition
                            INNER JOIN workflow_definition draft_definition
                              ON draft_definition.WORKFLOW_DEFINITION_ID = @draft_workflow_definition_id
                             AND draft_definition.WORKFLOW_CODE = published_definition.WORKFLOW_CODE
                            INNER JOIN workflow_behavior_config behavior_config
                              ON behavior_config.WORKFLOW_CODE = draft_definition.WORKFLOW_CODE
                             AND behavior_config.INUSE = 1
                            SET
                                       published_definition.DEFINITION_STATUS = 'RETIRED'
                                     , published_definition.RETIRED_DATE = CURRENT_TIMESTAMP()
                                     , published_definition.UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , published_definition.UPDATE_DATE = CURRENT_TIMESTAMP()
                                     , published_definition.INUSE = 0
                            WHERE
                                       published_definition.DEFINITION_STATUS = 'PUBLISHED'
                                       AND published_definition.INUSE = 1
                                       AND draft_definition.DEFINITION_STATUS = 'DRAFT'
                                       AND draft_definition.INUSE = 1;

                            UPDATE workflow_definition workflow_definition
                            SET
                                       workflow_definition.DEFINITION_STATUS = 'PUBLISHED'
                                     , workflow_definition.PUBLISHED_DATE = CURRENT_TIMESTAMP()
                                     , workflow_definition.PUBLISHED_BY = 'dataItem.UPDATE_BY'
                                     , workflow_definition.RETIRED_DATE = NULL
                                     , workflow_definition.UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , workflow_definition.UPDATE_DATE = CURRENT_TIMESTAMP()
                                     , workflow_definition.INUSE = 1
                            WHERE
                                       workflow_definition.WORKFLOW_DEFINITION_ID = @draft_workflow_definition_id
                                       AND workflow_definition.DEFINITION_STATUS = 'DRAFT'
                                       AND workflow_definition.INUSE = 1;
    `
    sql = sql.replaceAll('dataItem.UPDATE_BY', escapeSqlText(dataItem['UPDATE_BY'] || 'SYSTEM'))
    return sql
  },

  getAutomaticDraftId: async () => `
                            SELECT
                                       @draft_workflow_definition_id AS WORKFLOW_DEFINITION_ID
  `,

  updateDraftDescription: async (dataItem: any) => {
    let sql = `
                            UPDATE workflow_definition workflow_definition
                            INNER JOIN workflow_behavior_config behavior_config
                              ON behavior_config.WORKFLOW_CODE = workflow_definition.WORKFLOW_CODE
                             AND behavior_config.INUSE = 1
                            SET
                                       workflow_definition.DESCRIPTION = LEFT('dataItem.DESCRIPTION', 100)
                                     , workflow_definition.UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , workflow_definition.UPDATE_DATE = CURRENT_TIMESTAMP()
                            WHERE
                                       workflow_definition.WORKFLOW_DEFINITION_ID = dataItem.WORKFLOW_DEFINITION_ID
                                       AND workflow_definition.DEFINITION_STATUS = 'DRAFT'
                                       AND workflow_definition.INUSE = 1
    `
    sql = sql.replaceAll('dataItem.DESCRIPTION', escapeSqlText(dataItem['DESCRIPTION']))
    sql = sql.replaceAll('dataItem.UPDATE_BY', escapeSqlText(dataItem['UPDATE_BY'] || 'SYSTEM'))
    sql = sql.replaceAll('dataItem.WORKFLOW_DEFINITION_ID', toPositiveInteger(dataItem['WORKFLOW_DEFINITION_ID']).toString())
    return sql
  },

  updateDraftStep: async (dataItem: any) => {
    let sql = `
                            UPDATE workflow_step_master workflow_step
                            INNER JOIN workflow_definition workflow_definition
                              ON workflow_definition.WORKFLOW_DEFINITION_ID = workflow_step.WORKFLOW_DEFINITION_ID
                            INNER JOIN m_workflow_step_type step_type
                              ON step_type.WORKFLOW_STEP_TYPE_ID = workflow_step.WORKFLOW_STEP_TYPE_ID
                            SET
                                       workflow_step.DEFAULT_STEP_ORDER = dataItem.DEFAULT_STEP_ORDER
                                     , workflow_step.DEFAULT_APPROVAL_GROUP_ID_LOCAL = dataItem.DEFAULT_APPROVAL_GROUP_ID
                                     , workflow_step.DEFAULT_APPROVAL_GROUP_ID_OVERSEA = dataItem.DEFAULT_APPROVAL_GROUP_ID
                                     , workflow_step.DEFAULT_GROUP_CODE_LOCAL = (
                                           SELECT approval_group.GROUP_CODE
                                           FROM approval_group
                                           WHERE approval_group.APPROVAL_GROUP_ID = dataItem.DEFAULT_APPROVAL_GROUP_ID
                                             AND approval_group.INUSE = 1
                                           LIMIT 1
                                       )
                                     , workflow_step.DEFAULT_GROUP_CODE_OVERSEA = (
                                           SELECT approval_group.GROUP_CODE
                                           FROM approval_group
                                           WHERE approval_group.APPROVAL_GROUP_ID = dataItem.DEFAULT_APPROVAL_GROUP_ID
                                             AND approval_group.INUSE = 1
                                           LIMIT 1
                                       )
                                     , workflow_step.IS_OPTIONAL = CASE WHEN step_type.IS_REQUIRED = 1 THEN 0 ELSE 1 END
                                     , workflow_step.INUSE = CASE WHEN step_type.IS_REQUIRED = 1 THEN 1 ELSE dataItem.INUSE END
                                     , workflow_step.UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , workflow_step.UPDATE_DATE = CURRENT_TIMESTAMP()
                            WHERE
                                       workflow_step.WORKFLOW_STEP_MASTER_ID = dataItem.WORKFLOW_STEP_MASTER_ID
                                       AND workflow_step.WORKFLOW_DEFINITION_ID = dataItem.WORKFLOW_DEFINITION_ID
                                       AND workflow_definition.DEFINITION_STATUS = 'DRAFT'
                                       AND workflow_definition.INUSE = 1
                                       AND step_type.IS_CONFIGURABLE = 1
    `
    sql = sql.replaceAll('dataItem.DEFAULT_STEP_ORDER', toPositiveInteger(dataItem['DEFAULT_STEP_ORDER']).toString())
    sql = sql.replaceAll('dataItem.DEFAULT_APPROVAL_GROUP_ID', toPositiveInteger(dataItem['DEFAULT_APPROVAL_GROUP_ID']).toString())
    sql = sql.replaceAll('dataItem.INUSE', Number(dataItem['INUSE']) === 1 ? '1' : '0')
    sql = sql.replaceAll('dataItem.UPDATE_BY', escapeSqlText(dataItem['UPDATE_BY'] || 'SYSTEM'))
    sql = sql.replaceAll('dataItem.WORKFLOW_STEP_MASTER_ID', toPositiveInteger(dataItem['WORKFLOW_STEP_MASTER_ID']).toString())
    sql = sql.replaceAll('dataItem.WORKFLOW_DEFINITION_ID', toPositiveInteger(dataItem['WORKFLOW_DEFINITION_ID']).toString())
    return sql
  },

  upsertStepCapability: async (dataItem: any) => {
    let sql = `
                            INSERT INTO workflow_step_capability (
                                       WORKFLOW_STEP_MASTER_ID
                                     , M_WORKFLOW_CAPABILITY_ID
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , DESCRIPTION
                                     , INUSE
                            )
                            SELECT
                                       workflow_step.WORKFLOW_STEP_MASTER_ID
                                     , capability.M_WORKFLOW_CAPABILITY_ID
                                     , 'dataItem.UPDATE_BY'
                                     , 'dataItem.UPDATE_BY'
                                     , LEFT(capability.CAPABILITY_NAME, 100)
                                     , dataItem.INUSE
                            FROM
                                       workflow_step_master workflow_step
                                            INNER JOIN
                                       workflow_definition workflow_definition
                                             ON workflow_definition.WORKFLOW_DEFINITION_ID = workflow_step.WORKFLOW_DEFINITION_ID
                                            INNER JOIN
                                       m_workflow_capability capability
                                             ON capability.M_WORKFLOW_CAPABILITY_ID = dataItem.M_WORKFLOW_CAPABILITY_ID
                                             AND capability.INUSE = 1
                            WHERE
                                       workflow_step.WORKFLOW_STEP_MASTER_ID = dataItem.WORKFLOW_STEP_MASTER_ID
                                       AND workflow_step.WORKFLOW_DEFINITION_ID = dataItem.WORKFLOW_DEFINITION_ID
                                       AND workflow_definition.DEFINITION_STATUS = 'DRAFT'
                                       AND workflow_definition.INUSE = 1
                            ON DUPLICATE KEY UPDATE
                                       INUSE = dataItem.INUSE
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = CURRENT_TIMESTAMP()
    `
    sql = sql.replaceAll('dataItem.UPDATE_BY', escapeSqlText(dataItem['UPDATE_BY'] || 'SYSTEM'))
    sql = sql.replaceAll('dataItem.INUSE', Number(dataItem['INUSE']) === 1 ? '1' : '0')
    sql = sql.replaceAll('dataItem.M_WORKFLOW_CAPABILITY_ID', toPositiveInteger(dataItem['M_WORKFLOW_CAPABILITY_ID']).toString())
    sql = sql.replaceAll('dataItem.WORKFLOW_STEP_MASTER_ID', toPositiveInteger(dataItem['WORKFLOW_STEP_MASTER_ID']).toString())
    sql = sql.replaceAll('dataItem.WORKFLOW_DEFINITION_ID', toPositiveInteger(dataItem['WORKFLOW_DEFINITION_ID']).toString())
    return sql
  },

  updateStepTransitionState: async (dataItem: any) => {
    let sql = `
                            UPDATE workflow_transition transition_row
                            INNER JOIN workflow_step_master from_step
                              ON from_step.WORKFLOW_STEP_MASTER_ID = transition_row.FROM_WORKFLOW_STEP_MASTER_ID
                            INNER JOIN m_workflow_step_type step_type
                              ON step_type.WORKFLOW_STEP_TYPE_ID = from_step.WORKFLOW_STEP_TYPE_ID
                            INNER JOIN workflow_definition workflow_definition
                              ON workflow_definition.WORKFLOW_DEFINITION_ID = transition_row.WORKFLOW_DEFINITION_ID
                            SET
                                       transition_row.INUSE = dataItem.INUSE
                                     , transition_row.UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , transition_row.UPDATE_DATE = CURRENT_TIMESTAMP()
                            WHERE
                                       transition_row.WORKFLOW_DEFINITION_ID = dataItem.WORKFLOW_DEFINITION_ID
                                       AND from_step.WORKFLOW_STEP_MASTER_ID = dataItem.WORKFLOW_STEP_MASTER_ID
                                       AND workflow_definition.DEFINITION_STATUS = 'DRAFT'
                                       AND workflow_definition.INUSE = 1
                                       AND step_type.IS_CONFIGURABLE = 1
    `
    sql = sql.replaceAll('dataItem.INUSE', Number(dataItem['INUSE']) === 1 ? '1' : '0')
    sql = sql.replaceAll('dataItem.UPDATE_BY', escapeSqlText(dataItem['UPDATE_BY'] || 'SYSTEM'))
    sql = sql.replaceAll('dataItem.WORKFLOW_DEFINITION_ID', toPositiveInteger(dataItem['WORKFLOW_DEFINITION_ID']).toString())
    sql = sql.replaceAll('dataItem.WORKFLOW_STEP_MASTER_ID', toPositiveInteger(dataItem['WORKFLOW_STEP_MASTER_ID']).toString())
    return sql
  },

  disableConfigurableForwardTransitions: async (dataItem: any) => {
    let sql = `
                            UPDATE workflow_transition transition_row
                            INNER JOIN workflow_step_master from_step
                              ON from_step.WORKFLOW_STEP_MASTER_ID = transition_row.FROM_WORKFLOW_STEP_MASTER_ID
                            INNER JOIN m_workflow_step_type step_type
                              ON step_type.WORKFLOW_STEP_TYPE_ID = from_step.WORKFLOW_STEP_TYPE_ID
                            INNER JOIN workflow_definition workflow_definition
                              ON workflow_definition.WORKFLOW_DEFINITION_ID = transition_row.WORKFLOW_DEFINITION_ID
                            INNER JOIN workflow_behavior_config behavior_config
                              ON behavior_config.WORKFLOW_CODE = workflow_definition.WORKFLOW_CODE
                             AND behavior_config.INUSE = 1
                            SET
                                       transition_row.INUSE = 0
                                     , transition_row.UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , transition_row.UPDATE_DATE = CURRENT_TIMESTAMP()
                            WHERE
                                       transition_row.WORKFLOW_DEFINITION_ID = dataItem.WORKFLOW_DEFINITION_ID
                                       AND step_type.IS_CONFIGURABLE = 1
                                       AND transition_row.M_WORKFLOW_ACTION_ID = behavior_config.M_FORWARD_ACTION_ID
    `
    sql = sql.replaceAll('dataItem.UPDATE_BY', escapeSqlText(dataItem['UPDATE_BY'] || 'SYSTEM'))
    sql = sql.replaceAll('dataItem.WORKFLOW_DEFINITION_ID', toPositiveInteger(dataItem['WORKFLOW_DEFINITION_ID']).toString())
    return sql
  },

  updateIncomingConfigurableTransitions: async (dataItem: any) => {
    let sql = `
                            UPDATE workflow_transition transition_row
                            INNER JOIN workflow_step_master from_step
                              ON from_step.WORKFLOW_STEP_MASTER_ID = transition_row.FROM_WORKFLOW_STEP_MASTER_ID
                            INNER JOIN m_workflow_step_type from_type
                              ON from_type.WORKFLOW_STEP_TYPE_ID = from_step.WORKFLOW_STEP_TYPE_ID
                            INNER JOIN workflow_step_master current_target
                              ON current_target.WORKFLOW_STEP_MASTER_ID = transition_row.TO_WORKFLOW_STEP_MASTER_ID
                            INNER JOIN m_workflow_step_type current_target_type
                              ON current_target_type.WORKFLOW_STEP_TYPE_ID = current_target.WORKFLOW_STEP_TYPE_ID
                            INNER JOIN workflow_definition workflow_definition
                              ON workflow_definition.WORKFLOW_DEFINITION_ID = transition_row.WORKFLOW_DEFINITION_ID
                            INNER JOIN workflow_behavior_config behavior_config
                              ON behavior_config.WORKFLOW_CODE = workflow_definition.WORKFLOW_CODE
                             AND behavior_config.INUSE = 1
                            SET
                                       transition_row.TO_WORKFLOW_STEP_MASTER_ID = dataItem.FIRST_WORKFLOW_STEP_MASTER_ID
                                     , transition_row.UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , transition_row.UPDATE_DATE = CURRENT_TIMESTAMP()
                            WHERE
                                       transition_row.WORKFLOW_DEFINITION_ID = dataItem.WORKFLOW_DEFINITION_ID
                                       AND from_type.IS_CONFIGURABLE = 0
                                       AND current_target_type.IS_CONFIGURABLE = 1
                                       AND transition_row.M_WORKFLOW_ACTION_ID = behavior_config.M_FORWARD_ACTION_ID
                                       AND transition_row.INUSE = 1
    `
    sql = sql.replaceAll('dataItem.FIRST_WORKFLOW_STEP_MASTER_ID', toPositiveInteger(dataItem['FIRST_WORKFLOW_STEP_MASTER_ID']).toString())
    sql = sql.replaceAll('dataItem.UPDATE_BY', escapeSqlText(dataItem['UPDATE_BY'] || 'SYSTEM'))
    sql = sql.replaceAll('dataItem.WORKFLOW_DEFINITION_ID', toPositiveInteger(dataItem['WORKFLOW_DEFINITION_ID']).toString())
    return sql
  },

  upsertForwardTransition: async (dataItem: any) => {
    let sql = `
                            INSERT INTO workflow_transition (
                                       WORKFLOW_DEFINITION_ID
                                     , FROM_WORKFLOW_STEP_MASTER_ID
                                     , M_WORKFLOW_ACTION_ID
                                     , ACTION_CODE
                                     , TO_WORKFLOW_STEP_MASTER_ID
                                     , M_REQUEST_STATE_ID
                                     , CONDITION_KEY
                                     , PRIORITY_NO
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , DESCRIPTION
                                     , INUSE
                            )
                            SELECT
                                       dataItem.WORKFLOW_DEFINITION_ID
                                     , dataItem.FROM_WORKFLOW_STEP_MASTER_ID
                                     , action_master.M_WORKFLOW_ACTION_ID
                                     , action_master.ACTION_CODE
                                     , dataItem.TO_WORKFLOW_STEP_MASTER_ID
                                     , NULL
                                     , NULL
                                     , 1
                                     , 'dataItem.UPDATE_BY'
                                     , 'dataItem.UPDATE_BY'
                                     , 'Configured approval flow'
                                     , 1
                            FROM
                                       workflow_definition workflow_definition
                                            INNER JOIN
                                       workflow_behavior_config behavior_config
                                             ON behavior_config.WORKFLOW_CODE = workflow_definition.WORKFLOW_CODE
                                             AND behavior_config.INUSE = 1
                                            INNER JOIN
                                       m_workflow_action action_master
                                             ON action_master.M_WORKFLOW_ACTION_ID = behavior_config.M_FORWARD_ACTION_ID
                                             AND action_master.INUSE = 1
                            WHERE
                                       workflow_definition.WORKFLOW_DEFINITION_ID = dataItem.WORKFLOW_DEFINITION_ID
                                       AND workflow_definition.DEFINITION_STATUS = 'DRAFT'
                                       AND workflow_definition.INUSE = 1
                            ON DUPLICATE KEY UPDATE
                                       M_WORKFLOW_ACTION_ID = VALUES(M_WORKFLOW_ACTION_ID)
                                     , TO_WORKFLOW_STEP_MASTER_ID = VALUES(TO_WORKFLOW_STEP_MASTER_ID)
                                     , M_REQUEST_STATE_ID = NULL
                                     , CONDITION_KEY = NULL
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = CURRENT_TIMESTAMP()
                                     , INUSE = 1
    `
    sql = sql.replaceAll('dataItem.WORKFLOW_DEFINITION_ID', toPositiveInteger(dataItem['WORKFLOW_DEFINITION_ID']).toString())
    sql = sql.replaceAll('dataItem.FROM_WORKFLOW_STEP_MASTER_ID', toPositiveInteger(dataItem['FROM_WORKFLOW_STEP_MASTER_ID']).toString())
    sql = sql.replaceAll('dataItem.TO_WORKFLOW_STEP_MASTER_ID', toPositiveInteger(dataItem['TO_WORKFLOW_STEP_MASTER_ID']).toString())
    sql = sql.replaceAll('dataItem.UPDATE_BY', escapeSqlText(dataItem['UPDATE_BY'] || 'SYSTEM'))
    return sql
  },

  publishDraft: async (dataItem: any) => {
    let sql = `
                            START TRANSACTION;

                            UPDATE workflow_definition published_definition
                            INNER JOIN workflow_definition draft_definition
                              ON draft_definition.WORKFLOW_DEFINITION_ID = dataItem.WORKFLOW_DEFINITION_ID
                              AND draft_definition.WORKFLOW_CODE = published_definition.WORKFLOW_CODE
                            INNER JOIN workflow_behavior_config behavior_config
                              ON behavior_config.WORKFLOW_CODE = draft_definition.WORKFLOW_CODE
                             AND behavior_config.INUSE = 1
                            SET
                                       published_definition.DEFINITION_STATUS = 'RETIRED'
                                     , published_definition.RETIRED_DATE = CURRENT_TIMESTAMP()
                                     , published_definition.UPDATE_BY = 'dataItem.PUBLISH_BY'
                                     , published_definition.UPDATE_DATE = CURRENT_TIMESTAMP()
                                     , published_definition.INUSE = 0
                            WHERE
                                       published_definition.DEFINITION_STATUS = 'PUBLISHED'
                                       AND published_definition.INUSE = 1
                                       AND draft_definition.DEFINITION_STATUS = 'DRAFT'
                                       AND draft_definition.INUSE = 1;

                            UPDATE workflow_definition workflow_definition
                            INNER JOIN workflow_behavior_config behavior_config
                              ON behavior_config.WORKFLOW_CODE = workflow_definition.WORKFLOW_CODE
                             AND behavior_config.INUSE = 1
                            SET
                                       workflow_definition.DEFINITION_STATUS = 'PUBLISHED'
                                     , workflow_definition.PUBLISHED_DATE = CURRENT_TIMESTAMP()
                                     , workflow_definition.PUBLISHED_BY = 'dataItem.PUBLISH_BY'
                                     , workflow_definition.RETIRED_DATE = NULL
                                     , workflow_definition.UPDATE_BY = 'dataItem.PUBLISH_BY'
                                     , workflow_definition.UPDATE_DATE = CURRENT_TIMESTAMP()
                                     , workflow_definition.INUSE = 1
                            WHERE
                                       workflow_definition.WORKFLOW_DEFINITION_ID = dataItem.WORKFLOW_DEFINITION_ID
                                       AND workflow_definition.DEFINITION_STATUS = 'DRAFT'
                                       AND workflow_definition.INUSE = 1;

                            COMMIT;
    `
    sql = sql.replaceAll('dataItem.PUBLISH_BY', escapeSqlText(dataItem['PUBLISH_BY'] || 'SYSTEM'))
    sql = sql.replaceAll('dataItem.WORKFLOW_DEFINITION_ID', toPositiveInteger(dataItem['WORKFLOW_DEFINITION_ID']).toString())
    return sql
  },

  discardDraft: async (dataItem: any) => {
    let sql = `
                            UPDATE workflow_definition workflow_definition
                            INNER JOIN workflow_behavior_config behavior_config
                              ON behavior_config.WORKFLOW_CODE = workflow_definition.WORKFLOW_CODE
                             AND behavior_config.INUSE = 1
                            SET
                                       workflow_definition.DEFINITION_STATUS = 'RETIRED'
                                     , workflow_definition.RETIRED_DATE = CURRENT_TIMESTAMP()
                                     , workflow_definition.UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , workflow_definition.UPDATE_DATE = CURRENT_TIMESTAMP()
                                     , workflow_definition.INUSE = 0
                            WHERE
                                       workflow_definition.WORKFLOW_DEFINITION_ID = dataItem.WORKFLOW_DEFINITION_ID
                                       AND workflow_definition.DEFINITION_STATUS = 'DRAFT'
                                       AND workflow_definition.INUSE = 1
    `
    sql = sql.replaceAll('dataItem.UPDATE_BY', escapeSqlText(dataItem['UPDATE_BY'] || 'SYSTEM'))
    sql = sql.replaceAll('dataItem.WORKFLOW_DEFINITION_ID', toPositiveInteger(dataItem['WORKFLOW_DEFINITION_ID']).toString())
    return sql
  },
}
