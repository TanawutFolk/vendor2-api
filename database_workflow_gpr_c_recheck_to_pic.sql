-- Add a non-terminal GPR C re-check state and the Issue GPR C -> PO PIC transition.
-- IDs are allocated/resolved from database masters; no workflow or status ID is hardcoded.
USE `_test_vendor_tanawut_2026_07_14`;

START TRANSACTION;

INSERT INTO m_gpr_c_flow_status (
    M_GPR_C_FLOW_STATUS_ID,
    STATUS_CODE,
    STATUS_LABEL_EN,
    STATUS_LABEL_TH,
    IS_TERMINAL,
    SORT_ORDER,
    CREATE_BY,
    CREATE_DATE,
    UPDATE_BY,
    UPDATE_DATE,
    INUSE,
    DESCRIPTION
)
SELECT
    next_status.NEXT_STATUS_ID,
    'RECHECK_REQUIRED',
    'Re-check Required',
    'รอตรวจสอบอีกครั้ง',
    0,
    4,
    'WORKFLOW_GPR_C_RECHECK_20260809',
    NOW(),
    'WORKFLOW_GPR_C_RECHECK_20260809',
    NOW(),
    1,
    'GPR C approver requested changes from PO PIC'
FROM (
    SELECT COALESCE(MAX(M_GPR_C_FLOW_STATUS_ID), 0) + 1 AS NEXT_STATUS_ID
    FROM m_gpr_c_flow_status
) next_status
WHERE NOT EXISTS (
    SELECT 1
    FROM m_gpr_c_flow_status existing_status
    WHERE existing_status.STATUS_CODE = 'RECHECK_REQUIRED'
);

UPDATE m_gpr_c_flow_status
SET STATUS_LABEL_EN = 'Re-check Required',
    STATUS_LABEL_TH = 'รอตรวจสอบอีกครั้ง',
    IS_TERMINAL = 0,
    SORT_ORDER = 4,
    DESCRIPTION = 'GPR C approver requested changes from PO PIC',
    UPDATE_BY = 'WORKFLOW_GPR_C_RECHECK_20260809',
    UPDATE_DATE = NOW(),
    INUSE = 1
WHERE STATUS_CODE = 'RECHECK_REQUIRED';

UPDATE m_gpr_c_flow_status
SET SORT_ORDER = CASE STATUS_CODE
        WHEN 'APPROVED' THEN 5
        WHEN 'REJECTED' THEN 6
        ELSE SORT_ORDER
    END,
    UPDATE_BY = 'WORKFLOW_GPR_C_RECHECK_20260809',
    UPDATE_DATE = NOW()
WHERE STATUS_CODE IN ('APPROVED', 'REJECTED');

INSERT INTO workflow_transition (
    WORKFLOW_DEFINITION_ID,
    FROM_WORKFLOW_STEP_MASTER_ID,
    ACTION_CODE,
    TO_WORKFLOW_STEP_MASTER_ID,
    M_REQUEST_STATE_ID,
    CONDITION_KEY,
    PRIORITY_NO,
    CREATE_BY,
    CREATE_DATE,
    DESCRIPTION,
    UPDATE_BY,
    UPDATE_DATE,
    INUSE
)
SELECT
    workflow_definition.WORKFLOW_DEFINITION_ID,
    issue_gpr_c_step.WORKFLOW_STEP_MASTER_ID,
    'RECHECK',
    po_pic_step.WORKFLOW_STEP_MASTER_ID,
    NULL,
    'RECHECK_TO_PIC',
    1,
    'WORKFLOW_GPR_C_RECHECK_20260809',
    NOW(),
    'Send GPR C to PO PIC for re-check and resume the same approver',
    'WORKFLOW_GPR_C_RECHECK_20260809',
    NOW(),
    1
FROM workflow_definition workflow_definition
JOIN workflow_step_master issue_gpr_c_step
  ON issue_gpr_c_step.WORKFLOW_DEFINITION_ID = workflow_definition.WORKFLOW_DEFINITION_ID
 AND issue_gpr_c_step.STEP_CODE = 'ISSUE_GPR_C'
 AND issue_gpr_c_step.INUSE = 1
