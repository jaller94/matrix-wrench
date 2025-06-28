import { Identity } from "./app";
import * as z from './zod';

const dryRun = false;

export class MatrixError extends Error {
    constructor(content) {
        super(content.error);
        this.errcode = content.errcode;
        this.content = content;
    }
}

/* START Helper functions */
let nextRequestId = 1;
export async function doRequest(resource: string | URL, init: RequestInit) {
    const requestId = nextRequestId;
    nextRequestId += 1;
    globalThis.dispatchEvent(new CustomEvent('matrix-request', {
        detail: {
            init,
            resource,
            requestId,
        },
    }));
    if (dryRun) {
        globalThis.dispatchEvent(new CustomEvent('matrix-response', {
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
        globalThis.dispatchEvent(new CustomEvent('matrix-response', {
            detail: {
                requestId,
            },
        }));
        throw error;
    }
    try {
        data = await response.json();
    } catch {
        isNotJson = true;
    }
    globalThis.dispatchEvent(new CustomEvent('matrix-response', {
        detail: {
            isNotJson,
            requestId,
            status: response.status,
            errcode: data?.errcode,
            error: data?.error,
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
 * Escapes a string to be used in Bash.
 * This assumes that the string is to be wrapped with single quotation marks.
 */
export function escapeBashString(str: string): string {
    return str.replace(/\\/g, '\\\\').replace(/'/g, '\\\'');
}

/**
 * Constructs a curl command. Use it like fetch().
 */
export function toCurlCommand(resource: string, init: RequestInit = {}, maskAuthorization = false): string {
    let cmd = 'curl ';
    if (init.method !== undefined && init.method !== 'GET') {
        cmd += `-X ${init.method} `;
    }
    if (init.body) {
        cmd += `--data '${escapeBashString(init.body.toString())}' `;
    }
    for (const [key, value] of Object.entries(init.headers ?? {})) {
        let finalValue = value;
        if (maskAuthorization && key.toLocaleLowerCase() === 'authorization') {
            finalValue = 'Bearer your_access_token';
        }
        cmd += `-H '${escapeBashString(key)}: ${escapeBashString(finalValue)}' `;
    }
    cmd += `'${escapeBashString(resource)}'`;
    return cmd;
}

/**
 * Summarizes a network request. Use it like fetch().
 */
export function summarizeFetch(resource: string, init: RequestInit): string {
    const match = resource.match(basePathRegExp);
    let url = resource;
    if (match && match.groups?.command) {
        url = match.groups.command;
    }
    return `${init.method} ${url}`;
}
const basePathRegExp = /\/_matrix\/client\/.+?\/(?<command>.*)$/

/**
 * Apply the authorization headers of an identity to the parameters of `fetch()`.
 * @returns An array of parameters to hand to `fetch()`
 */
export function auth(identity: Identity, resource: string, init?: RequestInit): [string, object] {
    const url = new URL(resource);
    if (identity.masqueradeAs) {
        url.searchParams.set('user_id', identity.masqueradeAs);
    }
    return [
        url.toString(),
        {
            ...init,
            headers: {
                ...init?.headers,
                ...(identity.accessToken && {
                    Authorization: `Bearer ${identity.accessToken}`,
                }),
            },
        },
    ];
}

/* END Helper functions */

// TODO Look up response in the Matrix Spec
const zBanUser = z.looseObject({});

/**
 * Ban a user from a room.
 */
export async function banUser(identity: Identity, roomId: string, userId: string, reason?: string) {
    return zBanUser.parse(await doRequest(...auth(identity, `${identity.serverAddress}/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/ban`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: userId,
            reason,
        }),
    })));
}

// TODO Look up response in the Matrix Spec
const zClientVersion = z.looseObject({});

/**
 * Get a list of client features and versions supported by the server.
 */
export async function clientVersions(identity: Identity) {
    return zClientVersion.parse(await doRequest(`${identity.serverAddress}/_matrix/client/versions`, {
        method: 'GET',
    }));
}

const zCreateRoom = z.looseObject({
    room_id: z.string(),
});

/**
 * Create a new room.
 */
export async function createRoom(identity: Identity, body: object) {
    return zCreateRoom.parse(await doRequest(...auth(identity, `${identity.serverAddress}/_matrix/client/v3/createRoom`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    })));
}

// TODO Look up response in the Matrix Spec
const zCreateRoomAlias = z.looseObject({});

/**
 * Create a new room alias.
 */
export async function createRoomAlias(identity: Identity, roomAlias: string, roomId: string) {
    return zCreateRoomAlias.parse(await doRequest(...auth(identity, `${identity.serverAddress}/_matrix/client/v3/directory/room/${encodeURIComponent(roomAlias)}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            room_id: roomId,
        }),
    })));
}

// TODO Look up response in the Matrix Spec
const zDeleteRoomAlias = z.looseObject({});

/**
 * Delete a room alias.
 */
export async function deleteRoomAlias(identity: Identity, roomAlias: string): Promise<object> {
    return zDeleteRoomAlias.parse(await doRequest(...auth(identity, `${identity.serverAddress}/_matrix/client/v3/directory/room/${encodeURIComponent(roomAlias)}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            roomAlias,
        }),
    })));
}

/**
 * @param user The Matrix User ID of the current user, if already known.
 * @param type The type of the account data object
 */
export async function getAccountData(identity: Identity, user: string | undefined, type: string): Promise<object> {
    const userId = user ?? (await whoAmI(identity)).user_id;
    return doRequest(...auth(identity, `${identity.serverAddress}/_matrix/client/v3/user/${encodeURIComponent(userId)}/account_data/${encodeURIComponent(type)}`, {
        method: 'GET',
    }));
}

const zGetHierachy = z.looseObject({
    next_batch: z.string(),
    rooms: z.array(z.string()),
});

/**
 * Gets a paginated hierachy of a room and its space childs.
 */
export async function getHierachy(identity: Identity, roomId: string, from?: string) {
    let url = `${identity.serverAddress}/_matrix/client/v1/rooms/${encodeURIComponent(roomId)}/hierarchy`;
    if (from) {
        url += `?from=${encodeURIComponent(from)}`;
    }
    return zGetHierachy.parse(await doRequest(...auth(identity, url, {
        method: 'GET',
    })));
}

const zGetJoinedMembers = z.looseObject({
    joined: z.record(z.string(), z.looseObject({})),
});

/**
 * Gets a list of joined members of a room.
 */
export async function getJoinedMembers(identity: Identity, roomId: string) {
    return zGetJoinedMembers.parse(await doRequest(...auth(identity, `${identity.serverAddress}/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/joined_members`, {
        method: 'GET',
    })));
}

const zGetJoinedRooms = z.looseObject({
    joined_rooms: z.array(z.string()),
});

/**
 * Returns a list of the user's current rooms.
 */
export async function getJoinedRooms(identity: Identity) {
    return zGetJoinedRooms.parse(await doRequest(...auth(identity, `${identity.serverAddress}/_matrix/client/v3/joined_rooms`, {
        method: 'GET',
    })));
}

// TODO Look up response in the Matrix Spec
const zGetMediaByRoom = z.looseObject({});

/**
 * Gets a list of known media in a room. However, it only shows media from unencrypted events or rooms.
 * Synapse Admin API
 */
export async function getMediaByRoom(identity: Identity, roomId: string) {
    return zGetMediaByRoom.parse(await doRequest(...auth(identity, `${identity.serverAddress}/_synapse/admin/v1/room/${encodeURIComponent(roomId)}/media`, {
        method: 'GET',
    })));
}

// TODO Look up response in the Matrix Spec
const zGetMembers = z.looseObject({});

/**
 * Get the members of a room.
 */
export async function getMembers(identity: Identity, roomId: string): Promise<object> {
    return zGetMembers.parse(await doRequest(...auth(identity, `${identity.serverAddress}/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/members`, {
        method: 'GET',
    })));
}

/**
 * Get the state of a room.
 */
export function getState(identity: Identity, roomId: string): Promise<Record<string, unknown>[]>;
export function getState(identity: Identity, roomId: string, type: string, stateKey?: string): Promise<Record<string, unknown>>;
export async function getState(identity: Identity, roomId: string, type?: string, stateKey?: string): Promise<Record<string, unknown> | Record<string, unknown>[]> {
    let url = `${identity.serverAddress}/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/state`;
    if (type) {
        url += `/${encodeURIComponent(type)}`;
    }
    if (stateKey) {
        url += `/${encodeURIComponent(stateKey)}`;
    }
    return doRequest(...auth(identity, url, {
        method: 'GET',
    }));
}

// TODO Look up response in the Matrix Spec
const zInviteUser = z.looseObject({});

/**
 * Invite a user to a room.
 */
export async function inviteUser(identity: Identity, roomId: string, userId: string) {
    return zInviteUser.parse(await doRequest(...auth(identity, `${identity.serverAddress}/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/invite`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: userId,
        }),
    })));
}

