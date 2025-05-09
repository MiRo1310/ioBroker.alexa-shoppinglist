import { firstLetterToUpperCase, sortList } from './utils';
import { addPos } from './addPosition';
import { writeState } from './writeState';

export const runFunction = async (sortListActiv: string, sortListInActiv: string): Promise<void> => {
    let alexaListJson: ioBroker.State = {} as ioBroker.State;
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
            addPos(jsonActive, 'activ', idInstance);
            addPos(jsonInactive, 'inactiv', idInstance);
            writeState(jsonActive, jsonInactive);
        }
    } catch (e) {
        this.log.error(e);
    }
};
