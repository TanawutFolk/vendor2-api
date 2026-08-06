-- Vendor workflow v3: master IDs for task status and approval groups
-- Target: _test_vendor_tanawut_2026_07_14 (run workflow v2 migration first)
-- Project convention: logical IDs + SQL JOINs, without physical foreign keys.
-- All permanent tables include the standard six audit columns.
-- Deployment: stop writes, run this file, then deploy the matching API build.
-- This migration drops request_approval_step.STEP_STATUS and GROUP_CODE after
-- successful backfill. Pre-change copies are kept in zz_backup_workflow_v3_*.

USE `_test_vendor_tanawut_2026_07_14`;

CREATE TABLE IF NOT EXISTS m_approval_step_status (
    M_APPROVAL_STEP_STATUS_ID TINYINT UNSIGNED NOT NULL,
    STATUS_CODE VARCHAR(32) NOT NULL,
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
    PRIMARY KEY (M_APPROVAL_STEP_STATUS_ID),
    UNIQUE KEY uq_approval_step_status_code (STATUS_CODE),
    KEY idx_approval_step_status_active (INUSE, SORT_ORDER)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS approval_group (
    APPROVAL_GROUP_ID SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    GROUP_CODE VARCHAR(64) NOT NULL,
    GROUP_NAME VARCHAR(100) NOT NULL,
    CREATE_BY VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    CREATE_DATE DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UPDATE_BY VARCHAR(50) NULL,
    UPDATE_DATE DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INUSE TINYINT(1) NOT NULL DEFAULT 1,
    DESCRIPTION VARCHAR(100) NULL,
    PRIMARY KEY (APPROVAL_GROUP_ID),
    UNIQUE KEY uq_approval_group_code (GROUP_CODE),
    KEY idx_approval_group_active (INUSE, GROUP_NAME)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS approval_group_member (
    APPROVAL_GROUP_MEMBER_ID INT UNSIGNED NOT NULL AUTO_INCREMENT,
    APPROVAL_GROUP_ID SMALLINT UNSIGNED NOT NULL,
    EMPCODE VARCHAR(10) NOT NULL,
    EMPNAME VARCHAR(255) NULL,
    EMPEMAIL VARCHAR(155) NULL,
    PRIORITY_NO SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    IS_PRIMARY TINYINT(1) NOT NULL DEFAULT 0,
    CREATE_BY VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    CREATE_DATE DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UPDATE_BY VARCHAR(50) NULL,
    UPDATE_DATE DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INUSE TINYINT(1) NOT NULL DEFAULT 1,
    DESCRIPTION VARCHAR(100) NULL,
    PRIMARY KEY (APPROVAL_GROUP_MEMBER_ID),
    UNIQUE KEY uq_approval_group_member (APPROVAL_GROUP_ID, EMPCODE),
    KEY idx_approval_group_member_emp (EMPCODE, INUSE),
    KEY idx_approval_group_member_queue (APPROVAL_GROUP_ID, INUSE, IS_PRIMARY, PRIORITY_NO)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO m_approval_step_status (
    M_APPROVAL_STEP_STATUS_ID,
    STATUS_CODE,
    STATUS_LABEL_EN,
    STATUS_LABEL_TH,
    IS_TERMINAL,
    SORT_ORDER,
    CREATE_BY,
    UPDATE_BY,
    INUSE,
    DESCRIPTION
)
VALUES
    (1, 'PENDING', 'Pending', 'รอดำเนินการ', 0, 1, 'WORKFLOW_V3_MIGRATION', 'WORKFLOW_V3_MIGRATION', 1, 'Task has not started'),
    (2, 'IN_PROGRESS', 'In Progress', 'กำลังดำเนินการ', 0, 2, 'WORKFLOW_V3_MIGRATION', 'WORKFLOW_V3_MIGRATION', 1, 'Current active task'),
    (3, 'APPROVED', 'Approved', 'อนุมัติแล้ว', 1, 3, 'WORKFLOW_V3_MIGRATION', 'WORKFLOW_V3_MIGRATION', 1, 'Task approved'),
    (4, 'REJECTED', 'Rejected', 'ไม่อนุมัติ', 1, 4, 'WORKFLOW_V3_MIGRATION', 'WORKFLOW_V3_MIGRATION', 1, 'Task rejected'),
    (5, 'SKIPPED', 'Skipped', 'ข้ามขั้นตอน', 1, 5, 'WORKFLOW_V3_MIGRATION', 'WORKFLOW_V3_MIGRATION', 1, 'Task skipped')
ON DUPLICATE KEY UPDATE
    STATUS_LABEL_EN = VALUES(STATUS_LABEL_EN),
    STATUS_LABEL_TH = VALUES(STATUS_LABEL_TH),
    IS_TERMINAL = VALUES(IS_TERMINAL),
    SORT_ORDER = VALUES(SORT_ORDER),
    UPDATE_BY = 'WORKFLOW_V3_MIGRATION',
    INUSE = 1,
    DESCRIPTION = VALUES(DESCRIPTION);

DELIMITER $$

DROP PROCEDURE IF EXISTS migrate_vendor_workflow_v3_master_ids$$
CREATE PROCEDURE migrate_vendor_workflow_v3_master_ids()
workflow_v3: BEGIN
    DECLARE missing_status_ids INT DEFAULT 0;
    DECLARE missing_group_ids INT DEFAULT 0;
    DECLARE legacy_check_name VARCHAR(64) DEFAULT NULL;
    DECLARE legacy_task_column_count INT DEFAULT 0;
    DECLARE physical_fk_table VARCHAR(64) DEFAULT NULL;
    DECLARE physical_fk_name VARCHAR(64) DEFAULT NULL;

    SELECT COUNT(*) INTO legacy_task_column_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'request_approval_step'
      AND COLUMN_NAME IN ('STEP_STATUS', 'GROUP_CODE');

    IF legacy_task_column_count = 0 THEN
        LEAVE workflow_v3;
    ELSEIF legacy_task_column_count <> 2 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Partial v3 schema found: STEP_STATUS and GROUP_CODE must both exist or both be absent';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'zz_backup_workflow_v3_task_20260713'
    ) THEN
        CREATE TABLE zz_backup_workflow_v3_task_20260713 LIKE request_approval_step;
    END IF;

    IF EXISTS (SELECT 1 FROM request_approval_step LIMIT 1)
       AND NOT EXISTS (SELECT 1 FROM zz_backup_workflow_v3_task_20260713 LIMIT 1) THEN
        SELECT GROUP_CONCAT(
            CONCAT('`', REPLACE(COLUMN_NAME, '`', '``'), '`')
            ORDER BY ORDINAL_POSITION
            SEPARATOR ', '
        )
        INTO @workflow_v3_task_backup_columns
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'request_approval_step'
          AND UPPER(EXTRA) NOT LIKE '%GENERATED%';

        SET @workflow_v3_task_backup_sql = CONCAT(
            'INSERT INTO zz_backup_workflow_v3_task_20260713 (',
            @workflow_v3_task_backup_columns,
            ') SELECT ',
            @workflow_v3_task_backup_columns,
            ' FROM request_approval_step'
        );
        PREPARE workflow_v3_task_backup_stmt FROM @workflow_v3_task_backup_sql;
        EXECUTE workflow_v3_task_backup_stmt;
        DEALLOCATE PREPARE workflow_v3_task_backup_stmt;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'zz_backup_workflow_v3_step_master_20260713'
    ) THEN
        CREATE TABLE zz_backup_workflow_v3_step_master_20260713 LIKE workflow_step_master;
        INSERT INTO zz_backup_workflow_v3_step_master_20260713
        SELECT * FROM workflow_step_master;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'zz_backup_workflow_v3_assignees_20260713'
    ) THEN
        CREATE TABLE zz_backup_workflow_v3_assignees_20260713 LIKE assignees_to;
        INSERT INTO zz_backup_workflow_v3_assignees_20260713
        SELECT * FROM assignees_to;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'request_approval_step'
          AND COLUMN_NAME = 'M_APPROVAL_STEP_STATUS_ID'
    ) THEN
        ALTER TABLE request_approval_step
            ADD COLUMN M_APPROVAL_STEP_STATUS_ID TINYINT UNSIGNED NULL
            AFTER STEP_STATUS;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'request_approval_step'
          AND COLUMN_NAME = 'APPROVAL_GROUP_ID'
    ) THEN
        ALTER TABLE request_approval_step
            ADD COLUMN APPROVAL_GROUP_ID SMALLINT UNSIGNED NULL
            AFTER GROUP_CODE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'request_approval_step'
          AND COLUMN_NAME = 'APPROVAL_GROUP_MEMBER_ID'
    ) THEN
        ALTER TABLE request_approval_step
            ADD COLUMN APPROVAL_GROUP_MEMBER_ID INT UNSIGNED NULL
            AFTER APPROVER_EMPCODE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'workflow_step_master'
          AND COLUMN_NAME = 'DEFAULT_APPROVAL_GROUP_ID_LOCAL'
    ) THEN
        ALTER TABLE workflow_step_master
            ADD COLUMN DEFAULT_APPROVAL_GROUP_ID_LOCAL SMALLINT UNSIGNED NULL
            AFTER DEFAULT_GROUP_CODE_OVERSEA;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'workflow_step_master'
          AND COLUMN_NAME = 'DEFAULT_APPROVAL_GROUP_ID_OVERSEA'
    ) THEN
        ALTER TABLE workflow_step_master
            ADD COLUMN DEFAULT_APPROVAL_GROUP_ID_OVERSEA SMALLINT UNSIGNED NULL
            AFTER DEFAULT_APPROVAL_GROUP_ID_LOCAL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'assignees_to'
          AND COLUMN_NAME = 'APPROVAL_GROUP_ID'
    ) THEN
        ALTER TABLE assignees_to
            ADD COLUMN APPROVAL_GROUP_ID SMALLINT UNSIGNED NULL
            AFTER ASSIGNEES_TO_ID;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'assignees_to'
          AND COLUMN_NAME = 'APPROVAL_GROUP_MEMBER_ID'
    ) THEN
        ALTER TABLE assignees_to
            ADD COLUMN APPROVAL_GROUP_MEMBER_ID INT UNSIGNED NULL
            AFTER APPROVAL_GROUP_ID;
    END IF;

    INSERT INTO approval_group (
        GROUP_CODE,
        GROUP_NAME,
        CREATE_BY,
        UPDATE_BY,
        INUSE,
        DESCRIPTION
    )
    SELECT
        seed.GROUP_CODE,
        COALESCE(MAX(seed.GROUP_NAME), seed.GROUP_CODE),
        'WORKFLOW_V3_MIGRATION',
        'WORKFLOW_V3_MIGRATION',
        1,
        LEFT(CONCAT('Approval group: ', seed.GROUP_CODE), 100)
    FROM (
        SELECT
            REGEXP_REPLACE(UPPER(TRIM(NULLIF(GROUP_CODE, ''))), '[^A-Z0-9]+', '_') AS GROUP_CODE,
            NULLIF(TRIM(GROUP_NAME), '') AS GROUP_NAME
        FROM assignees_to
        WHERE NULLIF(TRIM(GROUP_CODE), '') IS NOT NULL

        UNION ALL

        SELECT
            REGEXP_REPLACE(UPPER(TRIM(NULLIF(GROUP_CODE, ''))), '[^A-Z0-9]+', '_') AS GROUP_CODE,
            NULL AS GROUP_NAME
        FROM request_approval_step
        WHERE NULLIF(TRIM(GROUP_CODE), '') IS NOT NULL

        UNION ALL

        SELECT
            REGEXP_REPLACE(UPPER(TRIM(NULLIF(DEFAULT_GROUP_CODE_LOCAL, ''))), '[^A-Z0-9]+', '_') AS GROUP_CODE,
            NULL AS GROUP_NAME
        FROM workflow_step_master
        WHERE NULLIF(TRIM(DEFAULT_GROUP_CODE_LOCAL), '') IS NOT NULL

        UNION ALL

        SELECT
            REGEXP_REPLACE(UPPER(TRIM(NULLIF(DEFAULT_GROUP_CODE_OVERSEA, ''))), '[^A-Z0-9]+', '_') AS GROUP_CODE,
            NULL AS GROUP_NAME
        FROM workflow_step_master
        WHERE NULLIF(TRIM(DEFAULT_GROUP_CODE_OVERSEA), '') IS NOT NULL
    ) seed
    WHERE seed.GROUP_CODE IS NOT NULL
    GROUP BY seed.GROUP_CODE
    ON DUPLICATE KEY UPDATE
        GROUP_NAME = COALESCE(NULLIF(VALUES(GROUP_NAME), ''), approval_group.GROUP_NAME),
        UPDATE_BY = 'WORKFLOW_V3_MIGRATION',
        INUSE = 1;

    INSERT INTO approval_group_member (
        APPROVAL_GROUP_ID,
        EMPCODE,
        EMPNAME,
        EMPEMAIL,
        PRIORITY_NO,
        IS_PRIMARY,
        CREATE_BY,
        UPDATE_BY,
        INUSE,
        DESCRIPTION
    )
    SELECT
        ag.APPROVAL_GROUP_ID,
        a.EMPCODE,
        a.EMPNAME,
        a.EMPEMAIL,
        1,
        0,
        COALESCE(NULLIF(a.CREATE_BY, ''), 'WORKFLOW_V3_MIGRATION'),
        'WORKFLOW_V3_MIGRATION',
        a.INUSE,
        LEFT(COALESCE(NULLIF(a.DESCRIPTION, ''), CONCAT(ag.GROUP_NAME, ': ', a.EMPNAME)), 100)
    FROM assignees_to a
    JOIN approval_group ag
      ON ag.GROUP_CODE = REGEXP_REPLACE(UPPER(TRIM(a.GROUP_CODE)), '[^A-Z0-9]+', '_')
    WHERE NULLIF(TRIM(a.EMPCODE), '') IS NOT NULL
    ON DUPLICATE KEY UPDATE
        EMPNAME = VALUES(EMPNAME),
        EMPEMAIL = VALUES(EMPEMAIL),
        UPDATE_BY = 'WORKFLOW_V3_MIGRATION',
        INUSE = VALUES(INUSE),
        DESCRIPTION = VALUES(DESCRIPTION);

    UPDATE approval_group_member member
    LEFT JOIN approval_group_member earlier_member
      ON earlier_member.APPROVAL_GROUP_ID = member.APPROVAL_GROUP_ID
     AND earlier_member.INUSE = 1
     AND earlier_member.APPROVAL_GROUP_MEMBER_ID < member.APPROVAL_GROUP_MEMBER_ID
    SET member.IS_PRIMARY = CASE
            WHEN member.INUSE = 1
             AND earlier_member.APPROVAL_GROUP_MEMBER_ID IS NULL THEN 1
            ELSE 0
        END,
        member.UPDATE_BY = 'WORKFLOW_V3_MIGRATION';

    UPDATE assignees_to a
    JOIN approval_group ag
      ON ag.GROUP_CODE = REGEXP_REPLACE(UPPER(TRIM(a.GROUP_CODE)), '[^A-Z0-9]+', '_')
    JOIN approval_group_member agm
      ON agm.APPROVAL_GROUP_ID = ag.APPROVAL_GROUP_ID
     AND agm.EMPCODE = a.EMPCODE
    SET a.APPROVAL_GROUP_ID = ag.APPROVAL_GROUP_ID,
        a.APPROVAL_GROUP_MEMBER_ID = agm.APPROVAL_GROUP_MEMBER_ID,
        a.UPDATE_BY = 'WORKFLOW_V3_MIGRATION';

    UPDATE workflow_step_master wsm
    LEFT JOIN approval_group local_group
      ON local_group.GROUP_CODE = REGEXP_REPLACE(UPPER(TRIM(wsm.DEFAULT_GROUP_CODE_LOCAL)), '[^A-Z0-9]+', '_')
    LEFT JOIN approval_group oversea_group
      ON oversea_group.GROUP_CODE = REGEXP_REPLACE(UPPER(TRIM(wsm.DEFAULT_GROUP_CODE_OVERSEA)), '[^A-Z0-9]+', '_')
    SET wsm.DEFAULT_APPROVAL_GROUP_ID_LOCAL = local_group.APPROVAL_GROUP_ID,
        wsm.DEFAULT_APPROVAL_GROUP_ID_OVERSEA = oversea_group.APPROVAL_GROUP_ID,
        wsm.UPDATE_BY = 'WORKFLOW_V3_MIGRATION';

    UPDATE request_approval_step ras
    JOIN m_approval_step_status status_master
      ON status_master.STATUS_CODE = UPPER(TRIM(ras.STEP_STATUS))
    LEFT JOIN approval_group ag
      ON ag.GROUP_CODE = REGEXP_REPLACE(UPPER(TRIM(ras.GROUP_CODE)), '[^A-Z0-9]+', '_')
    LEFT JOIN approval_group_member agm
      ON agm.APPROVAL_GROUP_ID = ag.APPROVAL_GROUP_ID
     AND agm.EMPCODE = ras.APPROVER_EMPCODE
    SET ras.M_APPROVAL_STEP_STATUS_ID = status_master.M_APPROVAL_STEP_STATUS_ID,
        ras.APPROVAL_GROUP_ID = ag.APPROVAL_GROUP_ID,
        ras.APPROVAL_GROUP_MEMBER_ID = agm.APPROVAL_GROUP_MEMBER_ID,
        ras.UPDATE_BY = 'WORKFLOW_V3_MIGRATION';

    SELECT COUNT(*) INTO missing_status_ids
    FROM request_approval_step
    WHERE M_APPROVAL_STEP_STATUS_ID IS NULL;

    IF missing_status_ids > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Backfill failed: request approval tasks without status IDs remain';
    END IF;

    SELECT COUNT(*) INTO missing_group_ids
    FROM request_approval_step
    WHERE NULLIF(TRIM(GROUP_CODE), '') IS NOT NULL
      AND APPROVAL_GROUP_ID IS NULL;

    IF missing_group_ids > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Backfill failed: request approval tasks without group IDs remain';
    END IF;

    ALTER TABLE request_approval_step
        MODIFY COLUMN M_APPROVAL_STEP_STATUS_ID TINYINT UNSIGNED NOT NULL;

    IF EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'request_approval_step'
          AND INDEX_NAME = 'uq_request_single_active_task'
    ) THEN
        ALTER TABLE request_approval_step
            DROP INDEX uq_request_single_active_task;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'request_approval_step'
          AND COLUMN_NAME = 'ACTIVE_REQUEST_ID'
    ) THEN
        ALTER TABLE request_approval_step
            DROP COLUMN ACTIVE_REQUEST_ID;
    END IF;

    ALTER TABLE request_approval_step
        ADD COLUMN ACTIVE_REQUEST_ID INT
        GENERATED ALWAYS AS (
            CASE
                WHEN INUSE = 1 AND M_APPROVAL_STEP_STATUS_ID = 2
                    THEN REQUEST_REGISTER_VENDOR_ID
                ELSE NULL
            END
        ) STORED;

    ALTER TABLE request_approval_step
        ADD UNIQUE KEY uq_request_single_active_task (ACTIVE_REQUEST_ID);

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'request_approval_step'
          AND INDEX_NAME = 'idx_task_status_id'
    ) THEN
        ALTER TABLE request_approval_step
            ADD KEY idx_task_status_id (M_APPROVAL_STEP_STATUS_ID, INUSE);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'request_approval_step'
          AND INDEX_NAME = 'idx_task_group_status_id'
    ) THEN
        ALTER TABLE request_approval_step
            ADD KEY idx_task_group_status_id
            (APPROVAL_GROUP_ID, M_APPROVAL_STEP_STATUS_ID, INUSE);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'request_approval_step'
          AND INDEX_NAME = 'idx_task_member_status_id'
    ) THEN
        ALTER TABLE request_approval_step
            ADD KEY idx_task_member_status_id
            (APPROVAL_GROUP_MEMBER_ID, M_APPROVAL_STEP_STATUS_ID, INUSE);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'workflow_step_master'
          AND INDEX_NAME = 'idx_wsm_default_group_local'
    ) THEN
        ALTER TABLE workflow_step_master
            ADD KEY idx_wsm_default_group_local
            (DEFAULT_APPROVAL_GROUP_ID_LOCAL, INUSE);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'workflow_step_master'
          AND INDEX_NAME = 'idx_wsm_default_group_oversea'
    ) THEN
        ALTER TABLE workflow_step_master
            ADD KEY idx_wsm_default_group_oversea
            (DEFAULT_APPROVAL_GROUP_ID_OVERSEA, INUSE);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'assignees_to'
          AND INDEX_NAME = 'idx_assignees_group_id'
    ) THEN
        ALTER TABLE assignees_to
            ADD KEY idx_assignees_group_id (APPROVAL_GROUP_ID, INUSE, EMPCODE);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'assignees_to'
          AND INDEX_NAME = 'idx_assignees_group_member_id'
    ) THEN
        ALTER TABLE assignees_to
            ADD KEY idx_assignees_group_member_id (APPROVAL_GROUP_MEMBER_ID, INUSE);
    END IF;

    -- Relationships use logical IDs only. Keep the supporting indexes, but
    -- remove physical FK constraints left by older schema versions.
    drop_workflow_physical_fks: LOOP
        SET physical_fk_table = NULL;
        SET physical_fk_name = NULL;

        SELECT tc.TABLE_NAME, tc.CONSTRAINT_NAME
        INTO physical_fk_table, physical_fk_name
        FROM information_schema.TABLE_CONSTRAINTS tc
        WHERE tc.CONSTRAINT_SCHEMA = DATABASE()
          AND tc.CONSTRAINT_TYPE = 'FOREIGN KEY'
          AND tc.TABLE_NAME IN (
              'm_request_status',
              'workflow_definition',
              'workflow_step_master',
              'workflow_transition',
              'request_register_vendor',
              'request_approval_step',
              'request_approval_log',
              'assignees_to',
              'm_approval_step_status',
              'approval_group',
              'approval_group_member'
          )
        ORDER BY tc.TABLE_NAME, tc.CONSTRAINT_NAME
        LIMIT 1;

        IF physical_fk_table IS NULL THEN
            LEAVE drop_workflow_physical_fks;
        END IF;

        SET @drop_workflow_fk_sql = CONCAT(
            'ALTER TABLE `',
            REPLACE(physical_fk_table, '`', '``'),
            '` DROP FOREIGN KEY `',
            REPLACE(physical_fk_name, '`', '``'),
            '`'
        );
        PREPARE drop_workflow_fk_stmt FROM @drop_workflow_fk_sql;
        EXECUTE drop_workflow_fk_stmt;
        DEALLOCATE PREPARE drop_workflow_fk_stmt;
    END LOOP;

    -- ID columns are now authoritative. Remove any old CHECK constraints that
    -- reference the two legacy text columns before dropping those columns.
    drop_legacy_task_checks: LOOP
        SET legacy_check_name = NULL;

        SELECT MIN(tc.CONSTRAINT_NAME)
        INTO legacy_check_name
        FROM information_schema.TABLE_CONSTRAINTS tc
        JOIN information_schema.CHECK_CONSTRAINTS cc
          ON cc.CONSTRAINT_SCHEMA = tc.CONSTRAINT_SCHEMA
         AND cc.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
        WHERE tc.CONSTRAINT_SCHEMA = DATABASE()
          AND tc.TABLE_NAME = 'request_approval_step'
          AND tc.CONSTRAINT_TYPE = 'CHECK'
          AND (
              UPPER(cc.CHECK_CLAUSE) LIKE '%STEP_STATUS%'
              OR UPPER(cc.CHECK_CLAUSE) LIKE '%GROUP_CODE%'
          );

        IF legacy_check_name IS NULL THEN
            LEAVE drop_legacy_task_checks;
        END IF;

        SET @drop_legacy_check_sql = CONCAT(
            'ALTER TABLE request_approval_step DROP CHECK `',
            REPLACE(legacy_check_name, '`', '``'),
            '`'
        );
        PREPARE drop_legacy_check_stmt FROM @drop_legacy_check_sql;
        EXECUTE drop_legacy_check_stmt;
        DEALLOCATE PREPARE drop_legacy_check_stmt;
    END LOOP;

    IF EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'request_approval_step'
          AND COLUMN_NAME = 'STEP_STATUS'
    ) THEN
        ALTER TABLE request_approval_step
            DROP COLUMN STEP_STATUS;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'request_approval_step'
          AND COLUMN_NAME = 'GROUP_CODE'
    ) THEN
        ALTER TABLE request_approval_step
            DROP COLUMN GROUP_CODE;
    END IF;
