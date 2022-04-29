const dryRun = false;

export class MatrixError extends Error {
    constructor(content) {
        super(content.error);
        this.errcode = content.errcode;
        this.content = content;
    }
}

let nextRequestId = 1;
/* START Helper functions */
export async function doRequest(resource, init) {
    const requestId = nextRequestId;
    nextRequestId += 1;
    window.dispatchEvent(new CustomEvent('matrix-request', {
        detail: {
            init,
            resource,
            requestId,
        },
    }));
    if (dryRun) {
        window.dispatchEvent(new CustomEvent('matrix-response', {
            detail: { requestId, },
        }));
        return {};
    }
    let response;
    let data;
    let isNotJson = false;
    try {
        response = await fetch(resource, init);
    } catch (error) {
        window.dispatchEvent(new CustomEvent('matrix-response', {
            detail: {
                requestId,
            },
        }));
        throw error;
    }
    try {
        data = await response.json();
    } catch (error) {
        isNotJson = true;
    }
    window.dispatchEvent(new CustomEvent('matrix-response', {
        detail: {
            isNotJson,
            requestId,
            status: response.status,
        },
    }));
    if (isNotJson) {
        throw new Error(`Didn't receive valid JSON: ${resource}`);
    }
    if (!response.ok) {
        throw new MatrixError(data);
    }
    return data;
}

/**
 * Constructs a curl command. Use it like fetch().
 * @param {string} resource
 * @param {{method?: string, body?: string, headers: Record<string, string>}} init
 * @returns {string}
 */
export function toCurlCommand(resource, init) {
    let cmd = 'curl ';
    if (init.method !== undefined && init.method !== 'GET') {
        cmd += `-X ${init.method} `;
    }
    if (init.body) {
        cmd += `--data '${init.body.replace(/'/g, '\\\'')}' `;
    }
    for (const [key, value] of Object.entries(init.headers ?? {})) {
        cmd += `-H '${key}: ${value.replace(/'/g, '\\\'')}' `;
    }
    cmd += `'${resource.replace(/'/g, '\\\'')}'`;
    return cmd;
}

/**
 * Summarizes a network request. Use it like fetch().
 * @param {string} resource
 * @param {{method?: string, body?: string, headers: Record<string, string>}} init
 * @returns {string}
 */
export function summarizeFetch(resource, init) {
    const match = resource.match(/\/_matrix\/client\/.+?\/(?<command>.*)$/);
    let url = resource;
    if (match && match.groups.command) {
        url = match.groups.command;
    }
    return `${init.method} ${url}`;
}

/* END Helper functions */

/**
 * Ban a user from a room.
 * @param {Object} identity
 * @param {string} roomId
 * @param {string} userId
 * @param {string=} reason
 * @returns {Promise<Object>}
 */
export async function banUser(identity, roomId, userId, reason) {
    return doRequest(`${identity.serverAddress}/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/ban`, {
        method: 'POST',
        headers: {
            ...(identity.accessToken && {
                Authorization: `Bearer ${identity.accessToken}`,
            }),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: userId,
            reason,
        }),
    });
}

/**
 * Create a new room alias.
 * @param {Object} identity
 * @param {string} roomAlias
 * @param {string} roomId
 * @returns {Promise<Object>}
 */
export async function createRoomAlias(identity, roomAlias, roomId) {
    return doRequest(`${identity.serverAddress}/_matrix/client/v3/directory/room/${encodeURIComponent(roomAlias)}`, {
        method: 'PUT',
        headers: {
            ...(identity.accessToken && {
                Authorization: `Bearer ${identity.accessToken}`,
            }),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            room_id: roomId,
        }),
    });
}

/**
 * Delete a room alias.
 * @param {Object} identity
 * @param {string} roomAlias
 * @returns {Promise<Object>}
 */
export async function deleteRoomAlias(identity, roomAlias) {
    return doRequest(`${identity.serverAddress}/_matrix/client/v3/directory/room/${encodeURIComponent(roomAlias)}`, {
        method: 'DELETE',
        headers: {
            ...(identity.accessToken && {
                Authorization: `Bearer ${identity.accessToken}`,
            }),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            roomAlias,
        }),
    });
}

/**
 * Gets a list of joined members of a room.
 * @param {Object} identity
 * @param {string} roomId
 * @returns {Promise<{joined: Record<string, Object>}>}
 */
export async function getJoinedMembers(identity, roomId) {
    return doRequest(`${identity.serverAddress}/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/joined_members`, {
        method: 'GET',
        headers: {
            ...(identity.accessToken && {
                Authorization: `Bearer ${identity.accessToken}`,
            }),
        },
    });
}

/**
 * Returns a list of the user's current rooms.
 * @param {Object} identity
 * @returns {Promise<{joined_rooms: string[]}>}
 */
export async function getJoinedRooms(identity) {
    return doRequest(`${identity.serverAddress}/_matrix/client/v3/joined_rooms`, {
        method: 'GET',
        headers: {
            ...(identity.accessToken && {
                Authorization: `Bearer ${identity.accessToken}`,
            }),
        },
    });
}

