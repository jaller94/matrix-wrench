import React, { FC, useCallback, useMemo, useState } from 'react';
import { HighUpLabelInput } from '../components/inputs.tsx';
import { CustomForm } from '../components/custom-forms.tsx';
import { AppHeader } from '../components/header.tsx';
import { Identity, NetworkLog } from '../app.tsx';

type SynapseAdminPageProps = {
    identity: Identity,
};

export const SynapseAdminPage: FC<SynapseAdminPageProps> = ({ identity }) => {
    return <>
        <AppHeader
            backLabel="Switch identity"
            backUrl="#"
        >{identity.name ?? 'No authentication'}</AppHeader>
        <div className="card">
            <h2>Create/Mutate user</h2>
            <MutateUserForm identity={identity}/>
        </div>
        <NetworkLog />
    </>;
}

const MutateUserForm: FC<{ identity: Identity }> = ({ identity }) => {
    const [admin, setAdmin] = useState(false);
    const [deactivated, setDeactivated] = useState(false);
    const [logoutDevices, setLogoutDevices] = useState(true);
    const [password, setPassword] = useState('');
    const [userId, setUserId] = useState('');
    const [userType, setUserType] = useState('');

    const body = useMemo(() => ({
        admin,
        deactivated,
        password,
        user_type: userType || null,
    }), [admin, deactivated, password, userType]);

    const variables = useMemo(() => ({
        userId,
    }), [userId]);

    return <>
        <CustomForm
            body={body}
            identity={identity}
            method="PUT"
            requiresConfirmation
            url="/_synapse/admin/v2/users/!{userId}"
            variables={variables}
        >
            <HighUpLabelInput
                label="User"
                pattern="@.+:.+"
                required
                title="A user id, e.g. @user:server.com"
                value={userId}
                onInput={useCallback(({currentTarget}) => setUserId(currentTarget.value), [])}
            />
            <HighUpLabelInput
                label="Password"
                title="Optional password"
                value={password}
                onInput={useCallback(({currentTarget}) => setPassword(currentTarget.value), [])}
            />
            <p>
                <label>User type
                    <select
                        onInput={useCallback(({currentTarget}) => setUserType(currentTarget.value), [])}
                    >
                        <option value="">None</option>
                        <option value="bot">Bot</option>
                        <option value="support">Support</option>
                    </select>
                </label>
            </p>
            <ul className="checkbox-list">
                <li><label>
                    <input
                        checked={logoutDevices}
                        type="checkbox"
                        onChange={useCallback(({currentTarget}) => setLogoutDevices(currentTarget.checked), [])}
                    />
                    Log out all devices
                </label></li>
                <li><label>
                    <input
                        checked={admin}
                        type="checkbox"
                        onChange={useCallback(({currentTarget}) => setAdmin(currentTarget.checked), [])}
                    />
                    Synapse admin
                </label></li>
                <li><label>
                    <input
                        checked={deactivated}
                        type="checkbox"
                        onChange={useCallback(({currentTarget}) => setDeactivated(currentTarget.checked), [])}
                    />
                    Deactivated
                </label></li>
            </ul>
            <button type="submit">Create/mutate user</button>
        </CustomForm>
    </>;
};
