import React, { FC, useCallback, useMemo, useState } from 'react';
import { HighUpLabelInput } from '../components/inputs';
import { CustomForm } from '../components/custom-forms';
import { AppHeader } from '../components/header';
import { NetworkLog } from '../app';

type SynapseAdminPageProps = {
    identity: object,
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

type MutateUserFormProps = {
    identity: object,
};

const MutateUserForm: FC<MutateUserFormProps> = ({ identity }) => {
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
            requiresConfirmation={true}
            url="/_synapse/admin/v2/users/!{userId}"
            variables={variables}
        >
            <HighUpLabelInput
                label="User"
                pattern="@.+:.+"
                required
                title="A user id, e.g. @user:server.com"
                value={userId}
                onInput={useCallback(({target}) => setUserId(target.value), [])}
            />
            <HighUpLabelInput
                label="Password"
                title="Optional password"
                value={password}
                onInput={useCallback(({target}) => setPassword(target.value), [])}
            />
            <p>
                <label>User type
                    <select
                        onInput={useCallback(({target}) => setUserType(target.value), [])}
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
                        onChange={useCallback(({target}) => setLogoutDevices(target.checked), [])}
                    />
                    Log out all devices
                </label></li>
                <li><label>
                    <input
                        checked={admin}
                        type="checkbox"
                        onChange={useCallback(({target}) => setAdmin(target.checked), [])}
                    />
                    Synapse admin
                </label></li>
                <li><label>
                    <input
                        checked={deactivated}
                        type="checkbox"
                        onChange={useCallback(({ target }) => setDeactivated(target.checked), [])}
                    />
                    Deactivated
                </label></li>
            </ul>
            <button>Create/mutate user</button>
        </CustomForm>
    </>;
};