END workflow_v3$$

DELIMITER ;

CALL migrate_vendor_workflow_v3_master_ids();
DROP PROCEDURE IF EXISTS migrate_vendor_workflow_v3_master_ids;

SELECT
    status_master.M_APPROVAL_STEP_STATUS_ID,
    status_master.STATUS_CODE,
    status_master.STATUS_LABEL_EN,
    status_master.STATUS_LABEL_TH,
    status_master.IS_TERMINAL,
    status_master.INUSE
FROM m_approval_step_status status_master
ORDER BY status_master.SORT_ORDER;

SELECT
    ag.APPROVAL_GROUP_ID,
    ag.GROUP_CODE,
    ag.GROUP_NAME,
    COUNT(agm.APPROVAL_GROUP_MEMBER_ID) AS MEMBER_COUNT,
    ag.INUSE
FROM approval_group ag
LEFT JOIN approval_group_member agm
  ON agm.APPROVAL_GROUP_ID = ag.APPROVAL_GROUP_ID
 AND agm.INUSE = 1
GROUP BY
    ag.APPROVAL_GROUP_ID,
    ag.GROUP_CODE,
    ag.GROUP_NAME,
    ag.INUSE
ORDER BY ag.GROUP_CODE;

SELECT 'tasks_without_status_id' AS CHECK_NAME, COUNT(*) AS ISSUE_COUNT
FROM request_approval_step
WHERE M_APPROVAL_STEP_STATUS_ID IS NULL
UNION ALL
SELECT 'task_status_orphan', COUNT(*)
FROM request_approval_step ras
LEFT JOIN m_approval_step_status status_master
  ON status_master.M_APPROVAL_STEP_STATUS_ID = ras.M_APPROVAL_STEP_STATUS_ID
