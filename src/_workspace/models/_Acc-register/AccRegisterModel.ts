import { AccRegisterService } from '../../services/_Acc-register/AccRegisterService'

export const AccRegisterModel = {
    completeRegistration: async (dataItem: any) => AccRegisterService.completeRegistration(dataItem),
}
