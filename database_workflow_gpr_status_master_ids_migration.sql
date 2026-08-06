-- Workflow/GPR C status master-ID migration
--
-- Migrates four text status columns to logical master IDs:
--   workflow_transition.TERMINAL_STATE
--   request_vendor_gpr_c_flows.FLOW_STATUS
--   request_vendor_gpr_c_steps.STEP_STATUS
--   request_vendor_gpr_c_action_required.RESULT_STATUS
-- Project convention: logical IDs and SQL JOINs, without physical foreign keys.

CREATE TABLE IF NOT EXISTS m_gpr_c_flow_status (
    M_GPR_C_FLOW_STATUS_ID TINYINT UNSIGNED NOT NULL,
    STATUS_CODE VARCHAR(50) NOT NULL,
    STATUS_LABEL_EN VARCHAR(100) NOT NULL,
    STATUS_LABEL_TH VARCHAR(100) NULL,
    IS_TERMINAL TINYINT(1) NOT NULL DEFAULT 0,
    SORT_ORDER SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    CREATE_BY VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    CREATE_DATE DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UPDATE_BY VARCHAR(50) NULL,
    UPDATE_DATE DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INUSE TINYINT(1) NOT NULL DEFAULT 1,
    DESCRIPTION VARCHAR(100) NULL,
    PRIMARY KEY (M_GPR_C_FLOW_STATUS_ID),
    UNIQUE KEY uq_gpr_c_flow_status_code (STATUS_CODE),
    KEY idx_gpr_c_flow_status_active (INUSE, SORT_ORDER)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO m_gpr_c_flow_status (
    M_GPR_C_FLOW_STATUS_ID, STATUS_CODE, STATUS_LABEL_EN, STATUS_LABEL_TH,
    IS_TERMINAL, SORT_ORDER, CREATE_BY, UPDATE_BY, INUSE, DESCRIPTION
)
VALUES
    (1, 'DRAFT', 'Draft', NULL, 0, 1, 'STATUS_ID_MIGRATION', 'STATUS_ID_MIGRATION', 1, 'GPR C flow has not been submitted'),
    (2, 'REQUESTER_SETUP', 'Requester Setup', NULL, 0, 2, 'STATUS_ID_MIGRATION', 'STATUS_ID_MIGRATION', 1, 'Requester is preparing GPR C approval'),
    (3, 'IN_PROGRESS', 'In Progress', NULL, 0, 3, 'STATUS_ID_MIGRATION', 'STATUS_ID_MIGRATION', 1, 'GPR C approval is active'),
    (4, 'APPROVED', 'Approved', NULL, 1, 4, 'STATUS_ID_MIGRATION', 'STATUS_ID_MIGRATION', 1, 'GPR C flow approved'),
    (5, 'REJECTED', 'Rejected', NULL, 1, 5, 'STATUS_ID_MIGRATION', 'STATUS_ID_MIGRATION', 1, 'GPR C flow rejected')
ON DUPLICATE KEY UPDATE
    STATUS_CODE = VALUES(STATUS_CODE),
    STATUS_LABEL_EN = VALUES(STATUS_LABEL_EN),
    STATUS_LABEL_TH = VALUES(STATUS_LABEL_TH),
    IS_TERMINAL = VALUES(IS_TERMINAL),
    SORT_ORDER = VALUES(SORT_ORDER),
    UPDATE_BY = 'STATUS_ID_MIGRATION',
    INUSE = 1,
    DESCRIPTION = VALUES(DESCRIPTION);

CREATE TABLE IF NOT EXISTS m_action_result_status (
    M_ACTION_RESULT_STATUS_ID TINYINT UNSIGNED NOT NULL,
    STATUS_CODE VARCHAR(50) NOT NULL,
    STATUS_LABEL_EN VARCHAR(100) NOT NULL,
    STATUS_LABEL_TH VARCHAR(100) NULL,
    IS_TERMINAL TINYINT(1) NOT NULL DEFAULT 0,
    SORT_ORDER SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    CREATE_BY VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    CREATE_DATE DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UPDATE_BY VARCHAR(50) NULL,
    UPDATE_DATE DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INUSE TINYINT(1) NOT NULL DEFAULT 1,
    DESCRIPTION VARCHAR(100) NULL,
    PRIMARY KEY (M_ACTION_RESULT_STATUS_ID),
    UNIQUE KEY uq_action_result_status_code (STATUS_CODE),
    KEY idx_action_result_status_active (INUSE, SORT_ORDER)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO m_action_result_status (
    M_ACTION_RESULT_STATUS_ID, STATUS_CODE, STATUS_LABEL_EN, STATUS_LABEL_TH,
    IS_TERMINAL, SORT_ORDER, CREATE_BY, UPDATE_BY, INUSE, DESCRIPTION
)
VALUES
    (1, 'PENDING', 'Pending', NULL, 0, 1, 'STATUS_ID_MIGRATION', 'STATUS_ID_MIGRATION', 1, 'Action result is pending'),
    (2, 'INCOMPLETE', 'Incomplete', NULL, 0, 2, 'STATUS_ID_MIGRATION', 'STATUS_ID_MIGRATION', 1, 'Action result requires more information'),
    (3, 'COMPLETED', 'Completed', NULL, 1, 3, 'STATUS_ID_MIGRATION', 'STATUS_ID_MIGRATION', 1, 'Action result completed')
ON DUPLICATE KEY UPDATE
    STATUS_CODE = VALUES(STATUS_CODE),
    STATUS_LABEL_EN = VALUES(STATUS_LABEL_EN),
    STATUS_LABEL_TH = VALUES(STATUS_LABEL_TH),
    IS_TERMINAL = VALUES(IS_TERMINAL),
    SORT_ORDER = VALUES(SORT_ORDER),
    UPDATE_BY = 'STATUS_ID_MIGRATION',
    INUSE = 1,
    DESCRIPTION = VALUES(DESCRIPTION);

DELIMITER $$

DROP PROCEDURE IF EXISTS migrate_workflow_gpr_status_master_ids$$
CREATE PROCEDURE migrate_workflow_gpr_status_master_ids()
status_id_migration: BEGIN
    DECLARE legacy_column_exists INT DEFAULT 0;
    DECLARE id_column_exists INT DEFAULT 0;
    DECLARE invalid_status_count INT DEFAULT 0;

    -- 1) workflow_transition.TERMINAL_STATE -> m_request_state
    SELECT COUNT(*) INTO legacy_column_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'workflow_transition' AND COLUMN_NAME = 'TERMINAL_STATE';

    SELECT COUNT(*) INTO id_column_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'workflow_transition' AND COLUMN_NAME = 'M_REQUEST_STATE_ID';

    IF legacy_column_exists = 0 AND id_column_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'workflow_transition has no terminal-state column';
    END IF;

    IF legacy_column_exists = 1 AND NOT EXISTS (
        SELECT 1 FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'zz_backup_transition_status_id_20260722'
    ) THEN
        CREATE TABLE zz_backup_transition_status_id_20260722 LIKE workflow_transition;
        INSERT INTO zz_backup_transition_status_id_20260722 SELECT * FROM workflow_transition;
    END IF;

    IF id_column_exists = 0 THEN
        ALTER TABLE workflow_transition
            ADD COLUMN M_REQUEST_STATE_ID TINYINT UNSIGNED NULL AFTER TERMINAL_STATE;
    END IF;

    IF legacy_column_exists = 1 THEN
        UPDATE workflow_transition
        SET M_REQUEST_STATE_ID = CASE
            WHEN TERMINAL_STATE IS NULL OR TRIM(TERMINAL_STATE) = '' THEN NULL
            WHEN LOWER(TRIM(TERMINAL_STATE)) IN ('in_progress', 'in progress', 'active', 'pending') THEN 1
            WHEN LOWER(TRIM(TERMINAL_STATE)) IN ('completed', 'complete', 'approved') THEN 2
            WHEN LOWER(TRIM(TERMINAL_STATE)) IN ('rejected', 'reject') THEN 3
            WHEN LOWER(TRIM(TERMINAL_STATE)) IN ('cancelled', 'canceled', 'cancel') THEN 4
            ELSE NULL
        END;

        SELECT COUNT(*) INTO invalid_status_count
        FROM workflow_transition
        WHERE TERMINAL_STATE IS NOT NULL
          AND TRIM(TERMINAL_STATE) <> ''
          AND M_REQUEST_STATE_ID IS NULL;

        IF invalid_status_count > 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Unknown workflow_transition.TERMINAL_STATE values found';
        END IF;
    END IF;

    SELECT COUNT(*) INTO invalid_status_count
    FROM workflow_transition wt
    LEFT JOIN m_request_state master_state ON master_state.M_REQUEST_STATE_ID = wt.M_REQUEST_STATE_ID
    WHERE wt.M_REQUEST_STATE_ID IS NOT NULL AND master_state.M_REQUEST_STATE_ID IS NULL;

    IF invalid_status_count > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'workflow_transition has orphan M_REQUEST_STATE_ID values';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'workflow_transition'
          AND INDEX_NAME = 'idx_workflow_transition_request_state'
    ) THEN
        ALTER TABLE workflow_transition ADD KEY idx_workflow_transition_request_state (M_REQUEST_STATE_ID);
    END IF;

    IF legacy_column_exists = 1 THEN
        ALTER TABLE workflow_transition DROP COLUMN TERMINAL_STATE;
    END IF;

    -- 2) request_vendor_gpr_c_flows.FLOW_STATUS -> m_gpr_c_flow_status
    SELECT COUNT(*) INTO legacy_column_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'request_vendor_gpr_c_flows' AND COLUMN_NAME = 'FLOW_STATUS';

    SELECT COUNT(*) INTO id_column_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'request_vendor_gpr_c_flows' AND COLUMN_NAME = 'M_GPR_C_FLOW_STATUS_ID';

    IF legacy_column_exists = 0 AND id_column_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'request_vendor_gpr_c_flows has no flow-status column';
    END IF;

    IF legacy_column_exists = 1 AND NOT EXISTS (
        SELECT 1 FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'zz_backup_gpr_flow_status_id_20260722'
    ) THEN
        CREATE TABLE zz_backup_gpr_flow_status_id_20260722 LIKE request_vendor_gpr_c_flows;
        INSERT INTO zz_backup_gpr_flow_status_id_20260722 SELECT * FROM request_vendor_gpr_c_flows;
    END IF;

    IF id_column_exists = 0 THEN
        ALTER TABLE request_vendor_gpr_c_flows
            ADD COLUMN M_GPR_C_FLOW_STATUS_ID TINYINT UNSIGNED NULL AFTER FLOW_STATUS;
    END IF;

    IF legacy_column_exists = 1 THEN
        UPDATE request_vendor_gpr_c_flows
        SET M_GPR_C_FLOW_STATUS_ID = CASE
            WHEN LOWER(TRIM(COALESCE(FLOW_STATUS, 'draft'))) = 'draft' THEN 1
            WHEN LOWER(TRIM(FLOW_STATUS)) IN ('requester_setup', 'requester setup') THEN 2
            WHEN LOWER(TRIM(FLOW_STATUS)) IN ('in_progress', 'in progress') THEN 3
            WHEN LOWER(TRIM(FLOW_STATUS)) IN ('approved', 'completed') THEN 4
            WHEN LOWER(TRIM(FLOW_STATUS)) IN ('rejected', 'reject') THEN 5
            ELSE NULL
        END;
    END IF;

    SELECT COUNT(*) INTO invalid_status_count
    FROM request_vendor_gpr_c_flows flow_row
    LEFT JOIN m_gpr_c_flow_status master_status
      ON master_status.M_GPR_C_FLOW_STATUS_ID = flow_row.M_GPR_C_FLOW_STATUS_ID
    WHERE flow_row.M_GPR_C_FLOW_STATUS_ID IS NULL OR master_status.M_GPR_C_FLOW_STATUS_ID IS NULL;

    IF invalid_status_count > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid request_vendor_gpr_c_flows status values found';
    END IF;

    ALTER TABLE request_vendor_gpr_c_flows
        MODIFY COLUMN M_GPR_C_FLOW_STATUS_ID TINYINT UNSIGNED NOT NULL DEFAULT 1;

    IF legacy_column_exists = 1 THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.STATISTICS
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'request_vendor_gpr_c_flows'
              AND INDEX_NAME = 'IDX_GPR_C_FLOW_STATUS'
        ) THEN
            ALTER TABLE request_vendor_gpr_c_flows DROP INDEX IDX_GPR_C_FLOW_STATUS;
        END IF;
        ALTER TABLE request_vendor_gpr_c_flows DROP COLUMN FLOW_STATUS;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'request_vendor_gpr_c_flows'
          AND INDEX_NAME = 'IDX_GPR_C_FLOW_STATUS'
    ) THEN
        ALTER TABLE request_vendor_gpr_c_flows ADD KEY IDX_GPR_C_FLOW_STATUS (M_GPR_C_FLOW_STATUS_ID);
    END IF;

    -- 3) request_vendor_gpr_c_steps.STEP_STATUS -> m_approval_step_status
    SELECT COUNT(*) INTO legacy_column_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'request_vendor_gpr_c_steps' AND COLUMN_NAME = 'STEP_STATUS';

    SELECT COUNT(*) INTO id_column_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'request_vendor_gpr_c_steps' AND COLUMN_NAME = 'M_APPROVAL_STEP_STATUS_ID';

    IF legacy_column_exists = 0 AND id_column_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'request_vendor_gpr_c_steps has no step-status column';
    END IF;

    IF legacy_column_exists = 1 AND NOT EXISTS (
        SELECT 1 FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'zz_backup_gpr_step_status_id_20260722'
    ) THEN
        CREATE TABLE zz_backup_gpr_step_status_id_20260722 LIKE request_vendor_gpr_c_steps;
        INSERT INTO zz_backup_gpr_step_status_id_20260722 SELECT * FROM request_vendor_gpr_c_steps;
    END IF;

    IF id_column_exists = 0 THEN
        ALTER TABLE request_vendor_gpr_c_steps
            ADD COLUMN M_APPROVAL_STEP_STATUS_ID TINYINT UNSIGNED NULL AFTER STEP_STATUS;
    END IF;

    IF legacy_column_exists = 1 THEN
        UPDATE request_vendor_gpr_c_steps
        SET M_APPROVAL_STEP_STATUS_ID = CASE
            WHEN LOWER(TRIM(COALESCE(STEP_STATUS, 'pending'))) = 'pending' THEN 1
            WHEN LOWER(TRIM(STEP_STATUS)) IN ('in_progress', 'in progress', 'current') THEN 2
            WHEN LOWER(TRIM(STEP_STATUS)) IN ('approved', 'completed') THEN 3
            WHEN LOWER(TRIM(STEP_STATUS)) IN ('rejected', 'reject') THEN 4
            WHEN LOWER(TRIM(STEP_STATUS)) IN ('skipped', 'skip') THEN 5
            ELSE NULL
        END;
    END IF;

    SELECT COUNT(*) INTO invalid_status_count
    FROM request_vendor_gpr_c_steps step_row
    LEFT JOIN m_approval_step_status master_status
      ON master_status.M_APPROVAL_STEP_STATUS_ID = step_row.M_APPROVAL_STEP_STATUS_ID
    WHERE step_row.M_APPROVAL_STEP_STATUS_ID IS NULL OR master_status.M_APPROVAL_STEP_STATUS_ID IS NULL;

    IF invalid_status_count > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid request_vendor_gpr_c_steps status values found';
    END IF;

    ALTER TABLE request_vendor_gpr_c_steps
        MODIFY COLUMN M_APPROVAL_STEP_STATUS_ID TINYINT UNSIGNED NOT NULL DEFAULT 1;

    IF legacy_column_exists = 1 THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.STATISTICS
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'request_vendor_gpr_c_steps'
              AND INDEX_NAME = 'IDX_GPR_C_STEP_STATUS'
        ) THEN
            ALTER TABLE request_vendor_gpr_c_steps DROP INDEX IDX_GPR_C_STEP_STATUS;
        END IF;
        ALTER TABLE request_vendor_gpr_c_steps DROP COLUMN STEP_STATUS;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'request_vendor_gpr_c_steps'
          AND INDEX_NAME = 'IDX_GPR_C_STEP_STATUS'
    ) THEN
        ALTER TABLE request_vendor_gpr_c_steps ADD KEY IDX_GPR_C_STEP_STATUS (M_APPROVAL_STEP_STATUS_ID);
    END IF;

    -- 4) request_vendor_gpr_c_action_required.RESULT_STATUS -> m_action_result_status
    SELECT COUNT(*) INTO legacy_column_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'request_vendor_gpr_c_action_required' AND COLUMN_NAME = 'RESULT_STATUS';

    SELECT COUNT(*) INTO id_column_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'request_vendor_gpr_c_action_required' AND COLUMN_NAME = 'M_ACTION_RESULT_STATUS_ID';

    IF legacy_column_exists = 0 AND id_column_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'request_vendor_gpr_c_action_required has no result-status column';
    END IF;

    IF legacy_column_exists = 1 AND NOT EXISTS (
        SELECT 1 FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'zz_backup_gpr_action_result_status_id_20260722'
    ) THEN
        CREATE TABLE zz_backup_gpr_action_result_status_id_20260722 LIKE request_vendor_gpr_c_action_required;
        INSERT INTO zz_backup_gpr_action_result_status_id_20260722 SELECT * FROM request_vendor_gpr_c_action_required;
    END IF;

    IF id_column_exists = 0 THEN
        ALTER TABLE request_vendor_gpr_c_action_required
            ADD COLUMN M_ACTION_RESULT_STATUS_ID TINYINT UNSIGNED NULL AFTER RESULT_STATUS;
    END IF;

    IF legacy_column_exists = 1 THEN
        UPDATE request_vendor_gpr_c_action_required
        SET M_ACTION_RESULT_STATUS_ID = CASE
            WHEN LOWER(TRIM(COALESCE(RESULT_STATUS, 'pending'))) = 'pending' THEN 1
            WHEN LOWER(TRIM(RESULT_STATUS)) IN ('incomplete', 'in_complete') THEN 2
            WHEN LOWER(TRIM(RESULT_STATUS)) IN ('completed', 'complete') THEN 3
            ELSE NULL
        END;
    END IF;

    SELECT COUNT(*) INTO invalid_status_count
    FROM request_vendor_gpr_c_action_required action_row
    LEFT JOIN m_action_result_status master_status
      ON master_status.M_ACTION_RESULT_STATUS_ID = action_row.M_ACTION_RESULT_STATUS_ID
    WHERE action_row.M_ACTION_RESULT_STATUS_ID IS NULL OR master_status.M_ACTION_RESULT_STATUS_ID IS NULL;

    IF invalid_status_count > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid request_vendor_gpr_c_action_required status values found';
    END IF;

    ALTER TABLE request_vendor_gpr_c_action_required
        MODIFY COLUMN M_ACTION_RESULT_STATUS_ID TINYINT UNSIGNED NOT NULL DEFAULT 1;

    IF legacy_column_exists = 1 THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.STATISTICS
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'request_vendor_gpr_c_action_required'
              AND INDEX_NAME = 'IDX_GPR_C_AR_STATUS'
        ) THEN
            ALTER TABLE request_vendor_gpr_c_action_required DROP INDEX IDX_GPR_C_AR_STATUS;
        END IF;
        ALTER TABLE request_vendor_gpr_c_action_required DROP COLUMN RESULT_STATUS;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'request_vendor_gpr_c_action_required'
          AND INDEX_NAME = 'IDX_GPR_C_AR_STATUS'
    ) THEN
        ALTER TABLE request_vendor_gpr_c_action_required ADD KEY IDX_GPR_C_AR_STATUS (M_ACTION_RESULT_STATUS_ID);
    END IF;
