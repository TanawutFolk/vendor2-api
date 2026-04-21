ALTER TABLE request_vendor_selections
    ADD COLUMN gpr_c_approver_name VARCHAR(255) NULL AFTER document_path,
    ADD COLUMN gpr_c_approver_email VARCHAR(255) NULL AFTER gpr_c_approver_name,
    ADD COLUMN gpr_c_pc_pic_name VARCHAR(255) NULL AFTER gpr_c_approver_email,
    ADD COLUMN gpr_c_pc_pic_email VARCHAR(255) NULL AFTER gpr_c_pc_pic_name,
    ADD COLUMN gpr_c_circular_json LONGTEXT NULL AFTER gpr_c_pc_pic_email;
