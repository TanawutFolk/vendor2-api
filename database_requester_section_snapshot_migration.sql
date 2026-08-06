-- Store the requester's section at submission time so history remains stable
-- when the employee later moves to another section.

SET @has_requester_section := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'request_register_vendor'
      AND COLUMN_NAME = 'REQUESTER_SECTION'
);

SET @ddl := IF(
    @has_requester_section = 0,
    'ALTER TABLE request_register_vendor ADD COLUMN REQUESTER_SECTION VARCHAR(150) NULL AFTER REQUEST_BY_EMPLOYEECODE',
    'SELECT 1'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_section_date_index := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'request_register_vendor'
      AND INDEX_NAME = 'IX_REQUEST_HISTORY_SECTION_DATE'
);

SET @ddl := IF(
    @has_section_date_index = 0,
    'CREATE INDEX IX_REQUEST_HISTORY_SECTION_DATE ON request_register_vendor (INUSE, REQUESTER_SECTION, CREATE_DATE)',
    'SELECT 1'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_request_date_index := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'request_register_vendor'
      AND INDEX_NAME = 'IX_REQUEST_HISTORY_DATE'
);

SET @ddl := IF(
    @has_request_date_index = 0,
    'CREATE INDEX IX_REQUEST_HISTORY_DATE ON request_register_vendor (INUSE, CREATE_DATE)',
    'SELECT 1'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
