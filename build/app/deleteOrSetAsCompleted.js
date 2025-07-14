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
var deleteOrSetAsCompleted_exports = {};
__export(deleteOrSetAsCompleted_exports, {
  deleteOrSetAsCompleted: () => deleteOrSetAsCompleted
});
module.exports = __toCommonJS(deleteOrSetAsCompleted_exports);
var import_ids = require("./ids");
var import_logging = require("./logging");
const deleteOrSetAsCompleted = async (adapter, array, status) => {
  try {
    const { idAlexaButtons } = (0, import_ids.adapterIds)().getAlexaIds;
    for (const { id } of array) {
      await adapter.setForeignStateAsync(idAlexaButtons(id, status), true, false);
    }
  } catch (e) {
    (0, import_logging.errorLogger)("Error delete or set as completed", e, adapter);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  deleteOrSetAsCompleted
});
//# sourceMappingURL=deleteOrSetAsCompleted.js.map
