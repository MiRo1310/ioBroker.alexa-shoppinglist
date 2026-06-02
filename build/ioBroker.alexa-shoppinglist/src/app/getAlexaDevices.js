"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAlexaDevices = void 0;
const logging_1 = require("./logging");
const getAlexaDevices = async (adapter, obj) => {
    try {
        const devices = await adapter.getObjectViewAsync('system', 'device', {
            startkey: `${obj.message.alexa}.Echo-Devices.`,
            endkey: `${obj.message.alexa}.Echo-Devices.\u9999`,
        });
        const result = [];
        for (let i = 0; i < devices.rows.length; i++) {
            const a = devices.rows[i];
            if (a.value &&
                a.value.common.name !== 'Timer' &&
                a.value.common.name !== 'Reminder' &&
                a.value.common.name !== 'Alarm') {
                result.push({
                    label: a.value.common.name,
                    value: `${a.id}.Commands.textCommand`,
                });
            }
        }
        adapter.log.debug(`Devices: ${JSON.stringify(result)}`);
        obj.callback && adapter.sendTo(obj.from, obj.command, result, obj.callback);
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error getAlexaDevices', e, adapter);
    }
};
exports.getAlexaDevices = getAlexaDevices;
//# sourceMappingURL=getAlexaDevices.js.map