import { Router } from 'express'
import { TaskManagerRequestController } from '@src/_workspace/controllers/_task-manager/TaskManagerRequestController'

const taskManagerRequestRoutes = Router()

taskManagerRequestRoutes.post('/gpr-c/task-manager-queue', TaskManagerRequestController.gprCTaskManagerQueue)

export default taskManagerRequestRoutes
