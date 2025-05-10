interface TimeoutObject {
    timeout1: ioBroker.Timeout | null;
    timeout2: ioBroker.Timeout | null;
    timeout3: ioBroker.Timeout | null;
}

const timeouts: TimeoutObject = {
    timeout1: null,
    timeout2: null,
    timeout3: null,
};

export const timeout = (): {
    getTimeout: (timeout: number) => ioBroker.Timeout | null;
    setTimeout: (timeout: number, value: ioBroker.Timeout) => void;
} => {
    return {
        getTimeout: (timeout: number): ioBroker.Timeout | null => timeouts[`timeout${timeout}`],
        setTimeout: (timeout: number, value: ioBroker.Timeout): void => {
            timeouts[`timeout${timeout}`] = value;
        },
    };
};
