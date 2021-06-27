const dryRun = false;

export async function doRequest(resource, init) {
    if (dryRun) {
        console.log(resource, init);
        return {};
    }
    const response = await fetch(url, {
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
    if (!response.ok) {
        console.warn(response);
        throw Error(`Request failed: ${(await response.json()).error}`);
    }
    return await response.json();
}

/**
 * Ban a user from a room.
 * @param {object} identity
 * @param {string} roomId
 * @param {string} userId
 * @param {string?} reason
 * @returns {Promise<object>}
 */
export async function banUser(identity, roomId, userId, reason) {
    const url = `${identity.serverAddress}/_matrix/client/r0/rooms/${roomId}/ban`;
    return doRequest(url, {
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
 * @param {object} identity
 * @param {string} roomId
 * @returns {Promise<object>}
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
 * @param {object} identity
 * @param {string} roomId
 * @returns {Promise<{joined: Record<string, object>}>}
 */
export async function getJoinedMembers(identity, roomId) {
    const url = `${identity.serverAddress}/_matrix/client/r0/rooms/${roomId}/joined_members`;
    return doRequest(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${identity.accessToken}`,
        }
    });
}

/**
 * Returns a list of the user's current rooms.
 * @param {object} identity
 * @returns {Promise<{joined_rooms: string[]}>}
 */
export async function getJoinedRooms(identity) {
    const url = `${identity.serverAddress}/_matrix/client/r0/joined_rooms`;
    return doRequest(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${identity.accessToken}`,
        }
    });
}

/**
 * Get the members of a room.
 * @param {object} identity
 * @param {string} roomId
 * @returns {Promise<object>}
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
 * @param {object} identity
 * @param {string} roomId
 * @param {string?} type
 * @param {string?} stateKey
 * @returns {Promise<object>}
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
 * @param {object} identity
 * @param {string} roomId
 * @returns {Promise<object>}
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
 * @param {object} identity
 * @param {string} roomId
 * @returns {Promise<object>}
 */
export async function joinRoom(identity, roomId) {
    const url = `${identity.serverAddress}/_matrix/client/r0/rooms/${roomId}/join`;
    return doRequest(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${identity.accessToken}`,
        }
    });
}

/**
 * Kick a user from a room.
 * @param {object} identity
 * @param {string} roomId
 * @param {string} userId
 * @param {string?} reason
 * @returns {Promise<object>}
 */
export async function kickUser(identity, roomId, userId, reason) {
    const url = `${identity.serverAddress}/_matrix/client/r0/rooms/${roomId}/kick`;
    return doRequest(url, {
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
 * @param {object} identity
 * @param {string} roomId
 * @returns {Promise<object>}
 */
export async function leaveRoom(identity, roomId) {
    const url = `${identity.serverAddress}/_matrix/client/r0/rooms/${roomId}/leave`;
    return doRequest(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${identity.accessToken}`,
        }
    });
}

/**
 * Resolves a room alias to a room ID.
 * @param {object} identity
 * @param {string} roomAlias
 * @returns {{room_id: string, servers: string[]}}
 */
export async function resolveAlias(identity, roomAlias) {
    const url = `${identity.serverAddress}/_matrix/client/r0/directory/room/${encodeURIComponent(roomAlias)}`;
    return doRequest(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${identity.accessToken}`,
        }
    });
}

/**
 * Send an event to a room.
 * @param {object} identity
 * @param {string} roomId
 * @param {string} type
 * @param {object} content
 * @param {string=} transactionId
 * @returns {Promise<object>}
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
 * @param {object} identity
 * @param {string} roomId
 * @param {string} type
 * @param {string?} stateKey
 * @param {object} content
 * @returns {Promise<object>}
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
 * @param {object} identity
 * @param {string} roomId
 * @param {string} userId
 * @returns {Promise<object>}
 */
export async function unbanUser(identity, roomId, userId) {
    const url = `${identity.serverAddress}/_matrix/client/r0/rooms/${roomId}/unban`;
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
