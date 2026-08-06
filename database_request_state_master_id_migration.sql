-- Request lifecycle master-ID migration
--
-- request_register_vendor is a request-level aggregate. Its lifecycle must not
-- reuse m_approval_step_status, which belongs to individual approval tasks.
-- This migration creates m_request_state, backfills M_REQUEST_STATE_ID, keeps a
-- full pre-change backup, replaces the lifecycle index, and drops REQUEST_STATE.
-- Project convention: logical IDs and SQL JOINs, without physical foreign keys.

CREATE TABLE IF NOT EXISTS m_request_state (
    M_REQUEST_STATE_ID TINYINT UNSIGNED NOT NULL,
    STATE_CODE VARCHAR(32) NOT NULL,
    STATE_LABEL_EN VARCHAR(100) NOT NULL,
    STATE_LABEL_TH VARCHAR(100) NULL,
    IS_TERMINAL TINYINT(1) NOT NULL DEFAULT 0,
    SORT_ORDER SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    CREATE_BY VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    CREATE_DATE DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UPDATE_BY VARCHAR(50) NULL,
    UPDATE_DATE DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INUSE TINYINT(1) NOT NULL DEFAULT 1,
    DESCRIPTION VARCHAR(100) NULL,
    PRIMARY KEY (M_REQUEST_STATE_ID),
    UNIQUE KEY uq_request_state_code (STATE_CODE),
    KEY idx_request_state_active (INUSE, SORT_ORDER)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO m_request_state (
    M_REQUEST_STATE_ID,
    STATE_CODE,
    STATE_LABEL_EN,
    STATE_LABEL_TH,
    IS_TERMINAL,
    SORT_ORDER,
    CREATE_BY,
    UPDATE_BY,
    INUSE,
    DESCRIPTION
)
VALUES
    (1, 'IN_PROGRESS', 'In Progress', 'กำลังดำเนินการ', 0, 1, 'REQUEST_STATE_ID_MIGRATION', 'REQUEST_STATE_ID_MIGRATION', 1, 'Request workflow is active'),
    (2, 'COMPLETED', 'Completed', 'เสร็จสิ้น', 1, 2, 'REQUEST_STATE_ID_MIGRATION', 'REQUEST_STATE_ID_MIGRATION', 1, 'Request workflow completed successfully'),
    (3, 'REJECTED', 'Rejected', 'ไม่อนุมัติ', 1, 3, 'REQUEST_STATE_ID_MIGRATION', 'REQUEST_STATE_ID_MIGRATION', 1, 'Request workflow was rejected'),
    (4, 'CANCELLED', 'Cancelled', 'ยกเลิก', 1, 4, 'REQUEST_STATE_ID_MIGRATION', 'REQUEST_STATE_ID_MIGRATION', 1, 'Request workflow was cancelled')
ON DUPLICATE KEY UPDATE
    STATE_CODE = VALUES(STATE_CODE),
    STATE_LABEL_EN = VALUES(STATE_LABEL_EN),
    STATE_LABEL_TH = VALUES(STATE_LABEL_TH),
    IS_TERMINAL = VALUES(IS_TERMINAL),
    SORT_ORDER = VALUES(SORT_ORDER),
    UPDATE_BY = 'REQUEST_STATE_ID_MIGRATION',
    INUSE = 1,
    DESCRIPTION = VALUES(DESCRIPTION);

DELIMITER $$

DROP PROCEDURE IF EXISTS migrate_request_state_master_id$$
CREATE PROCEDURE migrate_request_state_master_id()
request_state_migration: BEGIN
    DECLARE legacy_column_exists INT DEFAULT 0;
    DECLARE id_column_exists INT DEFAULT 0;
    DECLARE invalid_state_count INT DEFAULT 0;
    DECLARE missing_state_count INT DEFAULT 0;

    SELECT COUNT(*) INTO legacy_column_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'request_register_vendor'
      AND COLUMN_NAME = 'REQUEST_STATE';

    SELECT COUNT(*) INTO id_column_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'request_register_vendor'
      AND COLUMN_NAME = 'M_REQUEST_STATE_ID';

    IF legacy_column_exists = 0 AND id_column_exists = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'request_register_vendor has neither REQUEST_STATE nor M_REQUEST_STATE_ID';
    END IF;

    IF legacy_column_exists = 1 THEN
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.TABLES
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'zz_backup_request_state_id_20260722'
        ) THEN
            CREATE TABLE zz_backup_request_state_id_20260722 LIKE request_register_vendor;
            INSERT INTO zz_backup_request_state_id_20260722
            SELECT * FROM request_register_vendor;
        END IF;
    END IF;

    IF id_column_exists = 0 THEN
        ALTER TABLE request_register_vendor
            ADD COLUMN M_REQUEST_STATE_ID TINYINT UNSIGNED NULL AFTER REQUEST_STATE;
    END IF;

    IF legacy_column_exists = 1 THEN
        UPDATE request_register_vendor
        SET M_REQUEST_STATE_ID = CASE
            WHEN LOWER(TRIM(COALESCE(REQUEST_STATE, ''))) IN ('', 'in_progress', 'in progress', 'active', 'pending') THEN 1
            WHEN LOWER(TRIM(REQUEST_STATE)) IN ('completed', 'complete', 'approved') THEN 2
            WHEN LOWER(TRIM(REQUEST_STATE)) IN ('rejected', 'reject') THEN 3
            WHEN LOWER(TRIM(REQUEST_STATE)) IN ('cancelled', 'canceled', 'cancel') THEN 4
            ELSE NULL
        END;

        SELECT COUNT(*) INTO invalid_state_count
        FROM request_register_vendor
        WHERE M_REQUEST_STATE_ID IS NULL;

        IF invalid_state_count > 0 THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Unknown REQUEST_STATE values found; migration stopped before dropping the legacy column';
        END IF;
    END IF;

    SELECT COUNT(*) INTO missing_state_count
    FROM request_register_vendor rr
    LEFT JOIN m_request_state state_master
      ON state_master.M_REQUEST_STATE_ID = rr.M_REQUEST_STATE_ID
    WHERE rr.M_REQUEST_STATE_ID IS NULL
       OR state_master.M_REQUEST_STATE_ID IS NULL;

    IF missing_state_count > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'M_REQUEST_STATE_ID backfill contains missing master rows';
    END IF;

    ALTER TABLE request_register_vendor
        MODIFY COLUMN M_REQUEST_STATE_ID TINYINT UNSIGNED NOT NULL DEFAULT 1;

    IF EXISTS (
        SELECT 1
        FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'request_register_vendor'
          AND INDEX_NAME = 'idx_request_workflow_version'
    ) THEN
        ALTER TABLE request_register_vendor
            DROP INDEX idx_request_workflow_version;
    END IF;

    ALTER TABLE request_register_vendor
        ADD KEY idx_request_workflow_version (WORKFLOW_DEFINITION_ID, M_REQUEST_STATE_ID);

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'request_register_vendor'
          AND INDEX_NAME = 'idx_request_state_active'
    ) THEN
        ALTER TABLE request_register_vendor
            ADD KEY idx_request_state_active (M_REQUEST_STATE_ID, INUSE);
    END IF;

    IF legacy_column_exists = 1 THEN
        ALTER TABLE request_register_vendor
            DROP COLUMN REQUEST_STATE;
    END IF;
