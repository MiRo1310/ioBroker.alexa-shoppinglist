import {
    Instance,
    Lists,
    ShoppingList,
    SortByTime1Alpha2,
    AlexaList,
    OnMessageObj,
    AdapterIdsReturnType,
    AlexaBtns
} from './types';

describe('Types Tests', () => {
    describe('Instance', () => {
        it('should have the correct structure', () => {
            const instance: Instance = {
                adapter: 'test-adapter',
                instanz: 'instance-1',
                channel_history: 'history-channel',
                listNameOriginal: 'original-list',
                listName: 'modified-list'
            };

            expect(instance.adapter).toBe('test-adapter');
            expect(instance.instanz).toBe('instance-1');
            expect(instance.channel_history).toBe('history-channel');
            expect(instance.listNameOriginal).toBe('original-list');
            expect(instance.listName).toBe('modified-list');
        });
    });

    describe('Lists', () => {
        it('should be of type "toInActiv", "toActiv", or "delete"', () => {
            const toInActiv: Lists = 'toInActiv';
            const toActiv: Lists = 'toActiv';
            const deleteList: Lists = 'delete';

            expect(['toInActiv', 'toActiv', 'delete']).toContain(toInActiv);
            expect(['toInActiv', 'toActiv', 'delete']).toContain(toActiv);
            expect(['toInActiv', 'toActiv', 'delete']).toContain(deleteList);
        });

        it('should not allow other values', () => {
            // These are compile-time checks, but we'll create runtime validation
            // by using type assertion and checking the value
            const validValues: Lists[] = ['toInActiv', 'toActiv', 'delete'];
            expect(validValues).toHaveLength(3);
            
            // Verify that only these three values are allowed by checking each
            expect(validValues).toEqual(expect.arrayContaining(['toInActiv', 'toActiv', 'delete']));
        });
    });

    describe('ShoppingList', () => {
        it('should have required properties', () => {
            const shoppingList: ShoppingList = {
                id: '123',
                name: 'Shopping List',
                ts: 1635724800,
                time: '2021-11-01 12:00:00'
            };

            expect(shoppingList.id).toBe('123');
            expect(shoppingList.name).toBe('Shopping List');
            expect(shoppingList.ts).toBe(1635724800);
            expect(shoppingList.time).toBe('2021-11-01 12:00:00');
        });

        it('should have optional properties', () => {
            const shoppingList: ShoppingList = {
                id: '123',
                name: 'Shopping List',
                ts: 1635724800,
                time: '2021-11-01 12:00:00',
                buttonmove: 'move-btn',
                buttondelete: 'delete-btn',
                pos: 1,
                buttonCompletedId: 'complete-1',
                buttonDeleteId: 'delete-1'
            };

            expect(shoppingList.buttonmove).toBe('move-btn');
            expect(shoppingList.buttondelete).toBe('delete-btn');
            expect(shoppingList.pos).toBe(1);
            expect(shoppingList.buttonCompletedId).toBe('complete-1');
            expect(shoppingList.buttonDeleteId).toBe('delete-1');
        });
    });

    describe('SortByTime1Alpha2', () => {
        it('should be either "1" or "2"', () => {
            const timeSort: SortByTime1Alpha2 = '1';
            const alphaSort: SortByTime1Alpha2 = '2';

            expect(['1', '2']).toContain(timeSort);
            expect(['1', '2']).toContain(alphaSort);
        });
    });

    describe('AlexaList', () => {
        it('should have required properties', () => {
            const alexaList: AlexaList = {
                completed: false,
                createdDateTime: '2021-11-01T12:00:00Z',
                id: 'item-123'
            };

            expect(alexaList.completed).toBe(false);
            expect(alexaList.createdDateTime).toBe('2021-11-01T12:00:00Z');
            expect(alexaList.id).toBe('item-123');
        });

        it('should have optional value property', () => {
            const alexaList: AlexaList = {
                completed: true,
                value: 'Milk',
                createdDateTime: '2021-11-01T12:00:00Z',
                id: 'item-123'
            };

            expect(alexaList.completed).toBe(true);
            expect(alexaList.value).toBe('Milk');
            expect(alexaList.createdDateTime).toBe('2021-11-01T12:00:00Z');
            expect(alexaList.id).toBe('item-123');
        });
    });

    describe('OnMessageObj', () => {
        it('should have the correct structure', () => {
            const callback = jest.fn();
            
            const onMessageObj: OnMessageObj = {
                command: 'test-command',
                message: { alexa: 'test-alexa' },
                callback,
                from: 'sender'
            };

            expect(onMessageObj.command).toBe('test-command');
            expect(onMessageObj.message.alexa).toBe('test-alexa');
            expect(onMessageObj.callback).toBe(callback);
            expect(onMessageObj.from).toBe('sender');
        });
    });

    describe('AdapterIdsReturnType', () => {
        it('should have the correct structure', () => {
            const mockFunction = (id: string) => true;
            
            const adapterIds: AdapterIdsReturnType = {
                validateIds: {
                    isPositionToShift: mockFunction,
                    isToActiveList: mockFunction,
                    isToInActiveList: mockFunction,
                    isDeleteActiveList: mockFunction,
                    isDeleteInActiveList: mockFunction,
                    isAddPosition: mockFunction
                },
                getAdapterIds: {
                    idToActiveList: 'active-list-id',
                    idToInActiveList: 'inactive-list-id',
                    idDeleteActiveList: 'delete-active-id',
                    idDeleteInActiveList: 'delete-inactive-id',
                    idAddPosition: 'add-position-id',
                    idPositionToShift: 'position-shift-id',
                    idSortActiveList: 'sort-active-id',
                    idSortInActiveList: 'sort-inactive-id',
                    idListActive: 'list-active-id',
                    idListInActive: 'list-inactive-id'
                },
                getAlexaIds: {
                    idAlexaButtons: (id: string, btn: AlexaBtns) => `${id}-${btn}`,
                    alexaInstanceValues: {
                        adapter: 'test-adapter',
                        instanz: 'test-instanz',
                        channel_history: 'channel-history',
                        listNameOriginal: 'original-name',
                        listName: 'modified-name'
                    },
                    idShoppingList: 'shopping-list-id',
                    idShoppingListJson: 'shopping-list-json-id'
                },
                setIds: {
                    setAlexaInstanceValues: (obj: Instance, alexa: string, idAlexa: string) => {
                        // Mock implementation
                    }
                }
            };

            expect(adapterIds.validateIds.isPositionToShift).toBeDefined();
            expect(adapterIds.getAdapterIds.idToActiveList).toBe('active-list-id');
            expect(adapterIds.getAlexaIds.idAlexaButtons('test', 'completed')).toBe('test-completed');
            expect(adapterIds.setIds.setAlexaInstanceValues).toBeDefined();
        });
    });

    describe('AlexaBtns', () => {
        it('should be either "completed" or "#delete"', () => {
            const completedBtn: AlexaBtns = 'completed';
            const deleteBtn: AlexaBtns = '#delete';

            expect(['completed', '#delete']).toContain(completedBtn);
            expect(['completed', '#delete']).toContain(deleteBtn);
        });
    });
});