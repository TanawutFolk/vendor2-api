import { TaskManagerRequestModel } from '@src/_workspace/models/_task-manager/TaskManagerRequestModel'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const TaskManagerRequestController = {
    gprCTaskManagerQueue: async (_req: Request, res: Response) => {
        try {
            const result = await TaskManagerRequestModel.gprCTaskManagerQueue()
            res.status(200).json(result as ResponseI)
        } catch (error: any) {
            console.error('Get GPR C Task Manager Queue Error:', error)
            res.status(200).json({
                Status: false, ResultOnDb: [], TotalCountOnDb: 0,
                MethodOnDb: 'Get GPR C Task Manager Queue', Message: error?.message || 'Failed to get GPR C task manager queue'
            } as ResponseI)
        }
    }
}
