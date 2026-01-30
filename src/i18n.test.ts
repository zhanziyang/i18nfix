import { describe, it, expect } from 'vitest';
import {
  flattenJson,
  unflattenJson,
  placeholdersBrace,
  placeholdersMustache,
  placeholdersPrintf,
} from './i18n.js';

describe('i18n helpers', () => {
  it('flatten/unflatten roundtrip (nested)', () => {
    const obj = {
      home: { title: 'Hello', subtitle: 'World' },
      app: { welcome: 'Hi {name}' },
    };

    const flat = flattenJson(obj as any);
    expect(flat['home.title']).toBe('Hello');
    expect(flat['home.subtitle']).toBe('World');
    expect(flat['app.welcome']).toBe('Hi {name}');

    const back = unflattenJson(flat);
    expect(back).toEqual(obj);
  });

  it('brace placeholders', () => {
    expect(placeholdersBrace('Hello, {name}!')).toEqual(['name']);
  });

  it('mustache placeholders', () => {
    expect(placeholdersMustache('Hello, {{ name }}!')).toEqual(['name']);
  });

  it('printf placeholders', () => {
    expect(placeholdersPrintf('You have %1$s items and %d warnings')).toEqual(['%1$s', '%d']);
  });
});
