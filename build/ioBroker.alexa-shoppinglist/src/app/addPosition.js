"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPosition = exports.addPositionNumberAndBtn = void 0;
const timeout_1 = require("./timeout");
const ids_1 = require("./ids");
const logging_1 = require("./logging");
const addPositionNumberAndBtn = (adapter, array, list) => {
    let num = 0;
    // Button
    const symbolLink = '❌';
    const symbolMoveToInactive = '↪';
    const symbolMoveToActive = '↩';
    const colorBtnON = 'green';
    const { getAlexaIds } = (0, ids_1.adapterIds)();
    for (const element of array) {
        num++;
        element.pos = num; // Positionsnummern eintragen
        const idAlexaButtonDelete = getAlexaIds.idAlexaButtons(element.id, '#delete');
        const idAlexaButtonCompleted = getAlexaIds.idAlexaButtons(element.id, 'completed');
        // Der Button delete
        const val1JSON = `<button style="border:none; cursor:pointer; background-color:transparent; color:white; font-size:1em; text-align:center" value="toggle" onclick="setOnDblClickCustomShop('${idAlexaButtonDelete},${true}')">${symbolLink}</button> <font color="${colorBtnON}">`;
        if (list === 'active') {
            element.buttonmove = `<button style="border:none; cursor:pointer; background-color:transparent; color:white; font-size:1em; text-align:center" value="toggle" onclick="setOnDblClickCustomShop('${idAlexaButtonCompleted},${true}')">${symbolMoveToInactive}</button> <font color="${colorBtnON}">`;
        }
        if (list === 'inactive') {
            element.buttonmove = `<button style="border:none; cursor:pointer; background-color:transparent; color:white; font-size:1em; text-align:center" value="toggle" onclick="setOnDblClickCustomShop('${idAlexaButtonCompleted},${false}')">${symbolMoveToActive}</button> <font color="${colorBtnON}">`;
        }
        element.buttonDeleteId = idAlexaButtonDelete;
        element.buttonCompletedId = idAlexaButtonCompleted;
        element.buttondelete = val1JSON;
    }
};
exports.addPositionNumberAndBtn = addPositionNumberAndBtn;
const addPosition = async (adapter, element, idTextToCommand) => {
    try {
        const { getAdapterIds, getAlexaIds } = (0, ids_1.adapterIds)();
        const { listName } = getAlexaIds.alexaInstanceValues;
        const result = await adapter.getForeignStateAsync(idTextToCommand, async () => { });
        if (!result) {
            adapter.log.info('State not found! Please check the ID!');
            return;
        }
        await adapter.setForeignStateAsync(idTextToCommand, `${element} to ${listName} list`, false);
        (0, timeout_1.timeout)().setTimeout(1, adapter.setTimeout(async () => {
            await adapter.setState(getAdapterIds.idAddPosition, '', false);
        }, 2000));
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error add position', e, adapter);
    }
};
exports.addPosition = addPosition;
//# sourceMappingURL=addPosition.js.map