import type { AdapterIdsReturnType, AlexaBtns, Instance } from '../types/types';
import type AlexaShoppinglist from '../main';
import { getListId } from '../lib/utils';

export const initAlexaInstanceValues = (adapter: AlexaShoppinglist, idShoppingList: string): void => {
    const alexaStateArray = idShoppingList.split('.');
    adapterIds().setIds.setAlexaInstanceValues(
        {
            adapter: alexaStateArray[0],
            instanz: alexaStateArray[1] ?? '',
            channel_history: alexaStateArray[2] ?? '',
            listNameOriginal: alexaStateArray[3] ?? '',
            listName: alexaStateArray[3].replace('_', ' ').toLowerCase().replace('list', ' '),
        },
        `alexa-shoppinglist.${adapter.instance}`,
        idShoppingList,
    );
};

let alexaShoppingListAdapterInstanceId = ``;
const validateIds = {
    validateIds: {
        isPositionToShift: (id: string): boolean => id === validateIds.getAdapterIds.idPositionToShift,
        isToActiveList: (id: string): boolean => id === validateIds.getAdapterIds.idToActiveList,
        isToInActiveList: (id: string): boolean => id === validateIds.getAdapterIds.idToInActiveList,
        isDeleteActiveList: (id: string): boolean => id === validateIds.getAdapterIds.idDeleteActiveList,
        isDeleteInActiveList: (id: string): boolean => id === validateIds.getAdapterIds.idDeleteInActiveList,
        isAddPosition: (id: string): boolean => id === validateIds.getAdapterIds.idAddPosition,
    },
    getAdapterIds: {
        idPositionToShift: `${alexaShoppingListAdapterInstanceId}.position_to_shift`,
        idToActiveList: `${alexaShoppingListAdapterInstanceId}.to_activ_list`,
        idToInActiveList: `${alexaShoppingListAdapterInstanceId}.to_inactiv_list`,
        idDeleteActiveList: `${alexaShoppingListAdapterInstanceId}.delete_activ_list`,
        idDeleteInActiveList: `${alexaShoppingListAdapterInstanceId}.delete_inactiv_list`,
        idAddPosition: `${alexaShoppingListAdapterInstanceId}.add_position`,
        idSortActiveList: `${alexaShoppingListAdapterInstanceId}.list_active_sort`,
        idSortInActiveList: `${alexaShoppingListAdapterInstanceId}.list_inactive_sort`,
        idListActive: `${alexaShoppingListAdapterInstanceId}.list_activ`,
        idListInActive: `${alexaShoppingListAdapterInstanceId}.list_inactiv`,
    },
    getAlexaIds: {
        idAlexaButtons: (id: string, btn: AlexaBtns) => `${validateIds.getAlexaIds.idShoppingList}.items.${id}.${btn}`,
        alexaInstanceValues: {} as Instance,
        idShoppingListJson: '',
        idShoppingList: '',
    },
    setIds: {
        setAlexaInstanceValues: (obj: Instance, instanceId: string, idAlexa: string) => {
            alexaShoppingListAdapterInstanceId = instanceId;
            validateIds.getAlexaIds.alexaInstanceValues = obj;
            validateIds.getAlexaIds.idShoppingListJson = idAlexa;
            validateIds.getAlexaIds.idShoppingList = getListId(idAlexa);
            // Adapter-IDs aktualisieren
            validateIds.getAdapterIds.idPositionToShift = `${alexaShoppingListAdapterInstanceId}.position_to_shift`;
            validateIds.getAdapterIds.idToActiveList = `${alexaShoppingListAdapterInstanceId}.to_activ_list`;
            validateIds.getAdapterIds.idToInActiveList = `${alexaShoppingListAdapterInstanceId}.to_inactiv_list`;
            validateIds.getAdapterIds.idDeleteActiveList = `${alexaShoppingListAdapterInstanceId}.delete_activ_list`;
            validateIds.getAdapterIds.idDeleteInActiveList = `${alexaShoppingListAdapterInstanceId}.delete_inactiv_list`;
            validateIds.getAdapterIds.idAddPosition = `${alexaShoppingListAdapterInstanceId}.add_position`;
            validateIds.getAdapterIds.idSortActiveList = `${alexaShoppingListAdapterInstanceId}.list_active_sort`;
            validateIds.getAdapterIds.idSortInActiveList = `${alexaShoppingListAdapterInstanceId}.list_inactive_sort`;
            validateIds.getAdapterIds.idListActive = `${alexaShoppingListAdapterInstanceId}.list_activ`;
            validateIds.getAdapterIds.idListInActive = `${alexaShoppingListAdapterInstanceId}.list_inactiv`;
        },
    },
};

export function adapterIds(): AdapterIdsReturnType {
    return validateIds;
}
