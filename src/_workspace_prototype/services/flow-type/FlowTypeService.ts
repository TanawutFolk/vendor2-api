import { MySQLExecute } from '@businessData/dbExecute'
import { FlowTypeSQL } from '@src/_workspace/sql/flow-type/FlowTypeSQL'
import { RowDataPacket } from 'mysql2'

export const FlowTypeService = {
  getFlowType: async (dataItem: any) => {
    const sql = await FlowTypeSQL.getFlowType(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },

  searchFlowType: async (dataItem: any) => {
    const sql = await FlowTypeSQL.searchFlowType(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },

  createFlowType: async (dataItem: any) => {
    const sqlCheckDuplicate = await FlowTypeSQL.getByLikeFlowTypeNameCheckDuplicate(dataItem)
    const resultCheckDuplicate = (await MySQLExecute.search(sqlCheckDuplicate)) as RowDataPacket[]

    if (resultCheckDuplicate.length === 0) {
      const sqlCheckDuplicateAlphabet = await FlowTypeSQL.getByLikeFlowTypeAlphabetCheckDuplicate(dataItem)
      const resultCheckDuplicateAlphabet = (await MySQLExecute.search(sqlCheckDuplicateAlphabet)) as RowDataPacket[]

      if (resultCheckDuplicateAlphabet.length === 0) {
        const query = await FlowTypeSQL.createFlowType(dataItem)
        const resultInsertData = (await MySQLExecute.execute(query)) as RowDataPacket[]

        return {
          Status: true,
          Message: 'บันทึกข้อมูลเรียบร้อยแล้ว Data has been saved successfully',
          ResultOnDb: resultInsertData,
          MethodOnDb: 'Add Flow Type Success',
          TotalCountOnDb: resultInsertData?.length ?? 0,
        }
      } else {
        return {
          Status: false,
          Message: 'Duplicate Flow Type Alphabet',
          ResultOnDb: [],
          MethodOnDb: 'Insert Flow Type Failed',
          TotalCountOnDb: 0,
        }
      }
    } else {
      return {
        Status: false,
        Message: 'Duplicate Flow Type Name',
        ResultOnDb: [],
        MethodOnDb: 'Insert Flow Type Failed',
        TotalCountOnDb: 0,
      }
    }
  },

  updateFlowType: async (dataItem: any) => {
    const sqlCheckDuplicate = await FlowTypeSQL.getByLikeFlowTypeNameCheckDuplicate(dataItem)
    const resultCheckDuplicate = (await MySQLExecute.search(sqlCheckDuplicate)) as RowDataPacket[]
    if (resultCheckDuplicate.length === 0 || (resultCheckDuplicate.length !== 0 && resultCheckDuplicate[0]['FLOW_TYPE_ID'] === dataItem['FLOW_TYPE_ID'])) {
      const sqlCheckDuplicateAlphabet = await FlowTypeSQL.getByLikeFlowTypeAlphabetCheckDuplicate(dataItem)
      const resultCheckDuplicateAlphabet = (await MySQLExecute.search(sqlCheckDuplicateAlphabet)) as RowDataPacket[]
      if (
        resultCheckDuplicateAlphabet.length === 0 ||
        (resultCheckDuplicateAlphabet.length !== 0 && resultCheckDuplicateAlphabet[0]['FLOW_TYPE_ID'] === dataItem['FLOW_TYPE_ID'])
      ) {
        const query = await FlowTypeSQL.updateFlowType(dataItem)
        const resultInsertData = (await MySQLExecute.execute(query)) as RowDataPacket[]
        return {
          Status: true,
          Message: 'อัปเดตข้อมูลเรียบร้อยแล้ว Data has been updated successfully',
          ResultOnDb: resultInsertData,
          MethodOnDb: 'Update Flow Type Success',
          TotalCountOnDb: resultInsertData?.length ?? 0,
        }
      } else {
        return {
          Status: false,
          Message: 'Duplicate Flow Type Alphabet',
          ResultOnDb: [],
          MethodOnDb: 'Update Flow Type Failed',
          TotalCountOnDb: 0,
        }
      }
    } else {
      return {
        Status: false,
        Message: 'Duplicate Flow Type Name',
        ResultOnDb: [],
        MethodOnDb: 'Update Flow Type Failed',
        TotalCountOnDb: 0,
      }
    }
  },

  deleteFlowType: async (dataItem: any) => {
    const sql = await FlowTypeSQL.deleteFlowType(dataItem)
    const resultData = await MySQLExecute.execute(sql)
    return resultData
  },

  getByLikeFlowTypeName: async (dataItem: any) => {
    const sql = await FlowTypeSQL.getByLikeFlowTypeName(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
}
