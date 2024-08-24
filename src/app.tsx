import React, {
    createContext,
    FC,
    FormEventHandler,
    KeyboardEventHandler,
    MouseEventHandler,
    PropsWithChildren,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import {
    classnames,
    uniqueId,
} from './helper.ts';
import { AlertSingleton, confirm } from './components/alert.js';
import { BulkActionTracker, BulkActionForm } from './components/bulk-actions';
import { CustomButton, CustomForm } from './components/custom-forms';
import { AppHeader } from './components/header';
import { HighUpLabelInput } from './components/inputs';
import { RoomLink } from './components/room-link';
import AboutPage from './pages/about';
import { AppServicePage } from './pages/appservice';
import { ContactListPage } from './pages/contact-list';
import { MassJoinerPage } from './pages/mass-joiner';
import { OverviewPage } from './pages/overview/index';
import { PolychatPage } from './pages/polychat/index';
import { RoomToYamlPage } from './pages/room-to-yaml';
import { RoomListPage } from './pages/room-list';
import { SpaceManagementPage } from './pages/space-viewer.jsx';
import { SynapseAdminPage } from './pages/synapse-admin';
import { UserInspectorPage } from './pages/user-inspector';
// import {
//     ListWithSearch,
//     // RoomList,
// } from './components/list';
import {
    auth,
    MatrixError,
    banUser,
    createRoom,
    createRoomAlias,
    deleteRoomAlias,
    doRequest,
    getJoinedRooms,
    getMediaByRoom,
    getMembers,
    getState,
    inviteUser,
    kickUser,
    resolveAlias,
    sendEvent,
    setState,
    summarizeFetch,
    toCurlCommand,
    unbanUser,
    whoAmI,
} from './matrix';
import {
    loginWithPassword,
} from './matrix-auth';

const NETWORKLOG_MAX_ENTRIES = 500;

export type Identity = {
    accessToken: string,
    masqueradeAs?: string,
    name: string,
    rememberLogin: boolean,
    serverAddress: string,
};

let IDENTITIES: Identity[] = [];
try {
    const identities = JSON.parse(localStorage.getItem('identities'));
    if (!Array.isArray(identities)) {
        throw Error(`Expected an array, got ${typeof identities}`);
    }
    IDENTITIES = identities.map(identity => ({
        ...identity,
        rememberLogin: true,
    }));
} catch (error) {
    console.warn('No identities loaded from localStorage.', error);
}

try {
    const settings = JSON.parse(localStorage.getItem('settings'));
    if (!Array.isArray(identities)) {
        throw Error(`Expected an array, got ${typeof identities}`);
    }
    IDENTITIES = identities.map(identity => ({
        ...identity,
        rememberLogin: true,
    }));
} catch (error) {
    console.warn('No settings loaded from localStorage.', error);
}

const NetworkRequests = createContext({
    isShortened: false,
    requests: [],
    rememberLogin: false,
    theme: 'auto',
});
export const Settings = createContext<{
    externalMatrixUrl: string,
    identities: Identity[],
    showNetworkLog: boolean,
    theme: string,
}>({
    externalMatrixUrl: 'https://matrix.to/#/',
    identities: [],
    showNetworkLog: true,
    theme: 'auto',
});

// function Header() {
//     return (
//         <header>
//             <nav>
//                 <button type="button">Network Log</button>
//                 <button type="button">Settings</button>
//                 <button type="button">About</button>
//             </nav>
//         </header>
//     );
// }

const knockingBody = {};

const RoomActions: FC<{identity: Identity, roomId: string}> = ({identity, roomId}) => {
    const variables = useMemo(() => ({
        roomId,
    }), [roomId]);

    return <>
        <div>
            <WhatsMyMemberState identity={identity} roomId={roomId} />
        </div>
        <CustomButton
            identity={identity}
            label="Knock"
            method="POST"
            url="/_matrix/client/v3/knock/!{roomId}"
            variables={variables}
            body={knockingBody}
        />
        <CustomButton
            identity={identity}
            label="Join"
            method="POST"
            url="/_matrix/client/v3/rooms/!{roomId}/join"
            variables={variables}
        />
        <CustomButton
            identity={identity}
            label="Leave"
            method="POST"
            url="/_matrix/client/v3/rooms/!{roomId}/leave"
            variables={variables}
        />
        <CustomButton
            identity={identity}
            label="Forget"
            method="POST"
            url="/_matrix/client/v3/rooms/!{roomId}/forget"
            variables={variables}
        />
        <hr/>
        <h3>Moderation</h3>
        <UserActions identity={identity} roomId={roomId}/>
        <hr/>
        <h3>Other pages</h3>
        <nav><ul>
            <li><a href={`#/${encodeURIComponent(identity.name)}/${encodeURIComponent(roomId)}/invite`}>Bulk invite</a></li>
            <li><a href={`#/${encodeURIComponent(identity.name)}/${encodeURIComponent(roomId)}/kick`}>Bulk kick</a></li>
            <li><a href={`#/${encodeURIComponent(identity.name)}/${encodeURIComponent(roomId)}/mass-joiner`}>Mass joiner (AppService API)</a></li>
            <li><a href={`#/${encodeURIComponent(identity.name)}/${encodeURIComponent(roomId)}/yaml`}>JSON export</a></li>
        </ul></nav>
    </>;
};

const MakeRoomAdminForm: FC<{identity: Identity, roomId: string}> = ({ identity, roomId }) => {
    const [userId, setUserId] = useState('');

    const body = useMemo(() => ({
        user_id: userId,
    }), [userId]);

    const variables = useMemo(() => ({
        roomId,
    }), [roomId]);

    return (
        <CustomForm
            body={body}
            identity={identity}
            method="POST"
            requiresConfirmation={true}
            url="/_synapse/admin/v1/rooms/!{roomId}/make_room_admin"
            variables={variables}
        >
            <HighUpLabelInput
                label="User"
                pattern="@.+:.+"
                required
                title="A user id, e.g. @foo:matrix.org"
                value={userId}
                onInput={useCallback(({target}) => setUserId(target.value), [])}
            />
            <button>Make user a room admin</button>
        </CustomForm>
    );
}

const WhoAmI: FC<{identity: Identity}> = ({identity}) => {
    const [busy, setBusy] = useState(false);
    const [info, setInfo] = useState(null);

    const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(async event => {
        event.preventDefault();
        event.stopPropagation();
        setBusy(true);
        try {
            const data = await whoAmI(identity);
            setInfo(data);
        } catch(error) {
            if (error instanceof MatrixError) {
                if (error.content.errcode === 'M_UNKNOWN_TOKEN') {
                    setInfo({
                        device_id: 'Invalid access token',
                        user_id: 'Invalid access token',
                    });
                }
            } else {
                alert(error);
            }
        } finally {
            setBusy(false);
        }
    }, [identity]);

    return <>
        <button
            disabled={busy}
            style={{width: '120px'}}
            type="button"
            onClick={handleSubmit}
        >Who am I?</button>
        <p>
            Matrix ID: {info?.user_id || 'unknown'}
            <br/>
            Device ID: {info?.device_id || 'unknown'}
        </p>
    </>;
}

const WhatsMyMemberState: FC<{identity: Identity, roomId: string}> = (props) => {
    const key = `${props.identity?.name}|${props.roomId}`;
    return <WhatsMyMemberStateInner key={key} {...props}/>;
};

const WhatsMyMemberStateInner: FC<{identity: Identity, roomId: string}> = ({identity, roomId}) => {
    const [busy, setBusy] = useState(false);
    const [info, setInfo] = useState<string | null>(null);

    const handleSubmit: MouseEventHandler<HTMLButtonElement> = useCallback(async event => {
        event.preventDefault();
        event.stopPropagation();
        setBusy(true);
        setInfo('updating…');
        try {
            const userId = (await whoAmI(identity)).user_id;
            const data = await getState(identity, roomId, 'm.room.member', userId);
            const translations = {
                ban: 'banned',
                join: 'joined',
                knock: 'knocking',
                leave: 'left',
            };
            setInfo(translations[data.membership] ?? data.membership);
        } catch(error) {
            if (error instanceof MatrixError && typeof error.content?.errcode === 'string') {
                if (error.content.errcode === 'M_UNKNOWN_TOKEN') {
                    setInfo('Invalid access token');
                } else if (error.content.errcode === 'M_FORBIDDEN') {
                    setInfo('No access to room. It may not exist.');
                } else if (error.content.errcode === 'M_NOT_FOUND') {
                    setInfo('No member event for you found.');
                } else {
                    setInfo(`Not a member. Server replied with the error ${error.content.errcode}.`);
                }
            } else {
                alert(error);
                setInfo(null);
            }
        } finally {
            setBusy(false);
        }
    }, [identity, roomId]);

    return <>
        <button
            disabled={busy}
            type="button"
            onClick={handleSubmit}
        >Am I a member?</button> Result: {info || 'unknown'}
    </>;
}

const PasswordInput: FC<{serverAddress: string, onAccessToken: (token: string) => void}> = ({serverAddress, onAccessToken}) => {
    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const data = await loginWithPassword(serverAddress, user, password);
        onAccessToken(data.access_token);
    }, [password, serverAddress, user, onAccessToken]);

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <HighUpLabelInput
                    label="Matrix ID or user name"
                    name="user"
                    value={user}
                    onInput={useCallback(({target}) => setUser(target.value), [])}
                />
            </div>
            <div>
                <HighUpLabelInput
                    autoComplete="current-password"
                    label="Password"
                    name="password"
                    value={password}
                    type="password"
                    onInput={useCallback(({target}) => setPassword(target.value), [])}
                />
            </div>
            <button>Get access token</button>
        </form>
    );
}

