import { StandardCostForProductModel } from '@src/_workspace/models/sct/StandardCostForProductModel'
import ExcelJS from 'exceljs'
import { Request, Response } from 'express'

//** GLOBAL VARIABLE FOR NONE FORMULA

let dataArray: any

let dataSctDataDetail: any

export const GetYieldRateExport = async (req: Request, res: Response) => {
  try {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = JSON.parse(req.query.data as any)
    } else {
      dataItem = req.body
    }

    dataArray = dataItem['LIST_ID']
    // ** SCT HEADER
    dataSctDataDetail = []

    // ** For SCT Header
    for (let i = 0; i < dataArray.length; i++) {
      const dataDetail = await StandardCostForProductModel.getYieldRateExportDataByProductTypeId(dataArray[i])
      dataSctDataDetail.push(Object.assign([], dataDetail))
    }

    let workbookNFormula = new ExcelJS.Workbook()

    await workbookNFormula.xlsx
      .readFile('YR-GSR-Rev1.xlsx')
      .then(async function () {
        //  ** Prepare Data
        writingFile(workbookNFormula).then(function () {
          sendFile(res, workbookNFormula)
        })
      })
      .catch(function (err) {
        res.status(500).send({
          Status: false,
          ResultOnDb: 'ERROR CREATE EXCEL: ' + err,
          TotalCountOnDb: '',
          MethodOnDb: 'Search yield rate Data',
          Message: 'Create Excel Error',
        })
      })
  } catch (err) {
    res.status(500).send({
      Status: false,
      ResultOnDb: 'ERROR CREATE EXCEL : ' + err,
      TotalCountOnDb: '',
      MethodOnDb: 'Search yield rate Data',
      Message: 'Create Excel Error',
    })
  }
}

async function writingFile(workbookNFormula: any) {
  const worksheet = workbookNFormula.getWorksheet('YR-GSR')

  let dataResult = []
  // ** Summary Data From DB to Data Result for export data
  for (let i = 0; i < dataSctDataDetail.length; i++) {
    const element = dataSctDataDetail[i]

    for (let k = 0; k < element.length; k++) {
      const data = element[k]
      dataResult.push(data)
    }
  }

  for (let j = 0; j < dataResult.length; j++) {
    const element = dataResult[j]
    worksheet.getCell(2 + j, 1).value = element['PRODUCT_CATEGORY_NAME']
    worksheet.getCell(2 + j, 2).value = element['PRODUCT_MAIN_NAME']
    worksheet.getCell(2 + j, 3).value = element['PRODUCT_SUB_NAME']
    worksheet.getCell(2 + j, 4).value = element['PRODUCT_TYPE_ID']
    worksheet.getCell(2 + j, 5).value = element['PRODUCT_TYPE_CODE_FOR_SCT']
    worksheet.getCell(2 + j, 6).value = element['PRODUCT_TYPE_NAME']
    worksheet.getCell(2 + j, 7).value = element['FLOW_ID']
    worksheet.getCell(2 + j, 8).value = element['FLOW_CODE']
    worksheet.getCell(2 + j, 9).value = element['FLOW_NAME']
    worksheet.getCell(2 + j, 10).value = element['FLOW_PROCESS_NO']
    worksheet.getCell(2 + j, 11).value = element['FLOW_PROCESS_ID']
    worksheet.getCell(2 + j, 12).value = element['PROCESS_ID']
    worksheet.getCell(2 + j, 13).value = element['PROCESS_CODE']
    worksheet.getCell(2 + j, 14).value = element['PROCESS_NAME']
    worksheet.getCell(2 + j, 18).value = element['COLLECTION_POINT_FOR_SCT'] == 1 ? 'O' : ''
  }

  const leftColumns = [
    ...Array.from({ length: 14 }, (_, i) => i + 1), // 1-14 = A-N
    19, // S = 19
  ]
  leftColumns.forEach((col) => {
    worksheet.getColumn(col).alignment = { horizontal: 'left' }
  })

  const rightColumns = [15, 16, 17] // O=15, P=16, Q=17
  rightColumns.forEach((col) => {
    worksheet.getColumn(col).alignment = { horizontal: 'right' }
  })

  worksheet.getColumn(18).alignment = { horizontal: 'center' } // R=18

  const headerRow = worksheet.getRow(1)
  headerRow.eachCell((cell: any) => {
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.font = { bold: true }
  })

  return workbookNFormula
}

async function sendFile(res: Response, workbookNFormula: any) {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  const filename = `YR-GSR-${year}${month}${day}-${hours}-${minutes}-${seconds}.xlsx`

  // await workbookNFormula.xlsx.write(res).then(() => {})
  await workbookNFormula.xlsx
    .writeBuffer()
    .then((buffer: any) => {
      const contentLength = buffer.length

      res.setHeader('content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64')

      res.setHeader('content-Disposition', `attachment; filename="${filename}"`)

      res.setHeader('content-Length', contentLength)

      res.setHeader('Cache-Control', filename)

      res.end(buffer)
    })
    .catch((err: Error) => {
      console.error('Error:', err)
      res.status(500).send('Error generating the Excel file')
    })
}
