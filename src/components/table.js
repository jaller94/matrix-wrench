import { html, useCallback, useMemo, useState } from '../node_modules/htm/preact/standalone.module.js';

export function sortSymbol(direction) {
    if (direction === 'ascending') {
        return ' 🔼';
    } else if (direction === 'descending') {
        return ' 🔽';
    }
    return '';
}

export function TableHead({ propertyName, label, sortBys, onSortBys }) {
    const handleClick = useCallback(() => {
        const currentDirection = sortBys.find(([key]) => key === propertyName)?.[1];
        const flippedDirection = currentDirection === 'ascending' ? 'descending' : 'ascending';
        return onSortBys([[propertyName, flippedDirection]]);
    }, [sortBys, onSortBys]);
    return html`<th onclick=${handleClick}>${label}${sortSymbol(sortBys.find(([key]) => key === propertyName)?.[1])}</th>`;
}

export function RoomListTable({ columns, data, sortBys, onSortBys }) {
    return html`
        <div className="room-list">
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
                        <tr key=${row.roomId}>
                            ${columns.map(column => html`
                                <td key=${column.accessor}>${column.accessor.endsWith('.length') ? row[column.accessor.slice(0, -7)]?.length : row[column.accessor]}</td>
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
            if (key.endsWith('Count')) {
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
