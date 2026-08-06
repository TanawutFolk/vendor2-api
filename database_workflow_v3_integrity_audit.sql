-- Vendor workflow v3: read-only integrity audit
-- Run after database_workflow_v3_master_ids_migration.sql.

USE `_test_vendor_tanawut_2026_07_14`;

-- 1) Every new master table must end with the standard audit columns.
WITH expected_audit_columns AS (
    SELECT 1 AS EXPECTED_POSITION, 'CREATE_BY' AS COLUMN_NAME, 'varchar' AS DATA_TYPE, 50 AS MAX_LENGTH
    UNION ALL SELECT 2, 'CREATE_DATE', 'datetime', NULL
    UNION ALL SELECT 3, 'UPDATE_BY', 'varchar', 50
    UNION ALL SELECT 4, 'UPDATE_DATE', 'datetime', NULL
    UNION ALL SELECT 5, 'INUSE', 'tinyint', NULL
    UNION ALL SELECT 6, 'DESCRIPTION', 'varchar', 100
),
workflow_tables AS (
    SELECT 'm_approval_step_status' AS TABLE_NAME
    UNION ALL SELECT 'approval_group'
    UNION ALL SELECT 'approval_group_member'
),
table_last_domain_position AS (
    SELECT
        t.TABLE_NAME,
        MAX(c.ORDINAL_POSITION) - 6 AS LAST_DOMAIN_POSITION
    FROM workflow_tables t
    JOIN information_schema.COLUMNS c
      ON c.TABLE_SCHEMA = DATABASE()
     AND c.TABLE_NAME = t.TABLE_NAME
    GROUP BY t.TABLE_NAME
)
SELECT
    t.TABLE_NAME,
    e.COLUMN_NAME,
    CASE
        WHEN c.COLUMN_NAME IS NULL THEN 'MISSING'
        WHEN c.DATA_TYPE <> e.DATA_TYPE THEN CONCAT('WRONG_TYPE:', c.DATA_TYPE)
        WHEN e.MAX_LENGTH IS NOT NULL
         AND c.CHARACTER_MAXIMUM_LENGTH <> e.MAX_LENGTH
            THEN CONCAT('WRONG_LENGTH:', c.CHARACTER_MAXIMUM_LENGTH)
        WHEN c.ORDINAL_POSITION <> p.LAST_DOMAIN_POSITION + e.EXPECTED_POSITION
            THEN CONCAT('WRONG_POSITION:', c.ORDINAL_POSITION)
        ELSE 'OK'
    END AS AUDIT_COLUMN_CHECK
FROM workflow_tables t
CROSS JOIN expected_audit_columns e
LEFT JOIN table_last_domain_position p
  ON p.TABLE_NAME = t.TABLE_NAME
LEFT JOIN information_schema.COLUMNS c
  ON c.TABLE_SCHEMA = DATABASE()
 AND c.TABLE_NAME = t.TABLE_NAME
 AND c.COLUMN_NAME = e.COLUMN_NAME
ORDER BY t.TABLE_NAME, e.EXPECTED_POSITION;

-- 2) Logical relationship checks (there are deliberately no physical FKs).
SELECT 'task_status_orphan' AS CHECK_NAME, COUNT(*) AS ISSUE_COUNT
FROM request_approval_step ras
LEFT JOIN m_approval_step_status status_master
  ON status_master.M_APPROVAL_STEP_STATUS_ID = ras.M_APPROVAL_STEP_STATUS_ID
WHERE ras.M_APPROVAL_STEP_STATUS_ID IS NOT NULL
  AND status_master.M_APPROVAL_STEP_STATUS_ID IS NULL
UNION ALL
SELECT 'task_group_orphan', COUNT(*)
FROM request_approval_step ras
LEFT JOIN approval_group ag
  ON ag.APPROVAL_GROUP_ID = ras.APPROVAL_GROUP_ID
WHERE ras.APPROVAL_GROUP_ID IS NOT NULL
  AND ag.APPROVAL_GROUP_ID IS NULL
UNION ALL
SELECT 'task_group_member_orphan', COUNT(*)
FROM request_approval_step ras
LEFT JOIN approval_group_member agm
  ON agm.APPROVAL_GROUP_MEMBER_ID = ras.APPROVAL_GROUP_MEMBER_ID
WHERE ras.APPROVAL_GROUP_MEMBER_ID IS NOT NULL
  AND agm.APPROVAL_GROUP_MEMBER_ID IS NULL
UNION ALL
SELECT 'group_member_group_orphan', COUNT(*)
FROM approval_group_member agm
LEFT JOIN approval_group ag
  ON ag.APPROVAL_GROUP_ID = agm.APPROVAL_GROUP_ID
