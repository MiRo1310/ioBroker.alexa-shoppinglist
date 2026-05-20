import { initAlexaInstanceValues, adapterIds } from './ids';
import type AlexaShoppinglist from '../main';

interface MockAdapter {
    instance: string;
}

// Mock the getListId function from utils
jest.mock('../lib/utils', () => ({
    getListId: jest.fn((id: string) => {
        // Mock implementation: extract the last part after the last dot
        return id.split('.').pop() || '';
    }),
}));

describe('ids.ts', () => {
    const mockAdapter = {
        instance: '0',
    } as any as AlexaShoppinglist;

    beforeEach(() => {
        // Reset the global state before each test
        const ids = adapterIds();
        ids.setIds.setAlexaInstanceValues(
            { adapter: 'alexa-shoppinglist', instanz: '0' } as any,
            'alexa-shoppinglist.0',
            'shopping_list_id',
        );
    });

    describe('initAlexaInstanceValues', () => {
        it('should correctly parse the idShoppingList and set instance values', () => {
            const idShoppingList = 'alexa-shoppinglist.0.history.my_list';
            initAlexaInstanceValues(mockAdapter, idShoppingList);

            const ids = adapterIds();
            expect(ids.getAlexaIds.alexaInstanceValues.adapter).toBe('alexa-shoppinglist');
            expect(ids.getAlexaIds.alexaInstanceValues.instanz).toBe('0');
            expect(ids.getAlexaIds.alexaInstanceValues.channel_history).toBe('history');
            expect(ids.getAlexaIds.alexaInstanceValues.listNameOriginal).toBe('my_list');
            expect(ids.getAlexaIds.alexaInstanceValues.listName).toBe('my  '); // underscore becomes space (my list), then list becomes space (my  )
        });

        it('should handle idShoppingList with fewer parts', () => {
            const idShoppingList = 'alexa-shoppinglist.0';
            initAlexaInstanceValues(mockAdapter, idShoppingList);

            const ids = adapterIds();
            expect(ids.getAlexaIds.alexaInstanceValues.adapter).toBe('alexa-shoppinglist');
            expect(ids.getAlexaIds.alexaInstanceValues.instanz).toBe('0');
            expect(ids.getAlexaIds.alexaInstanceValues.channel_history).toBe('');
            expect(ids.getAlexaIds.alexaInstanceValues.listNameOriginal).toBe('');
            expect(ids.getAlexaIds.alexaInstanceValues.listName).toBe('');
        });

        it('should transform listName correctly', () => {
            const idShoppingList = 'alexa-shoppinglist.0.channel.my_list_name';
            initAlexaInstanceValues(mockAdapter, idShoppingList);

            const ids = adapterIds();
            expect(ids.getAlexaIds.alexaInstanceValues.listName).toBe('my  _name'); // first underscore becomes space (my list_name), then first occurrence of 'list' becomes space (my  _name)
        });

        it('should transform listName with "list" at the end', () => {
            const idShoppingList = 'alexa-shoppinglist.0.channel.grocerylist';
            initAlexaInstanceValues(mockAdapter, idShoppingList);

            const ids = adapterIds();
            expect(ids.getAlexaIds.alexaInstanceValues.listName).toBe('grocery '); // 'list' replaced with space
        });
    });

    describe('adapterIds', () => {
        it('should return the validateIds object', () => {
            const ids = adapterIds();
            expect(ids).toHaveProperty('validateIds');
            expect(ids).toHaveProperty('getAdapterIds');
            expect(ids).toHaveProperty('getAlexaIds');
            expect(ids).toHaveProperty('setIds');
        });

        describe('validateIds', () => {
            beforeEach(() => {
                const ids = adapterIds();
                ids.setIds.setAlexaInstanceValues(
                    { adapter: 'alexa-shoppinglist', instanz: '0' } as any,
                    'alexa-shoppinglist.0',
                    'shopping_list_id',
                );
            });

            it('should validate position to shift correctly', () => {
                const ids = adapterIds();
                const positionToShiftId = ids.getAdapterIds.idPositionToShift;

                expect(ids.validateIds.isPositionToShift(positionToShiftId)).toBe(true);
                expect(ids.validateIds.isPositionToShift('different_id')).toBe(false);
            });

            it('should validate to active list correctly', () => {
                const ids = adapterIds();
                const toActiveListId = ids.getAdapterIds.idToActiveList;

                expect(ids.validateIds.isToActiveList(toActiveListId)).toBe(true);
                expect(ids.validateIds.isToActiveList('different_id')).toBe(false);
            });

            it('should validate to inactive list correctly', () => {
                const ids = adapterIds();
                const toInActiveListId = ids.getAdapterIds.idToInActiveList;

                expect(ids.validateIds.isToInActiveList(toInActiveListId)).toBe(true);
                expect(ids.validateIds.isToInActiveList('different_id')).toBe(false);
            });

            it('should validate delete active list correctly', () => {
                const ids = adapterIds();
                const deleteActiveListId = ids.getAdapterIds.idDeleteActiveList;

                expect(ids.validateIds.isDeleteActiveList(deleteActiveListId)).toBe(true);
                expect(ids.validateIds.isDeleteActiveList('different_id')).toBe(false);
            });

            it('should validate delete inactive list correctly', () => {
                const ids = adapterIds();
                const deleteInActiveListId = ids.getAdapterIds.idDeleteInActiveList;

                expect(ids.validateIds.isDeleteInActiveList(deleteInActiveListId)).toBe(true);
                expect(ids.validateIds.isDeleteInActiveList('different_id')).toBe(false);
            });

            it('should validate add position correctly', () => {
                const ids = adapterIds();
                const addPositionId = ids.getAdapterIds.idAddPosition;

                expect(ids.validateIds.isAddPosition(addPositionId)).toBe(true);
                expect(ids.validateIds.isAddPosition('different_id')).toBe(false);
            });
        });

        describe('getAdapterIds', () => {
            beforeEach(() => {
                const ids = adapterIds();
                ids.setIds.setAlexaInstanceValues(
                    { adapter: 'alexa-shoppinglist', instanz: '0' } as any,
                    'alexa-shoppinglist.0',
                    'shopping_list_id',
                );
            });

            it('should generate correct adapter IDs', () => {
                const ids = adapterIds();
                
                expect(ids.getAdapterIds.idPositionToShift).toBe('alexa-shoppinglist.0.position_to_shift');
                expect(ids.getAdapterIds.idToActiveList).toBe('alexa-shoppinglist.0.to_activ_list');
                expect(ids.getAdapterIds.idToInActiveList).toBe('alexa-shoppinglist.0.to_inactiv_list');
                expect(ids.getAdapterIds.idDeleteActiveList).toBe('alexa-shoppinglist.0.delete_activ_list');
                expect(ids.getAdapterIds.idDeleteInActiveList).toBe('alexa-shoppinglist.0.delete_inactiv_list');
                expect(ids.getAdapterIds.idAddPosition).toBe('alexa-shoppinglist.0.add_position');
                expect(ids.getAdapterIds.idSortActiveList).toBe('alexa-shoppinglist.0.list_active_sort');
                expect(ids.getAdapterIds.idSortInActiveList).toBe('alexa-shoppinglist.0.list_inactive_sort');
                expect(ids.getAdapterIds.idListActive).toBe('alexa-shoppinglist.0.list_activ');
                expect(ids.getAdapterIds.idListInActive).toBe('alexa-shoppinglist.0.list_inactiv');
            });
        });

        describe('getAlexaIds', () => {
            it('should generate correct alexa button IDs', () => {
                const ids = adapterIds();
                ids.setIds.setAlexaInstanceValues(
                    { adapter: 'alexa-shoppinglist', instanz: '0' } as any,
                    'alexa-shoppinglist.0',
                    'alexa-shoppinglist.0.shopping_list_id',
                );

                const buttonId = ids.getAlexaIds.idAlexaButtons('item1', 'completed');
                expect(buttonId).toBe('shopping_list_id.items.item1.completed');
            });
        });

        describe('setIds', () => {
            it('should correctly set alexa instance values and update adapter IDs', () => {
                const ids = adapterIds();
                
                const mockInstance = {
                    adapter: 'test-adapter',
                    instanz: '1',
                    channel_history: 'channel',
                    listNameOriginal: 'original_name',
                    listName: 'original name',
                };

                ids.setIds.setAlexaInstanceValues(mockInstance, 'test-adapter.1', 'test-shopping-list');

                expect(ids.getAlexaIds.alexaInstanceValues).toEqual(mockInstance);
                expect(ids.getAlexaIds.idShoppingListJson).toBe('test-shopping-list');
                expect(ids.getAlexaIds.idShoppingList).toBe('test-shopping-list'); // mocked getListId returns the last part

                // Check that adapter IDs are updated with new instance ID
                expect(ids.getAdapterIds.idPositionToShift).toBe('test-adapter.1.position_to_shift');
                expect(ids.getAdapterIds.idToActiveList).toBe('test-adapter.1.to_activ_list');
            });

            it('should update all adapter IDs when setting new instance values', () => {
                const ids = adapterIds();
                
                ids.setIds.setAlexaInstanceValues({} as any, 'new-instance.2', 'new-list-id');
                
                expect(ids.getAdapterIds.idPositionToShift).toBe('new-instance.2.position_to_shift');
                expect(ids.getAdapterIds.idToActiveList).toBe('new-instance.2.to_activ_list');
                expect(ids.getAdapterIds.idToInActiveList).toBe('new-instance.2.to_inactiv_list');
                expect(ids.getAdapterIds.idDeleteActiveList).toBe('new-instance.2.delete_activ_list');
                expect(ids.getAdapterIds.idDeleteInActiveList).toBe('new-instance.2.delete_inactiv_list');
                expect(ids.getAdapterIds.idAddPosition).toBe('new-instance.2.add_position');
                expect(ids.getAdapterIds.idSortActiveList).toBe('new-instance.2.list_active_sort');
                expect(ids.getAdapterIds.idSortInActiveList).toBe('new-instance.2.list_inactive_sort');
                expect(ids.getAdapterIds.idListActive).toBe('new-instance.2.list_activ');
                expect(ids.getAdapterIds.idListInActive).toBe('new-instance.2.list_inactiv');
            });
        });
    });
});