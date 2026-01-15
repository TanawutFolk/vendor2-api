import { SctComponentTypeResourceOptionSelect } from '@src/_workspace/sql/sct/sct-for-product/SctComponentTypeResourceOptionSelect'
import { SctDetailForAdjustSQL } from '@src/_workspace/sql/sct/sct-for-product/SctDetailForAdjustSQL'
import { SctProgressWorkingSQL } from '@src/_workspace/sql/sct/sct-for-product/SctProgressWorkingSQL'
import { SctReasonHistorySQL } from '@src/_workspace/sql/sct/sct-for-product/SctReasonHistorySQL'
import { SctSQL } from '@src/_workspace/sql/sct/sct-for-product/SctSQL'
import { SctTagHistorySQL } from '@src/_workspace/sql/sct/sct-for-product/SctTagHistorySQL'
import { MySQLExecute } from '@src/businessData/dbExecute'
import { ResponseI } from '@src/types/ResponseI'
import { v4 as uuidv4 } from 'uuid'
type DataItem = {
  LIST_PRODUCT_TYPE_CODE: string[]
  SCT_STATUS_PROGRESS_ID: number // 3 Prepared
  SCT_PATTERN_ID: number // 1 => P2 , 2 => P3
  SCT_REASON_SETTING_ID: number // 1 => Budget
  FISCAL_YEAR: number
  CREATE_BY: string
  UPDATE_BY: string
  change_to_SCT_STATUS_PROGRESS_ID: number
  change_to_SCT_STATUS_WORKING_ID: number // 2 => Incomplete
}

type SctType = {
  SCT_ID: string
  PRODUCT_TYPE_ID: number
  ESTIMATE_PERIOD_START_DATE: string
  ESTIMATE_PERIOD_END_DATE: string
  BOM_ID: string
  SCT_REVISION_CODE: string
  TOTAL_INDIRECT_COST: number
  CIT: number
  VAT: number
}

