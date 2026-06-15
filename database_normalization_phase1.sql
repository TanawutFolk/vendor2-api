-- Vendor2 database normalization, phase 1.
-- Target: _test_suply_chain_trainee
-- This migration preserves API compatibility columns while introducing
-- relational source-of-truth keys and enforcing referential integrity.

SET @target_schema = DATABASE();

-- Full row-level safety copies for every table mutated by this migration.
CREATE TABLE zz_backup_normalization_requests_20260615 AS
SELECT * FROM request_register_vendor;

CREATE TABLE zz_backup_normalization_approval_steps_20260615 AS
SELECT * FROM request_approval_step;

CREATE TABLE zz_backup_normalization_approval_logs_20260615 AS
SELECT * FROM request_approval_log;

CREATE TABLE zz_backup_normalization_contacts_20260615 AS
SELECT * FROM request_register_vendor_contacts;

CREATE TABLE zz_backup_normalization_files_20260615 AS
SELECT * FROM request_register_file;

CREATE TABLE zz_backup_normalization_selections_20260615 AS
SELECT * FROM request_vendor_selections;

CREATE TABLE zz_backup_normalization_criteria_20260615 AS
SELECT * FROM vendor_selection_criteria;

CREATE TABLE zz_backup_normalization_financials_20260615 AS
SELECT * FROM vendor_selection_financials;

CREATE TABLE zz_backup_normalization_assignments_20260615 AS
SELECT * FROM request_assignment_history;

CREATE TABLE zz_backup_normalization_gpr_flows_20260615 AS
SELECT * FROM request_vendor_gpr_c_flows;

CREATE TABLE zz_backup_normalization_gpr_steps_20260615 AS
SELECT * FROM request_vendor_gpr_c_steps;

CREATE TABLE zz_backup_normalization_gpr_actions_20260615 AS
SELECT * FROM request_vendor_gpr_c_action_required;

-- ---------------------------------------------------------------------------
-- Backup and remove orphan rows before adding foreign keys.
-- ---------------------------------------------------------------------------

DROP TABLE IF EXISTS zz_backup_orphan_request_contacts_20260615;
CREATE TABLE zz_backup_orphan_request_contacts_20260615 AS
SELECT rc.*
FROM request_register_vendor_contacts rc
LEFT JOIN request_register_vendor rr ON rr.REQUEST_ID = rc.REQUEST_ID
WHERE rr.REQUEST_ID IS NULL;

DROP TABLE IF EXISTS zz_backup_orphan_request_files_20260615;
CREATE TABLE zz_backup_orphan_request_files_20260615 AS
SELECT rf.*
FROM request_register_file rf
LEFT JOIN request_register_vendor rr ON rr.REQUEST_ID = rf.REQUEST_ID
WHERE rr.REQUEST_ID IS NULL;

DROP TABLE IF EXISTS zz_backup_orphan_selections_20260615;
CREATE TABLE zz_backup_orphan_selections_20260615 AS
SELECT s.*
FROM request_vendor_selections s
LEFT JOIN request_register_vendor rr ON rr.REQUEST_ID = CAST(s.REQUEST_ID AS UNSIGNED)
WHERE rr.REQUEST_ID IS NULL;

DROP TABLE IF EXISTS zz_backup_orphan_selection_criteria_20260615;
CREATE TABLE zz_backup_orphan_selection_criteria_20260615 AS
SELECT c.*
FROM vendor_selection_criteria c
JOIN zz_backup_orphan_selections_20260615 s ON s.SELECTION_ID = c.SELECTION_ID;

DROP TABLE IF EXISTS zz_backup_orphan_selection_financials_20260615;
CREATE TABLE zz_backup_orphan_selection_financials_20260615 AS
SELECT f.*
FROM vendor_selection_financials f
JOIN zz_backup_orphan_selections_20260615 s ON s.SELECTION_ID = f.SELECTION_ID;

DROP TABLE IF EXISTS zz_backup_orphan_gpr_flows_20260615;
CREATE TABLE zz_backup_orphan_gpr_flows_20260615 AS
SELECT f.*
FROM request_vendor_gpr_c_flows f
LEFT JOIN request_register_vendor rr ON rr.REQUEST_ID = f.REQUEST_ID
LEFT JOIN request_vendor_selections s ON s.SELECTION_ID = f.SELECTION_ID
WHERE rr.REQUEST_ID IS NULL OR s.SELECTION_ID IS NULL;

