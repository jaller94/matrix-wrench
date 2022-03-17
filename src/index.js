import { html, render, useCallback, useEffect, useMemo, useRef, useState } from './node_modules/htm/preact/standalone.module.js';
import {
    classnames,
    fillInVariables,
    uniqueId,
} from './helper.js';
import {
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
    IDENTITIES = identities;
} catch (error) {
    console.warn('No stored identities found in localStorage.', error);
}

const FloatingLabelInput = ({label, ...props}) => {
    const [id] = useState(uniqueId);
    return html`
        <div class="floating-label-input">
            <input id=${id} ...${props} placeholder="Text"/>
            <label
                for=${props.id ?? id}
            >${label}${props.required && html`<span class="floating-label-input_required" title="required"> *</span>`}</label>
        </div>
    `;
}

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

function CustomForm({ body, children, identity, method, requiresConfirmation, url, variables, ...props }) {
    const handleSubmit = useCallback(async event => {
        event.preventDefault();
        event.stopPropagation();
        if (requiresConfirmation) {
            const confirmed = confirm('This is a high-risk action!\nAre you sure?');
            if (!confirmed) return;
        }
        let actualUrl = `${identity.serverAddress}${fillInVariables(url, variables)}`;
        try {
            await doRequest(actualUrl, {
                method,
                headers: {
                    ...(identity.accessToken && {
                        Authorization: `Bearer ${identity.accessToken}`,
                    }),
                },
                ...(body && {
                    body: typeof body === 'string' ? body : JSON.stringify(body),
                }),
            });
        } catch (error) {
            alert(error);
        }
    }, [body, identity, method, requiresConfirmation, url, variables]);

    return html`
        <form onsubmit=${handleSubmit} ...${props}>${children}</form>
    `;
}

function CustomButton({ body, identity, label, method, requiresConfirmation, url, variables }) {
    const handlePress = useCallback(async event => {
        event.preventDefault();
        event.stopPropagation();
        if (requiresConfirmation) {
            const confirmed = confirm('This is a high-risk action!\nAre you sure?');
            if (!confirmed) return;
        }
        let actualUrl = `${identity.serverAddress}${fillInVariables(url, variables)}`;
        try {
            await doRequest(actualUrl, {
                method,
                headers: {
                    ...(identity.accessToken && {
                        Authorization: `Bearer ${identity.accessToken}`,
                    }),
                },
                ...(body && {
                    body: typeof body === 'string' ? body : JSON.stringify(body),
                }),
            });
        } catch (error) {
            alert(error);
        }
    }, [body, identity, method, requiresConfirmation, url, variables]);

    return html`
        <button type="button" onclick=${handlePress}>${label}</button>
    `;
}

function RoomActions({ identity, roomId }) {
    const variables = useMemo(() => ({
        roomId,
    }), [roomId]);

    return html`
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
    `;
}

function MakeRoomAdminButton({ identity, roomId }) {
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
            <${FloatingLabelInput}
                label="User"
                pattern="@.+:.+"
                required
                title="A user id, e.g. @foo:matrix.org"
                value=${userId}
                oninput=${useCallback(({ target }) => setUserId(target.value), [])}
            />
            <button>Make them a room admin</button>
        </>
    `;
}

function WhoAmI({identity}) {
    const [busy, setBusy] = useState(false);
    const [info, setInfo] = useState(null);

    const handleSubmit = useCallback(async (event) => {
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
            Matrix ID: ${(info || {}).user_id || 'unknown'}
            <br/>
            Device ID: ${(info || {}).device_id || 'unknown'}
        </p>
    `;
}

