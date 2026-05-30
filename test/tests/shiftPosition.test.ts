import { expect } from 'chai';
import sinon from 'sinon';
import type AlexaShoppinglist from '@/main';
import type { ShoppingList } from '@/types/types';
import { adapterIds } from '@/app/ids';
import { shiftPosition } from '@/app/shiftPosition';
import { timeout } from '@/app/timeout';

describe('shiftPosition', () => {
    let setForeignStateAsync: sinon.SinonStub;
    let setState: sinon.SinonStub;
    let setTimeoutStub: sinon.SinonStub;
    let logError: sinon.SinonStub;
    let mockAdapter: AlexaShoppinglist;

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
        setState = sinon.stub().resolves();
        logError = sinon.stub();
        setTimeoutStub = sinon.stub().callsFake((fn: (...args: unknown[]) => unknown) => {
            void fn();
            return 4711 as ioBroker.Timeout;
        });

        mockAdapter = {
            setForeignStateAsync,
            setState,
            setTimeout: setTimeoutStub,
            log: { error: logError },
        } as unknown as AlexaShoppinglist;
    });

    it('handles toActiv list type', async () => {
        const shoppingList: ShoppingList[] = [{ id: 'item1', name: 'Item 1', ts: 1, time: '10:00', pos: 2 }];

        await shiftPosition(mockAdapter, 2, shoppingList, 'toActiv');

        expect(setForeignStateAsync).to.have.been.calledWith(
            'alexa2.0.Lists.SHOPPING_LIST.items.item1.completed',
            false,
            false,
        );
        expect(setState).to.have.been.calledWith('adapter.0.position_to_shift', 0, true);
        expect(timeout().getTimeout(2)).to.equal(4711);
    });

    it('handles toInActiv list type', async () => {
        const shoppingList: ShoppingList[] = [{ id: 'item1', name: 'Item 1', ts: 1, time: '10:00', pos: 1 }];

        await shiftPosition(mockAdapter, 1, shoppingList, 'toInActiv');

        expect(setForeignStateAsync).to.have.been.calledWith(
            'alexa2.0.Lists.SHOPPING_LIST.items.item1.completed',
            true,
            false,
        );
        expect(setState).to.have.been.calledWith('adapter.0.position_to_shift', 0, true);
        expect(timeout().getTimeout(3)).to.equal(4711);
    });

    it('skips elements with non-matching position', async () => {
        const shoppingList: ShoppingList[] = [{ id: 'item1', name: 'Item 1', ts: 1, time: '10:00', pos: 1 }];

        await shiftPosition(mockAdapter, 5, shoppingList, 'toActiv');

        expect(setForeignStateAsync).to.not.have.been.called;
        expect(setState).to.not.have.been.called;
    });

    it('logs errors through errorLogger path', async () => {
        setForeignStateAsync.rejects(new Error('Test error'));
        const shoppingList: ShoppingList[] = [{ id: 'item1', name: 'Item 1', ts: 1, time: '10:00', pos: 1 }];

        await shiftPosition(mockAdapter, 1, shoppingList, 'toActiv');

        expect(logError).to.have.been.calledWith('Error shift position');
    });

    it('returns after first match in toActiv branch', async () => {
        const shoppingList: ShoppingList[] = [
            { id: 'item1', name: 'Item 1', ts: 1, time: '10:00', pos: 2 },
            { id: 'item2', name: 'Item 2', ts: 2, time: '10:00', pos: 2 },
        ];

        await shiftPosition(mockAdapter, 2, shoppingList, 'toActiv');

        expect(setForeignStateAsync).to.have.callCount(1);
    });
});
