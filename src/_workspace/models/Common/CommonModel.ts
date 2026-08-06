import { CommonService } from '@src/_workspace/services/Common/Common'

export const CommonModel = {
  getByLikeMonthShortNameEnglish: async (dataItem: any) => CommonService.getByLikeMonthShortNameEnglish(dataItem),
  getYearNow: async () => CommonService.getYearNow(),

  // Compatibility aliases for legacy consumers outside the active workspace.
  GetByLikeMonthShortNameEnglish: async (dataItem: any) => CommonService.getByLikeMonthShortNameEnglish(dataItem),
  GetYearNow: async () => CommonService.getYearNow(),
}
