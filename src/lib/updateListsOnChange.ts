import { firstLetterToUpperCase, sortList } from './utils';
import { addPositionNumberAndBtn } from './addPosition';
import { writeState } from './writeState';
import type AlexaShoppinglist from '../main';
import type { AlexaList, ShoppingList, SortByTime1Alpha2 } from '../types/types';

export const updateListsOnChange = async (
    adapter: AlexaShoppinglist,
    sortListActive: SortByTime1Alpha2,
    sortListInActive: SortByTime1Alpha2,
    alexaState: string,
): Promise<{
    jsonActive: ShoppingList[];
    jsonInactive: ShoppingList[];
}> => {
    let alexaListJson: ioBroker.State = {} as ioBroker.State;
    try {
        alexaListJson = await adapter.getForeignStateAsync(alexaState);

        if (alexaListJson?.val && typeof alexaListJson.val == 'string') {
            const alexaList = JSON.parse(alexaListJson.val) as AlexaList[];

            let jsonActive = [];
            let jsonInactive = [];

            for (const element of alexaList) {
                if (!element.completed) {
                    pushToList(jsonActive, element);
                } else {
                    pushToList(jsonInactive, element);
                }
            }

            jsonActive = sortList(jsonActive, sortListActive);
            jsonInactive = sortList(jsonInactive, sortListInActive);
            addPositionNumberAndBtn(adapter, jsonActive, 'active');
            addPositionNumberAndBtn(adapter, jsonInactive, 'inactive');
            writeState(adapter, jsonActive, jsonInactive);
            return { jsonActive, jsonInactive };
        }
    } catch (e) {
        adapter.log.error(e);
    }
};

function pushToList(list: ShoppingList[], element: AlexaList): ShoppingList[] {
    list.push({
        name: firstLetterToUpperCase(element.value),
        time: new Date(element.createdDateTime).toLocaleString(),
        ts: new Date(element.createdDateTime).getTime(),
        id: element.id,
    });
    return list;
}
