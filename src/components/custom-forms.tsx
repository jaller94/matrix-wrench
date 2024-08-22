import React, {
    FC,
    FormEventHandler,
    MouseEventHandler,
    PropsWithChildren,
    ReactElement,
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
import { Identity } from '../app';

type CustomButtonProp = {
    body?: string | unknown,
    identity: Identity,
    label: string | ReactElement,
    method: string,
    requiresConfirmation?: boolean,
    url: string,
    variables: Record<string, string>,
};

export const CustomButton: FC<CustomButtonProp> = ({ body, identity, label, method, requiresConfirmation = false, url, variables }) => {
    const handlePress: MouseEventHandler<HTMLButtonElement> = useCallback(async event => {
        event.preventDefault();
        event.stopPropagation();
        if (requiresConfirmation) {
            const confirmed = await confirm('This is a high-risk action!\nAre you sure?');
            if (!confirmed) return;
        }
        const actualUrl = `${identity.serverAddress}${fillInVariables(url, variables)}`;
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
};

type CustomFormProp = PropsWithChildren & {
    body?: string | unknown,
    identity: Identity,
    method: string,
    requiresConfirmation?: boolean,
    url: string,
    variables: Record<string, string>,
};
export const CustomForm: FC<CustomFormProp> = ({ body, children, identity, method, requiresConfirmation, url, variables, ...props }) => {
    const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(async event => {
        event.preventDefault();
        event.stopPropagation();
        if (requiresConfirmation) {
            const confirmed = await confirm('This is a high-risk action!\nAre you sure?');
            if (!confirmed) return;
        }
        const actualUrl = `${identity.serverAddress}${fillInVariables(url, variables)}`;
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
        <form onSubmit={handleSubmit} {...props}>{children}</form>
    );
};
