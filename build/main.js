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
var import_logging = require("./app/logging");
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
    const {
      shoppinglist: idAlexa2ListJson,
      device: idAlexaEchoDotTextToCommand,
      doNotMovetoInactiv: directDelete
    } = this.config;
    const state = await this.getForeignState(idAlexa2ListJson, () => {
    });
    if (!state) {
      this.log.error(`The DataPoint ${idAlexa2ListJson} was not found!`);
      return;
    }
    (0, import_ids.initAlexaInstanceValues)(adapter, idAlexa2ListJson);
    const { getAdapterIds, validateIds } = (0, import_ids.adapterIds)();
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
      idAlexa2ListJson
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
    this.on("stateChange", async (id, state2) => {
      if ((state2 == null ? void 0 : state2.val) && (state2 == null ? void 0 : state2.val) !== valueOld) {
        valueOld = state2.val;
        try {
          if (id === idAlexa2ListJson) {
            ({ jsonInactive, jsonActive } = await (0, import_updateListsOnChange.updateListsOnChange)(
              adapter,
              sortListActive,
              sortListInActive,
              idAlexa2ListJson
            ));
            if (directDelete && jsonInactive[0]) {
              this.log.debug("Delete inactive list");
              await (0, import_deleteOrSetAsCompleted.deleteOrSetAsCompleted)(adapter, jsonInactive, "#delete");
            }
          }
          if ((0, import_utils.isStateValue)(state2, "string") && (id === getAdapterIds.idSortActiveList || id === getAdapterIds.idSortInActiveList)) {
            if (id === getAdapterIds.idSortActiveList) {
              sortListActive = state2.val;
            } else {
              sortListInActive = state2.val;
            }
            ({ jsonActive, jsonInactive } = await (0, import_updateListsOnChange.updateListsOnChange)(
              adapter,
              sortListActive,
              sortListInActive,
              idAlexa2ListJson
            ));
            await this.setState(id, { ack: true });
          }
          if ((0, import_utils.isStateValue)(state2, "string") && isAddPosition(id)) {
            await (0, import_addPosition.addPosition)(adapter, state2.val, idAlexaEchoDotTextToCommand);
            await this.setState(id, { ack: true });
          }
          if ((0, import_utils.isStateValue)(state2, "boolean") && isDeleteInActiveList(id)) {
            await (0, import_deleteOrSetAsCompleted.deleteOrSetAsCompleted)(adapter, jsonInactive, "#delete");
            await this.setState(id, { ack: true });
          }
          if ((0, import_utils.isStateValue)(state2, "boolean") && isDeleteActiveList(id)) {
            await (0, import_deleteOrSetAsCompleted.deleteOrSetAsCompleted)(adapter, jsonActive, "completed");
            await this.setState(id, { ack: true });
          }
          if ((0, import_utils.isStateValue)(state2, "boolean") && isToInActiveList(id)) {
            await (0, import_shiftPosition.shiftPosition)(adapter, positionToShift, jsonActive, "toInActiv");
            await this.setState(id, { ack: true });
          }
          if ((0, import_utils.isStateValue)(state2, "boolean") && isToActiveList(id)) {
            await (0, import_shiftPosition.shiftPosition)(adapter, positionToShift, jsonInactive, "toActiv");
            await this.setState(id, { ack: true });
          }
          if ((0, import_utils.isStateValue)(state2, "number") && isPositionToShift(id)) {
            positionToShift = state2.val;
            await this.setState(id, { ack: true });
          }
        } catch (e) {
          (0, import_logging.errorLogger)("Error stage changed", e, this);
        }
      }
    });
    await this.subscribeForeignStatesAsync(idAlexa2ListJson);
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
      (0, import_logging.errorLogger)("OnUnload", e, this);
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
