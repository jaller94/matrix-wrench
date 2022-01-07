let lastId = 0;
export function uniqueId(prefix = 'id-') {
    lastId += 1;
    return `${prefix}${lastId}`;
}

export function classnames(...arr) {
    const classNames = [];
    for(const item of arr) {
        if (typeof item === 'string') {
            classNames.push(item);
        }
        if (typeof item === 'object') {
            Object.entries(item).forEach(([key, value]) => {
                if (value) {
                    classNames.push(key);
                }
            });
        }
    }
    return classNames.join(' ');
}
