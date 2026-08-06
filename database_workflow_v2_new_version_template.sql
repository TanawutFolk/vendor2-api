-- Vendor workflow v2: create and publish a new flow version
-- Target: vendor-system-test1 (run database_workflow_v2_migration.sql first)
--
-- Rule: never edit a PUBLISHED definition. Clone it to DRAFT, edit the DRAFT,
-- validate it, then publish. Existing requests keep their old definition ID.
-- Relationships use IDs and SQL JOINs; this template creates no foreign keys.

USE `vendor-system-test1`;

DELIMITER $$

DROP PROCEDURE IF EXISTS clone_vendor_workflow_draft$$
CREATE PROCEDURE clone_vendor_workflow_draft(IN p_create_by VARCHAR(50))
BEGIN
    DECLARE source_definition_id SMALLINT UNSIGNED;
    DECLARE draft_definition_id SMALLINT UNSIGNED;
    DECLARE next_version SMALLINT UNSIGNED;

    IF EXISTS (
        SELECT 1
        FROM workflow_definition
        WHERE WORKFLOW_CODE = 'VENDOR_REGISTRATION'
          AND DEFINITION_STATUS = 'DRAFT'
          AND INUSE = 1
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'An active VENDOR_REGISTRATION draft already exists';
    END IF;

    SELECT WORKFLOW_DEFINITION_ID, VERSION_NO + 1
      INTO source_definition_id, next_version
    FROM workflow_definition
    WHERE WORKFLOW_CODE = 'VENDOR_REGISTRATION'
      AND DEFINITION_STATUS = 'PUBLISHED'
      AND INUSE = 1
    ORDER BY VERSION_NO DESC
    LIMIT 1;

    IF source_definition_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'No active published VENDOR_REGISTRATION workflow exists';
    END IF;

    START TRANSACTION;

    INSERT INTO workflow_definition (
        WORKFLOW_CODE, WORKFLOW_NAME, VERSION_NO, DEFINITION_STATUS,
        PUBLISHED_DATE, RETIRED_DATE, DESCRIPTION, CREATE_BY, UPDATE_BY, INUSE
    )
    SELECT
        WORKFLOW_CODE, WORKFLOW_NAME, next_version, 'DRAFT',
        NULL, NULL, CONCAT('Draft cloned from version ', VERSION_NO),
        COALESCE(NULLIF(p_create_by, ''), 'SYSTEM'),
        COALESCE(NULLIF(p_create_by, ''), 'SYSTEM'), 1
    FROM workflow_definition
    WHERE WORKFLOW_DEFINITION_ID = source_definition_id;

    SET draft_definition_id = LAST_INSERT_ID();

    INSERT INTO workflow_step_master (
        WORKFLOW_DEFINITION_ID, M_REQUEST_STATUS_ID, STEP_CODE, ACTOR_TYPE,
        HANDLER_KEY, DEFAULT_GROUP_CODE_LOCAL, DEFAULT_GROUP_CODE_OVERSEA,
        REQUIRES_VENDOR_REPLY, REQUIRES_VENDOR_CODE, DEFAULT_STEP_ORDER,
        IS_OPTIONAL, DESCRIPTION, CREATE_BY, UPDATE_BY, INUSE
    )
    SELECT
        draft_definition_id, M_REQUEST_STATUS_ID, STEP_CODE, ACTOR_TYPE,
        HANDLER_KEY, DEFAULT_GROUP_CODE_LOCAL, DEFAULT_GROUP_CODE_OVERSEA,
        REQUIRES_VENDOR_REPLY, REQUIRES_VENDOR_CODE, DEFAULT_STEP_ORDER,
        IS_OPTIONAL, DESCRIPTION,
        COALESCE(NULLIF(p_create_by, ''), 'SYSTEM'),
        COALESCE(NULLIF(p_create_by, ''), 'SYSTEM'), INUSE
    FROM workflow_step_master
    WHERE WORKFLOW_DEFINITION_ID = source_definition_id;

    INSERT INTO workflow_transition (
        WORKFLOW_DEFINITION_ID, FROM_WORKFLOW_STEP_MASTER_ID, ACTION_CODE,
        TO_WORKFLOW_STEP_MASTER_ID, TERMINAL_STATE, CONDITION_KEY, PRIORITY_NO,
        DESCRIPTION, CREATE_BY, UPDATE_BY, INUSE
    )
    SELECT
        draft_definition_id,
        draft_from.WORKFLOW_STEP_MASTER_ID,
        source_transition.ACTION_CODE,
        draft_to.WORKFLOW_STEP_MASTER_ID,
        source_transition.TERMINAL_STATE,
        source_transition.CONDITION_KEY,
        source_transition.PRIORITY_NO,
        source_transition.DESCRIPTION,
        COALESCE(NULLIF(p_create_by, ''), 'SYSTEM'),
        COALESCE(NULLIF(p_create_by, ''), 'SYSTEM'),
        source_transition.INUSE
    FROM workflow_transition source_transition
    JOIN workflow_step_master source_from
      ON source_from.WORKFLOW_STEP_MASTER_ID = source_transition.FROM_WORKFLOW_STEP_MASTER_ID
    JOIN workflow_step_master draft_from
      ON draft_from.WORKFLOW_DEFINITION_ID = draft_definition_id
     AND draft_from.STEP_CODE = source_from.STEP_CODE
    LEFT JOIN workflow_step_master source_to
      ON source_to.WORKFLOW_STEP_MASTER_ID = source_transition.TO_WORKFLOW_STEP_MASTER_ID
    LEFT JOIN workflow_step_master draft_to
      ON draft_to.WORKFLOW_DEFINITION_ID = draft_definition_id
     AND draft_to.STEP_CODE = source_to.STEP_CODE
    WHERE source_transition.WORKFLOW_DEFINITION_ID = source_definition_id;

    COMMIT;

    SELECT draft_definition_id AS DRAFT_WORKFLOW_DEFINITION_ID,
           next_version AS DRAFT_VERSION_NO;
END$$

DROP PROCEDURE IF EXISTS publish_vendor_workflow_draft$$
CREATE PROCEDURE publish_vendor_workflow_draft(
    IN p_draft_definition_id SMALLINT UNSIGNED,
    IN p_publish_by VARCHAR(50)
)
BEGIN
    DECLARE invalid_count INT DEFAULT 0;

    IF NOT EXISTS (
        SELECT 1 FROM workflow_definition
        WHERE WORKFLOW_DEFINITION_ID = p_draft_definition_id
          AND WORKFLOW_CODE = 'VENDOR_REGISTRATION'
          AND DEFINITION_STATUS = 'DRAFT'
          AND INUSE = 1
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'The selected workflow is not an active VENDOR_REGISTRATION draft';
    END IF;

    SELECT COUNT(*) INTO invalid_count
    FROM (
        SELECT DEFAULT_STEP_ORDER
        FROM workflow_step_master
        WHERE WORKFLOW_DEFINITION_ID = p_draft_definition_id
          AND INUSE = 1
        GROUP BY DEFAULT_STEP_ORDER
        HAVING COUNT(*) > 1
    ) duplicate_orders;
    IF invalid_count > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Draft has duplicate active step orders';
    END IF;

    SELECT COUNT(*) INTO invalid_count
    FROM workflow_transition wt
    JOIN workflow_step_master from_step
      ON from_step.WORKFLOW_STEP_MASTER_ID = wt.FROM_WORKFLOW_STEP_MASTER_ID
    LEFT JOIN workflow_step_master to_step
      ON to_step.WORKFLOW_STEP_MASTER_ID = wt.TO_WORKFLOW_STEP_MASTER_ID
    WHERE wt.WORKFLOW_DEFINITION_ID = p_draft_definition_id
      AND wt.INUSE = 1
      AND (
          from_step.WORKFLOW_DEFINITION_ID <> p_draft_definition_id
          OR from_step.INUSE <> 1
          OR (to_step.WORKFLOW_STEP_MASTER_ID IS NOT NULL
              AND to_step.WORKFLOW_DEFINITION_ID <> p_draft_definition_id)
          OR (to_step.WORKFLOW_STEP_MASTER_ID IS NOT NULL AND to_step.INUSE <> 1)
          OR (wt.TO_WORKFLOW_STEP_MASTER_ID IS NULL AND NULLIF(wt.TERMINAL_STATE, '') IS NULL)
          OR (wt.TO_WORKFLOW_STEP_MASTER_ID IS NOT NULL AND NULLIF(wt.TERMINAL_STATE, '') IS NOT NULL)
      );
    IF invalid_count > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Draft contains invalid cross-version or target/terminal transitions';
    END IF;

    SELECT COUNT(*) INTO invalid_count
    FROM workflow_step_master step
    WHERE step.WORKFLOW_DEFINITION_ID = p_draft_definition_id
      AND step.INUSE = 1
      AND NOT EXISTS (
          SELECT 1 FROM workflow_transition wt
          WHERE wt.WORKFLOW_DEFINITION_ID = p_draft_definition_id
            AND wt.FROM_WORKFLOW_STEP_MASTER_ID = step.WORKFLOW_STEP_MASTER_ID
            AND wt.INUSE = 1
      );
    IF invalid_count > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Every active step must have at least one active outgoing or terminal transition';
    END IF;

    IF (SELECT COUNT(*) FROM workflow_step_master
        WHERE WORKFLOW_DEFINITION_ID = p_draft_definition_id
          AND STEP_CODE = 'REQUEST_SUBMITTED' AND INUSE = 1) <> 1 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Draft must contain one active REQUEST_SUBMITTED step';
    END IF;

    START TRANSACTION;

    UPDATE workflow_definition
    SET DEFINITION_STATUS = 'RETIRED',
        RETIRED_DATE = NOW(),
        UPDATE_BY = COALESCE(NULLIF(p_publish_by, ''), 'SYSTEM'),
        UPDATE_DATE = NOW(),
        INUSE = 0
    WHERE WORKFLOW_CODE = 'VENDOR_REGISTRATION'
      AND DEFINITION_STATUS = 'PUBLISHED'
      AND INUSE = 1;

    UPDATE workflow_definition
    SET DEFINITION_STATUS = 'PUBLISHED',
        PUBLISHED_DATE = NOW(),
        RETIRED_DATE = NULL,
        UPDATE_BY = COALESCE(NULLIF(p_publish_by, ''), 'SYSTEM'),
        UPDATE_DATE = NOW(),
        INUSE = 1
    WHERE WORKFLOW_DEFINITION_ID = p_draft_definition_id;

    COMMIT;

    SELECT WORKFLOW_DEFINITION_ID, WORKFLOW_CODE, VERSION_NO,
           DEFINITION_STATUS, PUBLISHED_DATE, INUSE
    FROM workflow_definition
    WHERE WORKFLOW_CODE = 'VENDOR_REGISTRATION'
    ORDER BY VERSION_NO DESC;
END$$

DELIMITER ;

-- 1) Clone the current published flow to a new DRAFT (run once).
-- CALL clone_vendor_workflow_draft('YOUR_EMPCODE');

-- 2) Edit only the returned DRAFT_WORKFLOW_DEFINITION_ID.
--    Add status: insert m_request_status with a new, permanent STATUS_CODE.
--    Add step: insert workflow_step_master using that status ID and the draft ID.
--    Remove step: set the draft step INUSE = 0.
--    Add/remove/re-route actions in workflow_transition using step IDs from the same draft.
--    Never update STATUS_CODE after it has been used; labels may be changed safely.

