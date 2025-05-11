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
var getShoppingLists_exports = {};
__export(getShoppingLists_exports, {
  getShoppingLists: () => getShoppingLists
});
module.exports = __toCommonJS(getShoppingLists_exports);
const getShoppingLists = async (adapter, obj) => {
  const result = [];
  const lists = await adapter.getObjectViewAsync("system", "channel", {
    startkey: `${obj.message.alexa}.Lists.`,
    endkey: `${obj.message.alexa}.Lists.\u9999`
  });
  for (let i = 0; i < lists.rows.length; i++) {
    const a = lists.rows[i];
    if (a.value && a.id.split(".").length === 4) {
      result.push({
        label: `${JSON.stringify(a.value.common.name)}`,
        value: `${a.id}.json`
      });
    }
  }
  obj.callback && adapter.sendTo(obj.from, obj.command, result, obj.callback);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getShoppingLists
});
//# sourceMappingURL=getShoppingLists.js.map
