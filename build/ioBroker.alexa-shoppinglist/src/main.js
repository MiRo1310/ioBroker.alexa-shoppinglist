'use strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Created with @iobroker/create-adapter v2.0.1
 */
// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = __importStar(require("@iobroker/adapter-core"));
const addPosition_1 = require("./app/addPosition");
const updateListsOnChange_1 = require("./app/updateListsOnChange");
const deleteOrSetAsCompleted_1 = require("./app/deleteOrSetAsCompleted");
const shiftPosition_1 = require("./app/shiftPosition");
const timeout_1 = require("./app/timeout");
const ids_1 = require("./app/ids");
const utils_1 = require("./lib/utils");
const getAlexaDevices_1 = require("./app/getAlexaDevices");
const getShoppingLists_1 = require("./app/getShoppingLists");
const logging_1 = require("./app/logging");
class AlexaShoppinglist extends utils.Adapter {
    constructor(options = {}) {
        super({
            ...options,
            name: 'alexa-shoppinglist',
        });
        this.on('ready', this.onReady.bind(this));
        // @ts-expect-error
        this.on('message', this.onMessage.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }
    async onReady() {
        const adapter = this;
        await this.setState('info.connection', false, true);
        const { shoppinglist: idAlexa2ListJson, device: idAlexaEchoDotTextToCommand, doNotMovetoInactiv: directDelete, } = this.config;
        await this.getForeignState(idAlexa2ListJson, async (err, state) => {
            if (!state) {
                this.log.error(`The DataPoint ${idAlexa2ListJson} was not found!`);
                return;
            }
            (0, ids_1.initAlexaInstanceValues)(adapter, idAlexa2ListJson);
            const { getAdapterIds, validateIds } = (0, ids_1.adapterIds)();
            let positionToShift = 0;
            let jsonActive = [];
            let jsonInactive = [];
            const idSortActiveState = await this.getStateAsync(getAdapterIds.idSortActiveList);
            const idSortInActiveState = await this.getStateAsync(getAdapterIds.idSortInActiveList);
            let sortListActive = idSortActiveState?.val
                ? String(idSortActiveState.val)
                : '1';
            let sortListInActive = idSortInActiveState?.val
                ? String(idSortInActiveState.val)
                : '1';
            this.log.info('Alexa State was found');
            await this.setState('info.connection', true, true);
            ({ jsonInactive, jsonActive } = await (0, updateListsOnChange_1.updateListsOnChange)(adapter, sortListActive, sortListInActive, idAlexa2ListJson));
            let valueOld = null;
            const { isToInActiveList, isDeleteActiveList, isDeleteInActiveList, isToActiveList, isPositionToShift, isAddPosition, } = validateIds;
            this.on('stateChange', async (id, state) => {
                if (state?.val && state?.val !== valueOld) {
                    valueOld = state.val;
                    try {
                        if (id === idAlexa2ListJson) {
                            ({ jsonInactive, jsonActive } = await (0, updateListsOnChange_1.updateListsOnChange)(adapter, sortListActive, sortListInActive, idAlexa2ListJson));
                            if (directDelete && jsonInactive[0]) {
                                this.log.debug('Delete inactive list');
                                await (0, deleteOrSetAsCompleted_1.deleteOrSetAsCompleted)(adapter, jsonInactive, '#delete');
                            }
                        }
                        if ((0, utils_1.isStateValue)(state, 'string') &&
                            (id === getAdapterIds.idSortActiveList || id === getAdapterIds.idSortInActiveList)) {
                            if (id === getAdapterIds.idSortActiveList) {
                                sortListActive = state.val;
                            }
                            else {
                                sortListInActive = state.val;
                            }
                            ({ jsonActive, jsonInactive } = await (0, updateListsOnChange_1.updateListsOnChange)(adapter, sortListActive, sortListInActive, idAlexa2ListJson));
                            await this.setState(id, { ack: true });
                        }
                        if ((0, utils_1.isStateValue)(state, 'string') && isAddPosition(id)) {
                            await (0, addPosition_1.addPosition)(adapter, state.val, idAlexaEchoDotTextToCommand);
                            await this.setState(id, { ack: true });
                        }
                        if ((0, utils_1.isStateValue)(state, 'boolean') && isDeleteInActiveList(id)) {
                            await (0, deleteOrSetAsCompleted_1.deleteOrSetAsCompleted)(adapter, jsonInactive, '#delete');
                            await this.setState(id, { ack: true });
                        }
                        if ((0, utils_1.isStateValue)(state, 'boolean') && isDeleteActiveList(id)) {
                            await (0, deleteOrSetAsCompleted_1.deleteOrSetAsCompleted)(adapter, jsonActive, 'completed');
                            await this.setState(id, { ack: true });
                        }
                        if ((0, utils_1.isStateValue)(state, 'boolean') && isToInActiveList(id)) {
                            await (0, shiftPosition_1.shiftPosition)(adapter, positionToShift, jsonActive, 'toInActiv');
                            await this.setState(id, { ack: true });
                        }
                        if ((0, utils_1.isStateValue)(state, 'boolean') && isToActiveList(id)) {
                            await (0, shiftPosition_1.shiftPosition)(adapter, positionToShift, jsonInactive, 'toActiv');
                            await this.setState(id, { ack: true });
                        }
                        if ((0, utils_1.isStateValue)(state, 'number') && isPositionToShift(id)) {
                            positionToShift = state.val;
                            await this.setState(id, { ack: true });
                        }
                    }
                    catch (e) {
                        (0, logging_1.errorLogger)('Error stage changed', e, this);
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
        });
    }
    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     *
     * @param callback {() => void} The callback function
     */
    onUnload(callback) {
        try {
            const timeouts = (0, timeout_1.timeout)();
            this.clearTimeout(timeouts.getTimeout(1));
            this.clearTimeout(timeouts.getTimeout(2));
            this.clearTimeout(timeouts.getTimeout(3));
            callback();
        }
        catch (e) {
            (0, logging_1.errorLogger)('OnUnload', e, this);
            callback();
        }
    }
    async onMessage(obj) {
        if (obj) {
            switch (obj.command) {
                case 'getDevices': {
                    await (0, getAlexaDevices_1.getAlexaDevices)(this, obj);
                    break;
                }
                case 'getShoppinglist': {
                    await (0, getShoppingLists_1.getShoppingLists)(this, obj);
                    break;
                }
            }
        }
    }
}
exports.default = AlexaShoppinglist;
if (require.main !== module) {
    // Export the constructor in compact mode
    /**
     * @param [options] {object} Some options
     */
    module.exports = (options) => new AlexaShoppinglist(options);
}
else {
    // otherwise start the instance directly
    new AlexaShoppinglist();
}
//# sourceMappingURL=main.js.map