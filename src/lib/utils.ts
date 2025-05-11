import type { ShoppingList, SortByTime1Alpha2 } from '../types/types';

export const firstLetterToUpperCase = (name: string): string => {
    const firstLetter = name.slice(0, 1); // Ersten Buchstaben selektieren
    const leftoverLetters = name.slice(1); // Restliche Buchstaben selektieren
    return firstLetter.toUpperCase() + leftoverLetters;
};

export const sortList = (array: ShoppingList[], sortBy: SortByTime1Alpha2): ShoppingList[] => {
    if (sortBy === '1') {
        return array.sort((a, b): number => {
            return a.ts - b.ts;
        });
    }
    if (sortBy === '2') {
        return array.sort((a, b) => {
            if (a.name > b.name) {
                return 1;
            } else if (a.name < b.name) {
                return -1;
            }
            return 0;
        });
    }
    return array;
};

/*
Is State and Ack === false and State typeof === type
 */
export const isStateValue = <T extends 'string' | 'boolean' | 'number'>(
    state: ioBroker.State,
    type: T,
): state is ioBroker.State & { val: T extends 'string' ? string : T extends 'boolean' ? boolean : number } =>
    state?.val !== undefined && typeof state.val === type && !state.ack;

export const getListId = (id: string): string => {
    const parts = id.split('.'); //alexa2.0.Lists.SHOPPING_LIST.json
    parts.pop();
    return parts.join('.'); //alexa2.0.Lists.SHOPPING_LIST
};
