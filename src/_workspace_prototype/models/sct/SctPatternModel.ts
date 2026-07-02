import { SctPatternService } from '@_workspace/services/sct/SctPatternService'

export const SctPatternModel = {
  getByLikePatternNameAndInuse: async (dataItem: any) => SctPatternService.getByLikePatternNameAndInuse(dataItem),
}