END$$

CALL migrate_request_state_master_id()$$
DROP PROCEDURE IF EXISTS migrate_request_state_master_id$$

DELIMITER ;

-- Postflight checks
SELECT
    M_REQUEST_STATE_ID,
    STATE_CODE,
    STATE_LABEL_EN,
    IS_TERMINAL,
    INUSE
FROM m_request_state
ORDER BY M_REQUEST_STATE_ID;

SELECT
    state_master.M_REQUEST_STATE_ID,
    state_master.STATE_CODE,
    COUNT(rr.REQUEST_REGISTER_VENDOR_ID) AS REQUEST_COUNT
FROM m_request_state state_master
LEFT JOIN request_register_vendor rr
  ON rr.M_REQUEST_STATE_ID = state_master.M_REQUEST_STATE_ID
GROUP BY state_master.M_REQUEST_STATE_ID, state_master.STATE_CODE
ORDER BY state_master.M_REQUEST_STATE_ID;

SELECT 'legacy_request_state_columns' AS CHECK_NAME, COUNT(*) AS ISSUE_COUNT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'request_register_vendor'
  AND COLUMN_NAME = 'REQUEST_STATE'
UNION ALL
SELECT 'orphan_request_state_ids', COUNT(*)
FROM request_register_vendor rr
LEFT JOIN m_request_state state_master
  ON state_master.M_REQUEST_STATE_ID = rr.M_REQUEST_STATE_ID
WHERE state_master.M_REQUEST_STATE_ID IS NULL;
