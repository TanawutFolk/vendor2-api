import { StatusMasterService } from '../../services/_status-master/StatusMasterService'
import type { StatusMasterSearchData } from '../../types/StatusMaster'

export const StatusMasterModel = {
  getStatusMasters: async (dataItem: StatusMasterSearchData = {}) =>
    StatusMasterService.getStatusMasters(dataItem),
}
