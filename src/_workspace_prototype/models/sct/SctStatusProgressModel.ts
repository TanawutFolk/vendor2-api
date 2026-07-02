import { SctStatusProgressService } from '@src/_workspace/services/sct/SctStatusProgressService'

export const SctStatusProgressModel = {
  getByLikeSctStatusProgressNameAndInuse: async (dataItem: any) => SctStatusProgressService.getByLikeSctStatusProgressNameAndInuse(dataItem),
  getBySctStatusProgressNameAndInuse_withDisabledOption: async (dataItem: any) => SctStatusProgressService.getBySctStatusProgressNameAndInuse_withDisabledOption(dataItem),
}
