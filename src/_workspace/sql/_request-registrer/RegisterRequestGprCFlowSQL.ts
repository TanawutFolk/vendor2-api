export interface GprCFlowDataItem {
    request_id?: number | string
    selection_id?: number | string
    gpr_c_flow_id?: number | string
    gpr_c_step_id?: number | string
    action_required_id?: number | string
    flow_status?: string
    current_step_code?: string
    requester_empcode?: string
    requester_submitted_at?: string
    gpr_c_approver_empcode?: string
    gpr_c_approver_name?: string
    gpr_c_approver_email?: string
    pc_pic_name?: string
    pc_pic_email?: string
    circular_json?: string
    completed_at?: string
    rejected_at?: string
    rejected_by?: string
    rejected_remark?: string
    step_order?: number | string
    step_code?: string
    step_name?: string
    approver_empcode?: string
    approver_name?: string
    approver_email?: string
    step_status?: string
    action_by?: string
    action_type?: string
    action_remark?: string
    stage_code?: string
    stage_name?: string
    pic_name?: string
    pic_email?: string
    required_detail?: string
    result_status?: string
    result_remark?: string
    result_by?: string
    sent_at?: string
    CREATE_BY?: string
    UPDATE_BY?: string
}

const esc = (value: any) => String(value ?? '').replace(/'/g, "\\'")
const num = (value: any) => Number(value) || 0
const nullableDate = (value: any) => value === 'NOW()' ? 'NOW()' : 'NULL'

export const RegisterRequestGprCFlowSQL = {
    getSelectionIdByRequest: (dataItem: GprCFlowDataItem) => {
        return `
            SELECT SELECTION_ID
            FROM request_vendor_selections
            WHERE request_id = ${num(dataItem.request_id)}
              AND INUSE = 1
            ORDER BY selection_id DESC
            LIMIT 1
        `
    },

    getFlowByRequestId: (dataItem: GprCFlowDataItem) => {
        return `
            SELECT *
            FROM REQUEST_VENDOR_GPR_C_FLOWS
            WHERE REQUEST_ID = ${num(dataItem.request_id)}
              AND INUSE = 1
            ORDER BY GPR_C_FLOW_ID DESC
            LIMIT 1
        `
    },

    insertFlow: (dataItem: GprCFlowDataItem) => {
        return `
            INSERT INTO REQUEST_VENDOR_GPR_C_FLOWS (
                REQUEST_ID,
                SELECTION_ID,
                FLOW_STATUS,
                CURRENT_STEP_CODE,
                REQUESTER_EMPCODE,
                CREATE_BY,
                UPDATE_BY,
                INUSE
            ) VALUES (
                ${num(dataItem.request_id)},
                ${dataItem.selection_id ? num(dataItem.selection_id) : 'NULL'},
                '${esc(dataItem.flow_status || 'REQUESTER_SETUP')}',
                '${esc(dataItem.current_step_code || 'REQUESTER_SETUP')}',
                '${esc(dataItem.requester_empcode)}',
                '${esc(dataItem.CREATE_BY || 'SYSTEM')}',
                '${esc(dataItem.UPDATE_BY || dataItem.CREATE_BY || 'SYSTEM')}',
                1
            )
        `
    },

    updateFlowSetup: (dataItem: GprCFlowDataItem) => {
        return `
            UPDATE REQUEST_VENDOR_GPR_C_FLOWS SET
                SELECTION_ID = ${dataItem.selection_id ? num(dataItem.selection_id) : 'SELECTION_ID'},
                FLOW_STATUS = '${esc(dataItem.flow_status || 'IN_PROGRESS')}',
                CURRENT_STEP_CODE = '${esc(dataItem.current_step_code || 'REQUESTER_APPROVER')}',
                REQUESTER_EMPCODE = '${esc(dataItem.requester_empcode)}',
                REQUESTER_SUBMITTED_AT = NOW(),
                GPR_C_APPROVER_EMPCODE = '${esc(dataItem.gpr_c_approver_empcode)}',
                GPR_C_APPROVER_NAME = '${esc(dataItem.gpr_c_approver_name)}',
                GPR_C_APPROVER_EMAIL = '${esc(dataItem.gpr_c_approver_email)}',
                PC_PIC_NAME = '${esc(dataItem.pc_pic_name)}',
                PC_PIC_EMAIL = '${esc(dataItem.pc_pic_email)}',
                CIRCULAR_JSON = '${esc(dataItem.circular_json || '[]')}',
                UPDATE_BY = '${esc(dataItem.UPDATE_BY || 'SYSTEM')}',
                UPDATE_DATE = NOW()
            WHERE GPR_C_FLOW_ID = ${num(dataItem.gpr_c_flow_id)}
        `
    },

    updateFlowStatus: (dataItem: GprCFlowDataItem) => {
        return `
            UPDATE REQUEST_VENDOR_GPR_C_FLOWS SET
                FLOW_STATUS = '${esc(dataItem.flow_status)}',
                CURRENT_STEP_CODE = ${dataItem.current_step_code === null ? 'NULL' : `'${esc(dataItem.current_step_code)}'`},
                COMPLETED_AT = ${nullableDate(dataItem.completed_at)},
                REJECTED_AT = ${nullableDate(dataItem.rejected_at)},
                REJECTED_BY = '${esc(dataItem.rejected_by)}',
                REJECTED_REMARK = '${esc(dataItem.rejected_remark)}',
                UPDATE_BY = '${esc(dataItem.UPDATE_BY || 'SYSTEM')}',
                UPDATE_DATE = NOW()
            WHERE GPR_C_FLOW_ID = ${num(dataItem.gpr_c_flow_id)}
        `
    },

    deactivateStepsByFlow: (dataItem: GprCFlowDataItem) => {
        return `
            UPDATE REQUEST_VENDOR_GPR_C_STEPS SET
                INUSE = 0,
                UPDATE_BY = '${esc(dataItem.UPDATE_BY || 'SYSTEM')}',
                UPDATE_DATE = NOW()
            WHERE GPR_C_FLOW_ID = ${num(dataItem.gpr_c_flow_id)}
              AND INUSE = 1
        `
    },

    insertStep: (dataItem: GprCFlowDataItem) => {
        return `
            INSERT INTO REQUEST_VENDOR_GPR_C_STEPS (
                GPR_C_FLOW_ID,
                REQUEST_ID,
                STEP_ORDER,
                STEP_CODE,
                STEP_NAME,
                APPROVER_EMPCODE,
                APPROVER_NAME,
                APPROVER_EMAIL,
                STEP_STATUS,
                CREATE_BY,
                UPDATE_BY,
                INUSE
            ) VALUES (
                ${num(dataItem.gpr_c_flow_id)},
                ${num(dataItem.request_id)},
                ${num(dataItem.step_order)},
                '${esc(dataItem.step_code)}',
                '${esc(dataItem.step_name)}',
                '${esc(dataItem.approver_empcode)}',
                '${esc(dataItem.approver_name)}',
                '${esc(dataItem.approver_email)}',
                '${esc(dataItem.step_status || 'PENDING')}',
                '${esc(dataItem.CREATE_BY || 'SYSTEM')}',
                '${esc(dataItem.UPDATE_BY || dataItem.CREATE_BY || 'SYSTEM')}',
                1
            )
        `
    },

    getStepsByFlow: (dataItem: GprCFlowDataItem) => {
        return `
            SELECT *
            FROM REQUEST_VENDOR_GPR_C_STEPS
            WHERE GPR_C_FLOW_ID = ${num(dataItem.gpr_c_flow_id)}
              AND INUSE = 1
            ORDER BY STEP_ORDER ASC
        `
    },

    getCurrentStepByFlow: (dataItem: GprCFlowDataItem) => {
        return `
            SELECT *
            FROM REQUEST_VENDOR_GPR_C_STEPS
            WHERE GPR_C_FLOW_ID = ${num(dataItem.gpr_c_flow_id)}
              AND STEP_STATUS = 'IN_PROGRESS'
              AND INUSE = 1
            ORDER BY STEP_ORDER ASC
            LIMIT 1
        `
    },

    updateStepAction: (dataItem: GprCFlowDataItem) => {
        return `
            UPDATE REQUEST_VENDOR_GPR_C_STEPS SET
                STEP_STATUS = '${esc(dataItem.step_status)}',
                ACTION_BY = '${esc(dataItem.action_by)}',
                ACTION_TYPE = '${esc(dataItem.action_type)}',
                ACTION_REMARK = '${esc(dataItem.action_remark)}',
                ACTION_DATE = NOW(),
                UPDATE_BY = '${esc(dataItem.UPDATE_BY || dataItem.action_by || 'SYSTEM')}',
                UPDATE_DATE = NOW()
            WHERE GPR_C_STEP_ID = ${num(dataItem.gpr_c_step_id)}
        `
    },

    activateStep: (dataItem: GprCFlowDataItem) => {
        return `
            UPDATE REQUEST_VENDOR_GPR_C_STEPS SET
                STEP_STATUS = 'IN_PROGRESS',
                UPDATE_BY = '${esc(dataItem.UPDATE_BY || 'SYSTEM')}',
                UPDATE_DATE = NOW()
            WHERE GPR_C_STEP_ID = ${num(dataItem.gpr_c_step_id)}
        `
    },

    skipPendingSteps: (dataItem: GprCFlowDataItem) => {
        return `
            UPDATE REQUEST_VENDOR_GPR_C_STEPS SET
                STEP_STATUS = 'SKIPPED',
                UPDATE_BY = '${esc(dataItem.UPDATE_BY || 'SYSTEM')}',
                UPDATE_DATE = NOW()
            WHERE GPR_C_FLOW_ID = ${num(dataItem.gpr_c_flow_id)}
              AND STEP_STATUS = 'PENDING'
              AND INUSE = 1
        `
    },

    insertActionRequired: (dataItem: GprCFlowDataItem) => {
        return `
            INSERT INTO REQUEST_VENDOR_GPR_C_ACTION_REQUIRED (
                GPR_C_FLOW_ID,
                GPR_C_STEP_ID,
                REQUEST_ID,
                STAGE_CODE,
                STAGE_NAME,
                PIC_NAME,
                PIC_EMAIL,
                REQUIRED_DETAIL,
                RESULT_STATUS,
                SENT_AT,
                CREATE_BY,
                UPDATE_BY,
                INUSE
            ) VALUES (
                ${num(dataItem.gpr_c_flow_id)},
                ${num(dataItem.gpr_c_step_id)},
                ${num(dataItem.request_id)},
                '${esc(dataItem.stage_code)}',
                '${esc(dataItem.stage_name)}',
                '${esc(dataItem.pic_name)}',
                '${esc(dataItem.pic_email)}',
                '${esc(dataItem.required_detail)}',
                '${esc(dataItem.result_status || 'PENDING')}',
                NOW(),
                '${esc(dataItem.CREATE_BY || 'SYSTEM')}',
                '${esc(dataItem.UPDATE_BY || dataItem.CREATE_BY || 'SYSTEM')}',
                1
            )
        `
    },

    updateActionRequiredResult: (dataItem: GprCFlowDataItem) => {
        return `
            UPDATE REQUEST_VENDOR_GPR_C_ACTION_REQUIRED SET
                RESULT_STATUS = '${esc(dataItem.result_status || 'COMPLETED')}',
                RESULT_REMARK = '${esc(dataItem.result_remark)}',
                RESULT_BY = '${esc(dataItem.result_by)}',
                RESULT_AT = NOW(),
                UPDATE_BY = '${esc(dataItem.UPDATE_BY || dataItem.result_by || 'SYSTEM')}',
                UPDATE_DATE = NOW()
            WHERE ACTION_REQUIRED_ID = ${num(dataItem.action_required_id)}
              AND INUSE = 1
        `
    },

    getActionRequiredById: (dataItem: GprCFlowDataItem) => {
        return `
            SELECT *
            FROM REQUEST_VENDOR_GPR_C_ACTION_REQUIRED
            WHERE ACTION_REQUIRED_ID = ${num(dataItem.action_required_id)}
              AND INUSE = 1
            LIMIT 1
        `
    },

    getActionRequiredQueueByPicEmail: (dataItem: GprCFlowDataItem) => {
        return `
            SELECT
                ar.*,
                f.FLOW_STATUS,
                f.CURRENT_STEP_CODE,
                s.STEP_NAME,
                rr.request_number,
                rr.request_status,
                v.company_name
            FROM REQUEST_VENDOR_GPR_C_ACTION_REQUIRED ar
                JOIN REQUEST_VENDOR_GPR_C_FLOWS f
                    ON f.GPR_C_FLOW_ID = ar.GPR_C_FLOW_ID
                    AND f.INUSE = 1
                LEFT JOIN REQUEST_VENDOR_GPR_C_STEPS s
                    ON s.GPR_C_STEP_ID = ar.GPR_C_STEP_ID
                JOIN request_register_vendor rr
                    ON rr.request_id = ar.REQUEST_ID
                LEFT JOIN vendors v
                    ON v.vendor_id = rr.vendor_id
            WHERE ar.INUSE = 1
              AND LOWER(ar.PIC_EMAIL) = LOWER('${esc(dataItem.pic_email)}')
              AND ar.RESULT_STATUS IN ('PENDING', 'INCOMPLETE')
            ORDER BY ar.SENT_AT DESC, ar.ACTION_REQUIRED_ID DESC
        `
    },

    getQueueByApprover: (dataItem: GprCFlowDataItem) => {
        return `
            SELECT
                f.*,
                s.GPR_C_STEP_ID,
                s.STEP_ORDER,
                s.STEP_CODE,
                s.STEP_NAME,
                s.APPROVER_EMPCODE,
                s.APPROVER_NAME,
                s.APPROVER_EMAIL,
                s.STEP_STATUS,
                rr.request_number,
                rr.request_status,
                rr.supportProduct_Process,
                rr.purchase_frequency,
                rr.Request_By_EmployeeCode,
                rr.CREATE_DATE AS REQUEST_CREATE_DATE,
                v.company_name,
                v.address,
                v.vendor_region,
                vc.contact_name,
                COALESCE(vc_sel.email, vc.email, v.emailmain) AS vendor_email,
                vc.tel_phone
            FROM REQUEST_VENDOR_GPR_C_FLOWS f
                JOIN REQUEST_VENDOR_GPR_C_STEPS s
                    ON s.GPR_C_FLOW_ID = f.GPR_C_FLOW_ID
                    AND s.STEP_STATUS = 'IN_PROGRESS'
                    AND s.INUSE = 1
                JOIN request_register_vendor rr
                    ON rr.request_id = f.REQUEST_ID
                LEFT JOIN vendors v
                    ON v.vendor_id = rr.vendor_id
                LEFT JOIN vendor_contacts vc
                    ON vc.vendor_id = v.vendor_id
                LEFT JOIN vendor_contacts vc_sel
                    ON vc_sel.vendor_contact_id = rr.vendor_contact_id
                    AND vc_sel.INUSE = 1
            WHERE f.INUSE = 1
              AND f.FLOW_STATUS = 'IN_PROGRESS'
              AND s.APPROVER_EMPCODE = '${esc(dataItem.approver_empcode)}'
            ORDER BY f.GPR_C_FLOW_ID DESC
        `
    },

    getRequestSummary: (dataItem: GprCFlowDataItem) => {
        return `
            SELECT
                rr.request_id,
                rr.request_number,
                rr.request_status,
                rr.assign_to,
                rr.Request_By_EmployeeCode,
                rr.supportProduct_Process,
                rr.purchase_frequency,
                rr.cc_emails,
                rr.CREATE_DATE,
                v.vendor_id,
                v.company_name,
                v.address,
                v.vendor_region,
                v.emailmain,
                vc.contact_name,
                vc.email AS vendor_email,
                vc.tel_phone
            FROM request_register_vendor rr
                LEFT JOIN vendors v ON v.vendor_id = rr.vendor_id
                LEFT JOIN vendor_contacts vc ON vc.vendor_contact_id = rr.vendor_contact_id
            WHERE rr.request_id = ${num(dataItem.request_id)}
            LIMIT 1
        `
    }
}
