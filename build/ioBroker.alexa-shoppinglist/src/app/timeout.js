"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeout = void 0;
const timeouts = {
    timeout1: null,
    timeout2: null,
    timeout3: null,
};
const timeout = () => {
    return {
        getTimeout: (timeout) => timeouts[`timeout${timeout}`],
        setTimeout: (timeout, value) => {
            if (!value) {
                return;
            }
            timeouts[`timeout${timeout}`] = value;
        },
    };
};
exports.timeout = timeout;
//# sourceMappingURL=timeout.js.map