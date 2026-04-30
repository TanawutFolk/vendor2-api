import { MySQLExecute } from '@businessData/dbExecute'
import { RowDataPacket } from 'mysql2'
import { RequestHistorySQL } from '../../sql/_request-history/RequestHistorySQL'
import { RequestRegisterGprService } from '../_request-register/RequestRegisterGprService'

export const RequestHistoryService = {
    getById: async (dataItem: any) => {
        const sql = await RequestHistorySQL.getById(dataItem)
        const result = (await MySQLExecute.search(sql)) as RowDataPacket[]
        return result[0] || null
    },

    getApprovalSteps: async (dataItem: any) => {
        const sql = await RequestHistorySQL.getApprovalSteps(dataItem)
        return (await MySQLExecute.search(sql)) as RowDataPacket[]
    },

    getApprovalLogs: async (dataItem: any) => {
        const sql = await RequestHistorySQL.getApprovalLogs(dataItem)
        return (await MySQLExecute.search(sql)) as RowDataPacket[]
    },

    resolveEmployeeProfile: async (dataItem: any) => {
        return RequestRegisterGprService.resolveEmployeeProfile(dataItem)
    },

    getGprForm: async (dataItem: any) => {
        return RequestRegisterGprService.getGprForm(dataItem)
    },
}
