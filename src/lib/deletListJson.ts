import { deleteList } from './deleteList';
import type AlexaShoppinglist from '../main';

export const deleteListJsonInactive = async (
    adapter: AlexaShoppinglist,
    id: string,
    jsonInactive: [],
): Promise<void> => {
    adapter.log.info('Inactive List deleted');
    await deleteList(jsonInactive, 'delete');

    await adapter.setState(id, { ack: true });
};
