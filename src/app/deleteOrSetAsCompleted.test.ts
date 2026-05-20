import { deleteOrSetAsCompleted } from './deleteOrSetAsCompleted';
import type AlexaShoppinglist from '../main';
import type { ShoppingList, AlexaBtns } from '../types/types';
import { adapterIds } from './ids';
import { errorLogger } from './logging';

// Mock the external dependencies
jest.mock('./ids', () => ({
    adapterIds: jest.fn(() => ({
        getAlexaIds: {
            idAlexaButtons: jest.fn((id: string, status: AlexaBtns) => `alexa.${id}.buttons.${status}`)
        }
    }))
}));

jest.mock('./logging', () => ({
    errorLogger: jest.fn()
}));

describe('deleteOrSetAsCompleted', () => {
    let mockAdapter: jest.Mocked<AlexaShoppinglist>;
    let mockArray: ShoppingList[];
    let mockStatus: AlexaBtns;

    beforeEach(() => {
        mockAdapter = {
            setForeignStateAsync: jest.fn().mockResolvedValue(undefined)
        } as unknown as jest.Mocked<AlexaShoppinglist>;

        mockArray = [
            { id: 'item1', name: 'Item 1', ts: 1234567890, time: '2022-01-01 00:00:00' },
            { id: 'item2', name: 'Item 2', ts: 1234567891, time: '2022-01-01 00:00:01' },
            { id: 'item3', name: 'Item 3', ts: 1234567892, time: '2022-01-01 00:00:02' }
        ];

        mockStatus = 'completed';

        // Reset mocks before each test
        jest.clearAllMocks();
    });

    it('should call setForeignStateAsync for each item in the array with correct parameters', async () => {
        await deleteOrSetAsCompleted(mockAdapter, mockArray, mockStatus);

        expect(mockAdapter.setForeignStateAsync).toHaveBeenCalledTimes(3);
        expect(mockAdapter.setForeignStateAsync).toHaveBeenCalledWith('alexa.item1.buttons.completed', true, false);
        expect(mockAdapter.setForeignStateAsync).toHaveBeenCalledWith('alexa.item2.buttons.completed', true, false);
        expect(mockAdapter.setForeignStateAsync).toHaveBeenCalledWith('alexa.item3.buttons.completed', true, false);
    });

    it('should handle different status values correctly', async () => {
        mockStatus = '#delete';

        await deleteOrSetAsCompleted(mockAdapter, mockArray, mockStatus);

        expect(mockAdapter.setForeignStateAsync).toHaveBeenCalledTimes(3);
        expect(mockAdapter.setForeignStateAsync).toHaveBeenCalledWith('alexa.item1.buttons.#delete', true, false);
        expect(mockAdapter.setForeignStateAsync).toHaveBeenCalledWith('alexa.item2.buttons.#delete', true, false);
        expect(mockAdapter.setForeignStateAsync).toHaveBeenCalledWith('alexa.item3.buttons.#delete', true, false);
    });

    it('should handle an empty array correctly', async () => {
        const emptyArray: ShoppingList[] = [];

        await deleteOrSetAsCompleted(mockAdapter, emptyArray, mockStatus);

        expect(mockAdapter.setForeignStateAsync).not.toHaveBeenCalled();
    });

    it('should handle a single item array correctly', async () => {
        const singleItemArray: ShoppingList[] = [{ id: 'singleItem', name: 'Single Item', ts: 1234567890, time: '2022-01-01 00:00:00' }];

        await deleteOrSetAsCompleted(mockAdapter, singleItemArray, mockStatus);

        expect(mockAdapter.setForeignStateAsync).toHaveBeenCalledTimes(1);
        expect(mockAdapter.setForeignStateAsync).toHaveBeenCalledWith('alexa.singleItem.buttons.completed', true, false);
    });

    it('should call errorLogger when setForeignStateAsync throws an error', async () => {
        const error = new Error('Test error');
        mockAdapter.setForeignStateAsync = jest.fn().mockRejectedValue(error) as jest.Mocked<AlexaShoppinglist>['setForeignStateAsync'];

        await deleteOrSetAsCompleted(mockAdapter, mockArray, mockStatus);

        expect(errorLogger).toHaveBeenCalledWith('Error delete or set as completed', error, mockAdapter);
    });

    it('should stop processing when an error occurs', async () => {
        const error = new Error('Test error');
        // Make the first call fail
        mockAdapter.setForeignStateAsync = jest
            .fn()
            .mockRejectedValueOnce(error) as jest.Mocked<AlexaShoppinglist>['setForeignStateAsync'];

        await deleteOrSetAsCompleted(mockAdapter, mockArray, mockStatus);

        // Since the function has a single try/catch block around the entire loop,
        // processing stops after the first error
        expect(mockAdapter.setForeignStateAsync).toHaveBeenCalledTimes(1);
        expect(errorLogger).toHaveBeenCalledWith('Error delete or set as completed', error, mockAdapter);
    });
});