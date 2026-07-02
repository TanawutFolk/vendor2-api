import { ResponseI } from '@src/types/ResponseI'
import { MultipleSctDataResponse } from './type'
import { MySQLExecute } from '@src/businessData/dbExecute'
import { SctDetailForAdjustSQL } from '@src/_workspace/sql/sct/sct-for-product/SctDetailForAdjustSQL'
import { v4 as uuidv4 } from 'uuid'
import { SctMasterDataHistorySQL } from '@src/_workspace/sql/sct/sct-for-product/SctMasterDataHistorySQL'
import { SctBomFlowProcessItemUsagePriceSQL } from '@src/_workspace/sql/sct/sct-for-product/SctBomFlowProcessItemUsagePriceSQL'
import { SctSQL } from '@src/_workspace/sql/sct/sct-for-product/SctSQL'
import { SctCreateFromHistorySQL } from '@src/_workspace/sql/sct/sct-for-product/SctCreateFromHistorySQL'
import { SctFlowProcessProcessingCostByEngineerSQL } from '@src/_workspace/sql/sct/sct-for-product/SctFlowProcessProcessingCostByEngineerSQL'
import { SctFlowProcessProcessingCostByMfgSQL } from '@src/_workspace/sql/sct/sct-for-product/SctFlowProcessProcessingCostByMfgSQL'
import { SctComponentTypeResourceOptionSelectSQL } from '@src/_workspace/sql/sct/sct-for-product/SctComponentTypeResourceOptionSelectSQL'
import { SctCompareSQL } from '@src/_workspace/sql/sct/sct-for-product/SctCompareSQL'
import { SctFSQL } from '@src/_workspace/sql/sct/sct-for-product/sct-f/SctFSQL'
import { SctSctFSQL } from '@src/_workspace/sql/sct/sct-for-product/SctSctFSQL'
import { SctFProgressWorkingSQL } from '@src/_workspace/sql/sct/sct-for-product/sct-f/SctFProgressWorkingSQL'
import { SctFReasonHistorySQL } from '@src/_workspace/sql/sct/sct-for-product/sct-f/SctFReasonHistorySQL'
import { SctFTagHistorySQL } from '@src/_workspace/sql/sct/sct-for-product/sct-f/SctFTagHistorySQL'
import { SctFMSQL } from '@src/_workspace/sql/sct/sct-for-product/sct-f/sct-m/SctFMSQL'
import { SctFMProductTypeSQL } from '@src/_workspace/sql/sct/sct-for-product/sct-f/sct-m/SctFMProductTypeSQL'
import { SctFMComponentTypeResourceOptionSelect } from '@src/_workspace/sql/sct/sct-for-product/sct-f/sct-m/SctFMComponentTypeResourceOptionSelect'
import { SctBomFlowProcessItemUsagePriceAdjustSQL } from '@src/_workspace/sql/sct/sct-for-product/SctBomFlowProcessItemUsagePriceAdjustSQL'
import { SctFlowProcessSequenceSQL } from '@src/_workspace/sql/sct/sct-for-product/SctFlowProcessSequenceSQL'
import { SctProgressWorkingSQL } from '@src/_workspace/sql/sct/sct-for-product/SctProgressWorkingSQL'
import { SctReasonHistorySQL } from '@src/_workspace/sql/sct/sct-for-product/SctReasonHistorySQL'
import { SctTagHistorySQL } from '@src/_workspace/sql/sct/sct-for-product/SctTagHistorySQL'
import { SctProcessingCostByMfgTotalSQL } from '@src/_workspace/sql/sct/sct-for-product/SctProcessingCostByMfgTotalSQL'
import { SctProcessingCostByEngineerTotalSQL } from '@src/_workspace/sql/sct/sct-for-product/SctProcessingCostByEngineerTotalSQL'
import { SctTotalCostSQL } from '@src/_workspace/sql/sct/sct-for-product/SctTotalCostSQL'

