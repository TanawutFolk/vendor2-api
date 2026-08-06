-- Vendor status master used by Find Vendor and Re-register.
-- This migration does not update any row in vendors. IDs intentionally match
-- the existing vendors.FFT_STATUS values so the rollout is data-neutral.
-- IN_PROGRESS is not written to vendors.FFT_STATUS, but it still has a master ID
-- so API filters and derived vendor status values remain ID-based end to end.

CREATE TABLE IF NOT EXISTS m_vendor_status (
    M_VENDOR_STATUS_ID TINYINT UNSIGNED NOT NULL,
    STATUS_CODE VARCHAR(32) NOT NULL,
    STATUS_LABEL_EN VARCHAR(100) NOT NULL,
    STATUS_LABEL_TH VARCHAR(100) NULL,
    SORT_ORDER SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    CREATE_BY VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    CREATE_DATE DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UPDATE_BY VARCHAR(50) NULL,
    UPDATE_DATE DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INUSE TINYINT(1) NOT NULL DEFAULT 1,
    DESCRIPTION VARCHAR(100) NULL,
    PRIMARY KEY (M_VENDOR_STATUS_ID),
    UNIQUE KEY uq_m_vendor_status_code (STATUS_CODE),
    KEY idx_m_vendor_status_active (INUSE, SORT_ORDER)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO m_vendor_status (
    M_VENDOR_STATUS_ID,
    STATUS_CODE,
    STATUS_LABEL_EN,
    STATUS_LABEL_TH,
    SORT_ORDER,
    CREATE_BY,
    UPDATE_BY,
    INUSE,
    DESCRIPTION
)
VALUES
    (0, 'NOT_REGISTERED', 'Not Registered', 'ยังไม่ได้ลงทะเบียน', 1, 'VENDOR_STATUS_MIGRATION', 'VENDOR_STATUS_MIGRATION', 1, 'Vendor has not completed account registration'),
    (1, 'REGISTERED', 'Registered', 'ลงทะเบียนแล้ว', 2, 'VENDOR_STATUS_MIGRATION', 'VENDOR_STATUS_MIGRATION', 1, 'Vendor has completed account registration'),
    (2, 'CANNOT_REGISTER', 'Cannot Register', 'ไม่สามารถลงทะเบียนได้', 3, 'VENDOR_STATUS_MIGRATION', 'VENDOR_STATUS_MIGRATION', 1, 'Vendor is blocked from registration'),
    (3, 'IN_PROGRESS', 'In Progress', 'กำลังดำเนินการ', 4, 'VENDOR_STATUS_MIGRATION', 'VENDOR_STATUS_MIGRATION', 1, 'Vendor has an active registration request; derived and not stored in vendors.FFT_STATUS')
ON DUPLICATE KEY UPDATE
    STATUS_CODE = VALUES(STATUS_CODE),
    STATUS_LABEL_EN = VALUES(STATUS_LABEL_EN),
    STATUS_LABEL_TH = VALUES(STATUS_LABEL_TH),
    SORT_ORDER = VALUES(SORT_ORDER),
    UPDATE_BY = 'VENDOR_STATUS_MIGRATION',
    INUSE = 1,
    DESCRIPTION = VALUES(DESCRIPTION);

SELECT
    M_VENDOR_STATUS_ID,
    STATUS_CODE,
    STATUS_LABEL_EN,
    STATUS_LABEL_TH,
    SORT_ORDER,
    INUSE
FROM m_vendor_status
ORDER BY SORT_ORDER, M_VENDOR_STATUS_ID;
