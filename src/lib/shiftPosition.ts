export const shiftPosition = (pos, array, direction) => {
    for (const element of array) {
        if (pos === element.pos) {
            if (direction === 'toActiv') {
                this.setForeignStateAsync(`${idAdapter}.items.${element.id}.completed`, false, false);
                timeout_2 = this.setTimeout(() => {
                    this.setState(`alexa-shoppinglist.${this.instance}.position_to_shift`, 0, true);
                }, 1000);
            } else {
                this.setForeignStateAsync(`${idAdapter}.items.${element.id}.completed`, true, false);
                timeout_3 = this.setTimeout(() => {
                    this.setState(`alexa-shoppinglist.${this.instance}.position_to_shift`, 0, true);
                }, 1000);
            }
        }
    }
};