WHERE status_master.M_APPROVAL_STEP_STATUS_ID IS NULL
UNION ALL
SELECT 'task_group_orphan', COUNT(*)
FROM request_approval_step ras
LEFT JOIN approval_group ag
  ON ag.APPROVAL_GROUP_ID = ras.APPROVAL_GROUP_ID
WHERE ras.APPROVAL_GROUP_ID IS NOT NULL
  AND ag.APPROVAL_GROUP_ID IS NULL
UNION ALL
SELECT 'task_member_group_mismatch', COUNT(*)
FROM request_approval_step ras
JOIN approval_group_member agm
  ON agm.APPROVAL_GROUP_MEMBER_ID = ras.APPROVAL_GROUP_MEMBER_ID
WHERE ras.APPROVAL_GROUP_ID IS NULL
   OR ras.APPROVAL_GROUP_ID <> agm.APPROVAL_GROUP_ID
UNION ALL
SELECT 'workflow_local_group_without_id', COUNT(*)
FROM workflow_step_master
WHERE NULLIF(TRIM(DEFAULT_GROUP_CODE_LOCAL), '') IS NOT NULL
  AND DEFAULT_APPROVAL_GROUP_ID_LOCAL IS NULL
UNION ALL
SELECT 'workflow_oversea_group_without_id', COUNT(*)
FROM workflow_step_master
WHERE NULLIF(TRIM(DEFAULT_GROUP_CODE_OVERSEA), '') IS NOT NULL
  AND DEFAULT_APPROVAL_GROUP_ID_OVERSEA IS NULL
UNION ALL
SELECT 'legacy_task_text_columns_remaining', COUNT(*)
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'request_approval_step'
  AND COLUMN_NAME IN ('STEP_STATUS', 'GROUP_CODE')
UNION ALL
SELECT 'unexpected_physical_foreign_keys', COUNT(*)
FROM information_schema.KEY_COLUMN_USAGE
WHERE CONSTRAINT_SCHEMA = DATABASE()
  AND REFERENCED_TABLE_NAME IS NOT NULL
  AND TABLE_NAME IN (
      'm_approval_step_status',
      'approval_group',
      'approval_group_member',
      'request_approval_step',
      'workflow_step_master',
      'assignees_to'
  );