function IdentityEditor({error, identity, onCancel, onSave}) {
    const [name, setName] = useState(identity.name ?? '');
    const [serverAddress, setServerAddress] = useState(identity.serverAddress ?? '');
    const [accessToken, setAccessToken] = useState(identity.accessToken ?? '');

    const handleSubmit = useCallback(event => {
        event.preventDefault();
        event.stopPropagation();
        onSave({name, serverAddress, accessToken});
    }, [accessToken, name, onSave, serverAddress]);

    return html`
        <${AppHeader}
            onBack=${onCancel}
        >Identity Editor</>
        <form class="identity-editor-form" onsubmit=${handleSubmit}>
            <div>
                <${FloatingLabelInput}
                    label="Name"
                    name="name"
                    required
                    value=${name}
                    oninput=${useCallback(({ target }) => setName(target.value), [])}
                />
            </div>
            <div>
                <${FloatingLabelInput}
                    label="Server address (e.g. https://matrix-client.matrix.org)"
                    name="url"
                    type="url"
                    required
                    value=${serverAddress}
                    oninput=${useCallback(({ target }) => setServerAddress(target.value), [])}
                />
            </div>
            <div>
                <${FloatingLabelInput}
                    label="Access token"
                    name="accessToken"
                    value=${accessToken}
                    oninput=${useCallback(({ target }) => setAccessToken(target.value), [])}
                />
            </div>
            ${!!error && html`<p>${error}</p>`}
            <button type="button" onclick=${onCancel}>Cancel</button>
            <button type="submit">Save</button>
            ${!!localStorage && html`<p>Use Incognito mode, if you don't want access token to be stored in localStorage!</p>`}
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
                    'network-log-request_status--success': status === 200,
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
        <li><details>
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

function NetworkLog() {
    const [isShortened, setIsShortened] = useState(false);
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        const handleMatrixRequest = (event) => {
            setRequests(requests => {
                if (requests.length >= NETWORKLOG_MAX_ENTRIES) {
                    setIsShortened(true);
                }
                
                return [
                    ...requests,
                    {
                        id: event.detail.requestId,
                        init: event.detail.init,
                        resource: event.detail.resource,
                        sent: new Date(),
                    },
                ].slice(-NETWORKLOG_MAX_ENTRIES);
            });
        };

        const handleMatrixResponse = (event) => {
            setRequests(requests => {
                const index = requests.findIndex(r => r.id === event.detail.requestId);
                if (index === -1) {
                    return requests;
                }
                const newRequest = {
                    ...requests[index],
                    status: event.detail.status || null,
                };
                return [
                    ...requests.slice(0, index),
                    newRequest,
                    ...requests.slice(index + 1),
                ];
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
        <h2>Network Log</h2>
        ${isShortened && html`<p>Older entries have been removed.</p>`}
        <ol class="network-log_list">
            ${requests.map(request => (
                html`<${NetworkLogRequest} key=${request.id} request=${request}/>`
            ))}
        </ol>
    `;
}

function IdentitySelector({identities, onDelete, onEdit, onSelect}) {
    return html`
        ${identities.map(identity => {
            return html`<li key=${identity.name}>
                <button class="identity-page_name" type="button" onclick=${() => onSelect(identity)}>${identity.name}</button>
                <button type="button" title="Edit identity ${identity.name}" onclick=${() => onEdit(identity)}>✏️</button>
                <button type="button" title="Delete identity ${identity.name}" onclick=${() => onDelete(identity)}>❌</button>
            </li>`;
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
            <${FloatingLabelInput}
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

function About() {
    return html`
        <details>
            <summary><h2>About Matrix Wrench</h2></summary>
            <ul>
                <li>Code: <a href="https://gitlab.com/jaller94/matrix-wrench">Matrix Wrench on Gitlab.com</a></li>
                <li>Author: <a href="https://chrpaul.de/about">Christian Paul</a></li>
                <li>License: <a href="https://choosealicense.com/licenses/apache-2.0/">Apache 2.0</a></li>
            </ul>
        </details>
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
    // <${Header} />
    return html`
        <${IdentityPage} />
        <aside>
            <${NetworkLog} />
        </aside>
    `;
}

function AppHeader({backLabel = 'Back', children, onBack}) {
    return html`
        <div class="app-header">
            ${onBack && html`<button aria-label=${backLabel} class="app-header_back" title=${backLabel} type="button" onclick=${onBack}>${'<'}</button>`}
            <h1 class="app-header_label">${children}</h1>
        </div>
    `;
}

function IdentityPage() {
    const [identities, setIdentities] = useState(IDENTITIES);
    const [identity, setIdentity] = useState(null);
    const [editedIdentity, setEditedIdentity] = useState(null);
    const [editingError, setEditingError] = useState(null);

    const handleAddIdentity = useCallback(() => {
        setEditedIdentity({});
    }, []);

    const handleCancel = useCallback(() => {
        setEditingError(null);
        setEditedIdentity(null);
    }, []);

    const handleDelete = useCallback((identity) => {
        const confirmed = confirm(`Do you want to remove ${identity.name}?\nThis doesn't invalidate the access token.`);
        if (!confirmed) return;
        setIdentities((identities) => {
            const newIdentities = identities.filter(obj => obj.name !== identity.name);
            try {
                localStorage.setItem('identities', JSON.stringify(newIdentities));
            } catch (error) {
                console.warn('Failed to store identities in localStorage', error);
            }
            return newIdentities;
        });
    }, []);

    const handleSave = useCallback((identity) => {
        setEditingError(null);
        setIdentities(identities => {
            const newIdentities = [...identities];
            if (!identity.name) {
                setEditingError('Identity must have a name!');
                return identities;
            }
            const index = newIdentities.findIndex(ident => ident.name === editedIdentity.name);
            const conflicts = newIdentities.findIndex(ident => ident.name === identity.name) !== -1;
            // The name may only conflict if this is the name we're editing.
            if (conflicts && editedIdentity.name !== identity.name) {
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
            try {
                localStorage.setItem('identities', JSON.stringify(newIdentities));
            } catch (error) {
                console.warn('Failed to store identities in localStorage', error);
            }
            setEditedIdentity(null);
            setEditingError(null);
            return newIdentities;
        });
    }, [editedIdentity]);

    if (editedIdentity) {
        return html`<${IdentityEditor}
            error=${editingError}
            identity=${editedIdentity}
            onCancel=${handleCancel}
            onSave=${handleSave}
        />`;
    }
    if (!identity) {
        return html`
            <main>
                <${AppHeader}>Identities</>
                <ul class="identity-page_list">
                    <li>
                        <button
                            class="identity-page_name"
                            type="button"
                            onclick=${() => setIdentity({ serverAddress: 'https://matrix-client.matrix.org' })}
                        >
                            No auth on matrix.org
                        </button>
                    </li>
                    <${IdentitySelector} identities=${identities} onDelete=${handleDelete} onEdit=${setEditedIdentity} onSelect=${setIdentity}/>
                </ul>
                <button type="button" onclick=${handleAddIdentity}>Add identity</button>
            </main>
            <aside>
                <${About} />
            </aside>
        `;
    }
    return html`
        <${AppHeader}
            backLabel="Switch identity"
            onBack=${() => setIdentity(null)}
        >${identity.name ?? 'No authentication'}</>
        <div style="display: flex; flex-direction: column">
            ${identity.accessToken && html`
                <div class="card">
                    <${WhoAmI} identity=${identity}/>
                </div>
            `}
            ${identity.accessToken ? html`
                <${RoomSelector} identity=${identity}/>
            ` : html`
                <div class="card">
                    <h2>Alias to Room ID</h2>
                    <${AliasResolver} identity=${identity}/>
                </div>
            `}
        </div>
    `;
}

function RoomList({roomIds, onSelectRoom}) {
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
                    ${!onSelectRoom ? roomId : html`
                        <button
                            type="button"
                            data-room-id=${roomId}
                            onclick=${handleSelectRoom}
                        >${roomId}</button>
                    `}
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

function RoomSelector({identity}) {
    const [room, setRoom] = useState('');
    const [roomId, setRoomId] = useState(null);
    const [resolvedRoomId, setResolvedRoomId] = useState(null);
    const [recentRooms, setRecentRooms] = useState([]);
    const [busy, setBusy] = useState(false);

    const handleSelectRoom = useCallback(roomId => {
        setRoomId(roomId);
        setRecentRooms(recentRooms => ([
            roomId,
            ...recentRooms.filter(r => r !== roomId),
        ]).slice(0, 4));
    }, []);

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
        setRoomId(roomId);
        setResolvedRoomId(roomId);
        setRecentRooms(recentRooms => ([
            roomId,
            ...recentRooms.filter(r => r !== roomId),
        ]).slice(0, 4));
    }, [identity, room]);

    const handleResetRoomId = useCallback(() => {
        setRoomId(null);
    }, []);

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
                <${FloatingLabelInput}
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
                    <${MakeRoomAdminButton} identity=${identity} roomId=${roomId}/>
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
            <${FloatingLabelInput}
                label="Alias"
                pattern="#.+:.+"
                required
                title="A room alias, e.g. #matrix:matrix.org"
                value=${alias}
                oninput=${({ target }) => setAlias(target.value)}
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
            <${FloatingLabelInput}
                label="User"
                pattern="@.+:.+"
                required
                title="A user id, e.g. @foo:matrix.org"
                value=${userId}
                oninput=${useCallback(({target}) => setUserId(target.value), [])}
            />
            <${FloatingLabelInput}
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
            <${FloatingLabelInput}
                label="Type"
                list="state-types"
                value=${type}
                oninput=${useCallback(({target}) => setType(target.value), [])}
            />
            <${FloatingLabelInput}
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

function MediaList({ list }) {
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

function MediaExplorer({ identity, roomId }) {
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

render(html`<${App} />`, document.body);
