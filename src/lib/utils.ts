export const firstLetterToUpperCase = (name: string): string => {
    const firstLetter = name.slice(0, 1); // Ersten Buchstaben selektieren
    const leftoverLetters = name.slice(1); // Restliche Buchstaben selektieren
    return firstLetter.toUpperCase() + leftoverLetters;
};

export const sortList = (
    array: { time: number; name: string }[],
    sortBy: string,
): {
    time: number;
    name: string;
}[] => {
    let arraySort: { time: number; name: string }[] = [];
    if (sortBy === '1') {
        arraySort = array.sort((a, b) => {
            return a.time - b.time;
        });
    } else {
        arraySort = array.sort((a, b) => {
            if (a.name > b.name) {
                return 1;
            } else if (a.name < b.name) {
                return -1;
            }
            return 0;
        });
    }
    return arraySort;
};
