"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getListId = exports.isStateValue = exports.sortList = exports.firstLetterToUpperCase = void 0;
const firstLetterToUpperCase = (name) => {
    const firstLetter = name.slice(0, 1); // Ersten Buchstaben selektieren
    const leftoverLetters = name.slice(1); // Restliche Buchstaben selektieren
    return firstLetter.toUpperCase() + leftoverLetters;
};
exports.firstLetterToUpperCase = firstLetterToUpperCase;
const sortList = (array, sortBy) => {
    if (sortBy === '1') {
        return array.sort((a, b) => {
            return a.ts - b.ts;
        });
    }
    if (sortBy === '2') {
        return array.sort((a, b) => {
            if (a.name > b.name) {
                return 1;
            }
            else if (a.name < b.name) {
                return -1;
            }
            return 0;
        });
    }
    return array;
};
exports.sortList = sortList;
/*
Is State and Ack === false and State typeof === type
 */
const isStateValue = (state, type) => state?.val !== undefined && typeof state.val === type && !state.ack;
exports.isStateValue = isStateValue;
const getListId = (id) => {
    const parts = id.split('.'); //alexa2.0.Lists.SHOPPING_LIST.json
    parts.pop();
    return parts.join('.'); //alexa2.0.Lists.SHOPPING_LIST
};
exports.getListId = getListId;
//# sourceMappingURL=utils.js.map