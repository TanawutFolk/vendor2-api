import { CostConditionSettingModel } from '@src/_workspace/models/cost-condition/CostConditionSettingModel'
import { getSqlWhereByColumnFilters_elysia } from '@src/helpers/getSqlWhereByFilterColumn'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'
import XLSX from 'xlsx'
const xl = require('excel4node')
const ExcelJS = require('exceljs')

export const CostConditionSettingController = {
  search: async (req: Request, res: Response) => {
    try {
      let dataItem

      if (!req.body || Object.entries(req.body).length === 0) {
        dataItem = req.query
      } else {
        dataItem = req.body
      }
      const tableIds = [
        { table: 'tb_5', id: 'PRODUCT_CATEGORY_NAME' },
        { table: 'tb_4', id: 'PRODUCT_MAIN_NAME' },
        { table: 'tb_3', id: 'PRODUCT_SUB_NAME' },
        { table: 'tb_2', id: 'PRODUCT_TYPE_CODE' },
        { table: 'tb_2', id: 'PRODUCT_TYPE_NAME' },
        { table: 'tb_1', id: 'COST_CONDITION_SETTING_VERSION' },
        { table: 'tb_1', id: 'COST_CONDITION_SETTING_IS_CURRENT' },
        { table: 'tb_7', id: 'ITEM_CATEGORY_NAME' },
        { table: 'tb_9', id: 'CUSTOMER_INVOICE_TO_NAME' },
        { table: 'tb_1', id: 'DIRECT_UNIT_PROCESS_COST' },
        { table: 'tb_1', id: 'INDIRECT_RATE_OF_DIRECT_PROCESS_COST' },
        { table: 'tb_1', id: 'INDIRECT_COST' },
        { table: 'tb_1', id: 'LEVEL_OF_INDIRECT_COST' },
        { table: 'tb_1', id: 'SELLING_EXPENSE_RATE' },
        { table: 'tb_1', id: 'GA_RATE' },
        { table: 'tb_1', id: 'MARGIN_RATE' },
        { table: 'tb_1', id: 'CIT' },
        { table: 'tb_1', id: 'VAT' },
        { table: 'tb_1', id: 'UPDATE_BY' },
        { table: 'tb_1', id: 'UPDATE_DATE' },
        { table: 'tb_1', id: 'CREATE_BY' },
        { table: 'tb_1', id: 'CREATE_DATE' },
      ]

      dataItem['Start'] = Number(dataItem['Start']) * Number(dataItem['Limit'])
      let orderBy = ''

      if (dataItem['Order'].length <= 0) {
        orderBy = 'tb_1.UPDATE_DATE DESC'
      } else {
        for (let i = 0; i < dataItem['Order'].length; i++) {
          const word = dataItem['Order'][i]
          orderBy += word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
        }
        orderBy = orderBy.slice(0, -1)
      }
      dataItem['Order'] = orderBy

      let sqlWhereColumnFilter = ''
      if (dataItem?.ColumnFilters?.length > 0) {
        sqlWhereColumnFilter += getSqlWhereByColumnFilters_elysia(dataItem.ColumnFilters, tableIds)
      }

      dataItem['sqlWhereColumnFilter'] = sqlWhereColumnFilter

      let result = await CostConditionSettingModel.search(dataItem)

      res.json({
        Status: true,
        ResultOnDb: result[1],
        TotalCountOnDb: result[0][0]['TOTAL_COUNT'] ?? 0,
        MethodOnDb: 'Search Cost Condition Setting',
        Message: 'Search Data Success',
      } as ResponseI)
    } catch (error: any) {
      res.status(500).json({
        Status: false,
        ResultOnDb: [],
        TotalCountOnDb: 0,
        MethodOnDb: 'Search Cost Condition Setting',
        Message: error.message,
      } as ResponseI)
    }
  },
  create: async (req: Request, res: Response) => {
    try {
      let dataItems

      if (Object.entries(req.body).length === 0) {
        dataItems = req.query.data
      } else {
        dataItems = req.body
      }

      // Support both single and array
      if (!Array.isArray(dataItems)) {
        dataItems = [dataItems]
      }

      let result = await CostConditionSettingModel.create(dataItems)

      res.status(200).json({
        Status: true,
        ResultOnDb: result,
        TotalCountOnDb: 0,
        MethodOnDb: 'Create Cost Condition Setting',
        Message: 'บันทึกข้อมูลสำเร็จ Successfully saved',
      } as ResponseI)
    } catch (error: any) {
      res.status(500).json({
        Status: false,
        ResultOnDb: [],
        TotalCountOnDb: 0,
        MethodOnDb: 'Create Cost Condition Setting',
        Message: error.message,
      } as ResponseI)
    }
  },
  update: async (req: Request, res: Response) => {
    try {
      let dataItem

      if (Object.entries(req.body).length === 0) {
        dataItem = req.query
      } else {
        dataItem = req.body
      }

      let result = await CostConditionSettingModel.update(dataItem)

      res.status(200).json({
        Status: true,
        ResultOnDb: result,
        TotalCountOnDb: 0,
        MethodOnDb: 'Update Cost Condition Setting',
        Message: 'แก้ไขข้อมูลสำเร็จ Successfully updated',
      } as ResponseI)
    } catch (error: any) {
      res.status(500).json({
        Status: false,
        ResultOnDb: [],
        TotalCountOnDb: 0,
        MethodOnDb: 'Update Cost Condition Setting',
        Message: error.message,
      } as ResponseI)
    }
  },
  delete: async (req: Request, res: Response) => {
    try {
      let dataItem

      if (Object.entries(req.body).length === 0) {
        dataItem = req.query
      } else {
        dataItem = req.body
      }

      let result = await CostConditionSettingModel.delete(dataItem)

      res.status(200).json({
        Status: true,
        ResultOnDb: result,
        TotalCountOnDb: 0,
        MethodOnDb: 'Delete Cost Condition Setting',
        Message: 'ลบข้อมูลสำเร็จ Successfully deleted',
      } as ResponseI)
    } catch (error: any) {
      res.status(500).json({
        Status: false,
        ResultOnDb: [],
        TotalCountOnDb: 0,
        MethodOnDb: 'Delete Cost Condition Setting',
        Message: error.message,
      } as ResponseI)
    }
  },

  getUnsettledCount: async (req: Request, res: Response) => {
    try {
      let result = await CostConditionSettingModel.getUnsettledCount()

      res.status(200).json({
        Status: true,
        ResultOnDb: result,
        TotalCountOnDb: result[0]?.UNSETTLED_COUNT ?? 0,
        MethodOnDb: 'Get Unsettled Count',
        Message: 'ดึงข้อมูลสำเร็จ Successfully retrieved',
      } as ResponseI)
    } catch (error: any) {
      res.status(500).json({
        Status: false,
        ResultOnDb: [],
        TotalCountOnDb: 0,
        MethodOnDb: 'Get Unsettled Count',
        Message: error.message,
      } as ResponseI)
    }
  },
  getByProductTypeId: async (req: Request, res: Response) => {
    try {
      let dataItem

      if (Object.entries(req.body).length === 0) {
        dataItem = req.query
      } else {
        dataItem = req.body
      }

      let result = await CostConditionSettingModel.getByProductTypeId(dataItem)

      res.status(200).json({
        Status: true,
        ResultOnDb: result ? [result] : [],
        TotalCountOnDb: result ? 1 : 0,
        MethodOnDb: 'Get Cost Condition Setting By Product Type Id',
        Message: 'ดึงข้อมูลสำเร็จ Successfully retrieved',
      } as ResponseI)
    } catch (error: any) {
      res.status(500).json({
        Status: false,
        ResultOnDb: [],
        TotalCountOnDb: 0,
        MethodOnDb: 'Get Cost Condition Setting By Product Type Id',
        Message: error.message,
      } as ResponseI)
    }
  },
  getUnsettledProductTypes: async (req: Request, res: Response) => {
    try {
      let dataItem
      if (Object.entries(req.body).length === 0) {
        dataItem = req.query
      } else {
        dataItem = req.body
      }

      let result = await CostConditionSettingModel.getUnsettledProductTypes(dataItem)

      res.json({
        Status: true,
        ResultOnDb: result[1],
        TotalCountOnDb: result[0][0]['TOTAL_COUNT'] ?? 0,
        MethodOnDb: 'Get Unsettled Product Types',
        Message: 'Search Data Success',
      } as ResponseI)
    } catch (error: any) {
      res.status(500).json({
        Status: false,
        ResultOnDb: [],
        TotalCountOnDb: 0,
        MethodOnDb: 'Get Unsettled Product Types',
        Message: error.message,
      } as ResponseI)
    }
  },

  downloadFileForExportSearchResult: async (req: Request, res: Response) => {
    try {
      const query = req.body?.DataForFetch || {}
      const tableIds = [
        { table: 'tb_5', id: 'PRODUCT_CATEGORY_NAME' },
        { table: 'tb_4', id: 'PRODUCT_MAIN_NAME' },
        { table: 'tb_3', id: 'PRODUCT_SUB_NAME' },
        { table: 'tb_2', id: 'PRODUCT_TYPE_CODE' },
        { table: 'tb_2', id: 'PRODUCT_TYPE_NAME' },
        { table: 'tb_1', id: 'COST_CONDITION_SETTING_VERSION' },
        { table: 'tb_1', id: 'COST_CONDITION_SETTING_IS_CURRENT' },
        { table: 'tb_7', id: 'ITEM_CATEGORY_NAME' },
        { table: 'tb_9', id: 'CUSTOMER_INVOICE_TO_NAME' },
        { table: 'tb_1', id: 'DIRECT_UNIT_PROCESS_COST' },
        { table: 'tb_1', id: 'INDIRECT_RATE_OF_DIRECT_PROCESS_COST' },
        { table: 'tb_1', id: 'INDIRECT_COST' },
        { table: 'tb_1', id: 'LEVEL_OF_INDIRECT_COST' },
        { table: 'tb_1', id: 'SELLING_EXPENSE_RATE' },
        { table: 'tb_1', id: 'GA_RATE' },
        { table: 'tb_1', id: 'MARGIN_RATE' },
        { table: 'tb_1', id: 'CIT' },
        { table: 'tb_1', id: 'VAT' },
        { table: 'tb_1', id: 'ADJUST_PRICE' },
        { table: 'tb_1', id: 'UPDATE_BY' },
        { table: 'tb_1', id: 'UPDATE_DATE' },
        { table: 'tb_1', id: 'CREATE_BY' },
        { table: 'tb_1', id: 'CREATE_DATE' },
      ]

      const columnKeyAliases: Record<string, string> = {
        PRODUCT_TYPE_CODE_FOR_SCT: 'PRODUCT_TYPE_CODE',
        PRODUCT_TYPE_LATEST_VERSION: 'PRODUCT_TYPE_IS_CURRENT',
      }

      const headerMap: Record<string, string> = {
        STATUS: 'STATUS',
        PRODUCT_CATEGORY_NAME: 'PRODUCT CATEGORY NAME',
        PRODUCT_MAIN_NAME: 'PRODUCT MAIN NAME',
        PRODUCT_SUB_NAME: 'PRODUCT SUB NAME',
        PRODUCT_TYPE_CODE: 'PRODUCT TYPE CODE',
        PRODUCT_TYPE_NAME: 'PRODUCT TYPE NAME',
        PRODUCT_TYPE_VERSION: 'PRODUCT TYPE (VERSION)',
        PRODUCT_TYPE_IS_CURRENT: 'PRODUCT TYPE (LATEST VERSION)',
        COST_CONDITION_SETTING_VERSION: 'VERSION',
        COST_CONDITION_SETTING_IS_CURRENT: 'LATEST VERSION',
        ITEM_CATEGORY_NAME: 'ITEM CATEGORY',
        CUSTOMER_INVOICE_TO_NAME: 'CUSTOMER INVOICE TO NAME',
        DIRECT_UNIT_PROCESS_COST: 'DIRECT UNIT PROCESS COST (THB)',
        INDIRECT_RATE_OF_DIRECT_PROCESS_COST: 'INDIRECT RATE OF DIRECT PROCESS COST (%)',
        INDIRECT_COST: 'INDIRECT COST (THB)',
        LEVEL_OF_INDIRECT_COST: 'LEVEL OF INDIRECT COST',
        SELLING_EXPENSE_RATE: 'SELLING EXPENSE RATE (%)',
        GA_RATE: 'GA RATE (%)',
        MARGIN_RATE: 'MARGIN RATE (%)',
        CIT: 'CIT (%)',
        VAT: 'VAT (%)',
        ADJUST_PRICE: 'ADJUST PRICE (THB)',
        UPDATE_DATE: 'UPDATE DATE',
        UPDATE_BY: 'UPDATE BY',
        CREATE_DATE: 'CREATE DATE',
        CREATE_BY: 'CREATE BY',
      }

      const normalizeColumnKey = (key: string) => columnKeyAliases[key] || key

      const requestedColumnOrder = Array.isArray(req.body?.columnOrder) ? (req.body.columnOrder as string[]) : []
      const normalizedColumnOrder: string[] = Array.from(
        new Set(
          requestedColumnOrder
            .map((columnKey: string) => normalizeColumnKey(columnKey))
            .filter((columnKey: string) => columnKey && columnKey !== 'mrt-row-actions' && columnKey !== 'mrt-row-spacer' && columnKey !== 'mrt-row-select')
        )
      )

      const normalizedColumnVisibility = Object.entries(req.body?.columnVisibility || {}).reduce((acc: Record<string, boolean>, [key, value]) => {
        acc[normalizeColumnKey(key)] = Boolean(value)
        return acc
      }, {})

      let orderBy = ''
      if (!Array.isArray(query['Order']) || query['Order'].length <= 0) {
        orderBy = 'tb_1.UPDATE_DATE DESC'
      } else {
        for (let i = 0; i < query['Order'].length; i++) {
          const word = query['Order'][i]
          orderBy += word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
        }
        orderBy = orderBy.slice(0, -1)
      }

      let sqlWhereColumnFilter = ''
      if (query?.ColumnFilters?.length > 0) {
        sqlWhereColumnFilter += getSqlWhereByColumnFilters_elysia(query.ColumnFilters, tableIds)
      }

      query['Order'] = orderBy
      query['sqlWhereColumnFilter'] = sqlWhereColumnFilter

      if (req.body?.TYPE === 'currentPage') {
        query['Start'] = Number(query['Start']) * Number(query['Limit'])
        query['Limit'] = Number(query['Limit'])
      } else {
        query['Start'] = 0
        query['Limit'] = 1000000
      }

      const result = await CostConditionSettingModel.search(query)
      const data = result?.[1] || []

      const visibleColumns = normalizedColumnOrder.filter((columnKey: string) => normalizedColumnVisibility[columnKey] !== false)

      if (visibleColumns.length === 0) {
        return res.status(400).json({ error: 'No visible columns to export.' })
      }

      const workbook = new xl.Workbook()
      const worksheet = workbook.addWorksheet('Cost Condition Setting')
      const yesNoColumnKeys = [
        'PRODUCT_TYPE_IS_CURRENT',
        'COST_CONDITION_SETTING_IS_CURRENT',
        'DIRECT_UNIT_PROCESS_COST',
        'INDIRECT_RATE_OF_DIRECT_PROCESS_COST',
        'INDIRECT_COST',
        'SELLING_EXPENSE_RATE',
        'GA_RATE',
        'MARGIN_RATE',
        'CIT',
        'VAT',
        'ADJUST_PRICE',
      ]

      visibleColumns.forEach((columnKey: string, columnIndex: number) => {
        worksheet
          .cell(1, columnIndex + 1)
          .string(headerMap[columnKey] || columnKey)
          .style(
            workbook.createStyle({
              font: { name: 'Aptos', size: 11, bold: true },
              alignment: { horizontal: 'center', vertical: 'center', wrapText: false },
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
      worksheet.row(1).setHeight(25)

      const maxColWidths: number[] = visibleColumns.map((columnKey: string) => (headerMap[columnKey] || columnKey).length)

      data.forEach((row: any, rowIndex: number) => {
        visibleColumns.forEach((columnKey: string, columnIndex: number) => {
          let cellValue = row[columnKey]

          if (columnKey === 'STATUS') {
            cellValue = row[columnKey] == 2 ? 'Using' : row[columnKey] == 1 ? 'Can use' : row[columnKey] == 3 ? 'Can use (Used)' : 'Cancel'
          }

          if (
            yesNoColumnKeys.includes(columnKey)
          ) {
            cellValue = row[columnKey] == 1 ? 'Yes' : 'No'
          }

          const finalValue = cellValue !== undefined && cellValue !== null ? cellValue.toString() : ''
          const isYesNoColumn = yesNoColumnKeys.includes(columnKey)

          worksheet
            .cell(rowIndex + 2, columnIndex + 1)
            .string(finalValue)
            .style(
              workbook.createStyle({
                font: { name: 'Arial', size: 11 },
                alignment: {
                  horizontal: isYesNoColumn ? 'center' : 'left',
                  vertical: 'center',
                  wrapText: false,
                },
              })
            )

          maxColWidths[columnIndex] = Math.max(maxColWidths[columnIndex], finalValue.length)
        })
      })

      maxColWidths.forEach((width, index) => {
        const finalWidth = Math.min(Math.ceil(width * 1.6), 55)
        worksheet.column(index + 1).setWidth(finalWidth)
      })

      const now = new Date()
      const pad = (n: number) => n.toString().padStart(2, '0')
      const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
      const filename = `CostConditionSetting_${timestamp}.xlsx`

      workbook
        .writeToBuffer()
        .then((buffer: any) => {
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
          res.setHeader('Content-Disposition', `attachment; filename=${filename}`)
          res.send(buffer)
        })
        .catch((err: any) => {
          res.status(500).json({ error: 'Failed to generate file', err })
        })
    } catch (error: any) {
      res.status(500).json({
        Status: false,
        ResultOnDb: [],
        TotalCountOnDb: 0,
        MethodOnDb: 'Download File For Export Search Result Cost Condition Setting',
        Message: error.message,
      } as ResponseI)
    }
  },

  downloadFileForExport: async (req: Request, res: Response) => {
    try {
      const payloadIdList = Array.isArray(req.body.LIST_ID) ? req.body.LIST_ID : []
      if (payloadIdList.length === 0) {
        throw new Error('No products selected for export')
      }

      const productTypeIds = payloadIdList.map((item: any) => item.PRODUCT_TYPE_ID)
      const exportData: any[] = await CostConditionSettingModel.getExportData(productTypeIds)
      const workbook = new ExcelJS.Workbook()
      const ws = workbook.addWorksheet('Cost Condition Setting')

      const toYesNo = (value: any, defaultValue?: number) => {
        const finalValue = value ?? defaultValue
        if (finalValue === 1 || finalValue === '1') return 'Yes'
        if (finalValue === 0 || finalValue === '0') return 'No'
        return ''
      }

      const exportColumns = [
        { name: 'ACTION', key: 'ACTION', locked: true, width: 14, type: 'text' },
        { name: 'PRODUCT TYPE CODE', key: 'PRODUCT_TYPE_CODE', locked: true, width: 30, type: 'text' },
        { name: 'PRODUCT TYPE NAME', key: 'PRODUCT_TYPE_NAME', locked: true, width: 50, type: 'text' },
        { name: 'DIRECT UNIT PROCESS COST (THB)', key: 'DIRECT_UNIT_PROCESS_COST', locked: true, width: 30, type: 'yesNoFixedYes' },
        {
          name: 'INDIRECT RATE OF DIRECT PROCESS COST (%)',
          key: 'INDIRECT_RATE_OF_DIRECT_PROCESS_COST',
          locked: true,
          width: 40,
          type: 'yesNoFixedYes',
        },
        { name: 'INDIRECT COST (THB)', key: 'INDIRECT_COST', locked: false, width: 18, type: 'yesNo' },
        { name: 'LEVEL OF INDIRECT COST', key: 'LEVEL_OF_INDIRECT_COST', locked: false, width: 22, type: 'level' },
        { name: 'SELLING EXPENSE RATE (%)', key: 'SELLING_EXPENSE_RATE', locked: false, width: 25, type: 'yesNo' },
        { name: 'GA RATE (%)', key: 'GA_RATE', locked: false, width: 14, type: 'yesNo' },
        { name: 'MARGIN RATE (%)', key: 'MARGIN_RATE', locked: false, width: 18, type: 'yesNo' },
        { name: 'CIT (%)', key: 'CIT', locked: false, width: 14, type: 'yesNo' },
        { name: 'VAT (%)', key: 'VAT', locked: true, width: 10, type: 'yesNoFixedNo' },
        { name: 'ADJUST PRICE (%)', key: 'ADJUST_PRICE', locked: false, width: 16, type: 'yesNo' },
      ] as const

      ws.columns = exportColumns.map((col) => ({
        header: col.name,
        key: col.key,
        width: col.width,
      }))
      const maxColWidths = exportColumns.map((column) => column.name.length)

      const headerRow = ws.getRow(1)
      headerRow.height = 28
      headerRow.eachCell((cell: any) => {
        cell.font = { name: 'Aptos', size: 11, bold: true }
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: false }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } }
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        }
        cell.protection = { locked: true }
      })

      exportData.forEach((row: any, idx: number) => {
        const isExistingRecord = row['COST_CONDITION_SETTING_ID'] != null
        const rowValues = exportColumns.map((h) => {
          let cellValue = row[h.key]

          if (h.key === 'ACTION') {
            cellValue = isExistingRecord ? 'Edit' : 'Add New'
          } else if (h.type === 'yesNoFixedYes') {
            cellValue = toYesNo(cellValue, 1)
          } else if (h.type === 'yesNoFixedNo') {
            cellValue = toYesNo(cellValue, 0)
          } else if (h.type === 'yesNo') {
            cellValue = isExistingRecord ? toYesNo(cellValue) : ''
          } else if (h.type === 'level') {
            cellValue = isExistingRecord ? cellValue || '' : ''
          } else if (cellValue === null || cellValue === undefined) {
            cellValue = ''
          }

          if (!isExistingRecord && h.locked === false) {
            cellValue = ''
          }

          return `${cellValue ?? ''}`
        })

        rowValues.forEach((value, columnIndex) => {
          maxColWidths[columnIndex] = Math.max(maxColWidths[columnIndex], `${value ?? ''}`.length)
        })

        const excelRow = ws.addRow(rowValues)
        excelRow.height = 22
        exportColumns.forEach((column, columnIndex) => {
          const cell = excelRow.getCell(columnIndex + 1)
          const isLocked = column.locked
          const isYesNoColumn =
            column.type === 'yesNo' || column.type === 'yesNoFixedYes' || column.type === 'yesNoFixedNo'
          cell.font = { name: 'Arial', size: 11 }
          cell.alignment = {
            horizontal: isYesNoColumn ? 'center' : 'left',
            vertical: 'middle',
            wrapText: false,
          }
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
            left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
            bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
            right: { style: 'thin', color: { argb: 'FFD9D9D9' } },
          }
          if (isLocked) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } }
          }
          cell.protection = { locked: isLocked }
        })
      })

      maxColWidths.forEach((width, index) => {
        const finalWidth = Math.min(Math.ceil(width * 1.6), 55)
        ws.getColumn(index + 1).width = finalWidth
      })

      const maxValidationRows = Math.max(exportData.length + 1, 1001)
      for (let rowIndex = 2; rowIndex <= maxValidationRows; rowIndex++) {
        exportColumns.forEach((column, columnIndex) => {
          const cell = ws.getCell(rowIndex, columnIndex + 1)
          const isYesNoColumn =
            column.type === 'yesNo' || column.type === 'yesNoFixedYes' || column.type === 'yesNoFixedNo'
          cell.protection = { locked: column.locked }
          cell.alignment = {
            horizontal: isYesNoColumn ? 'center' : 'left',
            vertical: 'middle',
            wrapText: false,
          }

          if (column.type === 'yesNo') {
            cell.dataValidation = {
              type: 'list',
              allowBlank: true,
              formulae: ['"Yes,No"'],
            }
          }

          if (column.type === 'level') {
            cell.dataValidation = {
              type: 'list',
              allowBlank: true,
              formulae: ['"Product Sub,Product Main"'],
            }
          }
        })
      }

      await ws.protect('', {
        selectLockedCells: true,
        selectUnlockedCells: true,
        formatCells: false,
        formatColumns: true,
        formatRows: false,
        insertColumns: false,
        insertRows: false,
        insertHyperlinks: false,
        deleteColumns: false,
        deleteRows: true,
        sort: false,
        autoFilter: false,
        pivotTables: false,
      })

      const buffer = await workbook.xlsx.writeBuffer()
      const now = new Date()
      const pad = (n: number) => String(n).padStart(2, '0')
      const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`
      const filename = `CostConditionSetting-${timestamp}.xlsx`
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      res.setHeader('Cache-Control', filename)
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      return res.send(Buffer.from(buffer))
    } catch (error: any) {
      res.status(500).json({
        Status: false,
        ResultOnDb: [],
        TotalCountOnDb: 0,
        MethodOnDb: 'Download File For Export Cost Condition Setting',
        Message: error.message,
      } as ResponseI)
    }
  },

  createByImportFile: async (req: Request, res: Response) => {
    try {
      let dataItem

      if (Object.entries(req.body).length === 0) {
        dataItem = req.query.data
      } else {
        dataItem = req.body
      }

      let result = await CostConditionSettingModel.createByImportFile(dataItem)

      if (result.Status === false) {
        const errorList = result.ResultOnDb || []
        const errorMap = new Map()
        errorList.forEach((e: any) => errorMap.set(e.row, e))

        const workbook = new ExcelJS.Workbook()
        const ws = workbook.addWorksheet('Cost Condition Setting')

        const errorExportColumns = [
          { name: 'ACTION', key: 'RAW_ACTION', locked: true, width: 14, type: 'text' },
          { name: 'PRODUCT TYPE CODE', key: 'PRODUCT_TYPE_CODE', locked: true, width: 30, type: 'text' },
          { name: 'PRODUCT TYPE NAME', key: 'PRODUCT_TYPE_NAME', locked: true, width: 50, type: 'text' },
          { name: 'DIRECT UNIT PROCESS COST (THB)', key: 'DIRECT_UNIT_PROCESS_COST', locked: true, width: 50, type: 'yesNoFixedYes' },
          {
            name: 'INDIRECT RATE OF DIRECT PROCESS COST (%)',
            key: 'INDIRECT_RATE_OF_DIRECT_PROCESS_COST',
            locked: true,
            width: 60,
            type: 'yesNoFixedYes',
          },
          { name: 'INDIRECT COST (THB)', key: 'RAW_INDIRECT_COST', locked: false, width: 22, type: 'yesNo' },
          { name: 'LEVEL OF INDIRECT COST', key: 'RAW_LEVEL_OF_INDIRECT_COST', locked: false, width: 22, type: 'level' },
          { name: 'SELLING EXPENSE RATE (%)', key: 'RAW_SELLING_EXPENSE_RATE', locked: false, width: 40, type: 'yesNo' },
          { name: 'GA RATE (%)', key: 'RAW_GA_RATE', locked: false, width: 14, type: 'yesNo' },
          { name: 'MARGIN RATE (%)', key: 'RAW_MARGIN_RATE', locked: false, width: 18, type: 'yesNo' },
          { name: 'CIT (%)', key: 'RAW_CIT', locked: false, width: 14, type: 'yesNo' },
          { name: 'VAT (%)', key: 'VAT', locked: true, width: 10, type: 'yesNoFixedNo' },
          { name: 'ADJUST PRICE (THB)', key: 'RAW_ADJUST_PRICE', locked: false, width: 16, type: 'yesNo' },
          { name: 'ERROR MESSAGE', key: 'ERROR_MESSAGE', locked: true, width: 60, type: 'text' },
        ] as const

        ws.columns = errorExportColumns.map((col) => ({
          header: col.name,
          key: col.key,
          width: col.width,
        }))
        const maxColWidths = errorExportColumns.map((column) => column.name.length)

        const headerRow = ws.getRow(1)
        headerRow.height = 28
        headerRow.eachCell((cell: any) => {
          cell.font = { name: 'Aptos', size: 11, bold: true }
          cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: false }
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } }
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          }
          cell.protection = { locked: true }
        })

        if (Array.isArray(dataItem)) {
          dataItem.forEach((item: any) => {
            const rowErr = errorMap.get(item.row)
            const errorMessage = rowErr && rowErr.errors ? Object.values(rowErr.errors).join(', ') : ''

            const rowValues = errorExportColumns.map((column) => {
              if (column.key === 'DIRECT_UNIT_PROCESS_COST') return 'Yes'
              if (column.key === 'INDIRECT_RATE_OF_DIRECT_PROCESS_COST') return 'Yes'
              if (column.key === 'VAT') return 'No'
              if (column.key === 'ERROR_MESSAGE') return errorMessage
              return `${item[column.key] ?? ''}`
            })

            rowValues.forEach((value, columnIndex) => {
              maxColWidths[columnIndex] = Math.max(maxColWidths[columnIndex], `${value ?? ''}`.length)
            })

            const excelRow = ws.addRow(rowValues)
            excelRow.height = 22
            errorExportColumns.forEach((column, columnIndex) => {
              const cell = excelRow.getCell(columnIndex + 1)
              const isLocked = column.locked
              const isYesNoColumn =
                column.type === 'yesNo' || column.type === 'yesNoFixedYes' || column.type === 'yesNoFixedNo'
              cell.font = { name: 'Arial', size: 11 }
              cell.alignment = {
                horizontal: isYesNoColumn ? 'center' : 'left',
                vertical: 'middle',
                wrapText: false,
              }
              cell.border = {
                top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
                left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
                bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
                right: { style: 'thin', color: { argb: 'FFD9D9D9' } },
              }
              if (isLocked) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } }
              }
              cell.protection = { locked: isLocked }
            })
          })
        }

        maxColWidths.forEach((width, index) => {
          const finalWidth = Math.min(Math.ceil(width * 1.6), 55)
          ws.getColumn(index + 1).width = finalWidth
        })

        const maxValidationRows = Math.max(Array.isArray(dataItem) ? dataItem.length + 1 : 2, 1001)
        for (let rowIndex = 2; rowIndex <= maxValidationRows; rowIndex++) {
          errorExportColumns.forEach((column, columnIndex) => {
            const cell = ws.getCell(rowIndex, columnIndex + 1)
            const isYesNoColumn =
              column.type === 'yesNo' || column.type === 'yesNoFixedYes' || column.type === 'yesNoFixedNo'
            cell.protection = { locked: column.locked }
            cell.alignment = {
              horizontal: isYesNoColumn ? 'center' : 'left',
              vertical: 'middle',
              wrapText: false,
            }

            if (column.type === 'yesNo') {
              cell.dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: ['"Yes,No"'],
              }
            }

            if (column.type === 'level') {
              cell.dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: ['"Product Sub,Product Main"'],
              }
            }
          })
        }

        await ws.protect('', {
          selectLockedCells: true,
          selectUnlockedCells: true,
          formatCells: false,
          formatColumns: true,
          formatRows: false,
          insertColumns: false,
          insertRows: false,
          insertHyperlinks: false,
          deleteColumns: false,
          deleteRows: true,
          sort: false,
          autoFilter: false,
          pivotTables: false,
        })

        const buffer = await workbook.xlsx.writeBuffer()

        res.setHeader('Content-Disposition', 'attachment; filename="Cost_Condition_Setting_Import_Error.xlsx"')
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        res.setHeader('Status', 'false')
        res.setHeader('Access-Control-Expose-Headers', 'Status')

        return res.send(Buffer.from(buffer))
      }

      return res.status(200).json({
        Status: true,
        ResultOnDb: result,
        TotalCountOnDb: 0,
        MethodOnDb: 'Create Cost Condition Setting By Import File',
        Message: 'บันทึกข้อมูลสำเร็จ Successfully saved',
      } as ResponseI)
    } catch (error: any) {
      return res.status(500).json({
        Status: false,
        ResultOnDb: [],
        TotalCountOnDb: 0,
        MethodOnDb: 'Create Cost Condition Setting By Import File',
        Message: error.message,
      } as ResponseI)
    }
  },
}
