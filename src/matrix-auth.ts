/**
 * Gets an access token by logging in with a password.
 * @param user MXID or user localpart
 */
export const logInWithPassword = async(serverAddress: string, user: string, password: string): Promise<Record<string, unknown>> => {
    const resp = await fetch(`${serverAddress}/_matrix/client/v3/login`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: 'm.login.password',
            // https://spec.matrix.org/v1.11/client-server-api/#matrix-user-id
            identifier: {
              type: 'm.id.user',
              user,
            },
            initial_device_display_name: 'Matrix Wrench',
            password,
        }),
    });
    if (!resp.ok) {
        throw Error('Failed to log in.');
    }
    return await resp.json();
};