DROP TABLE IF EXISTS zz_backup_orphan_gpr_steps_20260615;
CREATE TABLE zz_backup_orphan_gpr_steps_20260615 AS
SELECT s.*
FROM request_vendor_gpr_c_steps s
JOIN zz_backup_orphan_gpr_flows_20260615 f ON f.GPR_C_FLOW_ID = s.GPR_C_FLOW_ID;

DROP TABLE IF EXISTS zz_backup_orphan_gpr_actions_20260615;
CREATE TABLE zz_backup_orphan_gpr_actions_20260615 AS
SELECT a.*
FROM request_vendor_gpr_c_action_required a
JOIN zz_backup_orphan_gpr_flows_20260615 f ON f.GPR_C_FLOW_ID = a.GPR_C_FLOW_ID;

DELETE a
FROM request_vendor_gpr_c_action_required a
JOIN zz_backup_orphan_gpr_flows_20260615 f ON f.GPR_C_FLOW_ID = a.GPR_C_FLOW_ID;

DELETE s
FROM request_vendor_gpr_c_steps s
JOIN zz_backup_orphan_gpr_flows_20260615 f ON f.GPR_C_FLOW_ID = s.GPR_C_FLOW_ID;

DELETE f
FROM request_vendor_gpr_c_flows f
JOIN zz_backup_orphan_gpr_flows_20260615 b ON b.GPR_C_FLOW_ID = f.GPR_C_FLOW_ID;

DELETE s
FROM request_vendor_selections s
LEFT JOIN request_register_vendor rr ON rr.REQUEST_ID = CAST(s.REQUEST_ID AS UNSIGNED)
WHERE rr.REQUEST_ID IS NULL;

DELETE rf
FROM request_register_file rf
LEFT JOIN request_register_vendor rr ON rr.REQUEST_ID = rf.REQUEST_ID
WHERE rr.REQUEST_ID IS NULL;

DELETE rc
FROM request_register_vendor_contacts rc
LEFT JOIN request_register_vendor rr ON rr.REQUEST_ID = rc.REQUEST_ID
WHERE rr.REQUEST_ID IS NULL;

-- Empty placeholder financial rows carry no business information and prevent
-- the natural key (selection, year) from being enforced.
DELETE FROM vendor_selection_financials
WHERE NULLIF(TRIM(YEAR), '') IS NULL
  AND TOTAL_REVENUE IS NULL
  AND NET_PROFIT IS NULL;

-- ---------------------------------------------------------------------------
-- Normalize request identifiers and relationship constraints.
-- ---------------------------------------------------------------------------

ALTER TABLE request_register_vendor
    DROP FOREIGN KEY fk_req_regis_vendor;

ALTER TABLE request_vendor_selections
    MODIFY COLUMN REQUEST_ID INT NOT NULL;

ALTER TABLE request_assignment_history
    MODIFY COLUMN REQUEST_ID INT NOT NULL,
    MODIFY COLUMN STEP_ID INT NULL;

ALTER TABLE request_vendor_gpr_c_flows
    MODIFY COLUMN REQUEST_ID INT NOT NULL,
    MODIFY COLUMN SELECTION_ID INT NOT NULL;

ALTER TABLE request_vendor_gpr_c_steps
    MODIFY COLUMN REQUEST_ID INT NOT NULL;

ALTER TABLE request_vendor_gpr_c_action_required
    MODIFY COLUMN REQUEST_ID INT NOT NULL;

ALTER TABLE request_register_vendor_contacts
    MODIFY COLUMN VENDOR_CONTACT_ID INT UNSIGNED NOT NULL,
    ADD CONSTRAINT uq_request_vendor_contact UNIQUE (REQUEST_ID, VENDOR_CONTACT_ID),
    ADD CONSTRAINT fk_request_vendor_contact_request
        FOREIGN KEY (REQUEST_ID) REFERENCES request_register_vendor (REQUEST_ID)
        ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT fk_request_vendor_contact_contact
        FOREIGN KEY (VENDOR_CONTACT_ID) REFERENCES vendor_contacts (VENDOR_CONTACT_ID)
        ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE request_register_file
    ADD CONSTRAINT fk_request_register_file_request
        FOREIGN KEY (REQUEST_ID) REFERENCES request_register_vendor (REQUEST_ID)
        ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE request_vendor_selections
    ADD CONSTRAINT uq_request_vendor_selection_request UNIQUE (REQUEST_ID),
    ADD CONSTRAINT fk_request_vendor_selection_request
        FOREIGN KEY (REQUEST_ID) REFERENCES request_register_vendor (REQUEST_ID)
        ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE vendor_selection_criteria
    ADD CONSTRAINT uq_vendor_selection_criteria_no UNIQUE (SELECTION_ID, CRITERIA_NO);