const IdentityEditorPage: FC<{identityName: string}> = ({identityName}) => {
    const {identities, setIdentities} = useContext(Settings);
    const [editingError, setEditingError] = useState(null);

    const editedIdentity = useMemo(() => {
        return identities.find(ident => ident.name === identityName) ?? {}
    }, [identities, identityName]);

    const handleSave = useCallback((identity) => {
        setEditingError(null);
        setIdentities(identities => {
            const newIdentities = [...identities];
            if (!identity.name) {
                setEditingError('Identity must have a name!');
                return identities;
            }
            const index = newIdentities.findIndex(ident => ident.name === identityName);
            const conflicts = newIdentities.findIndex(ident => ident.name === identity.name) !== -1;
            // The name may only conflict if this is the name we're editing.
            if (conflicts && identityName !== identity.name) {
                setEditingError('Identity name taken!');
                return identities;
            }
            if (index === -1) {
                // Add new identity
                newIdentities.push(identity);
            } else {
                // Replace existing identity
                newIdentities.splice(index, 1, identity);
            }
            if (identity.rememberLogin) {
                try {
                    saveIdentitiesToLocalStorage(newIdentities);
                } catch (error) {
                    console.warn('Failed to store identities in localStorage', error);
                }
            }
            setEditingError(null);
            window.location = '#';
            return newIdentities;
        });
    }, [identityName, setIdentities]);

    return <IdentityEditor
        error={editingError}
        identity={editedIdentity}
        onSave={handleSave}
    />;
}

const IdentityEditor: FC<{error: string, identity: Identity, onSave: (identity: Identity) => void}> = ({error, identity, onSave}) => {
    const [name, setName] = useState(identity.name ?? '');
    const [serverAddress, setServerAddress] = useState(identity.serverAddress ?? '');
    const [accessToken, setAccessToken] = useState(identity.accessToken ?? '');
    const [masqueradeAs, setMasqueradeAs] = useState(identity.masqueradeAs ?? '');
    const [authType, setAuthType] = useState('accessToken');
    const [rememberLogin, setRememberLogin] = useState(identity.rememberLogin ?? false);

    const handleReceivedAccessToken = useCallback((accessToken) => {
        setAccessToken(accessToken);
        setAuthType('accessToken');
    }, []);

    const handleAccessTokenInput = useCallback(({target}) => setAccessToken(target.value), []);
    const handleMasqueradeAsInput = useCallback(({target}) => setMasqueradeAs(target.value), []);

    const changedIdentity = useMemo(() => ({
        serverAddress,
        accessToken,
        masqueradeAs,
    }), [serverAddress, accessToken, masqueradeAs]);

    const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(event => {
        event.preventDefault();
        event.stopPropagation();
        onSave({
            name,
            serverAddress,
            accessToken,
            rememberLogin,
            masqueradeAs: masqueradeAs || undefined,
        });
    }, [accessToken, masqueradeAs, name, rememberLogin, serverAddress, onSave]);

    const handleRememberLoginClick = useCallback(({target}) => setRememberLogin(target.checked), []);

    return <>
        <AppHeader
            backUrl="#"
        >Identity Editor</AppHeader>
        <form className="identity-editor-form" onSubmit={handleSubmit}>
            <div>
                <HighUpLabelInput
                    label="Name"
                    name="name"
                    pattern="[^\\\/]+"
                    required
                    value={name}
                    onInput={useCallback(({target}) => setName(target.value), [])}
                />
            </div>
            {name.includes('/') && <p>The identity name must not include a slash character (/).</p>}
            <div>
                <HighUpLabelInput
                    label="Server address (e.g. https://matrix-client.matrix.org)"
                    name="url"
                    type="url"
                    required
                    value={serverAddress}
                    onInput={useCallback(({target}) => setServerAddress(target.value), [])}
                />
            </div>
            <div>
                <fieldset>
                    <legend>Authorization method</legend>

                    <label>
                        <input
                            type="radio"
                            name="authType"
                            checked={authType === 'accessToken'}
                            onClick={useCallback(() => setAuthType('accessToken'), [])}
                        />
                        Access Token
                    </label>

                    <label>
                        <input
                            type="radio"
                            name="authType"
                            checked={authType === 'password'}
                            onChange={useCallback(() => setAuthType('password'), [])}
                        />
                        Password
                    </label>
                </fieldset>
            </div>
            {authType === 'accessToken' ? <>
                <div>
                    <HighUpLabelInput
                        autoComplete="current-password"
                        label="Access token"
                        name="accessToken"
                        value={accessToken}
                        type="password"
                        onInput={handleAccessTokenInput}
                    />
                </div>
                <div>
                    <HighUpLabelInput
                        autoComplete=""
                        label="Masquerade As Matrix ID (for AppService tokens)"
                        name="masqueradeAs"
                        pattern="@.+:.+"
                        value={masqueradeAs}
                        onInput={handleMasqueradeAsInput}
                    />
                </div>
            </> : 
                <PasswordInput
                    serverAddress={serverAddress}
                    onAccessToken={handleReceivedAccessToken}
                />
            }
            {!!localStorage && 
                <div>
                    <ul className="checkbox-list">
                        <li><label>
                            <input
                                checked={rememberLogin}
                                type="checkbox"
                                onChange={handleRememberLoginClick}
                            />
                            Save to localStorage
                        </label></li>
                    </ul>
                </div>
            }
            {!!error && <p>{error}</p>}
            <div className="card">
                <WhoAmI identity={changedIdentity}/>
            </div>
            <a className="button" href="#">Cancel</a>
            <button type="submit" className="primary">Save</button>
        </form>
    </>;
}

function ResponseStatus({invalid, status}) {
    let label = '...';
    let title = 'Fetching data…';
    if (status === null) {
        label = 'NET';
        title = 'Network error';
    } else if (status) {
        label = status;
        title = `HTTP ${status}`;
    }
    if (invalid) {
        label = '!{}';
        title = 'Invalid JSON response';
    }
    return (
        <span
            className={classnames(
                'network-log-request_status',
                {
                    'network-log-request_status--success': status >= 200 && status < 300,
                    'network-log-request_status--client-error': status >= 400 && status < 500,
                    'network-log-request_status--server-error': status >= 500 || invalid,
                    'network-log-request_status--network': status === null,
                    'network-log-request_status--pending': status === undefined,
                },
            )}
            title={title}
        >{label}</span>
    );
}

