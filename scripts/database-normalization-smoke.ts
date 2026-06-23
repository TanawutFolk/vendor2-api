import path from 'node:path'
import dotenv from 'dotenv'
import mysql, { RowDataPacket } from 'mysql2/promise'
import { RequestRegisterPageSQL } from '../src/_workspace/sql/_request-register/RequestRegisterPageSQL'
import { ApprovalQueueSQL } from '../src/_workspace/sql/_approval-queue/ApprovalQueueSQL'
import { TaskManagerSQL } from '../src/_workspace/sql/_task-manager/TaskManagerSQL'
import { TaskManagerRequestService } from '../src/_workspace/services/_task-manager/TaskManagerRequestService'
import { AssigneesSQL } from '../src/_workspace/sql/_Employee-manager/AssigneesSQL'
import { AddVendorSQL } from '../src/_workspace/sql/_add-vendor/AddVendorSQL'
import { FindVendorSQL } from '../src/_workspace/sql/_find-vendor/FindVendorSQL'

dotenv.config({ path: path.resolve(process.cwd(), '.env.development') })

const connection = await mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER_NAME,
  password: process.env.PASSWORD,
  database: process.env.DB,
  multipleStatements: true,
})

const search = async (sql: string) => {
  const [rows] = await connection.query<RowDataPacket[]>(sql)
  return rows
}

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message)
}

