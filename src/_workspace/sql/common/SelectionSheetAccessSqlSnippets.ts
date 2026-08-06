const toPositiveId = (value: any) => {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : 0
}

export const SelectionSheetAccessSqlSnippets = {
  editableExpr: (
    requestAlias: any,
    dataItem: {
      EDITABLE_WORKFLOW_STEP_MASTER_IDS?: any[]
      M_APPROVAL_STEP_IN_PROGRESS_STATUS_ID?: any
    }
  ) => {
    const requestAliasSql = String(requestAlias)
    const editableStepIds = (Array.isArray(dataItem.EDITABLE_WORKFLOW_STEP_MASTER_IDS)
      ? dataItem.EDITABLE_WORKFLOW_STEP_MASTER_IDS
      : [])
      .map(toPositiveId)
      .filter(Boolean)
    const inProgressStatusId = toPositiveId(dataItem.M_APPROVAL_STEP_IN_PROGRESS_STATUS_ID)

    if (editableStepIds.length === 0 || !inProgressStatusId) return '0'

    let sql = `
      CASE
        WHEN EXISTS (
          SELECT 1
          FROM request_approval_step current_selection_step
          WHERE current_selection_step.REQUEST_APPROVAL_STEP_ID = dataItem.REQUEST_ALIAS.CURRENT_REQUEST_APPROVAL_STEP_ID
            AND current_selection_step.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_ALIAS.REQUEST_REGISTER_VENDOR_ID
            AND current_selection_step.WORKFLOW_STEP_MASTER_ID IN (
              dataItem.EDITABLE_WORKFLOW_STEP_MASTER_IDS
            )
            AND current_selection_step.M_APPROVAL_STEP_STATUS_ID = dataItem.M_APPROVAL_STEP_IN_PROGRESS_STATUS_ID
            AND current_selection_step.INUSE = 1
        )
        THEN 1
        ELSE 0
      END
    `

    sql = sql.replaceAll('dataItem.EDITABLE_WORKFLOW_STEP_MASTER_IDS', editableStepIds.join(', '))
    sql = sql.replaceAll('dataItem.M_APPROVAL_STEP_IN_PROGRESS_STATUS_ID', inProgressStatusId.toString())
    sql = sql.replaceAll('dataItem.REQUEST_ALIAS', requestAliasSql)

    return sql
  }
}
