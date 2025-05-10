import type { ShoppingList } from '../types/types';
import type AlexaShoppinglist from '../main';
import { timeout } from './timeout';
import { adapterIds, getAlexaInstanceValues } from './ids';

export const addPositionNumberAndBtn = (
    adapter: AlexaShoppinglist,
    array: ShoppingList[],
    list: 'active' | 'inactive',
): void => {
    const idInstance = getAlexaInstanceValues(adapter);
    let num = 0;
    // Button
    const symbolLink = '❌';
    const symbolMoveToInactive = '↪';
    const symbolMoveToActive = '↩';
    const colorBtnON = 'green';

    for (const element of array) {
        num++;
        element.pos = num; // Positionsnummern eintragen

        const idAlexaButtonDelete = `alexa2.0.Lists.${idInstance.list}.items.${element.id}.#delete`;
        const idAlexaButtonCompleted = `alexa2.0.Lists.${idInstance.list}.items.${element.id}.completed`;

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

        element.buttondelete = val1JSON;
    }
};

export const addPosition = async (
    adapter: AlexaShoppinglist,
    element: ioBroker.StateValue,
    idTextToCommand: string,
): Promise<void> => {
    const { listName } = getAlexaInstanceValues(adapter);
    const { getIds } = adapterIds(adapter);
    const result = await adapter.getForeignStateAsync(idTextToCommand, async () => {});

    if (!result) {
        adapter.log.info('State not found! Please check the ID!');
        return;
    }

    await adapter.setForeignStateAsync(idTextToCommand, `${element} to ${listName} list`, false);
    timeout().setTimeout(
        1,
        adapter.setTimeout(async () => {
            await adapter.setState(getIds.idAddPosition, '', false);
        }, 2000),
    );
};
