import { MySQLExecute } from '@businessData/dbExecute'
import { RegisterRequestSQL } from '../../sql/_request-registrer/RegisterRequestSQL'

export const RegisterRequestGprService = {
    saveGprForm: async (dataItem: any) => {
        try {
            const reqId = dataItem.request_id
            if (!reqId) throw new Error('Missing request_id')

            const formData = typeof dataItem.gpr_data === 'string' ? JSON.parse(dataItem.gpr_data) : (dataItem.gpr_data || {})
            formData.request_id = reqId
            formData.UPDATE_BY = dataItem.UPDATE_BY || 'SYSTEM'
            const circularList = Array.isArray(formData.gpr_c_circular_list)
                ? formData.gpr_c_circular_list.map((email: any) => String(email || '').trim()).filter(Boolean)
                : []

            if (circularList.length > 6) {
                throw new Error('Circular list supports a maximum of 6 persons')
            }

            formData.gpr_c_circular_json = JSON.stringify(
                circularList.slice(0, 6)
            )
            formData.action_required_json = JSON.stringify(formData.action_required_setup || {})

            const sqlList = []
            const checkSql = await RegisterRequestSQL.checkSelectionExists(formData)
            const checkRes = (await MySQLExecute.search(checkSql)) as any[]
            let selection_id = checkRes[0]?.selection_id

            if (selection_id) {
                formData.selection_id = selection_id
                sqlList.push(await RegisterRequestSQL.updateSelection(formData))
            } else {
                const insertSql = await RegisterRequestSQL.insertSelection(formData)
                const res = (await MySQLExecute.execute(insertSql)) as any
                selection_id = res.insertId
                formData.selection_id = selection_id
            }

            if (!selection_id) throw new Error('Failed to create/identify GPR selection record')

            sqlList.push(await RegisterRequestSQL.deleteFinancials({ selection_id }))
            sqlList.push(await RegisterRequestSQL.deleteCriteria({ selection_id }))

            if (formData.sales_profit) {
                for (const sp of formData.sales_profit) {
                    sp.selection_id = selection_id
                    sqlList.push(await RegisterRequestSQL.insertFinancial(sp))
                }
            }
            if (formData.criteria) {
                for (const cr of formData.criteria) {
                    cr.selection_id = selection_id
                    sqlList.push(await RegisterRequestSQL.insertCriteria(cr))
                }
            }

            const resultData = await MySQLExecute.executeList(sqlList)
            return {
                Status: true,
                Message: 'GPR Form saved successfully',
                ResultOnDb: resultData,
                MethodOnDb: 'Save GPR Form',
                TotalCountOnDb: 1
            }
        } catch (error: any) {
            return {
                Status: false,
                Message: error?.message || 'Save failed',
                ResultOnDb: [],
                MethodOnDb: 'Save GPR Form Failed',
                TotalCountOnDb: 0
            }
        }
    },

    saveGprCNotification: async (dataItem: any) => {
        try {
            const reqId = Number(dataItem.request_id)
            if (!reqId || Number.isNaN(reqId)) throw new Error('Missing request_id')

            const updater = String(dataItem.UPDATE_BY || '').trim() || 'SYSTEM'
            const gprCData = typeof dataItem.gpr_c_data === 'string'
                ? JSON.parse(dataItem.gpr_c_data)
                : (dataItem.gpr_c_data || {})

            const requesterSql = await RegisterRequestSQL.getRequesterByRequestId({ request_id: reqId })
            const requesterRes = (await MySQLExecute.search(requesterSql)) as any[]
            const requesterCode = String(requesterRes[0]?.Request_By_EmployeeCode || '').trim()

            if (!requesterCode) {
                throw new Error('Requester not found for this request')
            }

            if (updater !== requesterCode) {
                throw new Error('Only requester can update GPR C notification setup')
            }

            const circularList = Array.isArray(gprCData.gpr_c_circular_list)
                ? gprCData.gpr_c_circular_list.map((email: any) => String(email || '').trim()).filter(Boolean)
                : []

            if (circularList.length > 6) {
                throw new Error('Circular list supports a maximum of 6 persons')
            }

            const formData: any = {
                request_id: reqId,
                UPDATE_BY: updater,
                gpr_c_approver_name: String(gprCData.gpr_c_approver_name || '').trim(),
                gpr_c_approver_email: String(gprCData.gpr_c_approver_email || '').trim(),
                gpr_c_pc_pic_name: String(gprCData.gpr_c_pc_pic_name || '').trim(),
                gpr_c_pc_pic_email: String(gprCData.gpr_c_pc_pic_email || '').trim(),
                gpr_c_circular_json: JSON.stringify(circularList.slice(0, 6)),
            }

            const checkSql = await RegisterRequestSQL.checkSelectionExists(formData)
            const checkRes = (await MySQLExecute.search(checkSql)) as any[]
            const selection_id = checkRes[0]?.selection_id

            if (selection_id) {
                formData.selection_id = selection_id
                const updateSql = await RegisterRequestSQL.updateSelectionGprCOnly(formData)
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
                const insertSql = await RegisterRequestSQL.insertSelection(insertData)
                await MySQLExecute.execute(insertSql)
            }

            return {
                Status: true,
                Message: 'GPR C notification setup saved successfully',
                ResultOnDb: { request_id: reqId },
                MethodOnDb: 'Save GPR C Notification',
                TotalCountOnDb: 1
            }
        } catch (error: any) {
            return {
                Status: false,
                Message: error?.message || 'Save failed',
                ResultOnDb: [],
                MethodOnDb: 'Save GPR C Notification Failed',
                TotalCountOnDb: 0
            }
        }
    },

    getGprForm: async (dataItem: any) => {
        const requestId = Number(
            typeof dataItem === 'number'
                ? dataItem
                : dataItem?.request_id
        )

        if (!requestId || Number.isNaN(requestId)) {
            return null
        }

        const selectionSql = await RegisterRequestSQL.getSelection({ request_id: requestId })
        const selRes = (await MySQLExecute.search(selectionSql)) as any[]
        if (!selRes[0]) return null

        const selection_id = selRes[0].selection_id
        const finSql = await RegisterRequestSQL.getFinancials({ selection_id })
        const critSql = await RegisterRequestSQL.getCriteria({ selection_id })

        const [finRes, critRes] = await Promise.all([
            MySQLExecute.search(finSql) as Promise<any[]>,
            MySQLExecute.search(critSql) as Promise<any[]>
        ])

        return {
            ...selRes[0],
            sales_profit: finRes,
            criteria: critRes
        }
    }
}
