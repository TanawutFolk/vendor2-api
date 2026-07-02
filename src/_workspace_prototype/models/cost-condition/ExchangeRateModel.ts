import { ExchangeRateService } from '@src/_workspace/services/cost-condition/cost-conditionNew/ExchangeRateService'

export const ExchangeRateModel = {
  getCurrency: async (query: any) => ExchangeRateService.getCurrency(query),
  search: async (query: any) => ExchangeRateService.search(query),
  create: async (query: any) => ExchangeRateService.create(query),
  getCurrencyAll: async () => ExchangeRateService.getCurrencyAll(),
}
