"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var addPosition_exports = {};
__export(addPosition_exports, {
  addPosition: () => addPosition,
  addPositionNumberAndBtn: () => addPositionNumberAndBtn
});
module.exports = __toCommonJS(addPosition_exports);
var import_timeout = require("./timeout");
var import_ids = require("./ids");
const addPositionNumberAndBtn = (adapter, array, list) => {
  let num = 0;
  const symbolLink = "\u274C";
  const symbolMoveToInactive = "\u21AA";
  const symbolMoveToActive = "\u21A9";
  const colorBtnON = "green";
  const { getAlexaIds } = (0, import_ids.adapterIds)();
  for (const element of array) {
    num++;
    element.pos = num;
    const idAlexaButtonDelete = getAlexaIds.idAlexaButtons(element.id, "#delete");
    const idAlexaButtonCompleted = getAlexaIds.idAlexaButtons(element.id, "completed");
    const val1JSON = `<button style="border:none; cursor:pointer; background-color:transparent; color:white; font-size:1em; text-align:center" value="toggle" onclick="setOnDblClickCustomShop('${idAlexaButtonDelete},${true}')">${symbolLink}</button> <font color="${colorBtnON}">`;
    if (list === "active") {
      element.buttonmove = `<button style="border:none; cursor:pointer; background-color:transparent; color:white; font-size:1em; text-align:center" value="toggle" onclick="setOnDblClickCustomShop('${idAlexaButtonCompleted},${true}')">${symbolMoveToInactive}</button> <font color="${colorBtnON}">`;
    }
    if (list === "inactive") {
      element.buttonmove = `<button style="border:none; cursor:pointer; background-color:transparent; color:white; font-size:1em; text-align:center" value="toggle" onclick="setOnDblClickCustomShop('${idAlexaButtonCompleted},${false}')">${symbolMoveToActive}</button> <font color="${colorBtnON}">`;
    }
    element.buttondelete = val1JSON;
  }
};
const addPosition = async (adapter, element, idTextToCommand) => {
  const { getAdapterIds, getAlexaIds } = (0, import_ids.adapterIds)();
  const { listName } = getAlexaIds.alexaInstanceValues;
  const result = await adapter.getForeignStateAsync(idTextToCommand, async () => {
  });
  if (!result) {
    adapter.log.info("State not found! Please check the ID!");
    return;
  }
  await adapter.setForeignStateAsync(idTextToCommand, `${element} to ${listName} list`, false);
  (0, import_timeout.timeout)().setTimeout(
    1,
    adapter.setTimeout(async () => {
      await adapter.setState(getAdapterIds.idAddPosition, "", false);
    }, 2e3)
  );
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  addPosition,
  addPositionNumberAndBtn
});
//# sourceMappingURL=addPosition.js.map
