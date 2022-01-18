import { html, render, useCallback, useEffect, useMemo, useRef, useState } from './node_modules/htm/preact/standalone.module.js';
import {
    classnames,
    uniqueId,
} from './helper.js';
import {
    MatrixError,
    banUser,
    createRoomAlias,
    deleteRoomAlias,
    forgetRoom,
    getJoinedRooms,
    getMembers,
    getState,
    inviteUser,
    joinRoom,
    kickUser,
    leaveRoom,
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
    const [id] = useState(uniqueId());
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

function IdentityEditor({error, identity, onAbort, onSave}) {
    const [name, setName] = useState(identity.name ?? '');
    const [serverAddress, setServerAddress] = useState(identity.serverAddress ?? '');
    const [accessToken, setAccessToken] = useState(identity.accessToken ?? '');

    const handleSubmit = useCallback(event => {
        event.preventDefault();
        event.stopPropagation();
        onSave({name, serverAddress, accessToken});
    }, [accessToken, name, onSave, serverAddress]);

    return html`
        <h1>Identity Editor</h1>
        <form class="identity-editor-form" onsubmit=${handleSubmit}>
            <div>
                <${FloatingLabelInput}
                    label="Name (just an identifier within this app)"
                    required
                    value=${name}
                    oninput=${useCallback(({ target }) => setName(target.value), [])}
                />
            </div>
            <div>
                <${FloatingLabelInput}
                    label="Server address (e.g. "https://matrix-client.matrix.org")"
                    type="url"
                    required
                    value=${serverAddress}
                    oninput=${useCallback(({ target }) => setServerAddress(target.value), [])}
                />
            </div>
            <div>
                <${FloatingLabelInput}
                    label="Access token"
                    value=${accessToken}
                    oninput=${useCallback(({ target }) => setAccessToken(target.value), [])}
                />
            </div>
            ${!!error && html`<p>${error}</p>`}
            <button type="button" onclick=${onAbort}>Abort</button>
            <button type="submit">Save</button>
            ${!!localStorage && html`<p>Use Incognito mode, if you don't want access token to be stored in localStorage!</p>`}
        </form>
    `;
}

function ResponseStatus({status}) {
    return html`
        <span
            class=${classnames(
                'network-log-request_status',
                {
                    'network-log-request_status--success': status === 200,
                    'network-log-request_status--client-error': status >= 400 && status < 500,
                    'network-log-request_status--server-error': status >= 500,
                    'network-log-request_status--network': status === null,
                    'network-log-request_status--pending': status === undefined,
                },
            )}
        >${status === null ? 'NET' : status ?? '...'}</span>
    `;
}

function NetworkLogRequest({request}) {
    return html`
        <li><details>
            <summary>
                ${summarizeFetch(request.resource, request.init)}
                <${ResponseStatus} status=${request.status}/>
                ${request.sent.toLocaleTimeString()}
            </summary>
            <div>
                Sent: ${request.sent.toLocaleString()}
            </div>
            <div>
                Curl command:<br/>
                <code>${toCurlCommand(request.resource, request.init)}</code>
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
        <h1>Network Log</h1>
        ${isShortened && html`<p>Older entries have been removed.</p>`}
        <ol>
            ${requests.map(request => (
                html`<${NetworkLogRequest} key=${request.id} request=${request}/>`
            ))}
        </ol>
    `;
}

function IdentitySelector({identities, onDelete, onEdit, onSelect}) {
    if (identities.length === 0) {
        return html`<p>No identities entered so far.</p>`;
    }
    return html`
        <ul>
            ${identities.map(identity => {
                return html`<li key=${identity.name}>
                    <button type="button" onclick=${() => onSelect(identity)}>${identity.name}</button>
                    <button type="button" title="Edit" onclick=${() => onEdit(identity)}>✏️</button>
                    <button type="button" title="Delete" onclick=${() => onDelete(identity)}>❌</button>
                </li>`;
            })}
        </ul>
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
        <label>Room id (read only)
            <input value=${roomId} readonly/>
        </label>
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
        <${NetworkLog} />
    `;
}

function AppHeader({backLabel = 'Back', children, onBack}) {
    return html`
        <div class="app-header">
            ${onBack && html`<button class="app-header_back" type="button" onclick=${onBack}>${backLabel}</button>`}
            <h1 class="app-header_label">${children}</h1>
        </div>
    `;
}

function IdentityPage() {
    const [identities, setIdentities] = useState(IDENTITIES);
    const [identity, setIdentity] = useState(null);
    const [editedIdentity, setEditedIdentity] = useState(null);
    const [editingError, setEditingError] = useState(null);

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
        setIdentities(identities => {
            const newIdentities = [...identities];
            if (!identity.name) {
                setEditingError('Identity must have a name!');
                return identities;
            }
            if (!editedIdentity.name && -1 !== newIdentities.findIndex(ident => ident.name === identity.name)) {
                setEditingError('Identity name taken!');
                return identities;
            }
            const index = newIdentities.findIndex(ident => ident.name === editedIdentity.name);
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
            onAbort=${() => setEditedIdentity(null)}
            onSave=${handleSave}
        />`;
    }
    if (!identity) {
        return html`
            <main>
                <h1>Select an identity</h1>
                <button
                    type="button"
                    onclick=${() => setIdentity({ serverAddress: 'https://matrix-client.matrix.org' })}
                >
                    No auth on matrix.org
                </button>
                <${IdentitySelector} identities=${identities} onDelete=${handleDelete} onEdit=${setEditedIdentity} onSelect=${setIdentity}/>
                <button type="button" onclick=${() => setEditedIdentity({})}>Add identity</button>
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
        ${identity.accessToken && html`
            <${WhoAmI} identity=${identity}/>
        `}
        <h2>Alias -> Room ID</h2>
        <${AliasResolver} identity=${identity}/>
        ${identity.accessToken && html`
            <h2>Room management</h2>
            <${RoomSelector} identity=${identity}/>
        `}
    `;
}

function RoomList({roomIds}) {
    if (roomIds.length === 0) {
        return html`
            <p>There's no room in this list.</p>
        `;
    }
    return html`
        <ul>
            ${roomIds.map(roomId => {
                return html`<li key=${roomId}>${roomId}</li>`;
            })}
        </ul>
    `;
}

function JoinedRoomList({identity}) {
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
        <button disabled=${busy} type="button" onclick=${handleGet}>Query</button>
        ${roomIds && html`<${RoomList} roomIds=${roomIds}/>`}
    `;
}

function RoomSelector({identity}) {
    const [room, setRoom] = useState('');
    const [roomId, setRoomId] = useState(null);
    const [recentRooms, setRecentRooms] = useState([]);
    const [busy, setBusy] = useState(false);
    const roomRef = useRef();

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
                const input = roomRef.current.base.querySelector('input');
                const message = `Couldn't resolve alias! ${error}`;
                if (input) {
                    input.setCustomValidity(`Couldn't resolve alias! ${error}`);
                    input.reportValidity();
                } else {
                    alert(message);
                }
                return;
            } finally {
                setBusy(false);
            }
        }
        setRoomId(roomId);
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
            <button onclick=${handleResetRoomId}>Switch to a different room</button>
            <${RoomPage} identity=${identity} roomId=${roomId}/>
        `;
    }

    return html`
        <form onsubmit=${handleSubmit}><fieldset disabled=${busy}>
            <${FloatingLabelInput}
                label="Room alias or ID"
                pattern="[!#].+:.+"
                ref=${roomRef}
                required
                value=${room}
                oninput=${({target}) => setRoom(target.value)}
            />
            <button type="submit">Go</button>
        </fieldset></form>
        <aside>
            ${recentRooms.length > 0 && html`
                <h3>Recent rooms</h3>
                <${RoomList} roomIds=${recentRooms}/>
            `}
            <${JoinedRoomList} identity=${identity}/>
        </aside>
    `;
}

function RoomPage({identity, roomId}) {
    const handleForget = useCallback(async event => {
        event.preventDefault();
        event.stopPropagation();
        try {
            await forgetRoom(identity, roomId);
        } catch (error) {
            console.error(error);
            alert(error);
        }
    }, [identity, roomId]);
    
    const handleJoin = useCallback(async event => {
        event.preventDefault();
        event.stopPropagation();
        try {
            await joinRoom(identity, roomId);
        } catch (error) {
            console.error(error);
            alert(error);
        }
    }, [identity, roomId]);

    const handleLeave = useCallback(async event => {
        event.preventDefault();
        event.stopPropagation();
        const answer = confirm(`Leave room ${roomId}?`);
        if (!answer) return;
        try {
            await leaveRoom(identity, roomId);
        } catch (error) {
            console.error(error);
            alert(error);
        }
    }, [identity, roomId]);

    return html`
        <h3>${roomId}</h3>
        <div class="page">
            <div class="section">
                <details open>
                    <summary><h2>Membership</h2></summary>
                    <button type="button" onclick=${handleJoin}>Join</button>
                    <button type="button" onclick=${handleLeave}>Leave</button>
                    <button type="button" onclick=${handleForget}>Forget</button>
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
            console.error(error);
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
            console.error(error);
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

render(html`<${App} />`, document.body);

// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', function () {
//         navigator.serviceWorker.register('/sw.js').then(function (registration) {
//             // Registration was successful
//             console.log('ServiceWorker registration successful with scope: ', registration.scope);
//         }, function (err) {
//             // registration failed :(
//             console.log('ServiceWorker registration failed: ', err);
//         });
//     });
// }
