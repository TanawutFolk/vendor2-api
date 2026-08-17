-- Route the PO Manager RECHECK action directly to PO PIC In Progress.
-- Workflow step relationships are resolved from master IDs; existing transition IDs are preserved.
USE `_test_vendor_tanawut_2026_07_14`;

START TRANSACTION;

-- If a RECHECK transition already exists, keep it as the canonical row and retire the legacy RETURN row.
UPDATE workflow_transition legacy_transition
JOIN workflow_definition workflow_definition
  ON workflow_definition.WORKFLOW_DEFINITION_ID = legacy_transition.WORKFLOW_DEFINITION_ID
JOIN workflow_step_master po_mgr_step
  ON po_mgr_step.WORKFLOW_STEP_MASTER_ID = legacy_transition.FROM_WORKFLOW_STEP_MASTER_ID
 AND po_mgr_step.WORKFLOW_DEFINITION_ID = workflow_definition.WORKFLOW_DEFINITION_ID
 AND po_mgr_step.STEP_CODE = 'PO_MGR_APPROVAL'
JOIN workflow_transition recheck_transition
  ON recheck_transition.WORKFLOW_DEFINITION_ID = legacy_transition.WORKFLOW_DEFINITION_ID
 AND recheck_transition.FROM_WORKFLOW_STEP_MASTER_ID = legacy_transition.FROM_WORKFLOW_STEP_MASTER_ID
 AND recheck_transition.ACTION_CODE = 'RECHECK'
 AND recheck_transition.PRIORITY_NO = legacy_transition.PRIORITY_NO
SET legacy_transition.INUSE = 0,
    legacy_transition.UPDATE_BY = 'WORKFLOW_PO_MGR_RECHECK_PIC_20260809',
    legacy_transition.UPDATE_DATE = NOW()
WHERE workflow_definition.WORKFLOW_CODE = 'VENDOR_REGISTRATION'
  AND legacy_transition.ACTION_CODE = 'RETURN';

-- Preserve the existing transition ID when no canonical RECHECK row exists yet.
UPDATE workflow_transition legacy_transition
JOIN workflow_definition workflow_definition
  ON workflow_definition.WORKFLOW_DEFINITION_ID = legacy_transition.WORKFLOW_DEFINITION_ID
JOIN workflow_step_master po_mgr_step
  ON po_mgr_step.WORKFLOW_STEP_MASTER_ID = legacy_transition.FROM_WORKFLOW_STEP_MASTER_ID
 AND po_mgr_step.WORKFLOW_DEFINITION_ID = workflow_definition.WORKFLOW_DEFINITION_ID
 AND po_mgr_step.STEP_CODE = 'PO_MGR_APPROVAL'
LEFT JOIN workflow_transition recheck_transition
  ON recheck_transition.WORKFLOW_DEFINITION_ID = legacy_transition.WORKFLOW_DEFINITION_ID
 AND recheck_transition.FROM_WORKFLOW_STEP_MASTER_ID = legacy_transition.FROM_WORKFLOW_STEP_MASTER_ID
 AND recheck_transition.ACTION_CODE = 'RECHECK'
 AND recheck_transition.PRIORITY_NO = legacy_transition.PRIORITY_NO
SET legacy_transition.ACTION_CODE = 'RECHECK',
    legacy_transition.CONDITION_KEY = 'RECHECK_TO_PIC',
    legacy_transition.DESCRIPTION = 'Request PO PIC to re-check vendor documents',
    legacy_transition.UPDATE_BY = 'WORKFLOW_PO_MGR_RECHECK_PIC_20260809',
    legacy_transition.UPDATE_DATE = NOW(),
    legacy_transition.INUSE = 1
WHERE workflow_definition.WORKFLOW_CODE = 'VENDOR_REGISTRATION'
  AND legacy_transition.ACTION_CODE = 'RETURN'
  AND recheck_transition.WORKFLOW_TRANSITION_ID IS NULL;

