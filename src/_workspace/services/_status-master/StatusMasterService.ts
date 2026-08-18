import { MySQLExecute } from '@businessData/dbExecute'
import { RowDataPacket } from 'mysql2'
import {
  StatusMasterSQL,
} from '../../sql/_status-master/StatusMasterSQL'
import type { StatusMasterSearchData } from '../../types/StatusMaster'

export const StatusMasterService = {
  getStatusMasters: async (dataItem: StatusMasterSearchData = {}) => {
    const sql = await StatusMasterSQL.getStatusMasters(dataItem)
    return (await MySQLExecute.search(sql)) as RowDataPacket[]
  },
  getActiveWorkflowStepMasters: async (dataItem: { WORKFLOW_DEFINITION_ID?: number } = {}) => {
    const sql = await StatusMasterSQL.getActiveWorkflowStepMasters(dataItem)
    return (await MySQLExecute.search(sql)) as RowDataPacket[]
  },
  getActiveRequestStatusMasters: async () => {
    const sql = await StatusMasterSQL.getActiveRequestStatusMasters()
    return (await MySQLExecute.search(sql)) as RowDataPacket[]
  },
  getWorkflowStepTypes: async () => {
    const sql = await StatusMasterSQL.getWorkflowStepTypes()
    return (await MySQLExecute.search(sql)) as RowDataPacket[]
  },
}
