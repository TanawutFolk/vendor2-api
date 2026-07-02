import { MySQLExecute } from '@businessData/dbExecute'
import { AccountDepartmentCodeSQL } from '@sql/account/AccountDepartmentCodeSQL'
import { saveDataSuccess } from '@src/utils/MessageReturn'
import { RowDataPacket } from 'mysql2'

export const AccountDepartmentCodeService = {
  search: async (dataItem: any) => {
    const sql = await AccountDepartmentCodeSQL.search(dataItem)
    const resultData = (await MySQLExecute.searchList(sql)) as RowDataPacket[]
    return resultData
  },
  getByLikeAccountDepartmentCodeAndInuse: async (dataItem: any) => {
    const sql = await AccountDepartmentCodeSQL.getByLikeAccountDepartmentCodeAndInuse(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getAccountDepartmentCodeByLikeAccountDepartmentCodeAndInuse: async (dataItem: any) => {
    const sql = await AccountDepartmentCodeSQL.getAccountDepartmentCodeByLikeAccountDepartmentCodeAndInuse(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  create: async (dataItem: any) => {
    const existingAccountDepartmentName_condition = await AccountDepartmentCodeSQL.getByAccountDepartmentName_condition(dataItem)
    const checkDuplicateResultData = (await MySQLExecute.search(existingAccountDepartmentName_condition)) as RowDataPacket[]
    if (checkDuplicateResultData?.length === 0) {
      const existingAccountDepartmentCode_condition = await AccountDepartmentCodeSQL.getByAccountDepartmentCode_condition(dataItem)
      const checkDuplicateResultData = (await MySQLExecute.search(existingAccountDepartmentCode_condition)) as RowDataPacket[]
      if (checkDuplicateResultData?.length === 0) {
        const sql = await AccountDepartmentCodeSQL.create(dataItem)
        const resultData = (await MySQLExecute.execute(sql)) as RowDataPacket[]
        return {
          Status: true,
          Message: saveDataSuccess,
          ResultOnDb: resultData,
          MethodOnDb: 'Add Account Department Code Success',
          TotalCountOnDb: resultData?.length ?? 0,
        }
      } else {
        return {
          Status: false,
          Message: 'Duplicate Account Department Code',
          ResultOnDb: [],
          MethodOnDb: 'Duplicate Account Department Code',
          TotalCountOnDb: 0,
        }
      }
    } else {
      return {
        Status: false,
        Message: 'Duplicate Account Department Name',
        ResultOnDb: [],
        MethodOnDb: 'Duplicate Account Department Name',
        TotalCountOnDb: 0,
      }
    }
  },

  update: async (dataItem: any) => {
    const existingAccountDepartmentNameCondition = await AccountDepartmentCodeSQL.getByAccountDepartmentName_condition(dataItem)
    const nameCheckResult = (await MySQLExecute.search(existingAccountDepartmentNameCondition)) as RowDataPacket[]

    if (nameCheckResult?.length === 0 || nameCheckResult[0].ACCOUNT_DEPARTMENT_CODE_ID === dataItem.ACCOUNT_DEPARTMENT_CODE_ID) {
      const existingAccountDepartmentCodeCondition = await AccountDepartmentCodeSQL.getByAccountDepartmentCode_condition(dataItem)
      const codeCheckResult = (await MySQLExecute.search(existingAccountDepartmentCodeCondition)) as RowDataPacket[]

      if (
        codeCheckResult?.length === 0 ||
        (codeCheckResult?.length !== 0 &&
          codeCheckResult[0].ACCOUNT_DEPARTMENT_CODE == dataItem.ACCOUNT_DEPARTMENT_CODE &&
          codeCheckResult[0].ACCOUNT_DEPARTMENT_CODE_ID == dataItem.ACCOUNT_DEPARTMENT_CODE_ID)
      ) {
        const sql = await AccountDepartmentCodeSQL.update(dataItem)
        const resultData = (await MySQLExecute.execute(sql)) as RowDataPacket[]
        return {
          Status: true,
          Message: 'Update successful',
          ResultOnDb: resultData,
          TotalCountOnDb: resultData?.length ?? 0,
        }
      } else {
        return {
          Status: false,
          Message: 'Duplicate Account Department Code',
          ResultOnDb: [],
          TotalCountOnDb: 0,
        }
      }
    } else {
      return {
        Status: false,
        Message: 'Duplicate Account Department Name',
        ResultOnDb: [],
        TotalCountOnDb: 0,
      }
    }
  },
  delete: async (dataItem: any) => {
    const sql = await AccountDepartmentCodeSQL.delete(dataItem)
    const resultData = await MySQLExecute.execute(sql)
    return resultData
  },
}
