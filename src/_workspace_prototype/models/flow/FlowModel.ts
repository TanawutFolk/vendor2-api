import { FlowService } from '@src/_workspace/services/flow/FlowService'

export const FlowModel = {
  getFlow: async (dataItem: any) => FlowService.getFlow(dataItem),
  searchFlow: async (dataItem: any) => FlowService.searchFlow(dataItem),
  createFlow: async (dataItem: any) => FlowService.createFlow(dataItem),
  updateFlow: async (dataItem: any) => FlowService.updateFlow(dataItem),
  updateFlowNameByFlowId: async (dataItem: any) => FlowService.updateFlowNameByFlowId(dataItem),
  deleteFlow: async (dataItem: any) => FlowService.deleteFlow(dataItem),
  getByLikeFlowName: async (dataItem: any) => FlowService.getByLikeFlowName(dataItem),
  searchByProductMainId: async (dataItem: any) => FlowService.searchByProductMainId(dataItem),
  getByLikeFlowCodeAndInuseAndStandardCostActive: async (dataItem: any) => FlowService.getByLikeFlowCodeAndInuseAndStandardCostActive(dataItem),
  getByLikeFlowNameAndInuseAndStandardCostActive: async (dataItem: any) => FlowService.getByLikeFlowNameAndInuseAndStandardCostActive(dataItem),
  getProcessByLikeFlowIdAndInuse: async (dataItem: any) => FlowService.getProcessByLikeFlowIdAndInuse(dataItem),
  getByLikeFlowNameAndInuse: async (dataItem: any) => FlowService.getByLikeFlowNameAndInuse(dataItem),
  checkFlowProcessExist: async (dataItem: any) => FlowService.checkFlowProcessExist(dataItem),
  getByLikeFlowCodeAndInuse: async (dataItem: any) => FlowService.getByLikeFlowCodeAndInuse(dataItem),
  // getByLikeFlowNameAndProductMainIdAndInuse: async dataItem =>
  //   FlowService.getByLikeFlowNameAndProductMainIdAndInuse(dataItem)
}
