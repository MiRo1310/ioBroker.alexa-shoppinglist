import type AlexaShoppinglist from '../main';
import { timeout } from './timeout';
import type { Lists, ShoppingList } from '../types/types';
import { adapterIds } from './ids';

export const shiftPosition = async (
    adapter: AlexaShoppinglist,
    pos: number,
    array: ShoppingList[],
    list: Lists,
): Promise<void> => {
    const { getAlexaIds, getAdapterIds } = adapterIds();
    for (const element of array) {
        if (pos !== element.pos) {
            continue;
        }
        if (list === 'toActiv') {
            await adapter.setForeignStateAsync(getAlexaIds.idAlexaButtons(element.id, 'completed'), false, false);
            timeout().setTimeout(
                2,
                adapter.setTimeout(async () => {
                    await adapter.setState(getAdapterIds.idPositionToShift, 0, true);
                }, 1000),
            );
            return;
        }
        await adapter.setForeignStateAsync(getAlexaIds.idAlexaButtons(element.id, 'completed'), true, false);
        timeout().setTimeout(
            3,
            adapter.setTimeout(async () => {
                await adapter.setState(getAdapterIds.idPositionToShift, 0, true);
            }, 1000),
        );
    }
};
