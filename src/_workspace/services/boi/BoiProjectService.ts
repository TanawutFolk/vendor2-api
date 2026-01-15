import { MySQLExecute } from '@businessData/dbExecute'
import { BoiProjectSQL } from '@sql/boi/BoiProjectSQL'
import { RowDataPacket } from 'mysql2'

export const BoiProjectService = {
  search: async (dataItem: any) => {
    const sql = await BoiProjectSQL.search(dataItem)
    const resultData = (await MySQLExecute.searchList(sql)) as RowDataPacket[]
    return resultData
  },
  getByLikeBoiProjectNameAndInuse: async (dataItem: any) => {
    const sql = await BoiProjectSQL.getByLikeBoiProjectNameAndInuse(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getByLikeBoiProjectCodeAndInuse: async (dataItem: any) => {
    const sql = await BoiProjectSQL.getByLikeBoiProjectCodeAndInuse(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getByLikeBoiProductGroupAndInuse: async (dataItem: any) => {
    const sql = await BoiProjectSQL.getByLikeBoiProductGroupAndInuse(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getByLikeProductMainNameAndProductCategoryIdAndInuse: async (dataItem: any) => {
    const sql = await BoiProjectSQL.getByLikeProductMainNameAndProductCategoryIdAndInuse(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  // create: async dataItem => {
  //   const sql = await BoiProjectSQL.create(dataItem)
  //   const resultData = await MySQLExecute.execute(sql)
  //   return resultData
  // },

  getBoiProjectGroupNameByLike: async (dataItem: any) => {
    const sql = await BoiProjectSQL.getBoiProjectGroupNameByLike(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },

  create: async (dataItem: any) => {
    const sql = await BoiProjectSQL.getBoiProjectByBoiProjectForCheck(dataItem)
    const resultBoiProjectName = (await MySQLExecute.search(sql)) as RowDataPacket[]

    if (resultBoiProjectName.length === 0) {
      const sqlProjectCode = await BoiProjectSQL.getBoiProjectCode(dataItem)
      const resultBoiProjectCode = (await MySQLExecute.search(sqlProjectCode)) as RowDataPacket[]

      if (resultBoiProjectCode.length === 0) {
        const sqlProductGroup = await BoiProjectSQL.getBoiProjectGroupName(dataItem)
        const resultBoiProductGroupName = (await MySQLExecute.search(sqlProductGroup)) as RowDataPacket[]

        if (resultBoiProductGroupName.length === 0) {
          const query = await BoiProjectSQL.create(dataItem)
          const resultDataForInsert = (await MySQLExecute.execute(query)) as RowDataPacket[]

          return {
            Status: true,
            Message: 'บันทึกข้อมูลเรียบร้อยแล้ว Data has been saved successfully',
            ResultOnDb: resultDataForInsert,
            MethodOnDb: 'Insert BOI Project',
            TotalCountOnDb: 0,
          }
        } else {
          return {
            Status: false,
            Message: 'BOI Product Group Name already exists',
            ResultOnDb: [],
            MethodOnDb: 'Insert BOI Project',
            TotalCountOnDb: 0,
          }
        }
      } else {
        return {
          Status: false,
          Message: 'BOI Project Code already exists',
          ResultOnDb: [],
          MethodOnDb: 'Insert BOI Project',
          TotalCountOnDb: 0,
        }
      }
    } else {
      return {
        Status: false,
        Message: 'BOI Project Name have already',
        ResultOnDb: [],
        MethodOnDb: 'Insert BOI Project Name',
        TotalCountOnDb: '',
      }
    }
  },
  update: async (dataItem: any) => {
    const sql = await BoiProjectSQL.getBoiProjectByBoiProjectForCheck(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    if (resultData.length === 0 || (resultData.length !== 0 && resultData[0].BOI_PROJECT_ID === dataItem.BOI_PROJECT_ID)) {
      const sqlBoiProjectCode = await BoiProjectSQL.getBoiProjectCode(dataItem)
      const resultDataProjectCode = (await MySQLExecute.search(sqlBoiProjectCode)) as RowDataPacket[]

      if (resultDataProjectCode.length === 0 || (resultDataProjectCode.length !== 0 && resultDataProjectCode[0].BOI_PROJECT_ID === dataItem.BOI_PROJECT_ID)) {
        const sqlBoiProductGroupName = await BoiProjectSQL.getBoiProjectGroupName(dataItem)
        const resultDataProductGroup = (await MySQLExecute.search(sqlBoiProductGroupName)) as RowDataPacket[]

        if (resultDataProductGroup.length === 0 || (resultDataProductGroup.length !== 0 && resultDataProductGroup[0].BOI_PROJECT_ID === dataItem.BOI_PROJECT_ID)) {
          const updateSql = await BoiProjectSQL.update(dataItem)
          const updateResult = (await MySQLExecute.execute(updateSql)) as RowDataPacket[]

          return {
            Status: true,
            Message: 'Update BOI Project successful',
            ResultOnDb: updateResult,
            MethodOnDb: 'Update BOI Project',
            TotalCountOnDb: updateResult?.length ?? 0,
          }
        } else {
          return {
            Status: false,
            Message: 'BOI Product Group Name already exists',
            ResultOnDb: [],
            MethodOnDb: 'Update BOI Product Group Name',
            TotalCountOnDb: 0,
          }
        }
      } else {
        return {
          Status: false,
          Message: 'BOI Project Code already exists',
          ResultOnDb: [],
          MethodOnDb: 'Update BOI Project Code',
          TotalCountOnDb: 0,
        }
      }
    } else {
      return {
        Status: false,
        Message: 'BOI Project Name already exists',
        ResultOnDb: [],
        MethodOnDb: 'Update BOI Project Name',
        TotalCountOnDb: 0,
      }
    }
  },
  delete: async (dataItem: any) => {
    const sql = await BoiProjectSQL.delete(dataItem)
    const resultData = await MySQLExecute.execute(sql)
    return resultData
  },
}
