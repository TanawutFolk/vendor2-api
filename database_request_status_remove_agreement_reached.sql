-- Remove the unused AGREEMENT_REACHED request status (ID 4) and compact all
-- following request-status IDs. Runtime code identifies statuses by STATUS_CODE;
-- the numeric IDs are database relationships and must be moved together.
USE `_test_vendor_tanawut_2026_07_14`;

DROP PROCEDURE IF EXISTS migrate_remove_agreement_reached_status;

DELIMITER $$

CREATE PROCEDURE migrate_remove_agreement_reached_status()
main: BEGIN
    DECLARE obsolete_status_count INT DEFAULT 0;
    DECLARE obsolete_status_id INT DEFAULT NULL;
    DECLARE obsolete_step_count INT DEFAULT 0;
    DECLARE active_obsolete_step_count INT DEFAULT 0;
    DECLARE active_transition_count INT DEFAULT 0;
    DECLARE approval_step_count INT DEFAULT 0;
    DECLARE approval_log_count INT DEFAULT 0;
    DECLARE current_request_count INT DEFAULT 0;
    DECLARE orphan_step_status_count INT DEFAULT 0;
    DECLARE orphan_request_status_count INT DEFAULT 0;
    DECLARE status_count INT DEFAULT 0;
    DECLARE min_status_id INT DEFAULT 0;
    DECLARE max_status_id INT DEFAULT 0;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    SELECT COUNT(*), MAX(M_REQUEST_STATUS_ID)
      INTO obsolete_status_count, obsolete_status_id
    FROM m_request_status
    WHERE STATUS_CODE = 'AGREEMENT_REACHED';

    -- A missing code means this migration has already completed.
    IF obsolete_status_count = 0 THEN
        LEAVE main;
    END IF;

    IF obsolete_status_count <> 1 OR obsolete_status_id <> 4 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cannot migrate: AGREEMENT_REACHED must exist exactly once at M_REQUEST_STATUS_ID 4';
    END IF;

    SELECT COUNT(*) INTO current_request_count
    FROM request_register_vendor
    WHERE CURRENT_M_REQUEST_STATUS_ID = obsolete_status_id;

    IF current_request_count > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cannot migrate: requests still use AGREEMENT_REACHED status';
    END IF;

    SELECT COUNT(*), COALESCE(SUM(INUSE = 1), 0)
      INTO obsolete_step_count, active_obsolete_step_count
    FROM workflow_step_master
    WHERE M_REQUEST_STATUS_ID = obsolete_status_id
      AND STEP_CODE = 'AGREEMENT_REACHED';

    IF obsolete_step_count = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cannot migrate: AGREEMENT_REACHED workflow step was not found';
    END IF;

    IF active_obsolete_step_count > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cannot migrate: AGREEMENT_REACHED workflow step is still active';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM workflow_step_master
        WHERE M_REQUEST_STATUS_ID = obsolete_status_id
          AND STEP_CODE <> 'AGREEMENT_REACHED'
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cannot migrate: status ID 4 is assigned to a different workflow step';
    END IF;

    SELECT COUNT(*) INTO active_transition_count
    FROM workflow_transition wt
    JOIN workflow_step_master obsolete_step
      ON obsolete_step.WORKFLOW_STEP_MASTER_ID IN (
          wt.FROM_WORKFLOW_STEP_MASTER_ID,
          wt.TO_WORKFLOW_STEP_MASTER_ID
      )
    WHERE obsolete_step.M_REQUEST_STATUS_ID = obsolete_status_id
      AND obsolete_step.STEP_CODE = 'AGREEMENT_REACHED'
      AND wt.INUSE = 1;

    IF active_transition_count > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cannot migrate: an active workflow transition still uses AGREEMENT_REACHED';
    END IF;

    SELECT COUNT(*) INTO approval_step_count
    FROM request_approval_step approval_step
    JOIN workflow_step_master obsolete_step
      ON obsolete_step.WORKFLOW_STEP_MASTER_ID = approval_step.WORKFLOW_STEP_MASTER_ID
    WHERE obsolete_step.M_REQUEST_STATUS_ID = obsolete_status_id
      AND obsolete_step.STEP_CODE = 'AGREEMENT_REACHED';

    SELECT COUNT(*) INTO approval_log_count
    FROM request_approval_log approval_log
    JOIN workflow_step_master obsolete_step
      ON obsolete_step.WORKFLOW_STEP_MASTER_ID = approval_log.WORKFLOW_STEP_MASTER_ID
    WHERE obsolete_step.M_REQUEST_STATUS_ID = obsolete_status_id
      AND obsolete_step.STEP_CODE = 'AGREEMENT_REACHED';

    IF approval_step_count > 0 OR approval_log_count > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cannot migrate: approval history still references AGREEMENT_REACHED';
    END IF;

    START TRANSACTION;

    DELETE wt
    FROM workflow_transition wt
    JOIN workflow_step_master obsolete_step
      ON obsolete_step.WORKFLOW_STEP_MASTER_ID IN (
          wt.FROM_WORKFLOW_STEP_MASTER_ID,
          wt.TO_WORKFLOW_STEP_MASTER_ID
      )
    WHERE obsolete_step.M_REQUEST_STATUS_ID = obsolete_status_id
      AND obsolete_step.STEP_CODE = 'AGREEMENT_REACHED';

    DELETE FROM workflow_step_master
    WHERE M_REQUEST_STATUS_ID = obsolete_status_id
      AND STEP_CODE = 'AGREEMENT_REACHED';

    DELETE FROM m_request_status
    WHERE M_REQUEST_STATUS_ID = obsolete_status_id
      AND STATUS_CODE = 'AGREEMENT_REACHED';

    -- ID 4 is now free. Ascending order prevents duplicate-key collisions while
    -- each following row moves down by one (5 -> 4, 6 -> 5, and so on).
    UPDATE m_request_status
    SET M_REQUEST_STATUS_ID = M_REQUEST_STATUS_ID - 1,
        UPDATE_BY = 'REMOVE_AGREEMENT_STATUS_20260722',
        UPDATE_DATE = NOW()
    WHERE M_REQUEST_STATUS_ID > obsolete_status_id
    ORDER BY M_REQUEST_STATUS_ID ASC;

    UPDATE workflow_step_master
    SET M_REQUEST_STATUS_ID = M_REQUEST_STATUS_ID - 1,
        UPDATE_BY = 'REMOVE_AGREEMENT_STATUS_20260722',
        UPDATE_DATE = NOW()
    WHERE M_REQUEST_STATUS_ID > obsolete_status_id
    ORDER BY M_REQUEST_STATUS_ID ASC;

    UPDATE request_register_vendor
    SET CURRENT_M_REQUEST_STATUS_ID = CURRENT_M_REQUEST_STATUS_ID - 1
    WHERE CURRENT_M_REQUEST_STATUS_ID > obsolete_status_id;

    SELECT COUNT(*) INTO orphan_step_status_count
    FROM workflow_step_master wsm
    LEFT JOIN m_request_status mrs
      ON mrs.M_REQUEST_STATUS_ID = wsm.M_REQUEST_STATUS_ID
    WHERE mrs.M_REQUEST_STATUS_ID IS NULL;

    SELECT COUNT(*) INTO orphan_request_status_count
    FROM request_register_vendor rr
    LEFT JOIN m_request_status mrs
      ON mrs.M_REQUEST_STATUS_ID = rr.CURRENT_M_REQUEST_STATUS_ID
    WHERE rr.CURRENT_M_REQUEST_STATUS_ID IS NOT NULL
      AND mrs.M_REQUEST_STATUS_ID IS NULL;

    SELECT COUNT(*), MIN(M_REQUEST_STATUS_ID), MAX(M_REQUEST_STATUS_ID)
      INTO status_count, min_status_id, max_status_id
    FROM m_request_status;

    IF orphan_step_status_count > 0 OR orphan_request_status_count > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cannot migrate: compacting status IDs created orphan references';
    END IF;

    IF min_status_id <> 1 OR status_count <> max_status_id THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cannot migrate: request status IDs are not contiguous after compaction';
    END IF;

    COMMIT;
END$$

DELIMITER ;

CALL migrate_remove_agreement_reached_status();
DROP PROCEDURE IF EXISTS migrate_remove_agreement_reached_status;

SELECT
    M_REQUEST_STATUS_ID,
    STATUS_CODE,
    STATUS_VALUE,
    INUSE
FROM m_request_status
ORDER BY M_REQUEST_STATUS_ID;

SELECT
    wsm.WORKFLOW_STEP_MASTER_ID,
    wsm.M_REQUEST_STATUS_ID,
    wsm.STEP_CODE,
    wsm.INUSE
FROM workflow_step_master wsm
ORDER BY wsm.M_REQUEST_STATUS_ID;

SELECT
    rr.CURRENT_M_REQUEST_STATUS_ID,
    COUNT(*) AS REQUEST_COUNT
FROM request_register_vendor rr
GROUP BY rr.CURRENT_M_REQUEST_STATUS_ID
ORDER BY rr.CURRENT_M_REQUEST_STATUS_ID;
