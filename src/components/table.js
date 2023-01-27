import { html, useCallback, useMemo, useState } from '../node_modules/htm/preact/standalone.module.js';

export function sortSymbol(direction) {
    if (direction === 'ascending') {
        return ' 🔼';
    } else if (direction === 'descending') {
        return ' 🔽';
    }
    return '';
}

function printValue(accessor, row) {
    if (accessor.endsWith('.length')) {
        return row[accessor.slice(0, -7)]?.length;
    } else if (accessor.endsWith('[,]')) {
        return ([...row[accessor.slice(0, -3)] ?? []]).join(', ');
    }
    return row[accessor];
}

export function TableHead({ propertyName, label, sortBys, onSortBys }) {
    const handleClick = useCallback(() => {
        const currentDirection = sortBys.find(([key]) => key === propertyName)?.[1];
        const flippedDirection = currentDirection === 'ascending' ? 'descending' : 'ascending';
        return onSortBys([[propertyName, flippedDirection]]);
    }, [propertyName, sortBys, onSortBys]);
    return html`<th onclick=${handleClick}>${label}${sortSymbol(sortBys.find(([key]) => key === propertyName)?.[1])}</th>`;
}

export function RoomListTable({ columns, data, primaryAccessor, sortBys, onSortBys }) {
    return html`
        <div class="room-list">
            <table>
                <thead>
                    <tr>
                        ${columns.map(column => html`
                            <${TableHead} key=${column.accessor} propertyName=${column.accessor} label=${column.Header} sortBys=${sortBys} onSortBys=${onSortBys} />
                        `)}
                    </tr>
                </thead>
                <tbody>
                    ${data.map(row => html`
                        <tr key=${row[primaryAccessor]}>
                            ${columns.map(column => html`
                                <td key=${column.accessor}>${printValue(column.accessor, row)}</td>
                            `)}
                        </tr>
                    `)}
                </tbody>
            </table>
        </div>
    `;
}

export function RoomListSorter({ data, ...props }) {
    const [sortBys, setSortBys] = useState([]);
    const processedData = useMemo(() => {
        let array = [...data];
        for (const [key, direction] of sortBys) {
            const directionFactor = direction === 'ascending' ? 1 : -1;
            if (key.endsWith('Count') || key.endsWith('PowerLevel')) {
                // numeric values
                array.sort((a, b) => directionFactor * ((a[key] ?? 0) - (b[key] ?? 0)));
            } else if (key.endsWith('.length')) {
                // length of an array
                const actualKey = key.slice(0, -7);
                array.sort((a, b) => directionFactor * ((a[actualKey]?.length ?? 0) - (b[actualKey]?.length ?? 0)));
            } else {
                // string values
                array.sort((a, b) => directionFactor * (a[key] ?? '').localeCompare((b[key] ?? '')));
            }
        }
        return array;
    }, [data, sortBys]);
    return html`<${RoomListTable}
        ...${props}
        data=${processedData}
        sortBys=${sortBys}
        onSortBys=${setSortBys}
    />`;
}

export function RoomListFilterer({ data, ...props }) {
    const [filters, setFilters] = useState([]);
    const processedData = useMemo(() => {
        return data.filter((row) => filters.every(filter => row[filter[0]].includes(filter[1])));
    }, [data, filters]);
    return html`<${RoomListSorter}
        ...${props}
        data=${processedData}
        onFilters=${setFilters}
    />`;
}
