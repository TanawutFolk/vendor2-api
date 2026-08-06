-- Rename the existing PO PIC-owned workflow step without changing its master IDs.
-- Historical STEP_CODE_SNAPSHOT values are intentionally preserved as audit evidence.
USE `_test_vendor_tanawut_2026_07_14`;

DROP PROCEDURE IF EXISTS migrate_po_pic_in_progress_step;

DELIMITER $$

CREATE PROCEDURE migrate_po_pic_in_progress_step()
BEGIN
    DECLARE old_step_count INT DEFAULT 0;
    DECLARE new_step_count INT DEFAULT 0;
    DECLARE old_status_count INT DEFAULT 0;
    DECLARE new_status_count INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    SELECT COUNT(*) INTO old_step_count
    FROM workflow_step_master
    WHERE STEP_CODE = 'PENDING_AGREEMENT';

    SELECT COUNT(*) INTO new_step_count
    FROM workflow_step_master
    WHERE STEP_CODE = 'PO_PIC_IN_PROGRESS';

    SELECT COUNT(*) INTO old_status_count
    FROM m_request_status
    WHERE STATUS_CODE = 'PENDING_AGREEMENT';

    SELECT COUNT(*) INTO new_status_count
    FROM m_request_status
    WHERE STATUS_CODE = 'PO_PIC_IN_PROGRESS';

    IF old_step_count > 0 AND new_step_count > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cannot migrate: both PENDING_AGREEMENT and PO_PIC_IN_PROGRESS workflow steps exist';
    END IF;

    IF old_status_count > 0 AND new_status_count > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cannot migrate: both PENDING_AGREEMENT and PO_PIC_IN_PROGRESS request statuses exist';
    END IF;

    IF old_step_count = 0 AND new_step_count = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cannot migrate: PO PIC workflow step was not found';
    END IF;

    IF old_status_count = 0 AND new_status_count = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cannot migrate: PO PIC request status was not found';
    END IF;

    START TRANSACTION;

    UPDATE m_request_status
    SET STATUS_CODE = 'PO_PIC_IN_PROGRESS',
        STATUS_VALUE = 'PO PIC In Progress',
        STATUS_LABEL_EN = 'PO PIC In Progress',
        DESCRIPTION = 'Work is in progress with the assigned PO PIC',
        UPDATE_BY = 'WORKFLOW_PO_PIC_RENAME_20260715',
        UPDATE_DATE = NOW()
    WHERE STATUS_CODE IN ('PENDING_AGREEMENT', 'PO_PIC_IN_PROGRESS');

    UPDATE workflow_step_master
    SET STEP_CODE = 'PO_PIC_IN_PROGRESS',
        ACTOR_TYPE = 'PIC',
        HANDLER_KEY = 'VALIDATE_GPR',
        DESCRIPTION = 'PO PIC In Progress',
        UPDATE_BY = 'WORKFLOW_PO_PIC_RENAME_20260715',
        UPDATE_DATE = NOW()
    WHERE STEP_CODE IN ('PENDING_AGREEMENT', 'PO_PIC_IN_PROGRESS');

    COMMIT;
END$$

DELIMITER ;

CALL migrate_po_pic_in_progress_step();
DROP PROCEDURE IF EXISTS migrate_po_pic_in_progress_step;

SELECT
    wsm.WORKFLOW_STEP_MASTER_ID,
    wsm.WORKFLOW_DEFINITION_ID,
    wsm.M_REQUEST_STATUS_ID,
    wsm.STEP_CODE,
    wsm.ACTOR_TYPE,
    wsm.HANDLER_KEY,
    wsm.DESCRIPTION AS STEP_DESCRIPTION,
    mrs.STATUS_CODE,
    mrs.STATUS_VALUE,
    mrs.STATUS_LABEL_EN,
    mrs.DESCRIPTION AS STATUS_DESCRIPTION,
    wsm.UPDATE_BY,
    wsm.UPDATE_DATE
FROM workflow_step_master wsm
JOIN m_request_status mrs
  ON mrs.M_REQUEST_STATUS_ID = wsm.M_REQUEST_STATUS_ID
WHERE wsm.STEP_CODE = 'PO_PIC_IN_PROGRESS';

SELECT
    from_step.STEP_CODE AS FROM_STEP,
    wt.ACTION_CODE,
    to_step.STEP_CODE AS TO_STEP,
    wt.TERMINAL_STATE,
    wt.CONDITION_KEY
FROM workflow_transition wt
JOIN workflow_step_master from_step
  ON from_step.WORKFLOW_STEP_MASTER_ID = wt.FROM_WORKFLOW_STEP_MASTER_ID
LEFT JOIN workflow_step_master to_step
  ON to_step.WORKFLOW_STEP_MASTER_ID = wt.TO_WORKFLOW_STEP_MASTER_ID
WHERE wt.INUSE = 1
  AND (
      from_step.STEP_CODE = 'PO_PIC_IN_PROGRESS'
      OR to_step.STEP_CODE = 'PO_PIC_IN_PROGRESS'
  )
ORDER BY from_step.DEFAULT_STEP_ORDER, wt.PRIORITY_NO, wt.ACTION_CODE;
