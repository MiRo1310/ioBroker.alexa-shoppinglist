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
var ids_exports = {};
__export(ids_exports, {
  adapterIds: () => adapterIds,
  getAlexaInstanceValues: () => getAlexaInstanceValues
});
module.exports = __toCommonJS(ids_exports);
const getAlexaInstanceValues = (adapter) => {
  var _a, _b, _c;
  const { idShoppingList } = adapterIds(adapter).getAdapterIds;
  const alexaStateArray = idShoppingList.split(".");
  return {
    adapter: alexaStateArray[0],
    instanz: (_a = alexaStateArray[1]) != null ? _a : "",
    channel_history: (_b = alexaStateArray[2]) != null ? _b : "",
    listId: (_c = alexaStateArray[3]) != null ? _c : "",
    listName: alexaStateArray[3].replace("_", " ").toLowerCase().replace("list", " ")
  };
};
function adapterIds(adapter) {
  const alexaId = `alexa-shoppinglist.${adapter.instance}`;
  const { listId } = getAlexaInstanceValues(adapter);
  const validateIds = {
    validateIds: {
      isPositionToShift: (id) => id === validateIds.getAdapterIds.idPositionToShift,
      isToActiveList: (id) => id === validateIds.getAdapterIds.idToActiveList,
      isToInActiveList: (id) => id === validateIds.getAdapterIds.idToInActiveList,
      isDeleteActiveList: (id) => id === validateIds.getAdapterIds.idDeleteActiveList,
      isDeleteInActiveList: (id) => id === validateIds.getAdapterIds.idDeleteInActiveList,
      isAddPosition: (id) => id === validateIds.getAdapterIds.idAddPosition
    },
    getAdapterIds: {
      idPositionToShift: `${alexaId}.position_to_shift`,
      idToActiveList: `${alexaId}.to_activ_list`,
      idToInActiveList: `${alexaId}.to_inactiv_list`,
      idDeleteActiveList: `${alexaId}.delete_activ_list`,
      idDeleteInActiveList: `${alexaId}.delete_inactiv_list`,
      idAddPosition: `${alexaId}.add_position`,
      idSortActiveList: `${alexaId}.sort_active_list`,
      idSortInActiveList: `${alexaId}.sort_inactive_list`,
      idShoppingList: ""
      // Will be set on adapter start,
    },
    getAlexaIds: {
      idAlexaButtonDelete: (id) => `alexa2.0.Lists.${listId}.items.${id}.#delete`,
      idAlexaButtonCompleted: (id) => `alexa2.0.Lists.${listId}.items.${id}.completed`
    },
    setIds: {
      setShoppingListId: (id) => validateIds.getAdapterIds.idShoppingList = id
    }
  };
  return validateIds;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  adapterIds,
  getAlexaInstanceValues
});
//# sourceMappingURL=ids.js.map
