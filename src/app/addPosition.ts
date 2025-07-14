import type { ShoppingList } from '../types/types';
import type AlexaShoppinglist from '../main';
import { timeout } from './timeout';
import { adapterIds } from './ids';
import { errorLogger } from './logging';

export const addPositionNumberAndBtn = (
    adapter: AlexaShoppinglist,
    array: ShoppingList[],
    list: 'active' | 'inactive',
): void => {
    let num = 0;
    // Button
    const symbolLink = '❌';
    const symbolMoveToInactive = '↪';
    const symbolMoveToActive = '↩';
    const colorBtnON = 'green';
    const { getAlexaIds } = adapterIds();
    for (const element of array) {
        num++;
        element.pos = num; // Positionsnummern eintragen

        const idAlexaButtonDelete = getAlexaIds.idAlexaButtons(element.id, '#delete');
        const idAlexaButtonCompleted = getAlexaIds.idAlexaButtons(element.id, 'completed');

        // Der Button delete

        const val1JSON = `<button style="border:none; cursor:pointer; background-color:transparent; color:white; font-size:1em; text-align:center" value="toggle" onclick="setOnDblClickCustomShop('${
            idAlexaButtonDelete
        },${true}')">${symbolLink}</button> <font color="${colorBtnON}">`;

        if (list === 'active') {
            element.buttonmove = `<button style="border:none; cursor:pointer; background-color:transparent; color:white; font-size:1em; text-align:center" value="toggle" onclick="setOnDblClickCustomShop('${
                idAlexaButtonCompleted
            },${true}')">${symbolMoveToInactive}</button> <font color="${colorBtnON}">`;
        }

        if (list === 'inactive') {
            element.buttonmove = `<button style="border:none; cursor:pointer; background-color:transparent; color:white; font-size:1em; text-align:center" value="toggle" onclick="setOnDblClickCustomShop('${
                idAlexaButtonCompleted
            },${false}')">${symbolMoveToActive}</button> <font color="${colorBtnON}">`;
        }
        element.buttonDeleteId = idAlexaButtonDelete;
        element.buttonCompletedId = idAlexaButtonCompleted;
        element.buttondelete = val1JSON;
    }
};

export const addPosition = async (
    adapter: AlexaShoppinglist,
    element: ioBroker.StateValue,
    idTextToCommand: string,
): Promise<void> => {
    try {
        const { getAdapterIds, getAlexaIds } = adapterIds();
        const { listName } = getAlexaIds.alexaInstanceValues;
        const result = await adapter.getForeignStateAsync(idTextToCommand, async () => {});

        if (!result) {
            adapter.log.info('State not found! Please check the ID!');
            return;
        }

        await adapter.setForeignStateAsync(idTextToCommand, `${element} to ${listName} list`, false);
        timeout().setTimeout(
            1,
            adapter.setTimeout(async () => {
                await adapter.setState(getAdapterIds.idAddPosition, '', false);
            }, 2000),
        );
    } catch (e: any) {
        errorLogger('Error add position', e, adapter);
    }
};
