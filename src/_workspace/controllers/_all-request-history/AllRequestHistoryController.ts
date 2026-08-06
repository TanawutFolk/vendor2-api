import { AllRequestHistoryModel } from '@src/_workspace/models/_all-request-history/AllRequestHistoryModel'
import type { AllRequestHistorySearchData } from '@src/_workspace/types/AllRequestHistory'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

const requestData = (req: Request) => (!req.body || Object.entries(req.body).length === 0 ? req.query : req.body)

export const AllRequestHistoryController = {
  search: async (req: Request, res: Response) => {
    try {
      const dataItem = requestData(req)
      const requestYearRaw = dataItem.REQUEST_YEAR
      const requestYear = requestYearRaw === undefined || requestYearRaw === null || requestYearRaw === '' ? null : Number(requestYearRaw)

      if (requestYear !== null && (!Number.isInteger(requestYear) || requestYear < 1900 || requestYear > 9998)) {
        throw new Error('Invalid request year')
      }

      const searchData: AllRequestHistorySearchData = {
        REQUESTER_SECTION: String(dataItem.REQUESTER_SECTION || '').trim() || null,
        REQUEST_YEAR: requestYear,
        ORDER: Array.isArray(dataItem.ORDER)
          ? dataItem.ORDER.slice(0, 5).map((item: any) => ({
              id: String(item?.id || ''),
              desc: Boolean(item?.desc),
            }))
          : [],
        START: Math.max(0, Math.trunc(Number(dataItem.START) || 0)),
        LIMIT: Math.min(200, Math.max(1, Math.trunc(Number(dataItem.LIMIT) || 50))),
      }

      const { data, totalCount } = await AllRequestHistoryModel.search(searchData)
      res.status(200).json({
        Status: true,
        ResultOnDb: data,
        TotalCountOnDb: totalCount,
        MethodOnDb: 'Search All Request History',
        Message: 'Get Data Success',
      } as ResponseI)
      return
    } catch (error: any) {
      res.status(200).json({
        Status: false,
        ResultOnDb: [],
        TotalCountOnDb: 0,
        MethodOnDb: 'Search All Request History',
        Message: error?.message || 'Failed to search all request history',
      } as ResponseI)
      return
    }
  },

  getFilterOptions: async (_req: Request, res: Response) => {
    try {
      const result = await AllRequestHistoryModel.getFilterOptions()
      res.status(200).json({
        Status: true,
        ResultOnDb: result,
        TotalCountOnDb: result.length,
        MethodOnDb: 'Get All Request History Filter Options',
        Message: 'Get Data Success',
      } as ResponseI)
      return
    } catch (error: any) {
      res.status(200).json({
        Status: false,
        ResultOnDb: [],
        TotalCountOnDb: 0,
        MethodOnDb: 'Get All Request History Filter Options',
        Message: error?.message || 'Failed to get all request history filter options',
      } as ResponseI)
      return
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const dataItem = requestData(req)
      const requestId = Number(dataItem.REQUEST_REGISTER_VENDOR_ID)

      if (!Number.isInteger(requestId) || requestId <= 0) {
        res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Get All Request History Details',
          Message: 'Invalid request id',
        } as ResponseI)
        return
      }

      const result = await AllRequestHistoryModel.getById(requestId)
      res.status(200).json({
        Status: true,
        ResultOnDb: result,
        TotalCountOnDb: result ? 1 : 0,
        MethodOnDb: 'Get All Request History Details',
        Message: result ? 'Get Data Success' : 'Request not found',
      } as ResponseI)
      return
    } catch (error: any) {
      res.status(200).json({
        Status: false,
        ResultOnDb: {},
        TotalCountOnDb: 0,
        MethodOnDb: 'Get All Request History Details',
        Message: error?.message || 'Failed to get all request history details',
      } as ResponseI)
      return
    }
  },
}
