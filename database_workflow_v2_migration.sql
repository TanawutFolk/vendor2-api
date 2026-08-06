-- Vendor workflow v2 migration
-- Target: vendor-system-test1 (MySQL 8+)
-- Date: 2026-07-13
--
-- Run this whole file in Navicat as a user that has ALTER/CREATE/UPDATE rights.
-- The script creates full safety copies before changing the workflow tables.
-- Project convention: IDs are joined logically; no physical foreign keys remain.

USE `vendor-system-test1`;

DELIMITER $$

DROP PROCEDURE IF EXISTS migrate_vendor_workflow_v2$$
CREATE PROCEDURE migrate_vendor_workflow_v2()
BEGIN
    DECLARE duplicate_active_tasks INT DEFAULT 0;
    DECLARE orphan_tasks INT DEFAULT 0;
    DECLARE orphan_events INT DEFAULT 0;
    DECLARE missing_request_versions INT DEFAULT 0;
    DECLARE missing_event_steps INT DEFAULT 0;
    DECLARE workflow_fk_done BOOLEAN DEFAULT FALSE;
    DECLARE workflow_fk_table VARCHAR(64);
    DECLARE workflow_fk_name VARCHAR(64);
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET workflow_fk_done = TRUE;

    -- ---------------------------------------------------------------------
    -- Preflight: stop before DDL when the existing runtime data is invalid.
    -- ---------------------------------------------------------------------
    SELECT COUNT(*) INTO duplicate_active_tasks
    FROM (
        SELECT REQUEST_REGISTER_VENDOR_ID
        FROM request_approval_step
        WHERE INUSE = 1
          AND LOWER(STEP_STATUS) = 'in_progress'
        GROUP BY REQUEST_REGISTER_VENDOR_ID
        HAVING COUNT(*) > 1
    ) duplicated;

    IF duplicate_active_tasks > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Preflight failed: requests with multiple in-progress approval tasks exist';
    END IF;

    SELECT COUNT(*) INTO orphan_tasks
    FROM request_approval_step ras
    LEFT JOIN request_register_vendor rr
      ON rr.REQUEST_REGISTER_VENDOR_ID = ras.REQUEST_REGISTER_VENDOR_ID
    LEFT JOIN workflow_step_master wsm
      ON wsm.WORKFLOW_STEP_MASTER_ID = ras.WORKFLOW_STEP_MASTER_ID
    WHERE rr.REQUEST_REGISTER_VENDOR_ID IS NULL
       OR wsm.WORKFLOW_STEP_MASTER_ID IS NULL;

    IF orphan_tasks > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Preflight failed: orphan request approval tasks exist';
    END IF;

    SELECT COUNT(*) INTO orphan_events
    FROM request_approval_log ral
    LEFT JOIN request_approval_step ras
      ON ras.REQUEST_REGISTER_VENDOR_ID = ral.REQUEST_REGISTER_VENDOR_ID
     AND ras.REQUEST_APPROVAL_STEP_ID = ral.REQUEST_APPROVAL_STEP_ID
    WHERE ras.REQUEST_APPROVAL_STEP_ID IS NULL;

    IF orphan_events > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Preflight failed: orphan request approval logs exist';
    END IF;

    -- ---------------------------------------------------------------------
    -- One-time full backups. Re-running does not overwrite the first copy.
    -- ---------------------------------------------------------------------
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'zz_backup_workflow_v2_m_request_status_20260713'
    ) THEN
        CREATE TABLE zz_backup_workflow_v2_m_request_status_20260713 LIKE m_request_status;
        INSERT INTO zz_backup_workflow_v2_m_request_status_20260713 SELECT * FROM m_request_status;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'zz_backup_workflow_v2_definition_20260713'
    ) THEN
        CREATE TABLE zz_backup_workflow_v2_definition_20260713 LIKE workflow_definition;
        INSERT INTO zz_backup_workflow_v2_definition_20260713 SELECT * FROM workflow_definition;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'zz_backup_workflow_v2_step_master_20260713'
    ) THEN
        CREATE TABLE zz_backup_workflow_v2_step_master_20260713 LIKE workflow_step_master;
        INSERT INTO zz_backup_workflow_v2_step_master_20260713 SELECT * FROM workflow_step_master;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'zz_backup_workflow_v2_transition_20260713'
    ) THEN
        CREATE TABLE zz_backup_workflow_v2_transition_20260713 LIKE workflow_transition;
        INSERT INTO zz_backup_workflow_v2_transition_20260713 SELECT * FROM workflow_transition;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'zz_backup_workflow_v2_request_20260713'
    ) THEN
        CREATE TABLE zz_backup_workflow_v2_request_20260713 LIKE request_register_vendor;
        INSERT INTO zz_backup_workflow_v2_request_20260713 SELECT * FROM request_register_vendor;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'zz_backup_workflow_v2_task_20260713'
    ) THEN
        CREATE TABLE zz_backup_workflow_v2_task_20260713 LIKE request_approval_step;
        INSERT INTO zz_backup_workflow_v2_task_20260713 SELECT * FROM request_approval_step;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'zz_backup_workflow_v2_event_20260713'
    ) THEN
        CREATE TABLE zz_backup_workflow_v2_event_20260713 LIKE request_approval_log;
        INSERT INTO zz_backup_workflow_v2_event_20260713 SELECT * FROM request_approval_log;
    END IF;

    -- ---------------------------------------------------------------------
    -- Stable status identity: ID for joins, CODE for logic, LABEL for UI.
    -- ---------------------------------------------------------------------
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'm_request_status'
          AND COLUMN_NAME = 'STATUS_CODE'
    ) THEN
        ALTER TABLE m_request_status
            ADD COLUMN STATUS_CODE VARCHAR(64) NULL AFTER M_REQUEST_STATUS_ID;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'm_request_status'
          AND COLUMN_NAME = 'STATUS_LABEL_EN'
    ) THEN
        ALTER TABLE m_request_status
            ADD COLUMN STATUS_LABEL_EN VARCHAR(150) NULL AFTER STATUS_VALUE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'm_request_status'
          AND COLUMN_NAME = 'STATUS_LABEL_TH'
    ) THEN
        ALTER TABLE m_request_status
            ADD COLUMN STATUS_LABEL_TH VARCHAR(150) NULL AFTER STATUS_LABEL_EN;
    END IF;

    UPDATE m_request_status mrs
    JOIN (
        SELECT M_REQUEST_STATUS_ID, MIN(STEP_CODE) AS STEP_CODE
        FROM workflow_step_master
        GROUP BY M_REQUEST_STATUS_ID
    ) configured
      ON configured.M_REQUEST_STATUS_ID = mrs.M_REQUEST_STATUS_ID
    SET mrs.STATUS_CODE = configured.STEP_CODE
    WHERE NULLIF(TRIM(mrs.STATUS_CODE), '') IS NULL;

    UPDATE m_request_status
    SET STATUS_CODE = CASE
            WHEN LOWER(STATUS_VALUE) = 'rejected' THEN 'REJECTED'
            WHEN LOWER(STATUS_VALUE) IN ('cancelled', 'canceled') THEN 'CANCELLED'
            WHEN LOWER(STATUS_VALUE) = 'completed' THEN 'COMPLETED'
            ELSE CONCAT('STATUS_', M_REQUEST_STATUS_ID)
        END,
        STATUS_LABEL_EN = COALESCE(NULLIF(STATUS_LABEL_EN, ''), STATUS_VALUE)
    WHERE NULLIF(TRIM(STATUS_CODE), '') IS NULL;

    UPDATE m_request_status
    SET STATUS_LABEL_EN = COALESCE(NULLIF(STATUS_LABEL_EN, ''), STATUS_VALUE);

    ALTER TABLE m_request_status
        MODIFY COLUMN STATUS_CODE VARCHAR(64) NOT NULL;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'm_request_status'
          AND INDEX_NAME = 'uq_m_request_status_code'
    ) THEN
        ALTER TABLE m_request_status
            ADD UNIQUE KEY uq_m_request_status_code (STATUS_CODE);
    END IF;

    -- ---------------------------------------------------------------------
    -- Published workflow versions are immutable and requests pin a version.
    -- ---------------------------------------------------------------------
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'workflow_definition'
          AND COLUMN_NAME = 'DEFINITION_STATUS'
    ) THEN
        ALTER TABLE workflow_definition
            ADD COLUMN DEFINITION_STATUS VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED' AFTER VERSION_NO;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'workflow_definition'
          AND COLUMN_NAME = 'PUBLISHED_DATE'
    ) THEN
        ALTER TABLE workflow_definition
            ADD COLUMN PUBLISHED_DATE DATETIME NULL AFTER DEFINITION_STATUS;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'workflow_definition'
          AND COLUMN_NAME = 'RETIRED_DATE'
    ) THEN
        ALTER TABLE workflow_definition
            ADD COLUMN RETIRED_DATE DATETIME NULL AFTER PUBLISHED_DATE;
    END IF;

    UPDATE workflow_definition
    SET DEFINITION_STATUS = CASE
            WHEN INUSE = 1 THEN 'PUBLISHED'
            ELSE 'RETIRED'
        END,
        PUBLISHED_DATE = CASE
            WHEN INUSE = 1 THEN COALESCE(PUBLISHED_DATE, CREATE_DATE)
            ELSE PUBLISHED_DATE
        END,
        RETIRED_DATE = CASE
            WHEN INUSE = 0 THEN COALESCE(RETIRED_DATE, UPDATE_DATE, CREATE_DATE)
            ELSE NULL
        END;

    UPDATE workflow_definition wd
    JOIN (
        SELECT WORKFLOW_CODE, MAX(VERSION_NO) AS LATEST_VERSION
        FROM workflow_definition
        WHERE WORKFLOW_CODE = 'VENDOR_REGISTRATION'
        GROUP BY WORKFLOW_CODE
    ) latest
      ON latest.WORKFLOW_CODE = wd.WORKFLOW_CODE
    SET wd.DEFINITION_STATUS = CASE
            WHEN wd.VERSION_NO = latest.LATEST_VERSION THEN 'PUBLISHED'
            ELSE 'RETIRED'
        END,
        wd.PUBLISHED_DATE = CASE
            WHEN wd.VERSION_NO = latest.LATEST_VERSION THEN COALESCE(wd.PUBLISHED_DATE, wd.CREATE_DATE)
            ELSE wd.PUBLISHED_DATE
        END,
        wd.RETIRED_DATE = CASE
            WHEN wd.VERSION_NO = latest.LATEST_VERSION THEN NULL
            ELSE COALESCE(wd.RETIRED_DATE, wd.UPDATE_DATE, wd.CREATE_DATE)
        END,
        wd.INUSE = CASE WHEN wd.VERSION_NO = latest.LATEST_VERSION THEN 1 ELSE 0 END;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.TABLE_CONSTRAINTS
        WHERE CONSTRAINT_SCHEMA = DATABASE()
          AND TABLE_NAME = 'workflow_definition'
          AND CONSTRAINT_NAME = 'chk_workflow_definition_status'
    ) THEN
        ALTER TABLE workflow_definition
            ADD CONSTRAINT chk_workflow_definition_status
            CHECK (DEFINITION_STATUS IN ('DRAFT', 'PUBLISHED', 'RETIRED'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'workflow_step_master'
          AND COLUMN_NAME = 'HANDLER_KEY'
    ) THEN
        ALTER TABLE workflow_step_master
            ADD COLUMN HANDLER_KEY VARCHAR(64) NOT NULL DEFAULT 'STANDARD_APPROVAL' AFTER ACTOR_TYPE;
    END IF;

    UPDATE workflow_step_master
    SET HANDLER_KEY = CASE STEP_CODE
        WHEN 'PIC_REVIEW' THEN 'VENDOR_REQUEST'
        WHEN 'PO_PIC_IN_PROGRESS' THEN 'VALIDATE_GPR'
        WHEN 'ISSUE_GPR_B' THEN 'GPR_B'
        WHEN 'ISSUE_GPR_C' THEN 'GPR_C'
        WHEN 'ACCOUNT_REGISTERED' THEN 'REGISTER_VENDOR_CODE'
        ELSE 'STANDARD_APPROVAL'
    END;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'workflow_transition'
          AND COLUMN_NAME = 'CONDITION_KEY'
    ) THEN
        ALTER TABLE workflow_transition
            ADD COLUMN CONDITION_KEY VARCHAR(64) NULL AFTER TERMINAL_STATE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'request_register_vendor'
          AND COLUMN_NAME = 'WORKFLOW_DEFINITION_ID'
    ) THEN
        ALTER TABLE request_register_vendor
            ADD COLUMN WORKFLOW_DEFINITION_ID SMALLINT UNSIGNED NULL AFTER REQUEST_STATE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'request_register_vendor'
          AND COLUMN_NAME = 'LOCK_VERSION'
    ) THEN
        ALTER TABLE request_register_vendor
            ADD COLUMN LOCK_VERSION INT UNSIGNED NOT NULL DEFAULT 0 AFTER CURRENT_REQUEST_APPROVAL_STEP_ID;
    END IF;

    UPDATE request_register_vendor rr
    LEFT JOIN request_approval_step current_task
      ON current_task.REQUEST_REGISTER_VENDOR_ID = rr.REQUEST_REGISTER_VENDOR_ID
     AND current_task.REQUEST_APPROVAL_STEP_ID = rr.CURRENT_REQUEST_APPROVAL_STEP_ID
    LEFT JOIN workflow_step_master current_master
      ON current_master.WORKFLOW_STEP_MASTER_ID = current_task.WORKFLOW_STEP_MASTER_ID
    SET rr.WORKFLOW_DEFINITION_ID = COALESCE(
        current_master.WORKFLOW_DEFINITION_ID,
        (
            SELECT wsm.WORKFLOW_DEFINITION_ID
            FROM request_approval_step ras
            JOIN workflow_step_master wsm
              ON wsm.WORKFLOW_STEP_MASTER_ID = ras.WORKFLOW_STEP_MASTER_ID
            WHERE ras.REQUEST_REGISTER_VENDOR_ID = rr.REQUEST_REGISTER_VENDOR_ID
            ORDER BY ras.STEP_ORDER, ras.REQUEST_APPROVAL_STEP_ID
            LIMIT 1
        ),
        (
            SELECT wd.WORKFLOW_DEFINITION_ID
            FROM workflow_definition wd
            WHERE wd.WORKFLOW_CODE = 'VENDOR_REGISTRATION'
            ORDER BY wd.VERSION_NO DESC
            LIMIT 1
        )
    )
    WHERE rr.WORKFLOW_DEFINITION_ID IS NULL;

    SELECT COUNT(*) INTO missing_request_versions
    FROM request_register_vendor
    WHERE WORKFLOW_DEFINITION_ID IS NULL;

    IF missing_request_versions > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Backfill failed: requests without a workflow definition remain';
    END IF;

    ALTER TABLE request_register_vendor
        MODIFY COLUMN WORKFLOW_DEFINITION_ID SMALLINT UNSIGNED NOT NULL;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'request_register_vendor'
          AND INDEX_NAME = 'idx_request_workflow_version'
    ) THEN
        ALTER TABLE request_register_vendor
            ADD KEY idx_request_workflow_version (WORKFLOW_DEFINITION_ID, REQUEST_STATE);
    END IF;

    -- ---------------------------------------------------------------------
    -- request_approval_step becomes the runtime approval task table.
    -- ---------------------------------------------------------------------
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'request_approval_step'
          AND COLUMN_NAME = 'ITERATION_NO'
    ) THEN
        ALTER TABLE request_approval_step
            ADD COLUMN ITERATION_NO SMALLINT UNSIGNED NOT NULL DEFAULT 1 AFTER STEP_ORDER;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'request_approval_step'
          AND COLUMN_NAME = 'ASSIGNED_DATE'
    ) THEN
        ALTER TABLE request_approval_step
            ADD COLUMN ASSIGNED_DATE DATETIME NULL AFTER ASSIGNMENT_MODE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'request_approval_step'
          AND COLUMN_NAME = 'COMPLETED_DATE'
    ) THEN
        ALTER TABLE request_approval_step
            ADD COLUMN COMPLETED_DATE DATETIME NULL AFTER ASSIGNED_DATE;
    END IF;

    UPDATE request_approval_step
    SET ASSIGNED_DATE = COALESCE(ASSIGNED_DATE, CREATE_DATE),
        COMPLETED_DATE = CASE
            WHEN STEP_STATUS IN ('approved', 'rejected', 'skipped')
                THEN COALESCE(COMPLETED_DATE, UPDATE_DATE, CREATE_DATE)
            ELSE COMPLETED_DATE
        END;

    IF EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'request_approval_step'
          AND INDEX_NAME = 'uq_request_workflow_step'
    ) THEN
        ALTER TABLE request_approval_step
            DROP INDEX uq_request_workflow_step;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'request_approval_step'
          AND INDEX_NAME = 'uq_request_workflow_step_iteration'
    ) THEN
        ALTER TABLE request_approval_step
            ADD UNIQUE KEY uq_request_workflow_step_iteration
            (REQUEST_REGISTER_VENDOR_ID, WORKFLOW_STEP_MASTER_ID, ITERATION_NO);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'request_approval_step'
          AND COLUMN_NAME = 'ACTIVE_REQUEST_ID'
    ) THEN
        ALTER TABLE request_approval_step
            ADD COLUMN ACTIVE_REQUEST_ID INT
            GENERATED ALWAYS AS (
                CASE
                    WHEN INUSE = 1 AND STEP_STATUS = 'in_progress'
                        THEN REQUEST_REGISTER_VENDOR_ID
                    ELSE NULL
                END
            ) STORED;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'request_approval_step'
          AND INDEX_NAME = 'uq_request_single_active_task'
    ) THEN
        ALTER TABLE request_approval_step
            ADD UNIQUE KEY uq_request_single_active_task (ACTIVE_REQUEST_ID);
    END IF;

    -- ---------------------------------------------------------------------
    -- Immutable event identity and display snapshots.
    -- ---------------------------------------------------------------------
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'request_approval_log'
          AND COLUMN_NAME = 'WORKFLOW_STEP_MASTER_ID'
    ) THEN
        ALTER TABLE request_approval_log
            ADD COLUMN WORKFLOW_STEP_MASTER_ID SMALLINT UNSIGNED NULL AFTER REQUEST_APPROVAL_STEP_ID;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'request_approval_log'
          AND COLUMN_NAME = 'ACTION_CODE'
    ) THEN
        ALTER TABLE request_approval_log
            ADD COLUMN ACTION_CODE VARCHAR(64) NULL AFTER ACTION_TYPE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'request_approval_log'
          AND COLUMN_NAME = 'STEP_CODE_SNAPSHOT'
    ) THEN
        ALTER TABLE request_approval_log
            ADD COLUMN STEP_CODE_SNAPSHOT VARCHAR(64) NULL AFTER ACTION_CODE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'request_approval_log'
          AND COLUMN_NAME = 'STATUS_LABEL_SNAPSHOT'
    ) THEN
        ALTER TABLE request_approval_log
            ADD COLUMN STATUS_LABEL_SNAPSHOT VARCHAR(150) NULL AFTER STEP_CODE_SNAPSHOT;
    END IF;

    UPDATE request_approval_log ral
    JOIN request_approval_step ras
      ON ras.REQUEST_REGISTER_VENDOR_ID = ral.REQUEST_REGISTER_VENDOR_ID
     AND ras.REQUEST_APPROVAL_STEP_ID = ral.REQUEST_APPROVAL_STEP_ID
    JOIN workflow_step_master wsm
      ON wsm.WORKFLOW_STEP_MASTER_ID = ras.WORKFLOW_STEP_MASTER_ID
    JOIN m_request_status mrs
      ON mrs.M_REQUEST_STATUS_ID = wsm.M_REQUEST_STATUS_ID
    SET ral.WORKFLOW_STEP_MASTER_ID = COALESCE(ral.WORKFLOW_STEP_MASTER_ID, wsm.WORKFLOW_STEP_MASTER_ID),
        ral.ACTION_CODE = COALESCE(NULLIF(ral.ACTION_CODE, ''), UPPER(ral.ACTION_TYPE)),
        ral.STEP_CODE_SNAPSHOT = COALESCE(NULLIF(ral.STEP_CODE_SNAPSHOT, ''), wsm.STEP_CODE),
        ral.STATUS_LABEL_SNAPSHOT = COALESCE(NULLIF(ral.STATUS_LABEL_SNAPSHOT, ''), mrs.STATUS_VALUE);

    SELECT COUNT(*) INTO missing_event_steps
    FROM request_approval_log
    WHERE WORKFLOW_STEP_MASTER_ID IS NULL;

    IF missing_event_steps > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Backfill failed: approval events without workflow step identity remain';
    END IF;

    ALTER TABLE request_approval_log
        MODIFY COLUMN WORKFLOW_STEP_MASTER_ID SMALLINT UNSIGNED NOT NULL,
        MODIFY COLUMN ACTION_CODE VARCHAR(64) NOT NULL;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'request_approval_log'
          AND INDEX_NAME = 'idx_approval_event_workflow_step'
    ) THEN
        ALTER TABLE request_approval_log
            ADD KEY idx_approval_event_workflow_step (WORKFLOW_STEP_MASTER_ID, CREATE_DATE);
    END IF;

    -- ---------------------------------------------------------------------
    -- Seed the transition graph used by the current vendor-registration flow.
    -- ---------------------------------------------------------------------
    DROP TEMPORARY TABLE IF EXISTS tmp_vendor_workflow_transition_seed;
    CREATE TEMPORARY TABLE tmp_vendor_workflow_transition_seed (
        FROM_STEP_CODE VARCHAR(64) NOT NULL,
        ACTION_CODE VARCHAR(64) NOT NULL,
        TO_STEP_CODE VARCHAR(64) NULL,
        TERMINAL_STATE VARCHAR(32) NULL,
        CONDITION_KEY VARCHAR(64) NULL,
        PRIORITY_NO SMALLINT UNSIGNED NOT NULL DEFAULT 1,
        PRIMARY KEY (FROM_STEP_CODE, ACTION_CODE, PRIORITY_NO)
    );

    INSERT INTO tmp_vendor_workflow_transition_seed
        (FROM_STEP_CODE, ACTION_CODE, TO_STEP_CODE, TERMINAL_STATE, CONDITION_KEY, PRIORITY_NO)
    VALUES
        ('REQUEST_SUBMITTED', 'APPROVE', 'PIC_REVIEW', NULL, NULL, 1),
        ('PIC_REVIEW', 'APPROVE', 'PO_PIC_IN_PROGRESS', NULL, NULL, 1),
        ('PIC_REVIEW', 'REJECT', NULL, 'rejected', NULL, 1),
        ('PO_PIC_IN_PROGRESS', 'APPROVE', 'DOC_CHECK', NULL, 'GPR_ACCEPTED', 1),
        ('PO_PIC_IN_PROGRESS', 'DISAGREE', 'ISSUE_GPR_B', NULL, 'GPR_B_REQUIRED', 1),
        ('PO_PIC_IN_PROGRESS', 'REJECT', NULL, 'rejected', NULL, 1),
        ('ISSUE_GPR_B', 'APPROVE', 'ISSUE_GPR_C', NULL, NULL, 1),
        ('ISSUE_GPR_B', 'DISAGREE', 'VENDOR_DISAGREED', 'rejected', NULL, 1),
        ('ISSUE_GPR_B', 'REJECT', NULL, 'rejected', NULL, 1),
        ('ISSUE_GPR_C', 'APPROVE', 'DOC_CHECK', NULL, NULL, 1),
        ('ISSUE_GPR_C', 'DISAGREE', 'VENDOR_DISAGREED', 'rejected', NULL, 1),
        ('ISSUE_GPR_C', 'REJECT', NULL, 'rejected', NULL, 1),
        ('DOC_CHECK', 'APPROVE', 'PO_MGR_APPROVAL', NULL, NULL, 1),
        ('DOC_CHECK', 'REJECT', 'PO_PIC_IN_PROGRESS', NULL, 'RETURN_TO_PIC', 1),
        ('PO_MGR_APPROVAL', 'APPROVE', 'PO_GM_APPROVAL', NULL, NULL, 1),
        ('PO_MGR_APPROVAL', 'REJECT', NULL, 'rejected', NULL, 1),
        ('PO_GM_APPROVAL', 'APPROVE', 'MD_APPROVAL', NULL, NULL, 1),
        ('PO_GM_APPROVAL', 'REJECT', NULL, 'rejected', NULL, 1),
        ('MD_APPROVAL', 'APPROVE', 'ACCOUNT_REGISTERED', NULL, NULL, 1),
        ('MD_APPROVAL', 'REJECT', NULL, 'rejected', NULL, 1),
        ('ACCOUNT_REGISTERED', 'APPROVE', NULL, 'completed', NULL, 1),
        ('ACCOUNT_REGISTERED', 'REJECT', NULL, 'rejected', NULL, 1);

    UPDATE workflow_transition wt
    JOIN workflow_definition wd
      ON wd.WORKFLOW_DEFINITION_ID = wt.WORKFLOW_DEFINITION_ID
    SET wt.INUSE = 0,
        wt.UPDATE_BY = 'WORKFLOW_V2_MIGRATION',
        wt.UPDATE_DATE = NOW()
    WHERE wd.WORKFLOW_CODE = 'VENDOR_REGISTRATION'
    ;

    INSERT INTO workflow_transition (
        WORKFLOW_DEFINITION_ID,
        FROM_WORKFLOW_STEP_MASTER_ID,
        ACTION_CODE,
        TO_WORKFLOW_STEP_MASTER_ID,
        TERMINAL_STATE,
        CONDITION_KEY,
        PRIORITY_NO,
        INUSE,
        CREATE_BY,
        UPDATE_BY
    )
    SELECT
        wd.WORKFLOW_DEFINITION_ID,
        from_step.WORKFLOW_STEP_MASTER_ID,
        seed.ACTION_CODE,
        to_step.WORKFLOW_STEP_MASTER_ID,
        seed.TERMINAL_STATE,
        seed.CONDITION_KEY,
        seed.PRIORITY_NO,
        1,
        'WORKFLOW_V2_MIGRATION',
        'WORKFLOW_V2_MIGRATION'
    FROM workflow_definition wd
    JOIN workflow_step_master from_step
      ON from_step.WORKFLOW_DEFINITION_ID = wd.WORKFLOW_DEFINITION_ID
    JOIN tmp_vendor_workflow_transition_seed seed
      ON seed.FROM_STEP_CODE = from_step.STEP_CODE
    LEFT JOIN workflow_step_master to_step
      ON to_step.WORKFLOW_DEFINITION_ID = wd.WORKFLOW_DEFINITION_ID
     AND to_step.STEP_CODE = seed.TO_STEP_CODE
    WHERE wd.WORKFLOW_CODE = 'VENDOR_REGISTRATION'
    ON DUPLICATE KEY UPDATE
        TO_WORKFLOW_STEP_MASTER_ID = VALUES(TO_WORKFLOW_STEP_MASTER_ID),
        TERMINAL_STATE = VALUES(TERMINAL_STATE),
        CONDITION_KEY = VALUES(CONDITION_KEY),
        INUSE = 1,
        UPDATE_BY = 'WORKFLOW_V2_MIGRATION',
        UPDATE_DATE = NOW();

    DROP TEMPORARY TABLE IF EXISTS tmp_vendor_workflow_transition_seed;

    -- ---------------------------------------------------------------------
    -- Relationships remain logical by project convention. IDs and indexes
    -- support JOINs, while orphan audits below replace physical foreign keys.
    -- ---------------------------------------------------------------------

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'request_approval_step'
          AND INDEX_NAME = 'uq_request_step_pair'
    ) THEN
        ALTER TABLE request_approval_step
            ADD UNIQUE KEY uq_request_step_pair
            (REQUEST_REGISTER_VENDOR_ID, REQUEST_APPROVAL_STEP_ID);
    END IF;

    SET workflow_fk_done = FALSE;
    drop_workflow_fk_loop: LOOP
        SET workflow_fk_table = NULL;
        SET workflow_fk_name = NULL;

        SELECT TABLE_NAME, CONSTRAINT_NAME
        INTO workflow_fk_table, workflow_fk_name
        FROM information_schema.TABLE_CONSTRAINTS
        WHERE CONSTRAINT_SCHEMA = DATABASE()
          AND CONSTRAINT_TYPE = 'FOREIGN KEY'
          AND TABLE_NAME IN (
              'm_request_status',
              'workflow_definition',
              'workflow_step_master',
              'workflow_transition',
              'request_register_vendor',
              'request_approval_step',
              'request_approval_log'
          )
        ORDER BY TABLE_NAME, CONSTRAINT_NAME
        LIMIT 1;

        IF workflow_fk_done THEN
            LEAVE drop_workflow_fk_loop;
        END IF;

        SET @drop_workflow_fk_sql = CONCAT(
            'ALTER TABLE `',
            REPLACE(workflow_fk_table, '`', '``'),
            '` DROP FOREIGN KEY `',
            REPLACE(workflow_fk_name, '`', '``'),
            '`'
        );
        PREPARE drop_workflow_fk_statement FROM @drop_workflow_fk_sql;
        EXECUTE drop_workflow_fk_statement;
        DEALLOCATE PREPARE drop_workflow_fk_statement;
    END LOOP;
