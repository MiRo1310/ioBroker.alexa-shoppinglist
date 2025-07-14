import type AlexaShoppinglist from '../main';
import type { ShoppingList } from '../types/types';
import { errorLogger } from './logging';
import { adapterIds } from './ids';

export const writeState = (
    adapter: AlexaShoppinglist,
    arrayActive: ShoppingList[],
    arrayInactive: ShoppingList[],
): void => {
    try {
        const { getAdapterIds } = adapterIds();

        adapter.setStateChanged(getAdapterIds.idListActive, JSON.stringify(arrayActive), true);
        adapter.setStateChanged(getAdapterIds.idListInActive, JSON.stringify(arrayInactive), true);
    } catch (e: any) {
        errorLogger('Error write state', e, adapter);
    }
};
