import React, { FC, FormEventHandler, useCallback, useState } from 'react';
import { AppHeader } from '../../components/header';
import { HighUpLabelInput } from '../../components/inputs';
import { OverviewPages } from './pages';

export const OverviewPage: FC<{identity: any}> = ({ identity }) => {
    const [filterString, setFilterString] = useState('');

    const handleFilterStringInput: FormEventHandler<HTMLInputElement> = useCallback((event) => {
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