WHERE ag.APPROVAL_GROUP_ID IS NULL
UNION ALL
SELECT 'workflow_local_group_orphan', COUNT(*)
FROM workflow_step_master wsm
LEFT JOIN approval_group ag
  ON ag.APPROVAL_GROUP_ID = wsm.DEFAULT_APPROVAL_GROUP_ID_LOCAL
WHERE wsm.DEFAULT_APPROVAL_GROUP_ID_LOCAL IS NOT NULL
  AND ag.APPROVAL_GROUP_ID IS NULL
UNION ALL
SELECT 'workflow_oversea_group_orphan', COUNT(*)
FROM workflow_step_master wsm
LEFT JOIN approval_group ag
  ON ag.APPROVAL_GROUP_ID = wsm.DEFAULT_APPROVAL_GROUP_ID_OVERSEA
WHERE wsm.DEFAULT_APPROVAL_GROUP_ID_OVERSEA IS NOT NULL
  AND ag.APPROVAL_GROUP_ID IS NULL;

-- 3) Runtime tasks must contain IDs only.
SELECT 'legacy_task_text_columns_remaining' AS CHECK_NAME, COUNT(*) AS ISSUE_COUNT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'request_approval_step'
  AND COLUMN_NAME IN ('STEP_STATUS', 'GROUP_CODE')
UNION ALL
SELECT 'task_member_group_mismatch', COUNT(*)
FROM request_approval_step ras
JOIN approval_group_member agm
  ON agm.APPROVAL_GROUP_MEMBER_ID = ras.APPROVAL_GROUP_MEMBER_ID
WHERE ras.APPROVAL_GROUP_ID IS NULL
   OR ras.APPROVAL_GROUP_ID <> agm.APPROVAL_GROUP_ID
UNION ALL
SELECT 'workflow_local_group_code_drift', COUNT(*)
FROM workflow_step_master wsm
JOIN approval_group ag
  ON ag.APPROVAL_GROUP_ID = wsm.DEFAULT_APPROVAL_GROUP_ID_LOCAL
WHERE UPPER(TRIM(wsm.DEFAULT_GROUP_CODE_LOCAL)) <> ag.GROUP_CODE
UNION ALL
SELECT 'workflow_oversea_group_code_drift', COUNT(*)
FROM workflow_step_master wsm
JOIN approval_group ag
  ON ag.APPROVAL_GROUP_ID = wsm.DEFAULT_APPROVAL_GROUP_ID_OVERSEA
WHERE UPPER(TRIM(wsm.DEFAULT_GROUP_CODE_OVERSEA)) <> ag.GROUP_CODE;

-- 4) Configuration and invariant checks.
SELECT 'active_group_without_primary_member' AS CHECK_NAME, COUNT(*) AS ISSUE_COUNT
FROM approval_group ag
WHERE ag.INUSE = 1
  AND EXISTS (
      SELECT 1
      FROM approval_group_member agm
      WHERE agm.APPROVAL_GROUP_ID = ag.APPROVAL_GROUP_ID
        AND agm.INUSE = 1
  )
  AND NOT EXISTS (
      SELECT 1
      FROM approval_group_member agm
      WHERE agm.APPROVAL_GROUP_ID = ag.APPROVAL_GROUP_ID
        AND agm.INUSE = 1
        AND agm.IS_PRIMARY = 1
  )
UNION ALL
SELECT 'active_group_with_multiple_primary_members', COUNT(*)
FROM (
    SELECT agm.APPROVAL_GROUP_ID
    FROM approval_group_member agm
    WHERE agm.INUSE = 1
      AND agm.IS_PRIMARY = 1
    GROUP BY agm.APPROVAL_GROUP_ID
    HAVING COUNT(*) > 1
) duplicate_primary
UNION ALL
SELECT 'request_with_multiple_active_tasks', COUNT(*)
FROM (
    SELECT ras.REQUEST_REGISTER_VENDOR_ID
    FROM request_approval_step ras
    WHERE ras.INUSE = 1
      AND ras.M_APPROVAL_STEP_STATUS_ID = 2
    GROUP BY ras.REQUEST_REGISTER_VENDOR_ID
    HAVING COUNT(*) > 1
) duplicate_active
UNION ALL
SELECT 'unexpected_physical_foreign_keys', COUNT(*)
FROM information_schema.KEY_COLUMN_USAGE kcu
WHERE kcu.CONSTRAINT_SCHEMA = DATABASE()
  AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
  AND kcu.TABLE_NAME IN (
      'm_approval_step_status',
      'approval_group',
      'approval_group_member',
      'request_approval_step',
      'workflow_step_master',
      'assignees_to'
  );
