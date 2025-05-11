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
var writeState_exports = {};
__export(writeState_exports, {
  writeState: () => writeState
});
module.exports = __toCommonJS(writeState_exports);
var import_logging = require("./logging");
var import_ids = require("./ids");
const writeState = (adapter, arrayActive, arrayInactive) => {
  try {
    const { getAdapterIds } = (0, import_ids.adapterIds)();
    adapter.setStateChanged(getAdapterIds.idListActive, JSON.stringify(arrayActive), true);
    adapter.setStateChanged(getAdapterIds.idListInActive, JSON.stringify(arrayInactive), true);
  } catch (e) {
    (0, import_logging.errorLogger)("Error write state", e, adapter);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  writeState
});
//# sourceMappingURL=writeState.js.map
