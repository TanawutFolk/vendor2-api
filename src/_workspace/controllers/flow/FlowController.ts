import { FlowModel } from '@src/_workspace/models/flow/FlowModel'
import { getSqlWhereByColumnFilters } from '@src/helpers/getSqlWhereByFilterColumn'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const FlowController = {
  // getByLikeFlowNameAndProductMainIdAndInuse: async ({ query }) => {
  //   const result = await FlowModel.getByLikeFlowNameAndProductMainIdAndInuse(query)
  //   return {
  //     Status: true,
  //     ResultOnDb: result || [],
  //     TotalCountOnDb: result?.length ?? 0,
  //     MethodOnDb: '',
  //     Message: ''
  //   } as ResponseI
  // },
  getByLikeFlowNameAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    let result = await FlowModel.getByLikeFlowNameAndInuse(dataItem)

    res.json({
      Status: true,
      Message: 'getByLikeProductCategoryNameAndInuse Data Success',
      ResultOnDb: result,
      MethodOnDb: 'getByLikeProductCategoryNameAndInuse Category',
      TotalCountOnDb: 0,
    } as ResponseI)
  },

  getFlow: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await FlowModel.getFlow(dataItem)

    res.json({
      Status: true,
      Message: 'Search Data Success',
      ResultOnDb: result,
      MethodOnDb: 'Search Flow',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
  searchFlow: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    //console.log(dataItem)

    const tableIds = [
      { table: 'tb_2', id: 'PRODUCT_MAIN_NAME', Fns: 'LIKE' },
      { table: 'tb_2', id: 'PRODUCT_MAIN_ID', Fns: '=' },
      { table: 'tb_1', id: 'FLOW_CODE', Fns: 'LIKE' },
      { table: 'tb_1', id: 'FLOW_NAME', Fns: 'LIKE' },
      { table: 'tb_1', id: 'TOTAL_COUNT_PROCESS', Fns: 'LIKE' },
      { table: 'tb_5', id: 'PRODUCT_TYPE_CODE', Fns: 'LIKE' },
      { table: 'tb_5', id: 'PRODUCT_TYPE_NAME', Fns: 'LIKE' },
      // { table: 'tb_1', id: 'INUSE' },
      { table: 'tb_1', id: 'UPDATE_BY', Fns: 'LIKE' },
      { table: 'tb_1', id: 'UPDATE_DATE', Fns: '=' },
    ]

    // dataItem = {
    //   ...dataItem,
    //   sqlJoin: `
    //                               FLOW tb_1
    //                                 INNER JOIN
    //                             PRODUCT_MAIN tb_2
    //                                 ON tb_1.PRODUCT_MAIN_ID = tb_2.PRODUCT_MAIN_ID
    //                                 INNER JOIN
    //                             PRODUCT_CATEGORY tb_3
    //                                 ON tb_2.PRODUCT_CATEGORY_ID = tb_3.PRODUCT_CATEGORY_ID`,

    //   selectInuseForSearch: `
    //             IF (EXISTS(SELECT FLOW_ID from BOM WHERE FLOW_ID =tb_1.FLOW_ID AND INUSE = 1 LIMIT 1) = 1 , 2 , tb_1.INUSE) AS inuseForSearch
    //           `,
    // }

    // // Use getSqlWhere to construct the WHERE clause
    // getSqlWhere(dataItem, tableIds)

    dataItem['Start'] = Number(dataItem['Start']) * Number(dataItem['Limit'])
    let orderBy = ''
    if (typeof dataItem.Order === 'string') {
      try {
        dataItem.Order = JSON.parse(dataItem.Order) // แปลง string → array
      } catch (error) {
        console.error('Error parsing Order:', error)
        dataItem.Order = [] // ถ้าพาร์สไม่ผ่าน ให้กำหนดเป็นอาร์เรย์ว่าง
      }
    }
    if (dataItem['Order'].length <= 0) {
      orderBy = 'tb_1.UPDATE_DATE DESC'
    } else {
      for (let i = 0; i < dataItem['Order'].length; i++) {
        const word = dataItem['Order'][i]
        if (word['id'] == 'PRODUCT_MAIN_NAME') {
          orderBy += 'tb_2.' + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
        } else if (word['id'] == 'INUSE') {
          orderBy += word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
        } else if (word['id'] == 'PRODUCT_TYPE_CODE') {
          orderBy += 'tb_5.' + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
        } else if (word['id'] == 'PRODUCT_TYPE_NAME') {
          orderBy += 'tb_5.' + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
        } else {
          orderBy += 'tb_1.' + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
        }
      }
      orderBy = orderBy.slice(0, -1)
    }
    dataItem['Order'] = orderBy

    let sqlWhereColumnFilter = ''
    if (dataItem?.ColumnFilters?.length > 0) {
      sqlWhereColumnFilter += getSqlWhereByColumnFilters(dataItem.ColumnFilters, tableIds)
    }

    dataItem['sqlWhereColumnFilter'] = sqlWhereColumnFilter

    const result = await FlowModel.searchFlow(dataItem)
    for (let i = 0; i < result[1].length; i++) {
      result[1][i]['No'] = i + 1
    }

    res.status(200).json({
      Status: true,
      ResultOnDb: result[1],
      TotalCountOnDb: result[0][0]['TOTAL_COUNT'] ?? 0,
      MethodOnDb: 'Search Process',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  createFlow: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    const result = await FlowModel.createFlow(dataItem)

    res.status(200).json({
      Status: true,
      ResultOnDb: result,
      MethodOnDb: 'Create Flow',
      Message: 'Create Data Success',
    } as ResponseI)
  },
  updateFlow: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    const result = await FlowModel.updateFlow(dataItem)

    res.status(200).json({
      Status: true,
      ResultOnDb: result,
      MethodOnDb: 'Update Flow',
      Message: 'อัปเดตข้อมูลเรียบร้อยแล้ว Data has been updated successfully',
    } as ResponseI)
  },
  updateFlowNameByFlowId: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    const result = await FlowModel.updateFlowNameByFlowId(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      MethodOnDb: 'Update Flow Name By Flow Id',
      Message: 'อัปเดตข้อมูลเรียบร้อยแล้ว Data has been updated successfully',
    } as ResponseI)
  },
  deleteFlow: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    const result = await FlowModel.deleteFlow(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      MethodOnDb: 'Delete Flow',
      Message: 'ลบข้อมูลเรียบร้อยแล้ว Data has been deleted successfully',
    } as ResponseI)
  },
  getByLikeFlowName: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    const result = await FlowModel.getByLikeFlowName(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      MethodOnDb: 'Get By Like Flow Name',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  searchByProductMainId: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await FlowModel.searchByProductMainId(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      MethodOnDb: 'Search By Product Main Id',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  getByLikeFlowCodeAndInuseAndStandardCostActive: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await FlowModel.getByLikeFlowCodeAndInuseAndStandardCostActive(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      MethodOnDb: 'Get By Like Flow Code And Inuse And Standard Cost Active',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  getByLikeFlowNameAndInuseAndStandardCostActive: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await FlowModel.getByLikeFlowNameAndInuseAndStandardCostActive(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      MethodOnDb: 'Get By Like Flow Name And Inuse And Standard Cost Active',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  getProcessByLikeFlowIdAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await FlowModel.getProcessByLikeFlowIdAndInuse(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      MethodOnDb: 'Get Process By Like Flow Id And Inuse Flow',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  getByLikeFlowCodeAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    let result = await FlowModel.getByLikeFlowCodeAndInuse(dataItem)

    res.json({
      Status: true,
      Message: 'getByLikeFlowCodeAndInuse Data Success',
      ResultOnDb: result,
      MethodOnDb: 'getByLikeFlowCodeAndInuse Category',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
}