END$$

CALL migrate_workflow_gpr_status_master_ids()$$
DROP PROCEDURE IF EXISTS migrate_workflow_gpr_status_master_ids$$

DELIMITER ;

-- Postflight checks
SELECT M_GPR_C_FLOW_STATUS_ID, STATUS_CODE, IS_TERMINAL, INUSE
FROM m_gpr_c_flow_status ORDER BY M_GPR_C_FLOW_STATUS_ID;

SELECT M_ACTION_RESULT_STATUS_ID, STATUS_CODE, IS_TERMINAL, INUSE
FROM m_action_result_status ORDER BY M_ACTION_RESULT_STATUS_ID;

SELECT 'legacy_status_columns' AS CHECK_NAME, COUNT(*) AS ISSUE_COUNT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND (
      (TABLE_NAME = 'workflow_transition' AND COLUMN_NAME = 'TERMINAL_STATE')
      OR (TABLE_NAME = 'request_vendor_gpr_c_flows' AND COLUMN_NAME = 'FLOW_STATUS')
      OR (TABLE_NAME = 'request_vendor_gpr_c_steps' AND COLUMN_NAME = 'STEP_STATUS')
      OR (TABLE_NAME = 'request_vendor_gpr_c_action_required' AND COLUMN_NAME = 'RESULT_STATUS')
  )
