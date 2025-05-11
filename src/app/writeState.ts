import type AlexaShoppinglist from '../main';
import type { ShoppingList } from '../types/types';
import { errorLogger } from './logging';

export const writeState = (
    adapter: AlexaShoppinglist,
    arrayActive: ShoppingList[],
    arrayInactive: ShoppingList[],
): void => {
    try {
        // TODO Add list only with items and positions and ids from ids.ts

        adapter.setStateChanged(`alexa-shoppinglist.${adapter.instance}.list_activ`, JSON.stringify(arrayActive), true);
        adapter.setStateChanged(
            `alexa-shoppinglist.${adapter.instance}.list_inactiv`,
            JSON.stringify(arrayInactive),
            true,
        );
    } catch (e: any) {
        errorLogger('Error write state', e, adapter);
    }
};
