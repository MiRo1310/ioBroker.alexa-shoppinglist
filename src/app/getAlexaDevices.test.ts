import { getAlexaDevices } from './getAlexaDevices';

// Mock the adapter and related types
const mockAdapter = {
    getObjectViewAsync: jest.fn(),
    log: {
        debug: jest.fn(),
    },
    sendTo: jest.fn(),
};

const mockErrorLogger = jest.fn();

// Mock the errorLogger import
jest.mock('./logging', () => ({
    errorLogger: (message: string, error: any, adapter: any) => mockErrorLogger(message, error, adapter),
}));

// Import the mocked errorLogger
const { errorLogger } = require('./logging');

describe('getAlexaDevices', () => {
    let originalConsoleError: any;

    beforeEach(() => {
        originalConsoleError = console.error;
        console.error = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
        console.error = originalConsoleError;
    });

    it('should return an empty array when no devices are found', async () => {
        // Arrange
        const mockDevices = { rows: [] };
        mockAdapter.getObjectViewAsync.mockResolvedValue(mockDevices);

        const mockObj = {
            message: { alexa: 'testUser' },
            from: 'testSender',
            command: 'testCommand',
            callback: 'testCallback',
        };

        // Act
        await getAlexaDevices(mockAdapter as any, mockObj as any);

        // Assert
        expect(mockAdapter.getObjectViewAsync).toHaveBeenCalledWith('system', 'device', {
            startkey: 'testUser.Echo-Devices.',
            endkey: 'testUser.Echo-Devices.\u9999',
        });
        expect(mockAdapter.sendTo).toHaveBeenCalledWith(
            'testSender',
            'testCommand',
            [],
            'testCallback'
        );
    });

    it('should filter out Timer, Reminder, and Alarm devices', async () => {
        // Arrange
        const mockDevices = {
            rows: [
                {
                    id: 'device1',
                    value: {
                        common: {
                            name: 'Timer',
                        }
                    }
                },
                {
                    id: 'device2',
                    value: {
                        common: {
                            name: 'Reminder',
                        }
                    }
                },
                {
                    id: 'device3',
                    value: {
                        common: {
                            name: 'Alarm',
                        }
                    }
                },
            ]
        };
        mockAdapter.getObjectViewAsync.mockResolvedValue(mockDevices);

        const mockObj = {
            message: { alexa: 'testUser' },
            from: 'testSender',
            command: 'testCommand',
            callback: 'testCallback',
        };

        // Act
        await getAlexaDevices(mockAdapter as any, mockObj as any);

        // Assert - should return empty array since all devices are filtered out
        expect(mockAdapter.sendTo).toHaveBeenCalledWith(
            'testSender',
            'testCommand',
            [],
            'testCallback'
        );
    });

    it('should return valid devices with correct format', async () => {
        // Arrange
        const mockDevices = {
            rows: [
                {
                    id: 'device1',
                    value: {
                        common: {
                            name: 'Living Room Echo',
                        }
                    }
                },
                {
                    id: 'device2',
                    value: {
                        common: {
                            name: 'Kitchen Echo',
                        }
                    }
                },
                {
                    id: 'device3',
                    value: {
                        common: {
                            name: 'Bedroom Echo',
                        }
                    }
                },
            ]
        };
        mockAdapter.getObjectViewAsync.mockResolvedValue(mockDevices);

        const mockObj = {
            message: { alexa: 'testUser' },
            from: 'testSender',
            command: 'testCommand',
            callback: 'testCallback',
        };

        // Act
        await getAlexaDevices(mockAdapter as any, mockObj as any);

        // Assert
        const expectedResponse = [
            {
                label: 'Living Room Echo',
                value: 'device1.Commands.textCommand',
            },
            {
                label: 'Kitchen Echo',
                value: 'device2.Commands.textCommand',
            },
            {
                label: 'Bedroom Echo',
                value: 'device3.Commands.textCommand',
            },
        ];

        expect(mockAdapter.sendTo).toHaveBeenCalledWith(
            'testSender',
            'testCommand',
            expectedResponse,
            'testCallback'
        );
    });

    it('should handle devices with value null', async () => {
        // Arrange
        const mockDevices = {
            rows: [
                {
                    id: 'device1',
                    value: null,
                },
                {
                    id: 'device2',
                    value: {
                        common: {
                            name: 'Valid Device',
                        }
                    }
                },
            ]
        };
        mockAdapter.getObjectViewAsync.mockResolvedValue(mockDevices);

        const mockObj = {
            message: { alexa: 'testUser' },
            from: 'testSender',
            command: 'testCommand',
            callback: 'testCallback',
        };

        // Act
        await getAlexaDevices(mockAdapter as any, mockObj as any);

        // Only the valid device should be returned
        const expectedResponse = [
            {
                label: 'Valid Device',
                value: 'device2.Commands.textCommand',
            },
        ];

        expect(mockAdapter.sendTo).toHaveBeenCalledWith(
            'testSender',
            'testCommand',
            expectedResponse,
            'testCallback'
        );
    });

    it('should call errorLogger when an error occurs', async () => {
        // Arrange
        const errorMessage = 'Test error';
        mockAdapter.getObjectViewAsync.mockRejectedValue(new Error(errorMessage));

        const mockObj = {
            message: { alexa: 'testUser' },
            from: 'testSender',
            command: 'testCommand',
            callback: 'testCallback',
        };

        // Act
        await getAlexaDevices(mockAdapter as any, mockObj as any);

        // Assert
        expect(mockErrorLogger).toHaveBeenCalledWith(
            'Error getAlexaDevices',
            new Error(errorMessage),
            mockAdapter
        );
    });

    it('should not call sendTo if callback is not provided', async () => {
        // Arrange
        const mockDevices = {
            rows: [
                {
                    id: 'device1',
                    value: {
                        common: {
                            name: 'Test Device',
                        }
                    }
                },
            ]
        };
        mockAdapter.getObjectViewAsync.mockResolvedValue(mockDevices);

        const mockObj = {
            message: { alexa: 'testUser' },
            from: 'testSender',
            command: 'testCommand',
            callback: null, // No callback
        };

        // Act
        await getAlexaDevices(mockAdapter as any, mockObj as any);

        // Assert - sendTo should not be called when callback is null
        expect(mockAdapter.sendTo).not.toHaveBeenCalled();
    });

    it('should call log.debug with the result', async () => {
        // Arrange
        const mockDevices = {
            rows: [
                {
                    id: 'device1',
                    value: {
                        common: {
                            name: 'Test Device',
                        }
                    }
                },
            ]
        };
        mockAdapter.getObjectViewAsync.mockResolvedValue(mockDevices);

        const mockObj = {
            message: { alexa: 'testUser' },
            from: 'testSender',
            command: 'testCommand',
            callback: 'testCallback',
        };

        // Act
        await getAlexaDevices(mockAdapter as any, mockObj as any);

        // Assert
        const expectedResponse = [
            {
                label: 'Test Device',
                value: 'device1.Commands.textCommand',
            },
        ];
        expect(mockAdapter.log.debug).toHaveBeenCalledWith(`Devices: ${JSON.stringify(expectedResponse)}`);
    });
});