import ExcelJS from 'exceljs'
import { Request, Response } from 'express'
// import { StandardCostForProductModel } from '@src/_workspace/models/sct/StandardCostForProductModel'
import { ItemManufacturingModel } from '@src/_workspace/models/item/ItemManufacturingModel'
import { ProductTypeModel } from '@src/_workspace/models/product-group/product-type/ProductTypeModel'

//** GLOBAL VARIABLE FOR NONE FORMULA

export const GetYieldRateMaterialExport = async (req: Request, res: Response) => {
  try {
    let dataItem
    //  let dataMasterDetail = []
    if (Object.entries(req.body).length === 0) {
      dataItem = JSON.parse(req.query.data as any)
    } else {
      dataItem = req.body
    }

    const dataDetail = await ProductTypeModel.getProductTypeByProductMainId(dataItem)
    const dataItemDetail = await ItemManufacturingModel.getByLikeItemManufacturingByProductTypeId(dataItem)

    //dataMasterDetail.push(Object.assign([], dataDetail, dataItemDetail))

    //console.log('dt', dataMasterDetail)

    let workbookNFormula = new ExcelJS.Workbook()

    await workbookNFormula.xlsx
      .readFile('YR-MATERIAL-Rev1.xlsx')
      .then(async function () {
        //  ** Prepare Data
        writingFile(workbookNFormula, dataDetail, dataItemDetail).then(function () {
          sendFile(res, workbookNFormula)
        })
      })
      .catch(function (err) {
        return res.status(500).send({
          Status: false,
          ResultOnDb: 'ERROR CREATE EXCEL: ' + err,
          TotalCountOnDb: '',
          MethodOnDb: 'Search yield rate material Data',
          Message: 'Create Excel Error',
        })
      })
  } catch (err) {
    res.status(500).send({
      Status: false,
      ResultOnDb: 'ERROR CREATE EXCEL : ' + err,
      TotalCountOnDb: '',
      MethodOnDb: 'Search yield rate material Data',
      Message: 'Create Excel Error',
    })
  }
}

