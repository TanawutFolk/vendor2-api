-- Item 4.11 is Optional. This updates existing Selection Sheet rows idempotently.
UPDATE vendor_selection_criteria
SET CRITERIA_VALUE = 'Optional',
    UPDATE_BY = 'SYSTEM',
    UPDATE_DATE = NOW()
WHERE CRITERIA_NO = '4.11'
  AND COALESCE(CRITERIA_VALUE, '') <> 'Optional';

SELECT
    COUNT(*) AS NON_OPTIONAL_4_11_COUNT
FROM vendor_selection_criteria
WHERE CRITERIA_NO = '4.11'
  AND COALESCE(CRITERIA_VALUE, '') <> 'Optional';