export const _MultiCreate_manualService = {
  changeSctStatusProgressId: async (dataItem: DataItem): Promise<ResponseI> => {
    if (dataItem.LIST_PRODUCT_TYPE_CODE === undefined || dataItem.LIST_PRODUCT_TYPE_CODE.length === 0) {
      throw new Error('LIST_PRODUCT_TYPE_CODE is empty')
    }
    if (dataItem.SCT_STATUS_PROGRESS_ID === undefined) {
      throw new Error('SCT_STATUS_PROGRESS_ID is undefined')
    }
    if (dataItem.SCT_PATTERN_ID === undefined) {
      throw new Error('SCT_PATTERN_ID is undefined')
    }
    if (dataItem.SCT_REASON_SETTING_ID === undefined) {
      throw new Error('SCT_REASON_SETTING_ID is undefined')
    }
    if (dataItem.FISCAL_YEAR === undefined) {
      throw new Error('FISCAL_YEAR is undefined')
    }
    if (dataItem.CREATE_BY === undefined) {
      throw new Error('CREATE_BY is undefined')
    }
    if (dataItem.UPDATE_BY === undefined) {
      throw new Error('UPDATE_BY is undefined')
    }
    if (dataItem.change_to_SCT_STATUS_PROGRESS_ID === undefined) {
      throw new Error('change_to_SCT_STATUS_PROGRESS_ID is undefined')
    }

    // TODO: get SCT ID by LIST_PRODUCT_TYPE_CODE
    const listResultData: SctType[] = []
    const listResultData_missing: string[] = []

    const listNewSct: SctType[] = []

    for (let i = 0; i < dataItem.LIST_PRODUCT_TYPE_CODE.length; i++) {
      const element = dataItem.LIST_PRODUCT_TYPE_CODE[i]
      let sql = await SctProgressWorkingSQL.getBySctStatusProgressIdAndProductTypeCodeAndSctReasonSettingIdAndSctPatternId({
        FISCAL_YEAR: dataItem.FISCAL_YEAR,
        SCT_PATTERN_ID: dataItem.SCT_PATTERN_ID,
        SCT_STATUS_PROGRESS_ID: dataItem.SCT_STATUS_PROGRESS_ID,
        SCT_REASON_SETTING_ID: dataItem.SCT_REASON_SETTING_ID,
        PRODUCT_TYPE_CODE: element,
      })
      const resultData = (await MySQLExecute.search(sql)) as SctType[]

      if (resultData.length === 0 || resultData.length > 1) {
        // throw new Error('SCT ID not found or multiple SCT IDs found =>' + element + ' => ' + resultData.length)
        listResultData_missing.push('SCT ID not found or multiple SCT IDs found =>' + element + ' => ' + resultData.length)
        // console.log(sql)
      } else {
        listResultData.push(resultData[0])
      }
    }

    if (listResultData_missing.length > 0) {
      return {
        Status: false,
        Message: 'Some SCT IDs not found or multiple SCT IDs found',
        MethodOnDb: 'changeSctStatusProgressId',
        ResultOnDb: listResultData_missing,
        TotalCountOnDb: listResultData_missing.length,
      }
    }

    // TODO: change SCT_STATUS_PROGRESS_ID by SCT_ID
    const listSql: string[] = []
    for (let i = 0; i < listResultData.length; i++) {
      const element = listResultData[i]

      listSql.push(
        await SctProgressWorkingSQL.deleteBySctId({
          SCT_ID: element.SCT_ID,
          UPDATE_BY: dataItem.UPDATE_BY,
        })
      )

      listSql.push(
        await SctProgressWorkingSQL.insert({
          SCT_PROGRESS_WORKING_ID: uuidv4(),
          SCT_ID: element.SCT_ID,
          SCT_STATUS_PROGRESS_ID: dataItem.change_to_SCT_STATUS_PROGRESS_ID,
          CREATE_BY: dataItem.CREATE_BY,
          UPDATE_BY: dataItem.UPDATE_BY,
          INUSE: 1,
          SCT_STATUS_WORKING_ID: dataItem.change_to_SCT_STATUS_WORKING_ID,
        })
      )

      // ? for add new SCT

      const lastTwoDigits = element.SCT_REVISION_CODE.slice(-2)
      const newLastTwoDigits = (parseInt(lastTwoDigits, 10) + 1).toString().padStart(2, '0')
      const new_SCT_REVISION_CODE = element.SCT_REVISION_CODE.slice(0, -2) + newLastTwoDigits

      const new_SCT_ID = uuidv4()

      listNewSct.push({ ...element, SCT_ID: new_SCT_ID, SCT_REVISION_CODE: new_SCT_REVISION_CODE })
    }

    for (let i = 0; i < listNewSct.length; i++) {
      const element = listNewSct[i]

      // TODO: add sct
      listSql.push(
        await SctSQL.insert({
          SCT_ID: element.SCT_ID,
          PRODUCT_TYPE_ID: element.PRODUCT_TYPE_ID,
          ESTIMATE_PERIOD_START_DATE: element.ESTIMATE_PERIOD_START_DATE,
          ESTIMATE_PERIOD_END_DATE: element.ESTIMATE_PERIOD_END_DATE,
          BOM_ID: element.BOM_ID,
          SCT_REVISION_CODE: element.SCT_REVISION_CODE,
          CREATE_BY: dataItem.CREATE_BY,
          UPDATE_BY: dataItem.UPDATE_BY,
          INUSE: 1,
          FISCAL_YEAR: dataItem.FISCAL_YEAR,
          SCT_PATTERN_ID: dataItem.SCT_PATTERN_ID,
          NOTE: 'Auto Create SCT',
          SCT_FORMULA_VERSION_ID: 3,
          DESCRIPTION: 'Selling Price Adjustment 2025 by Ausada',
        })
      )

      // TODO: add sct_reason_history
      listSql.push(
        await SctReasonHistorySQL.insert({
          SCT_REASON_HISTORY_ID: uuidv4(),
          SCT_ID: element.SCT_ID,
          SCT_REASON_SETTING_ID: 1,
          CREATE_BY: dataItem.CREATE_BY,
          UPDATE_BY: dataItem.UPDATE_BY,
          INUSE: 1,
        })
      )

      // TODO: add sct_tag_history
      listSql.push(
        await SctTagHistorySQL.insert({
          SCT_TAG_HISTORY_ID: uuidv4(),
          SCT_ID: element.SCT_ID,
          SCT_TAG_SETTING_ID: 1,
          CREATE_BY: dataItem.CREATE_BY,
          UPDATE_BY: dataItem.UPDATE_BY,
          INUSE: 1,
        })
      )

      // TODO: add sct_component_type_resource_option_select
      // Cost Condition
      // Material Price
      // YR, GR
      // Time
      // YR Acc Material Price

      for (let j = 1; j <= 5; j++) {
        listSql.push(
          await SctComponentTypeResourceOptionSelect.insert({
            SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: uuidv4(),
            SCT_ID: element.SCT_ID,
            CREATE_BY: dataItem.CREATE_BY,
            UPDATE_BY: dataItem.UPDATE_BY,
            INUSE: 1,
            SCT_COMPONENT_TYPE_ID: j,
            SCT_RESOURCE_OPTION_ID: 1,
          })
        )
      }

      // TODO: add sct_detail_for_adjust
      listSql.push(
        await SctDetailForAdjustSQL.insert({
          SCT_DETAIL_FOR_ADJUST_ID: uuidv4(),
          SCT_ID: element.SCT_ID,
          TOTAL_INDIRECT_COST: element.TOTAL_INDIRECT_COST,
          CIT: element.CIT,
          VAT: element.VAT,
          CREATE_BY: dataItem.CREATE_BY,
          UPDATE_BY: dataItem.UPDATE_BY,
          // !!! Ausada please change this
          ADJUST_PRICE: 0,
          GA: 0,
          MARGIN: 0,
          SELLING_EXPENSE: 0,
          IS_FROM_SCT_COPY: 0,
          REMARK_FOR_ADJUST_PRICE: 'Auto Create SCT',
        })
      )

      // TODO: add sct_progress_working
      listSql.push(
        await SctProgressWorkingSQL.insert({
          SCT_PROGRESS_WORKING_ID: uuidv4(),
          SCT_ID: element.SCT_ID,
          SCT_STATUS_PROGRESS_ID: 2, // Preparing
          CREATE_BY: dataItem.CREATE_BY,
          UPDATE_BY: dataItem.UPDATE_BY,
          INUSE: 1,
          SCT_STATUS_WORKING_ID: 2, // Incomplete
        })
      )
    }

    //console.log('listSql =>', listSql.join('\n'))

    await MySQLExecute.executeList(listSql)

    return { Status: true, Message: 'Success', MethodOnDb: 'changeSctStatusProgressId', ResultOnDb: listResultData, TotalCountOnDb: listResultData.length }
  },
}
