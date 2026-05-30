import { expect } from 'chai';
import sinon from 'sinon';
import { errorLogger } from '@/app/logging';
import type AlexaTimerVis from '@/main';

describe('logging', () => {
    let logError: sinon.SinonStub;
    let supportsFeature: sinon.SinonStub;
    let getPluginInstance: sinon.SinonStub;
    let captureException: sinon.SinonStub;
    let mockAdapter: AlexaTimerVis;

    beforeEach(() => {
        logError = sinon.stub();
        supportsFeature = sinon.stub().returns(false);
        captureException = sinon.stub();
        getPluginInstance = sinon.stub().returns({
            getSentryObject: () => ({ captureException }),
        });

        mockAdapter = {
            log: { error: logError },
            supportsFeature,
            getPluginInstance,
        } as unknown as AlexaTimerVis;
    });

    it('logs title, message and stack', () => {
        const error = new Error('Something went wrong');
        errorLogger('Test Error', error, mockAdapter);

        expect(logError).to.have.been.calledWith('Test Error');
        expect(logError).to.have.been.calledWith(`Error message: ${error.message}`);
        expect(logError).to.have.been.calledWith(`Error stack: ${error.stack}`);
    });

    it('captures exception with sentry when plugin support exists', () => {
        supportsFeature.returns(true);
        errorLogger('Test Error', new Error('Something went wrong'), mockAdapter);

        expect(supportsFeature).to.have.been.calledWith('PLUGINS');
        expect(getPluginInstance).to.have.been.calledWith('sentry');
        expect(captureException).to.have.been.calledOnce;
    });

    it('logs response status details when present', () => {
        errorLogger(
            'Test Error',
            {
                message: 'Network error',
                stack: 'Error stack trace',
                response: { status: 404, statusText: 'Not Found' },
            },
            mockAdapter,
        );

        expect(logError).to.have.been.calledWith('Server response: 404');
        expect(logError).to.have.been.calledWith('Server status: Not Found');
    });

    it('does not log response details without response object', () => {
        errorLogger(
            'Test Error',
            {
                message: 'Simple error',
                stack: 'Error stack trace',
            },
            mockAdapter,
        );

        expect(logError).to.not.have.been.calledWithMatch(sinon.match('Server response:'));
        expect(logError).to.not.have.been.calledWithMatch(sinon.match('Server status:'));
    });
});
