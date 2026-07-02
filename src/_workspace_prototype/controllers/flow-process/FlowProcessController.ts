import { FlowProcessModel } from '@src/_workspace/models/flow-process/FlowProcessModel'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'
import { RowDataPacket } from 'mysql2'

export const FlowProcessController = {
  getByLikeFlowNameAndProductMainIdAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = (await FlowProcessModel.getByLikeFlowNameAndProductMainIdAndInuse(dataItem)) as RowDataPacket[]

    res.json({
      Status: true,
      Message: '',
      ResultOnDb: result || [],
      MethodOnDb: '',
      TotalCountOnDb: result?.length ?? 0,
    } as ResponseI)
  },
  searchProcessByFlowProcessId: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await FlowProcessModel.searchProcessByFlowProcessId(dataItem)

    res.json({
      Status: true,
      Message: 'Search Data Success',
      ResultOnDb: result,
      MethodOnDb: 'Search Flow Process',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
  createFlowProcess: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    const result = await FlowProcessModel.createFlowProcess(dataItem)

    res.status(200).json(result as ResponseI)
  },
  updateFlowProcess: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    const result = await FlowProcessModel.updateFlowProcess(dataItem)

    res.json(result as ResponseI)
  },
  deleteFlowProcess: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    const result = await FlowProcessModel.deleteFlowProcess(dataItem)

    res.json({
      Status: true,
      Message: 'ลบข้อมูลสำเร็จ Successfully deleted',
      ResultOnDb: result,
      MethodOnDb: 'Delete Flow Process',
      TotalCountOnDb: 0,
    } as ResponseI)
  },

  getByLikeFlowNameAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    let result = await FlowProcessModel.getByLikeFlowNameAndInuse(dataItem)

    res.json({
      Status: true,
      Message: 'getByLikeProductCategoryNameAndInuse Data Success',
      ResultOnDb: result,
      MethodOnDb: 'getByLikeProductCategoryNameAndInuse Category',
      TotalCountOnDb: result.length,
    } as ResponseI)
  },
  getByFlowId: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    let result = await FlowProcessModel.getByFlowId(dataItem)

    return res.json({
      Status: true,
      Message: 'getByFlowId Data Success',
      ResultOnDb: result,
      MethodOnDb: 'getByFlowId Category',
      TotalCountOnDb: result.length,
    } as ResponseI)
  },
}
