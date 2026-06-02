"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShoppingLists = void 0;
const logging_1 = require("./logging");
const getShoppingLists = async (adapter, obj) => {
    try {
        const result = [];
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
        adapter.log.debug(`Lists: ${JSON.stringify(result)}`);
        obj.callback && adapter.sendTo(obj.from, obj.command, result, obj.callback);
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error get shopping lists', e, adapter);
    }
};
exports.getShoppingLists = getShoppingLists;
//# sourceMappingURL=getShoppingLists.js.map