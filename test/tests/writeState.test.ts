import { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import type AlexaShoppinglist from '@/main';
import type { ShoppingList } from '@/types/types';
import { writeState } from '@/app/writeState';
import { adapterIds } from '@/app/ids';

describe('writeState', () => {
    let mockAdapter: AlexaShoppinglist;
    let setStateChanged: sinon.SinonStub;
    let logError: sinon.SinonStub;
    let mockArrayActive: ShoppingList[];
    let mockArrayInactive: ShoppingList[];

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

        setStateChanged = sinon.stub();
        logError = sinon.stub();
        mockAdapter = {
            setStateChanged,
            log: {
                error: logError,
            },
            supportsFeature: sinon.stub().returns(false),
        } as unknown as AlexaShoppinglist;

        mockArrayActive = [
            { id: 'item1', name: 'Test Item 1', ts: Date.now(), time: new Date().toISOString() },
            { id: 'item2', name: 'Test Item 2', ts: Date.now(), time: new Date().toISOString() },
        ];

        mockArrayInactive = [
            { id: 'item3', name: 'Test Item 3', ts: Date.now(), time: new Date().toISOString() },
            { id: 'item4', name: 'Test Item 4', ts: Date.now(), time: new Date().toISOString() },
        ];
    });

    afterEach(() => {
        sinon.restore();
    });

    it('calls setStateChanged with correct parameters for active and inactive lists', () => {
        writeState(mockAdapter, mockArrayActive, mockArrayInactive);

        expect(setStateChanged).to.have.been.calledTwice;
        expect(setStateChanged).to.have.been.calledWith(
            'adapter.test.0.list_activ',
            JSON.stringify(mockArrayActive),
            true,
        );
        expect(setStateChanged).to.have.been.calledWith(
            'adapter.test.0.list_inactiv',
            JSON.stringify(mockArrayInactive),
            true,
        );
    });

    it('handles empty arrays', () => {
        const emptyActive: ShoppingList[] = [];
        const emptyInactive: ShoppingList[] = [];

        writeState(mockAdapter, emptyActive, emptyInactive);

        expect(setStateChanged).to.have.been.calledTwice;
        expect(setStateChanged).to.have.been.calledWith('adapter.test.0.list_activ', JSON.stringify(emptyActive), true);
        expect(setStateChanged).to.have.been.calledWith(
            'adapter.test.0.list_inactiv',
            JSON.stringify(emptyInactive),
            true,
        );
    });

    it('handles single item arrays', () => {
        const singleActive: ShoppingList[] = [
            { id: 'item1', name: 'Single Item', ts: Date.now(), time: new Date().toISOString() },
        ];
        const singleInactive: ShoppingList[] = [
            { id: 'item2', name: 'Single Inactive', ts: Date.now(), time: new Date().toISOString() },
        ];

        writeState(mockAdapter, singleActive, singleInactive);

        expect(setStateChanged).to.have.been.calledTwice;
        expect(setStateChanged).to.have.been.calledWith(
            'adapter.test.0.list_activ',
            JSON.stringify(singleActive),
            true,
        );
        expect(setStateChanged).to.have.been.calledWith(
            'adapter.test.0.list_inactiv',
            JSON.stringify(singleInactive),
            true,
        );
    });

    it('logs error when setStateChanged throws an error', () => {
        const error = new Error('Test error');
        setStateChanged.onFirstCall().throws(error);

        writeState(mockAdapter, mockArrayActive, mockArrayInactive);

        expect(setStateChanged).to.have.been.calledOnce;
        expect(logError).to.have.been.calledWith('Error write state');
        expect(logError).to.have.been.calledWith('Error message: Test error');
    });

    it('logs error when adapter id lookup fails', () => {
        const error = new Error('Adapter IDs error');
        const ids = adapterIds() as { getAdapterIds: unknown };
        const originalGetAdapterIds = ids.getAdapterIds;
        Object.defineProperty(ids, 'getAdapterIds', {
            configurable: true,
            get: () => {
                throw error;
            },
        });

        writeState(mockAdapter, mockArrayActive, mockArrayInactive);

        expect(logError).to.have.been.calledWith('Error write state');
        expect(logError).to.have.been.calledWith('Error message: Adapter IDs error');

        Object.defineProperty(ids, 'getAdapterIds', {
            configurable: true,
            value: originalGetAdapterIds,
            writable: true,
        });
    });
});