END$$

DELIMITER ;

CALL migrate_vendor_workflow_v2();
DROP PROCEDURE IF EXISTS migrate_vendor_workflow_v2;

-- -------------------------------------------------------------------------
-- Postflight report. Review all result sets before deploying the new API.
-- -------------------------------------------------------------------------
SELECT
    wd.WORKFLOW_CODE,
    wd.VERSION_NO,
    wd.DEFINITION_STATUS,
    from_step.STEP_CODE AS FROM_STEP,
    wt.ACTION_CODE,
    to_step.STEP_CODE AS TO_STEP,
    wt.TERMINAL_STATE,
    wt.CONDITION_KEY,
    wt.INUSE
FROM workflow_definition wd
LEFT JOIN workflow_transition wt
  ON wt.WORKFLOW_DEFINITION_ID = wd.WORKFLOW_DEFINITION_ID
LEFT JOIN workflow_step_master from_step
  ON from_step.WORKFLOW_STEP_MASTER_ID = wt.FROM_WORKFLOW_STEP_MASTER_ID
LEFT JOIN workflow_step_master to_step
  ON to_step.WORKFLOW_STEP_MASTER_ID = wt.TO_WORKFLOW_STEP_MASTER_ID
WHERE wd.WORKFLOW_CODE = 'VENDOR_REGISTRATION'
ORDER BY wd.VERSION_NO, from_step.DEFAULT_STEP_ORDER, wt.ACTION_CODE;

