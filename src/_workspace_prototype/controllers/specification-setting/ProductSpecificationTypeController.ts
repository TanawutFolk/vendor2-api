import { ProductSpecificationTypeModel } from '@models/specification-setting/ProductSpecificationTypeModel'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const ProductSpecificationTypeController = {
  // search: async ({ body }) => {
  //   //console.log('QQQ', body)
  //   body['Start'] = Number(body['Start']) * Number(body['Limit'])
  //   let orderBy = ''

  //   if (body['Order'] == '') {
  //     orderBy = 'tb_1.UPDATE_DATE DESC'
  //   } else {
  //     for (let i = 0; i < JSON.parse(body['Order']).length; i++) {
  //       const word = JSON.parse(body['Order'])[i]
  //       orderBy += word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
  //     }
  //     orderBy = orderBy.slice(0, -1)
  //   }
  //   body['Order'] = orderBy
  //   if (body !== '') {
  //     const result = await SpecificationSettingModel.search(body)
  //     return {
  //       Status: true,
  //       Message: 'Search Data Success',
  //       ResultOnDb: result[1],
  //       MethodOnDb: 'Search CustomerOrderFrom',
  //       TotalCountOnDb: result[0][0]['TOTAL_COUNT']
  //     } as ResponseI
  //   }
  // },

  // create: async ({ body }) => {
  //   // //console.log('Query', body)

  //   let result = await SpecificationSettingModel.create(body)
  //   return {
  //     Status: true,
  //     Message: 'บันทึกข้อมูลเรียบร้อยแล้ว Data has been saved successfully',
  //     ResultOnDb: result,
  //     MethodOnDb: 'Create Product Category',
  //     TotalCountOnDb: result?.[1]?.length ?? 0
  //   } as ResponseI
  // },
  // update: async ({ body }) => {
  //   // if (Object.entries(req.body).length === 0) {
  //   //   query = JSON.parse(req.query.data);
  //   // } else {
  //   //   query = req.body;
  //   // }
  //   //console.log('Query', body)

  //   if (body !== '') {
  //     let result = await SpecificationSettingModel.update(body)
  //     return {
  //       Status: true,
  //       Message: 'อัปเดตข้อมูลเรียบร้อยแล้ว Data has been updated successfully',
  //       ResultOnDb: result,
  //       MethodOnDb: 'Update Product Category',
  //       TotalCountOnDb: ''
  //     }
  //   }
  // },
  // delete: async ({ body }) => {
  //   //console.log('Query', body)

  //   if (body !== '') {
  //     let result = await SpecificationSettingModel.delete(body)
  //     return {
  //       Status: true,
  //       Message: 'ลบข้อมูลเรียบร้อยแล้ว Data has been deleted successfully',
  //       ResultOnDb: result,
  //       MethodOnDb: 'Delete Product Category',
  //       TotalCountOnDb: ''
  //     }
  //   }
  // }
  getByLikeProductSpecificationTypeAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    let result = await ProductSpecificationTypeModel.getByLikeProductSpecificationTypeAndInuse(dataItem)

    res.json({
      Status: true,
      Message: 'getByLikeProductSpecificationTypeAndInuse Data Success',
      ResultOnDb: result,
      MethodOnDb: 'getByLikeProductSpecificationTypeAndInuse Category',
      TotalCountOnDb: result.length,
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
