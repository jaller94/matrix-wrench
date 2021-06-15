import { html, render, useState } from './node_modules/htm/preact/standalone.module.js';
import { getMembers, getState, resolveAlias } from './matrix.js';

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
            ${!!localStorage && html`<p>Use Incognito mode, if you don't want access token to be stored in localStorage!</p>`}
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
        } catch {}
        setBusy(false);
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
            <h1>Select an identity</h1>
            <${IdentitySelector} identities=${identities} onDelete=${handleDelete} onEdit=${setEditedIdentity} onSelect=${setIdentity}/>
            <button type="button" onclick=${() => setEditedIdentity({})}>Add identity</button>
        `;
    }
    return html`
        <h1>Acting as ${identity.name}</h1>
        <button type="button" onclick=${() => setIdentity(null)}>Use different identity</button>
        <details open>
            <summary><h2>Alias -> Room ID</h2></summary>
            <${AliasResolver} identity=${identity}/>
        </details>
        <details open>
            <summary><h2>State</h2></summary>
            <${StateExplorer} identity=${identity}/>
        </details>
        <details open>
            <summary><h2>Member list</h2></summary>
            <${MembersExplorer} identity=${identity}/>
        </details>
    `;
}

function StateExplorer({identity}) {
    const [room, setRoom] = useState('');
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
            let roomId = room;
            if (room.startsWith('#')) {
                roomId = (await resolveAlias(identity, room)).room_id;
            }
            const data = await getState(identity, roomId, type || undefined, stateKey || undefined);
            setData(JSON.stringify(data, null, 2));
        } catch (error) {
            console.error(error);
        }
        setBusy(false);
    };

    return html`
        <form onsubmit=${handleGet}><fieldset disabled=${busy}>
            <label>Room alias or ID
                <input pattern="[#!].+:.+" required value=${room} oninput=${({target}) => setRoom(target.value)}/>
            </label>
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

function MemberList({members}) {
    if (members.length === 0) {
        return html`
            <p>There's no one in this list.</p>
        `;
    }
    return html`
        <ul>
            ${members.map(memberEvent => {
                return html`<li>${memberEvent.state_key}</li>`;
            })}
        </ul>
    `;
}

function MembersExplorer({identity}) {
    const [room, setRoom] = useState('');
    const [busy, setBusy] = useState(false);
    const [members, setMembers] = useState(null);

    const handleGet = async event => {
        event.preventDefault();
        event.stopPropagation();
        setBusy(true);
        try {
            let roomId = room;
            if (room.startsWith('#')) {
                roomId = (await resolveAlias(identity, room)).room_id;
            }
            const data = await getMembers(identity, roomId);
            setMembers([...data.chunk]);
        } catch {}
        setBusy(false);
    };

    return html`
        <form onsubmit=${handleGet}><fieldset disabled=${busy}>
            <p>Doesn't support pagination yet. Up to 1000 users seems safe.</p>
            <label>Room alias or ID
                <input pattern="[#!].+:.+" required value=${room} oninput=${({target}) => setRoom(target.value)}/>
            </label>
            <button type="submit">Get members</button>
        </fieldset></form>
        ${Array.isArray(members) && (html`
            <details open>
                <summary><h3>Joined</h3></summary>
                <${MemberList} members=${members.filter(e => e.content.membership === 'join')} />
            </details>
            <details open>
                <summary><h3>Invited</h3></summary>
                <${MemberList} members=${members.filter(e => e.content.membership === 'invite')} />
            </details>
            <details>
                <summary><h3>Left</h3></summary>
                <${MemberList} members=${members.filter(e => e.content.membership === 'leave')} />
            </details>
        `)}
    `;
}

render(html`<${App} />`, document.body);
