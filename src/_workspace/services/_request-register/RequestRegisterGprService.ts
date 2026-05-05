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

  const memberSql = await RequestRegisterPageSQL.getMemberByEmpCode({ empcode: safeEmpCode })
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
    const empcode = normalizeValue(dataItem?.empcode)

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
      const reqId = dataItem.request_id
      if (!reqId) throw new Error('Missing request_id')

      const formData = typeof dataItem.gpr_data === 'string' ? JSON.parse(dataItem.gpr_data) : dataItem.gpr_data || {}
      formData.request_id = reqId
      formData.UPDATE_BY = dataItem.UPDATE_BY || 'SYSTEM'
      const circularList = Array.isArray(formData.gpr_c_circular_list) ? formData.gpr_c_circular_list.map((email: any) => String(email || '').trim()).filter(Boolean) : []

      if (circularList.length > 6) {
        throw new Error('Circular list supports a maximum of 6 persons')
      }

      formData.gpr_c_circular_json = JSON.stringify(circularList.slice(0, 6))
      formData.action_required_json = JSON.stringify(formData.action_required_setup || {})

      const sqlList = []
      const checkSql = await RequestRegisterPageSQL.checkSelectionExists(formData)
      const checkRes = (await MySQLExecute.search(checkSql)) as any[]
      let selection_id = checkRes[0]?.selection_id

      if (selection_id) {
        formData.selection_id = selection_id
        sqlList.push(await RequestRegisterPageSQL.updateSelection(formData))
      } else {
        const insertSql = await RequestRegisterPageSQL.insertSelection(formData)
        const res = (await MySQLExecute.execute(insertSql)) as any
        selection_id = res.insertId
        formData.selection_id = selection_id
      }

      if (!selection_id) throw new Error('Failed to create/identify GPR selection record')

      sqlList.push(await RequestRegisterPageSQL.deleteFinancials({ selection_id }))
      sqlList.push(await RequestRegisterPageSQL.deleteCriteria({ selection_id }))

      if (formData.sales_profit) {
        for (const sp of formData.sales_profit) {
          sp.selection_id = selection_id
          sqlList.push(await RequestRegisterPageSQL.insertFinancial(sp))
        }
      }
      if (formData.criteria) {
        for (const cr of formData.criteria) {
          cr.selection_id = selection_id
          cr.CREATE_BY = formData.CREATE_BY || formData.UPDATE_BY || 'SYSTEM'
          cr.UPDATE_BY = formData.UPDATE_BY || formData.CREATE_BY || 'SYSTEM'
          sqlList.push(await RequestRegisterPageSQL.insertCriteria(cr))
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
      const reqId = Number(dataItem.request_id)
      if (!reqId || Number.isNaN(reqId)) throw new Error('Missing request_id')

      const creator = String(dataItem.CREATE_BY || dataItem.UPDATE_BY || '').trim() || 'SYSTEM'
      const updater = String(dataItem.UPDATE_BY || '').trim() || 'SYSTEM'
      const gprCData = typeof dataItem.gpr_c_data === 'string' ? JSON.parse(dataItem.gpr_c_data) : dataItem.gpr_c_data || {}

      const requesterSql = await RequestRegisterPageSQL.getRequesterByRequestId({ request_id: reqId })
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
        request_id: reqId,
        CREATE_BY: creator,
        UPDATE_BY: updater,
        gpr_c_approver_name: approverMember?.name || '',
        gpr_c_approver_email: approverMember?.email || '',
        gpr_c_pc_pic_name: String(gprCData.gpr_c_pc_pic_name || '').trim(),
        gpr_c_pc_pic_email: String(gprCData.gpr_c_pc_pic_email || '').trim(),
        gpr_c_circular_json: JSON.stringify(circularMembers),
        action_required_json: JSON.stringify(actionRequiredPayload),
      }

      const checkSql = await RequestRegisterPageSQL.checkSelectionExists(formData)
      const checkRes = (await MySQLExecute.search(checkSql)) as any[]
      const selection_id = checkRes[0]?.selection_id

      if (selection_id) {
        formData.selection_id = selection_id
        const updateSql = await RequestRegisterPageSQL.updateSelectionGprCOnly(formData)
        await MySQLExecute.execute(updateSql)
      } else {
        const insertData = {
          ...formData,
          business_category: '',
          start_year: '',
          authorized_capital: '',
          establish: '',
          number_of_employees: '',
          manufactured_country: '',
          vendor_original_country: '',
          sanctions: '',
          currency: 'THB',
          suggestion: '',
          result: '',
          path: '',
          vendor_code_selector: '',
          completion_date: '',
        }
        const insertSql = await RequestRegisterPageSQL.insertSelection(insertData)
        await MySQLExecute.execute(insertSql)
      }

      const flowResult = await GprCApprovalService.submitSetup({
        request_id: reqId,
        gpr_c_data: gprCData,
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
    const requestId = Number(typeof dataItem === 'number' ? dataItem : dataItem?.request_id)

    if (!requestId || Number.isNaN(requestId)) {
      return null
    }

    const selectionSql = await RequestRegisterPageSQL.getSelection({ request_id: requestId })
    const selRes = (await MySQLExecute.search(selectionSql)) as any[]
    if (!selRes[0]) return null

    const selection_id = selRes[0].selection_id
    const finSql = await RequestRegisterPageSQL.getFinancials({ selection_id })
    const critSql = await RequestRegisterPageSQL.getCriteria({ selection_id })

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
