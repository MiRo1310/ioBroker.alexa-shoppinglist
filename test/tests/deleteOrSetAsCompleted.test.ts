import { deleteOrSetAsCompleted } from '@/app/deleteOrSetAsCompleted';
import { expect } from 'chai';
import sinon from 'sinon';
import type AlexaShoppinglist from '@/main';
import type { ShoppingList, AlexaBtns } from '@/types/types';
import { adapterIds } from '@/app/ids';

describe('deleteOrSetAsCompleted', () => {
    let mockAdapter: AlexaShoppinglist;
    let setForeignStateAsync: sinon.SinonStub;
    let logError: sinon.SinonStub;
    let mockArray: ShoppingList[];
    let mockStatus: AlexaBtns;

    beforeEach(() => {
        adapterIds().setIds.setAlexaInstanceValues(
            {
                adapter: 'adapter',
                instanz: '0',
                channel_history: 'history',
                listNameOriginal: 'SHOPPING_LIST',
                listName: 'shopping list',
            },
            'adapter.0',
            'alexa2.0.Lists.SHOPPING_LIST.json',
        );

        setForeignStateAsync = sinon.stub().resolves();
        logError = sinon.stub();

        mockAdapter = {
            setForeignStateAsync,
            log: { error: logError },
        } as unknown as AlexaShoppinglist;

        mockArray = [
            { id: 'item1', name: 'Item 1', ts: 1234567890, time: '2022-01-01 00:00:00' },
            { id: 'item2', name: 'Item 2', ts: 1234567891, time: '2022-01-01 00:00:01' },
            { id: 'item3', name: 'Item 3', ts: 1234567892, time: '2022-01-01 00:00:02' },
        ];

        mockStatus = 'completed';
    });

    it('calls setForeignStateAsync for each item', async () => {
        await deleteOrSetAsCompleted(mockAdapter, mockArray, mockStatus);

        expect(setForeignStateAsync).to.have.callCount(3);
        expect(setForeignStateAsync).to.have.been.calledWith(
            'alexa2.0.Lists.SHOPPING_LIST.items.item1.completed',
            true,
            false,
        );
        expect(setForeignStateAsync).to.have.been.calledWith(
            'alexa2.0.Lists.SHOPPING_LIST.items.item2.completed',
            true,
            false,
        );
        expect(setForeignStateAsync).to.have.been.calledWith(
            'alexa2.0.Lists.SHOPPING_LIST.items.item3.completed',
            true,
            false,
        );
    });

    it('handles #delete status', async () => {
        mockStatus = '#delete';

        await deleteOrSetAsCompleted(mockAdapter, mockArray, mockStatus);

        expect(setForeignStateAsync).to.have.callCount(3);
        expect(setForeignStateAsync).to.have.been.calledWith(
            'alexa2.0.Lists.SHOPPING_LIST.items.item1.#delete',
            true,
            false,
        );
    });

    it('handles empty array', async () => {
        const emptyArray: ShoppingList[] = [];

        await deleteOrSetAsCompleted(mockAdapter, emptyArray, mockStatus);

        expect(setForeignStateAsync).to.not.have.been.called;
    });

    it('handles single item array', async () => {
        const singleItemArray: ShoppingList[] = [
            { id: 'singleItem', name: 'Single Item', ts: 1234567890, time: '2022-01-01 00:00:00' },
        ];

        await deleteOrSetAsCompleted(mockAdapter, singleItemArray, mockStatus);

        expect(setForeignStateAsync).to.have.callCount(1);
        expect(setForeignStateAsync).to.have.been.calledWith(
            'alexa2.0.Lists.SHOPPING_LIST.items.singleItem.completed',
            true,
            false,
        );
    });

    it('logs and stops when an error occurs', async () => {
        const error = new Error('Test error');
        setForeignStateAsync.onFirstCall().rejects(error);

        await deleteOrSetAsCompleted(mockAdapter, mockArray, mockStatus);

        expect(setForeignStateAsync).to.have.callCount(1);
        expect(logError).to.have.been.calledWith('Error delete or set as completed');
    });
});
