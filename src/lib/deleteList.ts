export const deleteList = async (array, direction) => {
    for (const element of array) {
        try {
            if (direction === 'toInActiv') {
                await this.setForeignStateAsync(`${idAdapter}.items.${element.id}.completed`, true, false);
            } else if (direction === 'delete') {
                await this.setForeignStateAsync(`${idAdapter}.items.${element.id}.#delete`, true, false);
            }
        } catch (e) {
            this.log.error(e);
        }
    }
};
