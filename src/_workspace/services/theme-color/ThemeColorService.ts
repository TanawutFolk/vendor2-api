import { MySQLExecute } from '@businessData/dbExecute'
import { ThemeColorSQL } from '@src/_workspace/sql/theme-color/ThemeColorSQL'

export const ThemeColorService = {
  getThemeColor: async (dataItem: any) => {
    const sql = await ThemeColorSQL.getThemeColor(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
}