UNION ALL
SELECT 'orphan_transition_request_state_ids', COUNT(*)
FROM workflow_transition wt
LEFT JOIN m_request_state master_state ON master_state.M_REQUEST_STATE_ID = wt.M_REQUEST_STATE_ID
WHERE wt.M_REQUEST_STATE_ID IS NOT NULL AND master_state.M_REQUEST_STATE_ID IS NULL
UNION ALL
SELECT 'orphan_gpr_flow_status_ids', COUNT(*)
FROM request_vendor_gpr_c_flows flow_row
LEFT JOIN m_gpr_c_flow_status master_status
  ON master_status.M_GPR_C_FLOW_STATUS_ID = flow_row.M_GPR_C_FLOW_STATUS_ID
WHERE master_status.M_GPR_C_FLOW_STATUS_ID IS NULL
UNION ALL
SELECT 'orphan_gpr_step_status_ids', COUNT(*)
FROM request_vendor_gpr_c_steps step_row
LEFT JOIN m_approval_step_status master_status
  ON master_status.M_APPROVAL_STEP_STATUS_ID = step_row.M_APPROVAL_STEP_STATUS_ID
WHERE master_status.M_APPROVAL_STEP_STATUS_ID IS NULL
UNION ALL
SELECT 'orphan_gpr_action_result_status_ids', COUNT(*)
FROM request_vendor_gpr_c_action_required action_row
LEFT JOIN m_action_result_status master_status
  ON master_status.M_ACTION_RESULT_STATUS_ID = action_row.M_ACTION_RESULT_STATUS_ID
WHERE master_status.M_ACTION_RESULT_STATUS_ID IS NULL;
