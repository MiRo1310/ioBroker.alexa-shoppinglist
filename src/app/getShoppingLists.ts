import type AlexaShoppinglist from '../main';
import type { OnMessageObj } from '../types/types';
import { errorLogger } from './logging';

export const getShoppingLists = async (adapter: AlexaShoppinglist, obj: OnMessageObj): Promise<void> => {
    try {
        const result: { label: ioBroker.StringOrTranslated; value: string }[] = [];
        const lists = await adapter.getObjectViewAsync('system', 'channel', {
            startkey: `${obj.message.alexa}.Lists.`,
            endkey: `${obj.message.alexa}.Lists.\u9999`,
        });
        for (let i = 0; i < lists.rows.length; i++) {
            const a = lists.rows[i];
            if (a.value && a.id.split('.').length === 4) {
                result.push({
                    label: `${JSON.stringify(a.value.common.name)}`,
                    value: `${a.id}.json`,
                });
            }
        }
        obj.callback && adapter.sendTo(obj.from, obj.command, result, obj.callback);
    } catch (e: any) {
        errorLogger('Error get shopping lists', e, adapter);
    }
};
