"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateListsOnChange = void 0;
const utils_1 = require("../../../lib/utils");
const addPosition_1 = require("./addPosition");
const writeState_1 = require("./writeState");
const logging_1 = require("./logging");
const updateListsOnChange = async (adapter, sortListActive, sortListInActive, alexaState) => {
    let alexaListJson = {};
    try {
        alexaListJson = await adapter.getForeignStateAsync(alexaState);
        if (alexaListJson?.val && typeof alexaListJson.val == 'string') {
            const alexaList = JSON.parse(alexaListJson.val);
            let jsonActive = [];
            let jsonInactive = [];
            for (const element of alexaList) {
                if (!element.completed) {
                    pushToList(jsonActive, element);
                }
                else {
                    pushToList(jsonInactive, element);
                }
            }
            jsonActive = (0, utils_1.sortList)(jsonActive, sortListActive);
            jsonInactive = (0, utils_1.sortList)(jsonInactive, sortListInActive);
            (0, addPosition_1.addPositionNumberAndBtn)(adapter, jsonActive, 'active');
            (0, addPosition_1.addPositionNumberAndBtn)(adapter, jsonInactive, 'inactive');
            (0, writeState_1.writeState)(adapter, jsonActive, jsonInactive);
            return { jsonActive, jsonInactive, error: false };
        }
        return { jsonActive: [], jsonInactive: [], error: true };
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error update list on change', e, adapter);
        return { jsonActive: [], jsonInactive: [], error: true };
    }
};
exports.updateListsOnChange = updateListsOnChange;
function pushToList(list, element) {
    list.push({
        name: element.value ? (0, utils_1.firstLetterToUpperCase)(element.value) : '',
        time: new Date(element.createdDateTime).toLocaleString(),
        ts: new Date(element.createdDateTime).getTime(),
        id: element.id,
    });
    return list;
}
//# sourceMappingURL=updateListsOnChange.js.map