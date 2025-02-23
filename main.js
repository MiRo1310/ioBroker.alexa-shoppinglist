'use strict';

/*
 * Created with @iobroker/create-adapter v2.0.1
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');

let checkBox;
let idTextToCommand;
let timeout_1;
let timeout_2;
let timeout_3;
let idInstance;

class AlexaShoppinglist extends utils.Adapter {
    /**
     * Options
     *
     * @param [options] {object} Some options
     */
    constructor(options) {
        super({
            ...options,
            name: 'alexa-shoppinglist',
        });
        this.on('ready', this.onReady.bind(this));
        this.on('message', this.onMessage.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    async onReady() {
        this.setState('info.connection', false, true);

        // Variablen
        const alexaState = this.config.shoppinglist;
        idTextToCommand = this.config.device;
        checkBox = this.config.doNotMovetoInactiv;

        this.log.info(`Checkbox: ${JSON.stringify(checkBox)}`);

        const alexaStateArray = alexaState.split('.');
        idInstance = {
            adapter: alexaStateArray[0],
            instanz: alexaStateArray[1],
            channel_history: alexaStateArray[2],
            list: alexaStateArray[3],
        };

        let list;
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
        let jsonActive;
        let jsonInactive;

        const idSortActiveState = await this.getStateAsync(idSortActive);
        if (idSortActiveState && idSortActiveState.val && typeof idSortActiveState.val == 'string') {
            sortListActive = idSortActiveState.val;
        }

        const idSortInActiveState = await this.getStateAsync(idSortInActive);
        if (idSortInActiveState && idSortInActiveState.val && typeof idSortInActiveState.val == 'string') {
            sortListInActive = idSortInActiveState.val;
        }

        /**General Function
         * @param {string} sortListActiv
         * @param {string} sortListInActiv
         */
        const runFunction = async (sortListActiv, sortListInActiv) => {
            let alexaListJson;
            try {
                alexaListJson = await this.getForeignStateAsync(alexaState);

                if (alexaListJson && alexaListJson.val && typeof alexaListJson.val == 'string') {
                    const alexaList = JSON.parse(alexaListJson.val);

                    jsonActive = [];
                    jsonInactive = [];
                    for (const element of alexaList) {
                        if (element.completed === false) {
                            jsonActive.push({
                                name: firstLetterToUpperCase(element.value),
                                time: new Date(element.createdDateTime).toLocaleString(),
                                id: element.id,
                            });
                        } else {
                            jsonInactive.push({
                                name: firstLetterToUpperCase(element.value),
                                time: new Date(element.createdDateTime).toLocaleString(),
                                id: element.id,
                            });
                        }
                    }

                    jsonActive = sortList(jsonActive, sortListActiv);
                    jsonInactive = sortList(jsonInactive, sortListInActiv);
                    addPos(jsonActive, 'activ');
                    addPos(jsonInactive, 'inactiv');
                    writeState(jsonActive, jsonInactive);
                }
            } catch (e) {
                this.log.error(e);
            }
        };

        /**
         * Ersetzt den ersten Buchstaben des eingegebenen Wortes durch den selbigen Großbuchstaben
         *
         * @param name "w"ort wo der erste Buchstabe groß geschrieben werden soll
         * @returns Rückgabewert mit "W"ort
         */
        const firstLetterToUpperCase = name => {
            const firstLetter = name.slice(0, 1); // Ersten Buchstaben selektieren
            const leftoverLetters = name.slice(1); // Restliche Buchstaben selektieren
            name = firstLetter.toUpperCase() + leftoverLetters; // Erster Buchstabe in Groß + Rest

            return name;
        };

        /**
         * Einzelne Elemente verschieben
         *
         * @param pos Die Position die verschoben werden soll
         * @param array Array, in welchem der Artikel sich befindet
         * @param direction In welche Richtung soll verschoben werden
         */
        const shiftPosition = (pos, array, direction) => {
            for (const element of array) {
                if (pos === element.pos) {
                    if (direction === 'toActiv') {
                        this.setForeignStateAsync(`${idAdapter}.items.${element.id}.completed`, false, false);
                        timeout_2 = setTimeout(() => {
                            this.setState(`alexa-shoppinglist.${this.instance}.position_to_shift`, 0, true);
                        }, 1000);
                    } else {
                        this.setForeignStateAsync(`${idAdapter}.items.${element.id}.completed`, true, false);
                        timeout_3 = setTimeout(() => {
                            this.setState(`alexa-shoppinglist.${this.instance}.position_to_shift`, 0, true);
                        }, 1000);
                    }
                }
            }
        };

        /**
         * Komplette Listen leeren
         *
         * @param array Array, welches bearbeitet werden soll
         * @param direction Soll zu Inaktiv geschoben werden "toInActiv", oder komplett löschen "delete"
         */
        const deleteList = async (array, direction) => {
            for (const element of array) {
                try {
                    if (direction === 'toInActiv') {
                        this.setForeignStateAsync(`${idAdapter}.items.${element.id}.completed`, true, false);
                    } else if (direction === 'delete') {
                        await this.setForeignStateAsync(`${idAdapter}.items.${element.id}.#delete`, true, false);
                    }
                } catch (e) {
                    this.log.error(e);
                }
            }
        };

        /**
         * Fügt einen Artikel zur Liste hinzu
         *
         * @param element Artikel der hinzugefügt werden soll
         */
        const addPosition = element => {
            this.getForeignStateAsync(idTextToCommand, (err, obj) => {
                if (err || obj === '') {
                    this.log.info('State not found! Please check the ID!');
                } else {
                    try {
                        this.setForeignStateAsync(idTextToCommand, `${element} zur ${list} liste`, false);
                        timeout_1 = setTimeout(() => {
                            this.setStateAsync(`alexa-shoppinglist.${this.instance}.add_position`, '', false);
                        }, 2000);
                    } catch (e) {
                        this.log.error(e);
                    }
                }
            });
        };

        /**
         * Sort List
         *
         * @param array Array, welches sortiert werden soll
         * @param kindOfSort Sortierung nach Zeit oder Name
         */
        const sortList = (array, kindOfSort) => {
            let arraySort;
            if (kindOfSort === '1') {
                arraySort = array.sort((a, b) => {
                    a.time - b.time;
                });
            } else {
                arraySort = array.sort((a, b) => {
                    if (a.name > b.name) {
                        return 1;
                    } else if (a.name < b.name) {
                        return -1;
                    }
                    return 0;
                });
            }
            return arraySort;
        };

        /**
         * Jeder Artikelposition eine Positionsnummer hinzufügen,
         *
         * @param array Aktiv oder Inaktiv Array
         * @param list Aktiv oder inactiv as String
         */
        const addPos = (array, list) => {
            let num = 0;
            // Button
            const symbolLink = '❌';
            const symbolMoveToInactiv = '↪';
            const symbolMoveToActiv = '↩';
            const farbeSchalterON = 'green';

            for (const element of array) {
                // Positionsnummern eintragen
                num++;
                element.pos = num;

                // ANCHOR - JSON Listen erstellen
                // Button Delete
                const valButtonDelete = `alexa2.0.Lists.${idInstance.list}.items.${element.id}.#delete`;

                // Button Completed
                const valButtonMove = `alexa2.0.Lists.${idInstance.list}.items.${element.id}.completed`;

                // Der Button delete

                const val1JSON = `<button style="border:none; cursor:pointer; background-color:transparent; color:white; font-size:1em; text-align:center" value="toggle" onclick="setOnDblClickCustomShop('${
                    valButtonDelete
                },${true}')">${symbolLink}</button> <font color="${farbeSchalterON}">`;
                if (list === 'activ') {
                    element.buttonmove = `<button style="border:none; cursor:pointer; background-color:transparent; color:white; font-size:1em; text-align:center" value="toggle" onclick="setOnDblClickCustomShop('${
                        valButtonMove
                    },${true}')">${symbolMoveToInactiv}</button> <font color="${farbeSchalterON}">`;
                }
                if (list === 'inactiv') {
                    element.buttonmove = `<button style="border:none; cursor:pointer; background-color:transparent; color:white; font-size:1em; text-align:center" value="toggle" onclick="setOnDblClickCustomShop('${
                        valButtonMove
                    },${false}')">${symbolMoveToActiv}</button> <font color="${farbeSchalterON}">`;
                }

                element.buttondelete = val1JSON;
            }
        };

        this.getForeignState(alexaState, (err, obj) => {
            if (err || obj == null) {
                this.log.error(`The DataPoint ${alexaState} was not found!`);
            } else {
                // Datenpunkt wurde gefunden
                this.log.info('Alexa State was found');
                this.setState('info.connection', true, true);
                runFunction(sortListActive, sortListInActive);
            }

            // --------------------------------------------------------------------------------------------

            let valueOld = null;
            // ANCHOR onStateChange
            this.on('stateChange', async (id, state) => {
                if (state && state.val !== valueOld) {
                    valueOld = state.val;
                    try {
                        if (id === alexaState) {
                            runFunction(sortListActive, sortListInActive).then(() => {
                                //TODO
                                if (checkBox && jsonInactive[0]) {
                                    this.log.info('Inaktiven Artikel löschen');
                                    deleteListJsonInactive(`alexa-shoppinglist.${this.instance}.delete_inactiv_list`);
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
                            runFunction(sortListActive, sortListInActive);

                            await this.setStateAsync(id, { ack: true });
                        }

                        // Position hinzufügen
                        if (
                            state &&
                            state.val &&
                            typeof state.val == 'string' &&
                            id === `alexa-shoppinglist.${this.instance}.add_position` &&
                            state.ack === false
                        ) {
                            addPosition(state.val);

                            await this.setStateAsync(id, { ack: true });
                        }

                        // Inactiv Liste leeren, oder Grundsätzlich wenn Artikel von Activ gelöscht werden und Checkbox aktiv ist
                        if (
                            state &&
                            state.val &&
                            typeof state.val == 'boolean' &&
                            id === `alexa-shoppinglist.${this.instance}.delete_inactiv_list` &&
                            state.ack === false
                        ) {
                            deleteListJsonInactive(id);
                        }
                        // Activ Liste leeren
                        if (
                            state &&
                            state.val &&
                            typeof state.val == 'boolean' &&
                            id === `alexa-shoppinglist.${this.instance}.delete_activ_list` &&
                            state.ack === false
                        ) {
                            this.log.info('Active List deleted');
                            deleteList(jsonActive, 'toInActiv');

                            await this.setStateAsync(id, { ack: true });
                        }

                        // Zu Inactiv Liste verschieben
                        if (
                            state &&
                            state.val &&
                            id === `alexa-shoppinglist.${this.instance}.to_inactiv_list` &&
                            state.ack === false
                        ) {
                            this.log.info('Position to Inactive');
                            shiftPosition(positionToShift, jsonActive, 'toInActiv');

                            await this.setStateAsync(id, { ack: true });
                        }

                        // Zu Activ Liste verschieben
                        if (
                            state &&
                            state.val &&
                            typeof state.val == 'boolean' &&
                            id === `alexa-shoppinglist.${this.instance}.to_activ_list` &&
                            state.ack === false
                        ) {
                            this.log.info('Position to Active');
                            shiftPosition(positionToShift, jsonInactive, 'toActiv');

                            await this.setStateAsync(id, { ack: true });
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

                            await this.setStateAsync(id, { ack: true });
                        }
                    } catch (e) {
                        this.log.error(e);
                    }
                }
            });
        });

        const deleteListJsonInactive = async id => {
            this.log.info('Inactive List deleted');
            await deleteList(jsonInactive, 'delete');

            await this.setStateAsync(id, { ack: true });
        };

        /**
         *
         * @param arrayActiv  Aktiv Array
         * @param arrayInactiv Inaktiv Array
         */
        const writeState = (arrayActiv, arrayInactiv) => {
            this.setStateChanged(`alexa-shoppinglist.${this.instance}.list_activ`, JSON.stringify(arrayActiv), true);
            this.setStateChanged(
                `alexa-shoppinglist.${this.instance}.list_inactiv`,
                JSON.stringify(arrayInactiv),
                true,
            );
        };

        this.subscribeForeignStatesAsync(alexaState);

        this.subscribeStatesAsync(idSortActive);
        this.subscribeStatesAsync(idSortInActive);
        this.subscribeStatesAsync(`alexa-shoppinglist.${this.instance}.add_position`);
        this.subscribeStatesAsync(`alexa-shoppinglist.${this.instance}.to_activ_list`);
        this.subscribeStatesAsync(`alexa-shoppinglist.${this.instance}.to_inactiv_list`);
        this.subscribeStatesAsync(`alexa-shoppinglist.${this.instance}.delete_inactiv_list`);
        this.subscribeStatesAsync(`alexa-shoppinglist.${this.instance}.delete_activ_list`);
        this.subscribeStatesAsync(`alexa-shoppinglist.${this.instance}.position_to_shift`);
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     *
     * @param callback {() => void} The callback function
     */
    onUnload(callback) {
        try {
            clearTimeout(timeout_1);
            clearTimeout(timeout_2);
            clearTimeout(timeout_3);

            callback();
        } catch (e) {
            this.log.error(e);
            callback();
        }
    }

    async onMessage(obj) {
        if (obj) {
            switch (obj.command) {
                case 'getDevices': {
                    const devices = await this.getObjectViewAsync('system', 'device', {
                        startkey: `${obj.message.alexa}.Echo-Devices.`,
                        endkey: `${obj.message.alexa}.Echo-Devices.\u9999`,
                    });
                    const result = [];
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
                    const result = [];
                    const lists = await this.getObjectViewAsync('system', 'channel', {
                        startkey: `${obj.message.alexa}.Lists.`,
                        endkey: `${obj.message.alexa}.Lists.\u9999`,
                    });
                    for (let i = 0; i < lists.rows.length; i++) {
                        const a = lists.rows[i];
                        if (a.value && a.id.split('.').length === 4) {
                            result.push({
                                label: `${a.value.common.name}`,
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
