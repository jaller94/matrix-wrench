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

export function fillInVariables(template, variables) {
    const variablePattern = /!{(.+?)}/;
    let match = template.match(variablePattern);
    while (match) {
        console.log(match);
        template = template.slice(0, match.index) + encodeURIComponent(variables[match[1]]) + template.slice(match.index + match[0].length);
        console.log(template);
        match = template.match(variablePattern);
    }
    return template;
}

let lastId = 0;
export function uniqueId(prefix = 'id-') {
    lastId += 1;
    return `${prefix}${lastId}`;
}