function NetworkLogRequest({request}) {
    return (
        <li value={request.id}><details>
            <summary>
                <div className="network-log-request_header">
                    <span className="network-log-request_summarized-fetch">{summarizeFetch(request.resource, request.init)}</span>
                    <span className="network-log-request_time">{request.sent.toLocaleTimeString()}</span>
                    <ResponseStatus invalid={request.isNotJson} status={request.status}/>
                </div>
            </summary>
            <div>
                <strong>Sent:</strong> {request.sent.toLocaleString()}
            </div>
            {request.received && 
                <div>
                    <strong>Received:</strong> {request.received.toLocaleString()}
                </div>
            }
            {request.errcode && 
                <div>
                    <strong>Error Code:</strong> {request.errcode}
                </div>
            }
            {request.error && 
                <div>
                    <strong>Error:</strong> {request.error}
                </div>
            }
            <div>
                <strong>Curl command:</strong>
                <code className="network-log-request_curl">{toCurlCommand(request.resource, request.init)}</code>
            </div>
        </details></li>
    );
}

const NetworkRequestsProvider: FC<PropsWithChildren> = ({children}) => {
    const [state, setState] = useState<{isShortened: boolean, requests: object[]}>({
        isShortened: false,
        requests: [],
    });

    useEffect(() => {
        console.log(1);
        const handleMatrixRequest = (event) => {
            setState(state => {
                return {
                    ...state,
                    isShortened: state.requests.length >= NETWORKLOG_MAX_ENTRIES,
                    requests: [
                        ...state.requests,
                        {
                            id: event.detail.requestId,
                            init: event.detail.init,
                            resource: event.detail.resource,
                            sent: new Date(),
                        },
                    ].slice(-NETWORKLOG_MAX_ENTRIES),
                };
            });
        };

        const handleMatrixResponse = (event) => {
            setState(state => {
                const index = state.requests.findIndex(r => r.id === event.detail.requestId);
                if (index === -1) {
                    return state;
                }
                const newRequest = {
                    ...state.requests[index],
                    errcode: event.detail.errcode || null,
                    error: event.detail.error || null,
                    received: new Date(),
                    status: event.detail.status || null,
                };
                return {
                    ...state,
                    requests: [
                        ...state.requests.slice(0, index),
                        newRequest,
                        ...state.requests.slice(index + 1),
                    ]
                };
            });
        };

        window.addEventListener('matrix-request', handleMatrixRequest);
        window.addEventListener('matrix-response', handleMatrixResponse);
        return () => {
            window.removeEventListener('matrix-request', handleMatrixRequest);
            window.removeEventListener('matrix-response', handleMatrixResponse);
        };
    }, []);

    return (
        <NetworkRequests.Provider value={state}>
            {children}
        </NetworkRequests.Provider>
    );
};

export function NetworkLog() {
    const { showNetworkLog } = useContext(Settings);
    const {isShortened, requests} = useContext(NetworkRequests);
    if (!showNetworkLog) {
        return;
    }
    return <>
        <h2>Network Log</h2>
        {isShortened && <p>Older entries have been removed.</p>}
        {requests.length === 0 ? (
            <p>Requests to Matrix homeservers will be listed here.</p>
        ) : 
            <ol className="nethandleSubmitwork-log_list">
                {requests.map(request => (
                    <NetworkLogRequest key={request.id} request={request}/>
                ))}
            </ol>
        }
    </>;
}

const SettingsProvider: FC<PropsWithChildren> = ({children}) => {
    const [state, setState] = useState({
        externalMatrixUrl: 'https://matrix.to/#/',
        identities: IDENTITIES,
        showNetworkLog: true,
        setExternalUrl: (externalMatrixUrl: string) => {
            setState(state => ({
                ...state,
                externalMatrixUrl,
            }));
        },
        setIdentities: (callback: (identities: Identity[]) => Identity[]) => {
            setState(state => ({
                ...state,
                identities: callback(state.identities),
            }));
        },
        setShowNetworkLog: (showNetworkLog: boolean) => {
            setState(state => ({
                ...state,
                showNetworkLog,
            }));
        },
        setTheme: (theme: string) => {
            setState(state => ({
                ...state,
                theme,
            }));
        },
    });

    return (
        <Settings.Provider value={state}>
            {children}
        </Settings.Provider>
    );
};

function IdentitySelectorRow({identity, onDelete}) {
    return <li>
        <a
            className="identity-page_name"
            href={`#/${identity.name}`}
        >{identity.name}</a>
        <a
            className="identity-page_action"
            href="#identity/${identity.name}"
            title="Edit identity ${identity.name}"
        >✏️</a>
        <button
            className="identity-page_action"
            title="Delete identity ${identity.name}"
            type="button"
            onClick={useCallback(() => onDelete(identity), [identity, onDelete])}
        >❌</button>
    </li>;
}

const IdentitySelector: FC<{identities: Identity[], onDelete: (identity: Identity) => void}> = ({identities, onDelete}) => {
    return <>
        {identities.map(identity => (
            <IdentitySelectorRow
                key={identity.name}
                identity={identity}
                onDelete={onDelete}
            />
        ))}
    </>
};

const AliasResolver: FC<{identity: Identity}> = ({identity}) => {
    const [alias, setAlias] = useState('');
    const [busy, setBusy] = useState(false);
    const [roomId, setRoomId] = useState('');

    const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(async event => {
        event.preventDefault();
        event.stopPropagation();
        setBusy(true);
        try {
            const data = await resolveAlias(identity, alias);
            setRoomId(data.room_id);
        } catch (error) {
            alert(error);
        } finally {
            setBusy(false);
        }
    }, [alias, identity]);

    return <>
        <form onSubmit={handleSubmit}><fieldset disabled={busy}>
            <HighUpLabelInput
                label="Room alias"
                pattern="#.+:.+"
                required
                title="A room alias starting with a number sign, e.g. #matrixhq:matrix.org"
                value={alias}
                onInput={useCallback(({target}) => setAlias(target.value), [])}
            />
            <button type="submit">Resolve</button>
        </fieldset></form>
        <div>
            <strong>Room id:</strong>
            <code style={{
                border: '2px, black dotted',
                userSelect: 'all',
                marginLeft: '.5em',
            }}>{roomId || 'N/A'}</code>
        </div>
    </>;
}

function saveIdentitiesToLocalStorage(identities: Identity[]) {
    if (!localStorage) return;
    // Filter out identities where the user said to not remember them.
    const identitiesToStore = identities.filter(identity => identity.rememberLogin).map(identity => {
        const copyOfIdentity = {...identity};
        delete copyOfIdentity.rememberLogin;
        return copyOfIdentity;
    });
    localStorage.setItem('identities', JSON.stringify(identitiesToStore));
}

const IdentityNav: FC<{identity: Identity}> = ({identity}) => {
    return <>
        <h2>Other pages</h2>
        <nav><ul>
            <li><a href={`#/${encodeURIComponent(identity.name)}/overview`}>Overview</a></li>
        </ul></nav>
    </>;
}

const UnencryptedTextMessage: FC<{identity: Identity, roomId: string}> = ({ identity, roomId }) => {
    const [message, setMessage] = useState('');

    const body = useMemo(() => ({
        msgtype: 'm.text',
        body: message,
    }), [message]);

    const variables = useMemo(() => ({
        eventType: 'm.room.message',
        roomId,
        txnId: uniqueId('msg-'),
    }), [roomId]);

    return (
        <CustomForm
            body={body}
            identity={identity}
            method="PUT"
            url="/_matrix/client/v3/rooms/!{roomId}/send/!{eventType}/!{txnId}"
            variables={variables}
        >
            <HighUpLabelInput
                label="Message"
                required
                value={message}
                onInput={useCallback(({ target }) => setMessage(target.value), [])}
            />
            <button>Send message</button>
        </CustomForm>
    );
}

const MainPage: FC<{identity: Identity, roomId: string}> = ({identity, roomId}) => {
    return <>
        <AppHeader
            backLabel="Switch identity"
            backUrl="#"
        >{identity.name ?? 'No authentication'}</AppHeader>
        <div style={{display: 'flex', flexDirection: 'column'}}>
            {identity.accessToken ? (<>
                <div  style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap'}}>
                    <div className="card">
                        <WhoAmI identity={identity}/>
                    </div>
                    <div className="card">
                        <IdentityNav identity={identity}/>
                    </div>
                </div>
                <RoomSelector identity={identity} roomId={roomId}/>
            </>) : (
                <div className="card">
                    <h2>Alias to Room ID</h2>
                    <AliasResolver identity={identity}/>
                </div>
            )}
        </div>
        <NetworkLog />
    </>;
}

