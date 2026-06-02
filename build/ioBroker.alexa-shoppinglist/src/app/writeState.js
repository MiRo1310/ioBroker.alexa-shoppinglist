"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeState = void 0;
const logging_1 = require("./logging");
const ids_1 = require("./ids");
const writeState = (adapter, arrayActive, arrayInactive) => {
    try {
        const { getAdapterIds } = (0, ids_1.adapterIds)();
        adapter.setStateChanged(getAdapterIds.idListActive, JSON.stringify(arrayActive), true);
        adapter.setStateChanged(getAdapterIds.idListInActive, JSON.stringify(arrayInactive), true);
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error write state', e, adapter);
    }
};
exports.writeState = writeState;
//# sourceMappingURL=writeState.js.map