-- 3) Review the draft graph before publishing.
SELECT
    wd.WORKFLOW_DEFINITION_ID,
    wd.VERSION_NO,
    wd.DEFINITION_STATUS,
    from_step.DEFAULT_STEP_ORDER,
    from_step.STEP_CODE AS FROM_STEP,
    wt.ACTION_CODE,
    to_step.STEP_CODE AS TO_STEP,
    wt.TERMINAL_STATE,
    wt.CONDITION_KEY,
    wt.INUSE
FROM workflow_definition wd
JOIN workflow_step_master from_step
  ON from_step.WORKFLOW_DEFINITION_ID = wd.WORKFLOW_DEFINITION_ID
LEFT JOIN workflow_transition wt
  ON wt.WORKFLOW_DEFINITION_ID = wd.WORKFLOW_DEFINITION_ID
 AND wt.FROM_WORKFLOW_STEP_MASTER_ID = from_step.WORKFLOW_STEP_MASTER_ID
LEFT JOIN workflow_step_master to_step
  ON to_step.WORKFLOW_STEP_MASTER_ID = wt.TO_WORKFLOW_STEP_MASTER_ID
WHERE wd.WORKFLOW_CODE = 'VENDOR_REGISTRATION'
  AND wd.DEFINITION_STATUS = 'DRAFT'
ORDER BY wd.VERSION_NO DESC, from_step.DEFAULT_STEP_ORDER, wt.PRIORITY_NO;

-- 4) Publish only after the review is correct.
-- CALL publish_vendor_workflow_draft(<DRAFT_WORKFLOW_DEFINITION_ID>, 'YOUR_EMPCODE');

-- Optional cleanup after the workflow-admin work is finished:
-- DROP PROCEDURE IF EXISTS clone_vendor_workflow_draft;
-- DROP PROCEDURE IF EXISTS publish_vendor_workflow_draft;