function IdentitySelectorPage() {
    const {identities, setIdentities} = useContext(Settings);

    const handleDelete = useCallback(async(identity) => {
        const confirmed = await confirm(`Do you want to remove ${identity.name}?\nThis doesn't invalidate the access token.`);
        if (!confirmed) return;
        setIdentities((identities) => {
            const newIdentities = identities.filter(obj => obj.name !== identity.name);
            try {
                saveIdentitiesToLocalStorage(newIdentities);
            } catch (error) {
                console.warn('Failed to store identities in localStorage', error);
            }
            return newIdentities;
        });
    }, [setIdentities]);

    return <>
        <AppHeader>Matrix Wrench</AppHeader>
        <main>
            {identities.length === 0 ? (
                <p>
                    Hi there! Need to tweak some Matrix rooms?<br/>
                    First, you need to add an identity. An identity is a combination of a homeserver URL and an access token.<br/>
                    Wrench can handle multiple identities. It assumes that identities are sensitive, so they aren't stored by default.
                </p>
            ) : (<>
                <p>Choose an identity. An identity is a combination of a homeserver URL and an access token.</p>
                <ul className="identity-page_list">
                    <IdentitySelector identities={identities} onDelete={handleDelete} />
                </ul>
            </>)}
            <a className="button" href="#identity">Add identity</a>
        </main>
    </>;
}

const RoomList: FC<{roomIds: string[], onSelectRoom?: (roomId: string) => void}> = ({roomIds, onSelectRoom}) => {
    const { externalMatrixUrl } = useContext(Settings);
    const handleSelectRoom: FormEventHandler = useCallback(event => {
        event.preventDefault();
        event.stopPropagation();
        onSelectRoom(event.target.dataset.roomId);
    }, [onSelectRoom]);

    if (roomIds.length === 0) {
        return <p>There's no room in this list.</p>;
    }
    return (
        <ul style={{overflowX: 'auto'}}>
            {roomIds.map(roomId => 
                <li key={roomId}>
                    {onSelectRoom ? (
                        <button
                            type="button"
                            data-room-id={roomId}
                            onClick={handleSelectRoom}
                        >{roomId}</button>
                    ) : roomId}
                    <a
                        href={`${externalMatrixUrl}${encodeURIComponent(roomId)}`}
                        rel="noopener noreferrer"
                        target="_blank"
                        title="Open room externally"
                    >
                        <img alt="" src="./assets/external-link.svg" />
                    </a>
                </li>
            )}
        </ul>
    );
}

function JoinedRoomList({identity, onSelectRoom}) {
    const [roomIds, setRoomIds] = useState<string[] | null>(null);
    const [busy, setBusy] = useState(false);

    const handleGet = useCallback(async() => {
        setBusy(true);
        try {
            const {joined_rooms} = await getJoinedRooms(identity);
            setRoomIds(joined_rooms);
        } catch (error) {
            alert(error);
        } finally {
            setBusy(false);
        }
    }, [identity]);

    return <>
        <h3>Joined rooms{Array.isArray(roomIds) && <> ({roomIds.length} rooms)</>}</h3>
        <button disabled={busy} type="button" onClick={handleGet}>Query joined rooms</button>
        {roomIds && <RoomList roomIds={roomIds} onSelectRoom={onSelectRoom}/>}
    </>;
}

const RoomSelector: FC<{identity: Identity, roomId: string}> = ({identity, roomId}) => {
    const [room, setRoom] = useState('');
    const [resolvedRoomId, setResolvedRoomId] = useState<string | null>(null);
    const [recentRooms, setRecentRooms] = useState<string[]>([]);
    const [busy, setBusy] = useState(false);

    const handleSelectRoom = useCallback((roomId: string) => {
        window.location = `#/${encodeURIComponent(identity.name)}/${encodeURIComponent(roomId)}`;
        setRecentRooms(recentRooms => ([
            roomId,
            ...recentRooms.filter(r => r !== roomId),
        ]).slice(0, 4));
    }, [identity.name]);

    const handleResolveAlias: MouseEventHandler = useCallback(async event => {
        event.preventDefault();
        event.stopPropagation();
        let roomId = room;
        if (room.startsWith('#')) {
            setBusy(true);
            try {
                roomId = (await resolveAlias(identity, room)).room_id;
            } catch (error) {
                console.warn(error);
                const message = `Couldn't resolve alias! ${error}`;
                alert(message);
                return;
            } finally {
                setBusy(false);
            }
        }
        setResolvedRoomId(roomId);
    }, [identity, room]);

    const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(async event => {
        event.preventDefault();
        event.stopPropagation();
        let roomId = room;
        if (room.startsWith('#')) {
            setBusy(true);
            try {
                roomId = (await resolveAlias(identity, room)).room_id;
            } catch (error) {
                console.warn(error);
                const message = `Couldn't resolve alias! ${error}`;
                alert(message);
                return;
            } finally {
                setBusy(false);
            }
        }
        window.location = `#/${encodeURIComponent(identity.name)}/${encodeURIComponent(roomId)}`;
        setResolvedRoomId(roomId);
        setRecentRooms(recentRooms => ([
            roomId,
            ...recentRooms.filter(r => r !== roomId),
        ]).slice(0, 4));
    }, [identity, room]);

    const handleResetRoomId = useCallback(() => {
        window.location = `#/${encodeURIComponent(identity.name)}`;
    }, [identity.name]);

    if (roomId) {
        return <>
            <hr/>
            <button onClick={handleResetRoomId}>Switch to a different room</button>
            <RoomPage identity={identity} roomId={roomId}/>
        </>;
    }

    return (
        <div className="card">
            <h2>Room management</h2>
            <form onSubmit={handleSubmit}><fieldset disabled={busy}>
                <HighUpLabelInput
                    name="room"
                    label="Room alias or ID"
                    pattern="[!#].+:.+"
                    required
                    value={room}
                    onInput={({target}) => setRoom(target.value)}
                />
                <button
                    disabled={!room.startsWith('#')}
                    type="button"
                    onClick={handleResolveAlias}
                >Resolve alias</button>
                <button type="submit" className="primary">Open details</button>
            </fieldset></form>
            <div>
                <strong>Room id:</strong>
                <code style={{border: '2px black dotted', userSelect: 'all', marginLeft: '.5em'}}>{resolvedRoomId || 'N/A'}</code>
            </div>
            <aside>
                {recentRooms.length > 0 && <>
                    <h3>Recent rooms</h3>
                    <RoomList roomIds={recentRooms} onSelectRoom={handleSelectRoom}/>
                </>}
                <JoinedRoomList identity={identity} onSelectRoom={handleSelectRoom}/>
            </aside>
        </div>
    );
}

async function getRoomsInASpaceInner(identity: Identity, roomId: string, maxDepth: number, roomMap: Map<string, unknown>) {
    if (maxDepth === 0) return;
    const state = await getState(identity, roomId);
    const childEvents = state.filter(event => event.type === 'm.space.child' && Array.isArray(event.content.via));
    for (const childEvent of childEvents) {
        if (roomMap.has(childEvent.state_key)) {
            continue;
        }
        roomMap.set(childEvent.state_key, {
            roomId: childEvent.state_key,
        });
        await getRoomsInASpaceInner(identity, childEvent.state_key, maxDepth - 1, roomMap);
    }
}

async function getRoomsInASpace(identity: Identity, roomId: string, maxDepth = 1) {
    const roomMap = new Map();
    await getRoomsInASpaceInner(identity, roomId, maxDepth, roomMap);
    return [...roomMap.values()];
}

async function deleteRoom(identity: Identity, roomId: string, body = {}) {
    await doRequest(...auth(identity, `${identity.serverAddress}/_synapse/admin/v2/rooms/${encodeURIComponent(roomId)}`, {
        method: 'DELETE',
        body: JSON.stringify(body),
    }));
}

