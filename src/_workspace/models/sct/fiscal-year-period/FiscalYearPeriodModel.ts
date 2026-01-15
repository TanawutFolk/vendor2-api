import { FiscalYearPeriodService } from '@_workspace/services/sct/fiscal-year-period/FiscalYearPeriodService'

export const FiscalYearPeriodModel = {
  search: async (dataItem: any) => FiscalYearPeriodService.search(dataItem),
  create: async (dataItem: any) => FiscalYearPeriodService.create(dataItem),
  update: async (dataItem: any) => FiscalYearPeriodService.update(dataItem),
  delete: async (dataItem: any) => FiscalYearPeriodService.delete(dataItem),
}