// TODO Look up response in the Matrix Spec
const zJoinRoom = z.looseObject({});

/**
 * Join a room.
 */
export async function joinRoom(identity: Identity, roomId: string) {
    return zJoinRoom.parse(await doRequest(...auth(identity, `${identity.serverAddress}/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/join`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            roomId,
        }),
    })));
}

// TODO Look up response in the Matrix Spec
const zKickUser = z.looseObject({});

/**
 * Kick a user from a room.
 */
export async function kickUser(identity: Identity, roomId: string, userId: string, reason?: string) {
    return zKickUser.parse(await doRequest(...auth(identity, `${identity.serverAddress}/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/kick`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: userId,
            reason,
        }),
    })));
}

// TODO Look up response in the Matrix Spec
const zRegisterAppServiceUser = z.looseObject({});

export async function registerAppServiceUser(identity: Identity, username: string) {
    return zRegisterAppServiceUser.parse(await doRequest(...auth(identity, `${identity.serverAddress}/_matrix/client/v3/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: 'm.login.application_service',
            username,
        }),
    })));
}

const zResolveAlias = z.looseObject({
    room_id: z.string(),
    servers: z.array(z.looseObject({
        room_id: z.string(),
    })),
});

/**
 * Resolves a room alias to a room ID.
 */
export async function resolveAlias(identity: Identity, roomAlias: string) {
    return zResolveAlias.parse(await doRequest(...auth(identity, `${identity.serverAddress}/_matrix/client/v3/directory/room/${encodeURIComponent(roomAlias)}`, {
        method: 'GET',
    })));
}

const zWellKnownMatrixClient = z.looseObject({
    'm.homeserver': z.looseObject({
        base_url: z.string(),
    }),
});

export async function resolveServerUrl(serverName: string) {
    const url = /^https?:\/\//.test(serverName) ? serverName : `https://${serverName}`;
    const res = await fetch(`${url}/.well-known/matrix/client`);
    if (res.status === 404) {
        // Ignore the result
        return url;
    }
    if (!res.ok) {
        throw Error(`Failed to fetch ${url}: HTTP ${res.status}`);
    }
    const data = zWellKnownMatrixClient.parse(await res.json());
    const baseUrl = data['m.homeserver']['base_url'];
    // Remove trailing slashes
    return baseUrl.replace(/\/+$/, '');
}

const zSendEvent = z.looseObject({
    event_id: z.string(),
});

/**
 * Send an event to a room.
 */
export async function sendEvent(identity: Identity, roomId: string, type: string, content: object, transactionId?: string) {
    const url = `${identity.serverAddress}/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/send/` +
        `${encodeURIComponent(type)}/${encodeURIComponent(transactionId ?? Math.random())}`;
    return zSendEvent.parse(await doRequest(...auth(identity, url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
    })));
}

const zSetState = z.looseObject({
    event_id: z.string(),
});

/**
 * Set the state of a room.
 */
export async function setState(identity: Identity, roomId: string, type: string, stateKey: string | undefined, content: object) {
    let url = `${identity.serverAddress}/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/state/${encodeURIComponent(type)}`;
    if (stateKey) {
        url += `/${encodeURIComponent(stateKey)}`;
    }
    return zSetState.parse(await doRequest(...auth(identity, url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
    })));
}

// TODO Look up response in the Matrix Spec
const zUnbanUser = z.looseObject({});

/**
 * Unban a user to a room.
 */
export async function unbanUser(identity: Identity, roomId: string, userId: string): Promise<object> {
    return zUnbanUser.parse(await doRequest(...auth(identity, `${identity.serverAddress}/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/unban`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: userId,
        }),
    })));
}

const zWhoAmI = z.looseObject({
    user_id: z.string(),
    is_guest: z.boolean(),
    device_id: z.string(),
});

/**
 * Gets information about the owner of a given access token.
 */
export async function whoAmI(identity: Identity) {
    return zWhoAmI.parse(await doRequest(...auth(identity, `${identity.serverAddress}/_matrix/client/v3/account/whoami`, {
        method: 'GET',
    })));
}

export async function *yieldHierachy(identity: Identity, roomId: string) {
    let rooms: unknown[] = [];
    let nextBatch;
    do {
        const response = await getHierachy(identity, roomId, nextBatch);
        rooms = [
            ...rooms,
            ...response.rooms,
        ];
        yield {
            rooms,
        };
        nextBatch = response.next_batch;
    } while (nextBatch);
}
