import { shiftPosition } from './shiftPosition';
import type AlexaShoppinglist from '../main';
import type { Lists, ShoppingList } from '../types/types';
import { adapterIds } from './ids';
import { errorLogger } from './logging';

// Mock the dependencies
jest.mock('./ids', () => ({
    adapterIds: jest.fn(),
}));

jest.mock('./timeout', () => ({
    timeout: jest.fn(),
}));

jest.mock('./logging', () => ({
    errorLogger: jest.fn(),
}));

describe('shiftPosition', () => {
    let mockAdapter: jest.Mocked<AlexaShoppinglist>;
    let mockAdapterIds: { getAlexaIds: any; getAdapterIds: any };
    let mockTimeout: { setTimeout: jest.Mock };

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Create mock adapter
        mockAdapter = {
            setForeignStateAsync: jest.fn(),
            setState: jest.fn(),
            setTimeout: jest.fn().mockImplementation((fn, delay) => {
                // Return a number like ioBroker does for timeout IDs
                return setTimeout(fn, delay) as any;
            }),
        } as unknown as jest.Mocked<AlexaShoppinglist>;

        // Create mock adapterIds return value
        mockAdapterIds = {
            getAlexaIds: {
                idAlexaButtons: jest.fn(),
            },
            getAdapterIds: {
                idPositionToShift: 'test.positionToShift',
            },
        };

        // Create mock timeout
        mockTimeout = {
            setTimeout: jest.fn(),
        };

        // Mock the adapterIds function
        (adapterIds as jest.Mock).mockReturnValue(mockAdapterIds);

        // Mock the timeout function
        (require('./timeout').timeout as jest.Mock).mockReturnValue(mockTimeout);
    });

    it('should handle toActiv list type correctly', async () => {
        const pos = 2;
        const shoppingList: ShoppingList[] = [
            { id: 'item1', name: 'Item 1', ts: 1234567890, time: '10:00' },
            { id: 'item2', name: 'Item 2', ts: 1234567890, time: '10:00', pos: 2 },
            { id: 'item3', name: 'Item 3', ts: 1234567890, time: '10:00' },
        ];
        const list: Lists = 'toActiv';

        // Mock idAlexaButtons to return a specific ID
        (mockAdapterIds.getAlexaIds.idAlexaButtons as jest.Mock).mockReturnValue('test.completedButtonId');

        await shiftPosition(mockAdapter, pos, shoppingList, list);

        // Verify that setForeignStateAsync was called with correct parameters for toActiv case
        expect(mockAdapter.setForeignStateAsync).toHaveBeenCalledWith('test.completedButtonId', false, false);

        // Verify that setTimeout was called after the delay
        expect(mockAdapter.setTimeout).toHaveBeenCalledWith(expect.any(Function), 1000);
    });

    it('should handle toInActiv list type correctly', async () => {
        const pos = 1;
        const shoppingList: ShoppingList[] = [
            { id: 'item1', name: 'Item 1', ts: 1234567890, time: '10:00', pos: 1 },
            { id: 'item2', name: 'Item 2', ts: 1234567890, time: '10:00', pos: 2 },
        ];
        const list: Lists = 'toInActiv';

        // Mock idAlexaButtons to return a specific ID
        (mockAdapterIds.getAlexaIds.idAlexaButtons as jest.Mock).mockReturnValue('test.completedButtonId');

        await shiftPosition(mockAdapter, pos, shoppingList, list);

        // Verify that setForeignStateAsync was called with true for toInActiv case
        expect(mockAdapter.setForeignStateAsync).toHaveBeenCalledWith('test.completedButtonId', true, false);

        // Verify that setTimeout was called after the delay
        expect(mockAdapter.setTimeout).toHaveBeenCalledWith(expect.any(Function), 1000);
    });

    it('should handle delete list type correctly', async () => {
        const pos = 1;
        const shoppingList: ShoppingList[] = [
            { id: 'item1', name: 'Item 1', ts: 1234567890, time: '10:00', pos: 1 },
        ];
        const list: Lists = 'delete';

        // Mock idAlexaButtons to return a specific ID
        (mockAdapterIds.getAlexaIds.idAlexaButtons as jest.Mock).mockReturnValue('test.completedButtonId');

        await shiftPosition(mockAdapter, pos, shoppingList, list);

        // Verify that setForeignStateAsync was called with true for delete case
        expect(mockAdapter.setForeignStateAsync).toHaveBeenCalledWith('test.completedButtonId', true, false);

        // Verify that setTimeout was called after the delay
        expect(mockAdapter.setTimeout).toHaveBeenCalledWith(expect.any(Function), 1000);
    });

    it('should skip elements that do not match the position', async () => {
        const pos = 5;
        const shoppingList: ShoppingList[] = [
            { id: 'item1', name: 'Item 1', ts: 1234567890, time: '10:00', pos: 1 },
            { id: 'item2', name: 'Item 2', ts: 1234567890, time: '10:00', pos: 2 },
            { id: 'item3', name: 'Item 3', ts: 1234567890, time: '10:00', pos: 3 },
        ];
        const list: Lists = 'toActiv';

        await shiftPosition(mockAdapter, pos, shoppingList, list);

        // No calls should be made since no element has pos = 5
        expect(mockAdapter.setForeignStateAsync).not.toHaveBeenCalled();
        expect(mockAdapter.setTimeout).not.toHaveBeenCalled();
    });

    it('should handle multiple elements with same position correctly', async () => {
        const pos = 2;
        const shoppingList: ShoppingList[] = [
            { id: 'item1', name: 'Item 1', ts: 1234567890, time: '10:00', pos: 1 },
            { id: 'item2', name: 'Item 2', ts: 1234567890, time: '10:00', pos: 2 }, // Same position as item2
            { id: 'item3', name: 'Item 3', ts: 1234567890, time: '10:00', pos: 2 }, // Same position as item2
            { id: 'item4', name: 'Item 4', ts: 1234567890, time: '10:00', pos: 3 },
        ];
        const list: Lists = 'toInActiv'; // Note: toInActiv does not return early, so multiple elements will be processed

        // Mock idAlexaButtons to return different IDs for different items
        (mockAdapterIds.getAlexaIds.idAlexaButtons as jest.Mock)
            .mockReturnValueOnce('test.completedButtonId1')
            .mockReturnValueOnce('test.completedButtonId2');

        await shiftPosition(mockAdapter, pos, shoppingList, list);

        // Should handle both items with pos = 2 (toInActiv case doesn't return early)
        expect(mockAdapter.setForeignStateAsync).toHaveBeenCalledTimes(2);
        expect(mockAdapter.setForeignStateAsync).toHaveBeenNthCalledWith(1, 'test.completedButtonId1', true, false);
        expect(mockAdapter.setForeignStateAsync).toHaveBeenNthCalledWith(2, 'test.completedButtonId2', true, false);
    });

    it('should handle toActiv list with multiple matching positions', async () => {
        const pos = 1;
        const shoppingList: ShoppingList[] = [
            { id: 'item1', name: 'Item 1', ts: 1234567890, time: '10:00', pos: 1 },
            { id: 'item2', name: 'Item 2', ts: 1234567890, time: '10:00', pos: 1 }, // Same position as item1
            { id: 'item3', name: 'Item 3', ts: 1234567890, time: '10:00', pos: 3 },
        ];
        const list: Lists = 'toActiv';

        // Mock idAlexaButtons to return different IDs for different items
        (mockAdapterIds.getAlexaIds.idAlexaButtons as jest.Mock)
            .mockReturnValueOnce('test.completedButtonId1');

        await shiftPosition(mockAdapter, pos, shoppingList, list);

        // Should handle only the first item with pos = 1, setting to false for toActiv, then return
        expect(mockAdapter.setForeignStateAsync).toHaveBeenCalledTimes(1);
        expect(mockAdapter.setForeignStateAsync).toHaveBeenCalledWith('test.completedButtonId1', false, false);
    });

    it('should early return after processing first matching element in toActiv case', async () => {
        const pos = 2;
        const shoppingList: ShoppingList[] = [
            { id: 'item1', name: 'Item 1', ts: 1234567890, time: '10:00', pos: 2 },
            { id: 'item2', name: 'Item 2', ts: 1234567890, time: '10:00', pos: 2 }, // This should not be processed because of early return
        ];
        const list: Lists = 'toActiv';

        // Mock idAlexaButtons
        (mockAdapterIds.getAlexaIds.idAlexaButtons as jest.Mock).mockReturnValue('test.completedButtonId');

        await shiftPosition(mockAdapter, pos, shoppingList, list);

        // Should only process the first matching element due to return statement
        expect(mockAdapter.setForeignStateAsync).toHaveBeenCalledTimes(1);
    });

    it('should handle errors gracefully', async () => {
        const pos = 1;
        const shoppingList: ShoppingList[] = [
            { id: 'item1', name: 'Item 1', ts: 1234567890, time: '10:00', pos: 1 },
        ];
        const list: Lists = 'toActiv';

        // Mock an error in setForeignStateAsync
        mockAdapter.setForeignStateAsync.mockRejectedValue(new Error('Test error'));

        await shiftPosition(mockAdapter, pos, shoppingList, list);

        // Should log the error
        expect(errorLogger).toHaveBeenCalledWith('Error shift position', expect.any(Error), mockAdapter);
    });

    it('should call timeout.setTimeout with correct parameters', async () => {
        const pos = 1;
        const shoppingList: ShoppingList[] = [
            { id: 'item1', name: 'Item 1', ts: 1234567890, time: '10:00', pos: 1 },
        ];
        const list: Lists = 'toActiv';

        // Mock idAlexaButtons to return a specific ID
        (mockAdapterIds.getAlexaIds.idAlexaButtons as jest.Mock).mockReturnValue('test.completedButtonId');

        await shiftPosition(mockAdapter, pos, shoppingList, list);

        // For toActiv case, timeout setTimeout should be called with 2 as first parameter
        expect(mockTimeout.setTimeout).toHaveBeenCalledWith(2, expect.anything());
    });

    it('should call timeout.setTimeout with correct parameters for non-toActiv case', async () => {
        const pos = 1;
        const shoppingList: ShoppingList[] = [
            { id: 'item1', name: 'Item 1', ts: 1234567890, time: '10:00', pos: 1 },
        ];
        const list: Lists = 'toInActiv';

        // Mock idAlexaButtons to return a specific ID
        (mockAdapterIds.getAlexaIds.idAlexaButtons as jest.Mock).mockReturnValue('test.completedButtonId');

        await shiftPosition(mockAdapter, pos, shoppingList, list);

        // For non-toInActiv case, timeout setTimeout should be called with 3 as first parameter
        expect(mockTimeout.setTimeout).toHaveBeenCalledWith(3, expect.anything());
    });
});