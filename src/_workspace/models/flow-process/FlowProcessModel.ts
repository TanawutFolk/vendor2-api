import { FlowProcessService } from '@src/_workspace/services/flow-process/FlowProcessService'

export const FlowProcessModel = {
  searchProcessByFlowProcessId: async (dataItem: any) => FlowProcessService.searchProcessByFlowProcessId(dataItem),
  createFlowProcess: async (dataItem: any) => FlowProcessService.createFlowProcess(dataItem),
  updateFlowProcess: async (dataItem: any) => FlowProcessService.updateFlowProcess(dataItem),
  getByLikeFlowNameAndInuse: async (dataItem: any) => FlowProcessService.getByLikeFlowNameAndInuse(dataItem),
  deleteFlowProcess: async (dataItem: any) => FlowProcessService.deleteFlowProcess(dataItem),
  getByLikeFlowNameAndProductMainIdAndInuse: async (dataItem: any) => FlowProcessService.getByLikeFlowNameAndProductMainIdAndInuse(dataItem),
  getByFlowId: async (dataItem: any) => FlowProcessService.getByFlowId(dataItem),
}
