export function classnames(...arr) {
    const classNames = new Set();
    for(const item of arr) {
        if (typeof item === 'string') {
            classNames.add(item);
        }
        if (typeof item === 'object') {
            Object.entries(item).forEach(([key, value]) => {
                if (value) {
                    classNames.add(key);
                }
            });
        }
    }
    return [...classNames].join(' ');
}

/**
 * Takes a string and fills placeholders with variables values.
 * e.g. "I like !{softwareProject}." could become "I like Matrix."
 */
const variablePattern = /!{(?<key>.+?)}/;
export function fillInVariables(template, variables) {
    let result = template;
    let match = result.match(variablePattern);
    while (match) {
        result = result.slice(0, match.index) + encodeURIComponent(variables[match.groups.key]) + result.slice(match.index + match[0].length);
        match = result.match(variablePattern);
    }
    return result;
}

let lastId = 0;
export function uniqueId(prefix = 'id-') {
    lastId += 1;
    return `${prefix}${lastId}`;
}
