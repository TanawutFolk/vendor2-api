-- Replace Document Check's REJECT action with RECHECK to PO PIC In Progress.
-- Existing transition IDs are preserved; step relationships are resolved from workflow masters.
USE `_test_vendor_tanawut_2026_07_14`;

START TRANSACTION;

-- If RECHECK already exists, keep it and retire every Document Check REJECT transition.
UPDATE workflow_transition reject_transition
JOIN workflow_definition workflow_definition
  ON workflow_definition.WORKFLOW_DEFINITION_ID = reject_transition.WORKFLOW_DEFINITION_ID
JOIN workflow_step_master document_check_step
  ON document_check_step.WORKFLOW_STEP_MASTER_ID = reject_transition.FROM_WORKFLOW_STEP_MASTER_ID
 AND document_check_step.WORKFLOW_DEFINITION_ID = workflow_definition.WORKFLOW_DEFINITION_ID
 AND document_check_step.STEP_CODE = 'DOC_CHECK'
JOIN workflow_transition recheck_transition
  ON recheck_transition.WORKFLOW_DEFINITION_ID = reject_transition.WORKFLOW_DEFINITION_ID
 AND recheck_transition.FROM_WORKFLOW_STEP_MASTER_ID = reject_transition.FROM_WORKFLOW_STEP_MASTER_ID
 AND recheck_transition.ACTION_CODE = 'RECHECK'
 AND recheck_transition.INUSE = 1
SET reject_transition.INUSE = 0,
    reject_transition.UPDATE_BY = 'WORKFLOW_DOC_RECHECK_20260809',
    reject_transition.UPDATE_DATE = NOW()
WHERE workflow_definition.WORKFLOW_CODE = 'VENDOR_REGISTRATION'
  AND reject_transition.ACTION_CODE = 'REJECT';

-- Rename the existing return-to-PIC row so its transition ID remains unchanged.
UPDATE workflow_transition reject_transition
JOIN workflow_definition workflow_definition
  ON workflow_definition.WORKFLOW_DEFINITION_ID = reject_transition.WORKFLOW_DEFINITION_ID
JOIN workflow_step_master document_check_step
  ON document_check_step.WORKFLOW_STEP_MASTER_ID = reject_transition.FROM_WORKFLOW_STEP_MASTER_ID
 AND document_check_step.WORKFLOW_DEFINITION_ID = workflow_definition.WORKFLOW_DEFINITION_ID
 AND document_check_step.STEP_CODE = 'DOC_CHECK'
JOIN workflow_step_master po_pic_step
  ON po_pic_step.WORKFLOW_DEFINITION_ID = workflow_definition.WORKFLOW_DEFINITION_ID
 AND po_pic_step.STEP_CODE = 'PO_PIC_IN_PROGRESS'
 AND po_pic_step.INUSE = 1
LEFT JOIN workflow_transition recheck_transition
  ON recheck_transition.WORKFLOW_DEFINITION_ID = reject_transition.WORKFLOW_DEFINITION_ID
 AND recheck_transition.FROM_WORKFLOW_STEP_MASTER_ID = reject_transition.FROM_WORKFLOW_STEP_MASTER_ID
 AND recheck_transition.ACTION_CODE = 'RECHECK'
SET reject_transition.ACTION_CODE = 'RECHECK',
    reject_transition.TO_WORKFLOW_STEP_MASTER_ID = po_pic_step.WORKFLOW_STEP_MASTER_ID,
    reject_transition.M_REQUEST_STATE_ID = NULL,
    reject_transition.CONDITION_KEY = 'RECHECK_TO_PIC',
    reject_transition.DESCRIPTION = 'Request PO PIC to re-check vendor documents',
    reject_transition.UPDATE_BY = 'WORKFLOW_DOC_RECHECK_20260809',
    reject_transition.UPDATE_DATE = NOW(),
    reject_transition.INUSE = 1
