import { FlowTypeService } from '@src/_workspace/services/flow-type/FlowTypeService'

export const FlowTypeModel = {
  getFlowType: async (dataItem: any) => FlowTypeService.getFlowType(dataItem),

  searchFlowType: async (dataItem: any) => FlowTypeService.searchFlowType(dataItem),

  createFlowType: async (dataItem: any) => FlowTypeService.createFlowType(dataItem),

  updateFlowType: async (dataItem: any) => FlowTypeService.updateFlowType(dataItem),

  deleteFlowType: async (dataItem: any) => FlowTypeService.deleteFlowType(dataItem),

  getByLikeFlowTypeName: async (dataItem: any) => FlowTypeService.getByLikeFlowTypeName(dataItem),
}
