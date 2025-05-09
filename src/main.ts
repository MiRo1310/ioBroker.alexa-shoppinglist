'use strict';

/*
 * Created with @iobroker/create-adapter v2.0.1
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter

import * as utils from '@iobroker/adapter-core';
import type { Instance } from './types/types';
import { addPosition } from './lib/addPosition';
import { runFunction } from './lib/runFunction';
import { deleteListJsonInactive } from './lib/deletListJson';
import { deleteList } from './lib/deleteList';
import { shiftPosition } from './lib/shiftPosition';

let timeout_1: ioBroker.Timeout | undefined;
let timeout_2: ioBroker.Timeout | undefined;
let timeout_3: ioBroker.Timeout | undefined;
let idInstance: Instance;

export default class AlexaShoppinglist extends utils.Adapter {
    public constructor(options: Partial<utils.AdapterOptions> = {}) {
        super({
            ...options,
            name: 'alexa-shoppinglist',
        });
        this.on('ready', this.onReady.bind(this));
        this.on('message', this.onMessage.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    async onReady(): Promise<void> {
        const adapter = this;
        await this.setState('info.connection', false, true);

        const alexaState = this.config.shoppinglist;
        const idTextToCommand = this.config.device;
        const checkBox = this.config.doNotMovetoInactiv;

        this.log.info(`Checkbox: ${JSON.stringify(checkBox)}`);

        const alexaStateArray = alexaState.split('.');

        idInstance = {
            adapter: alexaStateArray[0],
            instanz: alexaStateArray[1],
            channel_history: alexaStateArray[2],
            list: alexaStateArray[3],
        };

        let list = '';
        if (alexaState) {
            list = idInstance.list.replace('_', ' ').toLowerCase().replace('list', ' ');
        }

        this.log.info(idTextToCommand);
        this.log.info(alexaState);

        const idAdapter = alexaState.slice(0, alexaState.length - 5);

        const idSortActive = `alexa-shoppinglist.${this.instance}.list_activ_sort`;
        const idSortInActive = `alexa-shoppinglist.${this.instance}.list_inactiv_sort`;

        let sortListActive = '1';
        let sortListInActive = '1';
        let positionToShift = 0;
        const jsonActive = [];
        const jsonInactive = [];

        const idSortActiveState = await this.getStateAsync(idSortActive);
        if (idSortActiveState && idSortActiveState.val && typeof idSortActiveState.val == 'string') {
            sortListActive = idSortActiveState.val;
        }

        const idSortInActiveState = await this.getStateAsync(idSortInActive);
        if (idSortInActiveState && idSortInActiveState.val && typeof idSortInActiveState.val == 'string') {
            sortListInActive = idSortInActiveState.val;
        }

        await this.getForeignState(alexaState, async (err, obj) => {
            if (err || obj == null) {
                this.log.error(`The DataPoint ${alexaState} was not found!`);
            } else {
                // Datenpunkt wurde gefunden
                this.log.info('Alexa State was found');
                await this.setState('info.connection', true, true);
                await runFunction(sortListActive, sortListInActive);
            }

            // --------------------------------------------------------------------------------------------

            let valueOld: ioBroker.StateValue = null;

            this.on('stateChange', async (id, state) => {
                if (state && state.val !== valueOld) {
                    valueOld = state.val;
                    try {
                        if (id === alexaState) {
                            await runFunction(sortListActive, sortListInActive).then(async () => {
                                //TODO
                                if (checkBox && jsonInactive[0]) {
                                    this.log.info('Inaktiven Artikel löschen');
                                    await deleteListJsonInactive(
                                        adapter,
                                        `alexa-shoppinglist.${this.instance}.delete_inactiv_list`,
                                        jsonInactive,
                                    );
                                }
                            });
                        }

                        // Auf Sortierungs Datenpunkt reagieren
                        if (
                            state &&
                            state.ack === false &&
                            typeof state.val == 'string' &&
                            (id === idSortActive || id === idSortInActive)
                        ) {
                            if (id === idSortActive) {
                                sortListActive = state.val;
                                this.log.info('Active Liste sortieren');
                            } else {
                                sortListInActive = state.val;
                                this.log.info('Inactive Liste sortieren');
                            }

                            this.log.info(sortListActive);
                            await runFunction(sortListActive, sortListInActive);

                            await this.setState(id, { ack: true });
                        }

                        // Position hinzufügen
                        if (
                            state &&
                            state.val &&
                            typeof state.val == 'string' &&
                            id === `alexa-shoppinglist.${this.instance}.add_position` &&
                            state.ack === false
                        ) {
                            await addPosition(adapter, state.val, idTextToCommand, list);

                            await this.setState(id, { ack: true });
                        }

                        // Inactiv Liste leeren, oder Grundsätzlich wenn Artikel von Activ gelöscht werden und Checkbox aktiv ist
                        if (
                            state?.val &&
                            typeof state.val == 'boolean' &&
                            id === `alexa-shoppinglist.${this.instance}.delete_inactiv_list` &&
                            state.ack === false
                        ) {
                            await deleteListJsonInactive(adapter, id, jsonInactive);
                        }
                        // Activ Liste leeren
                        if (
                            state?.val &&
                            typeof state.val == 'boolean' &&
                            id === `alexa-shoppinglist.${this.instance}.delete_activ_list` &&
                            state.ack === false
                        ) {
                            this.log.info('Active List deleted');
                            await deleteList(jsonActive, 'toInActiv');

                            await this.setState(id, { ack: true });
                        }

                        // Zu Inactiv Liste verschieben
                        if (
                            state?.val &&
                            id === `alexa-shoppinglist.${this.instance}.to_inactiv_list` &&
                            state.ack === false
                        ) {
                            this.log.info('Position to Inactive');
                            shiftPosition(positionToShift, jsonActive, 'toInActiv');

                            await this.setState(id, { ack: true });
                        }

                        // Zu Activ Liste verschieben
                        if (
                            state?.val &&
                            typeof state.val == 'boolean' &&
                            id === `alexa-shoppinglist.${this.instance}.to_activ_list` &&
                            state.ack === false
                        ) {
                            this.log.info('Position to Active');
                            shiftPosition(positionToShift, jsonInactive, 'toActiv');

                            await this.setState(id, { ack: true });
                        }
                        // Position die verschoben werden soll
                        if (
                            state &&
                            state.val &&
                            typeof state.val == 'number' &&
                            id === `alexa-shoppinglist.${this.instance}.position_to_shift` &&
                            state.ack === false
                        ) {
                            this.log.info('Position');
                            positionToShift = state.val;

                            await this.setState(id, { ack: true });
                        }
                    } catch (e) {
                        this.log.error(e);
                    }
                }
            });
        });

        await this.subscribeForeignStatesAsync(alexaState);

        await this.subscribeStatesAsync(idSortActive);
        await this.subscribeStatesAsync(idSortInActive);
        await this.subscribeStatesAsync(`alexa-shoppinglist.${this.instance}.add_position`);
        await this.subscribeStatesAsync(`alexa-shoppinglist.${this.instance}.to_activ_list`);
        await this.subscribeStatesAsync(`alexa-shoppinglist.${this.instance}.to_inactiv_list`);
        await this.subscribeStatesAsync(`alexa-shoppinglist.${this.instance}.delete_inactiv_list`);
        await this.subscribeStatesAsync(`alexa-shoppinglist.${this.instance}.delete_activ_list`);
        await this.subscribeStatesAsync(`alexa-shoppinglist.${this.instance}.position_to_shift`);
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     *
     * @param callback {() => void} The callback function
     */
    onUnload(callback: () => void): void {
        try {
            this.clearTimeout(timeout_1);
            this.clearTimeout(timeout_2);
            this.clearTimeout(timeout_3);

            callback();
        } catch (e: any) {
            this.log.error(e);
            callback();
        }
    }

    async onMessage(obj: { command: string; message: { alexa: string }; callback: any; from: string }): Promise<void> {
        if (obj) {
            switch (obj.command) {
                case 'getDevices': {
                    const devices = await this.getObjectViewAsync('system', 'device', {
                        startkey: `${obj.message.alexa}.Echo-Devices.`,
                        endkey: `${obj.message.alexa}.Echo-Devices.\u9999`,
                    });
                    const result: { label: ioBroker.StringOrTranslated; value: string }[] = [];
                    for (let i = 0; i < devices.rows.length; i++) {
                        const a = devices.rows[i];
                        if (
                            a.value &&
                            a.value.common.name !== 'Timer' &&
                            a.value.common.name !== 'Reminder' &&
                            a.value.common.name !== 'Alarm'
                        ) {
                            result.push({
                                label: a.value.common.name,
                                value: `${a.id}.Commands.textCommand`,
                            });
                        }
                    }
                    obj.callback && this.sendTo(obj.from, obj.command, result, obj.callback);
                    break;
                }
                case 'getShoppinglist': {
                    const result: { label: ioBroker.StringOrTranslated; value: string }[] = [];
                    const lists = await this.getObjectViewAsync('system', 'channel', {
                        startkey: `${obj.message.alexa}.Lists.`,
                        endkey: `${obj.message.alexa}.Lists.\u9999`,
                    });
                    for (let i = 0; i < lists.rows.length; i++) {
                        const a = lists.rows[i];
                        if (a.value && a.id.split('.').length === 4) {
                            result.push({
                                label: `${JSON.stringify(a.value.common.name)}`,
                                value: `${a.id}.json`,
                            });
                        }
                    }
                    obj.callback && this.sendTo(obj.from, obj.command, result, obj.callback);
                    break;
                }
            }
        }
    }
}

if (require.main !== module) {
    // Export the constructor in compact mode
    /**
     * @param [options] {object} Some options
     */
    module.exports = options => new AlexaShoppinglist(options);
} else {
    // otherwise start the instance directly
    new AlexaShoppinglist();
}
