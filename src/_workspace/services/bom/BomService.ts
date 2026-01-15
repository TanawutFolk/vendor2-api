import { MySQLExecute } from '@businessData/dbExecute'
import { BomHistorySQL } from '@src/_workspace/sql/bom-history/BomHistorySQL'
import { BomProductTypeSQL } from '@src/_workspace/sql/bom/bom-product-type/BomProductTypeSQL'
import { BomSQL } from '@src/_workspace/sql/bom/BomSQL'
import { BomFlowProcessItemUsageSQL } from '@src/_workspace/sql/bomFlowProcessItemUsage/BomFlowProcessItemUsageSQL'
import { FlowProcessSQL } from '@src/_workspace/sql/flow-process/FlowProcessSQL'
import { FlowProductTypeSQL } from '@src/_workspace/sql/flow-product-type/FlowProductTypeSQL'
import { FlowSQL } from '@src/_workspace/sql/flow/FlowSQL'
import { RowDataPacket } from 'mysql2'

export const BomService = {
  getByBomNameAndProductMainIdAndInuse: async (dataItem: any) => {
    const sql = await BomSQL.getByBomNameAndProductMainIdAndInuse(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  getByBomCodeAndProductMainIdAndInuse: async (dataItem: any) => {
    const sql = await BomSQL.getByBomCodeAndProductMainIdAndInuse(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },

  getByLikeBomNameAndInuse: async (dataItem: any) => {
    const sql = await BomSQL.getByLikeBomNameAndInuse(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getByLikeBomCodeAndProductMainIdAndInuse: async (dataItem: any) => {
    const sql = await BomSQL.getByLikeBomCodeAndProductMainIdAndInuse(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  search: async (dataItem: any) => {
    let resultData = []
    let query
    let sqlWhere = ''
    let sqlJoin = ''
    let sqlSelect = ''

    // if (dataItem['NEED_JOIN_PRODUCT_TYPE'] === 'true') {
    //   sqlSelect += ', tb_7.PRODUCT_TYPE_CODE, tb_7.PRODUCT_TYPE_NAME'

    //   sqlJoin += ' LEFT JOIN PRODUCT_TYPE_BOM tb_6 ON tb_1.BOM_ID = tb_6.BOM_ID AND tb_6.INUSE = 1 LEFT JOIN PRODUCT_TYPE tb_7 ON tb_6.PRODUCT_TYPE_ID = tb_7.PRODUCT_TYPE_ID'
    // }

    if (dataItem['PRODUCTION_PURPOSE_ID'] != '') {
      sqlWhere += " AND tb_2.PRODUCTION_PURPOSE_ID = 'dataItem.PRODUCTION_PURPOSE_ID'"
    }
    // if (dataItem['FLOW_ID'] != '') {
    //   sqlWhere += " AND tb_3.FLOW_ID = 'dataItem.FLOW_ID'"
    // }
    // console.log(dataItem['INUSE'])

    if (dataItem['INUSE'] != '' && dataItem['INUSE'] != '4') {
      sqlWhere += ` AND ((IF (tb_1.INUSE = 0 ,0 ,IF(
        EXISTS
                (
                    SELECT
                        tbs_1.BOM_ID
                    FROM
                        SCT_BOM tbs_1
                                INNER JOIN
                        SCT tbs_2 ON tbs_1.SCT_ID = tbs_2.SCT_ID
                        AND tbs_2.INUSE = 1 AND tbs_1.INUSE = 1
                        AND tbs_1.BOM_ID = tb_1.BOM_ID) = TRUE
                , 2
                ,   IF(
                            EXISTS
                            (
                                    SELECT
                                        BOM_ID
                                    FROM
                                        SCT_BOM
                                    WHERE
                                        BOM_ID = tb_1.BOM_ID
                            ) = TRUE
                , 3
                , 1
                ))) ) = 'dataItem.INUSE')
           AND (
                            IF(
                                EXISTS
                                        (
                                            SELECT
                                                BOM_ID
                                            FROM
                                                BOM_TEMPORARY
                                            WHERE
                                                BOM_ID = tb_1.BOM_ID
                                                AND INUSE = 1
                                        ) = FALSE
                            , 1
                            , 0
                            )
                        )
                                                `
    } else if (dataItem['INUSE'] == '4') {
      sqlWhere += `
      AND (
                            IF(
                                EXISTS
                                        (
                                            SELECT
                                                BOM_ID
                                            FROM
                                                BOM_TEMPORARY
                                            WHERE
                                                BOM_ID = tb_1.BOM_ID
                                                AND INUSE = 1
                                        ) = TRUE
                            , 1
                            , 0
                            )
                        )`
    } else {
      sqlWhere += ''
    }

    if (dataItem['InuseRawData'] && dataItem['InuseRawData'] != '') {
      sqlWhere += " AND tb_1.INUSE LIKE '%dataItem.InuseRawData%'"
    }
    if (dataItem['PRODUCT_MAIN_ID'] != '') {
      sqlWhere += " AND tb_4.PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'"
    } else if (dataItem['PRODUCT_CATEGORY_ID'] != '') {
      sqlWhere += " AND tb_5.PRODUCT_CATEGORY_ID = 'dataItem.PRODUCT_CATEGORY_ID'"
    }

    let columnFilters: any[] = []

    try {
      // แปลง JSON แค่เมื่อ string ไม่ว่าง และเป็น JSON ที่ถูกต้อง
      if (dataItem['ColumnFilters'] && typeof dataItem['ColumnFilters'] === 'string') {
        columnFilters = JSON.parse(dataItem['ColumnFilters'])
      }
    } catch (e) {
      console.error('ColumnFilters เป็น JSON ไม่ถูกต้อง:', dataItem['ColumnFilters'], e)
      // console.log(e)
    }

    if (
      Array.isArray(columnFilters) &&
      columnFilters.some((item: any) => item.column === 'INUSE') &&
      columnFilters.find((item: any) => item.column === 'INUSE')?.value.length > 0
    ) {
      let value = columnFilters.find((item: any) => item.column === 'INUSE')?.value || []

      if (value) {
        value = value.join(',')
      }

      if (value == '4') {
        dataItem = {
          ...dataItem,
          sqlWhereColumnFilter:
            dataItem.sqlWhereColumnFilter +
            ` AND tb_1.INUSE = 1
      AND (
                                IF(
                                    EXISTS
                                            (
                                                SELECT
                                                    BOM_ID
                                                FROM
                                                    BOM_TEMPORARY
                                                WHERE
                                                    BOM_ID = tb_1.BOM_ID
                                                    AND INUSE = 1
                                            ) = TRUE
                                , 1
                                , 0
                                )
                            )
          `,
        }
      } else if (value.split(',').includes('4')) {
        dataItem = {
          ...dataItem,
          sqlWhereColumnFilter:
            dataItem.sqlWhereColumnFilter +
            ` AND ((IF (tb_1.INUSE = 0 ,0 ,IF(
              EXISTS
                      (
                          SELECT
                              tbs_1.BOM_ID
                          FROM
                              SCT_BOM tbs_1
                                      INNER JOIN
                              SCT tbs_2 ON tbs_1.SCT_ID = tbs_2.SCT_ID
                              AND tbs_2.INUSE = 1 AND tbs_1.INUSE = 1
                              AND tbs_1.BOM_ID = tb_1.BOM_ID) = TRUE
                      , 2
                      ,   IF(
                                  EXISTS
                                  (
                                          SELECT
                                              BOM_ID
                                          FROM
                                              SCT_BOM
                                          WHERE
                                              BOM_ID = tb_1.BOM_ID
                                  ) = TRUE
                      , 3
                      , 1
                      ))) ) IN (${value}))
           OR (
                                                      IF(
                                                          EXISTS
                                                                  (
                                                                      SELECT
                                                                          BOM_ID
                                                                      FROM
                                                                          BOM_TEMPORARY
                                                                      WHERE
                                                                          BOM_ID = tb_1.BOM_ID
                                                                          AND INUSE = 1
                                                                  ) = TRUE
                                                      , 1
                                                      , 0
                                                      )
                                                  )

                      `,
        }
      } else if (!value.split(',').includes('4')) {
        dataItem = {
          ...dataItem,
          sqlWhereColumnFilter:
            dataItem.sqlWhereColumnFilter +
            ` AND ((IF (tb_1.INUSE = 0 ,0 ,IF(
              EXISTS
                      (
                          SELECT
                              tbs_1.BOM_ID
                          FROM
                              SCT_BOM tbs_1
                                      INNER JOIN
                              SCT tbs_2 ON tbs_1.SCT_ID = tbs_2.SCT_ID
                              AND tbs_2.INUSE = 1 AND tbs_1.INUSE = 1
                              AND tbs_1.BOM_ID = tb_1.BOM_ID) = TRUE
                      , 2
                      ,   IF(
                                  EXISTS
                                  (
                                          SELECT
                                              BOM_ID
                                          FROM
                                              SCT_BOM
                                          WHERE
                                              BOM_ID = tb_1.BOM_ID
                                  ) = TRUE
                      , 3
                      , 1
                      ))) ) IN (${value}))
                        AND (
                                                      IF(
                                                          EXISTS
                                                                  (
                                                                      SELECT
                                                                          BOM_ID
                                                                      FROM
                                                                          BOM_TEMPORARY
                                                                      WHERE
                                                                          BOM_ID = tb_1.BOM_ID
                                                                          AND INUSE = 1
                                                                  ) = FALSE
                                                      , 1
                                                      , 0
                                                      )
                                                  )

                      `,
        }
      }
    }
    query = await BomSQL.search(dataItem, sqlWhere, sqlJoin, sqlSelect)
    // query = await BomSQL.search(dataItem)

    resultData = (await MySQLExecute.search(query)) as RowDataPacket[]

    return resultData
  },
  searchBomDetailsByBomId: async (dataItem: any) => {
    let sql = await BomSQL.searchBomDetailsByBomId(dataItem)
    let resultData = await MySQLExecute.search(sql)
    return resultData
  },
  searchBomDetailsByBomIdAndProductTypeId: async (dataItem: any) => {
    let sql = await BomSQL.searchBomDetailsByBomIdAndProductTypeId(dataItem)
    let resultData = await MySQLExecute.search(sql)
    return resultData
  },
  create: async (dataItem: any) => {
    let sqlList = []
    let sqlListMaterialBOM = []
    let sqlListFlowProcess = []
    let resultMaterial
    let resultDuplicateFlowProcess
    let resultData
    let seen = new Set()
    let duplicateDataProcessItem = []

    Object.values(dataItem.ITEM).forEach((entry: any) => {
      const key = `${entry.PROCESS.value}-${entry.ITEM.ITEM_ID}`
      if (seen.has(key)) {
        duplicateDataProcessItem.push(key) // หรือเก็บ entry ที่ซ้ำก็ได้
      } else {
        seen.add(key)
      }
    })

    // console.log(dataItem)
    // console.log('test-----------------------------', dataItem.ITEM)

    const count = Object.keys(dataItem.ITEM).length
    // console.log('count', count)

    const result = Object.values(dataItem.ITEM).map((entry: any) => ({
      PROCESS: entry.PROCESS?.value ?? entry.ITEM?.PROCESS_ID ?? null,
      ITEM_ID: entry.ITEM?.ITEM_ID ?? null,
      USAGE_QUANTITY: Number(entry.USAGE_QUANTITY) || 0,
    }))

    // console.log('result', result)

    const dataCheckFlowProcess = dataItem['FLOW_PROCESS'].map((item: any) => `(tb_1.NO = ${item.NO} AND tb_1.PROCESS_ID = ${item.PROCESS_ID})`).join(' OR ')

    const dataCheckMaterialBOM = result
      .map((item: any) => `(tb_3.PROCESS_ID = ${item.PROCESS} AND tb_2.ITEM_ID = ${item.ITEM_ID} AND tb_2.USAGE_QUANTITY = ${item.USAGE_QUANTITY})`)
      .join(' OR ')

    sqlListFlowProcess.push(await FlowProcessSQL.getFlowProcessDuplicate(dataItem, dataCheckFlowProcess))
    resultDuplicateFlowProcess = (await MySQLExecute.executeList(sqlListFlowProcess)) as RowDataPacket[]

    sqlListMaterialBOM.push(await BomSQL.getBOMDuplicate(dataItem, dataCheckMaterialBOM, count))
    resultMaterial = (await MySQLExecute.executeList(sqlListMaterialBOM)) as RowDataPacket[]
    // console.log('resultMaterial', resultMaterial)
    // console.log('resultDuplicateFlowProcess', resultDuplicateFlowProcess)

    if (resultDuplicateFlowProcess[0].length > 0 && resultMaterial[0].length > 0) {
      // throw new Error('Flow PROCESS มีอยู่แล้ว Flow PROCESS already exists')
      return {
        Status: false,
        Message: 'BOM Material มีอยู่แล้ว',
        ResultOnDb: resultDuplicateFlowProcess[0],
        MethodOnDb: 'BOM Material มีอยู่แล้ว',
        TotalCountOnDb: 0,
      }
    }

    sqlList.push(await BomSQL.checkBomName(dataItem))
    resultData = (await MySQLExecute.executeList(sqlList)) as RowDataPacket[]

    if (resultData[0][0].TOTAL_COUNT >= 1) {
      // throw new Error('Bom name ที่ต้องการ มีอยู่แล้ว Bom name already exists')
      return {
        Status: false,
        Message: 'Bom name ที่ต้องการ มีอยู่แล้ว Bom name already exists ',
        ResultOnDb: [],
        MethodOnDb: 'Bom name ที่ต้องการ มีอยู่แล้ว Bom name already exists',
        TotalCountOnDb: 0,
      }
    }

    if (duplicateDataProcessItem.length > 0) {
      return {
        Status: false,
        Message: 'มี PROCESS และ ITEM ซ้ำกัน',
        ResultOnDb: [],
        MethodOnDb: 'Create Flow Process And Item',
        TotalCountOnDb: 0,
      }
    }

    sqlList.push(await BomSQL.createBomId())
    sqlList.push(await BomSQL.createBom(dataItem))

    if (dataItem.IS_DRAFT) {
      sqlList.push(await BomSQL.createBomTemporary(dataItem))
    }

    for (const [, item] of dataItem['ITEM_USAGE'].entries()) {
      sqlList.push(await BomFlowProcessItemUsageSQL.createBomFlowProcessItemUsage(item))
    }

    for (const [, item] of dataItem['ITEM_CATEGORY'].entries()) {
      sqlList.push(await BomFlowProcessItemUsageSQL.InsertItemCategoryByExistBomId(item))
    }

    resultData = await MySQLExecute.executeList(sqlList)

    return {
      Status: true,
      Message: 'Insert Bom Success',
      ResultOnDb: resultData,
      MethodOnDb: 'Insert Bom Success',
      TotalCountOnDb: 0,
    }
  },
  update: async (dataItem: any) => {
    let sqlList = []
    let sqlListMaterialBOM = []
    let sqlListFlowProcess = []
    let resultMaterial
    let resultDuplicateFlowProcess
    let resultData
    let seen = new Set()
    let duplicateDataProcessItem = []

    Object.values(dataItem.ITEM).forEach((entry: any) => {
      const key = `${entry.PROCESS.value}-${entry.ITEM.ITEM_ID}`
      if (seen.has(key)) {
        duplicateDataProcessItem.push(key) // หรือเก็บ entry ที่ซ้ำก็ได้
      } else {
        seen.add(key)
      }
    })

    if (dataItem['CAN_CHANGE_ONLY_NAME'] === 'CHANGE') {
      sqlList = []
      sqlList.push(await BomHistorySQL.updateBomHistory(dataItem))
      sqlList.push(await BomHistorySQL.createBomHistory(dataItem))
      sqlList.push(await BomSQL.checkBomName(dataItem))
      resultData = (await MySQLExecute.executeList(sqlList)) as RowDataPacket[]
      if (resultData[2][0].TOTAL_COUNT >= 1) {
        // throw new Error('Bom name ที่ต้องการ มีอยู่แล้ว Bom name already exists')
        return {
          Status: false,
          Message: 'BOM name ที่ต้องการ มีอยู่แล้ว Bom name already exists ',
          ResultOnDb: [],
          MethodOnDb: 'BOM name ที่ต้องการ มีอยู่แล้ว Bom name already exists',
          TotalCountOnDb: 0,
        }
      } else {
        sqlList.push(await BomSQL.UpdateBOMName(dataItem))
        resultData = await MySQLExecute.executeList(sqlList)
        return {
          Status: true,
          Message: 'Update Bom name Success',
          ResultOnDb: resultData,
          MethodOnDb: 'Update Bom name Success',
          TotalCountOnDb: 0,
        }
      }
    } else {
      // console.log(dataItem)
      // console.log('test-----------------------------', dataItem.ITEM)

      const count = Object.keys(dataItem.ITEM).length
      // console.log('count', count)

      const result = Object.values(dataItem.ITEM).map((entry: any) => ({
        PROCESS: entry.PROCESS?.value ?? entry.ITEM?.PROCESS_ID ?? null,
        ITEM_ID: entry.ITEM?.ITEM_ID ?? null,
        USAGE_QUANTITY: Number(entry.USAGE_QUANTITY) || 0,
      }))

      // console.log('result', result)

      const dataCheckFlowProcess = dataItem['FLOW_PROCESS'].map((item: any) => `(tb_1.NO = ${item.NO} AND tb_1.PROCESS_ID = ${item.PROCESS_ID})`).join(' OR ')

      const dataCheckMaterialBOM = result
        .map((item: any) => `(tb_3.PROCESS_ID = ${item.PROCESS} AND tb_2.ITEM_ID = ${item.ITEM_ID} AND tb_2.USAGE_QUANTITY = ${item.USAGE_QUANTITY})`)
        .join(' OR ')

      sqlListFlowProcess.push(await FlowProcessSQL.getFlowProcessDuplicate(dataItem, dataCheckFlowProcess))
      resultDuplicateFlowProcess = (await MySQLExecute.executeList(sqlListFlowProcess)) as RowDataPacket[]

      sqlListMaterialBOM.push(await BomSQL.getBOMDuplicate(dataItem, dataCheckMaterialBOM, count))
      resultMaterial = (await MySQLExecute.executeList(sqlListMaterialBOM)) as RowDataPacket[]
      // console.log('resultMaterial', resultMaterial)
      // console.log('resultDuplicateFlowProcess', resultDuplicateFlowProcess)

      if (resultDuplicateFlowProcess[0].length > 0 && resultMaterial[0].length > 0) {
        // throw new Error('Flow PROCESS มีอยู่แล้ว Flow PROCESS already exists')
        return {
          Status: false,
          Message: 'BOM Material มีอยู่แล้ว',
          ResultOnDb: resultDuplicateFlowProcess[0],
          MethodOnDb: 'BOM Material มีอยู่แล้ว',
          TotalCountOnDb: 0,
        }
      }

      sqlList.push(await BomSQL.checkBomName(dataItem))
      resultData = (await MySQLExecute.executeList(sqlList)) as RowDataPacket[]

      if (resultData[0][0].TOTAL_COUNT >= 1) {
        // throw new Error('Bom name ที่ต้องการ มีอยู่แล้ว Bom name already exists')
        return {
          Status: false,
          Message: 'BOM name ที่ต้องการ มีอยู่แล้ว Bom name already exists ',
          ResultOnDb: [],
          MethodOnDb: 'BOM name ที่ต้องการ มีอยู่แล้ว Bom name already exists',
          TotalCountOnDb: 0,
        }
      }

      if (duplicateDataProcessItem.length > 0) {
        return {
          Status: false,
          Message: 'มี PROCESS และ ITEM ซ้ำกัน',
          ResultOnDb: [],
          MethodOnDb: 'Create Flow Process And Item',
          TotalCountOnDb: 0,
        }
      }

      sqlList.push(await BomSQL.updateBom(dataItem))

      if (dataItem.IS_DRAFT) {
        sqlList.push(await BomSQL.upsertBomTemporary(dataItem))
      } else {
        sqlList.push(await BomSQL.deleteBomTemporary(dataItem))
      }

      sqlList.push(await BomFlowProcessItemUsageSQL.deleteBomFlowProcessItemUsage(dataItem))
      for (const [, item] of dataItem['ITEM_USAGE'].entries()) {
        sqlList.push(await BomFlowProcessItemUsageSQL.updateBomFlowProcessItemUsage(item, dataItem.BOM_ID))
      }

      sqlList.push(await BomFlowProcessItemUsageSQL.deleteItemCategoryByExistBomId(dataItem))
      for (const [, item] of dataItem['ITEM_CATEGORY'].entries()) {
        sqlList.push(await BomFlowProcessItemUsageSQL.updateItemCategoryByExistBomId(item, dataItem.BOM_ID))
      }

      resultData = await MySQLExecute.executeList(sqlList)
      return {
        Status: true,
        Message: 'Insert BOM Success',
        ResultOnDb: resultData,
        MethodOnDb: 'Insert BOM Success',
        TotalCountOnDb: 0,
      }
    }
  },
  updateBomProductType: async (dataItem: any) => {
    let sqlList = []
    let resultData

    sqlList.push(await BomSQL.updateUpdateByAndUpdateDateByBomId(dataItem))

    for (const [, item] of dataItem['PRODUCT_TYPE'].entries()) {
      if (item.PRODUCT_TYPE_ID) {
        item['CREATE_BY'] = dataItem['CREATE_BY']
        item['BOM_ID'] = dataItem['BOM_ID']
        item['FLOW_ID'] = dataItem['FLOW_ID']

        sqlList.push(await BomProductTypeSQL.deleteByProductTypeId(item))

        sqlList.push(await BomProductTypeSQL.upsertBomProductType(item))

        sqlList.push(await FlowProductTypeSQL.createFlowProductTypeByCreatedProcess(item))
      }
    }

    resultData = await MySQLExecute.executeList(sqlList)

    return resultData
  },
  createFlowFromCreateBom: async (dataItem: any) => {
    let sqlList = []

    let resultData

    const processCount: Record<number, number> = {}

    for (const item of dataItem['FLOW_PROCESS']) {
      processCount[item.PROCESS_ID] = (processCount[item.PROCESS_ID] || 0) + 1
    }

    // ตรวจสอบว่ามี PROCESS_ID ไหนที่นับได้เกิน 1 (คือมีซ้ำ)
    const hasDuplicate = Object.values(processCount).some((count) => count > 1)

    // ใช้ใน if else
    if (hasDuplicate) {
      return {
        Status: false,
        Message: 'มี PROCESS ซ้ำกัน',
        ResultOnDb: false,
        MethodOnDb: 'Create Flow Process',
        TotalCountOnDb: 0,
      }
    } else {
      sqlList.push(await FlowSQL.CreateFlowId())
      sqlList.push(await FlowSQL.createFlow(dataItem))

      resultData = (await MySQLExecute.executeList(sqlList)) as RowDataPacket[]
      if (resultData[1][0].affectedRows <= 0) {
        // throw new Error('Flow name ที่ต้องการ มีอยู่แล้ว Flow name already exists')
        return {
          Status: false,
          Message: 'Flow name ที่ต้องการ มีอยู่แล้ว Flow name already exists ',
          ResultOnDb: false,
          MethodOnDb: 'Flow name ที่ต้องการ มีอยู่แล้ว Flow name already exists',
          TotalCountOnDb: 0,
        }
      }

      sqlList = []
      // console.log(resultData[1][1][0].FLOW_ID)

      for (const [index, item] of dataItem['FLOW_PROCESS'].entries()) {
        item['NO'] = String(index + 1)
        item['CREATE_BY'] = dataItem['CREATE_BY']
        item['FLOW_ID'] = resultData[1][1][0].FLOW_ID
        sqlList.push(await FlowProcessSQL.createFlowProcess(item))
      }

      const flowId = resultData[1][1][0].FLOW_ID

      resultData = await MySQLExecute.executeList(sqlList)

      resultData = [
        ...resultData,
        {
          FLOW_ID: flowId,
        },
      ]

      // return resultData
      return {
        Status: true,
        Message: 'Insert Flow name Success',
        ResultOnDb: resultData,
        MethodOnDb: 'Insert Flow name Success',
        TotalCountOnDb: 0,
      }
    }
  },
  Delete: async (dataItem: any) => {
    let sqlList = []
    let resultData

    // sqlList.push(await BomFlowProcessItemUsageSQL.deleteBomFlowProcessItemUsage(dataItem))

    sqlList.push(await BomFlowProcessItemUsageSQL.deleteItemCategoryByExistBomId(dataItem))

    sqlList.push(await BomSQL.deleteBom(dataItem))

    resultData = await MySQLExecute.executeList(sqlList)
    return resultData
  },

  getBomDetailByBomId: async (dataItem: any) => {
    let sqlList = []
    let resultData

    for (const [, item] of dataItem['LIST_DATA'].entries()) {
      //item['NO'] = String(index + 1)
      //item['CREATE_BY'] = dataItem['CREATE_BY']
      sqlList.push(await BomSQL.getBomDetailByBomId(item))
    }

    // if (dataItem['LIST_DATA'].length > 0) {
    //   sqlWhere = 'AND tb_1.SCT_ID IN ( '
    //   for (let i = 0; i < dataItem['LIST_SCT']?.length; i++) {
    //     const element = dataItem['LIST_SCT'][i]['SCT_ID']
    //     sqlWhere += ',' + element
    //   }
    //   sqlWhere += ' ) '
    // }

    // const sql = await BomSQL.getBomDetailByBomId(dataItem)
    resultData = await MySQLExecute.searchList(sqlList)
    return resultData
  },
  getBomByLikeProductTypeIdAndCondition: async (dataItem: any) => {
    let sql = ''
    let sqlJoin = ''
    if (dataItem.CONDITION == 'BOM_ACTUAL') {
      sqlJoin = `       INNER JOIN
                  PRODUCT_TYPE_BOM tb_3
                            ON tb_3.PRODUCT_TYPE_ID = tb_1.PRODUCT_TYPE_ID
                        AND tb_3.INUSE = 1
						            INNER JOIN
                  BOM tb_4
                        ON tb_4.BOM_ID = tb_3.BOM_ID  `
      sql = await BomSQL.getBomByLikeProductTypeIdAndCondition(dataItem, sqlJoin)
    } else if (dataItem.CONDITION == 'BOM_THEN') {
      sqlJoin = `       INNER JOIN
                  PRODUCT_TYPE_BOM_THEN tb_3
                            ON tb_3.PRODUCT_TYPE_ID = tb_1.PRODUCT_TYPE_ID
                        AND tb_3.INUSE = 1
                        INNER JOIN
                  BOM tb_4
                        ON tb_4.BOM_ID = tb_3.BOM_ID  `
      sql = await BomSQL.getBomByLikeProductTypeIdAndCondition(dataItem, sqlJoin)
    } else {
      sqlJoin = `       INNER JOIN
                  PRODUCT_TYPE_BOM_THEN tb_3
                        ON tb_3.PRODUCT_TYPE_ID = tb_1.PRODUCT_TYPE_ID
                        AND tb_3.INUSE = 1
                        INNER JOIN
                  BOM tb_4
                        ON tb_4.BOM_ID = tb_3.BOM_ID  `
      sql = await BomSQL.getBomByLikeProductTypeIdAndCondition(dataItem, sqlJoin)
    }

    let resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getItemCodeForSupportMes: async (dataItem: any) => {
    let sql = await BomSQL.getItemCodeForSupportMes(dataItem)
    let resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getBOMNameByLike: async (dataItem: any) => {
    let sql = await BomSQL.getBOMNameByLike(dataItem)
    let resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getBOMCodeByLike: async (dataItem: any) => {
    let sql = await BomSQL.getBOMCodeByLike(dataItem)
    let resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getByLikeBomCodeAndInuse: async (dataItem: any) => {
    const sql = await BomSQL.getByLikeBomCodeAndInuse(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
}