SELECT
    rr.REQUEST_REGISTER_VENDOR_ID,
    rr.REQUEST_NUMBER,
    rr.WORKFLOW_DEFINITION_ID,
    rr.REQUEST_STATE,
    rr.CURRENT_REQUEST_APPROVAL_STEP_ID,
    rr.CURRENT_M_REQUEST_STATUS_ID,
    rr.LOCK_VERSION,
    active_task.STEP_STATUS AS CURRENT_TASK_STATUS,
    active_master.STEP_CODE AS CURRENT_STEP_CODE,
    active_status.STATUS_CODE AS CURRENT_STATUS_CODE
FROM request_register_vendor rr
LEFT JOIN request_approval_step active_task
  ON active_task.REQUEST_REGISTER_VENDOR_ID = rr.REQUEST_REGISTER_VENDOR_ID
 AND active_task.REQUEST_APPROVAL_STEP_ID = rr.CURRENT_REQUEST_APPROVAL_STEP_ID
LEFT JOIN workflow_step_master active_master
  ON active_master.WORKFLOW_STEP_MASTER_ID = active_task.WORKFLOW_STEP_MASTER_ID
LEFT JOIN m_request_status active_status
  ON active_status.M_REQUEST_STATUS_ID = active_master.M_REQUEST_STATUS_ID
