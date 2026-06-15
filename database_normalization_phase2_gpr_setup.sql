-- Vendor2 database normalization, phase 2.
-- Normalize GPR-C setup data while preserving legacy JSON cache columns.

CREATE TABLE zz_backup_normalization_gpr_setup_20260615 AS
SELECT
    SELECTION_ID,
    GPR_C_APPROVER_NAME,
    GPR_C_APPROVER_EMAIL,
    GPR_C_PC_PIC_NAME,
    GPR_C_PC_PIC_EMAIL,
    GPR_C_CIRCULAR_JSON,
    ACTION_REQUIRED_JSON
FROM request_vendor_selections;

ALTER TABLE request_vendor_selections
    ADD COLUMN GPR_C_APPROVER_EMPCODE VARCHAR(50) NULL AFTER GPR_C_APPROVER_EMAIL,
    ADD COLUMN GPR_C_PC_PIC_EMPCODE VARCHAR(50) NULL AFTER GPR_C_PC_PIC_EMAIL;

UPDATE request_vendor_selections
SET
    GPR_C_APPROVER_EMPCODE = NULLIF(
        JSON_UNQUOTE(JSON_EXTRACT(ACTION_REQUIRED_JSON, '$._meta.gpr_c_approver_empcode')),
        ''
    ),
    GPR_C_PC_PIC_EMPCODE = NULLIF(
        JSON_UNQUOTE(JSON_EXTRACT(ACTION_REQUIRED_JSON, '$._meta.gpr_c_pc_pic_empcode')),
        ''
    )
WHERE JSON_VALID(ACTION_REQUIRED_JSON);

CREATE TABLE request_vendor_gpr_c_circular_members (
    CIRCULAR_MEMBER_ID BIGINT NOT NULL AUTO_INCREMENT,
    SELECTION_ID INT NOT NULL,
    MEMBER_ORDER TINYINT UNSIGNED NOT NULL,
    EMPCODE VARCHAR(50) NULL,
    MEMBER_NAME VARCHAR(255) NULL,
    EMAIL VARCHAR(255) NOT NULL,
    CREATE_BY VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    CREATE_DATE DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UPDATE_BY VARCHAR(50) NULL,
    UPDATE_DATE DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (CIRCULAR_MEMBER_ID),
    UNIQUE KEY uq_gpr_c_circular_member_order (SELECTION_ID, MEMBER_ORDER),
    KEY idx_gpr_c_circular_member_empcode (EMPCODE),
    KEY idx_gpr_c_circular_member_email (EMAIL),
    CONSTRAINT fk_gpr_c_circular_member_selection
        FOREIGN KEY (SELECTION_ID) REFERENCES request_vendor_selections (SELECTION_ID)
        ON DELETE CASCADE ON UPDATE RESTRICT
);

INSERT INTO request_vendor_gpr_c_circular_members (
    SELECTION_ID,
    MEMBER_ORDER,
    EMPCODE,
    MEMBER_NAME,
    EMAIL,
    CREATE_BY
)
SELECT
    s.SELECTION_ID,
    members.MEMBER_ORDER,
    NULLIF(
        CASE
            WHEN JSON_TYPE(members.MEMBER_JSON) = 'OBJECT'
                THEN JSON_UNQUOTE(JSON_EXTRACT(members.MEMBER_JSON, '$.empcode'))
            ELSE NULL
        END,
        ''
    ),
    NULLIF(
        CASE
            WHEN JSON_TYPE(members.MEMBER_JSON) = 'OBJECT'
                THEN JSON_UNQUOTE(JSON_EXTRACT(members.MEMBER_JSON, '$.name'))
            ELSE NULL
        END,
        ''
    ),
    CASE
        WHEN JSON_TYPE(members.MEMBER_JSON) = 'OBJECT'
            THEN JSON_UNQUOTE(JSON_EXTRACT(members.MEMBER_JSON, '$.email'))
        ELSE JSON_UNQUOTE(members.MEMBER_JSON)
    END,
    COALESCE(NULLIF(s.UPDATE_BY, ''), NULLIF(s.CREATE_BY, ''), 'SYSTEM')
