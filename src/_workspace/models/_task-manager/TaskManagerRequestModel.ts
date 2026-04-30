import { TaskManagerRequestService } from '../../services/_task-manager/TaskManagerRequestService'

export const TaskManagerRequestModel = {
    searchAllTask: TaskManagerRequestService.searchAllTask,
    gprCTaskManagerQueue: TaskManagerRequestService.gprCTaskManagerQueue,
}
