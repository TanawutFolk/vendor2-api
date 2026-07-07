export const GprCSelectionSqlSnippets = {
  gprCSelectionFields: (selectionAlias = 'rvs', requestAlias = 'rr') => `
                                     , COALESCE((
                                           SELECT f.GPR_C_APPROVER_NAME
                                           FROM request_vendor_gpr_c_flows f
                                           WHERE f.REQUEST_REGISTER_VENDOR_ID = ${requestAlias}.REQUEST_REGISTER_VENDOR_ID
                                             AND f.INUSE = 1
                                           ORDER BY f.REQUEST_VENDOR_GPR_C_FLOWS_ID DESC
                                           LIMIT 1
                                       ), '') AS GPR_C_APPROVER_NAME
                                     , COALESCE((
                                           SELECT f.GPR_C_APPROVER_EMAIL
                                           FROM request_vendor_gpr_c_flows f
                                           WHERE f.REQUEST_REGISTER_VENDOR_ID = ${requestAlias}.REQUEST_REGISTER_VENDOR_ID
                                             AND f.INUSE = 1
                                           ORDER BY f.REQUEST_VENDOR_GPR_C_FLOWS_ID DESC
                                           LIMIT 1
                                       ), '') AS GPR_C_APPROVER_EMAIL
                                     , COALESCE((
                                           SELECT f.GPR_C_APPROVER_EMPCODE
                                           FROM request_vendor_gpr_c_flows f
                                           WHERE f.REQUEST_REGISTER_VENDOR_ID = ${requestAlias}.REQUEST_REGISTER_VENDOR_ID
                                             AND f.INUSE = 1
                                           ORDER BY f.REQUEST_VENDOR_GPR_C_FLOWS_ID DESC
                                           LIMIT 1
                                       ), '') AS GPR_C_APPROVER_EMPCODE
                                     , COALESCE((
                                           SELECT f.PC_PIC_NAME
                                           FROM request_vendor_gpr_c_flows f
                                           WHERE f.REQUEST_REGISTER_VENDOR_ID = ${requestAlias}.REQUEST_REGISTER_VENDOR_ID
                                             AND f.INUSE = 1
                                           ORDER BY f.REQUEST_VENDOR_GPR_C_FLOWS_ID DESC
                                           LIMIT 1
                                       ), '') AS GPR_C_PC_PIC_NAME
                                     , COALESCE((
                                           SELECT f.PC_PIC_EMAIL
                                           FROM request_vendor_gpr_c_flows f
                                           WHERE f.REQUEST_REGISTER_VENDOR_ID = ${requestAlias}.REQUEST_REGISTER_VENDOR_ID
                                             AND f.INUSE = 1
                                           ORDER BY f.REQUEST_VENDOR_GPR_C_FLOWS_ID DESC
                                           LIMIT 1
                                       ), '') AS GPR_C_PC_PIC_EMAIL
                                     , '' AS GPR_C_PC_PIC_EMPCODE
                                     , COALESCE((
                                           SELECT JSON_ARRAYAGG(
                                               JSON_OBJECT(
                                                   'empcode', cm.EMPCODE,
                                                   'name', cm.MEMBER_NAME,
                                                   'email', cm.EMAIL
                                               )
                                           )
                                           FROM (
                                               SELECT EMPCODE, MEMBER_NAME, EMAIL
                                               FROM request_vendor_gpr_c_circular_members
                                               WHERE REQUEST_VENDOR_SELECTIONS_ID = ${selectionAlias}.REQUEST_VENDOR_SELECTIONS_ID
                                                 AND INUSE = 1
                                               ORDER BY MEMBER_ORDER ASC
                                           ) cm
                                       ), JSON_ARRAY()) AS GPR_C_CIRCULAR_JSON
                                     , COALESCE((
                                           SELECT JSON_MERGE_PATCH(
                                               COALESCE(
                                                   JSON_OBJECTAGG(
                                                       aset.STAGE_CODE,
                                                       JSON_OBJECT(
                                                           'pic_name', COALESCE(aset.PIC_NAME, ''),
                                                           'pic_email', COALESCE(aset.PIC_EMAIL, ''),
                                                           'result_status', COALESCE(aset.RESULT_STATUS, ''),
                                                           'result_note', COALESCE(aset.RESULT_NOTE, ''),
                                                           'result_updated_at', COALESCE(DATE_FORMAT(aset.RESULT_UPDATED_AT, '%Y-%m-%d %H:%i:%s'), '')
                                                       )
                                                   ),
                                                   JSON_OBJECT()
                                               ),
                                               JSON_OBJECT(
                                                   '_meta',
                                                   JSON_OBJECT(
                                                       'gpr_c_approver_empcode', COALESCE((
                                                           SELECT f.GPR_C_APPROVER_EMPCODE
                                                           FROM request_vendor_gpr_c_flows f
                                                           WHERE f.REQUEST_REGISTER_VENDOR_ID = ${requestAlias}.REQUEST_REGISTER_VENDOR_ID
                                                             AND f.INUSE = 1
                                                           ORDER BY f.REQUEST_VENDOR_GPR_C_FLOWS_ID DESC
                                                           LIMIT 1
                                                       ), ''),
                                                       'gpr_c_pc_pic_empcode', ''
                                                   )
                                               )
                                           )
                                           FROM request_vendor_gpr_c_action_setup aset
                                           WHERE aset.REQUEST_VENDOR_SELECTIONS_ID = ${selectionAlias}.REQUEST_VENDOR_SELECTIONS_ID
                                             AND aset.INUSE = 1
                                       ), JSON_OBJECT('_meta', JSON_OBJECT('gpr_c_approver_empcode', '', 'gpr_c_pc_pic_empcode', ''))) AS ACTION_REQUIRED_JSON
                                     , ${selectionAlias}.GPR_B_FILE_PATH AS GPR_B_FILE_PATH
                                     , ${selectionAlias}.GPR_B_FILE_NAME AS GPR_B_FILE_NAME
`,
}
