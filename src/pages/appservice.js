import { html, useCallback, useState } from '../node_modules/htm/preact/standalone.module.js';
import { CustomButton } from '../components/custom-forms.js';
import { AppHeader } from '../components/header.js';
import { HighUpLabelInput } from '../components/inputs.js';
import { NetworkLog } from '../index.js';

function AccountCreator({ identity }) {
    const [username, setUsername] = useState('');
    return html`
        <h2>Register account</h2>
        <${HighUpLabelInput}
            label="Username"
            required
            value=${username}
            oninput=${useCallback(({ target }) => setUsername(target.value), [])}
        />
        <${CustomButton}
            identity=${identity}
            label="Create account"
            method="POST"
            url="/_matrix/client/v3/register"
            body=${{
                type: 'm.login.application_service',
                username,
            }}
        />
    `;
}

export function AppServicePage({ identity }) {
    return html`
        <${AppHeader}
            backUrl=${`#/${encodeURIComponent(identity.name)}`}
        >AppService API</>
        <main>
            <div class="card">
                <${AccountCreator} identity=${identity}/>
            </div>
        </main>
        <${NetworkLog} />
    `;
}
