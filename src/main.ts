'use strict';

/*
 * Created with @iobroker/create-adapter v2.0.1
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter

import * as utils from '@iobroker/adapter-core';
import { addPosition } from './lib/addPosition';
import { updateListsOnChange } from './lib/updateListsOnChange';
import { deleteOrSetAsCompleted } from './lib/deleteOrSetAsCompleted';
import { shiftPosition } from './lib/shiftPosition';
import { timeout } from './lib/timeout';
import { adapterIds } from './lib/ids';
import type { OnMessageObj, ShoppingList, SortByTime1Alpha2 } from './types/types';
import { isStateValue } from './lib/utils';
import { getAlexaDevices } from './lib/getAlexaDevices';
import { getShoppingLists } from './lib/getShoppingLists';

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

        const { shoppinglist: shoppingListId, device: idTextToCommand, doNotMovetoInactiv: checkBox } = this.config;

        const state = await this.getForeignState(shoppingListId, () => {});

        if (!state) {
            this.log.error(`The DataPoint ${shoppingListId} was not found!`);
            return;
        }
        const { getIds, validateIds, setIds } = adapterIds(adapter);
        setIds.setShoppingListId(shoppingListId);

        const idAdapter = shoppingListId.slice(0, shoppingListId.length - 5);

        let positionToShift = 0;
        let jsonActive: ShoppingList[] = [];
        let jsonInactive: ShoppingList[] = [];

        const idSortActiveState = await this.getStateAsync(getIds.idSortActiveList);
        const idSortInActiveState = await this.getStateAsync(getIds.idSortInActiveList);

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
            shoppingListId,
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
            if (state?.val !== valueOld) {
                valueOld = state.val;
                try {
                    if (id === shoppingListId) {
                        ({ jsonInactive, jsonActive } = await updateListsOnChange(
                            adapter,
                            sortListActive,
                            sortListInActive,
                            shoppingListId,
                        ));
                        if (checkBox && jsonInactive[0]) {
                            this.log.debug('Delete inactive list');
                            await deleteOrSetAsCompleted(adapter, jsonInactive, 'delete', idAdapter);
                        }
                    }

                    if (
                        isStateValue(state, 'string') &&
                        (id === getIds.idSortActiveList || id === getIds.idSortInActiveList)
                    ) {
                        if (id === getIds.idSortActiveList) {
                            sortListActive = state.val as SortByTime1Alpha2;
                        } else {
                            sortListInActive = state.val as SortByTime1Alpha2;
                        }

                        ({ jsonActive, jsonInactive } = await updateListsOnChange(
                            adapter,
                            sortListActive,
                            sortListInActive,
                            shoppingListId,
                        ));
                        await this.setState(id, { ack: true });
                    }

                    if (isStateValue(state, 'string') && isAddPosition(id)) {
                        await addPosition(adapter, state.val, idTextToCommand);
                        await this.setState(id, { ack: true });
                    }

                    if (isStateValue(state, 'boolean') && isDeleteInActiveList(id)) {
                        await deleteOrSetAsCompleted(adapter, jsonInactive, 'delete', idAdapter);
                        await this.setState(id, { ack: true });
                    }

                    if (isStateValue(state, 'boolean') && isDeleteActiveList(id)) {
                        await deleteOrSetAsCompleted(adapter, jsonActive, 'completed', idAdapter);
                        await this.setState(id, { ack: true });
                    }

                    if (isStateValue(state, 'boolean') && isToInActiveList(id)) {
                        await shiftPosition(adapter, positionToShift, jsonActive, 'toInActiv', idAdapter);
                        await this.setState(id, { ack: true });
                    }

                    if (isStateValue(state, 'boolean') && isToActiveList(id)) {
                        await shiftPosition(adapter, positionToShift, jsonInactive, 'toActiv', idAdapter);
                        await this.setState(id, { ack: true });
                    }

                    if (isStateValue(state, 'number') && isPositionToShift(id)) {
                        positionToShift = state.val;
                        await this.setState(id, { ack: true });
                    }
                } catch (e) {
                    this.log.error(e);
                }
            }
        });

        await this.subscribeForeignStatesAsync(shoppingListId);

        await this.subscribeStatesAsync(getIds.idSortActiveList);
        await this.subscribeStatesAsync(getIds.idSortInActiveList);
        await this.subscribeStatesAsync(getIds.idAddPosition);
        await this.subscribeStatesAsync(getIds.idToActiveList);
        await this.subscribeStatesAsync(getIds.idToInActiveList);
        await this.subscribeStatesAsync(getIds.idDeleteInActiveList);
        await this.subscribeStatesAsync(getIds.idDeleteActiveList);
        await this.subscribeStatesAsync(getIds.idPositionToShift);
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
            this.log.error(e);
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
