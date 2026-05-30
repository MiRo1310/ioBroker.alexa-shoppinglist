import { expect } from 'chai';
import type AlexaShoppinglist from '@/main';
import { adapterIds, initAlexaInstanceValues } from '@/app/ids';

describe('ids.ts', () => {
    const mockAdapter = { instance: '0' } as unknown as AlexaShoppinglist;

    beforeEach(() => {
        adapterIds().setIds.setAlexaInstanceValues(
            {
                adapter: 'alexa-shoppinglist',
                instanz: '0',
                channel_history: '',
                listNameOriginal: '',
                listName: '',
            },
            'alexa-shoppinglist.0',
            'alexa-shoppinglist.0.shopping_list_id.json',
        );
    });

    it('parses and stores alexa instance values', () => {
        initAlexaInstanceValues(mockAdapter, 'alexa-shoppinglist.0.history.my_list');
        const ids = adapterIds();

        expect(ids.getAlexaIds.alexaInstanceValues.adapter).to.equal('alexa-shoppinglist');
        expect(ids.getAlexaIds.alexaInstanceValues.instanz).to.equal('0');
        expect(ids.getAlexaIds.alexaInstanceValues.channel_history).to.equal('history');
        expect(ids.getAlexaIds.alexaInstanceValues.listNameOriginal).to.equal('my_list');
        expect(ids.getAlexaIds.alexaInstanceValues.listName).to.equal('my  ');
    });

    it('exposes id groups and validators', () => {
        const ids = adapterIds();
        expect(ids).to.have.property('validateIds');
        expect(ids).to.have.property('getAdapterIds');
        expect(ids).to.have.property('getAlexaIds');
        expect(ids).to.have.property('setIds');

        expect(ids.validateIds.isAddPosition(ids.getAdapterIds.idAddPosition)).to.equal(true);
        expect(ids.validateIds.isAddPosition('different_id')).to.equal(false);
    });

    it('generates correct adapter ids for an instance', () => {
        const ids = adapterIds();
        ids.setIds.setAlexaInstanceValues(
            {
                adapter: 'test-adapter',
                instanz: '1',
                channel_history: 'channel',
                listNameOriginal: 'original_name',
                listName: 'original name',
            },
            'test-adapter.1',
            'test-shopping-list.json',
        );

        expect(ids.getAdapterIds.idPositionToShift).to.equal('test-adapter.1.position_to_shift');
        expect(ids.getAdapterIds.idToActiveList).to.equal('test-adapter.1.to_activ_list');
        expect(ids.getAdapterIds.idListActive).to.equal('test-adapter.1.list_activ');
        expect(ids.getAlexaIds.idShoppingListJson).to.equal('test-shopping-list.json');
        expect(ids.getAlexaIds.idShoppingList).to.equal('test-shopping-list');
    });

    it('generates alexa button ids from list + item', () => {
        const ids = adapterIds();
        ids.setIds.setAlexaInstanceValues(
            {} as any,
            'alexa-shoppinglist.0',
            'alexa-shoppinglist.0.shopping_list_id.json',
        );

        expect(ids.getAlexaIds.idAlexaButtons('item1', 'completed')).to.equal(
            'alexa-shoppinglist.0.shopping_list_id.items.item1.completed',
        );
    });
});
