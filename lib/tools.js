/**
 * Tests whether the given variable is really an Array
 *
 * @param it The variable to test
 * @returns True if the variable is an Array, false otherwise
 */
function isArray(it) {
    if (typeof Array.isArray === 'function') {
        return Array.isArray(it);
    }
    return Object.prototype.toString.call(it) === '[object Array]';
}

module.exports = {
    isArray,
};
