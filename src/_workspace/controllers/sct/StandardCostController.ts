import { StandardCostModel } from '@src/_workspace/models/sct/StandardCostModel'
import { getSqlWhereByColumnFilters } from '@src/helpers/getSqlWhereByFilterColumn'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'
import { RowDataPacket } from 'mysql2'

export const StandardCostController = {
  getByLikeSctPatternName: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    const result = await StandardCostModel.getByLikeSctPatternName(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Search By Like Sct Pattern Name',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  getSctByLikeProductTypeIdAndCondition: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    const result = await StandardCostModel.getSctByLikeProductTypeIdAndCondition(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Search By Like Sct Pattern Name',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  getByLikeSctTagSettingNameAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    const result = await StandardCostModel.getByLikeSctTagSettingNameAndInuse(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Search By Like Tag Pattern Name',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  getByLikeSctReasonSettingNameAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await StandardCostModel.getByLikeSctReasonSettingNameAndInuse(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Search By Like Reason Pattern Name',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  searchSctCodeForSelection: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const tableIds = [
      { table: 'tb_1', id: 'FISCAL_YEAR' },
      { table: 'tb_1', id: 'SCT_PATTERN_ID' },
      { table: 'tb_1', id: 'BOM_ID' },
      { table: 'tb_5', id: 'PRODUCT_TYPE_ID' },
      { table: 'tb_8', id: 'PRODUCT_CATEGORY_ID' },
      { table: 'tb_7', id: 'PRODUCT_MAIN_ID' },
      { table: 'tb_6', id: 'PRODUCT_SUB_ID' },
    ]

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
        orderBy += word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
      }
      orderBy = orderBy.slice(0, -1)
    }
    dataItem['Order'] = orderBy

    let sqlWhereColumnFilter = ''
    if (dataItem?.ColumnFilters?.length > 0) {
      sqlWhereColumnFilter += getSqlWhereByColumnFilters(dataItem.ColumnFilters, tableIds)
    }

    dataItem['sqlWhereColumnFilter'] = sqlWhereColumnFilter

    const result = await StandardCostModel.searchSctCodeForSelection(dataItem)

    res.status(200).json({
      Status: true,
      ResultOnDb: result[1],
      TotalCountOnDb: result[0][0]['TOTAL_COUNT'] ?? 0,
      MethodOnDb: 'Search Sct Code For Selection',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  searchProductSubBySctNo: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await StandardCostModel.searchProductSubBySctNo(dataItem)

    res.status(200).json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Search Product Sub',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  searchMaterialPackingAndRawMatBySctNo: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    const result = await StandardCostModel.searchMaterialPackingAndRawMatBySctNo(dataItem)

    res.status(200).json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Search Material Packing And Raw Material',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  searchSctCodeForSelectionMaterialPrice: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    dataItem['Order'] = JSON.parse(dataItem['Order']) ?? []
    dataItem['ColumnFilters'] = JSON.parse(dataItem['ColumnFilters']) ?? []

    const tableIds = [
      { table: 'tb_1', id: 'FISCAL_YEAR' },
      { table: 'tb_1', id: 'SCT_PATTERN_ID' },
      { table: 'tb_1', id: 'BOM_ID' },
      { table: 'tb_5', id: 'PRODUCT_TYPE_ID' },
      { table: 'tb_8', id: 'PRODUCT_CATEGORY_ID' },
      { table: 'tb_7', id: 'PRODUCT_MAIN_ID' },
      { table: 'tb_6', id: 'PRODUCT_SUB_ID' },
    ]

    dataItem['Start'] = Number(dataItem['Start']) * Number(dataItem['Limit'])
    let orderBy = ''

    if (dataItem['Order'].length <= 0) {
      orderBy = 'tb_1.UPDATE_DATE DESC'
    } else {
      for (let i = 0; i < dataItem['Order'].length; i++) {
        const word = dataItem['Order'][i]
        orderBy += word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
      }
      orderBy = orderBy.slice(0, -1)
    }
    dataItem['Order'] = orderBy

    let sqlWhereColumnFilter = ''
    if (dataItem?.ColumnFilters?.length > 0) {
      sqlWhereColumnFilter += getSqlWhereByColumnFilters(dataItem.ColumnFilters, tableIds)
    }

    dataItem['sqlWhereColumnFilter'] = sqlWhereColumnFilter

    const result = (await StandardCostModel.searchSctCodeForSelectionMaterialPrice(dataItem)) as RowDataPacket[]

    res.json({
      Status: true,
      ResultOnDb: result[1],
      TotalCountOnDb: result[0][0]['TOTAL_COUNT'] ?? 0,
      MethodOnDb: 'Search Sct Code For Selection',
      Message: 'Search Data Success',
    } as ResponseI)
  },

  get: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    const result = await StandardCostModel.get(dataItem)

    return res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Search By Like Sct Pattern Name',
      Message: 'Search Data Success',
    })
  },
}