ALTER TABLE vendor_selection_financials
    ADD CONSTRAINT uq_vendor_selection_financial_year UNIQUE (SELECTION_ID, YEAR);

ALTER TABLE request_assignment_history
    ADD CONSTRAINT fk_request_assignment_history_request
        FOREIGN KEY (REQUEST_ID) REFERENCES request_register_vendor (REQUEST_ID)
        ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT fk_request_assignment_history_step
        FOREIGN KEY (STEP_ID) REFERENCES request_approval_step (STEP_ID)
        ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE request_vendor_gpr_c_flows
    ADD CONSTRAINT fk_gpr_c_flow_request
        FOREIGN KEY (REQUEST_ID) REFERENCES request_register_vendor (REQUEST_ID)
        ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE request_vendor_gpr_c_flows
    ADD CONSTRAINT fk_gpr_c_flow_selection
        FOREIGN KEY (SELECTION_ID) REFERENCES request_vendor_selections (SELECTION_ID)
        ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE request_vendor_gpr_c_steps
    ADD CONSTRAINT fk_gpr_c_step_flow
        FOREIGN KEY (GPR_C_FLOW_ID) REFERENCES request_vendor_gpr_c_flows (GPR_C_FLOW_ID)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    ADD CONSTRAINT fk_gpr_c_step_request
        FOREIGN KEY (REQUEST_ID) REFERENCES request_register_vendor (REQUEST_ID)
        ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE request_vendor_gpr_c_action_required
    ADD CONSTRAINT fk_gpr_c_action_flow
        FOREIGN KEY (GPR_C_FLOW_ID) REFERENCES request_vendor_gpr_c_flows (GPR_C_FLOW_ID)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    ADD CONSTRAINT fk_gpr_c_action_step
        FOREIGN KEY (GPR_C_STEP_ID) REFERENCES request_vendor_gpr_c_steps (GPR_C_STEP_ID)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    ADD CONSTRAINT fk_gpr_c_action_request
        FOREIGN KEY (REQUEST_ID) REFERENCES request_register_vendor (REQUEST_ID)
        ON DELETE RESTRICT ON UPDATE RESTRICT;

-- ---------------------------------------------------------------------------
-- Workflow definition and stable workflow-step identity.
-- ---------------------------------------------------------------------------

CREATE TABLE workflow_definition (
    WORKFLOW_ID SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    WORKFLOW_CODE VARCHAR(64) NOT NULL,
    WORKFLOW_NAME VARCHAR(150) NOT NULL,
    VERSION_NO SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    IS_ACTIVE TINYINT(1) NOT NULL DEFAULT 1,
    CREATE_BY VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    CREATE_DATE DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UPDATE_BY VARCHAR(50) NULL,
    UPDATE_DATE DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (WORKFLOW_ID),
    UNIQUE KEY uq_workflow_definition_code_version (WORKFLOW_CODE, VERSION_NO)
);

INSERT INTO workflow_definition (
    WORKFLOW_CODE,
    WORKFLOW_NAME,
    VERSION_NO,
    IS_ACTIVE,
    CREATE_BY
) VALUES (
    'VENDOR_REGISTRATION',
    'Vendor Registration',
    1,
    1,
    'SYSTEM'
);

