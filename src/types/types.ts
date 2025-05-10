export interface Instance {
    adapter: string;
    instanz: string;
    channel_history: string;
    list: string;
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
