import { updateListsOnChange } from './updateListsOnChange';
import { firstLetterToUpperCase, sortList } from '../lib/utils';
import { addPositionNumberAndBtn } from './addPosition';
import { writeState } from './writeState';
import { errorLogger } from './logging';

// Mock dependencies
jest.mock('../lib/utils', () => ({
    firstLetterToUpperCase: jest.fn((str) => str.charAt(0).toUpperCase() + str.slice(1)),
    sortList: jest.fn((list) => list),
}));

jest.mock('./addPosition', () => ({
    addPositionNumberAndBtn: jest.fn(),
}));

jest.mock('./writeState', () => ({
    writeState: jest.fn(),
}));

jest.mock('./logging', () => ({
    errorLogger: jest.fn(),
}));

describe('updateListsOnChange', () => {
    let mockAdapter: any;

    beforeEach(() => {
        mockAdapter = {
            getForeignStateAsync: jest.fn(),
        };

        // Reset all mocks
        (firstLetterToUpperCase as jest.MockedFunction<typeof firstLetterToUpperCase>).mockClear();
        (sortList as jest.MockedFunction<typeof sortList>).mockClear();
        (addPositionNumberAndBtn as jest.MockedFunction<typeof addPositionNumberAndBtn>).mockClear();
        (writeState as jest.MockedFunction<typeof writeState>).mockClear();
        (errorLogger as jest.MockedFunction<typeof errorLogger>).mockClear();
    });

    it('should return empty lists with error true when alexaState value is not a string', async () => {
        (mockAdapter.getForeignStateAsync as jest.MockedFunction<any>).mockResolvedValueOnce({
            val: null,
        });

        const result = await updateListsOnChange(mockAdapter, '1', '1', 'test.state');

        expect(result).toEqual({
            jsonActive: [],
            jsonInactive: [],
            error: true,
        });
    });

    it('should return empty lists with error true when alexaState value is an empty string', async () => {
        (mockAdapter.getForeignStateAsync as jest.MockedFunction<any>).mockResolvedValueOnce({
            val: '',
        });

        const result = await updateListsOnChange(mockAdapter, '1', '1', 'test.state');

        expect(result).toEqual({
            jsonActive: [],
            jsonInactive: [],
            error: true,
        });
    });

    it('should process active and inactive lists correctly when valid alexaState value is provided', async () => {
        const mockAlexaStateValue = JSON.stringify([
            {
                id: 'item1',
                value: 'apples',
                createdDateTime: '2023-01-01T10:00:00Z',
                completed: false,
            },
            {
                id: 'item2',
                value: 'bananas',
                createdDateTime: '2023-01-01T11:00:00Z',
                completed: true,
            },
            {
                id: 'item3',
                value: 'oranges',
                createdDateTime: '2023-01-01T12:00:00Z',
                completed: false,
            },
        ]);

        (mockAdapter.getForeignStateAsync as jest.MockedFunction<any>).mockResolvedValueOnce({
            val: mockAlexaStateValue,
        });

        const result = await updateListsOnChange(mockAdapter, '1', '1', 'test.state');

        // Verify the getForeignStateAsync was called
        expect(mockAdapter.getForeignStateAsync).toHaveBeenCalledWith('test.state');

        // Verify that firstLetterToUpperCase was called for each active item
        expect(firstLetterToUpperCase).toHaveBeenCalledWith('apples');
        expect(firstLetterToUpperCase).toHaveBeenCalledWith('oranges');
        expect(firstLetterToUpperCase).toHaveBeenCalledWith('bananas');

        // Verify that sortList was called for both active and inactive lists
        expect(sortList).toHaveBeenCalledTimes(2);

        // Verify that addPositionNumberAndBtn was called for both lists
        expect(addPositionNumberAndBtn).toHaveBeenCalledWith(mockAdapter, expect.any(Array), 'active');
        expect(addPositionNumberAndBtn).toHaveBeenCalledWith(mockAdapter, expect.any(Array), 'inactive');

        // Verify that writeState was called
        expect(writeState).toHaveBeenCalledWith(mockAdapter, expect.any(Array), expect.any(Array));

        // Verify the structure of the result
        expect(result.error).toBe(false);
        expect(Array.isArray(result.jsonActive)).toBe(true);
        expect(Array.isArray(result.jsonInactive)).toBe(true);
        expect(result.jsonActive).toHaveLength(2); // apples and oranges
        expect(result.jsonInactive).toHaveLength(1); // bananas

        // Verify the active items
        expect(result.jsonActive).toContainEqual({
            name: 'Apples', // first letter capitalized
            time: new Date('2023-01-01T10:00:00Z').toLocaleString(),
            ts: new Date('2023-01-01T10:00:00Z').getTime(),
            id: 'item1',
        });
        expect(result.jsonActive).toContainEqual({
            name: 'Oranges', // first letter capitalized
            time: new Date('2023-01-01T12:00:00Z').toLocaleString(),
            ts: new Date('2023-01-01T12:00:00Z').getTime(),
            id: 'item3',
        });

        // Verify the inactive items
        expect(result.jsonInactive).toContainEqual({
            name: 'Bananas', // first letter capitalized
            time: new Date('2023-01-01T11:00:00Z').toLocaleString(),
            ts: new Date('2023-01-01T11:00:00Z').getTime(),
            id: 'item2',
        });
    });

    it('should handle empty alexa list correctly', async () => {
        (mockAdapter.getForeignStateAsync as jest.MockedFunction<any>).mockResolvedValueOnce({
            val: JSON.stringify([]),
        });

        const result = await updateListsOnChange(mockAdapter, '1', '1', 'test.state');

        expect(result).toEqual({
            jsonActive: [],
            jsonInactive: [],
            error: false,
        });

        // Verify that all processing functions were still called (with empty arrays)
        expect(sortList).toHaveBeenCalledTimes(2);
        expect(addPositionNumberAndBtn).toHaveBeenCalledWith(mockAdapter, [], 'active');
        expect(addPositionNumberAndBtn).toHaveBeenCalledWith(mockAdapter, [], 'inactive');
        expect(writeState).toHaveBeenCalledWith(mockAdapter, [], []);
    });

    it('should handle JSON parsing error and return error result', async () => {
        (mockAdapter.getForeignStateAsync as jest.MockedFunction<any>).mockResolvedValueOnce({
            val: 'invalid json',
        });

        const result = await updateListsOnChange(mockAdapter, '1', '1', 'test.state');

        expect(result).toEqual({
            jsonActive: [],
            jsonInactive: [],
            error: true,
        });

        // Verify that errorLogger was called
        expect(errorLogger).toHaveBeenCalledWith('Error update list on change', expect.any(Error), mockAdapter);
    });

    it('should handle undefined element value correctly', async () => {
        const mockAlexaStateValue = JSON.stringify([
            {
                id: 'item1',
                value: undefined,
                createdDateTime: '2023-01-01T10:00:00Z',
                completed: false,
            },
        ]);

        (mockAdapter.getForeignStateAsync as jest.MockedFunction<any>).mockResolvedValueOnce({
            val: mockAlexaStateValue,
        });

        const result = await updateListsOnChange(mockAdapter, '1', '1', 'test.state');

        // Verify that firstLetterToUpperCase was called with empty string for undefined value
        expect(firstLetterToUpperCase).toHaveBeenCalledWith('');
        expect(result.error).toBe(false);
    });

    it('should handle null element value correctly', async () => {
        const mockAlexaStateValue = JSON.stringify([
            {
                id: 'item1',
                value: null,
                createdDateTime: '2023-01-01T10:00:00Z',
                completed: false,
            },
        ]);

        (mockAdapter.getForeignStateAsync as jest.MockedFunction<any>).mockResolvedValueOnce({
            val: mockAlexaStateValue,
        });

        const result = await updateListsOnChange(mockAdapter, '1', '1', 'test.state');

        // Verify that firstLetterToUpperCase was called with empty string for null value
        expect(firstLetterToUpperCase).toHaveBeenCalledWith('');
        expect(result.error).toBe(false);
    });

    it('should apply correct sorting based on parameters', async () => {
        const mockAlexaStateValue = JSON.stringify([
            {
                id: 'item1',
                value: 'zucchini',
                createdDateTime: '2023-01-01T10:00:00Z',
                completed: false,
            },
            {
                id: 'item2',
                value: 'apple',
                createdDateTime: '2023-01-01T11:00:00Z',
                completed: false,
            },
        ]);

        (mockAdapter.getForeignStateAsync as jest.MockedFunction<any>).mockResolvedValueOnce({
            val: mockAlexaStateValue,
        });

        await updateListsOnChange(mockAdapter, '1', '2', 'test.state'); // sortActive=byTime, sortInactive=byAlpha

        // Verify that sortList was called with correct parameters
        expect(sortList).toHaveBeenCalledWith(
            [
                {
                    name: 'Zucchini',
                    time: expect.any(String),
                    ts: expect.any(Number),
                    id: 'item1',
                },
                {
                    name: 'Apple',
                    time: expect.any(String),
                    ts: expect.any(Number),
                    id: 'item2',
                },
            ],
            '1' // sort by time for active
        );
        expect(sortList).toHaveBeenCalledWith(expect.any(Array), '2'); // sort by alpha for inactive
    });
});