ALTER TABLE request_vendor_selections
    ADD COLUMN action_required_json LONGTEXT NULL AFTER gpr_c_circular_json;
