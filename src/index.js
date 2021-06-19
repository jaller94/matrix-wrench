import { html, render, useState } from 'https://unpkg.com/htm/preact/standalone.module.js';
import { getMembers, getState, resolveAlias } from './matrix.js';

const IDENTITIES = [];

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
                <input required value=${serverAddress} oninput=${({target}) => setServerAddress(target.value)}/>
            </label></div>
            <div><label>Access token
                <input required value=${accessToken} oninput=${({target}) => setAccessToken(target.value)}/>
            </label></div>
            <button type="button" onclick=${onAbort}>Abort</button>
            <button type="submit">Save</button>
        </form>
    `;
}

function IdentitySelector({identities, onDelete, onEdit, onSelect}) {
    if (identities.length === 0) {
        return html`<p>No identities entered so far.</p>`;
    }
    return html`
        <ul>
            ${identities.map(identity => {
                return html`<li>
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


function App() {
    const [identities, setIdentities] = useState(IDENTITIES);
    const [identity, setIdentity] = useState(null);
    const [editedIdentity, setEditedIdentity] = useState(null);

    const handleDelete = (identity) => {
        const confirmed = confirm(`Do you want to remove ${identity.name}?\nThis doesn't invalidate the access token.`);
        if (!confirmed) return;
        const newIdentities = [...identities];
        const index = newIdentities.findIndex(obj => obj.name === identity.name);
        setIdentities(identities.splice(index, 1));
    }

    const handleSave = (identity) => {
        console.log('Save', identity);
        const newIdentities = [...identities];
        const index = newIdentities.findIndex(obj => obj.name === editedIdentity.name);
        if (index === -1) {
            // Add new identity
            newIdentities.push(identity);
            setIdentities(newIdentities);
        } else {
            // Replace existing identity
            newIdentities.splice(index, 1, identity)
            console.log('replace', newIdentities);
            setIdentities(newIdentities);
        }
        setEditedIdentity(null);
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
            <h1>Select an identity</h1>
            <${IdentitySelector} identities=${identities} onDelete=${handleDelete} onEdit=${setEditedIdentity} onSelect=${setIdentity}/>
            <button type="button" onclick=${() => setEditedIdentity({})}>Add identity</button>
        `;
    }
    return html`
        <h1>Acting as ${identity.name}</h1>
        <button type="button" onclick=${() => setIdentity(null)}>Use different identity</button>
        <h2>Alias -> Room ID</h2>
        <${AliasResolver} identity=${identity}/>
        <h2>Room management</h2>
        <${RoomSelector} identity=${identity}/>
    `;
}

function RoomSelector({identity}) {
    const [room, setRoom] = useState('');
    const [roomId, setRoomId] = useState(null);
    const [recentRooms, setRecentRooms] = useState([]);
    const [busy, setBusy] = useState(false);

    if (roomId) {
        return html`
            <button onclick=${() => setRoomId(null)}>Unselect room</button>
            <${RoomPage} roomId=${roomId}/>
        `;
    }

    const handleGet = async event => {
        event.preventDefault();
        event.stopPropagation();
        setRoomId(room);
    };

    return html`
        <form onsubmit=${handleGet}><fieldset disabled=${busy}>
            <label>Room ID
                <input pattern="!.+:.+" required value=${room} oninput=${({target}) => setRoom(target.value)}/>
            </label>
            <button type="submit">Go</button>
        </fieldset></form>
    `;
}

function RoomPage({identity, roomId}) {
    return html`
        <h2>State</h2>
        <${StateExplorer} identity=${identity} roomId=${roomId}/>
        <h2>Member list</h2>
        <${MemberList} identity=${identity} roomId=${roomId}/>
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
        <label>State
            <textarea disabled=${busy}>${data}</textarea>
        </label>
    `;
}

function MemberList({identity, roomId}) {
    const [busy, setBusy] = useState(false);
    const [members, setMembers] = useState([]);

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

    return html`
        <form onsubmit=${handleGet}><fieldset disabled=${busy}>
            <button type="submit">Get members</button>
        </fieldset></form>
        <ul>
            ${members.map(memberEvent => {
                return html`<li>
                    ${memberEvent.state_key} (${memberEvent.content.membership})
                    <button type="button" onclick=${() => onDelete(identity)}>Kick</button>
                </li>`;
            })}
        </ul>
    `;
}

render(html`<${App} />`, document.body);
