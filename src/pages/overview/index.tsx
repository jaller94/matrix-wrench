import React, { FC, InputEventHandler, useCallback, useState } from 'react';
import { Identity } from '../../app.tsx';
import { AppHeader } from '../../components/header.tsx';
import { HighUpLabelInput } from '../../components/inputs.tsx';
import { OverviewPages } from './pages.tsx';

export const OverviewPage: FC<{identity: Identity}> = ({ identity }) => {
    const [filterString, setFilterString] = useState('');

    const handleFilterStringInput: InputEventHandler<HTMLInputElement> = useCallback((event) => {
        setFilterString(event.target.value);
    }, []);

    return <>
        <AppHeader
            backUrl={`#/${encodeURIComponent(identity.name)}`}
        >Overview</AppHeader>
        <main>
            <HighUpLabelInput
                autoFocus
                label="Filter"
                type="search"
                value={filterString}
                onInput={handleFilterStringInput}
            />
            <hr/>
            <OverviewPages identity={identity} filterString={filterString} />
        </main>
    </>;
}
