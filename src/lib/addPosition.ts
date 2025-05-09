import type { Instance } from '../types/types';
import type AlexaShoppinglist from '../main';

export const addPos = (
    array: {
        pos: number;
        id: string;
        buttonmove: string;
        buttondelete: string;
    }[],
    list: 'activ' | 'inactiv',
    idInstance: Instance,
): void => {
    let num = 0;
    // Button
    const symbolLink = '❌';
    const symbolMoveToInactive = '↪';
    const symbolMoveToActive = '↩';
    const colorBtnON = 'green';

    for (const element of array) {
        // Positionsnummern eintragen
        num++;
        element.pos = num;

        // Button Delete
        const valButtonDelete = `alexa2.0.Lists.${idInstance.list}.items.${element.id}.#delete`;

        // Button Completed
        const valButtonMove = `alexa2.0.Lists.${idInstance.list}.items.${element.id}.completed`;

        // Der Button delete

        const val1JSON = `<button style="border:none; cursor:pointer; background-color:transparent; color:white; font-size:1em; text-align:center" value="toggle" onclick="setOnDblClickCustomShop('${
            valButtonDelete
        },${true}')">${symbolLink}</button> <font color="${colorBtnON}">`;
        if (list === 'activ') {
            element.buttonmove = `<button style="border:none; cursor:pointer; background-color:transparent; color:white; font-size:1em; text-align:center" value="toggle" onclick="setOnDblClickCustomShop('${
                valButtonMove
            },${true}')">${symbolMoveToInactive}</button> <font color="${colorBtnON}">`;
        }
        if (list === 'inactiv') {
            element.buttonmove = `<button style="border:none; cursor:pointer; background-color:transparent; color:white; font-size:1em; text-align:center" value="toggle" onclick="setOnDblClickCustomShop('${
                valButtonMove
            },${false}')">${symbolMoveToActive}</button> <font color="${colorBtnON}">`;
        }

        element.buttondelete = val1JSON;
    }
};

/**
 * Fügt einen Artikel zur Liste hinzu
 *
 * @param adapter
 * @param element Artikel der hinzugefügt werden soll
 * @param idTextToCommand
 * @param list
 */
export const addPosition = async (
    adapter: AlexaShoppinglist,
    element: ioBroker.StateValue,
    idTextToCommand: string,
    list: string,
): Promise<number> => {
    let timeout_1: ioBroker.Timeout;
    await adapter.getForeignStateAsync(idTextToCommand, async (err, obj) => {
        if (err || obj === '') {
            adapter.log.info('State not found! Please check the ID!');
        } else {
            await adapter.setForeignStateAsync(idTextToCommand, `${element} zur ${list} liste`, false);
            timeout_1 = adapter.setTimeout(async () => {
                await adapter.setState(`alexa-shoppinglist.${adapter.instance}.add_position`, '', false);
            }, 2000);
        }
    });
    return timeout_1;
};