const SynapseAdminDelete: FC<{identity: Identity, roomId: string}> = ({ identity, roomId }) => {
    const [busy, setBusy] = useState(false);
    const [progress, setProgress] = useState(undefined);
    const [total, setTotal] = useState(undefined);

    const [block, setBlock] = useState(false);
    const [purge, setPurge] = useState(true);
    const [forcePurge, setForcePurge] = useState(false);

    const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback((event) => {
        // Just ignore submit. We have two buttons - no submit button.
        event.preventDefault();
        event.stopPropagation();
    }, []);

    const handleBusy = useCallback(newBusy => {
        if (!newBusy) {
            setProgress(undefined);
        }
        setBusy(newBusy);
    }, []);

    const handleBlockClick = useCallback(() => setBlock(value => !!value), []);
    const handlePurgeClick = useCallback(() => setPurge(value => !!value), []);
    const handleForcePurgeClick = useCallback(() => setForcePurge(value => !!value), []);

    const body = useMemo(() => ({
        block,
        purge,
        force_purge: forcePurge,
    }), [block, purge, forcePurge]);

    const variables = useMemo(() => ({
        roomId,
    }), [roomId]);

    return <>
        <form onSubmit={handleSubmit}><fieldset disabled={busy}>
            <ul className="checkbox-list">
                <li><label>
                    <input
                        checked={block}
                        type="checkbox"
                        onChange={handleBlockClick}
                    />
                    Block in the future
                </label></li>
                <li><label>
                    <input
                        checked={purge}
                        type="checkbox"
                        onChange={handlePurgeClick}
                    />
                    Purge from database
                </label></li>
                <li><label>
                    <input
                        checked={forcePurge}
                        type="checkbox"
                        onChange={handleForcePurgeClick}
                    />
                    Purge even if local users cannot be removed
                </label></li>
            </ul>
            {busy && 
                <div>
                    <progress max={total} value={progress}>Deleted {progress} of {total} rooms.</progress>
                </div>
            }
            <CustomButton
                body={body}
                identity={identity}
                label="Delete room"
                method="DELETE"
                requiresConfirmation
                url="/_synapse/admin/v2/rooms/!{roomId}"
                variables={variables}
            />
            <DeleteSpaceRecursivelyButton
                body={body}
                identity={identity}
                roomId={roomId}
                onBusy={handleBusy}
                onProgress={setProgress}
                onTotal={setTotal}
            />
        </fieldset></form>
    </>;
}

function DeleteSpaceRecursivelyButton({ body, identity, roomId, onBusy, onProgress, onTotal }) {
    const handlePress = useCallback(async() => {
        onBusy(true);
        try {
            let confirmed = await confirm('Fetching a list of all subspaces and rooms can take many minutes.\nAre you ok to wait?');
            if (!confirmed) return;
            const rooms = await getRoomsInASpace(identity, roomId, -1);
            const roomIds = new Set(rooms.map(r => r.roomId));
            roomIds.add(roomId);
            onTotal(roomIds.size);
            confirmed = await confirm(`Found ${roomIds.size} rooms (includes spaces) to delete.\nAre you sure you want to DELETE ALL?`);
            if (!confirmed) return;
            let progress = 0;
            for (const roomId of roomIds.values()) {
                try {
                    await deleteRoom(identity, roomId, body);
                } catch (error) {
                    const confirmed = await confirm(`Failed to delete room ${roomId}.\n${error.error || error.message}\nContinue?`);
                    if (!confirmed) return;
                }
                progress += 1;
                onProgress(progress);
            }
        } finally {
            onBusy(false);
        }
    }, [body, identity, roomId, onBusy, onProgress, onTotal]);

    return (
        <button type="button" onClick={handlePress}>Delete space recursively</button>
    );
}

function RoomPage({identity, roomId}) {
    return <>
        <h2>{roomId}</h2>
        <div className="page">
            <div className="section">
                <details open>
                    <summary><h2>Summary</h2></summary>
                    <RoomSummaryWrapper identity={identity} roomId={roomId}/>
                </details>
            </div>
            <div className="section">
                <details open>
                    <summary><h2>Membership</h2></summary>
                    <RoomActions identity={identity} roomId={roomId}/>
                </details>
            </div>
            <div className="section">
                <details open>
                    <summary><h2>Members</h2></summary>
                    <MembersExplorer identity={identity} roomId={roomId}/>
                </details>
            </div>
            <div className="section">
                <details open>
                    <summary><h2>State</h2></summary>
                    <StateExplorer identity={identity} roomId={roomId}/>
                </details>
            </div>
            <div className="section">
                <details open>
                    <summary><h2>Send message</h2></summary>
                    <UnencryptedTextMessage identity={identity} roomId={roomId}/>
                </details>
            </div>
            <div className="section">
                <details open>
                    <summary><h2>Aliases</h2></summary>
                    <AliasActions identity={identity} roomId={roomId}/>
                </details>
            </div>
            <div className="section">
                <details open>
                    <summary><h2>Room Upgrade (experimental)</h2></summary>
                    <RoomUpgradeActions identity={identity} roomId={roomId}/>
                </details>
            </div>
            <div className="section">
                <details>
                    <summary><h2>Synapse Admin</h2></summary>
                    <MakeRoomAdminForm identity={identity} roomId={roomId}/>
                    <hr/>
                    <h3>Remove users and delete room</h3>
                    <SynapseAdminDelete identity={identity} roomId={roomId}/>
                </details>
            </div>
            <div className="section">
                <details>
                    <summary><h2>Media (Synapse Admin)</h2></summary>
                    <MediaExplorer identity={identity} roomId={roomId}/>
                </details>
            </div>
        </div>
    </>;
}

function SettingsPage() {
    const {
        externalMatrixUrl, setExternalMatrixUrl,
        showNetworkLog, setShowNetworkLog,
        theme, setTheme,
    } = useContext(Settings);

    const ignoreSubmit: FormEventHandler<HTMLFormElement> = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
    }, []);

    return <>
        <AppHeader
            backUrl="#"
        >Settings</AppHeader>
        <main>
            <form onSubmit={ignoreSubmit}>
                <HighUpLabelInput
                    label="Prefix for external Matrix links"
                    name="external_matrix_links"
                    value={externalMatrixUrl}
                    onInput={useCallback(({target}) => setExternalMatrixUrl(target.value), [setExternalMatrixUrl])}
                />
                <ul className="checkbox-list">
                    <li><label>
                        <input
                            name="show_network_log"
                            checked={showNetworkLog}
                            type="checkbox"
                            onChange={useCallback(({target}) => setShowNetworkLog(target.checked), [setShowNetworkLog])}
                        />
                        Show network log
                    </label></li>
                </ul>
                <h3>Theme</h3>
                <ul className="checkbox-list">
                    {['auto', 'light', 'dark'].map(themeKey => (
                        <li key={themeKey}><label>
                            <input
                                checked={themeKey === theme}
                                name="theme"
                                type="radio"
                                onChange={useCallback(() => setTheme(themeKey), [setTheme])}
                            />
                            {themeKey}
                        </label></li>
                    ))}
                </ul>
            </form>
        </main>
        <NetworkLog />
    </>;
}

function AliasActions({ identity, roomId }) {
    const [alias, setAlias] = useState('');
    const [busy, setBusy] = useState(false);

    const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(async event => {
        event.preventDefault();
        event.stopPropagation();
        const action = event.submitter.getAttribute('value');
        setBusy(true);
        try {
            if (action === 'add') {
                await createRoomAlias(identity, alias, roomId);
            } else if (action === 'remove') {
                const response = await resolveAlias(identity, alias);
                if (response.room_id !== roomId) {
                    let message = 'Alias is not mapped to this room.';
                    if (response.room_id) {
                        message += ` Instead, it's mapped to ${response.room_id}.`;
                    }
                    throw Error(message);
                }
                await deleteRoomAlias(identity, alias);
            }
        } catch (error) {
            alert(error);
        } finally {
            setBusy(false);
        }
    }, [alias, identity, roomId]);

    return (
        <form onSubmit={handleSubmit}><fieldset disabled={busy}>
            <HighUpLabelInput
                label="Alias"
                pattern="#.+:.+"
                required
                title="A room alias, e.g. #matrix:matrix.org"
                value={alias}
                onInput={useCallback(({target}) => setAlias(target.value), [])}
            />
            <button type="submit" value="add">Add</button>
            <button type="submit" value="remove">Remove</button>
        </fieldset></form>
    );
}

function RoomSummaryWrapper(props) {
    const key = `${props.identity?.name}|${props.roomId}`;
    return <RoomSummaryWrapperInner key={key} {...props}/>;
}

