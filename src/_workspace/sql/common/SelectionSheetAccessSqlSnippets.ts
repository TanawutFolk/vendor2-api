const toPositiveId = (value: any) => {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : 0
}

export const SelectionSheetAccessSqlSnippets = {
  editableExpr: (
    requestAlias: any,
    dataItem: {
      M_APPROVAL_STEP_IN_PROGRESS_STATUS_ID?: any
    }
  ) => {
    const requestAliasSql = String(requestAlias)
    const inProgressStatusId = toPositiveId(dataItem.M_APPROVAL_STEP_IN_PROGRESS_STATUS_ID)

    if (!inProgressStatusId) return '0'

    let sql = `
      CASE
        WHEN EXISTS (
          SELECT 1
          FROM request_approval_step current_selection_step
          INNER JOIN workflow_step_capability current_step_capability
            ON current_step_capability.WORKFLOW_STEP_MASTER_ID = current_selection_step.WORKFLOW_STEP_MASTER_ID
           AND current_step_capability.INUSE = 1
          INNER JOIN m_workflow_capability editable_capability
            ON editable_capability.M_WORKFLOW_CAPABILITY_ID = current_step_capability.M_WORKFLOW_CAPABILITY_ID
           AND editable_capability.CAPABILITY_CODE = 'EDIT_SELECTION_SHEET'
           AND editable_capability.INUSE = 1
          WHERE current_selection_step.REQUEST_APPROVAL_STEP_ID = dataItem.REQUEST_ALIAS.CURRENT_REQUEST_APPROVAL_STEP_ID
            AND current_selection_step.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_ALIAS.REQUEST_REGISTER_VENDOR_ID
            AND current_selection_step.M_APPROVAL_STEP_STATUS_ID = dataItem.M_APPROVAL_STEP_IN_PROGRESS_STATUS_ID
            AND current_selection_step.INUSE = 1
        )
        THEN 1
        ELSE 0
      END
    `

    sql = sql.replaceAll('dataItem.M_APPROVAL_STEP_IN_PROGRESS_STATUS_ID', inProgressStatusId.toString())
    sql = sql.replaceAll('dataItem.REQUEST_ALIAS', requestAliasSql)

    return sql
  }
}