-- Create the transition for a fresh workflow database where neither action exists.
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
    po_mgr_step.WORKFLOW_STEP_MASTER_ID,
    'RECHECK',
    po_pic_step.WORKFLOW_STEP_MASTER_ID,
    NULL,
    'RECHECK_TO_PIC',
    1,
    'WORKFLOW_PO_MGR_RECHECK_PIC_20260809',
    NOW(),
    'Request PO PIC to re-check vendor documents',
    'WORKFLOW_PO_MGR_RECHECK_PIC_20260809',
    NOW(),
    1
FROM workflow_definition workflow_definition
JOIN workflow_step_master po_mgr_step
  ON po_mgr_step.WORKFLOW_DEFINITION_ID = workflow_definition.WORKFLOW_DEFINITION_ID
 AND po_mgr_step.STEP_CODE = 'PO_MGR_APPROVAL'
 AND po_mgr_step.INUSE = 1
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
        AND existing_transition.FROM_WORKFLOW_STEP_MASTER_ID = po_mgr_step.WORKFLOW_STEP_MASTER_ID
        AND existing_transition.ACTION_CODE = 'RECHECK'
        AND existing_transition.PRIORITY_NO = 1
  );

-- Normalize the canonical row and resolve its target from the active workflow master ID.
UPDATE workflow_transition recheck_transition
JOIN workflow_definition workflow_definition
  ON workflow_definition.WORKFLOW_DEFINITION_ID = recheck_transition.WORKFLOW_DEFINITION_ID
JOIN workflow_step_master po_mgr_step
  ON po_mgr_step.WORKFLOW_STEP_MASTER_ID = recheck_transition.FROM_WORKFLOW_STEP_MASTER_ID
 AND po_mgr_step.WORKFLOW_DEFINITION_ID = workflow_definition.WORKFLOW_DEFINITION_ID
 AND po_mgr_step.STEP_CODE = 'PO_MGR_APPROVAL'
JOIN workflow_step_master po_pic_step
  ON po_pic_step.WORKFLOW_DEFINITION_ID = workflow_definition.WORKFLOW_DEFINITION_ID
 AND po_pic_step.STEP_CODE = 'PO_PIC_IN_PROGRESS'
 AND po_pic_step.INUSE = 1
SET recheck_transition.TO_WORKFLOW_STEP_MASTER_ID = po_pic_step.WORKFLOW_STEP_MASTER_ID,
    recheck_transition.M_REQUEST_STATE_ID = NULL,
    recheck_transition.CONDITION_KEY = 'RECHECK_TO_PIC',
    recheck_transition.DESCRIPTION = 'Request PO PIC to re-check vendor documents',
    recheck_transition.UPDATE_BY = 'WORKFLOW_PO_MGR_RECHECK_PIC_20260809',
    recheck_transition.UPDATE_DATE = NOW(),
    recheck_transition.INUSE = 1
WHERE workflow_definition.WORKFLOW_CODE = 'VENDOR_REGISTRATION'
  AND recheck_transition.ACTION_CODE = 'RECHECK';

COMMIT;

SELECT
    recheck_transition.WORKFLOW_TRANSITION_ID,
    from_step.STEP_CODE AS FROM_STEP,
    recheck_transition.ACTION_CODE,
    to_step.STEP_CODE AS TO_STEP,
    recheck_transition.CONDITION_KEY,
    recheck_transition.DESCRIPTION,
    recheck_transition.INUSE
FROM workflow_transition recheck_transition
JOIN workflow_definition workflow_definition
  ON workflow_definition.WORKFLOW_DEFINITION_ID = recheck_transition.WORKFLOW_DEFINITION_ID
JOIN workflow_step_master from_step
  ON from_step.WORKFLOW_STEP_MASTER_ID = recheck_transition.FROM_WORKFLOW_STEP_MASTER_ID
LEFT JOIN workflow_step_master to_step
  ON to_step.WORKFLOW_STEP_MASTER_ID = recheck_transition.TO_WORKFLOW_STEP_MASTER_ID
WHERE workflow_definition.WORKFLOW_CODE = 'VENDOR_REGISTRATION'
  AND from_step.STEP_CODE = 'PO_MGR_APPROVAL'
  AND recheck_transition.ACTION_CODE IN ('RETURN', 'RECHECK')
ORDER BY recheck_transition.WORKFLOW_TRANSITION_ID;
