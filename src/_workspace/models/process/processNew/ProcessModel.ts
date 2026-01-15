import { ProcessService } from '@src/_workspace/services/process/processNew/ProcessService'
export const ProcessModel = {
  getProcess: async (dataItem: any) => ProcessService.getProcess(dataItem),

  searchProcess: async (dataItem: any) => ProcessService.searchProcess(dataItem),

  createProcess: async (dataItem: any) => ProcessService.createProcess(dataItem),

  updateProcess: async (dataItem: any) => ProcessService.updateProcess(dataItem),

  deleteProcess: async (dataItem: any) => ProcessService.deleteProcess(dataItem),

  getByLikeProcessName: async (dataItem: any) => ProcessService.getByLikeProcessName(dataItem),

  getByLikeProcessNameAndInuse: async (dataItem: any) => ProcessService.getByLikeProcessNameAndInuse(dataItem),

  getByLikeProcessNameAndProductMainIdAndInuse: async (dataItem: any) => ProcessService.getByLikeProcessNameAndProductMainIdAndInuse(dataItem),
}
