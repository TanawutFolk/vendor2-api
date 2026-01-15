import { FlowProductTypeService } from '../../services/flow-product-type/flowProductTpeService'

export const FlowProductTypeModel = {
  searchFlowProductTypeByFlowId: async (dataItem: any) => FlowProductTypeService.searchFlowProductTypeByFlowId(dataItem),
}
