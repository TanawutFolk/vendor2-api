import { MySQLExecute } from '@businessData/dbExecute'
import { RequestRegisterPageSQL } from '../../sql/_request-register/RequestRegisterPageSQL'
import { GprCApprovalService } from '../_approval-GPRC/GprCApprovalService'

const normalizeValue = (value: any) => String(value || '').trim()

const getValue = (row: any, ...keys: string[]) => {
  for (const key of keys) {
    if (row && row[key] !== undefined && row[key] !== null) return row[key]
  }
  return ''
}

const normalizeGpr43AcceptanceStatus = (value: any) => {
  const normalized = normalizeValue(value).replace(/[_-]+/g, ' ').toUpperCase()
  if (['ACCEPT', 'ACCEPTED', 'AGREE', 'AGREED'].includes(normalized)) return 'ACCEPT'
  if (['NOT ACCEPT', 'NOT ACCEPTED', 'DISAGREE', 'DISAGREED', 'REJECT', 'REJECTED'].includes(normalized)) return 'NOT_ACCEPT'
  return normalized || ''
}

const resolveGpr43AcceptanceStatus = (formData: any) => {
  const explicitStatus = normalizeGpr43AcceptanceStatus(formData?.gpr_43_acceptance_status)
  if (explicitStatus) return explicitStatus

  const criteriaRows = Array.isArray(formData?.criteria) ? formData.criteria : []
  const gpr43Row = criteriaRows.find((item: any) => normalizeValue(item?.no) === '4.3')
  return normalizeGpr43AcceptanceStatus(gpr43Row?.remark)
}

const parseStoredObject = (raw: any): Record<string, any> => {
  if (!raw) return {}

  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

const parseCircularMembers = (raw: any) => {
  if (!raw) return []

  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (!Array.isArray(parsed)) return []

    return parsed
      .map((item) => {
        if (typeof item === 'string') {
          return { empcode: '', name: '', email: normalizeValue(item) }
        }

        return {
          empcode: normalizeValue(item?.empcode),
          name: normalizeValue(item?.name),
          email: normalizeValue(item?.email),
        }
      })
      .filter((item) => item.empcode || item.name || item.email)
      .slice(0, 6)
  } catch {
    return []
  }
}

const resolveMemberByEmpCode = async (empcode: string) => {
  const safeEmpCode = normalizeValue(empcode)
  if (!safeEmpCode) return null

  const memberSql = await RequestRegisterPageSQL.getMemberByEmpCode({ EMPCODE: safeEmpCode })
  const memberRes = (await MySQLExecute.search(memberSql)) as any[]
  const member = memberRes[0]

  if (!member) {
    throw new Error(`Employee code not found in person.member_fed: ${safeEmpCode}`)
  }

  const name = [getValue(member, 'empName', 'EMPNAME'), getValue(member, 'empSurname', 'EMPSURNAME')].map(normalizeValue).filter(Boolean).join(' ')
  const email = normalizeValue(getValue(member, 'empEmail', 'EMPEMAIL'))

  if (!email) {
    throw new Error(`Employee code has no email in person.member_fed: ${safeEmpCode}`)
  }

  return {
    empcode: safeEmpCode,
    name,
    email,
  }
}

const buildActionRequiredMeta = (existingActionRequired: any, meta: Record<string, any>) => ({
  ...Object.fromEntries(Object.entries(existingActionRequired || {}).filter(([key]) => key !== '_meta')),
  _meta: meta,
})

const GPR_ACTION_SETUP_STAGES = ['engineer', 'emr', 'qms', 'pm_manager'] as const

const actionSetupRowsToPayload = (rows: any[] = []) => Object.fromEntries(
  (Array.isArray(rows) ? rows : []).map((row) => [
    normalizeValue(getValue(row, 'stage_code', 'STAGE_CODE')),
    {
      pic_name: normalizeValue(getValue(row, 'pic_name', 'PIC_NAME')),
      pic_email: normalizeValue(getValue(row, 'pic_email', 'PIC_EMAIL')),
      result_status: normalizeValue(getValue(row, 'result_status', 'RESULT_STATUS')),
      result_note: normalizeValue(getValue(row, 'result_note', 'RESULT_NOTE')),
      result_updated_at: getValue(row, 'result_updated_at', 'RESULT_UPDATED_AT') || '',
    },
  ]).filter(([stageCode]) => Boolean(stageCode))
)

