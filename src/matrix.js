const dryRun = false;

export class MatrixError extends Error {
    constructor(content) {
        super(content.error);
        this.errcode = content.errcode;
        this.content = content;
    }
}

/* START Helper functions */

export async function doRequest(resource, init) {
    if (dryRun) {
        console.log(resource, init);
        console.log(toCurlCommand(resource, init));
        return {};
    }
    const response = await fetch(resource, init);
    if (!response.ok) {
        let error;
        try {
            error = new MatrixError(await response.json());
        } catch {
            throw Error(`Request failed: ${response}`);
        }
        throw error;
    }
    return await response.json();
}

/**
 * Constructs a curl command. Use it like fetch().
 * @param {string} resource
 * @param {{method?: string, body?: string, headers: Record<string, string>}} init
 * @returns {string}
 */
export function toCurlCommand(resource, init) {
    let cmd = 'curl ';
    if (init.method !== 'GET') {
        cmd += `-X ${init.method} `;
    }
    if (init.body) {
        cmd += `--data '${init.method.replace(/'/g, '\\\'')}' `;
    }
    for (const [key, value] of Object.entries(init.headers ?? {})) {
        cmd += `-H '${key}: ${value.replace(/'/g, '\\\'')}'`;
    }
    cmd += `'${resource.replace(/'/g, '\\\'')}}`;
    return cmd;
}

/* END Helper functions */

/**
 * Ban a user from a room.
 * @param {Object} identity
 * @param {string} roomId
 * @param {string} userId
 * @param {string?} reason
 * @returns {Promise<Object>}
 */
export async function banUser(identity, roomId, userId, reason) {
    return doRequest(`${identity.serverAddress}/_matrix/client/r0/rooms/${roomId}/ban`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${identity.accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: userId,
            reason,
        }),
    });
}

/**
 * Forget about a room.
 * @param {Object} identity
 * @param {string} roomId
 * @returns {Promise<Object>}
 */
export async function forgetRoom(identity, roomId) {
    const url = `${identity.serverAddress}/_matrix/client/r0/rooms/${roomId}/forget`;
    return doRequest(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${identity.accessToken}`,
        }
    });
}

/**
 * Gets a list of joined members of a room.
 * @param {Object} identity
 * @param {string} roomId
 * @returns {Promise<{joined: Record<string, Object>}>}
 */
export async function getJoinedMembers(identity, roomId) {
    return doRequest(`${identity.serverAddress}/_matrix/client/r0/rooms/${roomId}/joined_members`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${identity.accessToken}`,
        }
    });
}

/**
 * Returns a list of the user's current rooms.
 * @param {Object} identity
 * @returns {Promise<{joined_rooms: string[]}>}
 */
export async function getJoinedRooms(identity) {
    return doRequest(`${identity.serverAddress}/_matrix/client/r0/joined_rooms`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${identity.accessToken}`,
        }
    });
}

/**
 * Get the members of a room.
 * @param {Object} identity
 * @param {string} roomId
 * @returns {Promise<Object>}
 */
export async function getMembers(identity, roomId) {
    const url = `${identity.serverAddress}/_matrix/client/r0/rooms/${roomId}/members`;
    return doRequest(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${identity.accessToken}`,
        }
    });
}

/**
 * Get the state of a room.
 * @param {Object} identity
 * @param {string} roomId
 * @param {string?} type
 * @param {string?} stateKey
 * @returns {Promise<Object>}
 */
export async function getState(identity, roomId, type, stateKey) {
    let url = `${identity.serverAddress}/_matrix/client/r0/rooms/${roomId}/state`;
    if (type) {
        url += `/${type}`;
    }
    if (stateKey) {
        url += `/${stateKey}`;
    }
    return doRequest(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${identity.accessToken}`,
        }
    });
}

/**
 * Invite a user to a room.
 * @param {Object} identity
 * @param {string} roomId
 * @returns {Promise<Object>}
 */
export async function inviteUser(identity, roomId, userId) {
    const url = `${identity.serverAddress}/_matrix/client/r0/rooms/${roomId}/invite`;
    return doRequest(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${identity.accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: userId,
        }),
    });
}

/**
 * Join a room.
 * @param {Object} identity
 * @param {string} roomId
 * @returns {Promise<Object>}
 */
export async function joinRoom(identity, roomId) {
    return doRequest(`${identity.serverAddress}/_matrix/client/r0/rooms/${roomId}/join`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${identity.accessToken}`,
        }
    });
}

/**
 * Kick a user from a room.
 * @param {Object} identity
 * @param {string} roomId
 * @param {string} userId
 * @param {string?} reason
 * @returns {Promise<Object>}
 */
export async function kickUser(identity, roomId, userId, reason) {
    return doRequest(`${identity.serverAddress}/_matrix/client/r0/rooms/${roomId}/kick`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${identity.accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: userId,
            reason,
        }),
    });
}

/**
 * Leave a room.
 * @param {Object} identity
 * @param {string} roomId
 * @returns {Promise<Object>}
 */
export async function leaveRoom(identity, roomId) {
    return doRequest(`${identity.serverAddress}/_matrix/client/r0/rooms/${roomId}/leave`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${identity.accessToken}`,
        }
    });
}

/**
 * Resolves a room alias to a room ID.
 * @param {Object} identity
 * @param {string} roomAlias
 * @returns {{room_id: string, servers: string[]}}
 */
export async function resolveAlias(identity, roomAlias) {
    return doRequest(`${identity.serverAddress}/_matrix/client/r0/directory/room/${encodeURIComponent(roomAlias)}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${identity.accessToken}`,
        }
    });
}

/**
 * Send an event to a room.
 * @param {Object} identity
 * @param {string} roomId
 * @param {string} type
 * @param {Object} content
 * @param {string?} transactionId
 * @returns {Promise<Object>}
 */
export async function sendEvent(identity, roomId, type, content, transactionId) {
    let url = `${identity.serverAddress}/_matrix/client/r0/rooms/${roomId}/send/${type}`;
    if (transactionId) {
        url += `/${transactionId}`;
    }
    return doRequest(url, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${identity.accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
    });
}

/**
 * Set the state of a room.
 * @param {Object} identity
 * @param {string} roomId
 * @param {string} type
 * @param {string?} stateKey
 * @param {Object} content
 * @returns {Promise<Object>}
 */
export async function setState(identity, roomId, type, stateKey, content) {
    let url = `${identity.serverAddress}/_matrix/client/r0/rooms/${roomId}/state`;
    if (type) {
        url += `/${type}`;
    }
    if (stateKey) {
        url += `/${stateKey}`;
    }
    return doRequest(url, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${identity.accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
    });
}

/**
 * Unban a user to a room.
 * @param {Object} identity
 * @param {string} roomId
 * @param {string} userId
 * @returns {Promise<Object>}
 */
export async function unbanUser(identity, roomId, userId) {
    return doRequest(`${identity.serverAddress}/_matrix/client/r0/rooms/${roomId}/unban`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${identity.accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: userId,
        }),
    });
}
