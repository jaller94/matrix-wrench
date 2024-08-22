import React, { ChangeEventHandler, FC, FormEventHandler, useCallback, useMemo, useState } from 'react';

function RegExpToggleButton({...props}) {
    return (
        <label
            className="reg-exp-toggle-button"
            title="Use Regular Expression"
        >
            <input
                {...props}
                type="checkbox"
            />
            <span>.*</span>
        </label>
    );
}

type ListWithSearchProps = {
    items: unknown[],
};

export const ListWithSearch: FC<ListWithSearchProps> = ({items: originalItems = []}) => {
    const [items, setItems] = useState<unknown[]>(originalItems);
    const [searchTerm, setSearchTerm] = useState('');
    const [isRegExp, setIsRegExp] = useState(false);

    const handleIsRegExpClick = useCallback(() => setIsRegExp(value => !value), []);

    const handleSearchTermInput: FormEventHandler<HTMLInputElement> = useCallback(event => {
        setSearchTerm(event.target.value);
    }, []);

    const filteredItems = useMemo(() => {
        if (isRegExp) {
            const regExp = new RegExp(searchTerm);
            return items.filter(item => regExp.test(item.id))
        }
        return items.filter(item => item.id.includes(searchTerm));
    }, [isRegExp, items, searchTerm]);

    const handleSelectAllChange: ChangeEventHandler<HTMLInputElement> = useCallback(event => {
        const targetValue = event.target.checked;
        setItems(items => items.map(item => {
            if (!filteredItems.includes(item)) {
                return item;
            }
            if (item.selected === targetValue) {
                return item;
            }
            return {
                ...item,
                selected: targetValue,
            }
        }))
    }, [filteredItems]);

    const itemsSelected = useMemo(() => {
        return items.filter(item => item.selected).length;
    }, [items]);

    const filteredItemsSelected = useMemo(() => {
        return filteredItems.filter(item => item.selected).length;
    }, [filteredItems]);

    const handleItemSelected = useCallback((id, selected) => {
        setItems(items => {
            const index = items.findIndex(item => item.id === id);
            if (index === -1 || items[index].selected === selected) {
                return items;
            }
            return [
                ...items.slice(0, index),
                {
                    ...items[index],
                    selected,
                },
                ...items.slice(index + 1),
            ];
        });
    }, []);

    return (
        <div>
            <div>
                <input
                    placeholder="Filter"
                    type="search"
                    value={searchTerm}
                    onInput={handleSearchTermInput}
                />
                <RegExpToggleButton
                    checked={isRegExp}
                    type="checkbox"
                    onChange={handleIsRegExpClick}
                />
            </div>
            <SelectableList items={filteredItems} onSelect={handleItemSelected} />
            <div>
                <input
                    checked={filteredItemsSelected === filteredItems.length}
                    indeterminate={filteredItemsSelected !== 0 && filteredItemsSelected !== filteredItems.length}
                    type="checkbox"
                    onChange={handleSelectAllChange}
                />
                {itemsSelected} selected
                {itemsSelected - filteredItemsSelected > 0 &&
                    <> ({itemsSelected - filteredItemsSelected} hidden)</>
                }
            </div>
        </div>
    );
};

/**
 * A list with selectable items.
 */
function SelectableList({items, onSelect}) {
    const handleChecked = useCallback(event => {
        const { id } = event.target.dataset;
        onSelect(id, !items.find(item => item.id === id).selected);
    }, [items, onSelect]);

    return (
        <ul className="selectable-list">
            {items.map(item => (
                <li key={item.id}>
                    <input
                        checked={item.selected}
                        data-id={item.id}
                        type="checkbox"
                        onChange={handleChecked}
                    />
                    {item.id}
                </li>
            ))}
        </ul>
    );
}

export const RoomList: FC<{roomIds: string[]}> = ({roomIds}) => {
    const rooms = useMemo(() => {
        return roomIds.map((roomId) => ({
            id: roomId,
        }));
    }, [roomIds]);

    return (
        <ListWithSearch
            items={rooms}
        />
    );
}
