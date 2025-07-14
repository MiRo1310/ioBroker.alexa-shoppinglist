export interface Instance {
    adapter: string;
    instanz: string;
    channel_history: string;
    listNameOriginal: string;
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
    buttonCompletedId?: string;
    buttonDeleteId?: string;
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
        idListActive: string;
        idListInActive: string;
    };
    getAlexaIds: {
        idAlexaButtons: (id: string, btn: AlexaBtns) => string;
        alexaInstanceValues: Instance;
        idShoppingList: string;
        idShoppingListJson: string;
    };
    setIds: {
        setAlexaInstanceValues: (obj: Instance, alexa: string, idAlexa: string) => void;
    };
}

export type AlexaBtns = 'completed' | '#delete';
