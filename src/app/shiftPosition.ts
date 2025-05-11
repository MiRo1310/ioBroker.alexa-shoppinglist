import type AlexaShoppinglist from '../main';
import { timeout } from './timeout';
import type { Lists, ShoppingList } from '../types/types';

export const shiftPosition = async (
    adapter: AlexaShoppinglist,
    pos: number,
    array: ShoppingList[],
    list: Lists,
    idAdapter: string,
): Promise<void> => {
    for (const element of array) {
        if (pos !== element.pos) {
            continue;
        }
        if (list === 'toActiv') {
            // TODO Id to ids.ts
            await adapter.setForeignStateAsync(`${idAdapter}.items.${element.id}.completed`, false, false);
            timeout().setTimeout(
                2,
                adapter.setTimeout(async () => {
                    await adapter.setState(`alexa-shoppinglist.${adapter.instance}.position_to_shift`, 0, true);
                }, 1000),
            );
            return;
        }
        await adapter.setForeignStateAsync(`${idAdapter}.items.${element.id}.completed`, true, false);
        timeout().setTimeout(
            3,
            adapter.setTimeout(async () => {
                await adapter.setState(`alexa-shoppinglist.${adapter.instance}.position_to_shift`, 0, true);
            }, 1000),
        );
    }
};
