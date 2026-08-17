-- GPR C Product Checker migration
-- Target: _test_vendor_tanawut_2026_07_14 (MySQL 8+)
-- Date: 2026-07-17
--
-- Project convention: IDs are joined logically in SQL. No physical foreign keys are created.

USE `_test_vendor_tanawut_2026_07_14`;

SET @pc_pic_empcode_column_count = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'request_vendor_gpr_c_flows'
      AND COLUMN_NAME = 'PC_PIC_EMPCODE'
);
SET @pc_pic_empcode_ddl = IF(
    @pc_pic_empcode_column_count = 0,
    'ALTER TABLE request_vendor_gpr_c_flows ADD COLUMN PC_PIC_EMPCODE VARCHAR(50) NULL AFTER GPR_C_APPROVER_EMAIL, ADD KEY idx_gpr_c_flow_pc_pic_empcode (PC_PIC_EMPCODE)',
    'SELECT 1'
);
PREPARE pc_pic_empcode_stmt FROM @pc_pic_empcode_ddl;
EXECUTE pc_pic_empcode_stmt;
DEALLOCATE PREPARE pc_pic_empcode_stmt;

CREATE TABLE IF NOT EXISTS request_vendor_gpr_c_product_group_checkers (
    REQUEST_VENDOR_GPR_C_PRODUCT_GROUP_CHECKERS_ID BIGINT NOT NULL AUTO_INCREMENT,
    REQUEST_VENDOR_SELECTIONS_ID INT NOT NULL,
    ITEM_ORDER SMALLINT UNSIGNED NOT NULL,
    PRODUCT_MAIN_ID INT NULL,
    PRODUCT_MAIN_NAME VARCHAR(100) NULL,
    SECTION_NAME VARCHAR(255) NULL,
    CHECKER_EMPCODE VARCHAR(50) NOT NULL,
    CHECKER_NAME VARCHAR(255) NOT NULL,
    CHECKER_EMAIL VARCHAR(255) NOT NULL,
    CREATE_BY VARCHAR(50) NOT NULL,
    CREATE_DATE DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UPDATE_BY VARCHAR(50) NULL,
    UPDATE_DATE DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INUSE TINYINT(1) NOT NULL DEFAULT 1,
    DESCRIPTION VARCHAR(100) NULL,
    PRIMARY KEY (REQUEST_VENDOR_GPR_C_PRODUCT_GROUP_CHECKERS_ID),
    KEY idx_gpr_c_pg_checker_selection (REQUEST_VENDOR_SELECTIONS_ID, INUSE, ITEM_ORDER),
    KEY idx_gpr_c_product_checker_product (PRODUCT_MAIN_ID),
    KEY idx_gpr_c_checker_section (SECTION_NAME),
    KEY idx_gpr_c_pg_checker_employee (CHECKER_EMPCODE)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Upgrade the earlier Product Group columns without dropping stored rows.
SET @legacy_product_id_column_count = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'request_vendor_gpr_c_product_group_checkers'
      AND COLUMN_NAME = 'MASTER_PRODUCT_GROUPS_ID'
);
SET @product_main_id_column_count = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'request_vendor_gpr_c_product_group_checkers'
      AND COLUMN_NAME = 'PRODUCT_MAIN_ID'
);
SET @product_main_id_ddl = IF(
    @legacy_product_id_column_count = 1 AND @product_main_id_column_count = 0,
    'ALTER TABLE request_vendor_gpr_c_product_group_checkers CHANGE COLUMN MASTER_PRODUCT_GROUPS_ID PRODUCT_MAIN_ID INT NOT NULL',
    'SELECT 1'
);
PREPARE product_main_id_stmt FROM @product_main_id_ddl;
EXECUTE product_main_id_stmt;
DEALLOCATE PREPARE product_main_id_stmt;

SET @legacy_product_name_column_count = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'request_vendor_gpr_c_product_group_checkers'
      AND COLUMN_NAME = 'PRODUCT_GROUP_NAME'
);
SET @product_main_name_column_count = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'request_vendor_gpr_c_product_group_checkers'
      AND COLUMN_NAME = 'PRODUCT_MAIN_NAME'
);
SET @product_main_name_ddl = IF(
    @legacy_product_name_column_count = 1 AND @product_main_name_column_count = 0,
    'ALTER TABLE request_vendor_gpr_c_product_group_checkers CHANGE COLUMN PRODUCT_GROUP_NAME PRODUCT_MAIN_NAME VARCHAR(100) NOT NULL',
    'SELECT 1'
);
PREPARE product_main_name_stmt FROM @product_main_name_ddl;
EXECUTE product_main_name_stmt;
DEALLOCATE PREPARE product_main_name_stmt;

SELECT
    TABLE_NAME,
    ENGINE,
    TABLE_COLLATION
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'request_vendor_gpr_c_product_group_checkers';

SELECT
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_KEY,
    EXTRA
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'request_vendor_gpr_c_product_group_checkers'
ORDER BY ORDINAL_POSITION;