function RoomSummaryWrapperInner({identity, roomId}) {
    const [busy, setBusy] = useState(false);
    const [stateEvents, setStateEvents] = useState();

    const handleClick = useCallback(async () => {
        setBusy(true);
        try {
            setStateEvents(await getState(identity, roomId));
        } finally {
            setBusy(false);
        }
    }, [identity, roomId]);

    return <>
        <button disabled={busy} type="button" onClick={handleClick}>Get state</button>
        {stateEvents && <RoomSummary identity={identity} stateEvents={stateEvents}/>}
    </>;
}

function getHighestPowerLevel(powerLevelsContent, defaultUserPowerLevel) {
    let highest = defaultUserPowerLevel;
    for (const powerLevel of Object.values(powerLevelsContent?.users ?? {})) {
        if (highest < powerLevel) {
            highest = powerLevel;
        }
    }
    return highest;
}

function getUnchangeableEventTypes(powerLevelsContent, powerLevel) {
    const unchangableEventTypes = [];
    for (const [type, requiredPowerLevel] of Object.entries(powerLevelsContent?.events ?? {})) {
        if (powerLevel < requiredPowerLevel) {
            unchangableEventTypes.push(type);
        }
    }
    return unchangableEventTypes.length === 0 ? undefined : unchangableEventTypes;
}

const RoomSummary: FC<{ identity: Identity, stateEvents: object[] }> = ({identity, stateEvents}) => {
    const name = stateEvents.find(e => e.type === 'm.room.name' && e.state_key === '')?.content?.['name'];
    const avatar = stateEvents.find(e => e.type === 'm.room.avatar' && e.state_key === '')?.content?.['url'];
    const doesFederate = stateEvents.find(e => e.type === 'm.room.create' && e.state_key === '')?.content?.['m.federate'] ?? true;
    const powerLevelsContent = stateEvents.find(e => e.type === 'm.room.power_levels' && e.state_key === '')?.content;
    const encryptionAlgorithm = stateEvents.find(e => e.type === 'm.room.power_levels' && e.state_key === '')?.content?.algorithm;
    const joinRule = stateEvents.find(e => e.type === 'm.room.join_rules' && e.state_key === '')?.content?.join_rule;
    // const guestAccess = stateEvents.find(e => e.type === 'm.room.guest_access' && e.state_key === '')?.content?.guest_access;
    const historyVisibility = stateEvents.find(e => e.type === 'm.room.history_visibility' && e.state_key === '')?.content?.history_visibility;
    const defaultUserPowerLevel = powerLevelsContent?.users_default;
    const highestPowerLevel = getHighestPowerLevel(powerLevelsContent, defaultUserPowerLevel);
    const predecessorRoom = stateEvents.find(e => e.type === 'm.room.create' && e.state_key === '')?.content?.predecessor?.room_id;
    const roomVersion = stateEvents.find(e => e.type === 'm.room.create' && e.state_key === '')?.content?.room_version;
    const replacementRoom = stateEvents.find(e => e.type === 'm.room.tombstone' && e.state_key === '')?.content?.replacement_room;
    const unchangableEventTypes = getUnchangeableEventTypes(powerLevelsContent, highestPowerLevel);
    return (
        <ul>
            {name ? <li>This room is called <q>{name}</q>.</li> : <li>This room has no name.</li>}
            {avatar ? <li>This room&apos;s avatar is <q>{avatar}</q>.</li> : <li>This room has no avatar.</li>}
            <li>This room does {doesFederate === false && <strong>NOT</strong>}federate.</li>
            {roomVersion && <li>The room version is {roomVersion}.</li>}
            {predecessorRoom && <li>This room replaced <RoomLink identity={identity} roomId={predecessorRoom}/>.</li>}
            {replacementRoom && <li>⚠️ This room was replaced by <RoomLink identity={identity} roomId={replacementRoom}/>.</li>}
            {typeof highestPowerLevel === 'number' && <li>The highest power level is {highestPowerLevel}.</li>}
            {unchangableEventTypes && <li><strong>⚠️Unusual:</strong> No user has the power level to post these event types: {unchangableEventTypes.join(', ')}</li>}
            {unchangableEventTypes?.includes('m.room.power_levels') && <li><strong>💔Broken:</strong> No user can change the power levels.</li>}
            {(defaultUserPowerLevel >= highestPowerLevel) && <li><strong>⚠️Unusual:</strong> No user has a higher power level than the default.</li>}
            {(encryptionAlgorithm && historyVisibility === 'world_readable') && <li><strong>⚠️Unusual:</strong> The room uses encryption but is readable without joining.</li>}
            {(encryptionAlgorithm && joinRule === 'public') && <li><strong>⚠️Unusual:</strong> The room uses encryption but is publicly joinable.</li>}
        </ul>
    );
}

function assertTombstone(myMatrixId: string, stateEvents: object[]) {
    const isTombstoned = stateEvents.some(e => e.type === 'm.room.tombstone' && e.state_key === '');
    if (isTombstoned) {
        throw Error('Room already has a tombstone.');
    }
    const powerLevels = stateEvents.find(e => e.type === 'm.room.power_levels' && e.state_key === '')?.content;
    const tombstoneRequirement = powerLevels.events?.['m.room.tombstone'] ?? powerLevels.events_default;
    const myPowerLevel = powerLevels.users?.[myMatrixId] ?? powerLevels.users_default;
    if (typeof tombstoneRequirement !== 'number') {
        throw Error('Unsure which power level is required for a tombstone.');
    }
    if (typeof myPowerLevel !== 'number') {
        throw Error('Unsure which power level is required for a tombstone.');
    }
    if (myPowerLevel < tombstoneRequirement) {
        throw Error('Insufficient permission to place tombstone.');
    }
}

const RoomUpgradeActions: FC<{identity: Identity, roomId: string}> = ({identity, roomId}) => {
    const [replacementRoom, setReplacementRoom] = useState('');
    const [busy, setBusy] = useState(false);

    const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(event => {
        event.preventDefault();
        event.stopPropagation();
    }, []);

    const handleRoomCreation = useCallback(async () => {
        setBusy(true);
        try {
            const stateEvents = await getState(identity, roomId);
            const toMigrate = [];
            const myMatrixId = (await whoAmI(identity)).user_id;
            assertTombstone(myMatrixId, stateEvents);
            for (const event of stateEvents) {
                if (['m.room.create', 'm.room.encryption', 'm.room.member', 'm.room.power_levels'].includes(event.type)) {
                    continue;
                }
                toMigrate.push({
                    content: event.content,
                    type: event.type,
                    state_key: event.state_key,
                });
            }
            const powerLevels = stateEvents.find(e => e.type === 'm.room.power_levels' && e.state_key === '')?.content;
            if (!powerLevels) {
                throw Error('No m.room.power_levels state found.');
            }
            console.log(powerLevels);
            console.log(toMigrate);
            const lastEventId = (await sendEvent(identity, roomId, 'm.room.message', {
                msgtype: 'm.text',
                body: 'This room will be replaced.',
            })).event_id;
            console.log(lastEventId);
            const replacementRoom = (await createRoom(identity, {
                creation_content: {
                    // type: roomType,
                    predecessor: {
                        room_id: roomId,
                        event_id: lastEventId,
                    },
                },
                initial_state: toMigrate,
                power_level_content_override: powerLevels,
            })).room_id;
            console.log(replacementRoom);
            // for (const event of toMigrate) {
            //     await setState(identity, replacementRoom, event.type, event.state_key, event.content);
            // }
            setReplacementRoom(replacementRoom);
        } catch (error) {
            alert(error);
        } finally {
            setBusy(false);
        }
    }, [identity, roomId]);

    const handleInviteMembers = useCallback(async () => {
        setBusy(true);
        try {
            const data = await getMembers(identity, roomId);
            const groups = memberEventsToGroups(data.chunk);
            const myMatrixId = (await whoAmI(identity)).user_id;
            const toInvite = groups.get('join').filter(u => u !== myMatrixId && !u.startsWith('@slack_'));
            for (const userId of toInvite) {
                await inviteUser(identity, replacementRoom, userId);
            }
        } catch (error) {
            alert(error);
        } finally {
            setBusy(false);
        }
    }, [replacementRoom, identity, roomId]);

    const handleTombstone = useCallback(async () => {
        setBusy(true);
        try {
            await setState(identity, roomId, 'm.room.tombstone', '', {
                replacement_room: replacementRoom,
            });
        } catch (error) {
            alert(error);
        } finally {
            setBusy(false);
        }
    }, [replacementRoom, identity, roomId]);

    return (
        <form onSubmit={handleSubmit}><fieldset disabled={busy}>
            <ol>
                <li>
                    <button disabled={busy} type="button" onClick={handleRoomCreation}>Create new room</button>
                    <HighUpLabelInput
                        label="Replacement room"
                        pattern="!.+"
                        title="A room id"
                        value={replacementRoom}
                        onInput={useCallback(({target}) => setReplacementRoom(target.value), [])}
                    />
                </li>
                <li><button disabled={busy} type="button" onClick={handleInviteMembers}>Invite members</button></li>
                <li><button disabled={busy} type="button" onClick={handleTombstone}>Create tombstone</button></li>
            </ol>
        </fieldset></form>
    );
}

