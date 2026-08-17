-- Allow each GPR C checker row to target either one Product Main or one Section.
-- Target: _test_vendor_tanawut_2026_07_14 (MySQL 8+)
-- Section identity comes from PERSON_DB.set_section_fed.SECT_NAME; no physical FK is created.

USE `_test_vendor_tanawut_2026_07_14`;

SET @has_section_name := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'request_vendor_gpr_c_product_group_checkers'
      AND COLUMN_NAME = 'SECTION_NAME'
);

SET @ddl := IF(
    @has_section_name = 0,
    'ALTER TABLE request_vendor_gpr_c_product_group_checkers ADD COLUMN SECTION_NAME VARCHAR(255) NULL AFTER PRODUCT_MAIN_NAME',
    'SELECT 1'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE request_vendor_gpr_c_product_group_checkers
    MODIFY COLUMN PRODUCT_MAIN_ID INT NULL,
    MODIFY COLUMN PRODUCT_MAIN_NAME VARCHAR(100) NULL;

SET @has_section_index := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'request_vendor_gpr_c_product_group_checkers'
      AND INDEX_NAME = 'idx_gpr_c_checker_section'
);

SET @ddl := IF(
    @has_section_index = 0,
    'CREATE INDEX idx_gpr_c_checker_section ON request_vendor_gpr_c_product_group_checkers (SECTION_NAME)',
    'SELECT 1'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_selector_check := (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'request_vendor_gpr_c_product_group_checkers'
      AND CONSTRAINT_NAME = 'chk_gpr_c_checker_one_selector'
      AND CONSTRAINT_TYPE = 'CHECK'
);

SET @ddl := IF(
    @has_selector_check = 0,
    'ALTER TABLE request_vendor_gpr_c_product_group_checkers ADD CONSTRAINT chk_gpr_c_checker_one_selector CHECK ((PRODUCT_MAIN_ID IS NOT NULL AND PRODUCT_MAIN_NAME IS NOT NULL AND SECTION_NAME IS NULL) OR (PRODUCT_MAIN_ID IS NULL AND PRODUCT_MAIN_NAME IS NULL AND NULLIF(TRIM(SECTION_NAME), '''') IS NOT NULL))',
    'SELECT 1'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_KEY
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'request_vendor_gpr_c_product_group_checkers'
  AND COLUMN_NAME IN ('PRODUCT_MAIN_ID', 'PRODUCT_MAIN_NAME', 'SECTION_NAME')
ORDER BY ORDINAL_POSITION;
