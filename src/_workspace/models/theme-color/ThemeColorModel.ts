import { ThemeColorService } from '@src/_workspace/services/theme-color/ThemeColorService'

export const ThemeColorModels = {
  getThemeColor: async (dataItem: any) => ThemeColorService.getThemeColor(dataItem),
}