const UserActions: FC<{identity: Identity, roomId: string}> = ({identity, roomId}) => {
    const [userId, setUserId] = useState('');
    const [reason, setReason] = useState('');
    const [busy, setBusy] = useState(false);

    const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(async event => {
        event.preventDefault();
        event.stopPropagation();
        const action = event.submitter.getAttribute('value');
        setBusy(true);
        try {
            if (action === 'ban') {
                await banUser(identity, roomId, userId, reason);
            } else if (action === 'invite') {
                await inviteUser(identity, roomId, userId);
            } else if (action === 'kick') {
                await kickUser(identity, roomId, userId, reason);
            } else if (action === 'unban') {
                await unbanUser(identity, roomId, userId);
            }
        } catch (error) {
            alert(error);
        } finally {
            setBusy(false);
        }
    }, [identity, reason, roomId, userId]);

    return (
        <form onSubmit={handleSubmit}><fieldset disabled={busy}>
            <HighUpLabelInput
                name="user_id"
                label="User"
                pattern="@.+:.+"
                required
                title="A user id, e.g. @foo:matrix.org"
                value={userId}
                onInput={useCallback(({target}) => setUserId(target.value), [])}
            />
            <HighUpLabelInput
                name="kick_reason"
                label="Reason for kick or ban"
                title="A reason why this user gets kicked or banned."
                value={reason}
                onInput={useCallback(({target}) => setReason(target.value), [])}
            />
            <button type="submit" value="invite">Invite</button>
            <button type="submit" value="kick">Kick</button>
            <button type="submit" value="ban">Ban</button>
            <button type="submit" value="unban">Unban</button>
        </fieldset></form>
    );
};

function StateExplorer({identity, roomId}) {
    const [type, setType] = useState('');
    const [stateKey, setStateKey] = useState('');
    const [busy, setBusy] = useState(false);
    const [data, setData] = useState('');

    const handleGet = useCallback(async event => {
        event.preventDefault();
        event.stopPropagation();
        if (!type) {
            const answer = await confirm('Room states can be REALLY big.\nConfirm, if you don\'t want to filter for a type.');
            if (!answer) return;
        }
        setBusy(true);
        try {
            const data = await getState(identity, roomId, type || undefined, stateKey || undefined);
            setData(JSON.stringify(data, null, 2));
        } catch (error) {
            console.warn(error);
            setData(error.message);
        } finally {
            setBusy(false);
        }
    }, [identity, roomId, stateKey, type]);

    const handlePut = useCallback(async event => {
        event.preventDefault();
        event.stopPropagation();
        setBusy(true);
        if (!type) {
            alert('type is required when setting a state!');
        }
        try {
            let content;
            try {
                content = JSON.parse(data);
            } catch (error) {
                alert('Invalid JSON', error);
                return;
            }
            let warning = `Do you want to set ${type} `;
            if (stateKey) {
                warning += `with state_key ${stateKey} `;
            }
            warning += `in room ${roomId}?`;
            const confirmed = await confirm(warning);
            if (!confirmed) return;
            await setState(identity, roomId, type, stateKey || undefined, content);
        } catch (error) {
            alert(error);
        } finally {
            setBusy(false);
        }
    }, [data, identity, roomId, stateKey, type]);

    return <>
        <form onSubmit={handleGet}><fieldset disabled={busy}>
            <HighUpLabelInput
                name="state_type"
                label="Type"
                list="state-types"
                value={type}
                onInput={useCallback(({target}) => setType(target.value), [])}
            />
            <HighUpLabelInput
                name="state_key"
                label="State Key"
                value={stateKey}
                onInput={useCallback(({target}) => setStateKey(target.value), [])}
            />
            <button type="submit">Query</button>
        </fieldset></form>
        <form onSubmit={handlePut}><fieldset disabled={busy}>
            <label>State
                <textarea
                    value={data}
                    onInput={useCallback(({target}) => setData(target.value), [])}
                />
            </label>
            <div><button type="submit">Overwrite state</button></div>
        </fieldset></form>
    </>;
}

const MemberList: FC<{ members: object[] }> = ({members}) => {
    if (members.length === 0) {
        return <p>There's no one in this list.</p>;
    }
    return (
        <ul>
            {members.map(memberEvent => {
                return <li key={memberEvent.state_key}>{memberEvent.state_key}</li>;
            })}
        </ul>
    );
}

const MediaList: FC<{ list: string[] }> = ({list}) => {
    if (list.length === 0) {
        return <p>There's no media in this list.</p>;
    }
    return (
        <ul>
            {list.map(mediaUrl => {
                return <li key={mediaUrl}>{mediaUrl}</li>;
            })}
        </ul>
    );
}

function memberEventsToGroups(memberEvents: object[]) {
    if (!Array.isArray(memberEvents)) {
        return null;
    }
    const membersByMembership = new Map<string, string[]>(Object.entries({
        join: [],
        invite: [],
        knock: [],
        leave: [],
        ban: [],
    }));
    for (const event of memberEvents) {
        if (!membersByMembership.has(event.content.membership)) {
            membersByMembership.set(event.content.membership, []);
        }
        membersByMembership.get(event.content.membership).push(event);
    }
    return membersByMembership;
}

const MembersExplorer: FC<{ identity: Identity, roomId: string }> = ({identity, roomId}) => {
    const [busy, setBusy] = useState(false);
    const [members, setMembers] = useState<null | Record<string, string>[]>(null);

    useEffect(() => {
        setMembers(null);
    }, [roomId]);

    const handleGet: FormEventHandler<HTMLFormElement> = useCallback(async event => {
        event.preventDefault();
        event.stopPropagation();
        setBusy(true);
        try {
            const data = await getMembers(identity, roomId);
            setMembers([...data.chunk]);
        } catch (error) {
            alert(error);
        } finally {
            setBusy(false);
        }
    }, [identity, roomId]);

    const groups = useMemo(() => memberEventsToGroups(members), [members]);

    return <>
        <form onSubmit={handleGet}><fieldset disabled={busy}>
            <p>Doesn't support pagination yet. Up to 60.000 users seems safe.</p>
            <button type="submit">Get members</button>
        </fieldset></form>
        {groups && <>
            <details open>
                <summary><h3>Joined ({groups.get('join').length})</h3></summary>
                <MemberList members={groups.get('join')} />
            </details>
            <details open>
                <summary><h3>Invited ({groups.get('invite').length})</h3></summary>
                <MemberList members={groups.get('invite')} />
            </details>
            <details>
                <summary><h3>Knocking ({groups.get('knock').length})</h3></summary>
                <MemberList members={groups.get('knock')} />
            </details>
            <details>
                <summary><h3>Left ({groups.get('leave').length})</h3></summary>
                <MemberList members={groups.get('leave')} />
            </details>
            <details>
                <summary><h3>Banned ({groups.get('ban').length})</h3></summary>
                <MemberList members={groups.get('ban')} />
            </details>
        </>}
    </>;
}

const MediaExplorer: FC<{ identity: Identity, roomId: string }> = ({identity, roomId}) => {
    const [busy, setBusy] = useState(false);
    const [media, setMedia] = useState(null);

    const handleGet: FormEventHandler<HTMLFormElement> = useCallback(async event => {
        event.preventDefault();
        event.stopPropagation();
        setBusy(true);
        try {
            const data = await getMediaByRoom(identity, roomId);
            setMedia(data.chunk);
        } catch (error) {
            alert(error);
        } finally {
            setBusy(false);
        }
    }, [identity, roomId]);

    return <>
        <form onSubmit={handleGet}><fieldset disabled={busy}>
            <button type="submit">Get media</button>
        </fieldset></form>
        {media && (<>
            <details open>
                <summary><h3>Local ({media.local.length})</h3></summary>
                <MediaList list={media.local} />
            </details>
            <details open>
                <summary><h3>Remote ({media.remote.length})</h3></summary>
                <MediaList list={media.remote} />
            </details>
        </>)}
    </>;
}

