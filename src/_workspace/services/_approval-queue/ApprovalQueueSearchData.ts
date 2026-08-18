import getSqlWhere_aggrid from '@src/helpers/getSqlWhere_aggrid'
import { ApprovalQueueSearchSQL } from '../../sql/_approval-queue/ApprovalQueueSearchSQL'

const toPositiveInteger = (value: unknown): number | null => {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

export const partitionRequestStatusFilters = (filters: any[] = []) => {
  const remaining: any[] = []
  const statusIds: number[] = []

  for (const filter of Array.isArray(filters) ? filters : []) {
    const filterId = String(filter?.id ?? '').trim().toUpperCase()

    if (filterId === 'CURRENT_M_REQUEST_STATUS_ID' || filterId === 'M_REQUEST_STATUS_ID') {
      const statusId = toPositiveInteger(filter?.value)
      if (statusId !== null) statusIds.push(statusId)
      continue
    }

    if (filterId === 'REQUEST_STATUS') {
      if (String(filter?.value ?? '').trim()) {
        throw new Error('Request status filter must use CURRENT_M_REQUEST_STATUS_ID')
      }
      continue
    }

    remaining.push(filter)
  }

  return { remaining, statusIds }
}

export const buildRequestStatusFilterClauses = (statusIds: number[] = []) => {
  const clauses: string[] = []
  const uniqueStatusIds = [
    ...new Set(
      statusIds.map(toPositiveInteger).filter((value): value is number => value !== null),
    ),
  ]

  if (uniqueStatusIds.length > 0) {
    clauses.push(
      ApprovalQueueSearchSQL.requestStatusIdFilter({
        REQUEST_ALIAS: 'rr',
        STATUS_IDS: uniqueStatusIds.join(', '),
      }),
    )
  }

  return clauses
}

const tableIds = [
  { table: 'rr', id: 'REQUEST_REGISTER_VENDOR_ID', column: 'REQUEST_REGISTER_VENDOR_ID', Fns: '=' },
  { table: 'rr', id: 'REQUEST_NUMBER', Fns: 'LIKE' },
  { table: 'rr', id: 'SUPPORTPRODUCT_PROCESS', Fns: 'LIKE' },
  { table: 'rr', id: 'PURCHASE_FREQUENCY', Fns: 'LIKE' },
  { table: 'rr', id: 'ASSIGN_TO', Fns: '=' },
  { table: 'rr', id: 'PIC_EMAIL', Fns: 'LIKE' },
  { table: 'rr', id: 'REQUEST_BY_EMPLOYEECODE', Fns: '=' },
  { table: 'rr', id: 'REQUESTER_SECTION', Fns: '=' },
  { table: 'rr', id: 'CREATE_DATE', Fns: '=' },
  { table: 'v', id: 'COMPANY_NAME', Fns: 'LIKE' },
  { table: 'v', id: 'FFT_VENDOR_CODE', Fns: 'LIKE' },
  { table: 'v', id: 'FFT_STATUS', Fns: '=' },
  { table: 'v', id: 'VENDOR_REGION', Fns: '=' },
  { table: 'v', id: 'PROVINCE', Fns: 'LIKE' },
  { table: 'vt', id: 'VENDOR_TYPE_NAME', alias: 'BUSINESS_CATEGORY_NAME', Fns: 'LIKE' },
]

export const prepareApprovalQueueSearchData = (dataItem: any) => {
  if (Array.isArray(dataItem.SEARCHFILTERS)) {
    dataItem.SEARCHFILTERS = dataItem.SEARCHFILTERS.filter(
      (item: any) => item.value !== null && item.value !== undefined && item.value !== '',
    )
  }

  const searchStatusFilters = partitionRequestStatusFilters(dataItem.SEARCHFILTERS)
  const columnStatusFilters = partitionRequestStatusFilters(dataItem.COLUMNFILTERS)
  dataItem.SEARCHFILTERS = searchStatusFilters.remaining
  dataItem.COLUMNFILTERS = columnStatusFilters.remaining

  const requestStatusIds = [
    ...searchStatusFilters.statusIds,
    ...columnStatusFilters.statusIds,
  ]

  getSqlWhere_aggrid(dataItem, tableIds, 'REQUEST_REGISTER_VENDOR_ID')
  dataItem.LIMIT = dataItem.LIMIT || 50

  let sqlWhere = String(dataItem.SQLWHERE || '')
    .trim()
    .replace(/^WHERE\s+/i, '')
  const manualFilters: string[] = []
  const actorFilters: string[] = []

  if (dataItem.APPROVER_EMPCODE) {
    const queueWorkflowStepTypeId = toPositiveInteger(dataItem.QUEUE_WORKFLOW_STEP_TYPE_ID)
    if (dataItem.QUEUE_WORKFLOW_STEP_TYPE_ID && queueWorkflowStepTypeId === null) {
      throw new Error('Queue workflow step filter must use WORKFLOW_STEP_TYPE_ID')
    }
    const queueWorkflowStepMasterId = toPositiveInteger(dataItem.QUEUE_WORKFLOW_STEP_MASTER_ID)
    if (dataItem.QUEUE_WORKFLOW_STEP_MASTER_ID && queueWorkflowStepMasterId === null) {
      throw new Error('Queue workflow step filter must use WORKFLOW_STEP_MASTER_ID')
    }
    const queueStepCondition = ApprovalQueueSearchSQL.queueStepCondition({
      QUEUE_WORKFLOW_STEP_TYPE_ID: queueWorkflowStepTypeId,
      QUEUE_WORKFLOW_STEP_MASTER_ID: queueWorkflowStepMasterId,
    })
    actorFilters.push(
      ApprovalQueueSearchSQL.approvalActorFilter({
        APPROVER_EMPCODE: dataItem.APPROVER_EMPCODE,
        QUEUE_STEP_CONDITION: queueStepCondition,
      }),
    )
  }

  if (dataItem.ASSIGN_TO) {
    actorFilters.push(ApprovalQueueSearchSQL.assignedPicFilter(dataItem))
  }
  if (actorFilters.length > 0) manualFilters.push('(' + actorFilters.join(' OR ') + ')')

  if (dataItem.REQUEST_BY_EMPLOYEECODE) {
    manualFilters.push(ApprovalQueueSearchSQL.requesterFilter(dataItem))
  }

  const requesterSection = String(dataItem.REQUESTER_SECTION || '').trim()
  if (requesterSection) {
    manualFilters.push(
      ApprovalQueueSearchSQL.requesterSectionFilter({
        REQUESTER_SECTION: requesterSection,
      }),
    )
  }

  const requestYearRaw = dataItem.REQUEST_YEAR
  if (requestYearRaw !== undefined && requestYearRaw !== null && requestYearRaw !== '') {
    const requestYear = Number(requestYearRaw)
    if (!Number.isInteger(requestYear) || requestYear < 1900 || requestYear > 9998) {
      throw new Error('Invalid request year')
    }
    manualFilters.push(
      ApprovalQueueSearchSQL.requestYearFilter({
        REQUEST_YEAR_FROM: requestYear,
        REQUEST_YEAR_TO: requestYear + 1,
      }),
    )
  }

  if (String(dataItem.REQUEST_STATUS || '').trim()) {
    throw new Error('Request status filter must use CURRENT_M_REQUEST_STATUS_ID')
  }
  if (dataItem.CURRENT_M_REQUEST_STATUS_ID || dataItem.M_REQUEST_STATUS_ID) {
    const directStatusFilters = partitionRequestStatusFilters([
      {
        id: 'CURRENT_M_REQUEST_STATUS_ID',
        value: dataItem.CURRENT_M_REQUEST_STATUS_ID || dataItem.M_REQUEST_STATUS_ID,
      },
    ])
    requestStatusIds.push(...directStatusFilters.statusIds)
  }

  manualFilters.push(
    ...buildRequestStatusFilterClauses(requestStatusIds),
  )

  if (manualFilters.length > 0) {
    const combinedManual = manualFilters.join(' AND ')
    sqlWhere = sqlWhere ? sqlWhere + ' AND ' + combinedManual : combinedManual
  }

  dataItem.SQLWHERE = sqlWhere ? ' AND ' + sqlWhere : ''
  dataItem.SQLWHERECOLUMNFILTER = ''
  return dataItem
}
