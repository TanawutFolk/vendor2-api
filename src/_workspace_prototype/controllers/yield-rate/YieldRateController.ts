import { YieldRateModel } from '@src/_workspace/models/yield-rate/YieldRateModel'
import formatNumber from '@src/_workspace/utils/formatNumber'
import { getSqlWhereByColumnFilters } from '@src/helpers/getSqlWhereByFilterColumn'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'
const xl = require('excel4node')

export const YieldRateController = {
  search: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const tableIds = [
      { table: 'tb_1', id: 'PRODUCT_CATEGORY_ID' },
      { table: 'tb_1', id: 'PRODUCT_CATEGORY_NAME' },
      { table: 'tb_2', id: 'PRODUCT_MAIN_ID' },
      { table: 'tb_2', id: 'PRODUCT_MAIN_NAME' },
      { table: 'tb_3', id: 'PRODUCT_SUB_ID' },
      { table: 'tb_3', id: 'PRODUCT_SUB_NAME' },
      { table: 'tb_4', id: 'PRODUCT_TYPE_CODE' },
      { table: 'tb_4', id: 'PRODUCT_TYPE_NAME' },
      { table: 'tb_4', id: 'PRODUCT_TYPE_CODE_FOR_SCT' },
      { table: 'tb_5', id: 'FLOW_PROCESS_NO' },
      { table: 'tb_5', id: 'SCT_REASON_SETTING_ID' },
      { table: 'tb_9', id: 'SCT_REASON_SETTING_NAME' },
      { table: 'tb_5', id: 'FISCAL_YEAR' },
      { table: 'tb_5', id: 'SCT_TAG_SETTING_ID' },
      { table: 'tb_5', id: 'NOTE' },
      { table: 'tb_5', id: 'INUSE' },
      { table: 'tb_5', id: 'COLLECTION_POINT_FOR_SCT' },
      { table: 'tb_5', id: 'UPDATE_BY' },
      { table: 'tb_5', id: 'UPDATE_DATE' },
      { table: 'tb_5', id: 'REVISION_NO' },
      { table: 'tb_7', id: 'PROCESS_NAME' },
      { table: 'tb_8', id: 'FLOW_NAME' },
      { table: 'tb_8', id: 'FLOW_CODE' },
      { table: 'tb_13', id: 'ITEM_CATEGORY_ID' },
      { table: 'tb_13', id: 'ITEM_CATEGORY_NAME' },
      { table: 'tb_11', id: 'CUSTOMER_INVOICE_TO_ID' },
      { table: 'tb_11', id: 'CUSTOMER_INVOICE_TO_NAME' },
    ]

    dataItem['Start'] = Number(dataItem['Start']) * Number(dataItem['Limit'])
    let orderBy = ''
    if (typeof dataItem.Order === 'string') {
      try {
        dataItem.Order = JSON.parse(dataItem.Order) // แปลง string → array
      } catch (error) {
        console.error('Error parsing Order:', error)
        dataItem.Order = [] // ถ้าพาร์สไม่ผ่าน ให้กำหนดเป็นอาร์เรย์ว่าง
      }
    }
    if (dataItem['Order']?.length <= 0) {
      if (dataItem['IS_MODE'] === false) {
        orderBy = 'tb_5.UPDATE_DATE DESC , tb_1.PRODUCT_CATEGORY_NAME ,tb_2.PRODUCT_MAIN_NAME , tb_3.PRODUCT_SUB_NAME , tb_4.PRODUCT_TYPE_NAME , tb_5.FLOW_PROCESS_NO ASC'
      } else {
        orderBy = 'tb_5.UPDATE_DATE DESC'
      }
    } else {
      for (let i = 0; i < dataItem['Order'].length; i++) {
        const word = dataItem['Order'][i]

        orderBy += `${tableIds.find((e) => e.id === word['id'])?.table || ''}.${word['id']} ${word['desc'] ? 'DESC' : 'ASC'},`
      }
      orderBy = orderBy.slice(0, -1)
    }
    dataItem['Order'] = orderBy

    let sqlWhereColumnFilter = ''
    if (dataItem?.ColumnFilters?.length > 0) {
      sqlWhereColumnFilter += getSqlWhereByColumnFilters(dataItem.ColumnFilters, tableIds)
    }

    dataItem['sqlWhereColumnFilter'] = sqlWhereColumnFilter

    const result = await YieldRateModel.search(dataItem)

    res.status(200).json({
      Status: true,
      ResultOnDb: result[1],
      TotalCountOnDb: result[0][0]['TOTAL_COUNT'] ?? 0,
      MethodOnDb: 'Search Yield Rate Data',
      Message: 'Search Data Success',
    } as ResponseI)
  },

  downloadFileForExportYieldRate: async (req: Request, res: Response) => {
    let query = req.body.DataForFetch

    const tableIds = [
      { table: 'tb_1', id: 'PRODUCT_CATEGORY_ID' },
      { table: 'tb_1', id: 'PRODUCT_CATEGORY_NAME' },
      { table: 'tb_2', id: 'PRODUCT_MAIN_ID' },
      { table: 'tb_2', id: 'PRODUCT_MAIN_NAME' },
      { table: 'tb_3', id: 'PRODUCT_SUB_ID' },
      { table: 'tb_3', id: 'PRODUCT_SUB_NAME' },
      { table: 'tb_4', id: 'PRODUCT_TYPE_CODE' },
      { table: 'tb_4', id: 'PRODUCT_TYPE_NAME' },
      { table: 'tb_4', id: 'PRODUCT_TYPE_CODE_FOR_SCT' },
      { table: 'tb_5', id: 'FLOW_PROCESS_NO' },
      { table: 'tb_5', id: 'SCT_REASON_SETTING_ID' },
      { table: 'tb_9', id: 'SCT_REASON_SETTING_NAME' },
      { table: 'tb_5', id: 'FISCAL_YEAR' },
      { table: 'tb_5', id: 'SCT_TAG_SETTING_ID' },
      { table: 'tb_5', id: 'NOTE' },
      { table: 'tb_5', id: 'INUSE' },
      { table: 'tb_5', id: 'COLLECTION_POINT_FOR_SCT' },
      { table: 'tb_5', id: 'UPDATE_BY' },
      { table: 'tb_5', id: 'UPDATE_DATE' },
      { table: 'tb_5', id: 'IS_CURRENT' },
      { table: 'tb_5', id: 'REVISION_NO' },
      { table: 'tb_7', id: 'PROCESS_NAME' },
      { table: 'tb_8', id: 'FLOW_NAME' },
      { table: 'tb_8', id: 'FLOW_CODE' },
      { table: 'tb_13', id: 'ITEM_CATEGORY_ID' },
      { table: 'tb_13', id: 'ITEM_CATEGORY_NAME' },
      { table: 'tb_11', id: 'CUSTOMER_INVOICE_TO_ID' },
      { table: 'tb_11', id: 'CUSTOMER_INVOICE_TO_NAME' },
    ]

    // ===== Parse Order (ถ้ามาจาก frontend เป็น string) =====
    if (typeof query.Order === 'string') {
      try {
        query.Order = JSON.parse(query.Order)
      } catch {
        query.Order = []
      }
    }

    // ===== helper build order by =====
    const buildOrderByFromSort = (querySortBy: any[]) => {
      let order = ''
      for (const word of querySortBy) {
        const table = tableIds.find((e) => e.id === word.id)?.table || ''
        order += `${table}.${word.id} ${word.desc ? 'DESC' : 'ASC'},`
      }
      return order.slice(0, -1)
    }

    // ===== default order แยก 2 แบบ =====
    const defaultOrderByProcess =
      'tb_5.UPDATE_DATE DESC , tb_1.PRODUCT_CATEGORY_NAME , tb_2.PRODUCT_MAIN_NAME , tb_3.PRODUCT_SUB_NAME , tb_4.PRODUCT_TYPE_NAME , tb_5.FLOW_PROCESS_NO ASC'

    const defaultOrderByTotal = 'tb_5.UPDATE_DATE DESC'

    // ===== สร้าง orderBy สำหรับแต่ละ query =====
    let orderByProcess = ''
    let orderByTotal = ''

    if (query.querySortBy?.length > 0) {
      const customOrder = buildOrderByFromSort(query.querySortBy)
      orderByProcess = customOrder
      orderByTotal = customOrder
    } else {
      orderByProcess = defaultOrderByProcess
      orderByTotal = defaultOrderByTotal
    }

    // ===== Column Filters =====
    let sqlWhereColumnFilter = ''
    if (query?.ColumnFilters?.length > 0) {
      sqlWhereColumnFilter = getSqlWhereByColumnFilters(query.ColumnFilters, tableIds)
    }

    // ===== clone query ออกเป็น 2 ตัว (ห้ามใช้ตัวเดียว) =====

    const queryProcess = {
      ...query,
      sqlWhereColumnFilter,
      Order: orderByProcess,
      Limit: query.queryPageSize,
      Start: query.queryPageIndex * query.queryPageSize,
    }

    const queryTotal = {
      ...query,
      sqlWhereColumnFilter,
      Order: orderByTotal,
      Limit: query.queryPageSize,
      Start: query.queryPageIndex * query.queryPageSize,
    }

    // query['sqlWhereColumnFilter'] = sqlWhereColumnFilter
    // if (req.body.TYPE === 'currentPage') {
    //   query['sqlWhereColumnFilter'] = sqlWhereColumnFilter
    //   query['Order'] = query['querySortBy']
    //   query['Limit'] = query['queryPageSize']
    //   query['Start'] = query['queryPageIndex']
    // } else {
    //   query['sqlWhereColumnFilter'] = sqlWhereColumnFilter
    //   query['Order'] = query['querySortBy']
    //   query['Limit'] = query['queryPageSize']
    //   query['Start'] = query['queryPageIndex']
    // }

    const createSheet = (wb: any, sheetName: string, data: any[], headerMap: Record<string, string>, columnFilters: string[], columnVisibility: Record<string, boolean>) => {
      const ws = wb.addWorksheet(sheetName)

      const visibleColumns = columnFilters.filter((col: any) => columnVisibility[col] !== false && col !== 'mrt-row-spacer' && col !== 'mrt-row-actions')

      if (visibleColumns.length === 0) return

      // ===== Header =====
      visibleColumns.forEach((col: any, colIndex: number) => {
        ws.cell(1, colIndex + 1)
          .string(headerMap[col] || col)
          .style(
            wb.createStyle({
              font: { name: 'Aptos', size: 11, bold: true },
              alignment: { horizontal: 'center', vertical: 'center' },
              border: {
                left: { style: 'thin' },
                right: { style: 'thin' },
                top: { style: 'thin' },
                bottom: { style: 'thin' },
              },
              fill: {
                type: 'pattern',
                patternType: 'solid',
                fgColor: '#D9D9D9',
              },
            })
          )
      })
      ws.row(1).setHeight(16)

      const maxColWidths = visibleColumns.map((col: any) => (headerMap[col] || col).length)

      // ===== Data =====
      data.forEach((row: any, rowIndex: number) => {
        visibleColumns.forEach((col: any, colIndex: number) => {
          let cellValue = row[col]

          if (col === 'INUSE') {
            cellValue = row[col] == '1' ? 'Can use' : row[col] == '2' ? 'Using' : row[col] == '3' ? 'Can use (Used)' : 'Cancel'
          }
          if (col === 'COLLECTION_POINT_FOR_SCT') {
            cellValue = row[col] == '1' ? 'O' : null
          }
          if (col === 'YIELD_RATE_FOR_SCT') {
            cellValue = formatNumber(row[col])
          }
          if (col === 'YIELD_ACCUMULATION_FOR_SCT') {
            cellValue = formatNumber(row[col])
          }
          if (col === 'GO_STRAIGHT_RATE_FOR_SCT') {
            cellValue = formatNumber(row[col])
          }
          if (col === 'TOTAL_YIELD_RATE_FOR_SCT') {
            cellValue = formatNumber(row[col])
          }
          if (col === 'TOTAL_GO_STRAIGHT_RATE_FOR_SCT') {
            cellValue = formatNumber(row[col])
          }
          if (col === 'IS_CURRENT') {
            cellValue = row[col] == 1 ? 'Yes' : 'No'
          }

          const finalValue = cellValue !== undefined && cellValue !== null ? cellValue.toString() : ''

          ws.cell(rowIndex + 2, colIndex + 1)
            .string(finalValue)
            .style(
              wb.createStyle({
                font: { name: 'Arial', size: 11 },
                alignment: { horizontal: 'left', vertical: 'center' },
              })
            )

          maxColWidths[colIndex] = Math.max(maxColWidths[colIndex], finalValue.length)
        })
      })

      // ===== Auto width =====
      maxColWidths.forEach((width: number, index: number) => {
        ws.column(index + 1).setWidth(Math.min(Math.ceil(width * 1.6), 50))
      })
    }

    // ================= main =================
    if (req.body.TYPE === 'currentPage') {
      const headerMap: Record<string, string> = {
        INUSE: 'STATUS',
        PRODUCT_CATEGORY_NAME: 'PRODUCT CATEGORY NAME',
        PRODUCT_MAIN_NAME: 'PRODUCT MAIN NAME',
        PRODUCT_SUB_NAME: 'PRODUCT SUB NAME',
        PRODUCT_TYPE_CODE_FOR_SCT: 'PRODUCT TYPE CODE',
        PRODUCT_TYPE_NAME: 'PRODUCT TYPE NAME',
        FISCAL_YEAR: 'FISCAL YEAR',
        REVISION_NO: 'VERSION',
        IS_CURRENT: 'LATEST VERSION',
        FLOW_CODE: 'FLOW CODE',
        FLOW_NAME: 'FLOW NAME',
        FLOW_PROCESS_NO: 'PROCESS NO',
        PROCESS_NAME: 'PROCESS NAME',
        ITEM_CATEGORY_NAME: 'ITEM CATEGORY NAME',
        CUSTOMER_INVOICE_TO_NAME: 'CUSTOMER INVOICE TO NAME',
        YIELD_RATE_FOR_SCT: 'YIELD RATE (%)',
        TOTAL_YIELD_RATE_FOR_SCT: 'TOTAL YIELD RATE (%)',
        YIELD_ACCUMULATION_FOR_SCT: 'YIELD ACCUMULATION RATE (%)',
        GO_STRAIGHT_RATE_FOR_SCT: 'GO STRAIGHT RATE (%)',
        TOTAL_GO_STRAIGHT_RATE_FOR_SCT: 'TOTAL GO STRAIGHT RATE (%)',
        COLLECTION_POINT_FOR_SCT: 'COLLECTION POINT',
        NOTE: 'NOTE',
        MODIFIED_DATE: 'MODIFIED_DATE',
        UPDATE_BY: 'UPDATED BY',
      }

      const result = await YieldRateModel.searchYieldRateProcess(queryProcess)
      const resultTotal = await YieldRateModel.searchYieldRateTotal(queryTotal)

      const dataItem = Object.entries(req.body).length === 0 ? req.query : req.body

      const columnFilters = dataItem.columnFilters || []

      const columnVisibilityProcess = {
        inuseForSearch: true,
        PROCESS_ID: false,
        FISCAL_YEAR: true,
        PRODUCT_CATEGORY_NAME: true,
        PRODUCT_MAIN_NAME: true,
        PRODUCT_SUB_NAME: true,
        PRODUCT_TYPE_NAME: true,
        PRODUCT_TYPE_CODE: true,
        ITEM_CATEGORY_NAME: true,
        CUSTOMER_INVOICE_TO_NAME: true,
        NO: true,
        YIELD_RATE_FOR_SCT: true,
        YIELD_ACCUMULATION_FOR_SCT: true,
        GO_STRAIGHT_RATE_FOR_SCT: true,
        TOTAL_YIELD_RATE_FOR_SCT: false,
        TOTAL_GO_STRAIGHT_RATE_FOR_SCT: false,
        PROCESS_NAME: true,
        COLLECTION_POINT_FOR_SCT: true,
        SCT_REASON_SETTING_NAME: true,
        REVISION_NO: true,
        MODIFIED_DATE: true,
        UPDATE_BY: true,
        IS_CURRENT: true,
      }

      const columnVisibilityProcessTotal = {
        inuseForSearch: true,
        PROCESS_ID: false,
        FISCAL_YEAR: true,
        PRODUCT_CATEGORY_NAME: true,
        PRODUCT_MAIN_NAME: true,
        PRODUCT_SUB_NAME: true,
        PRODUCT_TYPE_NAME: true,
        PRODUCT_TYPE_CODE: true,
        ITEM_CATEGORY_NAME: true,
        CUSTOMER_INVOICE_TO_NAME: true,
        NO: true,
        YIELD_RATE_FOR_SCT: false,
        YIELD_ACCUMULATION_FOR_SCT: false,
        GO_STRAIGHT_RATE_FOR_SCT: false,
        TOTAL_YIELD_RATE_FOR_SCT: true,
        TOTAL_GO_STRAIGHT_RATE_FOR_SCT: true,
        PROCESS_NAME: false,
        COLLECTION_POINT_FOR_SCT: false,
        SCT_REASON_SETTING_NAME: true,
        REVISION_NO: true,
        MODIFIED_DATE: true,
        UPDATE_BY: true,
        FLOW_PROCESS_NO: false,
        IS_CURRENT: true,
      }

      const wb = new xl.Workbook()

      if (req.body.DataForFetch.IS_MODE === true) {
        createSheet(wb, 'Yield Rate (Total)', (resultTotal[1] as any[]) || [], headerMap, columnFilters, columnVisibilityProcessTotal)
        createSheet(wb, 'Yield Rate (Process)', (result[1] as any[]) || [], headerMap, columnFilters, columnVisibilityProcess)
      } else {
        createSheet(wb, 'Yield Rate (Process)', (result[1] as any[]) || [], headerMap, columnFilters, columnVisibilityProcess)
        createSheet(wb, 'Yield Rate (Total)', (resultTotal[1] as any[]) || [], headerMap, columnFilters, columnVisibilityProcessTotal)
      }

      // ===== filename =====
      const now = new Date()
      const pad = (n: number) => n.toString().padStart(2, '0')
      const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
      const menuName = req.body.menuName || 'Export'
      const filename = `${menuName}_${timestamp}.xlsx`

      wb.writeToBuffer()
        .then((buffer: any) => {
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
          res.setHeader('Content-Disposition', `attachment; filename=${filename}`)
          res.send(buffer)
        })
        .catch((err: any) => {
          res.status(500).json({ error: 'Failed to generate file', err })
        })
    } else {
      const headerMap: Record<string, string> = {
        INUSE: 'STATUS',
        PRODUCT_CATEGORY_NAME: 'PRODUCT CATEGORY NAME',
        PRODUCT_MAIN_NAME: 'PRODUCT MAIN NAME',
        PRODUCT_SUB_NAME: 'PRODUCT SUB NAME',
        PRODUCT_TYPE_CODE_FOR_SCT: 'PRODUCT TYPE CODE',
        PRODUCT_TYPE_NAME: 'PRODUCT TYPE NAME',
        FISCAL_YEAR: 'FISCAL YEAR',
        REVISION_NO: 'VERSION',
        IS_CURRENT: 'LATEST VERSION',
        FLOW_CODE: 'FLOW CODE',
        FLOW_NAME: 'FLOW NAME',
        FLOW_PROCESS_NO: 'PROCESS NO',
        PROCESS_NAME: 'PROCESS NAME',
        ITEM_CATEGORY_NAME: 'ITEM CATEGORY NAME',
        CUSTOMER_INVOICE_TO_NAME: 'CUSTOMER INVOICE TO NAME',
        YIELD_RATE_FOR_SCT: 'YIELD RATE (%)',
        TOTAL_YIELD_RATE_FOR_SCT: 'TOTAL YIELD RATE (%)',
        YIELD_ACCUMULATION_FOR_SCT: 'YIELD ACCUMULATION RATE (%)',
        GO_STRAIGHT_RATE_FOR_SCT: 'GO STRAIGHT RATE (%)',
        TOTAL_GO_STRAIGHT_RATE_FOR_SCT: 'TOTAL GO STRAIGHT RATE (%)',
        COLLECTION_POINT_FOR_SCT: 'COLLECTION POINT',
        NOTE: 'NOTE',
        MODIFIED_DATE: 'MODIFIED_DATE',
        UPDATE_BY: 'UPDATED BY',
      }

      const result = await YieldRateModel.searchUnlimitYieldRate(queryProcess)
      const resultTotal = await YieldRateModel.searchUnlimitYieldRateTotal(queryTotal)

      const dataItem = Object.entries(req.body).length === 0 ? req.query : req.body

      const columnFilters = dataItem.columnFilters || []

      const columnVisibilityProcess = {
        inuseForSearch: true,
        PROCESS_ID: false,
        FISCAL_YEAR: true,
        PRODUCT_CATEGORY_NAME: true,
        PRODUCT_MAIN_NAME: true,
        PRODUCT_SUB_NAME: true,
        PRODUCT_TYPE_NAME: true,
        PRODUCT_TYPE_CODE: true,
        ITEM_CATEGORY_NAME: true,
        CUSTOMER_INVOICE_TO_NAME: true,
        NO: true,
        YIELD_RATE_FOR_SCT: true,
        YIELD_ACCUMULATION_FOR_SCT: true,
        GO_STRAIGHT_RATE_FOR_SCT: true,
        TOTAL_YIELD_RATE_FOR_SCT: false,
        TOTAL_GO_STRAIGHT_RATE_FOR_SCT: false,
        PROCESS_NAME: true,
        COLLECTION_POINT_FOR_SCT: true,
        SCT_REASON_SETTING_NAME: true,
        REVISION_NO: true,
        IS_CURRENT: true,
        MODIFIED_DATE: true,
        UPDATE_BY: true,
      }

      const columnVisibilityProcessTotal = {
        inuseForSearch: true,
        PROCESS_ID: false,
        FISCAL_YEAR: true,
        PRODUCT_CATEGORY_NAME: true,
        PRODUCT_MAIN_NAME: true,
        PRODUCT_SUB_NAME: true,
        PRODUCT_TYPE_NAME: true,
        PRODUCT_TYPE_CODE: true,
        ITEM_CATEGORY_NAME: true,
        CUSTOMER_INVOICE_TO_NAME: true,
        NO: true,
        YIELD_RATE_FOR_SCT: false,
        YIELD_ACCUMULATION_FOR_SCT: false,
        GO_STRAIGHT_RATE_FOR_SCT: false,
        TOTAL_YIELD_RATE_FOR_SCT: true,
        TOTAL_GO_STRAIGHT_RATE_FOR_SCT: true,
        PROCESS_NAME: false,
        COLLECTION_POINT_FOR_SCT: false,
        SCT_REASON_SETTING_NAME: true,
        REVISION_NO: true,
        IS_CURRENT: true,
        MODIFIED_DATE: true,
        UPDATE_BY: true,
        FLOW_PROCESS_NO: false,
      }

      const wb = new xl.Workbook()

      if (req.body.DataForFetch.IS_MODE === true) {
        createSheet(wb, 'Yield Rate (Total)', (resultTotal[1] as any[]) || [], headerMap, columnFilters, columnVisibilityProcessTotal)
        createSheet(wb, 'Yield Rate (Process)', (result[1] as any[]) || [], headerMap, columnFilters, columnVisibilityProcess)
      } else {
        createSheet(wb, 'Yield Rate (Process)', (result[1] as any[]) || [], headerMap, columnFilters, columnVisibilityProcess)
        createSheet(wb, 'Yield Rate (Total)', (resultTotal[1] as any[]) || [], headerMap, columnFilters, columnVisibilityProcessTotal)
      }

      // ===== filename =====
      const now = new Date()
      const pad = (n: number) => n.toString().padStart(2, '0')
      const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
      const menuName = req.body.menuName || 'Export'
      const filename = `${menuName}_${timestamp}.xlsx`

      wb.writeToBuffer()
        .then((buffer: any) => {
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
          res.setHeader('Content-Disposition', `attachment; filename=${filename}`)
          res.send(buffer)
        })
        .catch((err: any) => {
          res.status(500).json({ error: 'Failed to generate file', err })
        })
    }
  },
}