try {
  const statusRows = await search(await RequestRegisterPageSQL.getStatusOptions())
  assert(statusRows.length === 12, `Expected 12 active workflow statuses, received ${statusRows.length}`)
  assert(
    statusRows.every((row) => row.stepCode !== 'REJECTED' && Number(row.workflowStepId || row.workflow_step_id) > 0),
    'Status options should contain workflow steps only'
  )

  const approvalSteps = await search(
    await RequestRegisterPageSQL.getApprovalSteps({ REQUEST_REGISTER_VENDOR_ID: 145 })
  )
  assert(approvalSteps.length === 12, `Expected 12 approval steps, received ${approvalSteps.length}`)
  assert(
    approvalSteps.every((row) => Number(row.WORKFLOW_STEP_MASTER_ID || row.workflow_step_id) > 0),
    'Approval step is missing WORKFLOW_STEP_MASTER_ID'
  )

  const requestRows = await search(await ApprovalQueueSQL.getById({ REQUEST_REGISTER_VENDOR_ID: 145 }))
  assert(requestRows.length === 1, `Expected request 145, received ${requestRows.length} rows`)
  assert(
    String(requestRows[0].REQUEST_STATE || requestRows[0].request_state) === 'completed',
    'Request 145 was not migrated to completed REQUEST_STATE'
  )

  const [taskCountSql, taskDataSql] = await TaskManagerSQL.searchAllTask(TaskManagerRequestService.buildTaskManagerSqlDataItem({
    SEARCHFILTERS: [],
    COLUMNFILTERS: [],
    ORDER: 't.REQUEST_REGISTER_VENDOR_ID DESC',
    LIMIT: 10,
    OFFSET: 0,
  }))
  const [taskCountRows, taskRows] = await Promise.all([
    search(taskCountSql),
    search(taskDataSql),
  ])

  const integrityRows = await search(`
    SELECT
      (SELECT COUNT(*) FROM request_approval_step WHERE WORKFLOW_STEP_MASTER_ID IS NULL) AS unlinked_steps,
      (
        SELECT COUNT(*)
        FROM request_register_vendor_contacts rc
        LEFT JOIN request_register_vendor rr ON rr.REQUEST_REGISTER_VENDOR_ID = rc.REQUEST_REGISTER_VENDOR_ID
        LEFT JOIN vendor_contacts vc ON vc.VENDOR_CONTACTS_ID = rc.VENDOR_CONTACTS_ID
        WHERE rr.REQUEST_REGISTER_VENDOR_ID IS NULL OR vc.VENDOR_CONTACTS_ID IS NULL
      ) AS orphan_contacts,
      (
        SELECT COUNT(*)
        FROM request_vendor_selections s
        LEFT JOIN request_register_vendor rr ON rr.REQUEST_REGISTER_VENDOR_ID = s.REQUEST_REGISTER_VENDOR_ID
        WHERE rr.REQUEST_REGISTER_VENDOR_ID IS NULL
      ) AS orphan_selections
  `)

  assert(Number(integrityRows[0].unlinked_steps) === 0, 'Unlinked workflow steps remain')
  assert(Number(integrityRows[0].orphan_contacts) === 0, 'Orphan request contacts remain')
  assert(Number(integrityRows[0].orphan_selections) === 0, 'Orphan selections remain')

  const selectionRows = await search(
    RequestRegisterPageSQL.getSelection({ REQUEST_REGISTER_VENDOR_ID: 145 })
  )
  const selectionId = Number(selectionRows[0]?.REQUEST_VENDOR_SELECTIONS_ID || selectionRows[0]?.selection_id || 0)
  const actionSetupRows = selectionId
    ? await search(RequestRegisterPageSQL.getGprActionSetup({ REQUEST_VENDOR_SELECTIONS_ID: selectionId }))
    : []
  const circularMemberRows = selectionId
    ? await search(RequestRegisterPageSQL.getGprCircularMembers({ REQUEST_VENDOR_SELECTIONS_ID: selectionId }))
    : []

  assert(actionSetupRows.length === 4, `Expected 4 GPR action setup rows, received ${actionSetupRows.length}`)

  await search(`EXPLAIN ${RequestRegisterPageSQL.insertSelection({
    REQUEST_REGISTER_VENDOR_ID: 145,
    BUSINESS_CATEGORY: '',
    CURRENCY: 'THB',
    GPR_C_APPROVER_EMPCODE: 'SMOKE_APPROVER',
    GPR_C_PC_PIC_EMPCODE: 'SMOKE_PC_PIC',
    GPR_C_CIRCULAR_JSON: '[]',
    ACTION_REQUIRED_JSON: '{}',
    CREATE_BY: 'SMOKE',
    UPDATE_BY: 'SMOKE',
  })}`)

  await connection.beginTransaction()
  try {
    const smokeActor = String(
      requestRows[0].CREATE_BY ||
      requestRows[0].REQUEST_BY_EMPLOYEECODE ||
      'SYSTEM'
    )
    const firstStepId = Number(approvalSteps[0]?.REQUEST_APPROVAL_STEP_ID || approvalSteps[0]?.step_id || 0)

    await connection.query(await ApprovalQueueSQL.createApprovalLog({
      REQUEST_REGISTER_VENDOR_ID: 145,
      REQUEST_APPROVAL_STEP_ID: firstStepId,
      ACTION_BY: smokeActor,
      ACTION_TYPE: 'smoke_test',
      REMARK: 'Audit smoke rollback',
    }))

    if (selectionId) {
      await connection.query(RequestRegisterPageSQL.insertGprCircularMember({
        REQUEST_VENDOR_SELECTIONS_ID: selectionId,
        MEMBER_ORDER: 99,
        EMPCODE: 'SMOKE',
        MEMBER_NAME: 'Smoke Test',
        EMAIL: 'smoke@example.invalid',
        CREATE_BY: 'SMOKE',
        UPDATE_BY: 'SMOKE',
      }))
      await connection.query(RequestRegisterPageSQL.insertGprActionSetup({
        REQUEST_VENDOR_SELECTIONS_ID: selectionId,
        STAGE_CODE: 'smoke',
        PIC_NAME: 'Smoke Test',
        PIC_EMAIL: 'smoke@example.invalid',
        RESULT_STATUS: 'pending',
        RESULT_NOTE: 'rollback',
        CREATE_BY: 'SMOKE',
        UPDATE_BY: 'SMOKE',
      }))
      await connection.query(RequestRegisterPageSQL.insertFinancial({
        REQUEST_VENDOR_SELECTIONS_ID: selectionId,
        YEAR: 'SMOKE',
        TOTAL_REVENUE: 1,
        NET_PROFIT: 1,
        CREATE_BY: 'SMOKE',
        UPDATE_BY: 'SMOKE',
      }))
      await connection.query(RequestRegisterPageSQL.insertCriteria({
        REQUEST_VENDOR_SELECTIONS_ID: selectionId,
        NO: 'SMOKE',
        CRITERIA: 'pass',
        REMARK: 'Audit smoke rollback',
        CREATE_BY: 'SMOKE',
        UPDATE_BY: 'SMOKE',
      }))
    }

    await connection.query(AssigneesSQL.insert({
      EMPCODE: 'SMOKE999',
      EMPNAME: 'Audit Smoke',
      EMPEMAIL: 'smoke@example.invalid',
      GROUP_CODE: 'SMOKE_AUDIT',
      GROUP_NAME: 'Smoke Audit',
      CREATE_BY: 'SMOKE',
      UPDATE_BY: 'SMOKE',
      INUSE: 1,
    }))

    const vendorTypeRows = await search(
      'SELECT MASTER_VENDOR_TYPES_ID FROM master_vendor_types WHERE INUSE = 1 LIMIT 1'
    )
    const productGroupRows = await search(
      'SELECT MASTER_PRODUCT_GROUPS_ID FROM master_product_groups WHERE INUSE = 1 LIMIT 1'
    )
    const [vendorInsertResult] = await connection.query(await AddVendorSQL.createVendor({
      COMPANY_NAME: 'ZZ AUDIT SMOKE ROLLBACK',
      PROVINCE: 'BANGKOK',
      POSTAL_CODE: '00000',
      MASTER_VENDOR_TYPES_ID: Number(vendorTypeRows[0]?.MASTER_VENDOR_TYPES_ID || 0),
      VENDOR_REGION: 'Local',
      NOTE: 'Audit smoke rollback',
      CREATE_BY: 'SMOKE',
    }))
    const vendorId = Number((vendorInsertResult as { insertId?: number }).insertId || 0)
    await connection.query(await AddVendorSQL.createVendorContact({
      VENDORS_ID: vendorId,
      CONTACT_NAME: 'Audit Smoke',
      EMAIL: 'smoke@example.invalid',
      CREATE_BY: 'SMOKE',
    }))
    await connection.query(await AddVendorSQL.createVendorProduct({
      VENDORS_ID: vendorId,
      MASTER_PRODUCT_GROUPS_ID: Number(productGroupRows[0]?.MASTER_PRODUCT_GROUPS_ID || 0),
      PRODUCT_NAME: 'Audit Smoke',
      CREATE_BY: 'SMOKE',
    }))

    await connection.query(FindVendorSQL.truncateStagingPrones())
    await connection.query(FindVendorSQL.insertStagingPronesBatch([{
      CUSTOMER_CODE: 'SMOKE',
      CUSTOMER_NAME: 'Audit Smoke',
      CUSTOMER_ADDRESS1: '',
      CUSTOMER_ADDRESS2: '',
      CUSTOMER_ADDRESS3: '',
      CUSTOMER_TEL: '',
    }]))
    await connection.query(FindVendorSQL.truncateMatchResult())
    await connection.query(FindVendorSQL.insertMatchResultBatch([{
      VENDORS_ID: Number(requestRows[0].VENDORS_ID || 0),
      STATUS_CHECK: 'smoke',
      PRONES_CODE: 'SMOKE',
      PRONES_NAME: 'Audit Smoke',
      MATCH_METHOD: 'audit smoke rollback',
    }]))

    await connection.query(await RequestRegisterPageSQL.updateRequest({
      REQUEST_REGISTER_VENDOR_ID: 145,
      VENDOR_CONTACTS_ID: 0,
      SUPPORTPRODUCT_PROCESS: requestRows[0].SUPPORTPRODUCT_PROCESS || '',
      PURCHASE_FREQUENCY: requestRows[0].PURCHASE_FREQUENCY || '',
      REQUESTER_REMARK: requestRows[0].REQUESTER_REMARK || '',
      UPDATE_BY: 'SMOKE',
    }))
  } finally {
    await connection.rollback()
  }

  console.table([
    { check: 'active status options', value: statusRows.length },
    { check: 'workflow-linked approval steps', value: approvalSteps.length },
    { check: 'request 145 state', value: requestRows[0].REQUEST_STATE || requestRows[0].request_state },
    { check: 'task manager total', value: taskCountRows[0]?.TOTAL_COUNT || 0 },
    { check: 'task manager sample rows', value: taskRows.length },
    { check: 'unlinked workflow steps', value: integrityRows[0].unlinked_steps },
    { check: 'orphan contacts', value: integrityRows[0].orphan_contacts },
    { check: 'orphan selections', value: integrityRows[0].orphan_selections },
    { check: 'GPR action setup rows', value: actionSetupRows.length },
    { check: 'GPR circular members', value: circularMemberRows.length },
    { check: 'audit write SQL rollback', value: 'passed' },
  ])
} finally {
  await connection.end()
}
