let lastId = 0;
export function uniqueId(prefix = 'id-') {
    lastId += 1;
    return `${prefix}${lastId}`;
}