CREATE TABLE workflow_step_master (
    WORKFLOW_STEP_ID SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    WORKFLOW_ID SMALLINT UNSIGNED NOT NULL,
    STATUS_ID TINYINT NOT NULL,
    STEP_CODE VARCHAR(64) NOT NULL,
    ACTOR_TYPE VARCHAR(32) NULL,
    DEFAULT_GROUP_CODE_LOCAL VARCHAR(64) NULL,
    DEFAULT_GROUP_CODE_OVERSEA VARCHAR(64) NULL,
    REQUIRES_VENDOR_REPLY TINYINT(1) NOT NULL DEFAULT 0,
    REQUIRES_VENDOR_CODE TINYINT(1) NOT NULL DEFAULT 0,
    DEFAULT_STEP_ORDER INT NOT NULL,
    IS_OPTIONAL TINYINT(1) NOT NULL DEFAULT 0,
    IS_ACTIVE TINYINT(1) NOT NULL DEFAULT 1,
    CREATE_BY VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    CREATE_DATE DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UPDATE_BY VARCHAR(50) NULL,
    UPDATE_DATE DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (WORKFLOW_STEP_ID),
    UNIQUE KEY uq_workflow_step_code (WORKFLOW_ID, STEP_CODE),
    UNIQUE KEY uq_workflow_step_status (WORKFLOW_ID, STATUS_ID),
    KEY idx_workflow_step_order (WORKFLOW_ID, IS_ACTIVE, DEFAULT_STEP_ORDER),
    CONSTRAINT fk_workflow_step_definition
        FOREIGN KEY (WORKFLOW_ID) REFERENCES workflow_definition (WORKFLOW_ID)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_workflow_step_status
        FOREIGN KEY (STATUS_ID) REFERENCES m_request_status (STATUS_ID)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO workflow_step_master (
    WORKFLOW_ID,
    STATUS_ID,
    STEP_CODE,
    ACTOR_TYPE,
    DEFAULT_GROUP_CODE_LOCAL,
    DEFAULT_GROUP_CODE_OVERSEA,
    REQUIRES_VENDOR_REPLY,
    REQUIRES_VENDOR_CODE,
    DEFAULT_STEP_ORDER,
    IS_OPTIONAL,
    IS_ACTIVE,
    CREATE_BY
)
SELECT
    wd.WORKFLOW_ID,
    s.STATUS_ID,
    s.STEP_CODE,
    s.ACTOR_TYPE,
    s.DEFAULT_GROUP_CODE_LOCAL,
    s.DEFAULT_GROUP_CODE_OVERSEA,
    s.REQUIRES_VENDOR_REPLY,
    s.REQUIRES_VENDOR_CODE,
    CASE s.STEP_CODE
        WHEN 'REQUEST_SUBMITTED' THEN 1
        WHEN 'PIC_REVIEW' THEN 2
        WHEN 'PENDING_AGREEMENT' THEN 3
        WHEN 'AGREEMENT_REACHED' THEN 4
        WHEN 'DOC_CHECK' THEN 5
        WHEN 'PO_MGR_APPROVAL' THEN 6
        WHEN 'PO_GM_APPROVAL' THEN 7
        WHEN 'MD_APPROVAL' THEN 8
        WHEN 'ACCOUNT_REGISTERED' THEN 9
        WHEN 'VENDOR_DISAGREED' THEN 10
        WHEN 'ISSUE_GPR_B' THEN 11
        WHEN 'ISSUE_GPR_C' THEN 12
    END,
    CASE
        WHEN s.STEP_CODE IN ('VENDOR_DISAGREED', 'ISSUE_GPR_B', 'ISSUE_GPR_C') THEN 1
        ELSE 0
    END,
    s.IS_ACTIVE,
    'SYSTEM'
FROM m_request_status s
JOIN workflow_definition wd
  ON wd.WORKFLOW_CODE = 'VENDOR_REGISTRATION'
 AND wd.VERSION_NO = 1
WHERE s.STEP_CODE <> 'REJECTED';

CREATE TABLE workflow_transition (
    WORKFLOW_TRANSITION_ID INT UNSIGNED NOT NULL AUTO_INCREMENT,
    WORKFLOW_ID SMALLINT UNSIGNED NOT NULL,
    FROM_WORKFLOW_STEP_ID SMALLINT UNSIGNED NOT NULL,
    ACTION_CODE VARCHAR(64) NOT NULL,
    TO_WORKFLOW_STEP_ID SMALLINT UNSIGNED NULL,
    TERMINAL_STATE VARCHAR(32) NULL,
    PRIORITY_NO SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    IS_ACTIVE TINYINT(1) NOT NULL DEFAULT 1,
    CREATE_BY VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    CREATE_DATE DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (WORKFLOW_TRANSITION_ID),
    UNIQUE KEY uq_workflow_transition_action (
        WORKFLOW_ID,
        FROM_WORKFLOW_STEP_ID,
        ACTION_CODE,
        PRIORITY_NO
    ),
    CONSTRAINT fk_workflow_transition_definition
        FOREIGN KEY (WORKFLOW_ID) REFERENCES workflow_definition (WORKFLOW_ID)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_workflow_transition_from
        FOREIGN KEY (FROM_WORKFLOW_STEP_ID) REFERENCES workflow_step_master (WORKFLOW_STEP_ID)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_workflow_transition_to
        FOREIGN KEY (TO_WORKFLOW_STEP_ID) REFERENCES workflow_step_master (WORKFLOW_STEP_ID)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO workflow_transition (
    WORKFLOW_ID,
    FROM_WORKFLOW_STEP_ID,
    ACTION_CODE,
    TO_WORKFLOW_STEP_ID,
    TERMINAL_STATE,
    PRIORITY_NO,
    CREATE_BY
)
SELECT
    wd.WORKFLOW_ID,
    from_step.WORKFLOW_STEP_ID,
    seed.ACTION_CODE,
    to_step.WORKFLOW_STEP_ID,
    seed.TERMINAL_STATE,
    seed.PRIORITY_NO,
    'SYSTEM'
FROM workflow_definition wd
JOIN (
    SELECT 'REQUEST_SUBMITTED' FROM_CODE, 'APPROVE' ACTION_CODE, 'PIC_REVIEW' TO_CODE, NULL TERMINAL_STATE, 1 PRIORITY_NO
    UNION ALL SELECT 'PIC_REVIEW', 'APPROVE', 'PENDING_AGREEMENT', NULL, 1
    UNION ALL SELECT 'PENDING_AGREEMENT', 'APPROVE', 'AGREEMENT_REACHED', NULL, 1
    UNION ALL SELECT 'PENDING_AGREEMENT', 'DISAGREE', 'VENDOR_DISAGREED', NULL, 1
    UNION ALL SELECT 'AGREEMENT_REACHED', 'APPROVE', 'DOC_CHECK', NULL, 1
    UNION ALL SELECT 'AGREEMENT_REACHED', 'DISAGREE', 'VENDOR_DISAGREED', NULL, 1
    UNION ALL SELECT 'VENDOR_DISAGREED', 'DISAGREE', 'ISSUE_GPR_B', NULL, 1
    UNION ALL SELECT 'ISSUE_GPR_B', 'APPROVE', 'ISSUE_GPR_C', NULL, 1
    UNION ALL SELECT 'ISSUE_GPR_C', 'APPROVE', 'AGREEMENT_REACHED', NULL, 1
    UNION ALL SELECT 'DOC_CHECK', 'APPROVE', 'PO_MGR_APPROVAL', NULL, 1
    UNION ALL SELECT 'PO_MGR_APPROVAL', 'APPROVE', 'PO_GM_APPROVAL', NULL, 1
    UNION ALL SELECT 'PO_GM_APPROVAL', 'APPROVE', 'MD_APPROVAL', NULL, 1
    UNION ALL SELECT 'MD_APPROVAL', 'APPROVE', 'ACCOUNT_REGISTERED', NULL, 1
    UNION ALL SELECT 'ACCOUNT_REGISTERED', 'APPROVE', NULL, 'completed', 1
    UNION ALL SELECT 'PIC_REVIEW', 'REJECT', NULL, 'rejected', 1
    UNION ALL SELECT 'PENDING_AGREEMENT', 'REJECT', NULL, 'rejected', 1
    UNION ALL SELECT 'AGREEMENT_REACHED', 'REJECT', NULL, 'rejected', 1
    UNION ALL SELECT 'DOC_CHECK', 'REJECT', NULL, 'rejected', 1
    UNION ALL SELECT 'PO_MGR_APPROVAL', 'REJECT', NULL, 'rejected', 1
    UNION ALL SELECT 'PO_GM_APPROVAL', 'REJECT', NULL, 'rejected', 1
    UNION ALL SELECT 'MD_APPROVAL', 'REJECT', NULL, 'rejected', 1
    UNION ALL SELECT 'ACCOUNT_REGISTERED', 'REJECT', NULL, 'rejected', 1
) seed
JOIN workflow_step_master from_step
  ON from_step.WORKFLOW_ID = wd.WORKFLOW_ID
 AND from_step.STEP_CODE = seed.FROM_CODE
LEFT JOIN workflow_step_master to_step
  ON to_step.WORKFLOW_ID = wd.WORKFLOW_ID
 AND to_step.STEP_CODE = seed.TO_CODE
WHERE wd.WORKFLOW_CODE = 'VENDOR_REGISTRATION'
  AND wd.VERSION_NO = 1;

ALTER TABLE request_approval_step
    ADD COLUMN WORKFLOW_STEP_ID SMALLINT UNSIGNED NULL AFTER REQUEST_ID;

UPDATE request_approval_step ras
JOIN workflow_step_master wsm ON wsm.STATUS_ID = ras.STATUS_ID
SET ras.WORKFLOW_STEP_ID = wsm.WORKFLOW_STEP_ID;

ALTER TABLE request_approval_step
    DROP FOREIGN KEY fk_request_approval_step_status_code;

ALTER TABLE request_approval_step
    MODIFY COLUMN WORKFLOW_STEP_ID SMALLINT UNSIGNED NOT NULL,
    ADD CONSTRAINT uq_request_workflow_step UNIQUE (REQUEST_ID, WORKFLOW_STEP_ID),
    ADD CONSTRAINT uq_request_step_pair UNIQUE (REQUEST_ID, STEP_ID),
    ADD KEY idx_request_active_step (REQUEST_ID, STEP_STATUS, INUSE),
    ADD CONSTRAINT fk_request_approval_workflow_step
        FOREIGN KEY (WORKFLOW_STEP_ID) REFERENCES workflow_step_master (WORKFLOW_STEP_ID)
        ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE request_approval_step
    DROP INDEX uq_request_approval_step_status,
    DROP INDEX uq_request_approval_step_code;

ALTER TABLE request_approval_log
    DROP FOREIGN KEY request_approval_log_ibfk_2;

ALTER TABLE request_approval_log
    ADD CONSTRAINT fk_request_approval_log_request_step
        FOREIGN KEY (REQUEST_ID, STEP_ID)
        REFERENCES request_approval_step (REQUEST_ID, STEP_ID)
        ON DELETE RESTRICT ON UPDATE RESTRICT;

-- ---------------------------------------------------------------------------
-- Request current state. REQUEST_STATUS remains as a compatibility label,
-- while IDs and REQUEST_STATE become the relational source of truth.
-- ---------------------------------------------------------------------------

ALTER TABLE request_register_vendor
    ADD COLUMN REQUEST_STATE VARCHAR(32) NOT NULL DEFAULT 'in_progress' AFTER PURCHASE_FREQUENCY,
    ADD COLUMN CURRENT_STATUS_ID TINYINT NULL AFTER REQUEST_STATE,
    ADD COLUMN CURRENT_STEP_ID INT NULL AFTER CURRENT_STATUS_ID;

UPDATE request_register_vendor rr
LEFT JOIN request_approval_step active_step
  ON active_step.REQUEST_ID = rr.REQUEST_ID
 AND LOWER(active_step.STEP_STATUS) = 'in_progress'
 AND active_step.INUSE = 1
LEFT JOIN workflow_step_master active_master
  ON active_master.WORKFLOW_STEP_ID = active_step.WORKFLOW_STEP_ID
LEFT JOIN m_request_status completed_status
  ON completed_status.STEP_CODE = 'ACCOUNT_REGISTERED'
LEFT JOIN m_request_status rejected_status
  ON rejected_status.STEP_CODE = 'REJECTED'
SET
    rr.REQUEST_STATE = CASE
        WHEN LOWER(rr.REQUEST_STATUS) = 'completed' THEN 'completed'
        WHEN LOWER(rr.REQUEST_STATUS) IN ('rejected', 'vendor disagreed') THEN 'rejected'
        WHEN LOWER(rr.REQUEST_STATUS) IN ('cancelled', 'canceled') THEN 'cancelled'
        ELSE 'in_progress'
    END,
    rr.CURRENT_STEP_ID = active_step.STEP_ID,
    rr.CURRENT_STATUS_ID = CASE
        WHEN active_master.STATUS_ID IS NOT NULL THEN active_master.STATUS_ID
        WHEN LOWER(rr.REQUEST_STATUS) = 'completed' THEN completed_status.STATUS_ID
        WHEN LOWER(rr.REQUEST_STATUS) IN ('rejected', 'vendor disagreed') THEN rejected_status.STATUS_ID
        ELSE NULL
    END;

ALTER TABLE request_register_vendor
    ADD KEY idx_request_state (REQUEST_STATE, CURRENT_STATUS_ID, CURRENT_STEP_ID),
    ADD CONSTRAINT fk_request_current_status
        FOREIGN KEY (CURRENT_STATUS_ID) REFERENCES m_request_status (STATUS_ID)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT fk_request_current_step
        FOREIGN KEY (REQUEST_ID, CURRENT_STEP_ID)
        REFERENCES request_approval_step (REQUEST_ID, STEP_ID)
        ON DELETE RESTRICT ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- Selection master-data keys and explicit vendor-code meanings.
-- ---------------------------------------------------------------------------

ALTER TABLE info_currency
    ADD CONSTRAINT uq_info_currency_name UNIQUE (CURRENCY_NAME);

ALTER TABLE request_vendor_selections
    ADD COLUMN BUSINESS_CATEGORY_ID INT NULL AFTER REQUEST_ID,
    ADD COLUMN CURRENCY_ID INT NULL AFTER SANCTIONS_STATUS,
    ADD COLUMN PROPOSED_VENDOR_CODE VARCHAR(100) NULL AFTER DOCUMENT_PATH;

UPDATE request_vendor_selections s
LEFT JOIN business_category bc
  ON bc.BUSINESS_CATEGORY_NAME = NULLIF(TRIM(s.BUSINESS_CATEGORY), '')
LEFT JOIN info_currency c
  ON c.CURRENCY_NAME = NULLIF(TRIM(s.CURRENCY), '')
SET
    s.BUSINESS_CATEGORY_ID = bc.BUSINESS_CATEGORY_ID,
    s.CURRENCY_ID = c.CURRENCY_ID,
    s.PROPOSED_VENDOR_CODE = NULLIF(TRIM(s.VENDOR_CODE_SELECTOR), '');

ALTER TABLE request_vendor_selections
    ADD CONSTRAINT fk_request_selection_business_category
        FOREIGN KEY (BUSINESS_CATEGORY_ID) REFERENCES business_category (BUSINESS_CATEGORY_ID)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT fk_request_selection_currency
        FOREIGN KEY (CURRENCY_ID) REFERENCES info_currency (CURRENCY_ID)
        ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE request_register_vendor
    ADD COLUMN APPROVED_VENDOR_CODE VARCHAR(100) NULL AFTER PIC_EMAIL;

UPDATE request_register_vendor
SET APPROVED_VENDOR_CODE = NULLIF(TRIM(VENDOR_CODE), '');

-- The bridge table is the canonical contact assignment. Primary-contact
-- uniqueness is validated by the service because this MySQL instance cannot
-- rebuild the legacy FK table with a generated partial-unique column.
ALTER TABLE request_register_vendor_contacts
    ADD KEY idx_request_primary_contact (REQUEST_ID, IS_PRIMARY, INUSE);

-- Normalize workflow status casing to lowercase in both workflow engines.
UPDATE request_approval_step SET STEP_STATUS = LOWER(STEP_STATUS);
UPDATE request_vendor_gpr_c_steps SET STEP_STATUS = LOWER(STEP_STATUS);
UPDATE request_vendor_gpr_c_action_required SET RESULT_STATUS = LOWER(RESULT_STATUS);
UPDATE request_vendor_gpr_c_flows SET FLOW_STATUS = LOWER(FLOW_STATUS);

SELECT 'workflow_definition' AS entity, COUNT(*) AS row_count FROM workflow_definition
UNION ALL
SELECT 'workflow_step_master', COUNT(*) FROM workflow_step_master
UNION ALL
SELECT 'workflow_transition', COUNT(*) FROM workflow_transition
UNION ALL
SELECT 'request_approval_step linked', COUNT(*) FROM request_approval_step WHERE WORKFLOW_STEP_ID IS NOT NULL
UNION ALL
SELECT 'orphan contacts backed up', COUNT(*) FROM zz_backup_orphan_request_contacts_20260615
UNION ALL
SELECT 'orphan files backed up', COUNT(*) FROM zz_backup_orphan_request_files_20260615
UNION ALL
SELECT 'orphan selections backed up', COUNT(*) FROM zz_backup_orphan_selections_20260615
UNION ALL
SELECT 'orphan GPR flows backed up', COUNT(*) FROM zz_backup_orphan_gpr_flows_20260615;
