import { CurrencyService } from '@src/_workspace/services/cost-condition/cost-conditionNew/CurrencyService'

export const CurrencyRateModel = {
  getByInuse: async (body: any) => CurrencyService.getByInuse(body),
}