FROM request_vendor_selections s
JOIN JSON_TABLE(
    CASE
        WHEN JSON_VALID(s.GPR_C_CIRCULAR_JSON) THEN s.GPR_C_CIRCULAR_JSON
        ELSE JSON_ARRAY()
    END,
    '$[*]' COLUMNS (
        MEMBER_ORDER FOR ORDINALITY,
        MEMBER_JSON JSON PATH '$'
    )
) members
WHERE NULLIF(
    CASE
        WHEN JSON_TYPE(members.MEMBER_JSON) = 'OBJECT'
            THEN JSON_UNQUOTE(JSON_EXTRACT(members.MEMBER_JSON, '$.email'))
        ELSE JSON_UNQUOTE(members.MEMBER_JSON)
    END,
    ''
) IS NOT NULL;

CREATE TABLE request_vendor_gpr_c_action_setup (
    ACTION_SETUP_ID BIGINT NOT NULL AUTO_INCREMENT,
    SELECTION_ID INT NOT NULL,
    STAGE_CODE VARCHAR(32) NOT NULL,
    PIC_NAME VARCHAR(255) NULL,
    PIC_EMAIL VARCHAR(255) NULL,
    RESULT_STATUS VARCHAR(32) NULL,
    RESULT_NOTE TEXT NULL,
    RESULT_UPDATED_AT DATETIME NULL,
    CREATE_BY VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    CREATE_DATE DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UPDATE_BY VARCHAR(50) NULL,
    UPDATE_DATE DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (ACTION_SETUP_ID),
    UNIQUE KEY uq_gpr_c_action_setup_stage (SELECTION_ID, STAGE_CODE),
    KEY idx_gpr_c_action_setup_pic_email (PIC_EMAIL),
    CONSTRAINT fk_gpr_c_action_setup_selection
        FOREIGN KEY (SELECTION_ID) REFERENCES request_vendor_selections (SELECTION_ID)
        ON DELETE CASCADE ON UPDATE RESTRICT
);

INSERT INTO request_vendor_gpr_c_action_setup (
    SELECTION_ID,
    STAGE_CODE,
    PIC_NAME,
    PIC_EMAIL,
    RESULT_STATUS,
    RESULT_NOTE,
    RESULT_UPDATED_AT,
    CREATE_BY
)
SELECT
    s.SELECTION_ID,
    stage.STAGE_CODE,
    NULLIF(JSON_UNQUOTE(JSON_EXTRACT(s.ACTION_REQUIRED_JSON, CONCAT('$.', stage.STAGE_CODE, '.pic_name'))), ''),
    NULLIF(JSON_UNQUOTE(JSON_EXTRACT(s.ACTION_REQUIRED_JSON, CONCAT('$.', stage.STAGE_CODE, '.pic_email'))), ''),
    NULLIF(LOWER(JSON_UNQUOTE(JSON_EXTRACT(s.ACTION_REQUIRED_JSON, CONCAT('$.', stage.STAGE_CODE, '.result_status')))), ''),
    NULLIF(JSON_UNQUOTE(JSON_EXTRACT(s.ACTION_REQUIRED_JSON, CONCAT('$.', stage.STAGE_CODE, '.result_note'))), ''),
    STR_TO_DATE(
        NULLIF(JSON_UNQUOTE(JSON_EXTRACT(s.ACTION_REQUIRED_JSON, CONCAT('$.', stage.STAGE_CODE, '.result_updated_at'))), ''),
        '%Y-%m-%d %H:%i:%s'
    ),
    COALESCE(NULLIF(s.UPDATE_BY, ''), NULLIF(s.CREATE_BY, ''), 'SYSTEM')
FROM request_vendor_selections s
CROSS JOIN (
    SELECT 'engineer' AS STAGE_CODE
    UNION ALL SELECT 'emr'
    UNION ALL SELECT 'qms'
    UNION ALL SELECT 'pm_manager'
) stage
WHERE JSON_VALID(s.ACTION_REQUIRED_JSON)
  AND JSON_EXTRACT(s.ACTION_REQUIRED_JSON, CONCAT('$.', stage.STAGE_CODE)) IS NOT NULL;

SELECT 'gpr circular members' AS entity, COUNT(*) AS row_count
FROM request_vendor_gpr_c_circular_members
UNION ALL
SELECT 'gpr action setup', COUNT(*)
FROM request_vendor_gpr_c_action_setup;
