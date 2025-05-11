export interface Instance {
    adapter: string;
    instanz: string;
    channel_history: string;
    listId: string;
    listName: string; // TODO Check if this is needed
}

export type Lists = 'toInActiv' | 'toActiv' | 'delete';

export interface ShoppingList {
    id: string;
    name: string;
    ts: number;
    time: string;
    buttonmove?: string;
    buttondelete?: string;
    pos?: number;
}

export type SortByTime1Alpha2 = '1' | '2';

export interface AlexaList {
    completed: boolean;
    value: string;
    createdDateTime: string;
    id: string;
}

export interface OnMessageObj {
    command: string;
    message: { alexa: string };
    callback: any;
    from: string;
}

export interface AdapterIdsReturnType {
    validateIds: {
        isPositionToShift: (id: string) => boolean;
        isToActiveList: (id: string) => boolean;
        isToInActiveList: (id: string) => boolean;
        isDeleteActiveList: (id: string) => boolean;
        isDeleteInActiveList: (id: string) => boolean;
        isAddPosition: (id: string) => boolean;
    };
    getAdapterIds: {
        idToActiveList: string;
        idToInActiveList: string;
        idDeleteActiveList: string;
        idDeleteInActiveList: string;
        idAddPosition: string;
        idPositionToShift: string;
        idSortActiveList: string;
        idSortInActiveList: string;
        idShoppingList: string;
    };
    getAlexaIds: {
        idAlexaButtonDelete: (id: string) => string;
        idAlexaButtonCompleted: (id: string) => string;
    };
    setIds: {
        setShoppingListId: (id: string) => void;
    };
}