const buildNormalizedGprSetupSql = async (
  selectionId: number,
  circularMembersRaw: any[],
  actionRequiredRaw: any,
  actor: string
) => {
  const circularMembers = (Array.isArray(circularMembersRaw) ? circularMembersRaw : [])
    .map((item) => (
      typeof item === 'string'
        ? { empcode: '', name: '', email: normalizeValue(item) }
        : {
          empcode: normalizeValue(item?.empcode),
          name: normalizeValue(item?.name),
          email: normalizeValue(item?.email),
        }
    ))
    .filter((item) => item.email)
    .slice(0, 6)
  const actionRequired = parseStoredObject(actionRequiredRaw)
  const sqlList = [
    RequestRegisterPageSQL.deleteGprCircularMembers({ SELECTION_ID: selectionId }),
    RequestRegisterPageSQL.deleteGprActionSetup({ SELECTION_ID: selectionId }),
  ]

  circularMembers.forEach((member, index) => {
    sqlList.push(RequestRegisterPageSQL.insertGprCircularMember({
      SELECTION_ID: selectionId,
      MEMBER_ORDER: index + 1,
      EMPCODE: member.empcode,
      MEMBER_NAME: member.name,
      EMAIL: member.email,
      CREATE_BY: actor,
      UPDATE_BY: actor,
    }))
  })

  GPR_ACTION_SETUP_STAGES.forEach((stageCode) => {
    const stage = parseStoredObject(actionRequired[stageCode])
    sqlList.push(RequestRegisterPageSQL.insertGprActionSetup({
      SELECTION_ID: selectionId,
      STAGE_CODE: stageCode,
      PIC_NAME: stage.pic_name,
      PIC_EMAIL: stage.pic_email,
      RESULT_STATUS: stage.result_status,
      RESULT_NOTE: stage.result_note,
      RESULT_UPDATED_AT: stage.result_updated_at,
      CREATE_BY: actor,
      UPDATE_BY: actor,
    }))
  })

  return Promise.all(sqlList)
}

