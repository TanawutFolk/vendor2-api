

export const AccRegisterSQL = {
  getApprovalSteps: async (dataItem: any) => {
    let sql = `
                            SELECT 
                                       ras.REQUEST_APPROVAL_STEP_ID
                                     , ras.REQUEST_REGISTER_VENDOR_ID
                                     , ras.WORKFLOW_STEP_MASTER_ID
                                     , wsm.M_REQUEST_STATUS_ID AS M_REQUEST_STATUS_ID
                                     , ras.STEP_ORDER
                                     , ras.APPROVER_EMPCODE
                                     , ras.STEP_STATUS
                                     , mrs.STATUS_VALUE AS DESCRIPTION
                                     , wsm.STEP_CODE
                                     , wsm.ACTOR_TYPE
                                     , ras.GROUP_CODE
                                     , ras.ASSIGNMENT_MODE
                                     , ras.CREATE_BY
                                     , ras.CREATE_DATE
                                     , ras.UPDATE_BY
                                     , ras.UPDATE_DATE
                                     , mrs.STATUS_VALUE AS MASTER_STATUS_VALUE
                                     , mrs.STATUS_VALUE AS MASTER_STATUS_LABEL
                                     , CONCAT(m.EMPNAME, ' ', m.EMPSURNAME) AS APPROVER_NAME
                            FROM
                                       request_approval_step ras
                                            INNER JOIN
                                       workflow_step_master wsm ON wsm.WORKFLOW_STEP_MASTER_ID = ras.WORKFLOW_STEP_MASTER_ID
                                                                           INNER JOIN
                                                                      m_request_status mrs ON mrs.M_REQUEST_STATUS_ID = wsm.M_REQUEST_STATUS_ID
                                            LEFT JOIN
                                       person.member_fed m ON m.EMPCODE = ras.APPROVER_EMPCODE
                            WHERE
                                       ras.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
                                       AND ras.INUSE = 1
                            ORDER BY
                                       ras.STEP_ORDER ASC
        `

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())

    return sql
  },

  getSelectionVendorCode: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       PROPOSED_VENDOR_CODE AS VENDOR_CODE
                            FROM
                                       request_vendor_selections
                            WHERE
                                       REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
                                       AND INUSE = 1
                            ORDER BY
                                       REQUEST_VENDOR_SELECTIONS_ID DESC
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())

    return sql
  },
  updateApprovalStep: async (dataItem: any) => {
    let sql = `
                            UPDATE request_approval_step SET
                                       STEP_STATUS = LOWER('dataItem.STEP_STATUS')
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       REQUEST_APPROVAL_STEP_ID = dataItem.REQUEST_APPROVAL_STEP_ID
        `

    sql = sql.replaceAll('dataItem.REQUEST_APPROVAL_STEP_ID', (dataItem['REQUEST_APPROVAL_STEP_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.STEP_STATUS', dataItem['STEP_STATUS'] || '')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || '')

    return sql
  },

  createApprovalLog: async (dataItem: any) => {
    let sql = `
                            INSERT INTO request_approval_log (
                                       REQUEST_REGISTER_VENDOR_ID
                                     , REQUEST_APPROVAL_STEP_ID
                                     , ACTION_BY
                                     , ACTION_BY_NAME
                                     , ACTION_TYPE
                                     , DESCRIPTION
                                     , REJECT_REASON
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , CREATE_DATE
                                     , UPDATE_DATE
                                     , INUSE
                            ) VALUES (
                                        dataItem.REQUEST_REGISTER_VENDOR_ID
                                     ,  dataItem.REQUEST_APPROVAL_STEP_ID
                                     , 'dataItem.ACTION_BY'
                                     , COALESCE(
                                           (SELECT CONCAT(pm.EMPNAME, ' ', pm.EMPSURNAME)
                                            FROM person.member_fed pm
                                            WHERE pm.EMPCODE = 'dataItem.ACTION_BY'
                                            LIMIT 1),
                                           'dataItem.ACTION_BY'
                                       )
                                     , 'dataItem.ACTION_TYPE'
                                     , LEFT('dataItem.REMARK', 100)
                                     , CASE
                                           WHEN LOWER('dataItem.ACTION_TYPE') IN ('rejected', 'vendor_disagreed') THEN LEFT('dataItem.REJECT_REASON', 500)
                                           ELSE NULL
                                       END
                                     , 'dataItem.ACTION_BY'
                                     , 'dataItem.ACTION_BY'
                                     , NOW()
                                     , NOW()
                                     , 1
                            )
        `

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.REQUEST_APPROVAL_STEP_ID', dataItem['REQUEST_APPROVAL_STEP_ID'] ? dataItem['REQUEST_APPROVAL_STEP_ID'].toString() : 'NULL')
    sql = sql.replaceAll('dataItem.ACTION_BY', dataItem['ACTION_BY'] || '')
    sql = sql.replaceAll('dataItem.ACTION_TYPE', dataItem['ACTION_TYPE'] || '')
    sql = sql.replaceAll('dataItem.REMARK', dataItem['REMARK'] || '')
    sql = sql.replaceAll('dataItem.REJECT_REASON', dataItem['REJECT_REASON'] ?? dataItem['REMARK'] ?? '')

    return sql
  },

  completeRegistration: async (dataItem: any) => {
    let sql = `
                            UPDATE request_register_vendor SET
                                       APPROVED_VENDOR_CODE = 'dataItem.VENDOR_CODE'
                                     , REQUEST_STATE = 'completed'
                                     , CURRENT_M_REQUEST_STATUS_ID = (
                                           SELECT M_REQUEST_STATUS_ID FROM workflow_step_master
                                           WHERE STEP_CODE = 'ACCOUNT_REGISTERED'
                                             AND INUSE = 1
                                           LIMIT 1
                                       )
                                     , CURRENT_REQUEST_APPROVAL_STEP_ID = NULL
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
        `

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.VENDOR_CODE', dataItem['VENDOR_CODE'] || '')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || 'SYSTEM')

    return sql
  },

  updateRequestVendorCode: async (dataItem: any) => {
    let sql = `
                            UPDATE request_register_vendor SET
                                       APPROVED_VENDOR_CODE = 'dataItem.VENDOR_CODE'
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
        `

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.VENDOR_CODE', dataItem['VENDOR_CODE'] || '')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || 'SYSTEM')

    return sql
  },

  updateVendorFftVendorCode: async (dataItem: any) => {
    let sql = `
                            UPDATE vendors SET
                                       FFT_VENDOR_CODE = 'dataItem.VENDOR_CODE'
                            WHERE
                                       VENDORS_ID = dataItem.VENDORS_ID
        `

    sql = sql.replaceAll('dataItem.VENDORS_ID', (dataItem['VENDORS_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.VENDOR_CODE', dataItem['VENDOR_CODE'] || '')

    return sql
  },

  updateVendorFftStatus: async (dataItem: any) => {
    let sql = `
                            UPDATE vendors SET
                                       FFT_STATUS = dataItem.FFT_STATUS
                            WHERE
                                       VENDORS_ID = dataItem.VENDORS_ID
        `

    sql = sql.replaceAll('dataItem.VENDORS_ID', (dataItem['VENDORS_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.FFT_STATUS', (dataItem['FFT_STATUS'] || 0).toString())

    return sql
  },

  markRequestCompleted: async (dataItem: any) => {
    let sql = `
                            UPDATE request_register_vendor SET
                                       REQUEST_STATE = 'completed'
                                     , CURRENT_M_REQUEST_STATUS_ID = (
                                           SELECT M_REQUEST_STATUS_ID FROM workflow_step_master
                                           WHERE STEP_CODE = 'ACCOUNT_REGISTERED'
                                             AND INUSE = 1
                                           LIMIT 1
                                       )
                                     , CURRENT_REQUEST_APPROVAL_STEP_ID = NULL
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
        `

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || 'SYSTEM')

    return sql
  },
}