JOIN workflow_step_master po_pic_step
  ON po_pic_step.WORKFLOW_DEFINITION_ID = workflow_definition.WORKFLOW_DEFINITION_ID
 AND po_pic_step.STEP_CODE = 'PO_PIC_IN_PROGRESS'
 AND po_pic_step.INUSE = 1
WHERE workflow_definition.WORKFLOW_CODE = 'VENDOR_REGISTRATION'
  AND workflow_definition.DEFINITION_STATUS = 'PUBLISHED'
  AND workflow_definition.INUSE = 1
  AND NOT EXISTS (
      SELECT 1
      FROM workflow_transition existing_transition
      WHERE existing_transition.WORKFLOW_DEFINITION_ID = workflow_definition.WORKFLOW_DEFINITION_ID
        AND existing_transition.FROM_WORKFLOW_STEP_MASTER_ID = issue_gpr_c_step.WORKFLOW_STEP_MASTER_ID
        AND existing_transition.ACTION_CODE = 'RECHECK'
  );

UPDATE workflow_transition recheck_transition
JOIN workflow_definition workflow_definition
  ON workflow_definition.WORKFLOW_DEFINITION_ID = recheck_transition.WORKFLOW_DEFINITION_ID
JOIN workflow_step_master issue_gpr_c_step
  ON issue_gpr_c_step.WORKFLOW_STEP_MASTER_ID = recheck_transition.FROM_WORKFLOW_STEP_MASTER_ID
 AND issue_gpr_c_step.STEP_CODE = 'ISSUE_GPR_C'
JOIN workflow_step_master po_pic_step
  ON po_pic_step.WORKFLOW_DEFINITION_ID = workflow_definition.WORKFLOW_DEFINITION_ID
 AND po_pic_step.STEP_CODE = 'PO_PIC_IN_PROGRESS'
 AND po_pic_step.INUSE = 1
SET recheck_transition.TO_WORKFLOW_STEP_MASTER_ID = po_pic_step.WORKFLOW_STEP_MASTER_ID,
    recheck_transition.M_REQUEST_STATE_ID = NULL,
    recheck_transition.CONDITION_KEY = 'RECHECK_TO_PIC',
    recheck_transition.DESCRIPTION = 'Send GPR C to PO PIC for re-check and resume the same approver',
    recheck_transition.UPDATE_BY = 'WORKFLOW_GPR_C_RECHECK_20260809',
    recheck_transition.UPDATE_DATE = NOW(),
    recheck_transition.INUSE = 1
WHERE workflow_definition.WORKFLOW_CODE = 'VENDOR_REGISTRATION'
  AND recheck_transition.ACTION_CODE = 'RECHECK';

COMMIT;

SELECT
    transition_row.WORKFLOW_TRANSITION_ID,
    from_step.STEP_CODE AS FROM_STEP,
    transition_row.ACTION_CODE,
    to_step.STEP_CODE AS TO_STEP,
    transition_row.CONDITION_KEY,
    transition_row.INUSE
FROM workflow_transition transition_row
JOIN workflow_definition workflow_definition
  ON workflow_definition.WORKFLOW_DEFINITION_ID = transition_row.WORKFLOW_DEFINITION_ID
JOIN workflow_step_master from_step
  ON from_step.WORKFLOW_STEP_MASTER_ID = transition_row.FROM_WORKFLOW_STEP_MASTER_ID
LEFT JOIN workflow_step_master to_step
  ON to_step.WORKFLOW_STEP_MASTER_ID = transition_row.TO_WORKFLOW_STEP_MASTER_ID
WHERE workflow_definition.WORKFLOW_CODE = 'VENDOR_REGISTRATION'
  AND from_step.STEP_CODE = 'ISSUE_GPR_C'
  AND transition_row.ACTION_CODE = 'RECHECK';

SELECT
    M_GPR_C_FLOW_STATUS_ID,
    STATUS_CODE,
    STATUS_LABEL_EN,
    IS_TERMINAL,
    SORT_ORDER,
    INUSE
FROM m_gpr_c_flow_status
WHERE STATUS_CODE = 'RECHECK_REQUIRED';
