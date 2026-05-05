import { TaskManagerRequestService } from '../../services/_task-manager/TaskManagerRequestService'

export const TaskManagerRequestModel = {
  searchAllTask: async (dataItem: any) => TaskManagerRequestService.searchAllTask(dataItem),
  gprCTaskManagerQueue: async () => TaskManagerRequestService.gprCTaskManagerQueue(),
}
