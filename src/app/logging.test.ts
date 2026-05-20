import { errorLogger } from './logging';
import type AlexaTimerVis from '../main';

// Mock the adapter and its dependencies
const createMockAdapter = (): jest.Mocked<AlexaTimerVis> => {
    return {
        log: {
            error: jest.fn(),
        },
        supportsFeature: jest.fn(),
        getPluginInstance: jest.fn(),
    } as unknown as jest.Mocked<AlexaTimerVis>;
};

describe('logging', () => {
    let mockAdapter: jest.Mocked<AlexaTimerVis>;

    beforeEach(() => {
        mockAdapter = createMockAdapter();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('errorLogger', () => {
        it('should log error title, message, and stack', () => {
            const title = 'Test Error';
            const error = new Error('Something went wrong');
            
            errorLogger(title, error, mockAdapter);

            expect(mockAdapter.log.error).toHaveBeenCalledWith(title);
            expect(mockAdapter.log.error).toHaveBeenCalledWith(`Error message: ${error.message}`);
            expect(mockAdapter.log.error).toHaveBeenCalledWith(`Error stack: ${error.stack}`);
        });

        it('should capture exception with sentry if available', () => {
            const title = 'Test Error';
            const error = new Error('Something went wrong');
            const mockSentryInstance = {
                getSentryObject: jest.fn().mockReturnValue({
                    captureException: jest.fn(),
                }),
            };

            mockAdapter.supportsFeature.mockReturnValue(true);
            mockAdapter.getPluginInstance.mockReturnValue(mockSentryInstance as any);

            errorLogger(title, error, mockAdapter);

            expect(mockAdapter.supportsFeature).toHaveBeenCalledWith('PLUGINS');
            expect(mockAdapter.getPluginInstance).toHaveBeenCalledWith('sentry');
            expect(mockSentryInstance.getSentryObject().captureException).toHaveBeenCalledWith(error);
        });

        it('should not capture exception if sentry is not available', () => {
            const title = 'Test Error';
            const error = new Error('Something went wrong');

            mockAdapter.supportsFeature.mockReturnValue(true);
            mockAdapter.getPluginInstance.mockReturnValue(null);

            errorLogger(title, error, mockAdapter);

            expect(mockAdapter.supportsFeature).toHaveBeenCalledWith('PLUGINS');
            expect(mockAdapter.getPluginInstance).toHaveBeenCalledWith('sentry');
        });

        it('should not try to capture exception if plugins are not supported', () => {
            const title = 'Test Error';
            const error = new Error('Something went wrong');

            mockAdapter.supportsFeature.mockReturnValue(false);

            errorLogger(title, error, mockAdapter);

            expect(mockAdapter.supportsFeature).toHaveBeenCalledWith('PLUGINS');
            expect(mockAdapter.getPluginInstance).not.toHaveBeenCalled();
        });

        it('should handle error with response object', () => {
            const title = 'Test Error';
            const error = {
                message: 'Network error',
                stack: 'Error stack trace',
                response: {
                    status: 404,
                    statusText: 'Not Found'
                }
            };

            errorLogger(title, error, mockAdapter);

            expect(mockAdapter.log.error).toHaveBeenCalledWith(title);
            expect(mockAdapter.log.error).toHaveBeenCalledWith(`Error message: ${error.message}`);
            expect(mockAdapter.log.error).toHaveBeenCalledWith(`Error stack: ${error.stack}`);
            expect(mockAdapter.log.error).toHaveBeenCalledWith(`Server response: ${error.response.status}`);
            expect(mockAdapter.log.error).toHaveBeenCalledWith(`Server status: ${error.response.statusText}`);
        });

        it('should handle error with response object containing only status', () => {
            const title = 'Test Error';
            const error = {
                message: 'Network error',
                stack: 'Error stack trace',
                response: {
                    status: 500
                }
            };

            errorLogger(title, error, mockAdapter);

            expect(mockAdapter.log.error).toHaveBeenCalledWith(title);
            expect(mockAdapter.log.error).toHaveBeenCalledWith(`Error message: ${error.message}`);
            expect(mockAdapter.log.error).toHaveBeenCalledWith(`Error stack: ${error.stack}`);
            expect(mockAdapter.log.error).toHaveBeenCalledWith(`Server response: ${error.response.status}`);
            // The code logs both status and statusText, so if statusText is undefined, it will still log it
            // Check that it was called with undefined statusText
            expect(mockAdapter.log.error).toHaveBeenCalledWith(`Server status: undefined`);
        });

        it('should handle error with response object containing only statusText', () => {
            const title = 'Test Error';
            const error = {
                message: 'Network error',
                stack: 'Error stack trace',
                response: {
                    statusText: 'Internal Server Error'
                }
            };

            errorLogger(title, error, mockAdapter);

            expect(mockAdapter.log.error).toHaveBeenCalledWith(title);
            expect(mockAdapter.log.error).toHaveBeenCalledWith(`Error message: ${error.message}`);
            expect(mockAdapter.log.error).toHaveBeenCalledWith(`Error stack: ${error.stack}`);
            // The code logs both status and statusText, so if status is undefined, it will still log it
            expect(mockAdapter.log.error).toHaveBeenCalledWith(`Server response: undefined`);
            expect(mockAdapter.log.error).toHaveBeenCalledWith(`Server status: ${error.response.statusText}`);
        });

        it('should handle error without response object', () => {
            const title = 'Test Error';
            const error = {
                message: 'Simple error',
                stack: 'Error stack trace'
            };

            errorLogger(title, error, mockAdapter);

            expect(mockAdapter.log.error).toHaveBeenCalledWith(title);
            expect(mockAdapter.log.error).toHaveBeenCalledWith(`Error message: ${error.message}`);
            expect(mockAdapter.log.error).toHaveBeenCalledWith(`Error stack: ${error.stack}`);
            expect(mockAdapter.log.error).not.toHaveBeenCalledWith(expect.stringMatching(/Server response:/));
            expect(mockAdapter.log.error).not.toHaveBeenCalledWith(expect.stringMatching(/Server status:/));
        });

        it('should handle error with null or undefined properties', () => {
            const title = 'Test Error';
            const error = {
                message: null,
                stack: undefined
            };

            errorLogger(title, error, mockAdapter);

            expect(mockAdapter.log.error).toHaveBeenCalledWith(title);
            expect(mockAdapter.log.error).toHaveBeenCalledWith('Error message: null');
            expect(mockAdapter.log.error).toHaveBeenCalledWith('Error stack: undefined');
        });

        it('should handle non-error objects', () => {
            const title = 'Test Error';
            const error = 'This is a string error';

            errorLogger(title, error, mockAdapter);

            expect(mockAdapter.log.error).toHaveBeenCalledWith(title);
            expect(mockAdapter.log.error).toHaveBeenCalledWith('Error message: undefined'); // String doesn't have .message property
            expect(mockAdapter.log.error).toHaveBeenCalledWith('Error stack: undefined'); // String doesn't have .stack property
        });
    });
});