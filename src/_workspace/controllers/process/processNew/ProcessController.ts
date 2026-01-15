import { ProcessModel } from '@src/_workspace/models/process/processNew/ProcessModel'
import getSqlWhere from '@src/helpers/sqlWhere'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const ProcessController = {
  getProcess: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await ProcessModel.getProcess(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Search Process',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  searchProcess: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    const tableIds = [
      { table: 'tb_1', id: 'PROCESS_ID', Fns: '=' },
      { table: 'tb_1', id: 'PROCESS_CODE', Fns: 'LIKE' },
      { table: 'tb_1', id: 'PROCESS_NAME', Fns: 'LIKE' },
      { table: 'tb_2', id: 'PRODUCT_MAIN_NAME', Fns: 'LIKE' },
      // { table: 'tb_1', id: 'INUSE' },
      { table: 'tb_1', id: 'UPDATE_BY', Fns: 'LIKE' },
      { table: 'tb_1', id: 'UPDATE_DATE', Fns: '=' },
    ]

    dataItem = {
      ...dataItem,
      sqlJoin: `
                             PROCESS tb_1
                                  INNER JOIN
                              PRODUCT_MAIN tb_2
                                  ON tb_1.PRODUCT_MAIN_ID = tb_2.PRODUCT_MAIN_ID`,

      selectInuseForSearch: `
                 (
                                IF (tb_1.INUSE = 0, 0, IF(
                                  EXISTS
                                        (
                                          SELECT
                                              tbs_1.PROCESS_ID
                                          FROM
                                              FLOW_PROCESS tbs_1
                                          INNER JOIN
                                              FLOW tbs_2
                                          ON
                                              tbs_1.FLOW_ID = tbs_2.FLOW_ID AND tbs_2.INUSE = 1 AND tbs_1.INUSE = 1 AND tbs_1.PROCESS_ID = tb_1.PROCESS_ID
                                        ) = TRUE
                                  , 2
                                  , IF(
                                    EXISTS (
                                      SELECT
                                          PROCESS_ID
                                      FROM
                                          FLOW_PROCESS
                                      WHERE
                                          PROCESS_ID = tb_1.PROCESS_ID
                                    ) = TRUE
                                  , 3
                                  , 1
                                  )
                                ))
                              ) AS inuseForSearch
          `,
    }
    getSqlWhere(dataItem, tableIds)

    // dataItem['Start'] = Number(dataItem['Start']) * Number(dataItem['Limit'])
    // let orderBy = ''
    // if (typeof dataItem.Order === 'string') {
    //   try {
    //     dataItem.Order = JSON.parse(dataItem.Order) // แปลง string → array
    //   } catch (error) {
    //     console.error('Error parsing Order:', error)
    //     dataItem.Order = [] // ถ้าพาร์สไม่ผ่าน ให้กำหนดเป็นอาร์เรย์ว่าง
    //   }
    // }
    // if (dataItem['Order'].length <= 0) {
    //   orderBy = 'tb_1.UPDATE_DATE DESC'
    // } else {
    //   for (let i = 0; i < dataItem['Order'].length; i++) {
    //     const word = dataItem['Order'][i]
    //     if (word['id'] == 'PRODUCT_MAIN_NAME') {
    //       orderBy += 'tb_2.' + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
    //     } else if (word['id'] == 'INUSE') {
    //       orderBy += word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
    //     } else {
    //       orderBy += 'tb_1.' + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
    //     }
    //   }
    //   orderBy = orderBy.slice(0, -1)
    // }
    // dataItem['Order'] = orderBy

    // let sqlWhereColumnFilter = ''
    // if (dataItem?.ColumnFilters?.length > 0) {
    //   sqlWhereColumnFilter += getSqlWhereByColumnFilters(dataItem.ColumnFilters, tableIds)
    // }

    // dataItem['sqlWhereColumnFilter'] = sqlWhereColumnFilter

    const result = await ProcessModel.searchProcess(dataItem)

    res.status(200).json({
      Status: true,
      ResultOnDb: result[1],
      TotalCountOnDb: result[0][0]['TOTAL_COUNT'] ?? 0,
      MethodOnDb: 'Search Process',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  createProcess: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    const result = await ProcessModel.createProcess(dataItem)

    res.status(200).json({
      Status: true,
      ResultOnDb: result,
      MethodOnDb: 'Create Process',
      Message: 'บันทึกข้อมูลสำเร็จ Successfully saved',
    } as ResponseI)
  },
  updateProcess: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    const result = await ProcessModel.updateProcess(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      MethodOnDb: 'Update Process',
      Message: 'บันทึกข้อมูลสำเร็จ Successfully saved',
    } as ResponseI)
  },
  deleteProcess: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    const result = await ProcessModel.deleteProcess(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      MethodOnDb: 'Delete Process',
      Message: 'ลบข้อมูลสำเร็จ Successfully deleted',
    } as ResponseI)
  },
  getByLikeProcessName: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await ProcessModel.getByLikeProcessName(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      MethodOnDb: 'GetByLikeProcessName',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  getByLikeProcessNameAndProductMainIdAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await ProcessModel.getByLikeProcessNameAndProductMainIdAndInuse(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      MethodOnDb: 'GetByLikeProcessNameAndProductMainIdAndInuse',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  getByLikeProcessNameAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await ProcessModel.getByLikeProcessNameAndInuse(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Search Process',
      Message: 'Search Data Success',
    } as ResponseI)
  },
}
