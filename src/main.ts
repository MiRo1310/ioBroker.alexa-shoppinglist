'use strict';

/*
 * Created with @iobroker/create-adapter v2.0.1
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter

import * as utils from '@iobroker/adapter-core';
import { addPosition } from './app/addPosition';
import { updateListsOnChange } from './app/updateListsOnChange';
import { deleteOrSetAsCompleted } from './app/deleteOrSetAsCompleted';
import { shiftPosition } from './app/shiftPosition';
import { timeout } from './app/timeout';
import { adapterIds, initAlexaInstanceValues } from './app/ids';
import type { OnMessageObj, ShoppingList, SortByTime1Alpha2 } from './types/types';
import { isStateValue } from './lib/utils';
import { getAlexaDevices } from './app/getAlexaDevices';
import { getShoppingLists } from './app/getShoppingLists';
import { errorLogger } from './app/logging';

export default class AlexaShoppinglist extends utils.Adapter {
    public constructor(options: Partial<utils.AdapterOptions> = {}) {
        super({
            ...options,
            name: 'alexa-shoppinglist',
        });
        this.on('ready', this.onReady.bind(this));
        // @ts-expect-error
        this.on('message', this.onMessage.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    async onReady(): Promise<void> {
        const adapter = this;
        await this.setState('info.connection', false, true);

        const {
            shoppinglist: idAlexa2ListJson,
            device: idAlexaEchoDotTextToCommand,
            doNotMovetoInactiv: directDelete,
        } = this.config;

        const state = await this.getForeignState(idAlexa2ListJson, () => {});

        if (!state) {
            this.log.error(`The DataPoint ${idAlexa2ListJson} was not found!`);
            return;
        }
        initAlexaInstanceValues(adapter, idAlexa2ListJson);
        const { getAdapterIds, validateIds } = adapterIds();

        let positionToShift = 0;
        let jsonActive: ShoppingList[] = [];
        let jsonInactive: ShoppingList[] = [];

        const idSortActiveState = await this.getStateAsync(getAdapterIds.idSortActiveList);
        const idSortInActiveState = await this.getStateAsync(getAdapterIds.idSortInActiveList);

        let sortListActive: SortByTime1Alpha2 = idSortActiveState?.val
            ? (String(idSortActiveState.val) as SortByTime1Alpha2)
            : '1';

        let sortListInActive: SortByTime1Alpha2 = idSortInActiveState?.val
            ? (String(idSortInActiveState.val) as SortByTime1Alpha2)
            : '1';

        this.log.info('Alexa State was found');
        await this.setState('info.connection', true, true);
        ({ jsonInactive, jsonActive } = await updateListsOnChange(
            adapter,
            sortListActive,
            sortListInActive,
            idAlexa2ListJson,
        ));

        let valueOld: ioBroker.StateValue = null;
        const {
            isToInActiveList,
            isDeleteActiveList,
            isDeleteInActiveList,
            isToActiveList,
            isPositionToShift,
            isAddPosition,
        } = validateIds;

        this.on('stateChange', async (id, state) => {
            if (state?.val && state?.val !== valueOld) {
                valueOld = state.val;
                try {
                    if (id === idAlexa2ListJson) {
                        ({ jsonInactive, jsonActive } = await updateListsOnChange(
                            adapter,
                            sortListActive,
                            sortListInActive,
                            idAlexa2ListJson,
                        ));
                        if (directDelete && jsonInactive[0]) {
                            this.log.debug('Delete inactive list');
                            await deleteOrSetAsCompleted(adapter, jsonInactive, '#delete');
                        }
                    }

                    if (
                        isStateValue(state, 'string') &&
                        (id === getAdapterIds.idSortActiveList || id === getAdapterIds.idSortInActiveList)
                    ) {
                        if (id === getAdapterIds.idSortActiveList) {
                            sortListActive = state.val as SortByTime1Alpha2;
                        } else {
                            sortListInActive = state.val as SortByTime1Alpha2;
                        }

                        ({ jsonActive, jsonInactive } = await updateListsOnChange(
                            adapter,
                            sortListActive,
                            sortListInActive,
                            idAlexa2ListJson,
                        ));
                        await this.setState(id, { ack: true });
                    }

                    if (isStateValue(state, 'string') && isAddPosition(id)) {
                        await addPosition(adapter, state.val, idAlexaEchoDotTextToCommand);
                        await this.setState(id, { ack: true });
                    }

                    if (isStateValue(state, 'boolean') && isDeleteInActiveList(id)) {
                        await deleteOrSetAsCompleted(adapter, jsonInactive, '#delete');
                        await this.setState(id, { ack: true });
                    }

                    if (isStateValue(state, 'boolean') && isDeleteActiveList(id)) {
                        await deleteOrSetAsCompleted(adapter, jsonActive, 'completed');
                        await this.setState(id, { ack: true });
                    }

                    if (isStateValue(state, 'boolean') && isToInActiveList(id)) {
                        await shiftPosition(adapter, positionToShift, jsonActive, 'toInActiv');
                        await this.setState(id, { ack: true });
                    }

                    if (isStateValue(state, 'boolean') && isToActiveList(id)) {
                        await shiftPosition(adapter, positionToShift, jsonInactive, 'toActiv');
                        await this.setState(id, { ack: true });
                    }

                    if (isStateValue(state, 'number') && isPositionToShift(id)) {
                        positionToShift = state.val;
                        await this.setState(id, { ack: true });
                    }
                } catch (e: any) {
                    errorLogger('Error stage changed', e, this);
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
    onUnload(callback: () => void): void {
        try {
            const timeouts = timeout();
            this.clearTimeout(timeouts.getTimeout(1));
            this.clearTimeout(timeouts.getTimeout(2));
            this.clearTimeout(timeouts.getTimeout(3));

            callback();
        } catch (e: any) {
            errorLogger('OnUnload', e, this);
            callback();
        }
    }

    async onMessage(obj: OnMessageObj): Promise<void> {
        if (obj) {
            switch (obj.command) {
                case 'getDevices': {
                    await getAlexaDevices(this, obj);
                    break;
                }
                case 'getShoppinglist': {
                    await getShoppingLists(this, obj);
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
    module.exports = (options: Partial<utils.AdapterOptions<undefined, undefined>>) => new AlexaShoppinglist(options);
} else {
    // otherwise start the instance directly
    new AlexaShoppinglist();
}
