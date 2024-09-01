import {
    auth,
    toCurlCommand,
} from '../src/matrix';

describe('auth', () => {
    test('can deal with an empty identity', () => {
        expect(auth({}, 'https://localhost:8080/_matrix/v3/test')).toEqual([
            'https://localhost:8080/_matrix/v3/test',
            {
                headers: {},
            },
        ]);
    });
    test('applies the property accessToken', () => {
        const identity = {
            accessToken: 'syn_1234abcd',
        };
        expect(auth(identity, 'https://localhost:8080/_matrix/v3/test')).toEqual([
            'https://localhost:8080/_matrix/v3/test',
            {
                headers: {
                    Authorization: 'Bearer syn_1234abcd',
                },
            },
        ]);
    });
    test('applies the property masqueradeAs', () => {
        const identity = {
            masqueradeAs: '@jaller94:matrix.org',
        };
        expect(auth(identity, 'https://localhost:8080/_matrix/v3/test')).toEqual([
            `https://localhost:8080/_matrix/v3/test?user_id=${encodeURIComponent('@jaller94:matrix.org')}`,
            {
                headers: {},
            },
        ]);
    });
});

describe('toCurlCommand', () => {
    test('translates a simple fetch without options', () => {
        expect(toCurlCommand('https://localhost:8080/_matrix/v3/test')).toBe(`curl 'https://localhost:8080/_matrix/v3/test'`);
    });
    test('translates a fetch with Authorization header', () => {
        expect(toCurlCommand('https://localhost:8080/_matrix/v3/test', {
            headers: {
                Authorization: 'Bearer syn_1234abcd',
            },
        })).toBe(`curl -H 'Authorization: Bearer syn_1234abcd' 'https://localhost:8080/_matrix/v3/test'`);
    });
    test('masks the Authorization header', () => {
        expect(toCurlCommand('https://localhost:8080/_matrix/v3/test', {
            headers: {
                Authorization: 'Bearer syn_1234abcd',
            },
        }, true)).toBe(`curl -H 'Authorization: Bearer your_access_token' 'https://localhost:8080/_matrix/v3/test'`);
    });
    test('translates a fetch with a method', () => {
        expect(toCurlCommand('https://localhost:8080/_matrix/v3/test', {
            method: 'DELETE',
        })).toBe(`curl -X DELETE 'https://localhost:8080/_matrix/v3/test'`);
    });
    test('translates a fetch with a JSON body', () => {
        expect(toCurlCommand('https://localhost:8080/_matrix/v3/test', {
            method: 'PUT',
            body: '{"foo":"bar"}',
        })).toMatchSnapshot();
        expect(toCurlCommand('https://localhost:8080/_matrix/v3/test', {
            method: 'PUT',
            body: '{\n  "foo":"bar"\n}',
        })).toMatchSnapshot();
    });
    test('escapes a body with single quotation marks', () => {
        expect(toCurlCommand('https://localhost:8080/_matrix/v3/test', {
            method: 'PUT',
            body: `{"foo":"'value_with_single_quotes'"}`,
        })).toBe(`curl -X PUT --data '{"foo":"\\'value_with_single_quotes\\'"}' 'https://localhost:8080/_matrix/v3/test'`);
    });
    test('escapes a body with a back slashe', () => {
        expect(toCurlCommand('https://localhost:8080/_matrix/v3/test', {
            method: 'PUT',
            body: `{"foo":"\\"}`,
        })).toBe(`curl -X PUT --data '{"foo":"\\\\"}' 'https://localhost:8080/_matrix/v3/test'`);
    });
});
