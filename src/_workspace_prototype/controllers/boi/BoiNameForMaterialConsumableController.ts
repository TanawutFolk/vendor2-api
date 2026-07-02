import { BoiNameForMaterialConsumableModel } from '@src/_workspace/models/boi/BoiNameForMaterialConsumableModel'
import getSqlWhere from '@src/helpers/sqlWhere'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'
import { RowDataPacket } from 'mysql2'

export const BoiNameForMaterialConsumableController = {
  search: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    // dataItem['Start'] = Number(dataItem['Start']) * Number(dataItem['Limit'])

    // let orderBy = ''

    // if (dataItem['Order'] == '') {
    //   orderBy = 'tb_1.UPDATE_DATE DESC , tb_1.INUSE DESC'
    // } else {
    //   for (let i = 0; i < JSON.parse(dataItem['Order']).length; i++) {
    //     const word = JSON.parse(dataItem['Order'])[i]
    //     if (word['id'] == 'BOI_PROJECT_NAME') {
    //       orderBy += 'tb_2.' + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
    //     } else if (word['id'] == 'BOI_UNIT_SYMBOL') {
    //       orderBy += 'tb_3.' + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
    //     } else if (word['id'] == 'BOI_PROJECT_CODE') {
    //       orderBy += 'tb_2.' + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
    //     } else {
    //       orderBy += 'tb_1.' + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
    //     }
    //   }
    //   orderBy = orderBy.slice(0, -1)
    // }
    // dataItem['Order'] = orderBy
    const tableIds = [
      { table: 'tb_2', id: 'BOI_PROJECT_ID', Fns: '=' },
      { table: 'tb_2', id: 'BOI_PROJECT_NAME', Fns: 'LIKE' },
      { table: 'tb_2', id: 'BOI_PROJECT_CODE', Fns: 'LIKE' },

      { table: 'tb_1', id: 'BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID', Fns: '=' },
      { table: 'tb_1', id: 'BOI_GROUP_NO', Fns: 'LIKE' },
      { table: 'tb_1', id: 'BOI_DESCRIPTION_MAIN_NAME', Fns: 'LIKE' },
      { table: 'tb_1', id: 'BOI_DESCRIPTION_SUB_NAME', Fns: 'LIKE' },

      { table: 'tb_1', id: 'CRATE_BY', Fns: 'LIKE' },
      { table: 'tb_1', id: 'CRATE_DATE', Fns: '=' },
      { table: 'tb_1', id: 'UPDATE_BY', Fns: 'LIKE' },
      { table: 'tb_1', id: 'UPDATE_DATE', Fns: '=' },
      { table: 'tb_3', id: 'BOI_UNIT_SYMBOL', Fns: 'LIKE' },
      { table: 'tb_3', id: 'BOI_UNIT_ID', Fns: '=' },
      { table: 'tb_1', id: 'INUSE', Fns: '=' },
    ]

    dataItem = {
      ...dataItem,
      sqlJoin: `
                  BOI_NAME_FOR_MATERIAL_CONSUMABLE tb_1
                  INNER JOIN
                        BOI_PROJECT tb_2
                        ON tb_1.BOI_PROJECT_ID = tb_2.BOI_PROJECT_ID
                  INNER JOIN
                        BOI_UNIT tb_3
                        ON  tb_1.BOI_UNIT_ID = tb_3.BOI_UNIT_ID`,

      selectInuseForSearch: `
        tb_1.INUSE AS inuseForSearch
      `,
    }

    // Use getSqlWhere to construct the WHERE clause
    getSqlWhere(dataItem, tableIds)
    // //console.log(query)
    const result = (await BoiNameForMaterialConsumableModel.search(dataItem)) as RowDataPacket[]

    for (let i = 0; i < result[1].length; i++) {
      result[1][i]['No'] = i + 1
    }

    res.status(200).json({
      Status: true,
      Message: '',
      ResultOnDb: result[1] || [],
      MethodOnDb: '',
      TotalCountOnDb: result[0][0]['TOTAL_COUNT'],
    } as ResponseI)
  },
  SearchWorkFlowStepDescriptionMainNameForFetch: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    let result = await BoiNameForMaterialConsumableModel.SearchWorkFlowStepDescriptionMainNameForFetch(dataItem)

    res.json({
      Status: true,
      Message: 'SearchWorkFlowStepDescriptionMainNameForFetch Data Success',
      ResultOnDb: result,
      MethodOnDb: 'SearchWorkFlowStepDescriptionMainNameForFetch',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
  SearchWorkFlowStepBoiGroupNoForFetch: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    let result = await BoiNameForMaterialConsumableModel.SearchWorkFlowStepBoiGroupNoForFetch(dataItem)

    res.json({
      Status: true,
      Message: 'SearchWorkFlowStepBoiGroupNoForFetch Data Success',
      ResultOnDb: result,
      MethodOnDb: 'SearchWorkFlowStepBoiGroupNoForFetch',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
  getByLikeBoiGroupNoAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    let result = await BoiNameForMaterialConsumableModel.getByLikeBoiGroupNoAndInuse(dataItem)

    res.json({
      Status: true,
      Message: 'getByLikeBoiGroupNoAndInuse Data Success',
      ResultOnDb: result,
      MethodOnDb: 'getByLikeBoiGroupNoAndInuse',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
  getByLikeBoiSymbolAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    let result = await BoiNameForMaterialConsumableModel.getByLikeBoiSymbolAndInuse(dataItem)

    res.json({
      Status: true,
      Message: 'getByLikeProductMainNameAndInuse Data Success',
      ResultOnDb: result,
      MethodOnDb: 'getByLikeProductMainNameAndInuse Category',
      TotalCountOnDb: 0,
    } as ResponseI)
  },

  create: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    let result = await BoiNameForMaterialConsumableModel.create(dataItem)
    res.status(200).json(result as ResponseI)
  },
  update: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    let result = await BoiNameForMaterialConsumableModel.update(dataItem)
    res.json(result as ResponseI)
  },
  delete: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    let result = await BoiNameForMaterialConsumableModel.delete(dataItem)

    res.json({
      Status: true,
      Message: 'ลบข้อมูลเรียบร้อยแล้ว Data has been deleted successfully',
      ResultOnDb: result,
      MethodOnDb: 'Delete Boi',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
}
