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
var shiftPosition_exports = {};
__export(shiftPosition_exports, {
  shiftPosition: () => shiftPosition
});
module.exports = __toCommonJS(shiftPosition_exports);
var import_timeout = require("./timeout");
var import_ids = require("./ids");
var import_logging = require("./logging");
const shiftPosition = async (adapter, pos, array, list) => {
  try {
    const { getAlexaIds, getAdapterIds } = (0, import_ids.adapterIds)();
    for (const element of array) {
      if (pos !== element.pos) {
        continue;
      }
      if (list === "toActiv") {
        await adapter.setForeignStateAsync(getAlexaIds.idAlexaButtons(element.id, "completed"), false, false);
        (0, import_timeout.timeout)().setTimeout(
          2,
          adapter.setTimeout(async () => {
            await adapter.setState(getAdapterIds.idPositionToShift, 0, true);
          }, 1e3)
        );
        return;
      }
      await adapter.setForeignStateAsync(getAlexaIds.idAlexaButtons(element.id, "completed"), true, false);
      (0, import_timeout.timeout)().setTimeout(
        3,
        adapter.setTimeout(async () => {
          await adapter.setState(getAdapterIds.idPositionToShift, 0, true);
        }, 1e3)
      );
    }
  } catch (e) {
    (0, import_logging.errorLogger)("Error shift position", e, adapter);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  shiftPosition
});
//# sourceMappingURL=shiftPosition.js.map
