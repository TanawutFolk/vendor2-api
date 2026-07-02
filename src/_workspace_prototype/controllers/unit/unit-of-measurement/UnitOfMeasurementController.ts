import { UnitOfMeasurementModel } from '@src/_workspace/models/unit/unit-of-measurement/UnitOfMeasurementModel'
import getSqlWhere from '@src/helpers/sqlWhere'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'
import { RowDataPacket } from 'mysql2'

export const UnitOfMeasurementController = {
  getUnit: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await UnitOfMeasurementModel.getUnit(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Search UnitOfMeasurement',
      Message: 'Search Data Success',
    } as ResponseI)
  },

  searchUnit: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    const tableIds = [
      { table: 'tb_1', id: 'UNIT_OF_MEASUREMENT_ID', Fns: '=' },
      { table: 'tb_1', id: 'UNIT_OF_MEASUREMENT_NAME', Fns: 'LIKE' },
      { table: 'tb_1', id: 'SYMBOL', Fns: 'LIKE' },
      { table: 'tb_1', id: 'CRATE_BY', Fns: 'LIKE' },
      { table: 'tb_1', id: 'CRATE_DATE', Fns: '=' },
      { table: 'tb_1', id: 'UPDATE_BY', Fns: 'LIKE' },
      { table: 'tb_1', id: 'UPDATE_DATE', Fns: '=' },
      { table: 'tb_1', id: 'INUSE', Fns: '=' },
      // { table: 'tb_1', id: 'inuseForSearch', Fns: '=' },
    ]

    dataItem = {
      ...dataItem,
      sqlJoin: `
                          UNIT_OF_MEASUREMENT tb_1`,

      selectInuseForSearch: `
        tb_1.INUSE AS inuseForSearch
      `,
    }

    getSqlWhere(dataItem, tableIds)
    const result = (await UnitOfMeasurementModel.searchUnit(dataItem)) as RowDataPacket[]

    res.status(200).json({
      Status: true,
      ResultOnDb: result[1],
      TotalCountOnDb: result[0][0]['TOTAL_COUNT'] ?? 0,
      MethodOnDb: 'Search UnitOfMeasurement',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  createUnit: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await UnitOfMeasurementModel.createUnit(dataItem)

    res.status(200).json(result as ResponseI)
  },
  updateUnit: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await UnitOfMeasurementModel.updateUnit(dataItem)

    res.json(result as ResponseI)
  },
  deleteUnit: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await UnitOfMeasurementModel.deleteUnit(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      MethodOnDb: 'Delete UnitOfMeasurement',
      Message: 'ลบข้อมูลสำเร็จ Successfully deleted',
    } as ResponseI)
  },
  getByLikeUnitOfMeasurementName: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await UnitOfMeasurementModel.getByLikeUnitOfMeasurementName(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      MethodOnDb: 'Search UnitOfMeasurement',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  getByLikeSymbol: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    const result = await UnitOfMeasurementModel.getByLikeSymbol(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      MethodOnDb: 'Search UnitOfMeasurement',
      Message: 'Search Data Success',
    } as ResponseI)
  },
}
