import type AlexaShoppinglist from '../main';
import type { OnMessageObj } from '../types/types';
import { getShoppingLists } from './getShoppingLists';
import { errorLogger } from './logging';

// Mock the errorLogger function
jest.mock('./logging', () => ({
    errorLogger: jest.fn(),
}));

// Define the mocked adapter type
type MockAdapter = jest.Mocked<AlexaShoppinglist>;

describe('getShoppingLists', () => {
    let mockAdapter: MockAdapter;
    let mockObj: OnMessageObj;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Create mock adapter
        mockAdapter = {
            getObjectViewAsync: jest.fn(),
            log: {
                debug: jest.fn(),
            },
            sendTo: jest.fn(),
        } as unknown as MockAdapter;

        // Create mock obj
        mockObj = {
            from: 'test.0',
            command: 'getShoppingLists',
            message: {
                alexa: 'alexa-test',
            },
            callback: 'callback-id',
        } as OnMessageObj;
    });

    it('should return empty array when no lists are found', async () => {
        // Mock empty result from getObjectViewAsync
        (mockAdapter.getObjectViewAsync as jest.Mock).mockResolvedValue({
            rows: [],
        });

        await getShoppingLists(mockAdapter, mockObj);

        // Verify that getObjectViewAsync was called with correct parameters
        expect(mockAdapter.getObjectViewAsync).toHaveBeenCalledWith(
            'system',
            'channel',
            {
                startkey: 'alexa-test.Lists.',
                endkey: 'alexa-test.Lists.\u9999',
            }
        );

        // Verify that sendTo was called with empty array
        expect(mockAdapter.sendTo).toHaveBeenCalledWith(
            'test.0',
            'getShoppingLists',
            [],
            'callback-id'
        );
    });

    it('should return formatted list when shopping lists are found', async () => {
        // Mock result with shopping lists (ID must have 4 parts to pass the length === 4 check)
        const mockRows = [
            {
                value: {
                    common: {
                        name: 'Grocery List',
                    },
                },
                id: 'alexa-test.Lists.Grocery.Items', // 4 parts: alexa-test, Lists, Grocery, Items
            },
        ];

        (mockAdapter.getObjectViewAsync as jest.Mock).mockResolvedValue({
            rows: mockRows,
        });

        await getShoppingLists(mockAdapter, mockObj);

        // Verify that sendTo was called with formatted list
        expect(mockAdapter.sendTo).toHaveBeenCalledWith(
            'test.0',
            'getShoppingLists',
            [
                {
                    label: '"Grocery List"',
                    value: 'alexa-test.Lists.Grocery.Items.json',
                },
            ],
            'callback-id'
        );
    });

    it('should handle multiple shopping lists correctly', async () => {
        // Mock result with multiple shopping lists (IDs must have 4 parts to pass the length === 4 check)
        const mockRows = [
            {
                value: {
                    common: {
                        name: 'Grocery List',
                    },
                },
                id: 'alexa-test.Lists.Grocery.Items', // 4 parts: alexa-test, Lists, Grocery, Items
            },
            {
                value: {
                    common: {
                        name: 'To Do List',
                    },
                },
                id: 'alexa-test.Lists.ToDo.Items', // 4 parts: alexa-test, Lists, ToDo, Items
            },
        ];

        (mockAdapter.getObjectViewAsync as jest.Mock).mockResolvedValue({
            rows: mockRows,
        });

        await getShoppingLists(mockAdapter, mockObj);

        // Verify that sendTo was called with both lists
        expect(mockAdapter.sendTo).toHaveBeenCalledWith(
            'test.0',
            'getShoppingLists',
            [
                {
                    label: '"Grocery List"',
                    value: 'alexa-test.Lists.Grocery.Items.json',
                },
                {
                    label: '"To Do List"',
                    value: 'alexa-test.Lists.ToDo.Items.json',
                },
            ],
            'callback-id'
        );
    });

    it('should only include rows with correct id format (4 parts)', async () => {
        // Mock result with mixed id formats
        const mockRows = [
            {
                value: {
                    common: {
                        name: 'Wrong Format List 3',
                    },
                },
                id: 'alexa-test.Lists.Grocery', // 3 parts: alexa-test, Lists, Grocery
            },
            {
                value: {
                    common: {
                        name: 'Correct Format List',
                    },
                },
                id: 'alexa-test.Lists.Subcategory.ListName', // 4 parts: alexa-test, Lists, Subcategory, ListName
            },
        ];

        (mockAdapter.getObjectViewAsync as jest.Mock).mockResolvedValue({
            rows: mockRows,
        });

        await getShoppingLists(mockAdapter, mockObj);

        // Only the list with 4 parts should be included: alexa-test.Lists.Subcategory.ListName
        expect(mockAdapter.sendTo).toHaveBeenCalledWith(
            'test.0',
            'getShoppingLists',
            [
                {
                    label: '"Correct Format List"',
                    value: 'alexa-test.Lists.Subcategory.ListName.json',
                },
            ],
            'callback-id'
        );
    });

    it('should handle rows with no value property', async () => {
        // Mock result with row that has no value property
        const mockRows = [
            {
                value: {
                    common: {
                        name: 'Grocery List',
                    },
                },
                id: 'alexa-test.Lists.Grocery.Items', // 4 parts to pass the length check
            },
            {
                value: null, // No value
                id: 'alexa-test.Lists.Invalid.Items', // 4 parts but no value
            },
        ];

        (mockAdapter.getObjectViewAsync as jest.Mock).mockResolvedValue({
            rows: mockRows,
        });

        await getShoppingLists(mockAdapter, mockObj);

        // Only the valid list should be returned (the one with value property)
        expect(mockAdapter.sendTo).toHaveBeenCalledWith(
            'test.0',
            'getShoppingLists',
            [
                {
                    label: '"Grocery List"',
                    value: 'alexa-test.Lists.Grocery.Items.json',
                },
            ],
            'callback-id'
        );
    });

    it('should handle errors correctly', async () => {
        const testError = new Error('Test error');

        (mockAdapter.getObjectViewAsync as jest.Mock).mockRejectedValue(testError);

        await getShoppingLists(mockAdapter, mockObj);

        // Verify that errorLogger was called
        expect(errorLogger).toHaveBeenCalledWith(
            'Error get shopping lists',
            testError,
            mockAdapter
        );

        // Verify that sendTo was not called (since error occurred)
        expect(mockAdapter.sendTo).not.toHaveBeenCalled();
    });

    it('should not call sendTo when callback is not provided', async () => {
        // Create mock obj without callback
        const mockObjWithoutCallback = {
            from: 'test.0',
            command: 'getShoppingLists',
            message: {
                alexa: 'alexa-test',
            },
            callback: null, // No callback
        } as OnMessageObj;

        // Mock result with shopping lists
        const mockRows = [
            {
                value: {
                    common: {
                        name: 'Grocery List',
                    },
                },
                id: 'alexa-test.Lists.Grocery',
            },
        ];

        (mockAdapter.getObjectViewAsync as jest.Mock).mockResolvedValue({
            rows: mockRows,
        });

        await getShoppingLists(mockAdapter, mockObjWithoutCallback);

        // Verify that sendTo was not called when no callback exists
        expect(mockAdapter.sendTo).not.toHaveBeenCalled();
    });

    it('should call debug log with the result', async () => {
        // Mock result with shopping lists (ID must have 4 parts to pass the length === 4 check)
        const mockRows = [
            {
                value: {
                    common: {
                        name: 'Grocery List',
                    },
                },
                id: 'alexa-test.Lists.Grocery.Items', // 4 parts to pass the length check
            },
        ];

        (mockAdapter.getObjectViewAsync as jest.Mock).mockResolvedValue({
            rows: mockRows,
        });

        await getShoppingLists(mockAdapter, mockObj);

        // Verify that the debug log was called with the result
        expect(mockAdapter.log.debug).toHaveBeenCalledWith(
            'Lists: [{"label":"\\"Grocery List\\"","value":"alexa-test.Lists.Grocery.Items.json"}]'
        );
    });
});