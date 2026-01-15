import { ProcessService } from '@src/_workspace/services/process/ProcessService'

export const ProcessModel = {
  getAllProcessInProductMain: async () => ProcessService.getAllProcessInProductMain(),
}
