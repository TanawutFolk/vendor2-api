import { SctComponentTypeResourceOptionSelectService } from '@src/_workspace/services/sct/sct-for-product/SctComponentTypeResourceOptionSelectService'

export const SctComponentTypeResourceOptionSelectModel = {
  getBySctId: async (dataItem: any) => SctComponentTypeResourceOptionSelectService.getBySctId(dataItem),
}
