import { html, render, useCallback, useEffect, useMemo, useRef, useState } from './node_modules/htm/preact/standalone.module.js';
import {
    banUser,
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
    toCurlCommand,
    unbanUser,
} from './matrix.js';

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

function Header() {
    return html`
        <header>
            <nav>
                <button type="button">Network Log</button>
                <button type="button">Settings</button>
                <button type="button">About</button>
            </nav>
        </header>
    `;
}

function IdentityEditor({identity, onAbort, onSave}) {
    const [name, setName] = useState(identity.name ?? '');
    const [serverAddress, setServerAddress] = useState(identity.serverAddress ?? '');
    const [accessToken, setAccessToken] = useState(identity.accessToken ?? '');

    const handleSubmit = event => {
        event.preventDefault();
        event.stopPropagation();
        onSave({name, serverAddress, accessToken});
    };

    return html`
        <h1>Identity Editor</h1>
        <form onsubmit=${handleSubmit}>
            <div><label>Name (just an identifier within this app)
                <input required value=${name} oninput=${({target}) => setName(target.value)}/>
            </label></div>
            <div><label>Server address (e.g. "https://matrix-client.matrix.org")
                <input required type="url" value=${serverAddress} oninput=${({target}) => setServerAddress(target.value)}/>
            </label></div>
            <div><label>Access token
                <input required value=${accessToken} oninput=${({target}) => setAccessToken(target.value)}/>
            </label></div>
            <button type="button" onclick=${onAbort}>Abort</button>
            <button type="submit">Save</button>
            ${!!localStorage && html`<p>Use Incognito mode, if you don't want access token to be stored in localStorage!</p>`}
        </form>
    `;
}

function NetworkLog() {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        const handleMatrixRequest = (event) => {
            const newRequests = [
                ...requests,
                {
                    id: Math.random(),
                    resource: event.detail.resource,
                    init: event.detail.init,
                },
            ];
            console.log(event, this.requests, newRequests);
            setRequests(newRequests);
        };

        window.addEventListener('matrix-request', handleMatrixRequest);
        return () => window.removeEventListener('matrix-request', handleMatrixRequest);
    }, [requests]);

    return html`
        <h1>Network Log</h1>
        <ol>
            ${requests.map(request => (
                html`
                    <li key=${request.id}><code>${toCurlCommand(request.resource, request.init)}</code></li>
                `
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

    const handleSubmit = async event => {
        event.preventDefault();
        event.stopPropagation();
        setBusy(true);
        try {
            const data = await resolveAlias(identity, alias);
            setRoomId(data.room_id);
        } finally {
            setBusy(false);
        }
    };

    return html`
        <form onsubmit=${handleSubmit}><fieldset disabled=${busy}>
            <label>Alias
                <input
                    pattern="#.+:.+"
                    required
                    title="A room alias starting with a number sign, e.g. #matrixhq:matrix.org"
                    value=${alias}
                    oninput=${({target}) => setAlias(target.value)}
                />
            </label>
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
                <li>License: Undecided, but you may inspect the code.</li>
            </ul>
        </details>
    `;
}

function Changelog() {
    return html`
        <details>
            <summary><h2>Changelog</h2></summary>
            <h3>v0.1.2</h3>
            <ul>
                <li>A global error catcher informs you of program failures.</li>
                <li>Allows to forget rooms.</li>
                <li>Allows to kick, ban and unban users.</li>
                <li>The member list now also shows kocking and banned members, as well as a count for each membership type.</li>
                <li>Added a button for a quick authless connection to matrix.org.</li>
                <li>Added "About Matrix Wrench" section to the front-page.</li>
            </ul>
            <h3>v0.1.1</h3>
            <ul>
                <li>Allows to join and leave rooms.</li>
                <li>Allows to invite users.</li>
                <li>Added a wide-screen layout for the room management.</li>
            </ul>
            <h3>v0.1.0</h3>
            <p>Join rooms, leave rooms, invite to rooms. Separate page for room management.</p>
        </details>
    `;
}

function App() {
    // <${Header} />
    return html`
        <${IdentityPage} />
        <${NetworkLog} />
    `;
}

function IdentityPage() {
    const [identities, setIdentities] = useState(IDENTITIES);
    const [identity, setIdentity] = useState(null);
    const [editedIdentity, setEditedIdentity] = useState(null);

    const handleDelete = (identity) => {
        const confirmed = confirm(`Do you want to remove ${identity.name}?\nThis doesn't invalidate the access token.`);
        if (!confirmed) return;
        const newIdentities = identities.filter(obj => obj.name !== identity.name);
        setIdentities(newIdentities);
        try {
            localStorage.setItem('identities', JSON.stringify(newIdentities));
        } catch (error) {
            console.warn('Failed to store identities in localStorage', error);
        }
    }

    const handleSave = (identity) => {
        const newIdentities = [...identities];
        const index = newIdentities.findIndex(obj => obj.name === editedIdentity.name);
        if (index === -1) {
            // Add new identity
            newIdentities.push(identity);
            setIdentities(newIdentities);
        } else {
            // Replace existing identity
            newIdentities.splice(index, 1, identity)
            setIdentities(newIdentities);
        }
        setEditedIdentity(null);
        try {
            localStorage.setItem('identities', JSON.stringify(newIdentities));
        } catch (error) {
            console.warn('Failed to store identities in localStorage', error);
        }
    }

    if (editedIdentity) {
        return html`<${IdentityEditor}
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
                <${Changelog} />
                <${About} />
            </aside>
        `;
    }
    return html`
        <h1>${identity.name ? `Acting as ${identity.name}` : 'No authentication'}</h1>
        <button type="button" onclick=${() => setIdentity(null)}>Use different identity</button>
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

    const handleGet = async() => {
        setBusy(true);
        try {
            const {joined_rooms} = await getJoinedRooms(identity);
            setRoomIds(joined_rooms);
        } catch (error) {
            alert(error);
        } finally {
            setBusy(false);
        }
    }

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

    if (roomId) {
        return html`
            <button onclick=${() => setRoomId(null)}>Switch to a different room</button>
            <${RoomPage} identity=${identity} roomId=${roomId}/>
        `;
    }

    const handleSubmit = async event => {
        event.preventDefault();
        event.stopPropagation();
        let roomId = room;
        if (room.startsWith('#')) {
            setBusy(true);
            try {
                roomId = (await resolveAlias(identity, room)).room_id;
            } catch (error) {
                console.warn(error);
                roomRef.current.setCustomValidity(`Couldn't resolve alias! ${error}`);
                roomRef.current.reportValidity();
            } finally {
                setBusy(false);
            }
        }
        setRoomId(roomId);
        if (!recentRooms.includes(roomId)) {
            setRecentRooms([
                roomId,
                ...recentRooms,
            ].slice(0, 4));
        }
    };

    return html`
        <form onsubmit=${handleSubmit}><fieldset disabled=${busy}>
            <label>Room alias or ID
                <input
                    pattern="[!#].+:.+"
                    ref=${roomRef}
                    required
                    value=${room}
                    oninput=${({target}) => setRoom(target.value)}
                />
            </label>
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
    const handleForget = async event => {
        event.preventDefault();
        event.stopPropagation();
        try {
            await forgetRoom(identity, roomId);
        } catch (error) {
            console.error(error);
            alert(error);
        }
    };
    
    const handleJoin = async event => {
        event.preventDefault();
        event.stopPropagation();
        try {
            await joinRoom(identity, roomId);
        } catch (error) {
            console.error(error);
            alert(error);
        }
    };

    const handleLeave = async event => {
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
    };

    return html`
        <h3>${roomId}</h3>
        <div class="page">
            <div class="section">
                <details open>
                    <summary><h2>State</h2></summary>
                    <${StateExplorer} identity=${identity} roomId=${roomId}/>
                </details>
            </div>
            <div class="section">
                <h2>Membership</h2>
                <button type="button" onclick=${handleJoin}>Join</button>
                <button type="button" onclick=${handleLeave}>Leave</button>
                <button type="button" onclick=${handleForget}>Forget</button>
                <${UserActions} identity=${identity} roomId=${roomId}/>
            </div>
            <div class="section">
                <details open>
                    <summary><h2>Members</h2></summary>
                    <${MembersExplorer} identity=${identity} roomId=${roomId}/>
                </details>
            </div>
        </div>
    `;
}

function UserActions({ identity, roomId }) {
    const [userId, setUserId] = useState('');
    const [reason, setReason] = useState('');
    const [busy, setBusy] = useState(false);

    const handleSubmit = async event => {
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
    }

    return html`
        <form onsubmit=${handleSubmit}><fieldset disabled=${busy}>
            <label>User:
                <input
                    pattern="@.+:.+"
                    required
                    title="A user id, e.g. @foo:matrix.org"
                    value=${userId}
                    oninput=${({target}) => setUserId(target.value)}
                />
            </label>
            <label>Reason for kick or ban:
                <input
                    title="A reason why this user gets kicked or banned."
                    value=${reason}
                    oninput=${({target}) => setReason(target.value)}
                />
            </label>
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

    const handleGet = async event => {
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
    };

    const handlePut = async event => {
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
    };

    return html`
        <form onsubmit=${handleGet}><fieldset disabled=${busy}>
            <label>Type
                <input list="state-types" value=${type} oninput=${({target}) => setType(target.value)}/>
            </label>
            <label>State Key
                <input value=${stateKey} oninput=${({target}) => setStateKey(target.value)}/>
            </label>
            <button type="submit">Query</button>
        </fieldset></form>
        <form onsubmit=${handlePut}><fieldset disabled=${busy}>
            <label>State
                <textarea oninput=${({target}) => setData(target.value)}>${data}</textarea>
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

    const handleGet = async event => {
        event.preventDefault();
        event.stopPropagation();
        setBusy(true);
        try {
            const data = await getMembers(identity, roomId);
            setMembers([...data.chunk]);
        } finally {
            setBusy(false);
        }
    };

    const groups = useMemo(
        () => {
            if (!Array.isArray(members)) {
                return null;
            }
            const obj = {
                join: [],
                invite: [],
                knock: [],
                leave: [],
                ban: [],
            };
            for (const e of members) {
                if (obj[e.content.membership] === undefined) {
                    obj[e.content.membership] = [];
                }
                obj[e.content.membership].push(e);
            }
            return obj;
        },
        [members],
    );

    return html`
        <form onsubmit=${handleGet}><fieldset disabled=${busy}>
            <p>Doesn't support pagination yet. Up to 5000 users seems safe.</p>
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
