import { ImportFeeService } from '@src/_workspace/services/cost-condition/cost-conditionNew/ImportFeeService'

export const ImportFeeModel = {
  search: async (query: any) => ImportFeeService.search(query),
  create: async (query: any) => ImportFeeService.create(query),
  getByFiscalYear_MasterDataLatest: async (query: any) => ImportFeeService.getByFiscalYear_MasterDataLatest(query),
}