async function writingFile(workbookNFormula: any, dataDetail: any, dataItemDetail: any) {
  let dataDetailResult = []
  let dataItemDetailResult = []

  // ** Product Group
  for (let i = 0; i < dataDetail.length; i++) {
    const element = dataDetail[i]
    dataDetailResult.push(element)
  }

  // ** Item Master
  for (let i = 0; i < dataItemDetail.length; i++) {
    const element = dataItemDetail[i]
    dataItemDetailResult.push(element)
  }

  let worksheet = workbookNFormula.getWorksheet('PRODUCT_GROUP')

  for (let j = 0; j < dataDetailResult.length; j++) {
    const element = dataDetailResult[j]
    worksheet.getCell(2 + j, 1).value = element['PRODUCT_CATEGORY_NAME']
    worksheet.getCell(2 + j, 2).value = element['PRODUCT_MAIN_NAME']
    worksheet.getCell(2 + j, 3).value = element['PRODUCT_SUB_NAME']
    worksheet.getCell(2 + j, 4).value = element['PRODUCT_TYPE_CODE_FOR_SCT']
    worksheet.getCell(2 + j, 5).value = element['PRODUCT_TYPE_NAME']
    worksheet.getCell(2 + j, 6).value = element['PRODUCT_TYPE_ID']
  }

  worksheet = workbookNFormula.getWorksheet('ITEM_MASTER')

  for (let j = 0; j < dataItemDetailResult.length; j++) {
    const element = dataItemDetailResult[j]
    worksheet.getCell(2 + j, 1).value = element['ITEM_CODE_FOR_SUPPORT_MES']
    worksheet.getCell(2 + j, 2).value = element['ITEM_ID']
    worksheet.getCell(2 + j, 3).value = element['ITEM_INTERNAL_SHORT_NAME']
    worksheet.getCell(2 + j, 4).value = element['ITEM_INTERNAL_FULL_NAME']
  }

  let total = dataDetail?.length * dataItemDetail?.length

  // let dataDropdownValue = `"${dataDropdown.join(', ')}"`
  // let datePrepare = [dataDropdownValue]
  // console.log('TYPE ', typeof dataDropdownValue)
  worksheet = workbookNFormula.getWorksheet('YIELD_RATE_MATERIAL')

  for (let i = 0; i < total; i++) {
    // worksheet.getCell('A' + (2 + i)).dataValidation = {
    //   type: 'list',
    //   // allowBlank: true,
    //   // formulae: ['ITEM_MASTER!$A$2:$A$500'],
    //   formulae: ['ITEM_MASTER!$A$2:$A$' + (dataItemDetailResult?.length + 1)],
    //   showErrorMessage: true,
    //   // errorTitle: 'Invalid Selection',
    //   error: 'Please select a valid option from the dropdown list.',
    // }

    // worksheet.getCell('F' + (2 + i)).dataValidation = {
    //   type: 'list',
    //   // allowBlank: true,
    //   formulae: ['PRODUCT_GROUP!$D$2:$D$' + (dataDetailResult?.length + 1)],
    //   showErrorMessage: true,
    //   // errorTitle: 'Invalid Selection',
    //   error: 'Please select a valid option from the dropdown list.',
    // }

    worksheet.getCell('B' + (2 + i)).value = { formula: `IFERROR(VLOOKUP(A${2 + i},'ITEM_MASTER'!A2:D${dataItemDetailResult?.length + 1}, 3 ,FALSE),"") ` }
    worksheet.getCell('B' + (2 + i)).protection = { hidden: true }
    worksheet.getCell('C' + (2 + i)).value = { formula: `IFERROR(VLOOKUP(A${2 + i},'ITEM_MASTER'!A2:D${dataItemDetailResult?.length + 1}, 4 ,FALSE),"")` }
    worksheet.getCell('C' + (2 + i)).protection = { hidden: true }
    worksheet.getCell('D' + (2 + i)).value = { formula: `IFERROR(VLOOKUP(A${2 + i},'ITEM_MASTER'!A2:D${dataItemDetailResult?.length + 1}, 2 ,FALSE),"")` }
    worksheet.getCell('D' + (2 + i)).protection = { hidden: true }
    worksheet.getCell('G' + (2 + i)).value = { formula: `IFERROR(VLOOKUP(F${2 + i},'PRODUCT_GROUP'!D2:F${dataDetailResult?.length + 1}, 2 ,FALSE),"")` }
    worksheet.getCell('G' + (2 + i)).protection = { hidden: true }
    worksheet.getCell('H' + (2 + i)).value = { formula: `IFERROR(VLOOKUP(F${2 + i},'PRODUCT_GROUP'!D2:F${dataDetailResult?.length + 1}, 3 ,FALSE),"")` }
    worksheet.getCell('H' + (2 + i)).protection = { hidden: true }
  }

  // for (let i = 0; i < total; i++) {
  //   worksheet.getCell('F' + (2 + i)).dataValidation = {
  //     type: 'list',
  //     // allowBlank: true,
  //     formulae: ['PRODUCT_GROUP!$D$2:$D$' + (dataDetailResult?.length + 1)],
  //     showErrorMessage: true,
  //     // errorTitle: 'Invalid Selection',
  //     error: 'Please select a valid option from the dropdown list.',
  //   }
  // }

  // for (let j = 0; j < total; j++) {
  //   worksheet.getCell('B' + (2 + j)).value = { formula: `IFERROR(VLOOKUP(A${2 + j},'ITEM_MASTER'!A2:D${dataItemDetailResult?.length + 1}, 3 ,TRUE),"") ` }
  //   worksheet.getCell('C' + (2 + j)).value = { formula: `IFERROR(VLOOKUP(A${2 + j},'ITEM_MASTER'!A2:D${dataItemDetailResult?.length + 1}, 4 ,TRUE),"")` }
  //   worksheet.getCell('D' + (2 + j)).value = { formula: `IFERROR(VLOOKUP(A${2 + j},'ITEM_MASTER'!A2:D${dataItemDetailResult?.length + 1}, 2 ,TRUE),"")` }
  //   worksheet.getCell('G' + (2 + j)).value = { formula: `IFERROR(VLOOKUP(F${2 + j},'PRODUCT_GROUP'!D2:F${dataDetailResult?.length + 1}, 2 ,TRUE),"")` }
  //   worksheet.getCell('H' + (2 + j)).value = { formula: `IFERROR(VLOOKUP(F${2 + j},'PRODUCT_GROUP'!D2:F${dataDetailResult?.length + 1}, 3 ,TRUE),"")` }
  // }

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
  const filename = `YR-MATERIAL-${year}${month}${day}-${hours}-${minutes}-${seconds}.xlsx`

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