export const RequestRegisterGprService = {
  resolveEmployeeProfile: async (dataItem: any) => {
    const empcode = normalizeValue(dataItem?.EMPCODE)

    if (!empcode) {
      throw new Error('Missing empcode')
    }

    const member = await resolveMemberByEmpCode(empcode)

    return {
      Status: true,
      Message: 'Employee profile resolved successfully',
      ResultOnDb: member || {},
      MethodOnDb: 'Resolve Employee Profile',
      TotalCountOnDb: member ? 1 : 0,
    }
  },

  saveGprForm: async (dataItem: any) => {
    try {
      const reqId = dataItem.REQUEST_ID
      if (!reqId) throw new Error('Missing request_id')

      const rawFormData = typeof dataItem.GPR_DATA === 'string' ? JSON.parse(dataItem.GPR_DATA) : dataItem.GPR_DATA || {}
      const updateBy = dataItem.UPDATE_BY || 'SYSTEM'
      const circularList = Array.isArray(rawFormData.gpr_c_circular_list) ? rawFormData.gpr_c_circular_list.map((email: any) => String(email || '').trim()).filter(Boolean) : []

      if (circularList.length > 6) {
        throw new Error('Circular list supports a maximum of 6 persons')
      }

      const formData: any = {
        REQUEST_ID: reqId,
        BUSINESS_CATEGORY: rawFormData.business_category || '',
        START_YEAR: rawFormData.start_year || '',
        AUTHORIZED_CAPITAL: rawFormData.authorized_capital || '',
        ESTABLISH: rawFormData.establish || '',
        NUMBER_OF_EMPLOYEES: rawFormData.number_of_employees || '',
        MANUFACTURED_COUNTRY: rawFormData.manufactured_country || '',
        VENDOR_ORIGINAL_COUNTRY: rawFormData.vendor_original_country || '',
        SANCTIONS: rawFormData.sanctions || '',
        CURRENCY: rawFormData.currency || 'THB',
        SUGGESTION: rawFormData.suggestion || '',
        RESULT: rawFormData.result || '',
        PATH: rawFormData.path || '',
        VENDOR_CODE_SELECTOR: rawFormData.vendor_code_selector || '',
        GPR_43_ACCEPTANCE_STATUS: resolveGpr43AcceptanceStatus(rawFormData),
        COMPLETION_DATE: rawFormData.completion_date || '',
        CREATE_BY: dataItem.CREATE_BY || updateBy,
        UPDATE_BY: updateBy,
      }

      const sqlList = []
      const checkSql = await RequestRegisterPageSQL.checkSelectionExists(formData)
      const checkRes = (await MySQLExecute.search(checkSql)) as any[]
      let selection_id = getValue(checkRes[0], 'selection_id', 'SELECTION_ID')

      if (selection_id) {
        formData.SELECTION_ID = selection_id
        sqlList.push(await RequestRegisterPageSQL.updateSelection(formData))
      } else {
        const insertSql = await RequestRegisterPageSQL.insertSelection(formData)
        const res = (await MySQLExecute.execute(insertSql)) as any
        selection_id = res.insertId
        formData.SELECTION_ID = selection_id
      }

      if (!selection_id) throw new Error('Failed to create/identify GPR selection record')

      sqlList.push(await RequestRegisterPageSQL.deleteFinancials({ SELECTION_ID: selection_id }))
      sqlList.push(await RequestRegisterPageSQL.deleteCriteria({ SELECTION_ID: selection_id }))
      sqlList.push(...await buildNormalizedGprSetupSql(
        Number(selection_id),
        circularList,
        rawFormData.action_required_setup,
        updateBy
      ))

      if (rawFormData.sales_profit) {
        for (const sp of rawFormData.sales_profit) {
          const hasFinancialValue = [sp.year, sp.total_revenue, sp.net_profit]
            .some((value) => normalizeValue(value) !== '')
          if (!hasFinancialValue) continue

          sqlList.push(await RequestRegisterPageSQL.insertFinancial({
            SELECTION_ID: selection_id,
            YEAR: sp.year || '',
            TOTAL_REVENUE: sp.total_revenue || '',
            NET_PROFIT: sp.net_profit || '',
            CREATE_BY: formData.CREATE_BY || formData.UPDATE_BY || 'SYSTEM',
            UPDATE_BY: formData.UPDATE_BY || formData.CREATE_BY || 'SYSTEM',
          }))
        }
      }
      if (rawFormData.criteria) {
        for (const cr of rawFormData.criteria) {
          sqlList.push(await RequestRegisterPageSQL.insertCriteria({
            SELECTION_ID: selection_id,
            NO: cr.no || '',
            CRITERIA: cr.criteria || '',
            REMARK: cr.remark || '',
            UPLOADED_FILE: cr.uploaded_file || '',
            UPLOADED_NAME: cr.uploaded_name || '',
            CREATE_BY: formData.CREATE_BY || formData.UPDATE_BY || 'SYSTEM',
            UPDATE_BY: formData.UPDATE_BY || formData.CREATE_BY || 'SYSTEM',
          }))
        }
      }

      const resultData = await MySQLExecute.executeList(sqlList)
      return {
        Status: true,
        Message: 'Selection Sheet saved successfully',
        ResultOnDb: resultData,
        MethodOnDb: 'Save GPR Form',
        TotalCountOnDb: 1,
      }
    } catch (error: any) {
      return {
        Status: false,
        Message: error?.message || 'Save failed',
        ResultOnDb: [],
        MethodOnDb: 'Save Selection Sheet Failed Contact TANAWUT PATRAWAN',
        TotalCountOnDb: 0,
      }
    }
  },

  saveGprCNotification: async (dataItem: any) => {
    try {
      const reqId = Number(dataItem.REQUEST_ID)
      if (!reqId || Number.isNaN(reqId)) throw new Error('Missing request_id')

      const creator = String(dataItem.CREATE_BY || dataItem.UPDATE_BY || '').trim() || 'SYSTEM'
      const updater = String(dataItem.UPDATE_BY || '').trim() || 'SYSTEM'
      const gprCData = typeof dataItem.GPR_C_DATA === 'string' ? JSON.parse(dataItem.GPR_C_DATA) : dataItem.GPR_C_DATA || {}

      const requesterSql = await RequestRegisterPageSQL.getRequesterByRequestId({ REQUEST_ID: reqId })
      const requesterRes = (await MySQLExecute.search(requesterSql)) as any[]
      const requesterCode = String(getValue(requesterRes[0], 'Request_By_EmployeeCode', 'REQUEST_BY_EMPLOYEECODE')).trim()

      if (!requesterCode) {
        throw new Error('Requester not found for this request')
      }

      if (updater !== requesterCode) {
        throw new Error('Only requester can update GPR C notification setup')
      }

      const existingSelectionSql = RequestRegisterPageSQL.getSelection({ REQUEST_ID: reqId })
      const existingSelectionRows = (await MySQLExecute.search(existingSelectionSql)) as any[]
      const existingSelection = existingSelectionRows[0] || null

      const approverEmpCode = normalizeValue(gprCData.gpr_c_approver_empcode)
      const approverMember = approverEmpCode ? await resolveMemberByEmpCode(approverEmpCode) : null

      const circularEmpcodes = Array.isArray(gprCData.gpr_c_circular_empcodes) ? gprCData.gpr_c_circular_empcodes.map((item: any) => normalizeValue(item)).filter(Boolean) : []

      if (circularEmpcodes.length > 6) {
        throw new Error('Circular list supports a maximum of 6 persons')
      }

      const circularMembers = []
      for (const empcode of circularEmpcodes) {
        const member = await resolveMemberByEmpCode(empcode)
        if (member) circularMembers.push(member)
      }

      const selectionIdForSetup = getValue(existingSelection, 'selection_id', 'SELECTION_ID')
      const existingActionSetupRows = selectionIdForSetup
        ? await MySQLExecute.search(RequestRegisterPageSQL.getGprActionSetup({ SELECTION_ID: selectionIdForSetup })) as any[]
        : []
      const existingActionRequiredSetup = actionSetupRowsToPayload(existingActionSetupRows)
      const incomingActionRequiredSetup = parseStoredObject(gprCData.action_required_setup)
      const actionRequiredSetup = {
        ...existingActionRequiredSetup,
        ...incomingActionRequiredSetup,
      }
      const actionRequiredPayload = buildActionRequiredMeta(actionRequiredSetup, {
        gpr_c_approver_empcode: approverMember?.empcode || '',
        gpr_c_pc_pic_empcode: normalizeValue(gprCData.gpr_c_pc_pic_empcode),
        gpr_c_circular_members: circularMembers,
      })

      const formData: any = {
        REQUEST_ID: reqId,
        CREATE_BY: creator,
        UPDATE_BY: updater,
      }

      let selection_id = getValue(existingSelection, 'selection_id', 'SELECTION_ID')

      if (selection_id) {
        formData.SELECTION_ID = selection_id
        const updateSql = await RequestRegisterPageSQL.updateSelectionGprCOnly(formData)
        await MySQLExecute.execute(updateSql)
      } else {
        const insertData = {
          ...formData,
          BUSINESS_CATEGORY: '',
          START_YEAR: '',
          AUTHORIZED_CAPITAL: '',
          ESTABLISH: '',
          NUMBER_OF_EMPLOYEES: '',
          MANUFACTURED_COUNTRY: '',
          VENDOR_ORIGINAL_COUNTRY: '',
          SANCTIONS: '',
          CURRENCY: 'THB',
          SUGGESTION: '',
          RESULT: '',
          PATH: '',
          VENDOR_CODE_SELECTOR: '',
          COMPLETION_DATE: '',
        }
        const insertSql = await RequestRegisterPageSQL.insertSelection(insertData)
        const insertResult = (await MySQLExecute.execute(insertSql)) as any
        selection_id = insertResult.insertId
      }

      if (!selection_id) throw new Error('Failed to create/identify GPR selection record')

      const normalizedSetupSql = await buildNormalizedGprSetupSql(
        Number(selection_id),
        circularMembers,
        actionRequiredPayload,
        updater
      )
      await MySQLExecute.executeList(normalizedSetupSql)

      const flowResult = await GprCApprovalService.submitSetup({
        REQUEST_ID: reqId,
        GPR_C_DATA: gprCData,
        UPDATE_BY: updater,
      })

      if (!flowResult?.Status) {
        return flowResult
      }

      return {
        Status: true,
        Message: 'GPR C notification setup saved successfully',
        ResultOnDb: flowResult.ResultOnDb || { request_id: reqId },
        MethodOnDb: 'Save GPR C Notification',
        TotalCountOnDb: 1,
      }
    } catch (error: any) {
      return {
        Status: false,
        Message: error?.message || 'Save failed',
        ResultOnDb: [],
        MethodOnDb: 'Save GPR C Notification Failed',
        TotalCountOnDb: 0,
      }
    }
  },

  getGprForm: async (dataItem: any) => {
    const requestId = Number(typeof dataItem === 'number' ? dataItem : dataItem?.REQUEST_ID)

    if (!requestId || Number.isNaN(requestId)) {
      return null
    }

    const selectionSql = await RequestRegisterPageSQL.getSelection({ REQUEST_ID: requestId })
    const selRes = (await MySQLExecute.search(selectionSql)) as any[]
    if (!selRes[0]) return null

    const selection_id = getValue(selRes[0], 'selection_id', 'SELECTION_ID')
    const finSql = await RequestRegisterPageSQL.getFinancials({ SELECTION_ID: selection_id })
    const critSql = await RequestRegisterPageSQL.getCriteria({ SELECTION_ID: selection_id })

    const circularSql = RequestRegisterPageSQL.getGprCircularMembers({ SELECTION_ID: selection_id })
    const actionSetupSql = RequestRegisterPageSQL.getGprActionSetup({ SELECTION_ID: selection_id })
    const flowSetupSql = RequestRegisterPageSQL.getGprFlowSetup({ REQUEST_ID: requestId })
    const [finRes, critRes, circularRows, actionSetupRows, flowSetupRows] = await Promise.all([
      MySQLExecute.search(finSql) as Promise<any[]>,
      MySQLExecute.search(critSql) as Promise<any[]>,
      MySQLExecute.search(circularSql) as Promise<any[]>,
      MySQLExecute.search(actionSetupSql) as Promise<any[]>,
      MySQLExecute.search(flowSetupSql) as Promise<any[]>,
    ])

    const flowSetup = flowSetupRows[0] || {}
    const relationalActionRequiredSetup = actionSetupRowsToPayload(actionSetupRows)
    const meta = {
      gpr_c_approver_empcode: normalizeValue(getValue(flowSetup, 'gpr_c_approver_empcode', 'GPR_C_APPROVER_EMPCODE')),
      gpr_c_pc_pic_empcode: '',
    }
    const actionRequiredSetup = { ...relationalActionRequiredSetup, _meta: meta }
    const circularMembers = circularRows.map((row) => ({
        empcode: normalizeValue(getValue(row, 'empcode', 'EMPCODE')),
        name: normalizeValue(getValue(row, 'member_name', 'MEMBER_NAME')),
        email: normalizeValue(getValue(row, 'email', 'EMAIL')),
      }))

    return {
      ...selRes[0],
      gpr_c_approver_name: normalizeValue(getValue(flowSetup, 'gpr_c_approver_name', 'GPR_C_APPROVER_NAME')),
      gpr_c_approver_email: normalizeValue(getValue(flowSetup, 'gpr_c_approver_email', 'GPR_C_APPROVER_EMAIL')),
      gpr_c_pc_pic_name: normalizeValue(getValue(flowSetup, 'gpr_c_pc_pic_name', 'GPR_C_PC_PIC_NAME')),
      gpr_c_pc_pic_email: normalizeValue(getValue(flowSetup, 'gpr_c_pc_pic_email', 'GPR_C_PC_PIC_EMAIL')),
      action_required_json: JSON.stringify(actionRequiredSetup),
      gpr_c_approver_empcode: normalizeValue(meta.gpr_c_approver_empcode),
      gpr_c_pc_pic_empcode: normalizeValue(meta.gpr_c_pc_pic_empcode),
      gpr_c_circular_empcodes: circularMembers.map((item) => item.empcode).filter(Boolean),
      gpr_c_circular_members: circularMembers,
      gpr_43_acceptance_status: normalizeGpr43AcceptanceStatus(getValue(selRes[0], 'gpr_43_acceptance_status', 'GPR_43_ACCEPTANCE_STATUS')),
      sales_profit: finRes,
      criteria: critRes,
    }
  },
}
