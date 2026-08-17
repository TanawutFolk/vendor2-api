-- Store Re-check remarks separately from rejection reasons.
-- Run this script while connected to the target Vendor database.

SET @recheck_reason_column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'request_approval_log'
      AND COLUMN_NAME = 'RECHECK_REASON'
);

SET @add_recheck_reason_sql = IF(
    @recheck_reason_column_exists = 0,
    'ALTER TABLE request_approval_log ADD COLUMN RECHECK_REASON VARCHAR(500) NULL AFTER REJECT_REASON',
    'SELECT 1'
);

PREPARE add_recheck_reason_statement FROM @add_recheck_reason_sql;
EXECUTE add_recheck_reason_statement;
DEALLOCATE PREPARE add_recheck_reason_statement;

-- Move legacy Re-check remarks out of REJECT_REASON. DESCRIPTION remains metadata only.
UPDATE request_approval_log
SET RECHECK_REASON = COALESCE(
        NULLIF(RECHECK_REASON, ''),
        NULLIF(REJECT_REASON, ''),
        NULLIF(DESCRIPTION, '')
    ),
    REJECT_REASON = NULL
WHERE UPPER(COALESCE(ACTION_CODE, '')) = 'RECHECK'
   OR LOWER(COALESCE(ACTION_TYPE, '')) IN (
       'recheck',
       'recheck_to_pic',
       'recheck_document_check'
   );

SELECT
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'request_approval_log'
  AND COLUMN_NAME IN ('REJECT_REASON', 'RECHECK_REASON')
ORDER BY ORDINAL_POSITION;
