-- PO Mgr can return a request to the existing Document Check task for another review.
-- Source and target are resolved from workflow master IDs; the RETURN action is separate
-- from the terminal REJECT transition so the existing reject behavior remains unchanged.
USE `_test_vendor_tanawut_2026_07_14`;

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
    wd.WORKFLOW_DEFINITION_ID,
    po_mgr_step.WORKFLOW_STEP_MASTER_ID,
    'RETURN',
    doc_check_step.WORKFLOW_STEP_MASTER_ID,
    NULL,
    'RETURN_TO_DOC_CHECK',
    1,
    'WORKFLOW_PO_MGR_RETURN_20260804',
    NOW(),
    'Return to PO and SCM Document Check for another review',
    'WORKFLOW_PO_MGR_RETURN_20260804',
    NOW(),
    1
FROM workflow_definition wd
JOIN workflow_step_master po_mgr_step
  ON po_mgr_step.WORKFLOW_DEFINITION_ID = wd.WORKFLOW_DEFINITION_ID
 AND po_mgr_step.STEP_CODE = 'PO_MGR_APPROVAL'
 AND po_mgr_step.INUSE = 1
JOIN workflow_step_master doc_check_step
  ON doc_check_step.WORKFLOW_DEFINITION_ID = wd.WORKFLOW_DEFINITION_ID
 AND doc_check_step.STEP_CODE = 'DOC_CHECK'
 AND doc_check_step.INUSE = 1
WHERE wd.WORKFLOW_CODE = 'VENDOR_REGISTRATION'
  AND wd.DEFINITION_STATUS = 'PUBLISHED'
  AND wd.INUSE = 1
ON DUPLICATE KEY UPDATE
    TO_WORKFLOW_STEP_MASTER_ID = VALUES(TO_WORKFLOW_STEP_MASTER_ID),
    M_REQUEST_STATE_ID = NULL,
    CONDITION_KEY = VALUES(CONDITION_KEY),
    DESCRIPTION = VALUES(DESCRIPTION),
    UPDATE_BY = VALUES(UPDATE_BY),
    UPDATE_DATE = NOW(),
    INUSE = 1;

SELECT
    wt.WORKFLOW_TRANSITION_ID,
    wt.WORKFLOW_DEFINITION_ID,
    from_step.WORKFLOW_STEP_MASTER_ID AS FROM_WORKFLOW_STEP_MASTER_ID,
    from_step.STEP_CODE AS FROM_STEP,
    wt.ACTION_CODE,
    to_step.WORKFLOW_STEP_MASTER_ID AS TO_WORKFLOW_STEP_MASTER_ID,
    to_step.STEP_CODE AS TO_STEP,
    wt.M_REQUEST_STATE_ID,
    wt.CONDITION_KEY,
    wt.INUSE
FROM workflow_transition wt
JOIN workflow_definition wd
  ON wd.WORKFLOW_DEFINITION_ID = wt.WORKFLOW_DEFINITION_ID
JOIN workflow_step_master from_step
  ON from_step.WORKFLOW_STEP_MASTER_ID = wt.FROM_WORKFLOW_STEP_MASTER_ID
JOIN workflow_step_master to_step
  ON to_step.WORKFLOW_STEP_MASTER_ID = wt.TO_WORKFLOW_STEP_MASTER_ID
WHERE wd.WORKFLOW_CODE = 'VENDOR_REGISTRATION'
  AND wd.DEFINITION_STATUS = 'PUBLISHED'
  AND wd.INUSE = 1
  AND from_step.STEP_CODE = 'PO_MGR_APPROVAL'
  AND wt.ACTION_CODE = 'RETURN'
  AND wt.INUSE = 1;
