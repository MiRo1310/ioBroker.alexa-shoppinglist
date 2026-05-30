import { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import type AlexaShoppinglist from '@/main';
import type { ShoppingList } from '@/types/types';
import { addPosition, addPositionNumberAndBtn } from '@/app/addPosition';
import { adapterIds } from '@/app/ids';

describe('addPosition', () => {
    let mockAdapter: AlexaShoppinglist;
    let getForeignStateAsync: sinon.SinonStub;
    let setForeignStateAsync: sinon.SinonStub;
    let setState: sinon.SinonStub;
    let setTimeoutStub: sinon.SinonStub;
    let logInfo: sinon.SinonStub;
    let logError: sinon.SinonStub;

    beforeEach(() => {
        adapterIds().setIds.setAlexaInstanceValues(
            {
                adapter: 'adapter',
                instanz: '0',
                channel_history: 'history',
                listNameOriginal: 'Test_List',
                listName: 'Test List',
            },
            'adapter.test.0',
            'alexa2.0.Lists.Test_List.json',
        );

        getForeignStateAsync = sinon.stub();
        setForeignStateAsync = sinon.stub().resolves();
        setState = sinon.stub().resolves();
        setTimeoutStub = sinon.stub().callsFake((fn: (...args: unknown[]) => unknown) => {
            void fn();
            return 1 as ioBroker.Timeout;
        });
        logInfo = sinon.stub();
        logError = sinon.stub();

        mockAdapter = {
            log: {
                info: logInfo,
                error: logError,
            },
            getForeignStateAsync,
            setForeignStateAsync,
            setState,
            setTimeout: setTimeoutStub,
        } as unknown as AlexaShoppinglist;
    });

    it('adds positions and button IDs for active list', () => {
        const entries: ShoppingList[] = [
            { id: 'item1', name: 'Apple', ts: 1, time: 'a' },
            { id: 'item2', name: 'Banana', ts: 2, time: 'b' },
        ];

        addPositionNumberAndBtn(mockAdapter, entries, 'active');

        expect(entries[0].pos).to.equal(1);
        expect(entries[1].pos).to.equal(2);
        expect(entries[0].buttonDeleteId).to.equal('alexa2.0.Lists.Test_List.items.item1.#delete');
        expect(entries[0].buttonCompletedId).to.equal('alexa2.0.Lists.Test_List.items.item1.completed');
        expect(entries[0].buttonmove).to.contain('true');
    });

    it('adds inactive move button payload', () => {
        const entries: ShoppingList[] = [{ id: 'item1', name: 'Apple', ts: 1, time: 'a' }];

        addPositionNumberAndBtn(mockAdapter, entries, 'inactive');

        expect(entries[0].pos).to.equal(1);
        expect(entries[0].buttonmove).to.contain('false');
    });

    it('sets command state when source state exists', async () => {
        getForeignStateAsync.resolves({ val: 'exists' });

        await addPosition(mockAdapter, 'Milk', 'test.id');

        expect(getForeignStateAsync).to.have.been.calledWith('test.id', sinon.match.func);
        expect(setForeignStateAsync).to.have.been.calledWith('test.id', 'Milk to Test List list', false);
        expect(setState).to.have.been.calledWith('adapter.test.0.add_position', '', false);
    });

    it('logs info when source state is missing', async () => {
        getForeignStateAsync.resolves(null);

        await addPosition(mockAdapter, 'Milk', 'test.id');

        expect(logInfo).to.have.been.calledWith('State not found! Please check the ID!');
        expect(setForeignStateAsync).to.not.have.been.called;
    });

    it('logs errors via errorLogger path', async () => {
        getForeignStateAsync.rejects(new Error('test error'));

        await addPosition(mockAdapter, 'Milk', 'test.id');

        expect(logError).to.have.been.calledWith('Error add position');
    });
});
