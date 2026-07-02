import { EnvironmentCertificateModel } from '@src/_workspace/models/environment-certificate/EnvironmentCertificateModel'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const EnvironmentCertificateController = {
  search: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    dataItem['Start'] = Number(dataItem['Start']) * Number(dataItem['Limit'])
    let orderBy = ''

    if (dataItem['PRODUCT_CATEGORY_ID'] == '') {
      if (dataItem['Order'] == '') {
        orderBy = 'tb_1.UPDATE_DATE DESC'
      } else {
        for (let i = 0; i < JSON.parse(dataItem['Order']).length; i++) {
          const word = JSON.parse(dataItem['Order'])[i]
          if (word['id'] == 'PRODUCT_CATEGORY_NAME') {
            orderBy += 'tb_2.' + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
          } else {
            orderBy += 'tb_1.' + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
          }
        }
        orderBy = orderBy.slice(0, -1)
      }
      dataItem['Order'] = orderBy
    } else {
      if (dataItem['Order'] == '') {
        orderBy = 'tb_1.UPDATE_DATE DESC'
      } else {
        for (let i = 0; i < JSON.parse(dataItem['Order']).length; i++) {
          const word = JSON.parse(dataItem['Order'])[i]

          orderBy += word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
        }
        orderBy = orderBy.slice(0, -1)
      }
      dataItem['Order'] = orderBy
    }

    const result = await EnvironmentCertificateModel.search(dataItem)

    res.status(200).json({
      Status: true,
      Message: 'Search Data Success',
      ResultOnDb: result[1],
      MethodOnDb: 'Search ProductCategory',
      TotalCountOnDb: result[0][0]['TOTAL_COUNT'],
    } as ResponseI)
  },

  create: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    await EnvironmentCertificateModel.create(dataItem)

    res.status(200).json({
      Status: true,
      Message: 'บันทึกข้อมูลเรียบร้อยแล้ว Data has been saved successfully',
      ResultOnDb: [],
      MethodOnDb: 'Create Product Category',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
  update: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    let result = await EnvironmentCertificateModel.update(dataItem)

    res.json({
      Status: true,
      Message: 'อัปเดตข้อมูลเรียบร้อยแล้ว Data has been updated successfully',
      ResultOnDb: result,
      MethodOnDb: 'Update Product Category',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
  delete: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    let result = await EnvironmentCertificateModel.delete(dataItem)

    res.json({
      Status: true,
      Message: 'ลบข้อมูลเรียบร้อยแล้ว Data has been deleted successfully',
      ResultOnDb: result,
      MethodOnDb: 'Delete Product Category',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
  getByLikeEnvironmentCertificateNameAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    let result = await EnvironmentCertificateModel.getByLikeEnvironmentCertificateNameAndInuse(dataItem)

    res.json({
      Status: true,
      Message: 'getByLikeEnvironmentCertificateNameAndInuse Data Success',
      ResultOnDb: result,
      MethodOnDb: 'getByLikeEnvironmentCertificateNameAndInuse',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
  getAllByLikeInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    let result = await EnvironmentCertificateModel.getAllByLikeInuse(dataItem)

    res.json({
      Status: true,
      Message: 'getByLikeEnvironmentCertificateNameAndInuse Data Success',
      ResultOnDb: result,
      MethodOnDb: 'getByLikeEnvironmentCertificateNameAndInuse',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
  // GetByLikeProductMainNameAndProductCategoryIdAndInuse: async ({ query }) => {
  //   if (query !== '') {
  //     let result = await ProductMainModel.getByLikeProductMainNameAndProductCategoryIdAndInuse(query)
  //     return {
  //       Status: true,
  //       Message: 'getByLikeProductMainNameAndInuse Data Success',
  //       ResultOnDb: result,
  //       MethodOnDb: 'getByLikeProductMainNameAndInuse Category',
  //       TotalCountOnDb: ''
  //     }
  //   }
  // }
}
