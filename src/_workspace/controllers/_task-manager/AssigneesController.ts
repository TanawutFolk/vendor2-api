import { Request, Response } from 'express'
import { AssigneesService } from '../../services/_task-manager/AssigneesService'
import { ResponseI } from '@src/types/ResponseI'

export const AssigneesController = {
    search: async (req: Request, res: Response) => {
        try {
            const result = await AssigneesService.search(req.body)
            res.status(200).json({
                Status: true,
                ResultOnDb: result,
                TotalCountOnDb: result.length,
                MethodOnDb: 'Search Assignees',
                Message: 'Success'
            } as ResponseI)
        } catch (error: any) {
            console.error('Error fetching assignees:', error)
            res.status(500).json({
                Status: false,
                ResultOnDb: [],
                TotalCountOnDb: 0,
                MethodOnDb: 'Search Assignees Failed',
                Message: error?.message
            } as ResponseI)
        }
    },

    save: async (req: Request, res: Response) => {
        try {
            const result = await AssigneesService.save(req.body)
            res.status(200).json({
                Status: true,
                ResultOnDb: result,
                TotalCountOnDb: 1,
                MethodOnDb: 'Save Assignee',
                Message: 'Success'
            } as ResponseI)
        } catch (error: any) {
            console.error('Error saving assignee:', error)
            res.status(500).json({
                Status: false,
                ResultOnDb: {},
                TotalCountOnDb: 0,
                MethodOnDb: 'Save Assignee Failed',
                Message: error?.message
            } as ResponseI)
        }
    },

    delete: async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id)
            const result = await AssigneesService.delete(id)
            res.status(200).json({
                Status: true,
                ResultOnDb: result,
                TotalCountOnDb: 1,
                MethodOnDb: 'Delete Assignee',
                Message: 'Success'
            } as ResponseI)
        } catch (error: any) {
            console.error('Error deleting assignee:', error)
            res.status(500).json({
                Status: false,
                ResultOnDb: {},
                TotalCountOnDb: 0,
                MethodOnDb: 'Delete Assignee Failed',
                Message: error?.message
            } as ResponseI)
        }
    }
}
