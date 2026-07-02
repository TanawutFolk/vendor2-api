import { MySQLExecute } from '@businessData/dbExecute'
import { BoiNameForMaterialConsumableSQL } from '@src/_workspace/sql/boi/BoiNameForMaterialConsumableSQL'
import { RowDataPacket } from 'mysql2'

export const BoiNameForMaterialConsumableService = {
  search: async (dataItem: any) => {
    const sql = await BoiNameForMaterialConsumableSQL.search(dataItem)
    const resultData = await MySQLExecute.searchList(sql)
    return resultData
  },
  SearchWorkFlowStepDescriptionMainNameForFetch: async (dataItem: any) => {
    const sql = await BoiNameForMaterialConsumableSQL.SearchWorkFlowStepDescriptionMainNameForFetch(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  SearchWorkFlowStepBoiGroupNoForFetch: async (dataItem: any) => {
    const sql = await BoiNameForMaterialConsumableSQL.SearchWorkFlowStepBoiGroupNoForFetch(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getByLikeBoiGroupNoAndInuse: async (dataItem: any) => {
    const sql = await BoiNameForMaterialConsumableSQL.getByLikeBoiGroupNoAndInuse(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getByLikeBoiSymbolAndInuse: async (dataItem: any) => {
    const sql = await BoiNameForMaterialConsumableSQL.getByLikeBoiSymbolAndInuse(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },

  // create: async dataItem => {
  //   const sql = await BoiNameForMaterialConsumableSQL.create(dataItem)
  //   const resultData = await MySQLExecute.execute(sql)
  //   return resultData
  // },
  update: async (dataItem: any) => {
    // const sql = await BoiNameForMaterialConsumableSQL.update(dataItem)
    // const resultData = await MySQLExecute.execute(sql)
    // return resultData
    if (dataItem.isEditDescriptionMain || dataItem.isEditBoiUnit === 1) {
      let sqlList = []
      let resultData

      let query = await BoiNameForMaterialConsumableSQL.getBoiNameForMaterial(dataItem)
      let resultQuery = (await MySQLExecute.search(query)) as RowDataPacket[]
      for (let index = 0; index < resultQuery.length; index++) {
        const element = resultQuery[index]
        sqlList.push(await BoiNameForMaterialConsumableSQL.updateBOIDescriptionMainName(element, dataItem))
      }
      // sqlList.push(await BoiNameForMaterialConsumableSQL.DeleteBoiNameForMaterial(dataItem))
      // sqlList.push(await BoiNameForMaterialConsumableSQL.insertBoiDescriptionMainNameByBoiNameForMaterial(dataItem))
      resultData = await MySQLExecute.executeList(sqlList)
      return {
        Status: true,
        Message: 'อัปเดตข้อมูลเรียบร้อยแล้ว Data has been updated successfully',
        ResultOnDb: resultData,
        MethodOnDb: 'Update BOI Description Main Name',
        TotalCountOnDb: '',
      }
    } else if (dataItem.isEditDescriptionSub === 1) {
      let result = await BoiNameForMaterialConsumableSQL.getDescriptionMainAndDescriptionSubForCheck(dataItem)
      let resultData = (await MySQLExecute.search(result)) as RowDataPacket[]
      //console.log('search results', resultData)
      //console.log('count search results', resultData.length)

      const CheckDuplicateSubName = resultData.find((data) => data.BOI_DESCRIPTION_SUB_NAME === dataItem.BOI_DESCRIPTION_SUB_NAME)
      if (CheckDuplicateSubName) {
        return {
          Status: false,
          Message: 'BOI Description Sub Name have already',
          ResultOnDb: [],
          MethodOnDb: 'Nothing change',
          TotalCountOnDb: '',
        }
      } else {
        let sqlList = []
        let resultData
        sqlList.push(await BoiNameForMaterialConsumableSQL.updateBOIDescriptionSubName(dataItem))
        // sqlList.push(await BoiNameForMaterialConsumableSQL.DeleteBoiDescriptionSub(dataItem))
        // sqlList.push(await BoiNameForMaterialConsumableSQL.insertBoiDescriptionSubNameByBoiNameForMaterial(dataItem))
        resultData = await MySQLExecute.executeList(sqlList)
        return {
          Status: true,
          Message: 'อัปเดตข้อมูลเรียบร้อยแล้ว Data has been updated successfully',
          ResultOnDb: resultData,
          MethodOnDb: 'Update BOI Description Sub Name',
          TotalCountOnDb: 0,
        }
      }
    } else {
      return {
        Status: false,
        Message: 'BOI Description Main Name not change',
        ResultOnDb: [],
        MethodOnDb: 'Nothing change',
        TotalCountOnDb: 0,
      }
    }
  },
  delete: async (dataItem: any) => {
    const sql = await BoiNameForMaterialConsumableSQL.delete(dataItem)
    const resultData = await MySQLExecute.execute(sql)
    return resultData
  },

  create: async (dataItem: any) => {
    const sql = await BoiNameForMaterialConsumableSQL.getByBoiProjectIdAndBoiGroupNoAndInuse(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    if (resultData.length === 0) {
      const query = await BoiNameForMaterialConsumableSQL.create(dataItem)
      const resultDataForInsert = (await MySQLExecute.execute(query)) as RowDataPacket[]
      return {
        Status: true,
        Message: 'บันทึกข้อมูลเรียบร้อยแล้ว Data has been saved successfully',
        ResultOnDb: resultDataForInsert,
        MethodOnDb: 'Insert BoiGroupNo',
        TotalCountOnDb: 0,
      }
    } else {
      const boiDescriptionMainNameData = resultData.find((data) => data.BOI_DESCRIPTION_MAIN_NAME === dataItem.BOI_DESCRIPTION_MAIN_NAME)

      if (boiDescriptionMainNameData) {
        const boiUnit = resultData.find((data) => data.BOI_DESCRIPTION_MAIN_NAME === dataItem.BOI_DESCRIPTION_MAIN_NAME && data.BOI_UNIT_ID === dataItem.BOI_UNIT_ID)
        if (boiUnit) {
          const boiDescriptionSubNameData = resultData.find(
            (data) =>
              data.BOI_DESCRIPTION_MAIN_NAME === dataItem.BOI_DESCRIPTION_MAIN_NAME &&
              data.BOI_UNIT_ID === dataItem.BOI_UNIT_ID &&
              data.BOI_DESCRIPTION_SUB_NAME === dataItem.BOI_DESCRIPTION_SUB_NAME
            //   &&
            // (data.BOI_DESCRIPTION_SUB_NAME = "") ===
            //   (dataItem.BOI_DESCRIPTION_SUB_NAME = "")
          )

          if (boiDescriptionSubNameData) {
            return {
              Status: false,
              Message: 'BOI Description Sub Name have already',
              ResultOnDb: [],
              MethodOnDb: 'Insert BoiGroupNo',
              TotalCountOnDb: '',
            }
          } else {
            const query = await BoiNameForMaterialConsumableSQL.create(dataItem)
            const resultDataForInsert = (await MySQLExecute.execute(query)) as RowDataPacket[]
            return {
              Status: true,
              Message: 'บันทึกข้อมูลเรียบร้อยแล้ว Data has been saved successfully',
              ResultOnDb: resultDataForInsert,
              MethodOnDb: 'Insert BoiGroupNo',
              TotalCountOnDb: 0,
            }
          }
        } else {
          return {
            Status: false,
            Message: "BOI Unit doesn't match",
            ResultOnDb: [],
            MethodOnDb: 'Insert BoiGroupNo',
            TotalCountOnDb: 0,
          }
        }
      } else {
        return {
          Status: false,
          Message: "BOI Description Main Name doesn't match",
          ResultOnDb: [],
          MethodOnDb: 'Insert BoiGroupNo',
          TotalCountOnDb: 0,
        }
      }
    }
  },
}
