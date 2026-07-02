import { MySQLExecute } from '@businessData/dbExecute'
import { ProcessSQL } from '@src/_workspace/sql/process/ProcessNew/ProcessSQL'
export const ProcessService = {
  getProcess: async (dataItem: any) => {
    const sql = await ProcessSQL.getProcess(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  searchProcess: async (dataItem: any) => {
    let resultData: any = []
    let query
    // let sqlWhere = ''
    // if (typeof dataItem.ColumnFilters === 'string') {
    //   try {
    //     dataItem.ColumnFilters = JSON.parse(dataItem.ColumnFilters) // แปลง string → array
    //   } catch (error) {
    //     console.error('Error parsing Order:', error)
    //     dataItem.ColumnFilters = [] // ถ้าพาร์สไม่ผ่าน ให้กำหนดเป็นอาร์เรย์ว่าง
    //   }
    // }
    // if (dataItem['PRODUCT_MAIN_ID'] != '') {
    //   sqlWhere += " AND tb_1.PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'"
    // }

    // if (dataItem['INUSE'] && dataItem['INUSE'] != '') {
    //   sqlWhere +=
    //     " AND (IF (EXISTS(SELECT PROCESS_ID FROM FLOW_PROCESS WHERE PROCESS_ID = tb_1.PROCESS_ID AND INUSE = 1 LIMIT 1) = 1 ,2,tb_1.INUSE) LIKE '%dataItem.INUSE%')"
    // }

    // if (dataItem['INUSE'] != '') {
    //   sqlWhere += ` AND ((IF (tb_1.INUSE = 0 ,0 ,IF(
    //     EXISTS
    //             (
    //                 SELECT
    //                     tbs_1.PROCESS_ID
    //                 FROM
    //                     FLOW_PROCESS tbs_1
    //                             INNER JOIN
    //                     FLOW tbs_2 ON tbs_1.FLOW_ID = tbs_2.FLOW_ID
    //                     AND tbs_2.INUSE = 1 AND tbs_1.INUSE = 1
    //                     AND tbs_1.PROCESS_ID = tb_1.PROCESS_ID) = TRUE
    //             , 2
    //             ,   IF(
    //                         EXISTS
    //                         (
    //                                 SELECT
    //                                     PROCESS_ID
    //                                 FROM
    //                                     FLOW_PROCESS
    //                                 WHERE
    //                                     PROCESS_ID = tb_1.PROCESS_ID
    //                         ) = TRUE
    //             , 3
    //             , 1
    //             ))) ) = 'dataItem.INUSE')`
    // }

    // if (dataItem['ColumnFilters'].some((item: any) => item.column === 'INUSE') && dataItem['ColumnFilters'].find((item: any) => item.column === 'INUSE')?.value.length > 0) {
    //   let value =
    //     dataItem.ColumnFilters.find((item: any) => {
    //       return item.column === 'INUSE'
    //     })?.value || []

    //   if (value) {
    //     value = value.join(',')
    //   }

    //   dataItem = {
    //     ...dataItem,
    //     sqlWhereColumnFilter:
    //       dataItem.sqlWhereColumnFilter +
    //       ` AND (IF (EXISTS(SELECT PROCESS_ID FROM FLOW_PROCESS WHERE PROCESS_ID = tb_1.PROCESS_ID AND INUSE = 1 LIMIT 1) = 1 ,2,tb_1.INUSE) IN (${value}))`,
    //   }
    // }

    // if (dataItem['InuseRawData'] && dataItem['InuseRawData'] != '') {
    //   sqlWhere += " AND tb_1.INUSE LIKE '%dataItem.InuseRawData%'"
    // }

    query = await ProcessSQL.searchProcess(dataItem)

    resultData = await MySQLExecute.search(query)

    return resultData
  },
  createProcess: async (dataItem: any) => {
    let sqlList = []
    let resultData: any

    sqlList.push(await ProcessSQL.checkProcessNameInProductMain(dataItem))
    resultData = await MySQLExecute.executeList(sqlList)

    //console.log(resultData)

    if (resultData[0][0].TOTAL_COUNT >= 1) {
      throw new Error('ข้อมูลที่ต้องการบันทึก มีอยู่แล้ว Data already exists')
    }

    sqlList = []

    // if (dataItem['isAutoCreateFlowProcess'] == 1) {
    //   sqlList.push(await FlowSQL.checkFlowName(dataItem))
    //   resultData = await MySQLExecute.executeList(sqlList)

    //   if (resultData[0][0].TOTAL_COUNT >= 1) {
    //     throw new Error('Process name ที่ต้องการ มีซ้ำกับ Flow Name, Process name already exists on Flow Name')
    //   }
    // }

    // sqlList = []

    sqlList.push(await ProcessSQL.createProcessId())
    sqlList.push(await ProcessSQL.createProcess(dataItem))

    //console.log(dataItem.isAutoCreateFlowProcess)

    // if (dataItem['isAutoCreateFlowProcess'] == 1) {
    //   sqlList.push(await FlowSQL.CreateFlowId())
    //   sqlList.push(await FlowSQL.createFlowByCreatedProcess(dataItem))
    //   sqlList.push(await FlowProcessSQL.createFlowProcessByCreatedProcess(dataItem))
    // }

    resultData = await MySQLExecute.executeList(sqlList)

    return resultData
  },
  updateProcess: async (dataItem: any) => {
    let sqlList = []
    let resultData: any
    sqlList.push(await ProcessSQL.checkLengthProcessNameInProductMain(dataItem))
    resultData = await MySQLExecute.executeList(sqlList)
    // console.log(resultData[0][0])

    // console.log(resultData[0][0].PROCESS_ID)
    // console.log(dataItem.PROCESS_ID)

    if (resultData[0][0].length > 0 && resultData[0][0].PROCESS_ID !== dataItem.PROCESS_ID) {
      throw new Error('ข้อมูลที่ต้องการบันทึก มีอยู่แล้ว Data already exists')
    }
    sqlList.push(await ProcessSQL.updateProcess(dataItem))
    resultData = await MySQLExecute.executeList(sqlList)
    return resultData
  },
  deleteProcess: async (dataItem: any) => {
    const sql = await ProcessSQL.deleteProcess(dataItem)
    const resultData = await MySQLExecute.execute(sql)
    return resultData
  },
  getByLikeProcessName: async (dataItem: any) => {
    const sql = await ProcessSQL.getByLikeProcessName(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getByLikeProcessNameAndProductMainIdAndInuse: async (dataItem: any) => {
    const sql = await ProcessSQL.getByLikeProcessNameAndProductMainIdAndInuse(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getByLikeProcessNameAndInuse: async (dataItem: any) => {
    const sql = await ProcessSQL.getByLikeProcessNameAndInuse(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
}
