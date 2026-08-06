-- Supplier / Outsourcing Selection Sheet
-- Normalize criteria attachments: one file per row, maximum three active files per criterion.
-- This project intentionally does not create physical foreign keys; relations are joined in SQL.

CREATE TABLE IF NOT EXISTS vendor_selection_criteria_files (
    VENDOR_SELECTION_CRITERIA_FILE_ID BIGINT NOT NULL AUTO_INCREMENT,
    VENDOR_SELECTION_CRITERIA_ID BIGINT NOT NULL,
    FILE_ORDER TINYINT UNSIGNED NOT NULL,
    FILE_PATH VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
    FILE_NAME VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
    FILE_SIZE BIGINT UNSIGNED DEFAULT NULL,
    FILE_TYPE VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
    CREATE_BY VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'SYSTEM',
    CREATE_DATE DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UPDATE_BY VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
    UPDATE_DATE DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INUSE TINYINT(1) NOT NULL DEFAULT 1,
    DESCRIPTION VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
    PRIMARY KEY (VENDOR_SELECTION_CRITERIA_FILE_ID) USING BTREE,
    UNIQUE KEY uq_vendor_selection_criteria_file_order (VENDOR_SELECTION_CRITERIA_ID, FILE_ORDER) USING BTREE,
    KEY idx_vendor_selection_criteria_files_lookup (VENDOR_SELECTION_CRITERIA_ID, INUSE) USING BTREE,
    CONSTRAINT chk_vendor_selection_criteria_file_order CHECK (FILE_ORDER BETWEEN 1 AND 3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- CHECK does not link tables; together with the unique slot key it enforces at most three rows per criterion.
SET @add_criteria_file_order_check_sql = IF(
    EXISTS(
        SELECT 1
        FROM information_schema.TABLE_CONSTRAINTS
        WHERE CONSTRAINT_SCHEMA = DATABASE()
          AND TABLE_NAME = 'vendor_selection_criteria_files'
          AND CONSTRAINT_NAME = 'chk_vendor_selection_criteria_file_order'
    ),
    'SELECT 1',
    'ALTER TABLE vendor_selection_criteria_files
       ADD CONSTRAINT chk_vendor_selection_criteria_file_order CHECK (FILE_ORDER BETWEEN 1 AND 3)'
);
PREPARE add_criteria_file_order_check_stmt FROM @add_criteria_file_order_check_sql;
EXECUTE add_criteria_file_order_check_stmt;
DEALLOCATE PREPARE add_criteria_file_order_check_stmt;

-- Preserve every existing attachment as slot 1 before removing the legacy columns.
-- Dynamic SQL keeps the migration safe to run again after those columns are gone.
SET @has_legacy_criteria_file_columns = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'vendor_selection_criteria'
      AND COLUMN_NAME IN ('UPLOADED_FILE_PATH', 'UPLOADED_FILE_NAME')
);

SET @backfill_criteria_files_sql = IF(
    @has_legacy_criteria_file_columns = 2,
    'INSERT IGNORE INTO vendor_selection_criteria_files (
        VENDOR_SELECTION_CRITERIA_ID, FILE_ORDER, FILE_PATH, FILE_NAME,
        FILE_SIZE, FILE_TYPE, CREATE_BY, CREATE_DATE, UPDATE_BY, UPDATE_DATE,
        INUSE, DESCRIPTION
     )
     SELECT
        VENDOR_SELECTION_CRITERIA_ID, 1, UPLOADED_FILE_PATH,
        COALESCE(NULLIF(TRIM(UPLOADED_FILE_NAME), ''''), CONCAT(''criteria-file-'', VENDOR_SELECTION_CRITERIA_ID)),
        NULL, NULL, CREATE_BY, CREATE_DATE, UPDATE_BY, UPDATE_DATE,
        INUSE, ''Migrated legacy criteria file''
     FROM vendor_selection_criteria
     WHERE UPLOADED_FILE_PATH IS NOT NULL
       AND TRIM(UPLOADED_FILE_PATH) <> ''''',
    'SELECT 1'
);
PREPARE backfill_criteria_files_stmt FROM @backfill_criteria_files_sql;
EXECUTE backfill_criteria_files_stmt;
DEALLOCATE PREPARE backfill_criteria_files_stmt;

SET @drop_legacy_criteria_file_path_sql = IF(
    EXISTS(
        SELECT 1
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'vendor_selection_criteria'
          AND COLUMN_NAME = 'UPLOADED_FILE_PATH'
    ),
    'ALTER TABLE vendor_selection_criteria DROP COLUMN UPLOADED_FILE_PATH',
    'SELECT 1'
);
PREPARE drop_legacy_criteria_file_path_stmt FROM @drop_legacy_criteria_file_path_sql;
EXECUTE drop_legacy_criteria_file_path_stmt;
DEALLOCATE PREPARE drop_legacy_criteria_file_path_stmt;

SET @drop_legacy_criteria_file_name_sql = IF(
    EXISTS(
        SELECT 1
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'vendor_selection_criteria'
          AND COLUMN_NAME = 'UPLOADED_FILE_NAME'
    ),
    'ALTER TABLE vendor_selection_criteria DROP COLUMN UPLOADED_FILE_NAME',
    'SELECT 1'
);
PREPARE drop_legacy_criteria_file_name_stmt FROM @drop_legacy_criteria_file_name_sql;
EXECUTE drop_legacy_criteria_file_name_stmt;
DEALLOCATE PREPARE drop_legacy_criteria_file_name_stmt;

-- Verification result: every row must have FILE_ORDER between 1 and 3 and no criterion may exceed 3 active files.
SELECT
    COUNT(*) AS INVALID_FILE_ORDER_COUNT
FROM vendor_selection_criteria_files
WHERE FILE_ORDER NOT BETWEEN 1 AND 3;

SELECT
    VENDOR_SELECTION_CRITERIA_ID,
    COUNT(*) AS ACTIVE_FILE_COUNT
FROM vendor_selection_criteria_files
WHERE INUSE = 1
GROUP BY VENDOR_SELECTION_CRITERIA_ID
HAVING COUNT(*) > 3;
