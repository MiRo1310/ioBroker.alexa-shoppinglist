"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initAlexaInstanceValues = void 0;
exports.adapterIds = adapterIds;
const utils_1 = require("../lib/utils");
const initAlexaInstanceValues = (adapter, idShoppingList) => {
    const alexaStateArray = idShoppingList.split('.');
    adapterIds().setIds.setAlexaInstanceValues({
        adapter: alexaStateArray[0],
        instanz: alexaStateArray[1] ?? '',
        channel_history: alexaStateArray[2] ?? '',
        listNameOriginal: alexaStateArray[3] ?? '',
        listName: alexaStateArray[3]?.replace('_', ' ').toLowerCase()?.replace('list', ' ') ?? '',
    }, `alexa-shoppinglist.${adapter.instance}`, idShoppingList);
};
exports.initAlexaInstanceValues = initAlexaInstanceValues;
let alexaShoppingListAdapterInstanceId = ``;
const validateIds = {
    validateIds: {
        isPositionToShift: (id) => id === validateIds.getAdapterIds.idPositionToShift,
        isToActiveList: (id) => id === validateIds.getAdapterIds.idToActiveList,
        isToInActiveList: (id) => id === validateIds.getAdapterIds.idToInActiveList,
        isDeleteActiveList: (id) => id === validateIds.getAdapterIds.idDeleteActiveList,
        isDeleteInActiveList: (id) => id === validateIds.getAdapterIds.idDeleteInActiveList,
        isAddPosition: (id) => id === validateIds.getAdapterIds.idAddPosition,
    },
    getAdapterIds: {
        idPositionToShift: `${alexaShoppingListAdapterInstanceId}.position_to_shift`,
        idToActiveList: `${alexaShoppingListAdapterInstanceId}.to_activ_list`,
        idToInActiveList: `${alexaShoppingListAdapterInstanceId}.to_inactiv_list`,
        idDeleteActiveList: `${alexaShoppingListAdapterInstanceId}.delete_activ_list`,
        idDeleteInActiveList: `${alexaShoppingListAdapterInstanceId}.delete_inactiv_list`,
        idAddPosition: `${alexaShoppingListAdapterInstanceId}.add_position`,
        idSortActiveList: `${alexaShoppingListAdapterInstanceId}.list_active_sort`,
        idSortInActiveList: `${alexaShoppingListAdapterInstanceId}.list_inactive_sort`,
        idListActive: `${alexaShoppingListAdapterInstanceId}.list_activ`,
        idListInActive: `${alexaShoppingListAdapterInstanceId}.list_inactiv`,
    },
    getAlexaIds: {
        idAlexaButtons: (id, btn) => `${validateIds.getAlexaIds.idShoppingList}.items.${id}.${btn}`,
        alexaInstanceValues: {},
        idShoppingListJson: '',
        idShoppingList: '',
    },
    setIds: {
        setAlexaInstanceValues: (obj, instanceId, idAlexa) => {
            alexaShoppingListAdapterInstanceId = instanceId;
            validateIds.getAlexaIds.alexaInstanceValues = obj;
            validateIds.getAlexaIds.idShoppingListJson = idAlexa;
            validateIds.getAlexaIds.idShoppingList = (0, utils_1.getListId)(idAlexa);
            // Adapter-IDs aktualisieren
            validateIds.getAdapterIds.idPositionToShift = `${alexaShoppingListAdapterInstanceId}.position_to_shift`;
            validateIds.getAdapterIds.idToActiveList = `${alexaShoppingListAdapterInstanceId}.to_activ_list`;
            validateIds.getAdapterIds.idToInActiveList = `${alexaShoppingListAdapterInstanceId}.to_inactiv_list`;
            validateIds.getAdapterIds.idDeleteActiveList = `${alexaShoppingListAdapterInstanceId}.delete_activ_list`;
            validateIds.getAdapterIds.idDeleteInActiveList = `${alexaShoppingListAdapterInstanceId}.delete_inactiv_list`;
            validateIds.getAdapterIds.idAddPosition = `${alexaShoppingListAdapterInstanceId}.add_position`;
            validateIds.getAdapterIds.idSortActiveList = `${alexaShoppingListAdapterInstanceId}.list_active_sort`;
            validateIds.getAdapterIds.idSortInActiveList = `${alexaShoppingListAdapterInstanceId}.list_inactive_sort`;
            validateIds.getAdapterIds.idListActive = `${alexaShoppingListAdapterInstanceId}.list_activ`;
            validateIds.getAdapterIds.idListInActive = `${alexaShoppingListAdapterInstanceId}.list_inactiv`;
        },
    },
};
function adapterIds() {
    return validateIds;
}
//# sourceMappingURL=ids.js.map