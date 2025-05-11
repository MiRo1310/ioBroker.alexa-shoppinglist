import type AlexaShoppinglist from '../main';
import type { AlexaBtns, ShoppingList } from '../types/types';
import { adapterIds } from './ids';

export const deleteOrSetAsCompleted = async (
    adapter: AlexaShoppinglist,
    array: ShoppingList[],
    status: AlexaBtns,
): Promise<void> => {
    const { getAlexaIds } = adapterIds();
    for (const { id } of array) {
        try {
            await adapter.setForeignStateAsync(getAlexaIds.idAlexaButtons(id, status), true, false);
        } catch (e: any) {
            adapter.log.error(e);
        }
    }
};
