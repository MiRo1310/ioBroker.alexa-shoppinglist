import { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import type AlexaShoppinglist from '@/main';
import { updateListsOnChange } from '@/app/updateListsOnChange';
import { adapterIds } from '@/app/ids';

describe('updateListsOnChange', () => {
    let mockAdapter: AlexaShoppinglist;
    let getForeignStateAsync: sinon.SinonStub;
    let setStateChanged: sinon.SinonStub;
    let logError: sinon.SinonStub;

    beforeEach(() => {
        adapterIds().setIds.setAlexaInstanceValues(
            {
                adapter: 'alexa2',
                instanz: '0',
                channel_history: 'Lists',
                listNameOriginal: 'Test_List',
                listName: 'Test List',
            },
            'adapter.test.0',
            'alexa2.0.Lists.Test_List.json',
        );

        getForeignStateAsync = sinon.stub();
        setStateChanged = sinon.stub();
        logError = sinon.stub();

        mockAdapter = {
            getForeignStateAsync,
            setStateChanged,
            log: {
                error: logError,
            },
            supportsFeature: sinon.stub().returns(false),
        } as unknown as AlexaShoppinglist;
    });

    afterEach(() => {
        sinon.restore();
    });

    it('returns empty lists with error true when alexaState value is not a string', async () => {
        getForeignStateAsync.resolves({ val: null });

        const result = await updateListsOnChange(mockAdapter, '1', '1', 'test.state');

        expect(result).to.deep.equal({
            jsonActive: [],
            jsonInactive: [],
            error: true,
        });
    });

    it('returns empty lists with error true when alexaState value is an empty string', async () => {
        getForeignStateAsync.resolves({ val: '' });

        const result = await updateListsOnChange(mockAdapter, '1', '1', 'test.state');

        expect(result).to.deep.equal({
            jsonActive: [],
            jsonInactive: [],
            error: true,
        });
    });

    it('processes active and inactive lists correctly when valid alexaState value is provided', async () => {
        getForeignStateAsync.resolves({
            val: JSON.stringify([
                { id: 'item1', value: 'apples', createdDateTime: '2023-01-01T10:00:00Z', completed: false },
                { id: 'item2', value: 'bananas', createdDateTime: '2023-01-01T11:00:00Z', completed: true },
                { id: 'item3', value: 'oranges', createdDateTime: '2023-01-01T12:00:00Z', completed: false },
            ]),
        });

        const result = await updateListsOnChange(mockAdapter, '1', '1', 'test.state');

        expect(getForeignStateAsync).to.have.been.calledWith('test.state');
        expect(result.error).to.equal(false);
        expect(result.jsonActive).to.have.length(2);
        expect(result.jsonInactive).to.have.length(1);

        const activeItem1 = result.jsonActive.find(i => i.id === 'item1');
        const activeItem3 = result.jsonActive.find(i => i.id === 'item3');
        const inactiveItem2 = result.jsonInactive.find(i => i.id === 'item2');

        expect(activeItem1).to.include({
            name: 'Apples',
            time: new Date('2023-01-01T10:00:00Z').toLocaleString(),
            ts: new Date('2023-01-01T10:00:00Z').getTime(),
            id: 'item1',
        });
        expect(activeItem3).to.include({
            name: 'Oranges',
            time: new Date('2023-01-01T12:00:00Z').toLocaleString(),
            ts: new Date('2023-01-01T12:00:00Z').getTime(),
            id: 'item3',
        });
        expect(inactiveItem2).to.include({
            name: 'Bananas',
            time: new Date('2023-01-01T11:00:00Z').toLocaleString(),
            ts: new Date('2023-01-01T11:00:00Z').getTime(),
            id: 'item2',
        });

        expect(setStateChanged).to.have.been.calledTwice;
        expect(setStateChanged.firstCall.args[0]).to.equal('adapter.test.0.list_activ');
        expect(setStateChanged.secondCall.args[0]).to.equal('adapter.test.0.list_inactiv');
    });

    it('handles empty alexa list correctly', async () => {
        getForeignStateAsync.resolves({ val: JSON.stringify([]) });

        const result = await updateListsOnChange(mockAdapter, '1', '1', 'test.state');

        expect(result).to.deep.equal({
            jsonActive: [],
            jsonInactive: [],
            error: false,
        });
        expect(setStateChanged).to.have.been.calledTwice;
        expect(setStateChanged.firstCall.args[1]).to.equal('[]');
        expect(setStateChanged.secondCall.args[1]).to.equal('[]');
    });

    it('handles JSON parsing errors and returns an error result', async () => {
        getForeignStateAsync.resolves({ val: 'invalid json' });

        const result = await updateListsOnChange(mockAdapter, '1', '1', 'test.state');

        expect(result).to.deep.equal({
            jsonActive: [],
            jsonInactive: [],
            error: true,
        });
        expect(logError).to.have.been.calledWith('Error update list on change');
    });

    it('applies sorting based on the sort parameters', async () => {
        getForeignStateAsync.resolves({
            val: JSON.stringify([
                { id: 'item3', value: 'banana', createdDateTime: '2023-01-01T15:00:00Z', completed: false },
                { id: 'item1', value: 'zucchini', createdDateTime: '2023-01-01T10:00:00Z', completed: false },
                { id: 'item2', value: 'apple', createdDateTime: '2023-01-01T11:00:00Z', completed: false },
                { id: 'item4', value: 'pear', createdDateTime: '2023-01-01T12:00:00Z', completed: true },
                { id: 'item5', value: 'avocado', createdDateTime: '2023-01-01T13:00:00Z', completed: true },
            ]),
        });

        const result = await updateListsOnChange(mockAdapter, '1', '2', 'test.state');

        expect(result.error).to.equal(false);
        expect(result.jsonActive.map(i => i.id)).to.deep.equal(['item1', 'item2', 'item3']);
        expect(result.jsonInactive.map(i => i.name)).to.deep.equal(['Avocado', 'Pear']);
    });
});
