import { AssigneesService } from '../../services/_Employee-manager/AssigneesService'

export const AssigneesModel = {
    getGroups: AssigneesService.getGroups,
    search: AssigneesService.search,
    save: AssigneesService.save,
}
