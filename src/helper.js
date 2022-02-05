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
const variablePattern = /!{(.+?)}/;
export function fillInVariables(template, variables) {
    let match = template.match(variablePattern);
    while (match) {
        template = template.slice(0, match.index) + encodeURIComponent(variables[match[1]]) + template.slice(match.index + match[0].length);
        match = template.match(variablePattern);
    }
    return template;
}

let lastId = 0;
export function uniqueId(prefix = 'id-') {
    lastId += 1;
    return `${prefix}${lastId}`;
}
