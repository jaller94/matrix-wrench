import React, { FC, MouseEventHandler, useCallback, useEffect, useState } from 'react';
import { AppHeader } from '../components/header.tsx';
import { Identity, NetworkLog } from '../app.tsx';
import { HighUpLabelInput } from '../components/inputs.tsx';

import {
    getProfile,
} from '../matrix.ts';

export const UserInspectorPage: FC<{identity: Identity}> = ({identity}) => {
    const [busy, setBusy] = useState(false);
    const [progressValue, setProgressValue] = useState<number | undefined>(undefined);
    const [userId, setUserId] = useState('');
    const [userProfile, setUserProfile] = useState<Awaited<ReturnType<typeof getProfile>> | undefined>(undefined);
    const [text, setText] = useState('');

    const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(async(event) => {
        event.preventDefault();
        event.stopPropagation();
        setBusy(true);
        setUserProfile(undefined);
        setText('');
        try {
            setUserProfile(await getProfile(identity, userId));
            setProgressValue(1);
        } catch(error) {
            setText(error instanceof Error ? error.message : 'An error occurred');
        } finally {
            setBusy(false);
            setProgressValue(undefined);
        }
    }, [identity, userId]);

    useEffect(() => {
        setProgressValue(0);
    }, [userId]);

    return <>
        <AppHeader
            backUrl={`#/${encodeURIComponent(identity.name)}`}
        >User Inspector</AppHeader>
        <main>
            <HighUpLabelInput
                label='User id'
                value={userId}
                onInput={useCallback(({currentTarget}) => setUserId(currentTarget.value), [])}
            />
            <button
                disabled={busy || userId.length < 4}
                type="button"
                onClick={handleClick}
            >Start fetching</button>
            {busy && <progress value={progressValue} max={1} />}
            <div>
                <label>
                    Data as JSON (read-only)
                    {text && <div>{text}</div>}
                    <textarea readOnly value={JSON.stringify(userProfile, null, 2)} />
                </label>
            </div>
        </main>
        <NetworkLog />
    </>;
}
