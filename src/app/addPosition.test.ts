import type { ShoppingList } from '../types/types';
import type AlexaShoppinglist from '../main';
import { addPositionNumberAndBtn, addPosition } from './addPosition';

// Mock the adapterIds function
jest.mock('./ids', () => ({
    adapterIds: jest.fn(() => ({
        getAdapterIds: {
            idAddPosition: 'adapter.test.0.idAddPosition',
        },
        getAlexaIds: {
            idAlexaButtons: (id: string, suffix: string) => `alexa.button.${id}${suffix}`,
            alexaInstanceValues: {
                listName: 'Test List',
            },
        },
    })),
}));

// Mock the timeout function
jest.mock('./timeout', () => ({
    timeout: jest.fn(() => ({
        setTimeout: (delay: number, fn: () => void) => setTimeout(fn, delay),
    })),
}));

// Mock the errorLogger function
jest.mock('./logging', () => ({
    errorLogger: jest.fn(),
}));

describe('addPosition', () => {
    let mockAdapter: AlexaShoppinglist;

    beforeEach(() => {
        mockAdapter = {
            log: {
                info: jest.fn(),
            },
            getForeignStateAsync: jest.fn(),
            setForeignStateAsync: jest.fn(),
            setState: jest.fn(),
            setTimeout: jest.fn((fn, delay) => setTimeout(fn, delay)),
        } as unknown as AlexaShoppinglist;

        jest.clearAllMocks();
    });

    describe('addPositionNumberAndBtn', () => {
        it('should add position numbers and buttons to active list items', () => {
            const mockArray: ShoppingList[] = [
                { id: 'item1', name: 'Apple', pos: 0 } as ShoppingList,
                { id: 'item2', name: 'Banana', pos: 0 } as ShoppingList,
                { id: 'item3', name: 'Orange', pos: 0 } as ShoppingList,
            ];

            addPositionNumberAndBtn(mockAdapter as any, mockArray, 'active');

            // Check position numbers
            expect(mockArray[0].pos).toBe(1);
            expect(mockArray[1].pos).toBe(2);
            expect(mockArray[2].pos).toBe(3);

            // Check button properties
            expect(mockArray[0].buttonDeleteId).toBe('alexa.button.item1#delete');
            expect(mockArray[0].buttonCompletedId).toBe('alexa.button.item1completed');
            expect(mockArray[0].buttondelete).toContain('setOnDblClickCustomShop(\'alexa.button.item1#delete,true\')');
            expect(mockArray[0].buttonmove).toContain('setOnDblClickCustomShop(\'alexa.button.item1completed,true\')');

            expect(mockArray[1].buttonDeleteId).toBe('alexa.button.item2#delete');
            expect(mockArray[1].buttonCompletedId).toBe('alexa.button.item2completed');
            expect(mockArray[1].buttondelete).toContain('setOnDblClickCustomShop(\'alexa.button.item2#delete,true\')');
            expect(mockArray[1].buttonmove).toContain('setOnDblClickCustomShop(\'alexa.button.item2completed,true\')');
        });

        it('should add position numbers and buttons to inactive list items', () => {
            const mockArray: ShoppingList[] = [
                { id: 'item1', name: 'Apple', pos: 0 } as ShoppingList,
            ];

            addPositionNumberAndBtn(mockAdapter as any, mockArray, 'inactive');

            // Check position numbers
            expect(mockArray[0].pos).toBe(1);

            // Check button properties for inactive list (should move to active)
            expect(mockArray[0].buttonmove).toContain('setOnDblClickCustomShop(\'alexa.button.item1completed,false\')');
        });

        it('should handle empty array', () => {
            const mockArray: ShoppingList[] = [];

            addPositionNumberAndBtn(mockAdapter as any, mockArray, 'active');

            expect(mockArray).toEqual([]);
        });
    });

    describe('addPosition', () => {
        it('should add position to list when result exists', async () => {
            const mockResult = { val: 'test value' };
            (mockAdapter.getForeignStateAsync as jest.Mock).mockResolvedValue(mockResult);

            // Mock the setTimeout function with proper typing
            const setTimeoutSpy = jest.spyOn(mockAdapter, 'setTimeout').mockImplementation(((fn: (...args: any[]) => void, timeout: number, ...args: any[]) => {
                // Execute the function after the specified delay
                return setTimeout(fn, timeout, ...args) as any;
            }) as any);

            await addPosition(mockAdapter, 'Milk', 'test.id');

            expect(mockAdapter.getForeignStateAsync).toHaveBeenCalledWith('test.id', expect.any(Function));
            expect(mockAdapter.setForeignStateAsync).toHaveBeenCalledWith('test.id', 'Milk to Test List list', false);

            // Wait for the timeout to execute before checking setState
            await new Promise(resolve => setTimeout(resolve, 2100)); // Wait longer than 2000ms timeout

            expect(mockAdapter.setState).toHaveBeenCalledWith('adapter.test.0.idAddPosition', '', false);

            // Restore original setTimeout
            setTimeoutSpy.mockRestore();
        });

        it('should log info message when state is not found', async () => {
            (mockAdapter.getForeignStateAsync as jest.Mock).mockResolvedValue(null);

            await addPosition(mockAdapter, 'Milk', 'test.id');

            expect(mockAdapter.log.info).toHaveBeenCalledWith('State not found! Please check the ID!');
            expect(mockAdapter.setForeignStateAsync).not.toHaveBeenCalled();
        });

        it('should handle errors properly', async () => {
            jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress error logging during test
            const error = new Error('Test error');
            (mockAdapter.getForeignStateAsync as jest.Mock).mockRejectedValue(error);

            // Import errorLogger mock after the module is mocked
            const { errorLogger } = require('./logging');
            
            await addPosition(mockAdapter, 'Milk', 'test.id');

            expect(errorLogger).toHaveBeenCalledWith('Error add position', error, mockAdapter);
        });

        it('should set foreign state with correct parameters', async () => {
            const mockResult = { val: 'existing value' };
            (mockAdapter.getForeignStateAsync as jest.Mock).mockResolvedValue(mockResult);

            await addPosition(mockAdapter, 'Bread', 'shopping.list.id');

            expect(mockAdapter.setForeignStateAsync).toHaveBeenCalledWith(
                'shopping.list.id',
                'Bread to Test List list',
                false
            );
        });
    });
});