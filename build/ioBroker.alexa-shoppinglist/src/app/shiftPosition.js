"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shiftPosition = void 0;
const timeout_1 = require("./timeout");
const ids_1 = require("./ids");
const logging_1 = require("./logging");
const shiftPosition = async (adapter, pos, array, list) => {
    try {
        const { getAlexaIds, getAdapterIds } = (0, ids_1.adapterIds)();
        for (const element of array) {
            if (pos !== element.pos) {
                continue;
            }
            if (list === 'toActiv') {
                await adapter.setForeignStateAsync(getAlexaIds.idAlexaButtons(element.id, 'completed'), false, false);
                (0, timeout_1.timeout)().setTimeout(2, adapter.setTimeout(async () => {
                    await adapter.setState(getAdapterIds.idPositionToShift, 0, true);
                }, 1000));
                return;
            }
            await adapter.setForeignStateAsync(getAlexaIds.idAlexaButtons(element.id, 'completed'), true, false);
            (0, timeout_1.timeout)().setTimeout(3, adapter.setTimeout(async () => {
                await adapter.setState(getAdapterIds.idPositionToShift, 0, true);
            }, 1000));
        }
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error shift position', e, adapter);
    }
};
exports.shiftPosition = shiftPosition;
//# sourceMappingURL=shiftPosition.js.map