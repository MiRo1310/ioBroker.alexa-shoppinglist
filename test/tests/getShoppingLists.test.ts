import { expect } from 'chai';
import sinon from 'sinon';
import type AlexaShoppinglist from '@/main';
import type { OnMessageObj } from '@/types/types';
import { getShoppingLists } from '@/app/getShoppingLists';

describe('getShoppingLists', () => {
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
            from: 'test.0',
            command: 'getShoppingLists',
            message: { alexa: 'alexa-test' },
            callback: 'callback-id',
        };
    });

    it('returns empty result when no lists are found', async () => {
        getObjectViewAsync.resolves({ rows: [] });

        await getShoppingLists(mockAdapter, mockObj);

        expect(getObjectViewAsync).to.have.been.calledWith('system', 'channel', {
            startkey: 'alexa-test.Lists.',
            endkey: 'alexa-test.Lists.\u9999',
        });
        expect(sendTo).to.have.been.calledWith('test.0', 'getShoppingLists', [], 'callback-id');
    });

    it('returns formatted shopping lists', async () => {
        getObjectViewAsync.resolves({
            rows: [
                {
                    value: { common: { name: 'Grocery List' } },
                    id: 'alexa-test.Lists.Grocery.Items',
                },
                {
                    value: { common: { name: 'To Do List' } },
                    id: 'alexa-test.Lists.ToDo.Items',
                },
                {
                    value: { common: { name: 'Wrong Format' } },
                    id: 'alexa-test.Lists.OnlyThree',
                },
            ],
        });

        const expected = [
            { label: '"Grocery List"', value: 'alexa-test.Lists.Grocery.Items.json' },
            { label: '"To Do List"', value: 'alexa-test.Lists.ToDo.Items.json' },
        ];

        await getShoppingLists(mockAdapter, mockObj);

        expect(sendTo).to.have.been.calledWith('test.0', 'getShoppingLists', expected, 'callback-id');
        expect(logDebug).to.have.been.calledWith(`Lists: ${JSON.stringify(expected)}`);
    });

    it('skips rows with missing value', async () => {
        getObjectViewAsync.resolves({
            rows: [
                { value: null, id: 'alexa-test.Lists.Invalid.Items' },
                { value: { common: { name: 'Valid' } }, id: 'alexa-test.Lists.Valid.Items' },
            ],
        });

        await getShoppingLists(mockAdapter, mockObj);

        expect(sendTo).to.have.been.calledWith('test.0', 'getShoppingLists', [
            { label: '"Valid"', value: 'alexa-test.Lists.Valid.Items.json' },
        ]);
    });

    it('does not send when callback is missing', async () => {
        getObjectViewAsync.resolves({
            rows: [{ value: { common: { name: 'Valid' } }, id: 'alexa-test.Lists.Valid.Items' }],
        });

        await getShoppingLists(mockAdapter, { ...mockObj, callback: null });

        expect(sendTo).to.not.have.been.called;
    });

    it('logs through errorLogger path on failures', async () => {
        getObjectViewAsync.rejects(new Error('Test error'));

        await getShoppingLists(mockAdapter, mockObj);

        expect(logError).to.have.been.calledWith('Error get shopping lists');
    });
});
