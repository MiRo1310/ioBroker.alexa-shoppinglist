import type AlexaShoppinglist from '../main';
import type { ShoppingList } from '../types/types';

export const deleteOrSetAsCompleted = async (
    adapter: AlexaShoppinglist,
    array: ShoppingList[],
    status: 'completed' | 'delete',
    idAdapter: string,
): Promise<void> => {
    for (const { id } of array) {
        try {
            if (status === 'completed') {
                //TODO Id to ids.ts
                await adapter.setForeignStateAsync(`${idAdapter}.items.${id}.completed`, true, false);
                return;
            }

            if (status === 'delete') {
                await adapter.setForeignStateAsync(`${idAdapter}.items.${id}.#delete`, true, false);
            }
        } catch (e: any) {
            adapter.log.error(e);
        }
    }
};
