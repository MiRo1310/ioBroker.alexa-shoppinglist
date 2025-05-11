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
var updateListsOnChange_exports = {};
__export(updateListsOnChange_exports, {
  updateListsOnChange: () => updateListsOnChange
});
module.exports = __toCommonJS(updateListsOnChange_exports);
var import_utils = require("../lib/utils");
var import_addPosition = require("./addPosition");
var import_writeState = require("./writeState");
var import_logging = require("./logging");
const updateListsOnChange = async (adapter, sortListActive, sortListInActive, alexaState) => {
  let alexaListJson = {};
  try {
    alexaListJson = await adapter.getForeignStateAsync(alexaState);
    if ((alexaListJson == null ? void 0 : alexaListJson.val) && typeof alexaListJson.val == "string") {
      const alexaList = JSON.parse(alexaListJson.val);
      let jsonActive = [];
      let jsonInactive = [];
      for (const element of alexaList) {
        if (!element.completed) {
          pushToList(jsonActive, element);
        } else {
          pushToList(jsonInactive, element);
        }
      }
      jsonActive = (0, import_utils.sortList)(jsonActive, sortListActive);
      jsonInactive = (0, import_utils.sortList)(jsonInactive, sortListInActive);
      (0, import_addPosition.addPositionNumberAndBtn)(adapter, jsonActive, "active");
      (0, import_addPosition.addPositionNumberAndBtn)(adapter, jsonInactive, "inactive");
      (0, import_writeState.writeState)(adapter, jsonActive, jsonInactive);
      return { jsonActive, jsonInactive, error: false };
    }
    return { jsonActive: [], jsonInactive: [], error: true };
  } catch (e) {
    (0, import_logging.errorLogger)("Error update list on change", e, adapter);
    return { jsonActive: [], jsonInactive: [], error: true };
  }
};
function pushToList(list, element) {
  list.push({
    name: (0, import_utils.firstLetterToUpperCase)(element.value),
    time: new Date(element.createdDateTime).toLocaleString(),
    ts: new Date(element.createdDateTime).getTime(),
    id: element.id
  });
  return list;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  updateListsOnChange
});
//# sourceMappingURL=updateListsOnChange.js.map
