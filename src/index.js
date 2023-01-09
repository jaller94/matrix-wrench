import {
    createContext,
    html,
    render,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from './node_modules/htm/preact/standalone.module.js';
import {
    classnames,
    uniqueId,
} from './helper.js';
import { CustomButton, CustomForm } from './components/custom-forms.js';
import { AppHeader } from './components/header.js';
import { HighUpLabelInput } from './components/inputs.js';
import AboutPage from './pages/about.js';
import { RoomToYamlPage } from './pages/room-to-yaml.js';
import { ContactListPage } from './pages/contact-list.js';
import { RoomListPage } from './pages/room-list.js';
import { SynapseAdminPage } from './pages/synapse-admin.js';
// import {
//     ListWithSearch,
//     // RoomList,
// } from './components/list.js';
import {
    auth,
    MatrixError,
    banUser,
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
    setState,
    summarizeFetch,
    toCurlCommand,
    unbanUser,
    whoAmI,
} from './matrix.js';
import {
    loginWithPassword,
} from './matrix-auth.js';

function alert(...args) {
    console.warn(...args);
    window.alert(...args);
}

const NETWORKLOG_MAX_ENTRIES = 500;

let IDENTITIES = [];
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

const NetworkRequests = createContext({
    isShortened: false,
    requests: [],
});
const Settings = createContext({
    externalMatrixUrl: 'https://matrix.to/#/',
    identities: [],
    showNetworkLog: true,
});

// function Header() {
//     return html`
//         <header>
//             <nav>
//                 <button type="button">Network Log</button>
//                 <button type="button">Settings</button>
//                 <button type="button">About</button>
//             </nav>
//         </header>
//     `;
// }

function RoomActions({identity, roomId}) {
    const variables = useMemo(() => ({
        roomId,
    }), [roomId]);

    return html`
        <div>
            <${WhatsMyMemberState} identity=${identity} roomId=${roomId} />
        </div>
        <${CustomButton}
            identity=${identity}
            label="Join"
            method="POST"
            url="/_matrix/client/v3/rooms/!{roomId}/join"
            variables=${variables}
        />
        <${CustomButton}
            identity=${identity}
            label="Leave"
            method="POST"
            url="/_matrix/client/v3/rooms/!{roomId}/leave"
            variables=${variables}
        />
        <${CustomButton}
            identity=${identity}
            label="Forget"
            method="POST"
            url="/_matrix/client/v3/rooms/!{roomId}/forget"
            variables=${variables}
        />
        <${CustomButton}
            identity=${identity}
            label="Knock"
            method="POST"
            url="/_matrix/client/v3/knock/!{roomId}"
            variables=${variables}
        />
        <hr/>
        <ul>
            <li><a href=${`#/${encodeURIComponent(identity.name)}/${encodeURIComponent(roomId)}/invite`}>Bulk invite</a></li>
            <li><a href=${`#/${encodeURIComponent(identity.name)}/${encodeURIComponent(roomId)}/kick`}>Bulk kick</a></li>
        </ul>
    `;
}

function MakeRoomAdminForm({ identity, roomId }) {
    const [userId, setUserId] = useState('');

    const body = useMemo(() => ({
        user_id: userId,
    }), [userId]);

    const variables = useMemo(() => ({
        roomId,
    }), [roomId]);

    return html`
        <${CustomForm}
            body=${body}
            identity=${identity}
            method="POST"
            requiresConfirmation=${true}
            url="/_synapse/admin/v1/rooms/!{roomId}/make_room_admin"
            variables=${variables}
        >
            <${HighUpLabelInput}
                label="User"
                pattern="@.+:.+"
                required
                title="A user id, e.g. @foo:matrix.org"
                value=${userId}
                oninput=${useCallback(({target}) => setUserId(target.value), [])}
            />
            <button>Make user a room admin</button>
        </>
    `;
}

function WhoAmI({identity}) {
    const [busy, setBusy] = useState(false);
    const [info, setInfo] = useState(null);

    const handleSubmit = useCallback(async event => {
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

    return html`
        <button
            disabled=${busy}
            style="width: 120px"
            type="button"
            onclick=${handleSubmit}
        >Who am I?</button>
        <p>
            Matrix ID: ${info?.user_id || 'unknown'}
            <br/>
            Device ID: ${info?.device_id || 'unknown'}
        </p>
    `;
}

function WhatsMyMemberState({identity, roomId}) {
    const [busy, setBusy] = useState(false);
    const [info, setInfo] = useState(null);

    const handleSubmit = useCallback(async event => {
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
            if (error instanceof MatrixError && error.content && error.content.errcode === 'string') {
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

    return html`
        <button
            disabled=${busy}
            type="button"
            onclick=${handleSubmit}
        >Am I a member?</button> Result: ${info || 'unknown'}
    `;
}

function PasswordInput({serverAddress, onAccessToken}) {
    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = useCallback(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const data = await loginWithPassword(serverAddress, user, password);
        onAccessToken(data.access_token);
    }, [password, serverAddress, user, onAccessToken]);

    return html`
        <form onsubmit=${handleSubmit}>
            <div>
                <${HighUpLabelInput}
                    label="Matrix ID or user name"
                    name="user"
                    value=${user}
                    oninput=${useCallback(({target}) => setUser(target.value), [])}
                />
            </div>
            <div>
                <${HighUpLabelInput}
                    autocomplete="current-password"
                    label="Password"
                    name="password"
                    value=${password}
                    type="password"
                    oninput=${useCallback(({target}) => setPassword(target.value), [])}
                />
            </div>
            <button>Get access token</button>
        </div>
    `;
}

function IdentityEditorPage({identityName}) {
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

    return html`<${IdentityEditor}
        error=${editingError}
        identity=${editedIdentity}
        onSave=${handleSave}
    />`;
}

function IdentityEditor({error, identity, onSave}) {
    const [name, setName] = useState(identity.name ?? '');
    const [serverAddress, setServerAddress] = useState(identity.serverAddress ?? '');
    const [accessToken, setAccessToken] = useState(identity.accessToken ?? '');
    const [authType, setAuthType] = useState('accessToken');
    const [rememberLogin, setRememberLogin] = useState(identity.rememberLogin ?? false);

    const handleReceivedAccessToken = useCallback((accessToken) => {
        setAccessToken(accessToken);
        setAuthType('accessToken');
    }, []);

    const handleAccessTokenInput = useCallback(({target}) => setAccessToken(target.value), []);

    const handleSubmit = useCallback(event => {
        event.preventDefault();
        event.stopPropagation();
        onSave({name, serverAddress, accessToken, rememberLogin});
    }, [accessToken, name, onSave, serverAddress, rememberLogin]);
    
    const handleRememberLoginClick = useCallback(({target}) => setRememberLogin(target.checked), []);

    return html`
        <${AppHeader}
            backUrl="#"
        >Identity Editor</>
        <form class="identity-editor-form" onsubmit=${handleSubmit}>
            <div>
                <${HighUpLabelInput}
                    label="Name"
                    name="name"
                    pattern="[^/]+"
                    required
                    value=${name}
                    oninput=${useCallback(({target}) => setName(target.value), [])}
                />
            </div>
            ${name.includes('/') && html`<p>The identity name must not include a slash character (/).</p>`}
            <div>
                <${HighUpLabelInput}
                    label="Server address (e.g. https://matrix-client.matrix.org)"
                    name="url"
                    type="url"
                    required
                    value=${serverAddress}
                    oninput=${useCallback(({target}) => setServerAddress(target.value), [])}
                />
            </div>
            <div>
                <fieldset>
                    <legend>Authorization method</legend>

                    <label>
                        <input
                            type="radio"
                            name="authType"
                            checked=${authType === 'accessToken'}
                            onclick=${useCallback(() => setAuthType('accessToken'), [])}
                        />
                        Access Token
                    </label>

                    <label>
                        <input
                            type="radio"
                            name="authType"
                            checked=${authType === 'password'}
                            onchange=${useCallback(() => setAuthType('password'), [])}
                        />
                        Password
                    </label>
                </fieldset>
            </div>
            ${authType === 'accessToken' ? html`
                <div>
                    <${HighUpLabelInput}
                        autocomplete="current-password"
                        label="Access token"
                        name="accessToken"
                        value=${accessToken}
                        type="password"
                        oninput=${handleAccessTokenInput}
                    />
                </div>
            ` : html`
                <${PasswordInput}
                    serverAddress=${serverAddress}
                    onAccessToken=${handleReceivedAccessToken}
                />
            `}
            ${!!localStorage && html`
                <div>
                    <ul class="checkbox-list">
                        <li><label>
                            <input
                                checked=${rememberLogin}
                                type="checkbox"
                                onChange=${handleRememberLoginClick}
                            />
                            Remember login
                        </label></li>
                    </ul>
                </div>
            `}
            ${!!error && html`<p>${error}</p>`}
            <a href="#">Cancel</a>
            <button type="submit" class="primary">Save</button>
        </form>
    `;
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
    return html`
        <span
            class=${classnames(
                'network-log-request_status',
                {
                    'network-log-request_status--success': status >= 200 && status < 300,
                    'network-log-request_status--client-error': status >= 400 && status < 500,
                    'network-log-request_status--server-error': status >= 500 || invalid,
                    'network-log-request_status--network': status === null,
                    'network-log-request_status--pending': status === undefined,
                },
            )}
            title=${title}
        >${label}</span>
    `;
}

function NetworkLogRequest({request}) {
    return html`
        <li value=${request.id}><details>
            <summary>
                <div class="network-log-request_header">
                    <span class="network-log-request_summarized-fetch">${summarizeFetch(request.resource, request.init)}</span>
                    <span class="network-log-request_time">${request.sent.toLocaleTimeString()}</span>
                    <${ResponseStatus} invalid=${request.isNotJson} status=${request.status}/>
                </div>
            </summary>
            <div>
                <strong>Sent:</strong> ${request.sent.toLocaleString()}
            </div>
            <div>
                <strong>Curl command:</strong>
                <code class="network-log-request_curl">${toCurlCommand(request.resource, request.init)}</code>
            </div>
        </details></li>
    `;
}

function NetworkRequestsProvider({children}) {
    const [state, setState] = useState({
        isShortened: false,
        requests: [],
    });

    useEffect(() => {
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

    return html`
        <${NetworkRequests.Provider} value=${state}>
            ${children}
        </>
    `;
}

export function NetworkLog() {
    const { showNetworkLog } = useContext(Settings);
    const {isShortened, requests} = useContext(NetworkRequests);
    if (!showNetworkLog) {
        return;
    }
    return html`
        <h2>Network Log</h2>
        ${isShortened && html`<p>Older entries have been removed.</p>`}
        ${requests.length === 0 ? html`
            <p>Requests to Matrix homeservers will be listed here.</p>
        ` : html`
            <ol class="network-log_list">
                ${requests.map(request => (
                    html`<${NetworkLogRequest} key=${request.id} request=${request}/>`
                ))}
            </ol>
        `}
    `;
}

function SettingsProvider({children}) {
    const [state, setState] = useState({
        externalMatrixUrl: 'https://matrix.to/#/',
        identities: IDENTITIES,
        showNetworkLog: true,
    });

    useEffect(() => {
        const setExternalMatrixUrl = (externalMatrixUrl) => {
            setState(state => ({
                ...state,
                externalMatrixUrl,
            }));
        };
        
        const setIdentities = (callback) => {
            setState(state => ({
                ...state,
                identities: callback(state.identities),
            }));
        };

        const setShowNetworkLog = (showNetworkLog) => {
            setState(state => ({
                ...state,
                showNetworkLog,
            }));
        };

        setState(state => ({
            ...state,
            setExternalMatrixUrl,
            setIdentities,
            setShowNetworkLog,
        }));
    }, []);

    return html`
        <${Settings.Provider} value=${state}>
            ${children}
        </>
    `;
}

function IdentitySelectorRow({identity, onDelete}) {
    return html`<li>
        <a
            class="identity-page_name"
            href=${`#/${identity.name}`}
        >${identity.name}</a>
        <a
            class="identity-page_action"
            href="#identity/${identity.name}"
            title="Edit identity ${identity.name}"
        >✏️</a>
        <button
            class="identity-page_action"
            title="Delete identity ${identity.name}"
            type="button"
            onclick=${useCallback(() => onDelete(identity), [identity, onDelete])}
        >❌</button>
    </li>`;
}

function IdentitySelector({identities, onDelete}) {
    return html`
        ${identities.map(identity => {
            return html`<${IdentitySelectorRow}
                key=${identity.name}
                identity=${identity}
                onDelete=${onDelete}
            />`;
        })}
    `;
}

function AliasResolver({identity}) {
    const [alias, setAlias] = useState('');
    const [busy, setBusy] = useState(false);
    const [roomId, setRoomId] = useState('');

    const handleSubmit = useCallback(async event => {
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

    return html`
        <form onsubmit=${handleSubmit}><fieldset disabled=${busy}>
            <${HighUpLabelInput}
                label="Room alias"
                pattern="#.+:.+"
                required
                title="A room alias starting with a number sign, e.g. #matrixhq:matrix.org"
                value=${alias}
                oninput=${useCallback(({target}) => setAlias(target.value), [])}
            />
            <button type="submit">Resolve</button>
        </fieldset></form>
        <div>
            <strong>Room id:</strong>
            <code style="border: 2px black dotted; user-select:all; margin-left: .5em">${roomId || 'N/A'}</code>
        </div>
    `;
}

function saveIdentitiesToLocalStorage(identities) {
    if (!localStorage) return;
    // Filter out identities where the user said to not remember them.
    const identitiesToStore = identities.filter(identity => identity.rememberLogin).map(identity => {
        const copyOfIdentity = {...identity};
        delete copyOfIdentity.rememberLogin;
        return copyOfIdentity;
    });
    localStorage.setItem('identities', JSON.stringify(identitiesToStore));
}

function MainPage({identity, roomId}) {
    return html`
        <${AppHeader}
            backLabel="Switch identity"
            backUrl="#"
        >${identity.name ?? 'No authentication'}</>
        <div style="display: flex; flex-direction: column">
            ${identity.accessToken ? html`
                <div class="card">
                    <${WhoAmI} identity=${identity}/>
                </div>
                <${RoomSelector} identity=${identity} roomId=${roomId}/>
            ` : html`
                <div class="card">
                    <h2>Alias to Room ID</h2>
                    <${AliasResolver} identity=${identity}/>
                </div>
            `}
        </div>
        <${NetworkLog} />
    `;
}

function IdentitySelectorPage() {
    const {identities, setIdentities} = useContext(Settings);

    const handleDelete = useCallback((identity) => {
        const confirmed = confirm(`Do you want to remove ${identity.name}?\nThis doesn't invalidate the access token.`);
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

    return html`
        <${AppHeader}>Identities</>
        <main>
        ${identities.length === 0 ? (html`
                <p>
                    Hi there! Need to tweak some Matrix rooms?<br/>
                    First, you need to add an identity. An identity is a combination of a homeserver URL and an access token.<br/>
                    Wrench can handle multiple identities. It assumes that identities are sensitive, so they aren't stored by default.
                </p>
            `) : (html`
                <p>Choose an identity. An identity is a combination of a homeserver URL and an access token.</p>
                <ul class="identity-page_list">
                    <${IdentitySelector} identities=${identities} onDelete=${handleDelete} />
                </ul>
            `)}
            <a href="#identity">Add identity</a>
        </main>
    `;
}

function RoomList({roomIds, onSelectRoom}) {
    const {externalMatrixUrl} = useContext(Settings);
    const handleSelectRoom = useCallback(event => {
        event.preventDefault();
        event.stopPropagation();
        onSelectRoom(event.target.dataset.roomId);
    }, [onSelectRoom]);
 
    if (roomIds.length === 0) {
        return html`
            <p>There's no room in this list.</p>
        `;
    }
    return html`
        <ul style="overflow-x: auto">
            ${roomIds.map(roomId => html`
                <li key=${roomId}>
                    ${onSelectRoom ? html`
                        <button
                            type="button"
                            data-room-id=${roomId}
                            onclick=${handleSelectRoom}
                        >${roomId}</button>
                    ` : roomId}
                    <a
                        href=${`${externalMatrixUrl}${encodeURIComponent(roomId)}`}
                        rel="noopener noreferrer"
                        target="_blank"
                        title="Open room externally"
                    >
                        <img alt="" src="./assets/external-link.svg" />
                    </a>
                </li>
            `)}
        </ul>
    `;
}

function JoinedRoomList({identity, onSelectRoom}) {
    const [roomIds, setRoomIds] = useState(null);
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

    return html`
        <h3>Joined rooms</h3>
        <button disabled=${busy} type="button" onclick=${handleGet}>Query joined rooms</button>
        ${roomIds && html`<${RoomList} roomIds=${roomIds} onSelectRoom=${onSelectRoom}/>`}
    `;
}

function RoomSelector({identity, roomId}) {
    const [room, setRoom] = useState('');
    const [resolvedRoomId, setResolvedRoomId] = useState(null);
    const [recentRooms, setRecentRooms] = useState([]);
    const [busy, setBusy] = useState(false);

    const handleSelectRoom = useCallback(roomId => {
        window.location = `#/${encodeURIComponent(identity.name)}/${encodeURIComponent(roomId)}`;
        setRecentRooms(recentRooms => ([
            roomId,
            ...recentRooms.filter(r => r !== roomId),
        ]).slice(0, 4));
    }, [identity.name]);

    const handleResolveAlias = useCallback(async event => {
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

    const handleSubmit = useCallback(async event => {
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
        return html`
            <hr/>
            <button onclick=${handleResetRoomId}>Switch to a different room</button>
            <${RoomPage} identity=${identity} roomId=${roomId}/>
        `;
    }

    return html`
        <div class="card">
            <h2>Room management</h2>
            <form onsubmit=${handleSubmit}><fieldset disabled=${busy}>
                <${HighUpLabelInput}
                    name="room"
                    label="Room alias or ID"
                    pattern="[!#].+:.+"
                    required
                    value=${room}
                    oninput=${({target}) => setRoom(target.value)}
                />
                <button
                    disabled=${!room.startsWith('#')}
                    type="button"
                    onclick=${handleResolveAlias}
                >Resolve alias</button>
                <button type="submit" class="primary">Open details</button>
            </fieldset></form>
            <div>
                <strong>Room id:</strong>
                <code style="border: 2px black dotted; user-select:all; margin-left: .5em">${resolvedRoomId || 'N/A'}</code>
            </div>
            <aside>
                ${recentRooms.length > 0 && html`
                    <h3>Recent rooms</h3>
                    <${RoomList} roomIds=${recentRooms} onSelectRoom=${handleSelectRoom}/>
                `}
                <${JoinedRoomList} identity=${identity} onSelectRoom=${handleSelectRoom}/>
            </aside>
        </div>
    `;
}

async function getRoomsInASpaceInner(identity, roomId, maxDepth, roomMap) {
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

async function getRoomsInASpace(identity, roomId, maxDepth = 1) {
    const roomMap = new Map();
    await getRoomsInASpaceInner(identity, roomId, maxDepth, roomMap);
    return [...roomMap.values()];
}

async function deleteRoom(identity, roomId, body = {}) {
    await doRequest(...auth(identity, `${identity.serverAddress}/_synapse/admin/v2/rooms/${encodeURIComponent(roomId)}`, {
        method: 'DELETE',
        body: JSON.stringify(body),
    }));
}

function SynapseAdminDelete({ identity, roomId }) {
    const [busy, setBusy] = useState(false);
    const [progress, setProgress] = useState(undefined);
    const [total, setTotal] = useState(undefined);

    const [block, setBlock] = useState(false);
    const [purge, setPurge] = useState(true);
    const [forcePurge, setForcePurge] = useState(false);

    const handleSubmit = useCallback((event) => {
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

    return html`
        <form onsubmit=${handleSubmit}><fieldset disabled=${busy}>
            <ul class="checkbox-list">
                <li><label>
                    <input
                        checked=${block}
                        type="checkbox"
                        onChange=${handleBlockClick}
                    />
                    Block in the future
                </label></li>
                <li><label>
                    <input
                        checked=${purge}
                        type="checkbox"
                        onChange=${handlePurgeClick}
                    />
                    Purge from database
                </label></li>
                <li><label>
                    <input
                        checked=${forcePurge}
                        type="checkbox"
                        onChange=${handleForcePurgeClick}
                    />
                    Purge even if local users cannot be removed
                </label></li>
            </ul>
            ${busy && html`
                <div>
                    <progress max=${total} value=${progress}>Deleted ${progress} of ${total} rooms.</progress>
                </div>
            `}
            <${CustomButton}
                body=${body}
                identity=${identity}
                label="Delete room"
                method="DELETE"
                requiresConfirmation
                url="/_synapse/admin/v2/rooms/!{roomId}"
                variables=${variables}
            />
            <${DeleteSpaceRecursivelyButton}
                body=${body}
                identity=${identity}
                roomId=${roomId}
                onBusy=${handleBusy}
                onProgress=${setProgress}
                onTotal=${setTotal}
            />
        </fieldset></form>
    `;
}

function DeleteSpaceRecursivelyButton({ body, identity, roomId, onBusy, onProgress, onTotal }) {
    const handlePress = useCallback(async() => {
        onBusy(true);
        try {
            let confirmed = confirm('Fetching a list of all subspaces and rooms can take many minutes.\nAre you ok to wait?');
            if (!confirmed) return;
            const rooms = await getRoomsInASpace(identity, roomId, -1);
            const roomIds = new Set(rooms.map(r => r.roomId));
            roomIds.add(roomId);
            onTotal(roomIds.size);
            confirmed = confirm(`Found ${roomIds.size} rooms (includes spaces) to delete.\nAre you sure you want to DELETE ALL?`);
            if (!confirmed) return;
            let progress = 0;
            for (const roomId of roomIds.values()) {
                try {
                    await deleteRoom(identity, roomId, body);
                } catch (error) {
                    let confirmed = confirm(`Failed to delete room ${roomId}.\n${error.error || error.message}\nContinue?`);
                    if (!confirmed) return;
                }
                progress += 1;
                onProgress(progress);
            }
        } finally {
            onBusy(false);
        }
    }, [body, identity, roomId, onBusy, onProgress, onTotal]);

    return html`
        <button type="button" onclick=${handlePress}>Delete space recursively</button>
    `;
}

function RoomPage({identity, roomId}) {
    return html`
        <h3>${roomId}</h3>
        <div class="page">
            <div class="section">
                <details open>
                    <summary><h2>Membership</h2></summary>
                    <${RoomActions} identity=${identity} roomId=${roomId}/>
                </details>
            </div>
            <div class="section">
                <details open>
                    <summary><h2>State</h2></summary>
                    <${StateExplorer} identity=${identity} roomId=${roomId}/>
                </details>
            </div>
            <div class="section">
                <details open>
                    <summary><h2>Moderation</h2></summary>
                    <${UserActions} identity=${identity} roomId=${roomId}/>
                </details>
            </div>
            <div class="section">
                <details open>
                    <summary><h2>Members</h2></summary>
                    <${MembersExplorer} identity=${identity} roomId=${roomId}/>
                </details>
            </div>
            <div class="section">
                <details open>
                    <summary><h2>Aliases</h2></summary>
                    <${AliasActions} identity=${identity} roomId=${roomId}/>
                </details>
            </div>
            <div class="section">
                <details>
                    <summary><h2>Synapse Admin</h2></summary>
                    <${MakeRoomAdminForm} identity=${identity} roomId=${roomId}/>
                    <hr/>
                    <h3>Remove users and delete room</h3>
                    <${SynapseAdminDelete} identity=${identity} roomId=${roomId}/>
                </details>
            </div>
            <div class="section">
                <details>
                    <summary><h2>Media (Synapse Admin)</h2></summary>
                    <${MediaExplorer} identity=${identity} roomId=${roomId}/>
                </details>
            </div>
        </div>
    `;
}

function SettingsPage() {
    const {
        externalMatrixUrl, setExternalMatrixUrl,
        showNetworkLog, setShowNetworkLog,
    } = useContext(Settings);

    return html`
        <${AppHeader}
            backUrl="#"
        >Settings</>
        <main>
            <form>
                <${HighUpLabelInput}
                    name="external_matrix_links"
                    label="External Matrix links"
                    value=${externalMatrixUrl}
                    oninput=${useCallback(({target}) => setExternalMatrixUrl(target.value), [setExternalMatrixUrl])}
                />
                <ul class="checkbox-list">
                    <li><label>
                        <input
                            checked=${showNetworkLog}
                            type="checkbox"
                            onChange=${useCallback(({target}) => setShowNetworkLog(target.checked), [setShowNetworkLog])}
                        />
                        Show network log
                    </label></li>
                </ul>
            </form>
        </main>
        <${NetworkLog} />
    `;
}

function AliasActions({ identity, roomId }) {
    const [alias, setAlias] = useState('');
    const [busy, setBusy] = useState(false);

    const handleSubmit = useCallback(async event => {
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

    return html`
        <form onsubmit=${handleSubmit}><fieldset disabled=${busy}>
            <${HighUpLabelInput}
                label="Alias"
                pattern="#.+:.+"
                required
                title="A room alias, e.g. #matrix:matrix.org"
                value=${alias}
                oninput=${useCallback(({target}) => setAlias(target.value), [])}
            />
            <button type="submit" value="add">Add</button>
            <button type="submit" value="remove">Remove</button>
        </fieldset></form>
    `;
}

function UserActions({ identity, roomId }) {
    const [userId, setUserId] = useState('');
    const [reason, setReason] = useState('');
    const [busy, setBusy] = useState(false);

    const handleSubmit = useCallback(async event => {
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

    return html`
        <form onsubmit=${handleSubmit}><fieldset disabled=${busy}>
            <${HighUpLabelInput}
                name="user_id"
                label="User"
                pattern="@.+:.+"
                required
                title="A user id, e.g. @foo:matrix.org"
                value=${userId}
                oninput=${useCallback(({target}) => setUserId(target.value), [])}
            />
            <${HighUpLabelInput}
                name="kick_reason"
                label="Reason for kick or ban"
                title="A reason why this user gets kicked or banned."
                value=${reason}
                oninput=${useCallback(({target}) => setReason(target.value), [])}
            />
            <button type="submit" value="invite">Invite</button>
            <button type="submit" value="kick">Kick</button>
            <button type="submit" value="ban">Ban</button>
            <button type="submit" value="unban">Unban</button>
        </fieldset></form>
    `;
}

function StateExplorer({identity, roomId}) {
    const [type, setType] = useState('');
    const [stateKey, setStateKey] = useState('');
    const [busy, setBusy] = useState(false);
    const [data, setData] = useState('');

    const handleGet = useCallback(async event => {
        event.preventDefault();
        event.stopPropagation();
        if (!type) {
            const answer = confirm('Room states can be REALLY big.\nConfirm, if you don\'t want to filter for a type.');
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
            const confirmed = confirm(warning);
            if (!confirmed) return;
            await setState(identity, roomId, type, stateKey || undefined, content);
        } catch (error) {
            alert(error);
        } finally {
            setBusy(false);
        }
    }, [data, identity, roomId, stateKey, type]);

    return html`
        <form onsubmit=${handleGet}><fieldset disabled=${busy}>
            <${HighUpLabelInput}
                name="state_type"
                label="Type"
                list="state-types"
                value=${type}
                oninput=${useCallback(({target}) => setType(target.value), [])}
            />
            <${HighUpLabelInput}
                name="state_key"
                label="State Key"
                value=${stateKey}
                oninput=${useCallback(({target}) => setStateKey(target.value), [])}
            />
            <button type="submit">Query</button>
        </fieldset></form>
        <form onsubmit=${handlePut}><fieldset disabled=${busy}>
            <label>State
                <textarea oninput=${useCallback(({target}) => setData(target.value), [])}>${data}</textarea>
            </label>
            <div><button type="submit">Overwrite state</button></div>
        </fieldset></form>
    `;
}

function MemberList({members}) {
    if (members.length === 0) {
        return html`
            <p>There's no one in this list.</p>
        `;
    }
    return html`
        <ul>
            ${members.map(memberEvent => {
                return html`<li key=${memberEvent.state_key}>${memberEvent.state_key}</li>`;
            })}
        </ul>
    `;
}

function MediaList({list}) {
    if (list.length === 0) {
        return html`
            <p>There's no media in this list.</p>
        `;
    }
    return html`
        <ul>
            ${list.map(mediaUrl => {
                return html`<li key=${mediaUrl}>${mediaUrl}</li>`;
            })}
        </ul>
    `;
}

function MembersExplorer({identity, roomId}) {
    const [busy, setBusy] = useState(false);
    const [members, setMembers] = useState(null);

    const handleGet = useCallback(async event => {
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

    const groups = useMemo(() => {
        if (!Array.isArray(members)) {
            return null;
        }
        const membersByMembership = {
            join: [],
            invite: [],
            knock: [],
            leave: [],
            ban: [],
        };
        for (const event of members) {
            if (membersByMembership[event.content.membership] === undefined) {
                membersByMembership[event.content.membership] = [];
            }
            membersByMembership[event.content.membership].push(event);
        }
        return membersByMembership;
    }, [members]);

    return html`
        <form onsubmit=${handleGet}><fieldset disabled=${busy}>
            <p>Doesn't support pagination yet. Up to 60.000 users seems safe.</p>
            <button type="submit">Get members</button>
        </fieldset></form>
        ${groups && (html`
            <details open>
                <summary><h3>Joined (${groups.join.length})</h3></summary>
                <${MemberList} members=${groups.join} />
            </details>
            <details open>
                <summary><h3>Invited (${groups.invite.length})</h3></summary>
                <${MemberList} members=${groups.invite} />
            </details>
            <details>
                <summary><h3>Knocking (${groups.knock.length})</h3></summary>
                <${MemberList} members=${groups.knock} />
            </details>
            <details>
                <summary><h3>Left (${groups.leave.length})</h3></summary>
                <${MemberList} members=${groups.leave} />
            </details>
            <details>
                <summary><h3>Banned (${groups.ban.length})</h3></summary>
                <${MemberList} members=${groups.ban} />
            </details>
        `)}
    `;
}

function MediaExplorer({identity, roomId}) {
    const [busy, setBusy] = useState(false);
    const [media, setMedia] = useState(null);

    const handleGet = useCallback(async event => {
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

    return html`
        <form onsubmit=${handleGet}><fieldset disabled=${busy}>
            <button type="submit">Get media</button>
        </fieldset></form>
        ${media && (html`
            <details open>
                <summary><h3>Local (${media.local.length})</h3></summary>
                <${MediaList} list=${media.local} />
            </details>
            <details open>
                <summary><h3>Remote (${media.remote.length})</h3></summary>
                <${MediaList} list=${media.remote} />
            </details>
        `)}
    `;
}

function IdentityProvider({render, identityName}) {
    const { identities } = useContext(Settings);
    const identity = identities.find(ident => ident.name === identityName);
    if (!identity) {
        return html`
            <${AppHeader}
                backUrl="#"
            >Invalid identity</>
            <p>No such identity. Please go back and add an identity with the name ${identityName}.</p>
        `;
    }
    return render(identity);
}

function BulkInviteForm({actionLabel, onSubmit}) {
    const [userIdsString, setUserIdsString] = useState('');

    const handleSubmit = useCallback(async event => {
        event.preventDefault();
        event.stopPropagation();
        let userIds = userIdsString.split(/[\s,;]/);
        userIds = userIds.map(userIds => userIds.trim());
        const userIdRegExp = /^@.*:/;
        userIds = userIds.filter(userId => userIdRegExp.test(userId));
        await onSubmit({
            userIds,   
        });
    }, [userIdsString, onSubmit]);

    return html`
        <form onsubmit=${handleSubmit}>
            <label>
                User IDs (separated by spaces, new lines, commas or semi-colons)
                <textarea onchange=${useCallback(event => setUserIdsString(event.target.value), [])}>${userIdsString}</teaxtarea>
            </label>
            <button>${actionLabel}</button>
        </form>
    `;
}

function BulkInvitePage({identity, roomId}) {
    const [userIds, setUserIds] = useState(null);
    
    const handleSubmit = useCallback(({userIds}) => {
        setUserIds(userIds);
    }, []);

    return html`
        <${AppHeader}
            backUrl=${`#/${encodeURIComponent(identity.name)}/${encodeURIComponent(roomId)}`}
        >Bulk Invite</>
        <main>
            <h2>${roomId}</h2>
            ${userIds === null ? html` 
                <${BulkInviteForm} actionLabel="Invite" onSubmit=${handleSubmit} />
            ` : html`
                <${BulkActionTracker} action=${inviteUser} identity=${identity} items=${userIds} roomId=${roomId} />
            `}
        </main>
        <${NetworkLog} />
    `;
}

function BulkKickPage({identity, roomId}) {
    const [userIds, setUserIds] = useState(null);
    
    const handleSubmit = useCallback(({userIds}) => {
        setUserIds(userIds);
    }, []);

    return html`
        <${AppHeader}
            backUrl=${`#/${encodeURIComponent(identity.name)}/${encodeURIComponent(roomId)}`}
        >Bulk Kick</>
        <main>
            <h2>${roomId}</h2>
            ${userIds === null ? html` 
                <${BulkInviteForm} actionLabel="Kick" onSubmit=${handleSubmit} />
            ` : html`
                <${BulkActionTracker} action=${kickUser} identity=${identity} items=${userIds} roomId=${roomId} />
            `}
        </main>
        <${NetworkLog} />
    `;
}

function BulkActionTracker({ action, items, identity, roomId }) {
    const [currentItem, setCurrentItem] = useState(null);
    const [progress, setProgress] = useState(0);
    const [errors, setErrors] = useState([]);

    useEffect(() => {
        async function doAction() {
            for (const item of items) {
                try {
                    setCurrentItem(item);
                    await action(identity, roomId, item);
                } catch (error) {
                    setErrors(errors => [
                        ...errors,
                        {
                            id: uniqueId(),
                            item,
                            message: error.content?.errcode || error.message,
                        },
                    ]);
                }
                setProgress(value => value + 1);
            }
            setCurrentItem(null);
        }
        doAction();
    }, [action, identity, items, roomId]);

    return html`
        <h3>Progress</h3>
        <progress value=${progress} max=${items.length}>Processed ${progress} of ${items.length} items.</progress>
        ${currentItem ? html`
            Processing ${currentItem}…
        ` : html`
            ${progress} / ${items.length}
        `}
        <h3>Errors (${errors.length})</h3>
        ${errors.length === 0 ? html`<p>No errors</p>` : html`
            <ol>
                ${errors.map(error => html`<li key=${error.id}>${error.item} - ${error.message}</li>`)}
            </ol>
        `}
    `;
}

function SpaceManagementPage({identity, roomId}) {
    const [rooms, setRooms] = useState(null);
    
    const handleQuery = useCallback(async() => {
        const state = await getState(identity, roomId);
        const childrenEvents = state.filter(event => event.type === 'm.space.child');
        const { name } = state.find(event => event.type === 'm.room.name').content;
        const childrenRoomIds = childrenEvents.map(event => event.state_key);
        const rooms = [
            {
                id: roomId,
                name,
                children: childrenRoomIds.map(roomId => ({
                    id: roomId,
                })),
            },
        ];
        setRooms(rooms);
    }, [identity, roomId]);

    return html`
        <${AppHeader}
            backUrl=${`#/${encodeURIComponent(identity.name)}/${encodeURIComponent(roomId)}`}
        >Space Management</>
        <main>
            <button
                type="button"
                onClick=${handleQuery}
            >Query</button>
            ${rooms && html`
                <ul>
                    ${rooms.map(room => (html`
                        <li key=${room.id}>${room.name ?? room.id}</li>
                        ${room.children && html`
                            <ul>
                                ${room.children.map(room => (html`
                                    <li key=${room.id}>${room.name ?? room.id}</li>
                                `))}
                            </ul>
                        `}
                    `))}
                </ul>
            `}
        </main>
        <${NetworkLog} />
    `;
}

// function DesignTest() {
//     return html`
//         <${ResponseStatus} status=${undefined}/>
//         <${ResponseStatus} invalid=${true} status=${undefined}/>
//         <${ResponseStatus} status=${null}/>
//         <${ResponseStatus} status=${200}/>
//         <${ResponseStatus} status=${403}/>
//         <${ResponseStatus} status=${503}/>
//     `;
// }

function App() {
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
        (matchIdentityEditorPage?.groups.identityName && decodeURIComponent(matchIdentityEditorPage.groups.identityName)) ||
        (matchRoomPage?.groups.identityName && decodeURIComponent(matchRoomPage.groups.identityName));
    const roomId = matchRoomPage?.groups.roomId && decodeURIComponent(matchRoomPage.groups.roomId);
    
    let child;
    if (page === 'about') {
        child = html`<${AboutPage} />`;
    } else if (page === 'settings') {
        child = html`<${SettingsPage} />`;
    } else if (matchIdentityEditorPage) {
        child = html`<${IdentityEditorPage} identityName=${identityName} />`;
    } else if (matchRoomPage) {
        child = html`
            <${IdentityProvider}
                identityName=${identityName}
                render=${(identity) => {
                    if (matchRoomPage) {
                        if (matchRoomPage.groups.roomId === 'synapse-admin') {
                            return html`<${SynapseAdminPage}
                                identity=${identity}
                            />`;
                        } else if (matchRoomPage.groups.roomId === 'contact-list') {
                            return html`<${ContactListPage}
                                identity=${identity}
                            />`;
                        } else if (matchRoomPage.groups.roomId === 'room-list') {
                            return html`<${RoomListPage}
                                identity=${identity}
                            />`;
                        } else if (matchRoomPage.groups.subpage === 'yaml') {
                            return html`<${RoomToYamlPage}
                                identity=${identity}
                                roomId=${roomId}
                            />`;
                        } else if (matchRoomPage.groups.subpage === 'invite') {
                            return html`<${BulkInvitePage}
                                identity=${identity}
                                roomId=${roomId}
                            />`;
                        } else if (matchRoomPage.groups.subpage === 'kick') {
                            return html`<${BulkKickPage}
                                identity=${identity}
                                roomId=${roomId}
                            />`;
                        } else if (matchRoomPage.groups.subpage === 'space-management') {
                            return html`<${SpaceManagementPage}
                                identity=${identity}
                                roomId=${roomId}
                            />`;
                        }
                    }
                    return html`<${MainPage}
                        identity=${identity}
                        roomId=${roomId}
                    />`;
                }}
            />
        `;
    } else {
        child = html`
            <${IdentitySelectorPage} />
            <${NetworkLog} />
        `;
    }

    return html`
        <${SettingsProvider}>
            <${NetworkRequestsProvider}>
                ${child}
            </>
        </>
    `;
}
const matchIdentityEditorPageRegExp = /^identity(?:\/(?<identityName>[^/]*))?$/;
const matchRoomPageRegExp = /^\/(?<identityName>[^/]*)(?:\/(?<roomId>[^/]*)(?:\/(?<subpage>.*))?)?$/;

render(html`<${App} />`, document.body);
