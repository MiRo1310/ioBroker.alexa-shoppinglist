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
  initAlexaInstanceValues: () => initAlexaInstanceValues
});
module.exports = __toCommonJS(ids_exports);
var import_utils = require("../lib/utils");
const initAlexaInstanceValues = (adapter, idShoppingList) => {
  var _a, _b, _c;
  const alexaStateArray = idShoppingList.split(".");
  adapterIds().setIds.setAlexaInstanceValues(
    {
      adapter: alexaStateArray[0],
      instanz: (_a = alexaStateArray[1]) != null ? _a : "",
      channel_history: (_b = alexaStateArray[2]) != null ? _b : "",
      listNameOriginal: (_c = alexaStateArray[3]) != null ? _c : "",
      listName: alexaStateArray[3].replace("_", " ").toLowerCase().replace("list", " ")
    },
    `alexa-shoppinglist.${adapter.instance}`,
    idShoppingList
  );
};
let alexaShoppingListAdapterInstanceId = ``;
function adapterIds() {
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
      idPositionToShift: `${alexaShoppingListAdapterInstanceId}.position_to_shift`,
      idToActiveList: `${alexaShoppingListAdapterInstanceId}.to_activ_list`,
      idToInActiveList: `${alexaShoppingListAdapterInstanceId}.to_inactiv_list`,
      idDeleteActiveList: `${alexaShoppingListAdapterInstanceId}.delete_activ_list`,
      idDeleteInActiveList: `${alexaShoppingListAdapterInstanceId}.delete_inactiv_list`,
      idAddPosition: `${alexaShoppingListAdapterInstanceId}.add_position`,
      idSortActiveList: `${alexaShoppingListAdapterInstanceId}.sort_active_list`,
      idSortInActiveList: `${alexaShoppingListAdapterInstanceId}.sort_inactive_list`
    },
    getAlexaIds: {
      idAlexaButtons: (id, btn) => `${validateIds.getAlexaIds.idShoppingList}.items.${id}.${btn}`,
      alexaInstanceValues: {},
      idShoppingListJson: "",
      // Will be set on adapter start,
      idShoppingList: ""
      // Will be set on adapter start,
    },
    setIds: {
      setAlexaInstanceValues: (obj, instanceId, idAlexa) => {
        alexaShoppingListAdapterInstanceId = instanceId;
        validateIds.getAlexaIds.alexaInstanceValues = obj;
        validateIds.getAlexaIds.idShoppingListJson = idAlexa;
        validateIds.getAlexaIds.idShoppingList = (0, import_utils.getListId)(idAlexa);
      }
    }
  };
  return validateIds;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  adapterIds,
  initAlexaInstanceValues
});
//# sourceMappingURL=ids.js.map
