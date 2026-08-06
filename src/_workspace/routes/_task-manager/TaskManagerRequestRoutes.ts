import { Router } from 'express'
import { TaskManagerRequestController } from '@src/_workspace/controllers/_task-manager/TaskManagerRequestController'

const taskManagerRequestRoutes = Router()

taskManagerRequestRoutes.post('/searchAllTask', TaskManagerRequestController.searchAllTask)
taskManagerRequestRoutes.post('/getGprCTaskManagerQueue', TaskManagerRequestController.getGprCTaskManagerQueue)

// Compatibility aliases used by the current frontend.
taskManagerRequestRoutes.post('/SearchAllTask', TaskManagerRequestController.searchAllTask)
taskManagerRequestRoutes.post('/gpr-c/task-manager-queue', TaskManagerRequestController.getGprCTaskManagerQueue)

export default taskManagerRequestRoutes
