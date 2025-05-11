import { firstLetterToUpperCase, sortList } from '../lib/utils';
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
    error: boolean;
}> => {
    let alexaListJson: ioBroker.State | null | undefined = {} as ioBroker.State;
    try {
        alexaListJson = await adapter.getForeignStateAsync(alexaState);

        if (alexaListJson?.val && typeof alexaListJson.val == 'string') {
            const alexaList = JSON.parse(alexaListJson.val) as AlexaList[];

            let jsonActive: ShoppingList[] = [];
            let jsonInactive: ShoppingList[] = [];

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
            return { jsonActive, jsonInactive, error: false };
        }
        return { jsonActive: [], jsonInactive: [], error: true };
    } catch (e: any) {
        adapter.log.error(e);
        return { jsonActive: [], jsonInactive: [], error: true };
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
