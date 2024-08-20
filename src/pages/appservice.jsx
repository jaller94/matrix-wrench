import React, { useCallback, useState } from 'react';
import { CustomButton } from '../components/custom-forms';
import { AppHeader } from '../components/header';
import { HighUpLabelInput } from '../components/inputs';
import { NetworkLog } from '../app';

function AccountCreator({ identity }) {
    const [username, setUsername] = useState('');
    return <>
        <h2>Register account</h2>
        <HighUpLabelInput
            label="Username"
            required
            value={username}
            onInput={useCallback(({ target }) => setUsername(target.value), [])}
        />
        <CustomButton
            identity={identity}
            label="Create account"
            method="POST"
            url="/_matrix/client/v3/register"
            body={{
                type: 'm.login.application_service',
                username,
            }}
        />
    </>;
}

export function AppServicePage({ identity }) {
    return <>
        <AppHeader
            backUrl={`#/${encodeURIComponent(identity.name)}`}
        >AppService API</AppHeader>
        <main>
            <div className="card">
                <AccountCreator identity={identity}/>
            </div>
        </main>
        <NetworkLog />
    </>;
}