const IdentityProvider: FC = ({render, identityName}) => {
    const { identities } = useContext(Settings);
    const identity = identities.find(ident => ident.name === identityName);
    if (!identity) {
        return <>
            <AppHeader
                backUrl="#"
            >Invalid identity</AppHeader>
            <p>No such identity. Please go back and add an identity with the name {identityName}.</p>
        </>;
    }
    return render(identity);
}

const BulkInvitePage: FC<{ identity: Identity, roomId: string }> = ({identity, roomId}) => {
    const [userIds, setUserIds] = useState<string[] | null>(null);

    const handleSubmit = useCallback(({userIds}: {userIds: string[]}) => {
        setUserIds(userIds);
    }, []);

    const action = useCallback(async (userId: string) => {
        return inviteUser(identity, roomId, userId);
    }, [identity, roomId])

    return <>
        <AppHeader
            backUrl={`#/${encodeURIComponent(identity.name)}/${encodeURIComponent(roomId)}`}
        >Bulk Invite</AppHeader>
        <main>
            <h2>{roomId}</h2>
            {userIds === null ? 
                <BulkActionForm actionLabel="Invite" onSubmit={handleSubmit} />
            : 
                <BulkActionTracker action={action} items={userIds} />
            }
        </main>
        <NetworkLog />
    </>;
}

const BulkKickPage: FC<{ identity: Identity, roomId: string }> = ({identity, roomId}) => {
    const [userIds, setUserIds] = useState<string[] | null>(null);

    const handleSubmit = useCallback(({userIds}: {userIds: string[]}) => {
        setUserIds(userIds);
    }, []);

    const action: (userId: string) => void  = useCallback(async userId => {
        return kickUser(identity, roomId, userId);
    }, [identity, roomId]);

    return <>
        <AppHeader
            backUrl={`#/${encodeURIComponent(identity.name)}/${encodeURIComponent(roomId)}`}
        >Bulk Kick</AppHeader>
        <main>
            <h2>{roomId}</h2>
            {userIds === null ? 
                <BulkActionForm actionLabel="Kick" onSubmit={handleSubmit} />
             : 
                <BulkActionTracker action={action} items={userIds} />
            }
        </main>
        <NetworkLog />
    </>;
}

// function DesignTest() {
//     return 
//         <ResponseStatus status={undefined}/>
//         <ResponseStatus invalid={true} status={undefined}/>
//         <ResponseStatus status={null}/>
//         <ResponseStatus status={200}/>
//         <ResponseStatus status={403}/>
//         <ResponseStatus status={503}/>
//     `;
// }

function Shortcuts({identity}) {
    const handleClick = () => {
        window.location = `#/${encodeURIComponent(identity.name)}/overview`;
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'P') {
                event.preventDefault();
                event.stopPropagation();
                window.location = `#/${encodeURIComponent(identity.name)}/overview`;
            }
            console.log('added', event.key);
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [identity]);

    return <button
        accessKey="p"
        style={{display: 'none'}}
        type="button"
        onClick={handleClick}
    >Navigate to overview</button>;
}

function ThemeSetter() {
    const { theme } = useContext(Settings);

    useEffect(() => {
        const html = document.querySelector('html');
        if (!html) {
            return;
        }
        if (theme === 'light') {
            html.setAttribute('data-theme', 'light');
        } else if (theme === 'dark') {
            html.setAttribute('data-theme', 'dark');
        } else {
            const systemSettingDark = window.matchMedia('(prefers-color-scheme: dark)');
            html.setAttribute('data-theme', systemSettingDark.matches ? 'dark' : 'light');

            // Listen to changes of the browser setting
            const autoChange = (event: MediaQueryListEvent) => {
                html.setAttribute('data-theme', event.matches ? 'dark' : 'light');
            }
            systemSettingDark.addEventListener('change', autoChange);
            return () => {
                systemSettingDark.removeEventListener('change', autoChange);
            }
        }
    }, [theme]);
}

export function App() {
    const [page, setPage] = useState(location.hash.slice(1));

    useEffect(() => {
        const handleHashChange = () => {
            setPage(location.hash.slice(1));
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    const matchIdentityEditorPage = page.match(matchIdentityEditorPageRegExp);
    const matchRoomPage = page.match(matchRoomPageRegExp);

    const identityName =
        (matchIdentityEditorPage?.groups?.identityName && decodeURIComponent(matchIdentityEditorPage.groups.identityName)) ||
        (matchRoomPage?.groups?.identityName && decodeURIComponent(matchRoomPage.groups.identityName));
    const roomId = matchRoomPage?.groups?.roomId && decodeURIComponent(matchRoomPage.groups.roomId);

    let child;
    if (page === 'about') {
        child = <AboutPage />
    } else if (page === 'settings') {
        child = <SettingsPage />
    } else if (matchIdentityEditorPage) {
        child = <IdentityEditorPage identityName={identityName} />
    } else if (matchRoomPage) {
        child = <>
            <IdentityProvider
                identityName={identityName}
                render={(identity) => <Shortcuts identity={identity} />}
            />
            <IdentityProvider
                identityName={identityName}
                render={(identity) => {
                    if (matchRoomPage) {
                        if (matchRoomPage.groups.roomId === 'synapse-admin') {
                            return <SynapseAdminPage
                                identity={identity}
                            />;
                        } else if (matchRoomPage.groups.roomId === 'appservice') {
                            return <AppServicePage
                                identity={identity}
                            />;
                        } else if (matchRoomPage.groups.roomId === 'contact-list') {
                            return <ContactListPage
                                identity={identity}
                            />;
                        } else if (matchRoomPage.groups.roomId === 'mass-joiner') {
                            return <MassJoinerPage
                                identity={identity}
                            />;
                        } else if (matchRoomPage.groups.roomId === 'overview') {
                            return <OverviewPage
                            identity={identity}
                            />;
                        } else if (matchRoomPage.groups.roomId === 'polychat') {
                            return <PolychatPage
                            identity={identity}
                            />;
                        } else if (matchRoomPage.groups.roomId === 'room-list') {
                            return <RoomListPage
                                identity={identity}
                            />;
                        } else if (matchRoomPage.groups.roomId === 'user-inspector') {
                            return <UserInspectorPage
                                identity={identity}
                            />;
                        } else if (matchRoomPage.groups.subpage === 'yaml') {
                            return <RoomToYamlPage
                                identity={identity}
                                roomId={roomId}
                            />;
                        } else if (matchRoomPage.groups.subpage === 'invite') {
                            return <BulkInvitePage
                                identity={identity}
                                roomId={roomId}
                            />;
                        } else if (matchRoomPage.groups.subpage === 'mass-joiner') {
                            return <MassJoinerPage
                                identity={identity}
                                roomId={roomId}
                            />;
                        } else if (matchRoomPage.groups.subpage === 'kick') {
                            return <BulkKickPage
                                identity={identity}
                                roomId={roomId}
                            />;
                        } else if (matchRoomPage.groups.subpage === 'space-management') {
                            return <SpaceManagementPage
                                identity={identity}
                                roomId={roomId}
                            />;
                        }
                    }
                    return <MainPage
                        identity={identity}
                        roomId={roomId}
                    />;
                }}
            />
        </>
    } else {
        child = <>
            <IdentitySelectorPage />
            <NetworkLog />
        </>
    }

    return <>
        <SettingsProvider>
            <ThemeSetter />
            <NetworkRequestsProvider>
                {child}
            </NetworkRequestsProvider>
        </SettingsProvider>
        <AlertSingleton />
    </>;
}
const matchIdentityEditorPageRegExp = /^identity(?:\/(?<identityName>[^/]*))?$/;
const matchRoomPageRegExp = /^\/(?<identityName>[^/]*)(?:\/(?<roomId>[^/]*)(?:\/(?<subpage>.*))?)?$/;
