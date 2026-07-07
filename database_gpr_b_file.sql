-- Vendor2 database: GPR B file support.
-- GPR B is the file the Vendor returns to the PO PIC (when criteria 4.3 = Not Accept,
-- the request enters the GPR C flow). The PO PIC uploads a single GPR B file per request
-- before sending GPR C to the requester for setup. The file itself lives in the
-- 01.Receiving network folder for that request number; only its reference is stored here.
--
-- Stored on request_vendor_selections (one row per request, exists once the GPR A
-- selection sheet is filled — i.e. before the GPR C flow record is created).

ALTER TABLE request_vendor_selections
    ADD COLUMN GPR_B_FILE_PATH VARCHAR(500) NULL AFTER GPR_43_ACCEPTANCE_STATUS,
    ADD COLUMN GPR_B_FILE_NAME VARCHAR(255) NULL AFTER GPR_B_FILE_PATH;
