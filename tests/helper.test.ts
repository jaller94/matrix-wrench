import {
    describe,
    expect,
    test,
} from 'bun:test';
import {
    classnames,
    fillInVariables,
    uniqueId,
} from '../src/helper.ts';

describe('classnames', () => {
    test('works with 1 string', () => {
        expect(classnames('test')).toBe('test');
    });
    test('works with a 2 strings', () => {
        expect(classnames('test', 'ok')).toBe('test ok');
    });
    test('works with 1 object', () => {
        expect(classnames({'ok': true})).toBe('ok');
    });
    test('works with 1 string and 1 object', () => {
        expect(classnames('test', {'ok': true})).toBe('test ok');
    });
    test('works with 2 objects', () => {
        expect(classnames({'test': true}, {'ok': true})).toBe('test ok');
    });
    test('only includes true values', () => {
        expect(classnames({a: false, b: false, c: true, d: false})).toBe('c');
    });
});

describe('fillInVariables', () => {
    test('returns a string when there are no variables', () => {
        expect(fillInVariables('test')).toBe('test');
    });
    test('returns a string without placeholders unchanged', () => {
        expect(fillInVariables('test', {})).toBe('test');
    });
    test('when the entire string is a placeholder', () => {
        expect(fillInVariables('!{foo}', {foo: 'bar'})).toBe('bar');
    });
    test('with one placeholder', () => {
        expect(fillInVariables('/_matrix/!{roomId}/join', { roomId: 'bar' })).toBe('/_matrix/bar/join');
    });
    test('with two placeholders', () => {
        expect(fillInVariables('!{roomId}/join/!{yay}', { roomId: 'foo', yay: 'bar' })).toBe('foo/join/bar');
    });
});

describe('uniqueId', () => {
    test('two calls yield different results', () => {
        expect(uniqueId()).not.toBe(uniqueId());
    });
    test('returns a string', () => {
        expect(typeof uniqueId()).toBe('string');
    });
});
