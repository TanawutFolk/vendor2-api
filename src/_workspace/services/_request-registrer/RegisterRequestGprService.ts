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
            formData.gpr_c_circular_json = JSON.stringify(
                Array.isArray(formData.gpr_c_circular_list)
                    ? formData.gpr_c_circular_list.map((email: any) => String(email || '').trim()).filter(Boolean)
                    : []
            )

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
