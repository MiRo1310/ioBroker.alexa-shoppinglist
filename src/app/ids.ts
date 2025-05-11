import type { AdapterIdsReturnType, Instance } from '../types/types';
import type AlexaShoppinglist from '../main';

export const getAlexaInstanceValues = (adapter: AlexaShoppinglist): Instance => {
    const { idShoppingList } = adapterIds(adapter).getAdapterIds;
    const alexaStateArray = idShoppingList.split('.');

    return {
        adapter: alexaStateArray[0],
        instanz: alexaStateArray[1] ?? '',
        channel_history: alexaStateArray[2] ?? '',
        listId: alexaStateArray[3] ?? '',
        listName: alexaStateArray[3].replace('_', ' ').toLowerCase().replace('list', ' '),
    };
};

export function adapterIds(adapter: AlexaShoppinglist): AdapterIdsReturnType {
    const alexaId = `alexa-shoppinglist.${adapter.instance}`;
    const { listId } = getAlexaInstanceValues(adapter);
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
            idPositionToShift: `${alexaId}.position_to_shift`,
            idToActiveList: `${alexaId}.to_activ_list`,
            idToInActiveList: `${alexaId}.to_inactiv_list`,
            idDeleteActiveList: `${alexaId}.delete_activ_list`,
            idDeleteInActiveList: `${alexaId}.delete_inactiv_list`,
            idAddPosition: `${alexaId}.add_position`,
            idSortActiveList: `${alexaId}.sort_active_list`,
            idSortInActiveList: `${alexaId}.sort_inactive_list`,
            idShoppingList: '', // Will be set on adapter start,
        },
        getAlexaIds: {
            idAlexaButtonDelete: (id: string) => `alexa2.0.Lists.${listId}.items.${id}.#delete`,
            idAlexaButtonCompleted: (id: string) => `alexa2.0.Lists.${listId}.items.${id}.completed`,
        },
        setIds: {
            setShoppingListId: (id: string) => (validateIds.getAdapterIds.idShoppingList = id),
        },
    };
    return validateIds;
}
