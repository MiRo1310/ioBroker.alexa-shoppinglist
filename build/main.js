"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var main_exports = {};
__export(main_exports, {
  default: () => AlexaShoppinglist
});
module.exports = __toCommonJS(main_exports);
var utils = __toESM(require("@iobroker/adapter-core"));
var import_addPosition = require("./app/addPosition");
var import_updateListsOnChange = require("./app/updateListsOnChange");
var import_deleteOrSetAsCompleted = require("./app/deleteOrSetAsCompleted");
var import_shiftPosition = require("./app/shiftPosition");
var import_timeout = require("./app/timeout");
var import_ids = require("./app/ids");
var import_utils = require("./lib/utils");
var import_getAlexaDevices = require("./app/getAlexaDevices");
var import_getShoppingLists = require("./app/getShoppingLists");
class AlexaShoppinglist extends utils.Adapter {
  constructor(options = {}) {
    super({
      ...options,
      name: "alexa-shoppinglist"
    });
    this.on("ready", this.onReady.bind(this));
    this.on("message", this.onMessage.bind(this));
    this.on("unload", this.onUnload.bind(this));
  }
  async onReady() {
    const adapter = this;
    await this.setState("info.connection", false, true);
    const { shoppinglist: shoppingListId, device: idTextToCommand, doNotMovetoInactiv: checkBox } = this.config;
    const { getAdapterIds, validateIds, setIds } = (0, import_ids.adapterIds)(adapter);
    setIds.setShoppingListId(shoppingListId);
    const idAdapter = shoppingListId.slice(0, shoppingListId.length - 5);
    let positionToShift = 0;
    let jsonActive = [];
    let jsonInactive = [];
    const idSortActiveState = await this.getStateAsync(getAdapterIds.idSortActiveList);
    const idSortInActiveState = await this.getStateAsync(getAdapterIds.idSortInActiveList);
    let sortListActive = (idSortActiveState == null ? void 0 : idSortActiveState.val) ? String(idSortActiveState.val) : "1";
    let sortListInActive = (idSortInActiveState == null ? void 0 : idSortInActiveState.val) ? String(idSortInActiveState.val) : "1";
    this.log.info("Alexa State was found");
    await this.setState("info.connection", true, true);
    ({ jsonInactive, jsonActive } = await (0, import_updateListsOnChange.updateListsOnChange)(
      adapter,
      sortListActive,
      sortListInActive,
      shoppingListId
    ));
    let valueOld = null;
    const {
      isToInActiveList,
      isDeleteActiveList,
      isDeleteInActiveList,
      isToActiveList,
      isPositionToShift,
      isAddPosition
    } = validateIds;
    this.on("stateChange", async (id, state) => {
      if ((state == null ? void 0 : state.val) && (state == null ? void 0 : state.val) !== valueOld) {
        valueOld = state.val;
        try {
          if (id === shoppingListId) {
            ({ jsonInactive, jsonActive } = await (0, import_updateListsOnChange.updateListsOnChange)(
              adapter,
              sortListActive,
              sortListInActive,
              shoppingListId
            ));
            if (checkBox && jsonInactive[0]) {
              this.log.debug("Delete inactive list");
              await (0, import_deleteOrSetAsCompleted.deleteOrSetAsCompleted)(adapter, jsonInactive, "delete", idAdapter);
            }
          }
          if ((0, import_utils.isStateValue)(state, "string") && (id === getAdapterIds.idSortActiveList || id === getAdapterIds.idSortInActiveList)) {
            if (id === getAdapterIds.idSortActiveList) {
              sortListActive = state.val;
            } else {
              sortListInActive = state.val;
            }
            ({ jsonActive, jsonInactive } = await (0, import_updateListsOnChange.updateListsOnChange)(
              adapter,
              sortListActive,
              sortListInActive,
              shoppingListId
            ));
            await this.setState(id, { ack: true });
          }
          if ((0, import_utils.isStateValue)(state, "string") && isAddPosition(id)) {
            await (0, import_addPosition.addPosition)(adapter, state.val, idTextToCommand);
            await this.setState(id, { ack: true });
          }
          if ((0, import_utils.isStateValue)(state, "boolean") && isDeleteInActiveList(id)) {
            await (0, import_deleteOrSetAsCompleted.deleteOrSetAsCompleted)(adapter, jsonInactive, "delete", idAdapter);
            await this.setState(id, { ack: true });
          }
          if ((0, import_utils.isStateValue)(state, "boolean") && isDeleteActiveList(id)) {
            await (0, import_deleteOrSetAsCompleted.deleteOrSetAsCompleted)(adapter, jsonActive, "completed", idAdapter);
            await this.setState(id, { ack: true });
          }
          if ((0, import_utils.isStateValue)(state, "boolean") && isToInActiveList(id)) {
            await (0, import_shiftPosition.shiftPosition)(adapter, positionToShift, jsonActive, "toInActiv", idAdapter);
            await this.setState(id, { ack: true });
          }
          if ((0, import_utils.isStateValue)(state, "boolean") && isToActiveList(id)) {
            await (0, import_shiftPosition.shiftPosition)(adapter, positionToShift, jsonInactive, "toActiv", idAdapter);
            await this.setState(id, { ack: true });
          }
          if ((0, import_utils.isStateValue)(state, "number") && isPositionToShift(id)) {
            positionToShift = state.val;
            await this.setState(id, { ack: true });
          }
        } catch (e) {
          this.log.error(e);
        }
      }
    });
    await this.subscribeForeignStatesAsync(shoppingListId);
    await this.subscribeStatesAsync(getAdapterIds.idSortActiveList);
    await this.subscribeStatesAsync(getAdapterIds.idSortInActiveList);
    await this.subscribeStatesAsync(getAdapterIds.idAddPosition);
    await this.subscribeStatesAsync(getAdapterIds.idToActiveList);
    await this.subscribeStatesAsync(getAdapterIds.idToInActiveList);
    await this.subscribeStatesAsync(getAdapterIds.idDeleteInActiveList);
    await this.subscribeStatesAsync(getAdapterIds.idDeleteActiveList);
    await this.subscribeStatesAsync(getAdapterIds.idPositionToShift);
  }
  /**
   * Is called when adapter shuts down - callback has to be called under any circumstances!
   *
   * @param callback {() => void} The callback function
   */
  onUnload(callback) {
    try {
      const timeouts = (0, import_timeout.timeout)();
      this.clearTimeout(timeouts.getTimeout(1));
      this.clearTimeout(timeouts.getTimeout(2));
      this.clearTimeout(timeouts.getTimeout(3));
      callback();
    } catch (e) {
      this.log.error(e);
      callback();
    }
  }
  async onMessage(obj) {
    if (obj) {
      switch (obj.command) {
        case "getDevices": {
          await (0, import_getAlexaDevices.getAlexaDevices)(this, obj);
          break;
        }
        case "getShoppinglist": {
          await (0, import_getShoppingLists.getShoppingLists)(this, obj);
          break;
        }
      }
    }
  }
}
if (require.main !== module) {
  module.exports = (options) => new AlexaShoppinglist(options);
} else {
  new AlexaShoppinglist();
}
//# sourceMappingURL=main.js.map
