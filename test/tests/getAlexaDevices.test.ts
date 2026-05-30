import { expect } from 'chai';
import sinon from 'sinon';
import type AlexaShoppinglist from '@/main';
import type { OnMessageObj } from '@/types/types';
import { getAlexaDevices } from '@/app/getAlexaDevices';

describe('getAlexaDevices', () => {
    let getObjectViewAsync: sinon.SinonStub;
    let sendTo: sinon.SinonStub;
    let logDebug: sinon.SinonStub;
    let logError: sinon.SinonStub;
    let mockAdapter: AlexaShoppinglist;
    let mockObj: OnMessageObj;

    beforeEach(() => {
        getObjectViewAsync = sinon.stub();
        sendTo = sinon.stub();
        logDebug = sinon.stub();
        logError = sinon.stub();

        mockAdapter = {
            getObjectViewAsync,
            sendTo,
            log: {
                debug: logDebug,
                error: logError,
            },
        } as unknown as AlexaShoppinglist;

        mockObj = {
            message: { alexa: 'testUser' },
            from: 'testSender',
            command: 'testCommand',
            callback: 'testCallback',
        };
    });

    it('returns an empty array when no devices are found', async () => {
        getObjectViewAsync.resolves({ rows: [] });

        await getAlexaDevices(mockAdapter, mockObj);

        expect(getObjectViewAsync).to.have.been.calledWith('system', 'device', {
            startkey: 'testUser.Echo-Devices.',
            endkey: 'testUser.Echo-Devices.\u9999',
        });
        expect(sendTo).to.have.been.calledWith('testSender', 'testCommand', [], 'testCallback');
    });

    it('filters Timer, Reminder and Alarm devices', async () => {
        getObjectViewAsync.resolves({
            rows: [
                { id: 'device1', value: { common: { name: 'Timer' } } },
                { id: 'device2', value: { common: { name: 'Reminder' } } },
                { id: 'device3', value: { common: { name: 'Alarm' } } },
            ],
        });

        await getAlexaDevices(mockAdapter, mockObj);

        expect(sendTo).to.have.been.calledWith('testSender', 'testCommand', [], 'testCallback');
    });

    it('returns valid devices with expected format', async () => {
        getObjectViewAsync.resolves({
            rows: [
                { id: 'device1', value: { common: { name: 'Living Room Echo' } } },
                { id: 'device2', value: { common: { name: 'Kitchen Echo' } } },
                { id: 'device3', value: { common: { name: 'Bedroom Echo' } } },
            ],
        });

        const expectedResponse = [
            { label: 'Living Room Echo', value: 'device1.Commands.textCommand' },
            { label: 'Kitchen Echo', value: 'device2.Commands.textCommand' },
            { label: 'Bedroom Echo', value: 'device3.Commands.textCommand' },
        ];

        await getAlexaDevices(mockAdapter, mockObj);

        expect(sendTo).to.have.been.calledWith('testSender', 'testCommand', expectedResponse, 'testCallback');
        expect(logDebug).to.have.been.calledWith(`Devices: ${JSON.stringify(expectedResponse)}`);
    });

    it('ignores rows without value', async () => {
        getObjectViewAsync.resolves({
            rows: [
                { id: 'device1', value: null },
                { id: 'device2', value: { common: { name: 'Valid Device' } } },
            ],
        });

        await getAlexaDevices(mockAdapter, mockObj);

        expect(sendTo).to.have.been.calledWith('testSender', 'testCommand', [
            { label: 'Valid Device', value: 'device2.Commands.textCommand' },
        ]);
    });

    it('does not call sendTo when callback is missing', async () => {
        getObjectViewAsync.resolves({
            rows: [{ id: 'device1', value: { common: { name: 'Test Device' } } }],
        });

        await getAlexaDevices(mockAdapter, { ...mockObj, callback: null });

        expect(sendTo).to.not.have.been.called;
    });

    it('logs through errorLogger path when an exception occurs', async () => {
        getObjectViewAsync.rejects(new Error('Test error'));

        await getAlexaDevices(mockAdapter, mockObj);

        expect(logError).to.have.been.calledWith('Error getAlexaDevices');
    });
});