/**
 * Gets a list of known media in a room. However, it only shows media from unencrypted events or rooms.
 * Synapse Admin API
 * @param {Object} identity
 * @param {string} roomId
 * @returns {Promise<Object>}
 */
export async function getMediaByRoom(identity, roomId) {
    return doRequest(`${identity.serverAddress}/_synapse/admin/v1/room/${encodeURIComponent(roomId)}/media`, {
        method: 'GET',
        headers: {
            ...(identity.accessToken && {
                Authorization: `Bearer ${identity.accessToken}`,
            }),
        },
    });
}

/**
 * Get the members of a room.
 * @param {Object} identity
 * @param {string} roomId
 * @returns {Promise<Object>}
 */
export async function getMembers(identity, roomId) {
    return doRequest(`${identity.serverAddress}/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/members`, {
        method: 'GET',
        headers: {
            ...(identity.accessToken && {
                Authorization: `Bearer ${identity.accessToken}`,
            }),
        },
    });
}

/**
 * Get the state of a room.
 * @param {Object} identity
 * @param {string} roomId
 * @param {string=} type
 * @param {string=} stateKey
 * @returns {Promise<Object>}
 */
export async function getState(identity, roomId, type, stateKey) {
    let url = `${identity.serverAddress}/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/state`;
    if (type) {
        url += `/${type}`;
    }
    if (stateKey) {
        url += `/${stateKey}`;
    }
    return doRequest(url, {
        method: 'GET',
        headers: {
            ...(identity.accessToken && {
                Authorization: `Bearer ${identity.accessToken}`,
            }),
        },
    });
}

/**
 * Invite a user to a room.
 * @param {Object} identity
 * @param {string} roomId
 * @returns {Promise<Object>}
 */
export async function inviteUser(identity, roomId, userId) {
    return doRequest(`${identity.serverAddress}/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/invite`, {
        method: 'POST',
        headers: {
            ...(identity.accessToken && {
                Authorization: `Bearer ${identity.accessToken}`,
            }),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: userId,
        }),
    });
}

/**
 * Kick a user from a room.
 * @param {Object} identity
 * @param {string} roomId
 * @param {string} userId
 * @param {string=} reason
 * @returns {Promise<Object>}
 */
export async function kickUser(identity, roomId, userId, reason) {
    return doRequest(`${identity.serverAddress}/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/kick`, {
        method: 'POST',
        headers: {
            ...(identity.accessToken && {
                Authorization: `Bearer ${identity.accessToken}`,
            }),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: userId,
            reason,
        }),
    });
}

/**
 * Resolves a room alias to a room ID.
 * @param {Object} identity
 * @param {string} roomAlias
 * @returns {{room_id: string, servers: string[]}}
 */
export async function resolveAlias(identity, roomAlias) {
    return doRequest(`${identity.serverAddress}/_matrix/client/v3/directory/room/${encodeURIComponent(roomAlias)}`, {
        method: 'GET',
        headers: {
            ...(identity.accessToken && {
                Authorization: `Bearer ${identity.accessToken}`,
            }),
        },
    });
}

/**
 * Send an event to a room.
 * @param {Object} identity
 * @param {string} roomId
 * @param {string} type
 * @param {Object} content
 * @param {string=} transactionId
 * @returns {Promise<Object>}
 */
export async function sendEvent(identity, roomId, type, content, transactionId) {
    let url = `${identity.serverAddress}/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/send/${encodeURIComponent(type)}`;
    if (transactionId) {
        url += `/${transactionId}`;
    }
    return doRequest(url, {
        method: 'PUT',
        headers: {
            ...(identity.accessToken && {
                Authorization: `Bearer ${identity.accessToken}`,
            }),
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
 * @param {string=} stateKey
 * @param {Object} content
 * @returns {Promise<Object>}
 */
export async function setState(identity, roomId, type, stateKey, content) {
    let url = `${identity.serverAddress}/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/state`;
    if (type) {
        url += `/${type}`;
    }
    if (stateKey) {
        url += `/${stateKey}`;
    }
    return doRequest(url, {
        method: 'PUT',
        headers: {
            ...(identity.accessToken && {
                Authorization: `Bearer ${identity.accessToken}`,
            }),
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
    return doRequest(`${identity.serverAddress}/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/unban`, {
        method: 'POST',
        headers: {
            ...(identity.accessToken && {
                Authorization: `Bearer ${identity.accessToken}`,
            }),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: userId,
        }),
    });
}

/**
 * Gets information about the owner of a given access token.
 * @param {Object} identity
 * @param {string} roomId
 * @param {string} userId
 * @returns {Promise<Object>}
 */
export async function whoAmI(identity) {
    return doRequest(`${identity.serverAddress}/_matrix/client/v3/account/whoami`, {
        method: 'GET',
        headers: {
            ...(identity.accessToken && {
                Authorization: `Bearer ${identity.accessToken}`,
            }),
        },
    });
}

/**
 * Get a list of client features and versions supported by the server.
 * @returns {Promise<Object>}
 */
export async function clientVersions(identity) {
    return doRequest(`${identity.serverAddress}/_matrix/client/versions`, {
        method: 'GET',
    });
}
