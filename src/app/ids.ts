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

export function adapterIds(): AdapterIdsReturnType {
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
            idPositionToShift: `${alexaShoppingListAdapterInstanceId}.position_to_shift`, //Number
            idToActiveList: `${alexaShoppingListAdapterInstanceId}.to_activ_list`, // Boolean
            idToInActiveList: `${alexaShoppingListAdapterInstanceId}.to_inactiv_list`, // Boolean
            idDeleteActiveList: `${alexaShoppingListAdapterInstanceId}.delete_activ_list`, // Boolean
            idDeleteInActiveList: `${alexaShoppingListAdapterInstanceId}.delete_inactiv_list`, // Boolean
            idAddPosition: `${alexaShoppingListAdapterInstanceId}.add_position`, //String
            idSortActiveList: `${alexaShoppingListAdapterInstanceId}.list_active_sort`, //Select
            idSortInActiveList: `${alexaShoppingListAdapterInstanceId}.list_inactive_sort`, //Select
            idListActive: `${alexaShoppingListAdapterInstanceId}.list_activ`, //Array
            idListInActive: `${alexaShoppingListAdapterInstanceId}.list_inactiv`, //Array
        },
        getAlexaIds: {
            idAlexaButtons: (id: string, btn: AlexaBtns) =>
                `${validateIds.getAlexaIds.idShoppingList}.items.${id}.${btn}`,
            alexaInstanceValues: {} as Instance,
            idShoppingListJson: '', // Will be set on adapter start,
            idShoppingList: '', // Will be set on adapter start,
        },
        setIds: {
            setAlexaInstanceValues: (obj: Instance, instanceId: string, idAlexa: string) => {
                alexaShoppingListAdapterInstanceId = instanceId;
                validateIds.getAlexaIds.alexaInstanceValues = obj;
                validateIds.getAlexaIds.idShoppingListJson = idAlexa;
                validateIds.getAlexaIds.idShoppingList = getListId(idAlexa);
            },
        },
    };
    return validateIds;
}
