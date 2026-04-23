import { Request, Response } from 'express'
import { AssigneesService } from '../../services/_task-manager/AssigneesService'
import { ResponseI } from '@src/types/ResponseI'

export const AssigneesController = {
    getGroups: async (req: Request, res: Response) => {
        const dataItem = (!req.body || Object.entries(req.body).length === 0) ? req.query : req.body

        try {
            const result = await AssigneesService.getGroups(dataItem)
            return res.status(200).json({
                Status: true,
                ResultOnDb: result,
                TotalCountOnDb: result.length,
                MethodOnDb: 'Get Assignee Groups',
                Message: 'Success'
            } as ResponseI)
        } catch (error: any) {
            console.error('Get Assignee Groups Error:', error)
            return res.status(200).json({
                Status: false,
                ResultOnDb: [],
                TotalCountOnDb: 0,
                MethodOnDb: 'Get Assignee Groups',
                Message: error?.message || 'Failed to load groups'
            } as ResponseI)
        }
    },

    search: async (req: Request, res: Response) => {
        let dataItem

        if (!req.body || Object.entries(req.body).length === 0) {
            dataItem = req.query
        } else {
            dataItem = req.body
        }

        try {
            const result = await AssigneesService.search(dataItem)
            return res.status(200).json({
                Status: true,
                ResultOnDb: result,
                TotalCountOnDb: result.length,
                MethodOnDb: 'Search Assignees',
                Message: 'Success'
            } as ResponseI)
        } catch (error: any) {
            console.error('Search Assignees Error:', error)
            return res.status(200).json({
                Status: false,
                ResultOnDb: [],
                TotalCountOnDb: 0,
                MethodOnDb: 'Search Assignees',
                Message: error?.message || 'Failed to search assignees'
            } as ResponseI)
        }
    },

    save: async (req: Request, res: Response) => {
        let dataItem

        if (!req.body || Object.entries(req.body).length === 0) {
            dataItem = req.query
        } else {
            dataItem = req.body
        }

        try {
            const result = await AssigneesService.save(dataItem)
            return res.status(200).json({
                Status: result?.Status ?? true,
                ResultOnDb: result,
                TotalCountOnDb: result?.TotalCountOnDb ?? 1,
                MethodOnDb: result?.MethodOnDb || 'Save Assignee',
                Message: result?.Message || 'Success'
            } as ResponseI)
        } catch (error: any) {
            console.error('Save Assignee Error:', error)
            return res.status(200).json({
                Status: false,
                ResultOnDb: {},
                TotalCountOnDb: 0,
                MethodOnDb: 'Save Assignee',
                Message: error?.message || 'Failed to save assignee'
            } as ResponseI)
        }
    }
}
