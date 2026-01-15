import { FlowHistorySQL } from '@src/_workspace/sql/flow-history/FlowHistorySQL'
import { FlowProcessSQL } from '@src/_workspace/sql/flow-process/FlowProcessSQL'
import { FlowProductTypeSQL } from '@src/_workspace/sql/flow-product-type/FlowProductTypeSQL'
import { FlowSQL } from '@src/_workspace/sql/flow/FlowSQL'
import { MySQLExecute } from '@src/businessData/dbExecute'
import { RowDataPacket } from 'mysql2'

export const FlowProcessService = {
  getByLikeFlowNameAndProductMainIdAndInuse: async (dataItem: any) => {
    const sql = await FlowProcessSQL.getByLikeFlowNameAndProductMainIdAndInuse(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },

  getByLikeFlowNameAndInuse: async (dataItem: any) => {
    const sql = await FlowSQL.getByLikeFlowNameAndInuse(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  searchProcessByFlowProcessId: async (dataItem: any) => {
    let sql = await FlowProcessSQL.searchProcessByFlowProcessId(dataItem)
    let resultData = await MySQLExecute.search(sql)
    return resultData
  },
  createFlowProcess: async (dataItem: any) => {
    let sqlList = []
    let sqlListDuplicate = []
    let sqlListFlowProcess = []
    let resultData
    let resultDuplicate
    let resultDuplicateFlowProcess
    sqlListDuplicate.push(await FlowSQL.getFlowNameDuplicate(dataItem))
    resultDuplicate = (await MySQLExecute.executeList(sqlListDuplicate)) as RowDataPacket[]

    if (resultDuplicate[0].length > 0) {
      // throw new Error('Flow name ที่ต้องการ มีอยู่แล้ว Flow name already exists')
      return {
        Status: false,
        Message: 'Flow name ที่ต้องการ มีอยู่แล้วภายใต้ product main นี้',
        ResultOnDb: [],
        MethodOnDb: 'Create Flow Process',
        TotalCountOnDb: 0,
      }
    } else {
      // นับจำนวน PROCESS_ID
      const processCount: Record<number, number> = {}

      for (const item of dataItem['FLOW_PROCESS']) {
        processCount[item.PROCESS_ID] = (processCount[item.PROCESS_ID] || 0) + 1
      }

      // ตรวจสอบว่ามี PROCESS_ID ไหนที่นับได้เกิน 1 (คือมีซ้ำ)
      const hasDuplicate = Object.values(processCount).some((count) => count > 1)

      // ใช้ใน if else
      if (hasDuplicate) {
        return {
          Status: false,
          Message: 'มี PROCESS ซ้ำกัน',
          ResultOnDb: [],
          MethodOnDb: 'Create Flow Process',
          TotalCountOnDb: 0,
        }
      } else {
        //! ต้องดัก flow ไม่ซ้ำ --------------------------------------
        // console.log('dataItem', dataItem['FLOW_PROCESS'])

        const processIdArray = dataItem['FLOW_PROCESS'].map((item: any) => `(tb_1.NO = ${item.NO} AND tb_1.PROCESS_ID = ${item.PROCESS_ID})`).join(' OR ')

        sqlListFlowProcess.push(await FlowProcessSQL.getFlowProcessDuplicate(dataItem, processIdArray))
        resultDuplicateFlowProcess = (await MySQLExecute.executeList(sqlListFlowProcess)) as RowDataPacket[]

        if (resultDuplicateFlowProcess[0].length > 0) {
          return {
            Status: false,
            Message: 'Flow PROCESS มีอยู่แล้ว',
            ResultOnDb: resultDuplicateFlowProcess[0],
            MethodOnDb: 'Create Flow Process',
            TotalCountOnDb: 0,
          }
        } else {
          sqlList.push(await FlowSQL.CreateFlowId())
          sqlList.push(await FlowSQL.createFlow(dataItem))
          resultData = (await MySQLExecute.executeList(sqlList)) as RowDataPacket[]
          for (const [index, item] of dataItem['FLOW_PROCESS'].entries()) {
            item['NO'] = String(index + 1)
            item['CREATE_BY'] = dataItem['CREATE_BY']
            item['FLOW_ID'] = resultData[1][1][0].FLOW_ID
            sqlList.push(await FlowProcessSQL.createFlowProcess(item))
          }
          for (const [, item] of dataItem['PRODUCT_TYPE'].entries()) {
            if (item.PRODUCT_TYPE_ID) {
              item['CREATE_BY'] = dataItem['CREATE_BY']
              item['FLOW_ID'] = resultData[1][1][0].FLOW_ID
              sqlList.push(await FlowProductTypeSQL.updateExistsProductTypeInuse(item))
              sqlList.push(await FlowProductTypeSQL.createFlowProductTypeByCreatedProcess(item))
            }
          }
          resultData = await MySQLExecute.executeList(sqlList)
          // return resultData
          return {
            Status: true,
            Message: 'Create Flow Process Success',
            ResultOnDb: resultData,
            MethodOnDb: 'Create Flow Process',
            TotalCountOnDb: 0,
          }
        }
      }
    }
  },
  updateFlowProcess: async (dataItem: any) => {
    let sqlList = []
    let sqlListFlowProcess = []
    let resultData
    let resultDuplicateFlowProcess

    sqlList.push(await FlowSQL.checkFlowName(dataItem))
    resultData = (await MySQLExecute.executeList(sqlList)) as RowDataPacket[]
    if (resultData[0][0].TOTAL_COUNT >= 1) {
      // throw new Error('Flow name ที่ต้องการ มีอยู่แล้ว Flow name already exists')
      return {
        Status: false,
        Message: 'Flow name ที่ต้องการ มีอยู่แล้วภายใต้ product main นี้',
        ResultOnDb: [],
        MethodOnDb: 'Update Flow Process',
        TotalCountOnDb: 0,
      }
    } else {
      const processCount: Record<string, number> = {}

      for (const item of dataItem['FLOW_PROCESS']) {
        const key = String(item.PROCESS_ID)
        processCount[key] = (processCount[key] || 0) + 1
      }

      const hasDuplicate = Object.values(processCount).some((count) => count > 1)

      // ใช้ใน if else
      if (hasDuplicate) {
        return {
          Status: false,
          Message: 'มี PROCESS ซ้ำกัน',
          ResultOnDb: [],
          MethodOnDb: 'Create Flow Process',
          TotalCountOnDb: 0,
        }
      } else {
        //! ต้องดัก flow ไม่ซ้ำ --------------------------------------
        // console.log('dataItem', dataItem['FLOW_PROCESS'])

        const processIdArray = dataItem['FLOW_PROCESS'].map((item: any) => `(tb_1.NO = ${item.NO} AND tb_1.PROCESS_ID = ${item.PROCESS_ID})`).join(' OR ')

        sqlListFlowProcess.push(await FlowProcessSQL.getFlowProcessDuplicate(dataItem, processIdArray))
        resultDuplicateFlowProcess = (await MySQLExecute.executeList(sqlListFlowProcess)) as RowDataPacket[]

        if (resultDuplicateFlowProcess[0].length > 0 && resultDuplicateFlowProcess[0][0].FLOW_ID != dataItem['FLOW_ID']) {
          return {
            Status: false,
            Message: 'Flow PROCESS มีอยู่แล้ว',
            ResultOnDb: [],
            MethodOnDb: 'Create Flow Process',
            TotalCountOnDb: 0,
          }
        } else {
          sqlList = []

          if (dataItem['INUSE'] != 2 && dataItem['INUSE'] != 3) {
            //inuse = using
            sqlList.push(await FlowProcessSQL.deleteByFlowId(dataItem))
            sqlList.push(await FlowProductTypeSQL.deleteFlowProductTypeByUpdatedFlowProcess(dataItem))
            sqlList.push(await FlowSQL.updateFlow(dataItem))

            for (const [index, item] of dataItem['FLOW_PROCESS'].entries()) {
              item['FLOW_ID'] = dataItem['FLOW_ID']
              item['NO'] = String(index + 1)
              item['CREATE_BY'] = dataItem['CREATE_BY']
              sqlList.push(await FlowProcessSQL.InsertByExistFlowId(item))
            }

            for (const [, item] of dataItem['PRODUCT_TYPE'].entries()) {
              if (item.PRODUCT_TYPE_ID) {
                item['FLOW_ID'] = dataItem['FLOW_ID']
                item['CREATE_BY'] = dataItem['CREATE_BY']
                sqlList.push(await FlowProductTypeSQL.updateExistsProductTypeInuse(item))
                sqlList.push(await FlowProductTypeSQL.insertByExistFlowId(item))
              }
            }
          } else {
            sqlList.push(await FlowHistorySQL.updateFlowHistory(dataItem))
            sqlList.push(await FlowHistorySQL.createFlowHistory(dataItem))
            sqlList.push(await FlowSQL.updateFlowNameByFlowId(dataItem))
          }

          resultData = await MySQLExecute.executeList(sqlList)
          return {
            Status: true,
            Message: 'Update Flow Process Success',
            ResultOnDb: resultData,
            MethodOnDb: 'Update Flow Process',
            TotalCountOnDb: 0,
          }
        }
      }
    }
  },
  deleteFlowProcess: async (dataItem: any) => {
    let sqlList = []
    let resultData

    sqlList.push(await FlowSQL.deleteFlow(dataItem))
    // sqlList.push(await FlowProcessSQL.deleteFlowProcess(dataItem))
    sqlList.push(await FlowProductTypeSQL.deleteFlowProductType(dataItem))

    resultData = await MySQLExecute.executeList(sqlList)
    return resultData
  },
  getByFlowId: async (dataItem: any) => {
    const sql = await FlowProcessSQL.getByFlowId(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
}
