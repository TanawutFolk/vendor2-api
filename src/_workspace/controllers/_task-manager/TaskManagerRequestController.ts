import { TaskManagerRequestModel } from '@src/_workspace/models/_task-manager/TaskManagerRequestModel'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'
import getSqlWhere_aggrid from '@src/helpers/getSqlWhere_aggrid'

export const TaskManagerRequestController = {
  searchAllTask: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    try {
      // Table mapping for AG Grid SearchFilters
      const tableIds = [
        { table: 't', id: 'request_status', Fns: '=' },
        { table: 't', id: 'company_name', Fns: 'LIKE' },
        { table: 't', id: 'current_owner_empcode', Fns: 'LIKE' },
      ]

      // Filter out null/empty values from SearchFilters before passing to helper
      if (dataItem.SearchFilters && Array.isArray(dataItem.SearchFilters)) {
        dataItem.SearchFilters = dataItem.SearchFilters.filter((item: any) => item.value !== null && item.value !== undefined && item.value !== '')
      }

      // Default Limit if not provided by frontend
      dataItem.Limit = dataItem.Limit || 50

      const { data, totalCount } = await TaskManagerRequestModel.searchAllTask(dataItem)
      return res.status(200).json({
        Status: true,
        ResultOnDb: data,
        TotalCountOnDb: totalCount,
        MethodOnDb: 'SearchAllTask',
        Message: 'Get Data Success',
      } as ResponseI)
    } catch (error: any) {
      console.error('SearchAllTask Error:', error)
      return res.status(200).json({
        Status: false,
        ResultOnDb: [],
        TotalCountOnDb: 0,
        MethodOnDb: 'SearchAllTask',
        Message: error?.message || 'Failed to search task queue',
      } as ResponseI)
    }
  },

  gprCTaskManagerQueue: async (_req: Request, res: Response) => {
    try {
      const result = await TaskManagerRequestModel.gprCTaskManagerQueue()
      res.status(200).json(result as ResponseI)
    } catch (error: any) {
      console.error('Get GPR C Task Manager Queue Error:', error)
      res.status(200).json({
        Status: false,
        ResultOnDb: [],
        TotalCountOnDb: 0,
        MethodOnDb: 'Get GPR C Task Manager Queue',
        Message: error?.message || 'Failed to get GPR C task manager queue',
      } as ResponseI)
    }
  },
}
