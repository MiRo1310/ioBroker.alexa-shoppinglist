export const writeState = (arrayActiv, arrayInactiv) => {
    this.setStateChanged(`alexa-shoppinglist.${this.instance}.list_activ`, JSON.stringify(arrayActiv), true);
    this.setStateChanged(`alexa-shoppinglist.${this.instance}.list_inactiv`, JSON.stringify(arrayInactiv), true);
};
