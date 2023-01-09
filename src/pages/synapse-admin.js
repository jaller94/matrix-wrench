import { html, useCallback, useMemo, useState } from '../node_modules/htm/preact/standalone.module.js';
import { HighUpLabelInput } from '../components/inputs.js';
import { CustomForm } from '../components/custom-forms.js';
import { AppHeader } from '../components/header.js';
import { NetworkLog } from '../index.js';

export function SynapseAdminPage({identity}) {
    return html`
        <${AppHeader}
            backLabel="Switch identity"
            backUrl="#"
        >${identity.name ?? 'No authentication'}</>
        <div class="card">
            <h2>Create/Mutate user</h2>
            <${MutateUserForm} identity=${identity}/>
        </div>
        <${NetworkLog} />
    `;
}

function MutateUserForm({ identity }) {
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

    return html`
        <${CustomForm}
            body=${body}
            identity=${identity}
            method="PUT"
            requiresConfirmation=${true}
            url="/_synapse/admin/v2/users/!{userId}"
            variables=${variables}
        >
            <${HighUpLabelInput}
                label="User"
                pattern="@.+:.+"
                required
                title="A user id, e.g. @user:server.com"
                value=${userId}
                oninput=${useCallback(({target}) => setUserId(target.value), [])}
            />
            <${HighUpLabelInput}
                label="Password"
                title="Optional password"
                value=${password}
                oninput=${useCallback(({target}) => setPassword(target.value), [])}
            />
            <p>
                <label>User type
                    <select
                        oninput=${useCallback(({target}) => setUserType(target.value), [])}
                    >
                        <option value="">None</>
                        <option value="bot">Bot</>
                        <option value="support">Support</>
                    </select>
                </label>
            </p>
            <ul class="checkbox-list">
                <li><label>
                    <input
                        checked=${logoutDevices}
                        type="checkbox"
                        onChange=${useCallback(({target}) => setLogoutDevices(target.checked), [])}
                    />
                    Log out all devices
                </label></li>
                <li><label>
                    <input
                        checked=${admin}
                        type="checkbox"
                        onChange=${useCallback(({target}) => setAdmin(target.checked), [])}
                    />
                    Synapse admin
                </label></li>
                <li><label>
                    <input
                        checked=${deactivated}
                        type="checkbox"
                        onChange=${useCallback(({ target }) => setDeactivated(target.checked), [])}
                    />
                    Deactivated
                </label></li>
            </ul>
            <button>Create/mutate user</button>
        </>
    `;
}
