import type AlexaShoppinglist from '../main';
import type { OnMessageObj } from '../types/types';
import { errorLogger } from './logging';

export const getAlexaDevices = async (adapter: AlexaShoppinglist, obj: OnMessageObj): Promise<void> => {
    try {
        const devices = await adapter.getObjectViewAsync('system', 'device', {
            startkey: `${obj.message.alexa}.Echo-Devices.`,
            endkey: `${obj.message.alexa}.Echo-Devices.\u9999`,
        });
        const result: { label: ioBroker.StringOrTranslated; value: string }[] = [];
        for (let i = 0; i < devices.rows.length; i++) {
            const a = devices.rows[i];
            if (
                a.value &&
                a.value.common.name !== 'Timer' &&
                a.value.common.name !== 'Reminder' &&
                a.value.common.name !== 'Alarm'
            ) {
                result.push({
                    label: a.value.common.name,
                    value: `${a.id}.Commands.textCommand`,
                });
            }
        }
        obj.callback && adapter.sendTo(obj.from, obj.command, result, obj.callback);
    } catch (e: any) {
        errorLogger('Error getAlexaDevices', e, adapter);
    }
};
