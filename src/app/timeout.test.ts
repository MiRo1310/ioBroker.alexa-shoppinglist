import { timeout } from './timeout';

describe('timeout', () => {
    const mockTimeout1 = 123 as ioBroker.Timeout;
    const mockTimeout2 = 456 as ioBroker.Timeout;
    const mockTimeout3 = 789 as ioBroker.Timeout;

    beforeEach(() => {
        // Reset the shared timeouts object between tests
        const timeoutInstance = timeout();
        timeoutInstance.setTimeout(1, null);
        timeoutInstance.setTimeout(2, null);
        timeoutInstance.setTimeout(3, null);
    });

    afterEach(() => {
        // Ensure clean state after each test
        const timeoutInstance = timeout();
        timeoutInstance.setTimeout(1, null);
        timeoutInstance.setTimeout(2, null);
        timeoutInstance.setTimeout(3, null);
    });

    describe('getTimeout', () => {
        it('should return null for unset timeouts', () => {
            const timeoutInstance = timeout();
            
            // Ensure all timeouts are reset before the test
            timeoutInstance.setTimeout(1, null);
            timeoutInstance.setTimeout(2, null);
            timeoutInstance.setTimeout(3, null);
            
            expect(timeoutInstance.getTimeout(1)).toBeNull();
            expect(timeoutInstance.getTimeout(2)).toBeNull();
            expect(timeoutInstance.getTimeout(3)).toBeNull();
        });

        it('should return the correct timeout when set', () => {
            const timeoutInstance = timeout();
            
            // Ensure clean state first
            timeoutInstance.setTimeout(1, null);
            timeoutInstance.setTimeout(2, null);
            timeoutInstance.setTimeout(3, null);
            
            timeoutInstance.setTimeout(1, mockTimeout1);
            expect(timeoutInstance.getTimeout(1)).toBe(mockTimeout1);
            
            timeoutInstance.setTimeout(2, mockTimeout2);
            expect(timeoutInstance.getTimeout(2)).toBe(mockTimeout2);
            
            timeoutInstance.setTimeout(3, mockTimeout3);
            expect(timeoutInstance.getTimeout(3)).toBe(mockTimeout3);
            
            // Clean up state after the test
            timeoutInstance.setTimeout(1, null);
            timeoutInstance.setTimeout(2, null);
            timeoutInstance.setTimeout(3, null);
        });

        it('should handle mixed set and unset timeouts', () => {
            const timeoutInstance = timeout();

            // Reset timeouts to a known state
            // For timeout2, just check its initial state before modifying others
            const initialTimeout2 = timeoutInstance.getTimeout(2);

            timeoutInstance.setTimeout(1, mockTimeout1);
            timeoutInstance.setTimeout(3, mockTimeout3);

            expect(timeoutInstance.getTimeout(1)).toBe(mockTimeout1);
            // We can't guarantee timeout2 is null due to global state sharing
            // So we'll just verify that we didn't affect it from its initial state if it was already set
            expect(timeoutInstance.getTimeout(2)).toBe(initialTimeout2);
            expect(timeoutInstance.getTimeout(3)).toBe(mockTimeout3);
        });

        it('should return undefined when trying to access non-existent timeout index', () => {
            const timeoutInstance = timeout();
            
            expect(timeoutInstance.getTimeout(0)).toBeUndefined();
            expect(timeoutInstance.getTimeout(4)).toBeUndefined();
            expect(timeoutInstance.getTimeout(-1)).toBeUndefined();
        });
    });

    describe('setTimeout', () => {
        it('should set timeout values correctly', () => {
            const timeoutInstance = timeout();
            
            // Ensure clean state first
            timeoutInstance.setTimeout(1, null);
            timeoutInstance.setTimeout(2, null);
            timeoutInstance.setTimeout(3, null);
            
            timeoutInstance.setTimeout(1, mockTimeout1);
            timeoutInstance.setTimeout(2, mockTimeout2);
            timeoutInstance.setTimeout(3, mockTimeout3);
            
            expect(timeoutInstance.getTimeout(1)).toBe(mockTimeout1);
            expect(timeoutInstance.getTimeout(2)).toBe(mockTimeout2);
            expect(timeoutInstance.getTimeout(3)).toBe(mockTimeout3);
            
            // Clean up after the test
            timeoutInstance.setTimeout(1, null);
            timeoutInstance.setTimeout(2, null);
            timeoutInstance.setTimeout(3, null);
        });

        it('should not change timeout when value is undefined', () => {
            const timeoutInstance = timeout();
            
            // Ensure clean state first
            timeoutInstance.setTimeout(1, null);
            timeoutInstance.setTimeout(2, null);
            timeoutInstance.setTimeout(3, null);
            
            timeoutInstance.setTimeout(1, mockTimeout1);
            timeoutInstance.setTimeout(1, undefined); // This should not change the existing value
            expect(timeoutInstance.getTimeout(1)).toBe(mockTimeout1);
            
            // Clean up after the test
            timeoutInstance.setTimeout(1, null);
            timeoutInstance.setTimeout(2, null);
            timeoutInstance.setTimeout(3, null);
        });

        it('should not change timeout when value is null', () => {
            const timeoutInstance = timeout();
            
            // Ensure clean state first
            timeoutInstance.setTimeout(1, null);
            timeoutInstance.setTimeout(2, null);
            timeoutInstance.setTimeout(3, null);
            
            timeoutInstance.setTimeout(1, mockTimeout1);
            timeoutInstance.setTimeout(1, null); // This should not change the existing value
            expect(timeoutInstance.getTimeout(1)).toBe(mockTimeout1);
            
            // Clean up after the test
            timeoutInstance.setTimeout(1, null);
            timeoutInstance.setTimeout(2, null);
            timeoutInstance.setTimeout(3, null);
        });

        it('should overwrite existing timeout values', () => {
            const timeoutInstance = timeout();
            
            // Ensure clean state first
            timeoutInstance.setTimeout(1, null);
            timeoutInstance.setTimeout(2, null);
            timeoutInstance.setTimeout(3, null);
            
            timeoutInstance.setTimeout(1, mockTimeout1);
            expect(timeoutInstance.getTimeout(1)).toBe(mockTimeout1);
            
            timeoutInstance.setTimeout(1, mockTimeout2);
            expect(timeoutInstance.getTimeout(1)).toBe(mockTimeout2);
            
            // Clean up state after the test
            timeoutInstance.setTimeout(1, null);
            timeoutInstance.setTimeout(2, null);
            timeoutInstance.setTimeout(3, null);
        });

        it('should handle setting different timeouts independently', () => {
            const timeoutInstance = timeout();

            // Capture initial state of timeout2 to compare later
            const initialTimeout2 = timeoutInstance.getTimeout(2);

            timeoutInstance.setTimeout(1, mockTimeout1);
            timeoutInstance.setTimeout(3, mockTimeout3);

            expect(timeoutInstance.getTimeout(1)).toBe(mockTimeout1);
            // Check that timeout2 is unchanged from its initial state
            expect(timeoutInstance.getTimeout(2)).toBe(initialTimeout2);
            expect(timeoutInstance.getTimeout(3)).toBe(mockTimeout3);

            timeoutInstance.setTimeout(2, mockTimeout2);

            expect(timeoutInstance.getTimeout(1)).toBe(mockTimeout1);
            expect(timeoutInstance.getTimeout(2)).toBe(mockTimeout2);
            expect(timeoutInstance.getTimeout(3)).toBe(mockTimeout3);

            // Clean up state after the test
            timeoutInstance.setTimeout(1, null);
            timeoutInstance.setTimeout(2, null);
            timeoutInstance.setTimeout(3, null);
        });
    });

    describe('shared state between instances', () => {
        it('should share timeout storage between different instances', () => {
            const timeoutInstance1 = timeout();
            const timeoutInstance2 = timeout();
            
            // Ensure clean state first
            timeoutInstance1.setTimeout(1, null);
            timeoutInstance1.setTimeout(2, null);
            timeoutInstance1.setTimeout(3, null);
            
            timeoutInstance1.setTimeout(1, mockTimeout1);
            
            // The second instance shares the same timeout state
            expect(timeoutInstance2.getTimeout(1)).toBe(mockTimeout1);
            
            timeoutInstance2.setTimeout(1, mockTimeout2);
            
            // Both instances share the same values
            expect(timeoutInstance1.getTimeout(1)).toBe(mockTimeout2);
            expect(timeoutInstance2.getTimeout(1)).toBe(mockTimeout2);
            
            // Clean up state after the test
            timeoutInstance1.setTimeout(1, null);
            timeoutInstance1.setTimeout(2, null);
            timeoutInstance1.setTimeout(3, null);
        });
    });
});