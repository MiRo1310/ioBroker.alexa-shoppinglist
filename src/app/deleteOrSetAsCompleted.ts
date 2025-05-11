import type AlexaShoppinglist from '../main';
import type { AlexaBtns, ShoppingList } from '../types/types';
import { adapterIds } from './ids';
import { errorLogger } from './logging';

export const deleteOrSetAsCompleted = async (
    adapter: AlexaShoppinglist,
    array: ShoppingList[],
    status: AlexaBtns,
): Promise<void> => {
    try {
        const { getAlexaIds } = adapterIds();
        for (const { id } of array) {
            await adapter.setForeignStateAsync(getAlexaIds.idAlexaButtons(id, status), true, false);
        }
    } catch (e: any) {
        errorLogger('Error delete or set as completed', e, adapter);
    }
};
