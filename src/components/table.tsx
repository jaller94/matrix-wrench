import React, { FC, ReactElement, useCallback, useMemo, useState } from 'react';

type Direction = 'ascending' | 'descending';

type SortBys = [key: string, direction: Direction][];

export function sortSymbol(direction: Direction | undefined): string {
    if (direction === 'ascending') {
        return ' 🔼';
    } else if (direction === 'descending') {
        return ' 🔽';
    }
    return '';
}

function printValue(accessor: string, row): unknown | undefined {
    if (accessor.endsWith('.length')) {
        return row[accessor.slice(0, -7)]?.length;
    } else if (accessor.endsWith('[,]')) {
        return ([...row[accessor.slice(0, -3)] ?? []]).join(', ');
    }
    return row[accessor];
}

type TableHeadProps = {
    propertyName: string,
    label: ReactElement,
    sortBys: SortBys,
    onSortBys: (sortBys: SortBys) => void,
};

export const TableHead: FC<TableHeadProps> = ({ propertyName, label, sortBys, onSortBys }) => {
    const handleClick = useCallback(() => {
        const currentDirection = sortBys.find(([key]) => key === propertyName)?.[1];
        const flippedDirection = currentDirection === 'ascending' ? 'descending' : 'ascending';
        return onSortBys([[propertyName, flippedDirection]]);
    }, [propertyName, sortBys, onSortBys]);
    return <th onClick={handleClick}>{label}{sortSymbol(sortBys.find(([key]) => key === propertyName)?.[1])}</th>;
}

type RoomListTableProps = {
    columns: {
        accessor: string,
        Header: ReactElement,
    }[],
    data: Record<string, unknown>[],
    primaryAccessor: string,
    sortBys: SortBys,
    onSortBys: (sortBys: SortBys) => void,
};

export const RoomListTable: FC<RoomListTableProps> = ({ columns, data, primaryAccessor, sortBys, onSortBys }) => {
    return (
        <div className="room-list">
            <table>
                <thead>
                    <tr>
                        {columns.map(column => (
                            <TableHead
                                key={column.accessor}
                                propertyName={column.accessor}
                                label={column.Header}
                                sortBys={sortBys}
                                onSortBys={onSortBys}
                            />
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map(row => (
                        <tr key={row[primaryAccessor]}>
                            {columns.map(column => (
                                <td key={column.accessor}>{printValue(column.accessor, row)}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

type RoomListSorterProps = RoomListTableProps;

export const RoomListSorter: FC<RoomListSorterProps> = ({ data, ...props }) => {
    const [sortBys, setSortBys] = useState<SortBys>([]);
    const processedData = useMemo(() => {
        const array = [...data];
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
    return <RoomListTable
        {...props}
        data={processedData}
        sortBys={sortBys}
        onSortBys={setSortBys}
    />;
}

export const RoomListFilterer = ({ data, ...props }) => {
    const [filters, setFilters] = useState([]);
    const processedData = useMemo(() => {
        return data.filter((row) => filters.every(filter => row[filter[0]].includes(filter[1])));
    }, [data, filters]);
    return <RoomListSorter
        {...props}
        data={processedData}
        onFilters={setFilters}
    />;
}
