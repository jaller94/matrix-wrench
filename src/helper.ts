/**
 * Takes CSS class names and combines them to one string.
 * Conditional class names may be defined as an object. Keys with a truthy value will be added as class names.
 * Similar to the NPM package classnames.
 */
export function classnames(...arr: (string | Record<string, boolean>)[]): string {
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
export function fillInVariables(template: string, variables: Record<string, string> = {}): string {
    let result = template;
    let match;
    while ((match = result.match(variablePattern))) {
        result = result.slice(0, match.index) + encodeURIComponent(variables[match.groups.key]) + result.slice(match.index + match[0].length);
    }
    return result;
}
const variablePattern = /!{(?<key>.+?)}/;

/**
 * Generates unique IDs.
 * These can be used as stable IDs for HTML inputs and labels.
 */
export function uniqueId(prefix = 'id-'): string {
    lastId += 1;
    return `${prefix}${lastId}`;
}
let lastId = 0;

export function getServerNameFromMXID(mxid: string) {
    const index = mxid.indexOf(':');
    if (!mxid.startsWith('@') || index === -1) {
        throw Error('MXID format is invalid');
    }
    return mxid.slice(mxid.indexOf(':') + 1);
}

export function memberEventsToGroups<T extends {content: {membership: string}}>(memberEvents: T[] | null) {
    if (!Array.isArray(memberEvents)) {
        return null;
    }
    const membersByMembership = new Map<string, T[]>();
    for (const event of memberEvents) {
        const arr = membersByMembership.get(event.content.membership) ?? [];
        if (arr.length === 0) {
            membersByMembership.set(event.content.membership, arr);
        }
        arr.push(event);
    }
    return membersByMembership;
}
