import { MySQLExecute } from '@businessData/dbExecute'
import { SctStatusProgressSQL } from '@src/_workspace/sql/sct/SctStatusProgressSQL'
import { RowDataPacket } from 'mysql2'

export const SctStatusProgressService = {
  getByLikeSctStatusProgressNameAndInuse: async (dataItem: any) => {
    let sql = await SctStatusProgressSQL.getByLikeSctStatusProgressNameAndInuse(dataItem)

    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  getBySctStatusProgressNameAndInuse_withDisabledOption: async (dataItem: any) => {
    let sql = await SctStatusProgressSQL.getByLikeSctStatusProgressNameAndInuse(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as {
      SCT_STATUS_PROGRESS_ID: number
      SCT_STATUS_PROGRESS_NAME: string
      SCT_STATUS_PROGRESS_NO: number
      IS_STAMPED_DATA: 0 | 1
    }[]

    const result = resultData.map((item) => ({
      ...item,
      isDisabled: dataItem.listStatusSctProgress.some((statusSctProgress: any) => statusSctProgress.SCT_STATUS_PROGRESS_ID == 1) ? true : false,
    }))

    return result
  },
}
