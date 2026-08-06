-- DOC_CHECK Reject must return the request to the preceding PO PIC task.
-- Logical relationships are resolved by IDs/JOINs; no physical foreign key is added.
USE `_test_vendor_tanawut_2026_07_14`;

UPDATE workflow_transition wt
JOIN workflow_definition wd
  ON wd.WORKFLOW_DEFINITION_ID = wt.WORKFLOW_DEFINITION_ID
JOIN workflow_step_master doc_step
  ON doc_step.WORKFLOW_STEP_MASTER_ID = wt.FROM_WORKFLOW_STEP_MASTER_ID
 AND doc_step.WORKFLOW_DEFINITION_ID = wd.WORKFLOW_DEFINITION_ID
 AND doc_step.STEP_CODE = 'DOC_CHECK'
JOIN workflow_step_master pic_step
  ON pic_step.WORKFLOW_DEFINITION_ID = wd.WORKFLOW_DEFINITION_ID
 AND pic_step.STEP_CODE = 'PO_PIC_IN_PROGRESS'
 AND pic_step.INUSE = 1
SET wt.TO_WORKFLOW_STEP_MASTER_ID = pic_step.WORKFLOW_STEP_MASTER_ID,
    wt.TERMINAL_STATE = NULL,
    wt.CONDITION_KEY = 'RETURN_TO_PIC',
    wt.DESCRIPTION = 'Return incomplete documents to PO PIC for correction and recheck',
    wt.UPDATE_BY = 'WORKFLOW_RETURN_TO_PIC_20260715',
    wt.UPDATE_DATE = NOW()
WHERE wd.WORKFLOW_CODE = 'VENDOR_REGISTRATION'
  AND wd.DEFINITION_STATUS = 'PUBLISHED'
  AND wd.INUSE = 1
  AND wt.ACTION_CODE = 'REJECT'
  AND wt.INUSE = 1;

SELECT
    wd.WORKFLOW_DEFINITION_ID,
    wd.VERSION_NO,
    from_step.STEP_CODE AS FROM_STEP,
    wt.ACTION_CODE,
    to_step.STEP_CODE AS TO_STEP,
    wt.TERMINAL_STATE,
    wt.CONDITION_KEY,
    wt.DESCRIPTION,
    wt.UPDATE_BY,
    wt.UPDATE_DATE
FROM workflow_transition wt
JOIN workflow_definition wd
  ON wd.WORKFLOW_DEFINITION_ID = wt.WORKFLOW_DEFINITION_ID
JOIN workflow_step_master from_step
  ON from_step.WORKFLOW_STEP_MASTER_ID = wt.FROM_WORKFLOW_STEP_MASTER_ID
LEFT JOIN workflow_step_master to_step
  ON to_step.WORKFLOW_STEP_MASTER_ID = wt.TO_WORKFLOW_STEP_MASTER_ID
WHERE wd.WORKFLOW_CODE = 'VENDOR_REGISTRATION'
  AND wd.DEFINITION_STATUS = 'PUBLISHED'
  AND wd.INUSE = 1
  AND from_step.STEP_CODE = 'DOC_CHECK'
  AND wt.ACTION_CODE = 'REJECT'
  AND wt.INUSE = 1;
