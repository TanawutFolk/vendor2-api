import { ProductTypeService } from '@src/_workspace/services/product-group/product-type/ProductTypeService'

export const ProductTypeModel = {
  getProductTypeByProductMainId: async (dataItem: any) => await ProductTypeService.getProductTypeByProductMainId(dataItem),
}
