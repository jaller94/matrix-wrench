import React, {
    useCallback,
} from 'react';
import {
    auth,
    doRequest,
} from '../matrix';
import {
    fillInVariables,
} from '../helper';
import { confirm } from './alert';

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
                headers: {
                    'Content-Type': typeof body === 'string' ? 'text/plain' : 'application/json',
                },
                ...(body && {
                    body: typeof body === 'string' ? body : JSON.stringify(body),
                }),
            }));
        } catch (error) {
            alert(error);
        }
    }, [body, identity, method, requiresConfirmation, url, variables]);

    return (
        <button type="button" onClick={handlePress}>{label}</button>
    );
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

    return (
        <form onSubmit={handleSubmit} {...props}>${children}</form>
    );
}