ORDER BY rr.REQUEST_REGISTER_VENDOR_ID;

SELECT 'unexpected_physical_foreign_keys' AS CHECK_NAME, COUNT(*) AS ISSUE_COUNT
FROM information_schema.KEY_COLUMN_USAGE
WHERE CONSTRAINT_SCHEMA = DATABASE()
  AND REFERENCED_TABLE_NAME IS NOT NULL
  AND TABLE_NAME IN (
      'm_request_status',
      'workflow_definition',
      'workflow_step_master',
      'workflow_transition',
      'request_register_vendor',
      'request_approval_step',
      'request_approval_log'
  )
UNION ALL
SELECT 'requests_without_version', COUNT(*)
FROM request_register_vendor
WHERE WORKFLOW_DEFINITION_ID IS NULL
UNION ALL
SELECT 'multiple_active_tasks', COUNT(*)
FROM (
    SELECT REQUEST_REGISTER_VENDOR_ID
    FROM request_approval_step
    WHERE INUSE = 1 AND STEP_STATUS = 'in_progress'
    GROUP BY REQUEST_REGISTER_VENDOR_ID
    HAVING COUNT(*) > 1
) duplicated
UNION ALL
SELECT 'events_without_step_identity', COUNT(*)
FROM request_approval_log
WHERE WORKFLOW_STEP_MASTER_ID IS NULL
UNION ALL
SELECT 'active_transitions_to_inactive_steps', COUNT(*)
FROM workflow_transition wt
JOIN workflow_step_master target
  ON target.WORKFLOW_STEP_MASTER_ID = wt.TO_WORKFLOW_STEP_MASTER_ID
WHERE wt.INUSE = 1
  AND target.INUSE = 0;
