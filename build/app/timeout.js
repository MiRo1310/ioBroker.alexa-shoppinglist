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
var timeout_exports = {};
__export(timeout_exports, {
  timeout: () => timeout
});
module.exports = __toCommonJS(timeout_exports);
const timeouts = {
  timeout1: null,
  timeout2: null,
  timeout3: null
};
const timeout = () => {
  return {
    getTimeout: (timeout2) => timeouts[`timeout${timeout2}`],
    setTimeout: (timeout2, value) => {
      if (!value) {
        return;
      }
      timeouts[`timeout${timeout2}`] = value;
    }
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  timeout
});
//# sourceMappingURL=timeout.js.map
