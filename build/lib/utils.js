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
var utils_exports = {};
__export(utils_exports, {
  firstLetterToUpperCase: () => firstLetterToUpperCase,
  isStateValue: () => isStateValue,
  sortList: () => sortList
});
module.exports = __toCommonJS(utils_exports);
const firstLetterToUpperCase = (name) => {
  const firstLetter = name.slice(0, 1);
  const leftoverLetters = name.slice(1);
  return firstLetter.toUpperCase() + leftoverLetters;
};
const sortList = (array, sortBy) => {
  if (sortBy === "1") {
    return array.sort((a, b) => {
      return a.ts - b.ts;
    });
  }
  if (sortBy === "2") {
    return array.sort((a, b) => {
      if (a.name > b.name) {
        return 1;
      } else if (a.name < b.name) {
        return -1;
      }
      return 0;
    });
  }
  return array;
};
const isStateValue = (state, type) => (state == null ? void 0 : state.val) !== void 0 && typeof state.val === type && !state.ack;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  firstLetterToUpperCase,
  isStateValue,
  sortList
});
//# sourceMappingURL=utils.js.map
