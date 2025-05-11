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
var getAlexaDevices_exports = {};
__export(getAlexaDevices_exports, {
  getAlexaDevices: () => getAlexaDevices
});
module.exports = __toCommonJS(getAlexaDevices_exports);
const getAlexaDevices = async (adapter, obj) => {
  const devices = await adapter.getObjectViewAsync("system", "device", {
    startkey: `${obj.message.alexa}.Echo-Devices.`,
    endkey: `${obj.message.alexa}.Echo-Devices.\u9999`
  });
  const result = [];
  for (let i = 0; i < devices.rows.length; i++) {
    const a = devices.rows[i];
    if (a.value && a.value.common.name !== "Timer" && a.value.common.name !== "Reminder" && a.value.common.name !== "Alarm") {
      result.push({
        label: a.value.common.name,
        value: `${a.id}.Commands.textCommand`
      });
    }
  }
  obj.callback && adapter.sendTo(obj.from, obj.command, result, obj.callback);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getAlexaDevices
});
//# sourceMappingURL=getAlexaDevices.js.map
