"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrSetAsCompleted = void 0;
const ids_1 = require("./ids");
const logging_1 = require("./logging");
const deleteOrSetAsCompleted = async (adapter, array, status) => {
    try {
        const { idAlexaButtons } = (0, ids_1.adapterIds)().getAlexaIds;
        for (const { id } of array) {
            await adapter.setForeignStateAsync(idAlexaButtons(id, status), true, false);
        }
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error delete or set as completed', e, adapter);
    }
};
exports.deleteOrSetAsCompleted = deleteOrSetAsCompleted;
//# sourceMappingURL=deleteOrSetAsCompleted.js.map