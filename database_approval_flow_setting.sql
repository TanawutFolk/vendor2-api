-- Approval Flow Setting
-- Adds stable workflow identities and step capabilities without changing the
-- currently published workflow. Run this migration before deploying the API.

DELIMITER $$

DROP PROCEDURE IF EXISTS migrate_approval_flow_setting$$
CREATE PROCEDURE migrate_approval_flow_setting()
BEGIN
    CREATE TABLE IF NOT EXISTS m_workflow_step_type (
        WORKFLOW_STEP_TYPE_ID SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
        STEP_CODE VARCHAR(64) NOT NULL,
        STEP_NAME VARCHAR(150) NOT NULL,
        IS_CONFIGURABLE TINYINT(1) NOT NULL DEFAULT 0,
        IS_REQUIRED TINYINT(1) NOT NULL DEFAULT 0,
        SORT_ORDER SMALLINT UNSIGNED NOT NULL DEFAULT 1,
        CREATE_BY VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
        CREATE_DATE DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UPDATE_BY VARCHAR(50) NULL,
        UPDATE_DATE DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        DESCRIPTION VARCHAR(100) NULL,
        INUSE TINYINT(1) NOT NULL DEFAULT 1,
        PRIMARY KEY (WORKFLOW_STEP_TYPE_ID),
        UNIQUE KEY uq_m_workflow_step_type_code (STEP_CODE)
    );

    INSERT INTO m_workflow_step_type (
        STEP_CODE, STEP_NAME, IS_CONFIGURABLE, IS_REQUIRED, SORT_ORDER,
        CREATE_BY, UPDATE_BY, DESCRIPTION, INUSE
    )
    SELECT
        source_step.STEP_CODE,
        COALESCE(NULLIF(source_step.DESCRIPTION, ''), source_step.STEP_CODE),
        CASE WHEN source_step.STEP_CODE IN ('DOC_CHECK', 'PO_MGR_APPROVAL', 'PO_GM_APPROVAL', 'MD_APPROVAL') THEN 1 ELSE 0 END,
        CASE WHEN source_step.STEP_CODE IN ('PO_MGR_APPROVAL', 'PO_GM_APPROVAL', 'MD_APPROVAL') THEN 1 ELSE 0 END,
        source_step.DEFAULT_STEP_ORDER,
        'SYSTEM',
        'SYSTEM',
        'Stable workflow step identity',
        1
    FROM workflow_step_master source_step
    INNER JOIN (
        SELECT STEP_CODE, MAX(WORKFLOW_STEP_MASTER_ID) AS WORKFLOW_STEP_MASTER_ID
        FROM workflow_step_master
        GROUP BY STEP_CODE
    ) latest_step
      ON latest_step.WORKFLOW_STEP_MASTER_ID = source_step.WORKFLOW_STEP_MASTER_ID
    ON DUPLICATE KEY UPDATE
        STEP_NAME = VALUES(STEP_NAME),
        IS_CONFIGURABLE = VALUES(IS_CONFIGURABLE),
        IS_REQUIRED = VALUES(IS_REQUIRED),
        SORT_ORDER = VALUES(SORT_ORDER),
        UPDATE_BY = 'SYSTEM',
        INUSE = 1;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'workflow_step_master'
          AND COLUMN_NAME = 'WORKFLOW_STEP_TYPE_ID'
    ) THEN
        ALTER TABLE workflow_step_master
            ADD COLUMN WORKFLOW_STEP_TYPE_ID SMALLINT UNSIGNED NULL AFTER WORKFLOW_DEFINITION_ID;
    END IF;

    UPDATE workflow_step_master workflow_step
    INNER JOIN m_workflow_step_type step_type
      ON step_type.STEP_CODE = workflow_step.STEP_CODE
    SET workflow_step.WORKFLOW_STEP_TYPE_ID = step_type.WORKFLOW_STEP_TYPE_ID
    WHERE workflow_step.WORKFLOW_STEP_TYPE_ID IS NULL
       OR workflow_step.WORKFLOW_STEP_TYPE_ID <> step_type.WORKFLOW_STEP_TYPE_ID;

    ALTER TABLE workflow_step_master
        MODIFY COLUMN WORKFLOW_STEP_TYPE_ID SMALLINT UNSIGNED NOT NULL;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'workflow_step_master'
          AND INDEX_NAME = 'idx_workflow_step_type'
    ) THEN
        ALTER TABLE workflow_step_master
            ADD KEY idx_workflow_step_type (WORKFLOW_STEP_TYPE_ID, WORKFLOW_DEFINITION_ID, INUSE);
    END IF;

    CREATE TABLE IF NOT EXISTS m_workflow_action (
        M_WORKFLOW_ACTION_ID TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
        ACTION_CODE VARCHAR(64) NOT NULL,
        ACTION_LABEL VARCHAR(100) NOT NULL,
        SORT_ORDER SMALLINT UNSIGNED NOT NULL DEFAULT 1,
        CREATE_BY VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
        CREATE_DATE DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UPDATE_BY VARCHAR(50) NULL,
        UPDATE_DATE DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        DESCRIPTION VARCHAR(100) NULL,
        INUSE TINYINT(1) NOT NULL DEFAULT 1,
        PRIMARY KEY (M_WORKFLOW_ACTION_ID),
        UNIQUE KEY uq_m_workflow_action_code (ACTION_CODE)
    );

    INSERT INTO m_workflow_action (
        ACTION_CODE, ACTION_LABEL, SORT_ORDER, CREATE_BY, UPDATE_BY, DESCRIPTION, INUSE
    ) VALUES
        ('APPROVE', 'Approve', 1, 'SYSTEM', 'SYSTEM', 'Continue to the configured target step', 1),
        ('REJECT', 'Reject', 2, 'SYSTEM', 'SYSTEM', 'End the request as rejected', 1),
        ('RECHECK', 'Re-check', 3, 'SYSTEM', 'SYSTEM', 'Return the request to a configured earlier step', 1),
        ('DISAGREE', 'Disagree', 4, 'SYSTEM', 'SYSTEM', 'Continue through the disagreement branch', 1),
        ('ACTION_REQUIRED', 'Action Required', 5, 'SYSTEM', 'SYSTEM', 'Request additional action', 1)
    ON DUPLICATE KEY UPDATE
        ACTION_LABEL = VALUES(ACTION_LABEL),
        SORT_ORDER = VALUES(SORT_ORDER),
        UPDATE_BY = 'SYSTEM',
        INUSE = 1;

    INSERT INTO m_workflow_action (
        ACTION_CODE, ACTION_LABEL, SORT_ORDER, CREATE_BY, UPDATE_BY, DESCRIPTION, INUSE
    )
    SELECT DISTINCT
        transition_row.ACTION_CODE,
        REPLACE(transition_row.ACTION_CODE, '_', ' '),
        99,
        'SYSTEM',
        'SYSTEM',
        'Migrated workflow action',
        1
    FROM workflow_transition transition_row
    WHERE NULLIF(TRIM(transition_row.ACTION_CODE), '') IS NOT NULL
    ON DUPLICATE KEY UPDATE
        UPDATE_BY = 'SYSTEM',
        INUSE = 1;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'workflow_transition'
          AND COLUMN_NAME = 'M_WORKFLOW_ACTION_ID'
    ) THEN
        ALTER TABLE workflow_transition
            ADD COLUMN M_WORKFLOW_ACTION_ID TINYINT UNSIGNED NULL AFTER FROM_WORKFLOW_STEP_MASTER_ID;
    END IF;

    UPDATE workflow_transition transition_row
    INNER JOIN m_workflow_action action_master
      ON action_master.ACTION_CODE = transition_row.ACTION_CODE
    SET transition_row.M_WORKFLOW_ACTION_ID = action_master.M_WORKFLOW_ACTION_ID
    WHERE transition_row.M_WORKFLOW_ACTION_ID IS NULL
       OR transition_row.M_WORKFLOW_ACTION_ID <> action_master.M_WORKFLOW_ACTION_ID;

    ALTER TABLE workflow_transition
        MODIFY COLUMN M_WORKFLOW_ACTION_ID TINYINT UNSIGNED NOT NULL;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'workflow_transition'
          AND INDEX_NAME = 'idx_workflow_transition_action_id'
    ) THEN
        ALTER TABLE workflow_transition
            ADD KEY idx_workflow_transition_action_id (M_WORKFLOW_ACTION_ID, WORKFLOW_DEFINITION_ID, INUSE);
    END IF;

    CREATE TABLE IF NOT EXISTS m_workflow_capability (
        M_WORKFLOW_CAPABILITY_ID TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
        CAPABILITY_CODE VARCHAR(64) NOT NULL,
        CAPABILITY_NAME VARCHAR(150) NOT NULL,
        SORT_ORDER SMALLINT UNSIGNED NOT NULL DEFAULT 1,
        CREATE_BY VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
        CREATE_DATE DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UPDATE_BY VARCHAR(50) NULL,
        UPDATE_DATE DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        DESCRIPTION VARCHAR(100) NULL,
        INUSE TINYINT(1) NOT NULL DEFAULT 1,
        PRIMARY KEY (M_WORKFLOW_CAPABILITY_ID),
        UNIQUE KEY uq_m_workflow_capability_code (CAPABILITY_CODE)
    );

    INSERT INTO m_workflow_capability (
        CAPABILITY_CODE, CAPABILITY_NAME, SORT_ORDER, CREATE_BY, UPDATE_BY, DESCRIPTION, INUSE
    ) VALUES
        ('EDIT_SELECTION_SHEET', 'Edit Selection Sheet', 1, 'SYSTEM', 'SYSTEM', 'Allows Selection Sheet updates while the task is in progress', 1),
        ('LOCK_SELECTION_SHEET_ON_APPROVE', 'Lock Selection Sheet On Approve', 2, 'SYSTEM', 'SYSTEM', 'Locks the Selection Sheet after this step is approved', 1)
    ON DUPLICATE KEY UPDATE
        CAPABILITY_NAME = VALUES(CAPABILITY_NAME),
        SORT_ORDER = VALUES(SORT_ORDER),
        UPDATE_BY = 'SYSTEM',
        INUSE = 1;

    CREATE TABLE IF NOT EXISTS workflow_behavior_config (
        WORKFLOW_BEHAVIOR_CONFIG_ID SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
        WORKFLOW_CODE VARCHAR(64) NOT NULL,
        M_FORWARD_ACTION_ID TINYINT UNSIGNED NOT NULL,
        M_SELECTION_EDIT_CAPABILITY_ID TINYINT UNSIGNED NOT NULL,
        M_SELECTION_LOCK_CAPABILITY_ID TINYINT UNSIGNED NOT NULL,
        CREATE_BY VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
        CREATE_DATE DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UPDATE_BY VARCHAR(50) NULL,
        UPDATE_DATE DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        DESCRIPTION VARCHAR(100) NULL,
        INUSE TINYINT(1) NOT NULL DEFAULT 1,
        PRIMARY KEY (WORKFLOW_BEHAVIOR_CONFIG_ID),
        UNIQUE KEY uq_workflow_behavior_config_code (WORKFLOW_CODE)
    );

    INSERT INTO workflow_behavior_config (
        WORKFLOW_CODE,
        M_FORWARD_ACTION_ID,
        M_SELECTION_EDIT_CAPABILITY_ID,
        M_SELECTION_LOCK_CAPABILITY_ID,
        CREATE_BY,
        UPDATE_BY,
        DESCRIPTION,
        INUSE
    )
    SELECT
        'VENDOR_REGISTRATION',
        forward_action.M_WORKFLOW_ACTION_ID,
        edit_capability.M_WORKFLOW_CAPABILITY_ID,
        lock_capability.M_WORKFLOW_CAPABILITY_ID,
        'SYSTEM',
        'SYSTEM',
        'Runtime workflow behavior identity mapping',
        1
    FROM m_workflow_action forward_action
    INNER JOIN m_workflow_capability edit_capability
      ON edit_capability.CAPABILITY_CODE = 'EDIT_SELECTION_SHEET'
     AND edit_capability.INUSE = 1
    INNER JOIN m_workflow_capability lock_capability
      ON lock_capability.CAPABILITY_CODE = 'LOCK_SELECTION_SHEET_ON_APPROVE'
     AND lock_capability.INUSE = 1
    WHERE forward_action.ACTION_CODE = 'APPROVE'
      AND forward_action.INUSE = 1
    ON DUPLICATE KEY UPDATE
        M_FORWARD_ACTION_ID = VALUES(M_FORWARD_ACTION_ID),
        M_SELECTION_EDIT_CAPABILITY_ID = VALUES(M_SELECTION_EDIT_CAPABILITY_ID),
        M_SELECTION_LOCK_CAPABILITY_ID = VALUES(M_SELECTION_LOCK_CAPABILITY_ID),
        UPDATE_BY = 'SYSTEM',
        INUSE = 1;

    CREATE TABLE IF NOT EXISTS workflow_step_capability (
        WORKFLOW_STEP_CAPABILITY_ID INT UNSIGNED NOT NULL AUTO_INCREMENT,
        WORKFLOW_STEP_MASTER_ID SMALLINT UNSIGNED NOT NULL,
        M_WORKFLOW_CAPABILITY_ID TINYINT UNSIGNED NOT NULL,
        CREATE_BY VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
        CREATE_DATE DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UPDATE_BY VARCHAR(50) NULL,
        UPDATE_DATE DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        DESCRIPTION VARCHAR(100) NULL,
        INUSE TINYINT(1) NOT NULL DEFAULT 1,
        PRIMARY KEY (WORKFLOW_STEP_CAPABILITY_ID),
        UNIQUE KEY uq_workflow_step_capability (WORKFLOW_STEP_MASTER_ID, M_WORKFLOW_CAPABILITY_ID),
        KEY idx_workflow_capability_step (M_WORKFLOW_CAPABILITY_ID, INUSE)
    );

    INSERT INTO workflow_step_capability (
        WORKFLOW_STEP_MASTER_ID, M_WORKFLOW_CAPABILITY_ID,
        CREATE_BY, UPDATE_BY, DESCRIPTION, INUSE
    )
    SELECT
        workflow_step.WORKFLOW_STEP_MASTER_ID,
        capability.M_WORKFLOW_CAPABILITY_ID,
        'SYSTEM',
        'SYSTEM',
        'Migrated Selection Sheet edit permission',
        1
    FROM workflow_step_master workflow_step
    INNER JOIN m_workflow_capability capability
      ON capability.CAPABILITY_CODE = 'EDIT_SELECTION_SHEET'
    WHERE workflow_step.STEP_CODE IN ('PO_PIC_IN_PROGRESS', 'DOC_CHECK')
    ON DUPLICATE KEY UPDATE
        UPDATE_BY = 'SYSTEM',
        INUSE = 1;

    INSERT INTO workflow_step_capability (
        WORKFLOW_STEP_MASTER_ID, M_WORKFLOW_CAPABILITY_ID,
        CREATE_BY, UPDATE_BY, DESCRIPTION, INUSE
    )
    SELECT
        workflow_step.WORKFLOW_STEP_MASTER_ID,
        capability.M_WORKFLOW_CAPABILITY_ID,
        'SYSTEM',
        'SYSTEM',
        'Migrated Selection Sheet lock permission',
        1
    FROM workflow_step_master workflow_step
    INNER JOIN m_workflow_capability capability
      ON capability.CAPABILITY_CODE = 'LOCK_SELECTION_SHEET_ON_APPROVE'
    WHERE workflow_step.STEP_CODE = 'DOC_CHECK'
    ON DUPLICATE KEY UPDATE
        UPDATE_BY = 'SYSTEM',
        INUSE = 1;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'workflow_definition'
          AND COLUMN_NAME = 'SOURCE_WORKFLOW_DEFINITION_ID'
    ) THEN
        ALTER TABLE workflow_definition
            ADD COLUMN SOURCE_WORKFLOW_DEFINITION_ID SMALLINT UNSIGNED NULL AFTER VERSION_NO;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'workflow_definition'
          AND COLUMN_NAME = 'PUBLISHED_BY'
    ) THEN
        ALTER TABLE workflow_definition
            ADD COLUMN PUBLISHED_BY VARCHAR(50) NULL AFTER PUBLISHED_DATE;
    END IF;
END$$

CALL migrate_approval_flow_setting()$$
DROP PROCEDURE IF EXISTS migrate_approval_flow_setting$$

DELIMITER ;

-- Verification only. This migration intentionally does not create a draft or
-- change the active workflow.
SELECT
    workflow_definition.WORKFLOW_DEFINITION_ID,
    workflow_definition.VERSION_NO,
    workflow_definition.DEFINITION_STATUS,
    workflow_definition.INUSE
FROM workflow_definition
WHERE workflow_definition.WORKFLOW_CODE = 'VENDOR_REGISTRATION'
ORDER BY workflow_definition.VERSION_NO DESC;
