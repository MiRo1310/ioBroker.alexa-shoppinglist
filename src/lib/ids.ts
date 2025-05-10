import type { Instance } from '../types/types';
import type AlexaShoppinglist from '../main';

export const getAlexaInstanceValues = (adapter: AlexaShoppinglist): Instance => {
    const { idShoppingList } = adapterIds(adapter).getIds;
    const alexaStateArray = idShoppingList.split('.');

    return {
        adapter: alexaStateArray[0],
        instanz: alexaStateArray[1] ?? '',
        channel_history: alexaStateArray[2] ?? '',
        list: alexaStateArray[3] ?? '',
        listName: alexaStateArray[3].replace('_', ' ').toLowerCase().replace('list', ' '),
    };
};

export function adapterIds(adapter: AlexaShoppinglist): {
    validateIds: {
        isPositionToShift: (id: string) => boolean;
        isToActiveList: (id: string) => boolean;
        isToInActiveList: (id: string) => boolean;
        isDeleteActiveList: (id: string) => boolean;
        isDeleteInActiveList: (id: string) => boolean;
        isAddPosition: (id: string) => boolean;
    };
    getIds: {
        idToActiveList: string;
        idToInActiveList: string;
        idDeleteActiveList: string;
        idDeleteInActiveList: string;
        idAddPosition: string;
        idPositionToShift: string;
        idSortActiveList: string;
        idSortInActiveList: string;
        idShoppingList: string;
    };
    setIds: {
        setShoppingListId: (id: string) => void;
    };
} {
    const alexaId = `alexa-shoppinglist.${adapter.instance}`;
    const validateIds = {
        validateIds: {
            isPositionToShift: (id: string): boolean => id === validateIds.getIds.idPositionToShift,
            isToActiveList: (id: string): boolean => id === validateIds.getIds.idToActiveList,
            isToInActiveList: (id: string): boolean => id === validateIds.getIds.idToInActiveList,
            isDeleteActiveList: (id: string): boolean => id === validateIds.getIds.idDeleteActiveList,
            isDeleteInActiveList: (id: string): boolean => id === validateIds.getIds.idDeleteInActiveList,
            isAddPosition: (id: string): boolean => id === validateIds.getIds.idAddPosition,
        },
        getIds: {
            idPositionToShift: `${alexaId}.position_to_shift`,
            idToActiveList: `${alexaId}.to_activ_list`,
            idToInActiveList: `${alexaId}.to_inactiv_list`,
            idDeleteActiveList: `${alexaId}.delete_activ_list`,
            idDeleteInActiveList: `${alexaId}.delete_inactiv_list`,
            idAddPosition: `${alexaId}.add_position`,
            idSortActiveList: `${alexaId}.sort_active_list`,
            idSortInActiveList: `${alexaId}.sort_inactive_list`,
            idShoppingList: '',
        },
        setIds: {
            setShoppingListId: (id: string) => (validateIds.getIds.idShoppingList = id),
        },
    };
    return validateIds;
}