WHERE workflow_definition.WORKFLOW_CODE = 'VENDOR_REGISTRATION'
  AND reject_transition.ACTION_CODE = 'REJECT'
  AND reject_transition.TO_WORKFLOW_STEP_MASTER_ID = po_pic_step.WORKFLOW_STEP_MASTER_ID
  AND recheck_transition.WORKFLOW_TRANSITION_ID IS NULL;

-- Support a fresh database where the old transition is absent.
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
    document_check_step.WORKFLOW_STEP_MASTER_ID,
    'RECHECK',
    po_pic_step.WORKFLOW_STEP_MASTER_ID,
    NULL,
    'RECHECK_TO_PIC',
    1,
    'WORKFLOW_DOC_RECHECK_20260809',
    NOW(),
    'Request PO PIC to re-check vendor documents',
    'WORKFLOW_DOC_RECHECK_20260809',
    NOW(),
    1
FROM workflow_definition workflow_definition
JOIN workflow_step_master document_check_step
  ON document_check_step.WORKFLOW_DEFINITION_ID = workflow_definition.WORKFLOW_DEFINITION_ID
 AND document_check_step.STEP_CODE = 'DOC_CHECK'
 AND document_check_step.INUSE = 1
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
        AND existing_transition.FROM_WORKFLOW_STEP_MASTER_ID = document_check_step.WORKFLOW_STEP_MASTER_ID
        AND existing_transition.ACTION_CODE = 'RECHECK'
  );

-- Normalize the active action and ensure Document Check exposes no Reject action.
UPDATE workflow_transition recheck_transition
JOIN workflow_definition workflow_definition
  ON workflow_definition.WORKFLOW_DEFINITION_ID = recheck_transition.WORKFLOW_DEFINITION_ID
JOIN workflow_step_master document_check_step
  ON document_check_step.WORKFLOW_STEP_MASTER_ID = recheck_transition.FROM_WORKFLOW_STEP_MASTER_ID
 AND document_check_step.STEP_CODE = 'DOC_CHECK'
JOIN workflow_step_master po_pic_step
  ON po_pic_step.WORKFLOW_DEFINITION_ID = workflow_definition.WORKFLOW_DEFINITION_ID
 AND po_pic_step.STEP_CODE = 'PO_PIC_IN_PROGRESS'
 AND po_pic_step.INUSE = 1
SET recheck_transition.TO_WORKFLOW_STEP_MASTER_ID = po_pic_step.WORKFLOW_STEP_MASTER_ID,
    recheck_transition.M_REQUEST_STATE_ID = NULL,
    recheck_transition.CONDITION_KEY = 'RECHECK_TO_PIC',
    recheck_transition.DESCRIPTION = 'Request PO PIC to re-check vendor documents',
    recheck_transition.UPDATE_BY = 'WORKFLOW_DOC_RECHECK_20260809',
    recheck_transition.UPDATE_DATE = NOW(),
    recheck_transition.INUSE = 1
WHERE workflow_definition.WORKFLOW_CODE = 'VENDOR_REGISTRATION'
  AND recheck_transition.ACTION_CODE = 'RECHECK';

UPDATE workflow_transition reject_transition
JOIN workflow_definition workflow_definition
  ON workflow_definition.WORKFLOW_DEFINITION_ID = reject_transition.WORKFLOW_DEFINITION_ID
JOIN workflow_step_master document_check_step
  ON document_check_step.WORKFLOW_STEP_MASTER_ID = reject_transition.FROM_WORKFLOW_STEP_MASTER_ID
 AND document_check_step.STEP_CODE = 'DOC_CHECK'
SET reject_transition.INUSE = 0,
    reject_transition.UPDATE_BY = 'WORKFLOW_DOC_RECHECK_20260809',
    reject_transition.UPDATE_DATE = NOW()
WHERE workflow_definition.WORKFLOW_CODE = 'VENDOR_REGISTRATION'
  AND reject_transition.ACTION_CODE = 'REJECT';

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
  AND from_step.STEP_CODE = 'DOC_CHECK'
  AND transition_row.ACTION_CODE IN ('REJECT', 'RECHECK')
ORDER BY transition_row.WORKFLOW_TRANSITION_ID;
