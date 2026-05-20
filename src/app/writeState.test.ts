import { writeState } from './writeState';
import type AlexaShoppinglist from '../main';
import type { ShoppingList } from '../types/types';
import { errorLogger } from './logging';
import { adapterIds } from './ids';

// Mock the dependencies
jest.mock('./logging', () => ({
    errorLogger: jest.fn(),
}));

jest.mock('./ids', () => ({
    adapterIds: jest.fn(),
}));

describe('writeState', () => {
    let mockAdapter: AlexaShoppinglist;
    let mockArrayActive: ShoppingList[];
    let mockArrayInactive: ShoppingList[];
    let mockGetAdapterIds: { idListActive: string; idListInActive: string };

    beforeEach(() => {
        // Reset mocks
        (errorLogger as jest.Mock).mockClear();
        (adapterIds as jest.Mock).mockClear();

        // Setup mock adapter
        mockAdapter = {
            setStateChanged: jest.fn().mockResolvedValue(undefined),
        } as unknown as AlexaShoppinglist;

        // Setup test data
        mockArrayActive = [
            { id: 'item1', name: 'Test Item 1', ts: Date.now(), time: new Date().toISOString() },
            { id: 'item2', name: 'Test Item 2', ts: Date.now(), time: new Date().toISOString() },
        ];

        mockArrayInactive = [
            { id: 'item3', name: 'Test Item 3', ts: Date.now(), time: new Date().toISOString() },
            { id: 'item4', name: 'Test Item 4', ts: Date.now(), time: new Date().toISOString() },
        ];

        // Setup mock for adapterIds return value
        mockGetAdapterIds = {
            idListActive: 'active.state.id',
            idListInActive: 'inactive.state.id',
        };

        (adapterIds as jest.Mock).mockReturnValue({
            getAdapterIds: mockGetAdapterIds,
        });
    });

    it('should call setStateChanged with correct parameters for active and inactive lists', () => {
        writeState(mockAdapter, mockArrayActive, mockArrayInactive);

        // Verify setStateChanged was called twice
        expect(mockAdapter.setStateChanged).toHaveBeenCalledTimes(2);

        // Verify first call (active list)
        expect(mockAdapter.setStateChanged).toHaveBeenCalledWith(
            'active.state.id',
            JSON.stringify(mockArrayActive),
            true
        );

        // Verify second call (inactive list)
        expect(mockAdapter.setStateChanged).toHaveBeenCalledWith(
            'inactive.state.id',
            JSON.stringify(mockArrayInactive),
            true
        );
    });

    it('should handle empty arrays', () => {
        const emptyActive: ShoppingList[] = [];
        const emptyInactive: ShoppingList[] = [];

        writeState(mockAdapter, emptyActive, emptyInactive);

        expect(mockAdapter.setStateChanged).toHaveBeenCalledTimes(2);
        expect(mockAdapter.setStateChanged).toHaveBeenCalledWith(
            'active.state.id',
            JSON.stringify(emptyActive),
            true
        );
        expect(mockAdapter.setStateChanged).toHaveBeenCalledWith(
            'inactive.state.id',
            JSON.stringify(emptyInactive),
            true
        );
    });

    it('should handle single item arrays', () => {
        const singleActive: ShoppingList[] = [{ id: 'item1', name: 'Single Item', ts: Date.now(), time: new Date().toISOString() }];
        const singleInactive: ShoppingList[] = [{ id: 'item2', name: 'Single Inactive', ts: Date.now(), time: new Date().toISOString() }];

        writeState(mockAdapter, singleActive, singleInactive);

        expect(mockAdapter.setStateChanged).toHaveBeenCalledTimes(2);
        expect(mockAdapter.setStateChanged).toHaveBeenCalledWith(
            'active.state.id',
            JSON.stringify(singleActive),
            true
        );
        expect(mockAdapter.setStateChanged).toHaveBeenCalledWith(
            'inactive.state.id',
            JSON.stringify(singleInactive),
            true
        );
    });

    it('should call errorLogger when setStateChanged throws an error', () => {
        const error = new Error('Test error');
        (mockAdapter.setStateChanged as jest.Mock).mockImplementation(() => {
            throw error;
        });

        writeState(mockAdapter, mockArrayActive, mockArrayInactive);

        // Verify errorLogger was called
        expect(errorLogger).toHaveBeenCalledWith('Error write state', error, mockAdapter);
    });

    it('should call errorLogger when adapterIds throws an error', () => {
        const error = new Error('Adapter IDs error');
        (adapterIds as jest.Mock).mockImplementation(() => {
            throw error;
        });

        writeState(mockAdapter, mockArrayActive, mockArrayInactive);

        // Verify errorLogger was called
        expect(errorLogger).toHaveBeenCalledWith('Error write state', error, mockAdapter);
    });

    it('should call errorLogger when setStateChanged throws an error on first call and not execute second', () => {
        const error = new Error('Test error');
        (mockAdapter.setStateChanged as jest.Mock)
            .mockImplementationOnce(() => {
                throw error;
            }) // First call fails
            .mockImplementationOnce(() => {}); // Second call would succeed but won't be reached

        writeState(mockAdapter, mockArrayActive, mockArrayInactive);

        // Only first call happens, then error is caught
        expect(mockAdapter.setStateChanged).toHaveBeenCalledTimes(1);
        expect(errorLogger).toHaveBeenCalledWith('Error write state', error, mockAdapter);
    });
});