export const SCT_MultiCreateService = {
  create: async (dataItem: MultipleSctDataResponse): Promise<ResponseI> => {
    const listSQL: string[] = []

    const SCT_F_ID = uuidv4()
    const SCT_F_M_ID = uuidv4()

    //#region SCT Form for Multiple Create
    // generate F Code
    listSQL.push(
      await SctFSQL.generateSctFCode_ForMultipleCreate({
        SCT_F_CREATE_TYPE_ALPHABET: dataItem.SCT_F_CREATE_TYPE_ALPHABET,
        FISCAL_YEAR: dataItem.FISCAL_YEAR,
        SCT_PATTERN_ID: dataItem.SCT_PATTERN_ID,
        SCT_PATTERN_NO: dataItem.SCT_PATTERN_NO,
      })
    )

    // ? New Product Type
    // ? Single Create
    // ? Multi Create
    // ? Batch Change Material
    // insert SCT F
    listSQL.push(
      await SctFSQL.insertBySctFCode_variable({
        SCT_F_ID,
        SCT_F_CREATE_TYPE_ID: dataItem.SCT_F_CREATE_TYPE_ID,
        CREATE_BY: dataItem.CREATE_BY,
        UPDATE_BY: dataItem.CREATE_BY,
      })
    )

    // insert SCT F Progress Working
    listSQL.push(
      await SctFProgressWorkingSQL.insert({
        SCT_F_ID,
        CREATE_BY: dataItem.CREATE_BY,
        UPDATE_BY: dataItem.CREATE_BY,
        INUSE: 1,
        SCT_F_PROGRESS_WORKING_ID: uuidv4(),
        SCT_F_STATUS_PROGRESS_ID: 3, // Completed
        SCT_F_STATUS_WORKING_ID: 1, // Completed
      })
    )

    // insert SCT F Reason
    listSQL.push(
      await SctFReasonHistorySQL.insert({
        SCT_F_ID,
        SCT_REASON_SETTING_ID: dataItem.SCT_REASON_SETTING_ID,
        INUSE: 1,
        SCT_F_REASON_HISTORY_ID: uuidv4(),
        CREATE_BY: dataItem.CREATE_BY,
        UPDATE_BY: dataItem.CREATE_BY,
      })
    )

    // insert SCT F Tag (optional)

    if (dataItem.SCT_TAG_SETTING_ID)
      listSQL.push(
        await SctFTagHistorySQL.insert({
          SCT_F_ID,
          SCT_TAG_SETTING_ID: dataItem.SCT_TAG_SETTING_ID,
          INUSE: 1,
          SCT_F_TAG_HISTORY_ID: uuidv4(),
          CREATE_BY: dataItem.CREATE_BY,
          UPDATE_BY: dataItem.CREATE_BY,
        })
      )
    //#endregion SCT_F for Multiple Create

    //#region SCT M
    // insert SCT M
    listSQL.push(
      await SctFMSQL.insert({
        SCT_F_ID,
        SCT_F_M_ID,
        SCT_PATTERN_ID: dataItem.SCT_PATTERN_ID,
        FISCAL_YEAR: dataItem.FISCAL_YEAR,
        ESTIMATE_PERIOD_START_DATE: dataItem.ESTIMATE_PERIOD_START_DATE,
        ESTIMATE_PERIOD_END_DATE: dataItem.ESTIMATE_PERIOD_END_DATE,
        NOTE: dataItem.NOTE,
        CREATE_BY: dataItem.CREATE_BY,
        UPDATE_BY: dataItem.CREATE_BY,
      })
    )
    //#endregion SCT M

    //#region SCT
    for (const sct of dataItem.LIST_MULTIPLE_SCT_DATA) {
      // Header
      const SCT_ID = uuidv4()

      //#region SCT
      // 1. generate SCT Revision Code
      listSQL.push(
        await SctSQL.generateSctRevisionCode({
          FISCAL_YEAR: dataItem.FISCAL_YEAR,
          SCT_PATTERN_ID: dataItem.SCT_PATTERN_ID,
          PRODUCT_MAIN_ALPHABET: sct.PRODUCT_MAIN_ALPHABET,
          PRODUCT_SPECIFICATION_TYPE_ALPHABET: sct.PRODUCT_SPECIFICATION_TYPE_ALPHABET,
          PRODUCT_TYPE_CODE: sct.PRODUCT_TYPE_CODE,
          SCT_PATTERN_NO: dataItem.SCT_PATTERN_NO,
          PRODUCT_TYPE_ID: sct.PRODUCT_TYPE_ID,
        })
      )

      // 2. SCT
      listSQL.push(
        await SctSQL.insertBySctRevisionCode_variable({
          BOM_ID: sct.BOM_ID.toString(),
          ESTIMATE_PERIOD_START_DATE: dataItem.ESTIMATE_PERIOD_START_DATE,
          ESTIMATE_PERIOD_END_DATE: dataItem.ESTIMATE_PERIOD_END_DATE,
          FISCAL_YEAR: dataItem.FISCAL_YEAR,
          PRODUCT_TYPE_ID: sct.PRODUCT_TYPE_ID,
          SCT_FORMULA_VERSION_ID: dataItem.SCT_FORMULA_VERSION_ID,
          SCT_ID,
          SCT_PATTERN_ID: dataItem.SCT_PATTERN_ID,
          CREATE_BY: dataItem.CREATE_BY,
          UPDATE_BY: dataItem.CREATE_BY,
          INUSE: 1,
          NOTE: dataItem.NOTE,
        })
      )

      // 3. SCT Progress Working
      listSQL.push(
        await SctProgressWorkingSQL.insert({
          SCT_ID,
          CREATE_BY: dataItem.CREATE_BY,
          UPDATE_BY: dataItem.CREATE_BY,
          INUSE: 1,
          SCT_PROGRESS_WORKING_ID: uuidv4(),
          SCT_STATUS_PROGRESS_ID: 2, // Preparing
          SCT_STATUS_WORKING_ID: 1, // Completed
        })
      )

      // 4. SCT Reason
      listSQL.push(
        await SctReasonHistorySQL.insert({
          SCT_ID,
          SCT_REASON_SETTING_ID: dataItem.SCT_REASON_SETTING_ID,
          INUSE: 1,
          SCT_REASON_HISTORY_ID: uuidv4(),
          CREATE_BY: dataItem.CREATE_BY,
          UPDATE_BY: dataItem.CREATE_BY,
        })
      )

      // 5. SCT Tag (Optional)
      if (dataItem.SCT_TAG_SETTING_ID) {
        // if (dataItem.SCT_TAG_SETTING_ID == 1) {
        //   // delete sct tag budget
        //   listSQL.push(
        //     await SctTagHistorySQL.deleteSctTagBudgetByProductTypeId({
        //       UPDATE_BY: dataItem.UPDATE_BY,
        //       PRODUCT_TYPE_ID: sct.PRODUCT_TYPE_ID,
        //     })
        //   )
        // }

        listSQL.push(
          await SctTagHistorySQL.insert({
            SCT_ID,
            SCT_TAG_SETTING_ID: dataItem.SCT_TAG_SETTING_ID,
            INUSE: 1,
            SCT_TAG_HISTORY_ID: uuidv4(),
            CREATE_BY: dataItem.CREATE_BY,
            UPDATE_BY: dataItem.CREATE_BY,
          })
        )
      }

      //#endregion SCT

      //#region SCT Create From
      // insert SCT Create From
      if ([3, 4, 5, 6, 7].includes(sct.SCT_CREATE_FROM_SETTING_ID)) {
        if (!sct.CREATE_FROM_SCT_ID || !sct.CREATE_FROM_SCT_FISCAL_YEAR || !sct.CREATE_FROM_SCT_PATTERN_ID || !sct.CREATE_FROM_SCT_STATUS_PROGRESS_ID) {
          throw new Error('CREATE_FROM_SCT_ID, CREATE_FROM_SCT_FISCAL_YEAR, CREATE_FROM_SCT_PATTERN_ID, CREATE_FROM_SCT_STATUS_PROGRESS_ID is require')
        }

        listSQL.push(
          await SctCreateFromHistorySQL.insert({
            CREATE_BY: dataItem.CREATE_BY,
            UPDATE_BY: dataItem.CREATE_BY,
            SCT_ID,
            SCT_CREATE_FROM_SETTING_ID: sct.SCT_CREATE_FROM_SETTING_ID,

            CREATE_FROM_SCT_ID: sct.CREATE_FROM_SCT_ID,
            CREATE_FROM_SCT_FISCAL_YEAR: sct.CREATE_FROM_SCT_FISCAL_YEAR,
            CREATE_FROM_SCT_PATTERN_ID: sct.CREATE_FROM_SCT_PATTERN_ID,
            CREATE_FROM_SCT_STATUS_PROGRESS_ID: sct.CREATE_FROM_SCT_STATUS_PROGRESS_ID,
            INUSE: 1,
          })
        )
      } else if ([1, 2].includes(sct.SCT_CREATE_FROM_SETTING_ID)) {
        listSQL.push(
          await SctCreateFromHistorySQL.insert({
            CREATE_BY: dataItem.CREATE_BY,
            UPDATE_BY: dataItem.CREATE_BY,
            SCT_ID,
            SCT_CREATE_FROM_SETTING_ID: sct.SCT_CREATE_FROM_SETTING_ID,

            CREATE_FROM_SCT_ID: '',
            CREATE_FROM_SCT_FISCAL_YEAR: '',
            CREATE_FROM_SCT_PATTERN_ID: '',
            CREATE_FROM_SCT_STATUS_PROGRESS_ID: '',
            INUSE: 1,
          })
        )
      } else {
        throw new Error('SCT_CREATE_FROM_SETTING_ID error')
      }
      //#endregion SCT Create From

      //#region SCT F M Product Type
      // insert SCT F M Product Type
      listSQL.push(
        await SctFMProductTypeSQL.insert({
          SCT_F_M_PRODUCT_TYPE_ID: uuidv4(),
          SCT_F_M_ID,
          PRODUCT_TYPE_ID: sct.PRODUCT_TYPE_ID,
          SCT_F_M_CREATE_FROM_ID: sct.SCT_CREATE_FROM_SETTING_ID,
          CREATE_BY: dataItem.CREATE_BY,
          UPDATE_BY: dataItem.CREATE_BY,
          INUSE: 1,
        })
      )
      //#endregion SCT F M Product Type

      //#region SCT SCT F
      // insert SCT SCT F
      listSQL.push(
        await SctSctFSQL.insert({
          SCT_SCT_F_ID: uuidv4(),
          SCT_ID,
          SCT_F_ID,
          CREATE_BY: dataItem.CREATE_BY,
          UPDATE_BY: dataItem.CREATE_BY,
          INUSE: 1,
        })
      )
      //#endregion SCT SCT F

      //#region SCT Component Type
      // SCT Component Type

      // ??? SCT_COMPONENT_TYPE_ID	SCT_COMPONENT_TYPE_NAME
      // 1	Direct Cost Condition
      // 2	Indirect Cost Condition
      // 3	Other Cost Condition
      // 4	Special Cost Condition
      // 5	Yield Rate & Go Straight Rate
      // 6	Clear Time
      // 7	Manufacturing Item Price
      // 8	Yield Rate Material

      // ??? SCT_STATUS_PROGRESS_ID	SCT_STATUS_PROGRESS_NAME
      // 1	Cancelled
      // 2	Preparing
      // 3	Prepared
      // 4	Completed
      // 5	Checking
      // 6	Waiting Approve
      // 7	Can use

      // ??? SCT_RESOURCE_OPTION_ID	SCT_RESOURCE_OPTION_NAME
      // 1	Master data
      // 2	Master data (select)
      // 3	SCT latest
      // 4	SCT (select)

      let SctComponentTypeResourceOptionSelect_sctCopy: {
        SCT_ID: string
        SCT_RESOURCE_OPTION_ID: number
        SCT_COMPONENT_TYPE_ID: number
        IS_FROM_SCT_COPY: number
      }[] = []

      // insert SCT Component Type resource option => from SCT copy
      if (sct.CREATE_FROM_SCT_ID && sct.CREATE_FROM_SCT_STATUS_PROGRESS_ID) {
        SctComponentTypeResourceOptionSelect_sctCopy = (await MySQLExecute.search(
          await SctComponentTypeResourceOptionSelectSQL.getBySctIdAndIsFromSctCopy({
            SCT_ID: sct.CREATE_FROM_SCT_ID,
            IS_FROM_SCT_COPY: 0,
          })
        )) as {
          SCT_ID: string
          SCT_RESOURCE_OPTION_ID: number
          SCT_COMPONENT_TYPE_ID: number
          IS_FROM_SCT_COPY: number
        }[]

        if (!SctComponentTypeResourceOptionSelect_sctCopy || SctComponentTypeResourceOptionSelect_sctCopy.length === 0) {
          throw new Error('Missing SctComponentTypeResourceOptionSelect_sctCopy')
        }

        for (const data of SctComponentTypeResourceOptionSelect_sctCopy) {
          const sctComponentTypeResourceOptionSelectionSct = uuidv4()
          listSQL.push(
            await SctComponentTypeResourceOptionSelectSQL.insert({
              SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: sctComponentTypeResourceOptionSelectionSct,
              SCT_ID,
              SCT_COMPONENT_TYPE_ID: data.SCT_COMPONENT_TYPE_ID,
              SCT_RESOURCE_OPTION_ID: data.SCT_RESOURCE_OPTION_ID,
              CREATE_BY: dataItem.CREATE_BY,
              UPDATE_BY: dataItem.CREATE_BY,
              INUSE: 1,
              IS_FROM_SCT_COPY: 1,
            })
          )
        }
      }

      for (const data of sct.listSctComponentType) {
        const sctComponentTypeResourceOptionSelectionSct = uuidv4()

        if (sct.CREATE_FROM_SCT_ID && sct.CREATE_FROM_SCT_STATUS_PROGRESS_ID) {
          // Copy from Preparing , Prepared
          if ([2, 3].includes(sct.CREATE_FROM_SCT_STATUS_PROGRESS_ID)) {
            // 1	Master data - all
            listSQL.push(
              await SctComponentTypeResourceOptionSelectSQL.insert({
                SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: sctComponentTypeResourceOptionSelectionSct,
                SCT_ID,
                SCT_COMPONENT_TYPE_ID: data.SCT_COMPONENT_TYPE_ID,
                SCT_RESOURCE_OPTION_ID: 1,
                CREATE_BY: dataItem.CREATE_BY,
                UPDATE_BY: dataItem.CREATE_BY,
                INUSE: 1,
                IS_FROM_SCT_COPY: 0,
              })
            )
          } else {
            listSQL.push(
              await SctComponentTypeResourceOptionSelectSQL.insert({
                SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: sctComponentTypeResourceOptionSelectionSct,
                SCT_ID,
                SCT_COMPONENT_TYPE_ID: data.SCT_COMPONENT_TYPE_ID,
                SCT_RESOURCE_OPTION_ID: data.SCT_RESOURCE_OPTION_ID,
                CREATE_BY: dataItem.CREATE_BY,
                UPDATE_BY: dataItem.CREATE_BY,
                INUSE: 1,
                IS_FROM_SCT_COPY: 0,
              })
            )
          }
        } else {
          // 1	Master data - all
          listSQL.push(
            await SctComponentTypeResourceOptionSelectSQL.insert({
              SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: sctComponentTypeResourceOptionSelectionSct,
              SCT_ID,
              SCT_COMPONENT_TYPE_ID: data.SCT_COMPONENT_TYPE_ID,
              SCT_RESOURCE_OPTION_ID: 1,
              CREATE_BY: dataItem.CREATE_BY,
              UPDATE_BY: dataItem.CREATE_BY,
              INUSE: 1,
              IS_FROM_SCT_COPY: 0,
            })
          )
        }

        // SCT F M Component Type Select
        listSQL.push(
          await SctFMComponentTypeResourceOptionSelect.insert({
            SCT_F_M_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: uuidv4(),
            SCT_F_M_ID,
            SCT_F_M_COMPONENT_TYPE_ID: data.SCT_COMPONENT_TYPE_ID,
            SCT_F_M_RESOURCE_OPTION_ID: data.SCT_RESOURCE_OPTION_ID,
            CREATE_BY: dataItem.CREATE_BY,
            UPDATE_BY: dataItem.CREATE_BY,
            INUSE: 1,
          })
        )

        // SCT Component Type Selection
        // if (data.SCT_ID_SELECTION && data.SCT_STATUS_PROGRESS_ID_SELECTION) {
        //   listSQL.push(
        //     await SctComponentTypeResourceOptionSelectionSct.insert({
        //       SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: sctComponentTypeResourceOptionSelectionSct,
        //       SCT_ID_SELECTION: data.SCT_ID_SELECTION,
        //       SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECTION_SCT_ID: uuidv4(),
        //       CREATE_BY: dataItem.CREATE_BY,
        //       UPDATE_BY: dataItem.CREATE_BY,
        //       SCT_STATUS_PROGRESS_ID_SELECTION: data.SCT_STATUS_PROGRESS_ID_SELECTION,
        //     })
        //   )
        // }
      }
      //#endregion SCT Component Type

      // SCT Copy From (optional)
      if (sct.CREATE_FROM_SCT_ID) {
        if (!sct.CREATE_FROM_SCT_STATUS_PROGRESS_ID) {
          throw new Error('CREATE_FROM_SCT_STATUS_PROGRESS_ID is required')
        }

        // SCT Compare Auto to No.1
        listSQL.push(
          await SctCompareSQL.insert({
            SCT_ID_FOR_COMPARE: sct.CREATE_FROM_SCT_ID,

            CREATE_BY: dataItem.CREATE_BY,
            UPDATE_BY: dataItem.CREATE_BY,
            SCT_ID,
            SCT_COMPARE_ID: uuidv4(),
            SCT_COMPARE_NO: 1,

            INUSE: 1,
            IS_DEFAULT_EXPORT_COMPARE: 1,
          })
        )
      }

      //#region Create from SCT
      // * SCT Latest Revision = 6
      // * SCT Other (Select By Yourself) = 7

      if (sct.SCT_CREATE_FROM_SETTING_ID == 6 || sct.SCT_CREATE_FROM_SETTING_ID == 7) {
        if (!sct.CREATE_FROM_SCT_ID) {
          throw new Error('CREATE_FROM_SCT_ID is required')
        }
        // 1. SCT Master Data History
        const SctMasterDataHistory_sctCopy = (await MySQLExecute.search(
          await SctMasterDataHistorySQL.getBySctIdAndIsFromSctCopy({
            SCT_ID: sct.CREATE_FROM_SCT_ID,
            IS_FROM_SCT_COPY: 0,
          })
        )) as {
          SCT_MASTER_DATA_SETTING_ID: 1 | 2 | 3 | 4 | 5 | 6
          FISCAL_YEAR: number
          VERSION_NO: number
          SCT_MASTER_DATA_SETTING_NAME:
            | 'Direct Cost Condition'
            | 'Indirect Cost Condition'
            | 'Other Cost Condition'
            | 'Special Cost Condition'
            | 'Yield Rate & Go Straight Rate'
            | 'Clear Time'
        }[]

        if (SctMasterDataHistory_sctCopy.length === 0) {
          throw new Error('SCT Master Data History not found')
        } else if (SctMasterDataHistory_sctCopy.length !== 6) {
          throw new Error('SCT Master Data History not found 6 data')
        }

        for (const data of SctMasterDataHistory_sctCopy) {
          // insert into new SCT & for SCT COPY
          for (let i = 0; i <= 1; i++) {
            const isFromSctCopy = i === 0 ? 0 : 1
            listSQL.push(
              await SctMasterDataHistorySQL.insert({
                SCT_ID,
                SCT_MASTER_DATA_SETTING_ID: data.SCT_MASTER_DATA_SETTING_ID,
                FISCAL_YEAR: data.FISCAL_YEAR,
                VERSION_NO: data.VERSION_NO,
                CREATE_BY: dataItem.CREATE_BY,
                UPDATE_BY: dataItem.CREATE_BY,
                IS_FROM_SCT_COPY: isFromSctCopy,
                INUSE: 1,
              })
            )
          }
        }

        // 2. SCT Detail For Adjust
        const sctDetailForAdjust_sctCopy = (await MySQLExecute.search(
          await SctDetailForAdjustSQL.getBySctIdAndIsFromSctCopy({
            SCT_ID: sct.CREATE_FROM_SCT_ID,
            IS_FROM_SCT_COPY: 0,
          })
        )) as {
          TOTAL_INDIRECT_COST: number | null
          CIT: number | null
          VAT: number | null
          GA: number | null
          MARGIN: number | null
          SELLING_EXPENSE: number | null
          ADJUST_PRICE: number | null
        }[]

        // ! Can be empty
        // if (sctDetailForAdjust_sctCopy.length === 0 || sctDetailForAdjust_sctCopy.length !== 1) {
        //   throw new Error('SCT Detail For Adjust not found or not found 1 data')
        // }

        // insert into new SCT & for SCT COPY
        for (let i = 0; i <= 1; i++) {
          const isFromSctCopy = i === 0 ? 0 : 1
          listSQL.push(
            await SctDetailForAdjustSQL.insert({
              SCT_DETAIL_FOR_ADJUST_ID: uuidv4(),
              SCT_ID: SCT_ID,
              TOTAL_INDIRECT_COST: sctDetailForAdjust_sctCopy?.[0]?.TOTAL_INDIRECT_COST,
              CIT: sctDetailForAdjust_sctCopy?.[0]?.CIT,
              VAT: sctDetailForAdjust_sctCopy?.[0]?.VAT,
              GA: sctDetailForAdjust_sctCopy?.[0]?.GA,
              MARGIN: sctDetailForAdjust_sctCopy?.[0]?.MARGIN,
              SELLING_EXPENSE: sctDetailForAdjust_sctCopy?.[0]?.SELLING_EXPENSE,
              ADJUST_PRICE: sctDetailForAdjust_sctCopy?.[0]?.ADJUST_PRICE,
              REMARK_FOR_ADJUST_PRICE: null,
              CREATE_BY: dataItem.CREATE_BY,
              UPDATE_BY: dataItem.CREATE_BY,
              IS_FROM_SCT_COPY: isFromSctCopy,
            })
          )
        }

        // 3. SCT Flow Process Processing Cost By Engineer
        const sctFlowProcessSequenceSQL_sctCopy = (await MySQLExecute.search(
          await SctFlowProcessSequenceSQL.getBySctIdAndIsFromSctCopy({ SCT_ID: sct.CREATE_FROM_SCT_ID, IS_FROM_SCT_COPY: 0 })
        )) as {
          SCT_FLOW_PROCESS_SEQUENCE_ID: string
          SCT_ID: string
          FLOW_PROCESS_ID: string
          SCT_PROCESS_SEQUENCE_CODE: string
          OLD_SYSTEM_PROCESS_SEQUENCE_CODE: string
          OLD_SYSTEM_COLLECTION_POINT: 0 | 1
          CREATE_BY: string
          CREATE_DATE: Date
          UPDATE_BY: string
          UPDATE_DATE: Date
          INUSE: number
          IS_FROM_SCT_COPY: 0 | 1
        }[]

        if (sctFlowProcessSequenceSQL_sctCopy.length === 0) {
          throw new Error('SCT Flow Process Sequence not found')
        }

        for (const data of sctFlowProcessSequenceSQL_sctCopy) {
          // insert into new SCT & for SCT COPY
          for (let i = 0; i <= 1; i++) {
            const isFromSctCopy = i === 0 ? 0 : 1

            listSQL.push(
              await SctFlowProcessSequenceSQL.insert({
                SCT_FLOW_PROCESS_SEQUENCE_ID: uuidv4(),
                SCT_ID,
                FLOW_PROCESS_ID: data.FLOW_PROCESS_ID,
                SCT_PROCESS_SEQUENCE_CODE: data.SCT_PROCESS_SEQUENCE_CODE,
                OLD_SYSTEM_PROCESS_SEQUENCE_CODE: data.OLD_SYSTEM_PROCESS_SEQUENCE_CODE,
                OLD_SYSTEM_COLLECTION_POINT: data.OLD_SYSTEM_COLLECTION_POINT,
                CREATE_BY: dataItem.CREATE_BY,
                UPDATE_BY: dataItem.CREATE_BY,
                IS_FROM_SCT_COPY: isFromSctCopy,
                INUSE: 1,
              })
            )
          }
        }

        // 3. SCT Flow Process Processing Cost By Engineer Total
        const sctFlowProcessProcessingCostByEngineerTotal_sctCopy = (await MySQLExecute.search(
          await SctProcessingCostByEngineerTotalSQL.getBySctIdAndIsFromSctCopy({ SCT_ID: sct.CREATE_FROM_SCT_ID, IS_FROM_SCT_COPY: 0 })
        )) as {
          SCT_FLOW_PROCESS_PROCESSING_COST_BY_ENGINEER_TOTAL_ID: string
          SCT_ID: string
          TOTAL_YIELD_RATE: number
          TOTAL_GO_STRAIGHT_RATE: number
          CREATE_BY: string
          UPDATE_BY: string
          INUSE: number
        }[]

        if (sctFlowProcessProcessingCostByEngineerTotal_sctCopy.length === 0) {
          throw new Error('SCT Flow Process Processing Cost By Engineer Total not found')
        }

        for (const dataItem of sctFlowProcessProcessingCostByEngineerTotal_sctCopy) {
          // insert into new SCT & for SCT COPY
          for (let i = 0; i <= 1; i++) {
            const isFromSctCopy = i === 0 ? 0 : 1
            listSQL.push(
              await SctProcessingCostByEngineerTotalSQL.insert({
                SCT_PROCESSING_COST_BY_ENGINEER_TOTAL_ID: uuidv4(),
                SCT_ID,
                TOTAL_GO_STRAIGHT_RATE: dataItem.TOTAL_GO_STRAIGHT_RATE,
                TOTAL_YIELD_RATE: dataItem.TOTAL_YIELD_RATE,
                CREATE_BY: dataItem.CREATE_BY,
                UPDATE_BY: dataItem.CREATE_BY,
                IS_FROM_SCT_COPY: isFromSctCopy,
                INUSE: 1,
              })
            )
          }
        }

        // 3. SCT Flow Process Processing Cost By Engineer
        const sctFlowProcessProcessingCostByEngineer_sctCopy = (await MySQLExecute.search(
          await SctFlowProcessProcessingCostByEngineerSQL.getBySctIdAndIsFromSctCopy({ SCT_ID: sct.CREATE_FROM_SCT_ID, IS_FROM_SCT_COPY: 0 })
        )) as {
          SCT_FLOW_PROCESS_PROCESSING_COST_BY_ENGINEER_ID: string
          SCT_ID: string
          FLOW_PROCESS_ID: string
          YIELD_RATE: number
          YIELD_ACCUMULATION: number
          GO_STRAIGHT_RATE: number
          NOTE: string
          CREATE_BY: string
          UPDATE_BY: string
          INUSE: number
        }[]

        if (sctFlowProcessProcessingCostByEngineer_sctCopy.length === 0) {
          throw new Error('SCT Flow Process Processing Cost By Engineer not found')
        }

        for (const dataItem of sctFlowProcessProcessingCostByEngineer_sctCopy) {
          // insert into new SCT & for SCT COPY
          for (let i = 0; i <= 1; i++) {
            const isFromSctCopy = i === 0 ? 0 : 1

            listSQL.push(
              await SctFlowProcessProcessingCostByEngineerSQL.insert({
                SCT_FLOW_PROCESS_PROCESSING_COST_BY_ENGINEER_ID: uuidv4(),
                SCT_ID: SCT_ID,
                FLOW_PROCESS_ID: dataItem.FLOW_PROCESS_ID,
                YIELD_RATE: dataItem.YIELD_RATE,
                YIELD_ACCUMULATION: dataItem.YIELD_ACCUMULATION,
                GO_STRAIGHT_RATE: dataItem.GO_STRAIGHT_RATE,
                NOTE: dataItem.NOTE,
                CREATE_BY: dataItem.CREATE_BY,
                UPDATE_BY: dataItem.CREATE_BY,
                IS_FROM_SCT_COPY: isFromSctCopy,
              })
            )
          }
        }

        // 4. SCT Processing Cost By Mfg Total
        const sctProcessingCostByMfgTotal_sctCopy = (await MySQLExecute.search(
          await SctProcessingCostByMfgTotalSQL.getBySctIdAndIsFromSctCopy({ SCT_ID: sct.CREATE_FROM_SCT_ID, IS_FROM_SCT_COPY: 0 })
        )) as {
          SCT_PROCESSING_COST_BY_MFG_TOTAL_ID: string
          SCT_ID: string
          TOTAL_CLEAR_TIME: number
          TOTAL_ESSENTIAL_TIME: number
          CREATE_BY: string
          CREATE_DATE: Date
          UPDATE_BY: string
          UPDATE_DATE: Date
          INUSE: number
          IS_FROM_SCT_COPY: 0 | 1
        }[]

        if (sctProcessingCostByMfgTotal_sctCopy.length === 0) {
          throw new Error('SCT Flow Process Processing Cost By Mfg not found')
        }

        for (const dataItem of sctProcessingCostByMfgTotal_sctCopy) {
          // insert into new SCT & for SCT COPY
          for (let i = 0; i <= 1; i++) {
            const isFromSctCopy = i === 0 ? 0 : 1
            listSQL.push(
              await SctProcessingCostByMfgTotalSQL.insert({
                SCT_PROCESSING_COST_BY_MFG_TOTAL_ID: uuidv4(),
                SCT_ID: SCT_ID,
                TOTAL_CLEAR_TIME: dataItem.TOTAL_CLEAR_TIME,
                TOTAL_ESSENTIAL_TIME: dataItem.TOTAL_ESSENTIAL_TIME,
                CREATE_BY: dataItem.CREATE_BY,
                UPDATE_BY: dataItem.CREATE_BY,
                IS_FROM_SCT_COPY: isFromSctCopy,
                INUSE: 1,
              })
            )
          }
        }

        // 4. SCT Flow Process Processing Cost By Mfg
        const sctFlowProcessProcessingCostByMfg_sctCopy = (await MySQLExecute.search(
          await SctFlowProcessProcessingCostByMfgSQL.getBySctIdAndIsFromSctCopy({ SCT_ID: sct.CREATE_FROM_SCT_ID, IS_FROM_SCT_COPY: 0 })
        )) as {
          SCT_FLOW_PROCESS_PROCESSING_COST_BY_MFG_ID: string
          SCT_ID: string
          FLOW_PROCESS_ID: string
          CLEAR_TIME: number
          ESSENTIAL_TIME: number
          PROCESS_STANDARD_TIME: number
          NOTE: string
          CREATE_BY: string
          UPDATE_BY: string
        }[]

        if (sctFlowProcessProcessingCostByMfg_sctCopy.length === 0) {
          throw new Error('SCT Flow Process Processing Cost By Mfg not found')
        }

        for (const dataItem of sctFlowProcessProcessingCostByMfg_sctCopy) {
          // insert into new SCT & for SCT COPY
          for (let i = 0; i <= 1; i++) {
            const isFromSctCopy = i === 0 ? 0 : 1
            listSQL.push(
              await SctFlowProcessProcessingCostByMfgSQL.insert({
                SCT_FLOW_PROCESS_PROCESSING_COST_BY_MFG_ID: uuidv4(),
                SCT_ID,
                FLOW_PROCESS_ID: dataItem.FLOW_PROCESS_ID,
                CLEAR_TIME: dataItem.CLEAR_TIME,
                ESSENTIAL_TIME: dataItem.ESSENTIAL_TIME,
                PROCESS_STANDARD_TIME: dataItem.PROCESS_STANDARD_TIME,
                NOTE: dataItem.NOTE,
                CREATE_BY: dataItem.CREATE_BY,
                UPDATE_BY: dataItem.CREATE_BY,
                IS_FROM_SCT_COPY: isFromSctCopy,
              })
            )
          }
        }

        // 5. SCT BOM Flow Process Item Usage Price
        const sctBomFlowProcessItemUsagePriceSQL_sctCopy = (await MySQLExecute.search(
          await SctBomFlowProcessItemUsagePriceSQL.getBySctId({ SCT_ID: sct.CREATE_FROM_SCT_ID, IS_FROM_SCT_COPY: 0 })
        )) as {
          SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ID: string
          SCT_ID: string
          BOM_FLOW_PROCESS_ITEM_USAGE_ID: string
          ITEM_M_S_PRICE_ID: string
          PRICE: number
          YIELD_ACCUMULATION: number
          AMOUNT: number
          IS_ADJUST_YIELD_ACCUMULATION: 1 | 0
          YIELD_ACCUMULATION_DEFAULT: number
          CREATE_BY: string
          CREATE_DATE: string
          UPDATE_BY: string | null
          UPDATE_DATE: string | null
          INUSE: boolean
          IS_FROM_SCT_COPY: 1 | 0
          ADJUST_YIELD_ACCUMULATION_VERSION_NO: number | null
          SCT_ID_SELECTION: string | null
        }[]

        // ! Can be no data
        // if (sctBomFlowProcessItemUsagePriceSQL_sctCopy.length === 0) {
        //   throw new Error('SCT BOM Flow Process Item Usage Price not found')
        // }

        for (const dataItem of sctBomFlowProcessItemUsagePriceSQL_sctCopy) {
          // insert into new SCT & for SCT COPY
          for (let i = 0; i <= 1; i++) {
            const isFromSctCopy = i === 0 ? 0 : 1

            listSQL.push(
              await SctBomFlowProcessItemUsagePriceSQL.insert({
                SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ID: uuidv4(),
                SCT_ID, // from Header
                BOM_FLOW_PROCESS_ITEM_USAGE_ID: dataItem.BOM_FLOW_PROCESS_ITEM_USAGE_ID,
                ITEM_M_S_PRICE_ID: dataItem.ITEM_M_S_PRICE_ID,
                PRICE: dataItem.PRICE,
                YIELD_ACCUMULATION: dataItem.YIELD_ACCUMULATION,
                AMOUNT: dataItem.AMOUNT,
                IS_ADJUST_YIELD_ACCUMULATION: dataItem.IS_ADJUST_YIELD_ACCUMULATION,
                YIELD_ACCUMULATION_DEFAULT: dataItem.YIELD_ACCUMULATION_DEFAULT,
                CREATE_BY: dataItem.CREATE_BY,
                UPDATE_BY: dataItem.CREATE_BY,
                IS_FROM_SCT_COPY: isFromSctCopy,
                INUSE: 1,
                ADJUST_YIELD_ACCUMULATION_VERSION_NO: dataItem.ADJUST_YIELD_ACCUMULATION_VERSION_NO,
              })
            )

            // SCT_ID_SELECTION (Adjust)
            if (dataItem.SCT_ID_SELECTION) {
              listSQL.push(
                await SctBomFlowProcessItemUsagePriceAdjustSQL.insert({
                  SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST_ID: uuidv4(),
                  BOM_FLOW_PROCESS_ITEM_USAGE_ID: dataItem.BOM_FLOW_PROCESS_ITEM_USAGE_ID,
                  IS_FROM_SCT_COPY: isFromSctCopy,
                  SCT_ID, // from Header
                  SCT_ID_SELECTION: dataItem.SCT_ID_SELECTION,
                  CREATE_BY: dataItem.CREATE_BY,
                  UPDATE_BY: dataItem.CREATE_BY,
                  INUSE: 1,
                })
              )
            }
          }
        }
      }
      //#endregion Create from SCT

      // 6.SCT Total Cost
      const sctTotalCostSQL_sctCopy = (await MySQLExecute.search(await SctTotalCostSQL.getBySctId({ SCT_ID: sct.CREATE_FROM_SCT_ID, IS_FROM_SCT_COPY: 0 }))) as {
        SCT_TOTAL_COST_ID: string
        SCT_ID: string
        DIRECT_UNIT_PROCESS_COST: number
        INDIRECT_RATE_OF_DIRECT_PROCESS_COST: number
        TOTAL_PROCESSING_TIME: number
        TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE: number
        TOTAL_DIRECT_COST: number
        DIRECT_PROCESS_COST: number
        IMPORTED_FEE: number
        IMPORTED_COST: number
        TOTAL: number
        TOTAL_PRICE_OF_RAW_MATERIAL: number
        TOTAL_PRICE_OF_SUB_ASSY: number
        TOTAL_PRICE_OF_SEMI_FINISHED_GOODS: number
        TOTAL_PRICE_OF_CONSUMABLE: number
        TOTAL_PRICE_OF_PACKING: number
        TOTAL_PRICE_OF_ALL_OF_ITEMS: number
        RM_INCLUDE_IMPORTED_COST: number
        CONSUMABLE_PACKING: number
        MATERIALS_COST: number
        INDIRECT_COST_SALE_AVE: number
        SELLING_EXPENSE: number
        GA: number
        MARGIN: number
        ESTIMATE_PERIOD_START_DATE: string
        TOTAL_YIELD_RATE: number
        TOTAL_CLEAR_TIME: number
        ADJUST_PRICE: number
        REMARK_FOR_ADJUST_PRICE: string
        NOTE: string
        SELLING_EXPENSE_FOR_SELLING_PRICE: number
        GA_FOR_SELLING_PRICE: number
        MARGIN_FOR_SELLING_PRICE: number
        IS_ADJUST_IMPORTED_COST: number
        IMPORTED_COST_DEFAULT: number
        TOTAL_GO_STRAIGHT_RATE: number
        CIT_FOR_SELLING_PRICE: number
        RAW_MATERIAL_SUB_ASSY_SEMI_FINISHED_GOODS: number
        ASSEMBLY_GROUP_FOR_SUPPORT_MES: string
        VAT_FOR_SELLING_PRICE: number
        CIT: number
        VAT: number
        TOTAL_PRICE_OF_ALL_OF_ITEMS_INCLUDE_IMPORTED_COST: number
        ESTIMATE_PERIOD_END_DATE: string
        TOTAL_ESSENTIAL_TIME: number
        SELLING_PRICE_BY_FORMULA: number
        SELLING_PRICE: number
        DESCRIPTION: string
        CREATE_BY: string
        CREATE_DATE: string
        UPDATE_BY: string
        UPDATE_DATE: string
        INUSE: number
        IS_FROM_SCT_COPY: number
      }[]

      for (const dataItem of sctTotalCostSQL_sctCopy) {
        // insert into new SCT & for SCT COPY
        for (let i = 0; i <= 1; i++) {
          const isFromSctCopy = i === 0 ? 0 : 1

          listSQL.push(
            await SctTotalCostSQL.insert({
              SCT_TOTAL_COST_ID: uuidv4(),
              SCT_ID, // from Header
              DIRECT_UNIT_PROCESS_COST: dataItem.DIRECT_UNIT_PROCESS_COST,
              INDIRECT_RATE_OF_DIRECT_PROCESS_COST: dataItem.INDIRECT_RATE_OF_DIRECT_PROCESS_COST,
              TOTAL_PROCESSING_TIME: dataItem.TOTAL_PROCESSING_TIME,
              TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE: dataItem.TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE,
              TOTAL_DIRECT_COST: dataItem.TOTAL_DIRECT_COST,
              DIRECT_PROCESS_COST: dataItem.DIRECT_PROCESS_COST,
              IMPORTED_FEE: dataItem.IMPORTED_FEE,
              IMPORTED_COST: dataItem.IMPORTED_COST,
              TOTAL: dataItem.TOTAL,
              TOTAL_PRICE_OF_RAW_MATERIAL: dataItem.TOTAL_PRICE_OF_RAW_MATERIAL,
              TOTAL_PRICE_OF_SUB_ASSY: dataItem.TOTAL_PRICE_OF_SUB_ASSY,
              TOTAL_PRICE_OF_SEMI_FINISHED_GOODS: dataItem.TOTAL_PRICE_OF_SEMI_FINISHED_GOODS,
              TOTAL_PRICE_OF_CONSUMABLE: dataItem.TOTAL_PRICE_OF_CONSUMABLE,
              TOTAL_PRICE_OF_PACKING: dataItem.TOTAL_PRICE_OF_PACKING,
              TOTAL_PRICE_OF_ALL_OF_ITEMS: dataItem.TOTAL_PRICE_OF_ALL_OF_ITEMS,
              RM_INCLUDE_IMPORTED_COST: dataItem.RM_INCLUDE_IMPORTED_COST,
              CONSUMABLE_PACKING: dataItem.CONSUMABLE_PACKING,
              MATERIALS_COST: dataItem.MATERIALS_COST,
              INDIRECT_COST_SALE_AVE: dataItem.INDIRECT_COST_SALE_AVE,
              SELLING_EXPENSE: dataItem.SELLING_EXPENSE,
              GA: dataItem.GA,
              MARGIN: dataItem.MARGIN,
              ESTIMATE_PERIOD_START_DATE: dataItem.ESTIMATE_PERIOD_START_DATE,
              TOTAL_YIELD_RATE: dataItem.TOTAL_YIELD_RATE,
              TOTAL_CLEAR_TIME: dataItem.TOTAL_CLEAR_TIME,
              ADJUST_PRICE: dataItem.ADJUST_PRICE,
              REMARK_FOR_ADJUST_PRICE: dataItem.REMARK_FOR_ADJUST_PRICE,
              //NOTE: dataItem.NOTE,
              SELLING_EXPENSE_FOR_SELLING_PRICE: dataItem.SELLING_EXPENSE_FOR_SELLING_PRICE,
              GA_FOR_SELLING_PRICE: dataItem.GA_FOR_SELLING_PRICE,
              MARGIN_FOR_SELLING_PRICE: dataItem.MARGIN_FOR_SELLING_PRICE,
              IS_ADJUST_IMPORTED_COST: dataItem.IS_ADJUST_IMPORTED_COST,
              IMPORTED_COST_DEFAULT: dataItem.IMPORTED_COST_DEFAULT,
              TOTAL_GO_STRAIGHT_RATE: dataItem.TOTAL_GO_STRAIGHT_RATE,
              CIT_FOR_SELLING_PRICE: dataItem.CIT_FOR_SELLING_PRICE,
              RAW_MATERIAL_SUB_ASSY_SEMI_FINISHED_GOODS: dataItem.RAW_MATERIAL_SUB_ASSY_SEMI_FINISHED_GOODS,
              ASSEMBLY_GROUP_FOR_SUPPORT_MES: dataItem.ASSEMBLY_GROUP_FOR_SUPPORT_MES,
              VAT_FOR_SELLING_PRICE: dataItem.VAT_FOR_SELLING_PRICE,
              CIT: dataItem.CIT,
              VAT: dataItem.VAT,
              TOTAL_PRICE_OF_ALL_OF_ITEMS_INCLUDE_IMPORTED_COST: dataItem.TOTAL_PRICE_OF_ALL_OF_ITEMS_INCLUDE_IMPORTED_COST,
              ESTIMATE_PERIOD_END_DATE: dataItem.ESTIMATE_PERIOD_END_DATE,
              TOTAL_ESSENTIAL_TIME: dataItem.TOTAL_ESSENTIAL_TIME,
              SELLING_PRICE_BY_FORMULA: '',
              SELLING_PRICE: '',
              DESCRIPTION: dataItem.DESCRIPTION,
              CREATE_BY: dataItem.CREATE_BY,
              UPDATE_BY: dataItem.UPDATE_BY,
              INUSE: dataItem.INUSE,
              IS_FROM_SCT_COPY: isFromSctCopy,
            })
          )
        }
      }
    }
    //#endregion SCT

    // Insert
    await MySQLExecute.executeList(listSQL)

    return {
      Status: true,
      Message: 'บันทึกข้อมูลเรียบร้อยแล้ว Data has been saved successfully',
      ResultOnDb: [],
      MethodOnDb: 'Insert',
      TotalCountOnDb: 0,
    }
  },
}
