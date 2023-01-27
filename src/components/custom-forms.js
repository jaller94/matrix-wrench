import {
    html,
    useCallback,
} from '../node_modules/htm/preact/standalone.module.js';
import {
    auth,
    doRequest,
} from '../matrix.js';
import {
    fillInVariables,
} from '../helper.js';
import { confirm } from './alert.js';

export function CustomButton({ body, identity, label, method, requiresConfirmation, url, variables }) {
    const handlePress = useCallback(async event => {
        event.preventDefault();
        event.stopPropagation();
        if (requiresConfirmation) {
            const confirmed = await confirm('This is a high-risk action!\nAre you sure?');
            if (!confirmed) return;
        }
        let actualUrl = `${identity.serverAddress}${fillInVariables(url, variables)}`;
        try {
            await doRequest(...auth(identity, actualUrl, {
                method,
                ...(body && {
                    body: typeof body === 'string' ? body : JSON.stringify(body),
                }),
            }));
        } catch (error) {
            alert(error);
        }
    }, [body, identity, method, requiresConfirmation, url, variables]);

    return html`
        <button type="button" onclick=${handlePress}>${label}</button>
    `;
}

export function CustomForm({ body, children, identity, method, requiresConfirmation, url, variables, ...props }) {
    const handleSubmit = useCallback(async event => {
        event.preventDefault();
        event.stopPropagation();
        if (requiresConfirmation) {
            const confirmed = await confirm('This is a high-risk action!\nAre you sure?');
            if (!confirmed) return;
        }
        let actualUrl = `${identity.serverAddress}${fillInVariables(url, variables)}`;
        try {
            await doRequest(...auth(identity, actualUrl, {
                method,
                ...(body && {
                    body: typeof body === 'string' ? body : JSON.stringify(body),
                }),
            }));
        } catch (error) {
            alert(error);
        }
    }, [body, identity, method, requiresConfirmation, url, variables]);

    return html`
        <form onsubmit=${handleSubmit} ...${props}>${children}</form>
    `;
}
