import { firstLetterToUpperCase, sortList, isStateValue, getListId } from './utils';

// Define minimal types for testing purposes to avoid import issues
interface ShoppingList {
    name: string;
    ts: number;
    id: string;
    time: string;
}

type SortByTime1Alpha2 = '1' | '2';

describe('utils', () => {
    describe('firstLetterToUpperCase', () => {
        it('should convert first letter to uppercase', () => {
            expect(firstLetterToUpperCase('hello')).toBe('Hello');
            expect(firstLetterToUpperCase('world')).toBe('World');
            expect(firstLetterToUpperCase('test')).toBe('Test');
        });

        it('should handle single character strings', () => {
            expect(firstLetterToUpperCase('a')).toBe('A');
            expect(firstLetterToUpperCase('b')).toBe('B');
        });

        it('should handle already uppercase letters', () => {
            expect(firstLetterToUpperCase('Hello')).toBe('Hello');
            expect(firstLetterToUpperCase('Test')).toBe('Test');
        });

        it('should handle empty string', () => {
            expect(firstLetterToUpperCase('')).toBe('');
        });

        it('should handle special characters', () => {
            expect(firstLetterToUpperCase('1hello')).toBe('1hello');
            expect(firstLetterToUpperCase('!hello')).toBe('!hello');
        });
    });

    describe('sortList', () => {
        const mockList1: ShoppingList = { name: 'Item 1', ts: 100, id: '1', time: 'time1' };
        const mockList2: ShoppingList = { name: 'Item 2', ts: 50, id: '2', time: 'time2' };
        const mockList3: ShoppingList = { name: 'Item 3', ts: 150, id: '3', time: 'time3' };

        it('should sort by time (ascending)', () => {
            const array = [mockList1, mockList2, mockList3];
            const sorted = sortList(array, '1');
            expect(sorted[0].ts).toBe(50);
            expect(sorted[1].ts).toBe(100);
            expect(sorted[2].ts).toBe(150);
        });

        it('should sort alphabetically by name', () => {
            const array = [
                { name: 'Zebra', ts: 10, id: 'z', time: 'time' },
                { name: 'Apple', ts: 20, id: 'a', time: 'time' },
                { name: 'Banana', ts: 30, id: 'b', time: 'time' },
            ];
            const sorted = sortList(array, '2');
            expect(sorted[0].name).toBe('Apple');
            expect(sorted[1].name).toBe('Banana');
            expect(sorted[2].name).toBe('Zebra');
        });

        it('should return the same array if sortBy is invalid', () => {
            const array = [mockList1, mockList2, mockList3];
            const originalArray = [...array];
            const result = sortList(array, 'invalid' as SortByTime1Alpha2);
            expect(result).toEqual(originalArray);
        });

        it('should handle empty array', () => {
            const result = sortList([], '1');
            expect(result).toEqual([]);
        });

        it('should handle single item array', () => {
            const array = [mockList1];
            const result = sortList(array, '1');
            expect(result).toEqual(array);
        });
    });

    describe('isStateValue', () => {
        it('should return true for string values when type matches and ack is false', () => {
            const state: ioBroker.State = { val: 'test', ack: false, ts: 0, lc: 0, from: '' };
            expect(isStateValue(state, 'string')).toBe(true);
        });

        it('should return true for boolean values when type matches and ack is false', () => {
            const state: ioBroker.State = { val: true, ack: false, ts: 0, lc: 0, from: '' };
            expect(isStateValue(state, 'boolean')).toBe(true);
        });

        it('should return true for number values when type matches and ack is false', () => {
            const state: ioBroker.State = { val: 42, ack: false, ts: 0, lc: 0, from: '' };
            expect(isStateValue(state, 'number')).toBe(true);
        });

        it('should return false when ack is true', () => {
            const state: ioBroker.State = { val: 'test', ack: true, ts: 0, lc: 0, from: '' };
            expect(isStateValue(state, 'string')).toBe(false);
        });

        it('should return false when val is undefined', () => {
            const state: ioBroker.State = { val: undefined as any, ack: false, ts: 0, lc: 0, from: '' };
            expect(isStateValue(state, 'string')).toBe(false);
        });

        it('should return false when type does not match', () => {
            const state: ioBroker.State = { val: 'test', ack: false, ts: 0, lc: 0, from: '' };
            expect(isStateValue(state, 'number')).toBe(false);
        });

        it('should return false when state is null', () => {
            expect(isStateValue(null as any, 'string')).toBe(false);
        });

        it('should return false when state is undefined', () => {
            expect(isStateValue(undefined as any, 'string')).toBe(false);
        });
    });

    describe('getListId', () => {
        it('should extract list ID from full ID', () => {
            const fullId = 'alexa2.0.Lists.SHOPPING_LIST.json';
            const expectedId = 'alexa2.0.Lists.SHOPPING_LIST';
            expect(getListId(fullId)).toBe(expectedId);
        });

        it('should handle different IDs', () => {
            expect(getListId('adapter.0.data.object')).toBe('adapter.0.data');
            expect(getListId('some.id.here.example')).toBe('some.id.here');
        });

        it('should handle IDs with only two parts', () => {
            expect(getListId('adapter.0')).toBe('adapter');
        });

        it('should handle single part ID (edge case)', () => {
            expect(getListId('adapter')).toBe('');
        });

        it('should handle empty string', () => {
            expect(getListId('')).toBe('');
        });
    });
});
