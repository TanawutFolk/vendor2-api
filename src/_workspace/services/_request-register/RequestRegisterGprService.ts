import { MySQLExecute } from '@businessData/dbExecute'
import { RequestRegisterPageSQL } from '../../sql/_request-register/RequestRegisterPageSQL'
import { GprCApprovalService } from '../_approval-GPRC/GprCApprovalService'

const normalizeValue = (value: any) => String(value || '').trim()

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

  const name = [member.empName, member.empSurname].map(normalizeValue).filter(Boolean).join(' ')
  const email = normalizeValue(member.empEmail)

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
        GPR_C_APPROVER_NAME: rawFormData.gpr_c_approver_name || '',
        GPR_C_APPROVER_EMAIL: rawFormData.gpr_c_approver_email || '',
        GPR_C_PC_PIC_NAME: rawFormData.gpr_c_pc_pic_name || '',
        GPR_C_PC_PIC_EMAIL: rawFormData.gpr_c_pc_pic_email || '',
        GPR_C_CIRCULAR_JSON: JSON.stringify(circularList.slice(0, 6)),
        ACTION_REQUIRED_JSON: JSON.stringify(rawFormData.action_required_setup || {}),
        COMPLETION_DATE: rawFormData.completion_date || '',
        CREATE_BY: dataItem.CREATE_BY || updateBy,
        UPDATE_BY: updateBy,
      }

      const sqlList = []
      const checkSql = await RequestRegisterPageSQL.checkSelectionExists(formData)
      const checkRes = (await MySQLExecute.search(checkSql)) as any[]
      let selection_id = checkRes[0]?.selection_id

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

      if (rawFormData.sales_profit) {
        for (const sp of rawFormData.sales_profit) {
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
        Message: 'GPR Form saved successfully',
        ResultOnDb: resultData,
        MethodOnDb: 'Save GPR Form',
        TotalCountOnDb: 1,
      }
    } catch (error: any) {
      return {
        Status: false,
        Message: error?.message || 'Save failed',
        ResultOnDb: [],
        MethodOnDb: 'Save GPR Form Failed',
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
      const requesterCode = String(requesterRes[0]?.Request_By_EmployeeCode || '').trim()

      if (!requesterCode) {
        throw new Error('Requester not found for this request')
      }

      if (updater !== requesterCode) {
        throw new Error('Only requester can update GPR C notification setup')
      }

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

      const actionRequiredSetup = parseStoredObject(gprCData.action_required_setup)
      const actionRequiredPayload = buildActionRequiredMeta(actionRequiredSetup, {
        gpr_c_approver_empcode: approverMember?.empcode || '',
        gpr_c_circular_members: circularMembers,
      })

      const formData: any = {
        REQUEST_ID: reqId,
        CREATE_BY: creator,
        UPDATE_BY: updater,
        GPR_C_APPROVER_NAME: approverMember?.name || '',
        GPR_C_APPROVER_EMAIL: approverMember?.email || '',
        GPR_C_PC_PIC_NAME: String(gprCData.gpr_c_pc_pic_name || '').trim(),
        GPR_C_PC_PIC_EMAIL: String(gprCData.gpr_c_pc_pic_email || '').trim(),
        GPR_C_CIRCULAR_JSON: JSON.stringify(circularMembers),
        ACTION_REQUIRED_JSON: JSON.stringify(actionRequiredPayload),
      }

      const checkSql = await RequestRegisterPageSQL.checkSelectionExists(formData)
      const checkRes = (await MySQLExecute.search(checkSql)) as any[]
      const selection_id = checkRes[0]?.selection_id

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
        await MySQLExecute.execute(insertSql)
      }

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

    const selection_id = selRes[0].selection_id
    const finSql = await RequestRegisterPageSQL.getFinancials({ SELECTION_ID: selection_id })
    const critSql = await RequestRegisterPageSQL.getCriteria({ SELECTION_ID: selection_id })

    const [finRes, critRes] = await Promise.all([MySQLExecute.search(finSql) as Promise<any[]>, MySQLExecute.search(critSql) as Promise<any[]>])

    const actionRequiredSetup = parseStoredObject(selRes[0]?.action_required_json)
    const meta = parseStoredObject(actionRequiredSetup?._meta)
    const circularMembers = parseCircularMembers(selRes[0]?.gpr_c_circular_json)

    return {
      ...selRes[0],
      action_required_json: JSON.stringify(actionRequiredSetup),
      gpr_c_approver_empcode: normalizeValue(meta.gpr_c_approver_empcode),
      gpr_c_circular_empcodes: circularMembers.map((item) => item.empcode).filter(Boolean),
      gpr_c_circular_members: circularMembers,
      sales_profit: finRes,
      criteria: critRes,
    }
  },
}
