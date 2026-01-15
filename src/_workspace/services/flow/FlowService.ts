import { MySQLExecute } from '@businessData/dbExecute'
import { FlowSQL } from '@src/_workspace/sql/flow/FlowSQL'
import { RowDataPacket } from 'mysql2'

export const FlowService = {
  // getByLikeFlowNameAndProductMainIdAndInuse: async dataItem => {
  //   const sql = await FlowSQL.getByLikeFlowNameAndProductMainIdAndInuse(dataItem)
  //   const resultData = await MySQLExecute.search(sql)
  //   return resultData
  // },
  getFlow: async (dataItem: any) => {
    let sql = await FlowSQL.getFlow(dataItem)
    let resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  // checkFlowProcessExist: async (dataItem: any) => {
  //   const dataWithLength = dataItem.map((item: any) => ({
  //     ...item,
  //     length: dataItem.length,
  //   }))

  //   const { sql, values }: any = await FlowSQL.checkFlowProcessExist(dataWithLength)
  //   const resultData = await MySQLExecute.execute(sql, values)
  //   return resultData
  // },

  //! ของฟลุ้ค ---------------------------------------------
  checkFlowProcessExist: async (dataItem: any) => {
    let sqlList = []

    for (let i = 0; i < dataItem.length; i++) {
      dataItem[i] = {
        ...dataItem[i],
        length: dataItem.length,
      }

      sqlList.push(await FlowSQL.checkFlowProcessExist(dataItem[i]))
    }

    let resultData = await MySQLExecute.executeList(sqlList)
    return resultData
  },
  searchFlow: async (dataItem: any) => {
    let resultData = []
    let query
    let sqlWhere = ''
    let sqlJoin = ''
    let sqlSelect = ''
    // console.log(dataItem)

    if (typeof dataItem.ColumnFilters === 'string') {
      try {
        dataItem.ColumnFilters = JSON.parse(dataItem.ColumnFilters) // แปลง string → array
      } catch (error) {
        console.error('Error parsing ColumnFilters:', error)
        dataItem.ColumnFilters = [] // ถ้าพาร์สไม่ผ่าน ให้กำหนดเป็นอาร์เรย์ว่าง
      }
    }
    // if (dataItem['NEED_JOIN_PRODUCT_TYPE'] === 'true') {
    //   sqlSelect += ', tb_5.PRODUCT_TYPE_CODE, tb_5.PRODUCT_TYPE_NAME'

    //   sqlJoin += ' LEFT JOIN PRODUCT_TYPE_FLOW tb_4 ON tb_1.FLOW_ID = tb_4.FLOW_ID AND tb_4.INUSE = 1 LEFT JOIN PRODUCT_TYPE tb_5 ON tb_4.PRODUCT_TYPE_ID = tb_5.PRODUCT_TYPE_ID'
    // }
    if (dataItem['PRODUCT_CATEGORY_ID'] && dataItem['PRODUCT_CATEGORY_ID'] != '') {
      sqlWhere += " AND tb_3.PRODUCT_CATEGORY_ID = 'dataItem.PRODUCT_CATEGORY_ID'"
    }
    if (dataItem['PRODUCT_MAIN_ID'] != '') {
      sqlWhere += " AND tb_1.PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'"
    }

    if (dataItem['INUSE'] && dataItem['INUSE'] != '') {
      sqlWhere += " AND (IF (EXISTS(SELECT FLOW_ID from BOM WHERE FLOW_ID =tb_1.FLOW_ID AND INUSE = 1 LIMIT 1) = 1 ,2,tb_1.INUSE ) LIKE '%dataItem.INUSE%')"
    }

    if (dataItem['ColumnFilters']?.some((item: any) => item.column === 'INUSE') && dataItem['ColumnFilters'].find((item: any) => item.column === 'INUSE')?.value.length > 0) {
      let value =
        dataItem.ColumnFilters.find((item: any) => {
          return item.column === 'INUSE'
        })?.value || []

      if (value) {
        value = value.join(',')
      }

      dataItem = {
        ...dataItem,
        sqlWhereColumnFilter:
          dataItem.sqlWhereColumnFilter + ` AND (IF (EXISTS(SELECT FLOW_ID from BOM WHERE FLOW_ID =tb_1.FLOW_ID AND INUSE = 1 LIMIT 1) = 1 ,2,tb_1.INUSE ) IN (${value}))`,
      }
    }

    if (dataItem['InuseRawData'] && dataItem['InuseRawData'] != '') {
      sqlWhere += " AND tb_1.INUSE LIKE '%dataItem.InuseRawData%'"
    }

    // query = await FlowSQL.searchFlow(dataItem)
    query = await FlowSQL.searchFlow(dataItem, sqlWhere, sqlJoin, sqlSelect)
    //}

    resultData = (await MySQLExecute.search(query)) as RowDataPacket[]

    return resultData
  },
  createFlow: async (dataItem: any) => {
    let query = await FlowSQL.createFlow(dataItem)
    let resultData = await MySQLExecute.execute(query)
    return resultData
  },
  updateFlow: async (dataItem: any) => {
    let query = await FlowSQL.updateFlow(dataItem)
    let resultData = await MySQLExecute.execute(query)
    return resultData
  },
  updateFlowNameByFlowId: async (dataItem: any) => {
    let query = await FlowSQL.updateFlowNameByFlowId(dataItem)
    let resultData = await MySQLExecute.execute(query)
    return resultData
  },
  deleteFlow: async (dataItem: any) => {
    let query = await FlowSQL.deleteFlow(dataItem)
    let resultData = await MySQLExecute.execute(query)
    return resultData
  },
  getByLikeFlowName: async (dataItem: any) => {
    let query = await FlowSQL.getByLikeFlowName(dataItem)
    let resultData = await MySQLExecute.search(query)
    return resultData
  },
  searchByProductMainId: async (dataItem: any) => {
    let query = await FlowSQL.searchByProductMainId(dataItem)
    let resultData = await MySQLExecute.search(query)
    return resultData
  },
  getByLikeFlowCodeAndInuseAndStandardCostActive: async (dataItem: any) => {
    let query = await FlowSQL.getByLikeFlowCodeAndInuseAndStandardCostActive(dataItem)
    let resultData = await MySQLExecute.search(query)
    return resultData
  },
  getByLikeFlowNameAndInuseAndStandardCostActive: async (dataItem: any) => {
    let query = await FlowSQL.getByLikeFlowNameAndInuseAndStandardCostActive(dataItem)
    let resultData = await MySQLExecute.search(query)
    return resultData
  },
  getProcessByLikeFlowIdAndInuse: async (dataItem: any) => {
    let query = await FlowSQL.getProcessByLikeFlowIdAndInuse(dataItem)
    let resultData = await MySQLExecute.search(query)
    return resultData
  },
  getByLikeFlowNameAndInuse: async (dataItem: any) => {
    const sql = await FlowSQL.getByLikeFlowNameAndInuse(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getByLikeFlowCodeAndInuse: async (dataItem: any) => {
    const sql = await FlowSQL.getByLikeFlowCodeAndInuse(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
}
