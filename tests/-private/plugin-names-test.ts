import { describe, it } from 'mocha';
import { expect } from 'chai';

import { resolvePluginName, normalizePluginName } from '../../src/-private/plugin-names';

describe('Utilities | plugin-names', () => {
  // See https://babeljs.io/docs/en/next/options#name-normalization
  describe('normalizePluginName', () => {
    it('leaves paths untouched', () => {
      expect(normalizePluginName('/dir/plugin.js')).to.equal('/dir/plugin.js');
      expect(normalizePluginName('./dir/plugin.js')).to.equal('./dir/plugin.js');
      expect(normalizePluginName('C:\\dir\\plugin.js')).to.equal('C:\\dir\\plugin.js');
      expect(normalizePluginName('mod/plugin')).to.equal('mod/plugin');
      expect(normalizePluginName('@babel/mod/plugin')).to.equal('@babel/mod/plugin');
      expect(normalizePluginName('@scope/mod/plugin')).to.equal('@scope/mod/plugin');
    });

    it('strips `module:` prefixes and returns the remainder untouched', () => {
      expect(normalizePluginName('module:foo')).to.equal('foo');
    });

    it('normalizes shorthand plugin names', () => {
      expect(normalizePluginName('mod')).to.equal('babel-plugin-mod');
      expect(normalizePluginName('@babel/mod')).to.equal('@babel/plugin-mod');
      expect(normalizePluginName('@scope')).to.equal('@scope/babel-plugin');
      expect(normalizePluginName('@scope/mod')).to.equal('@scope/babel-plugin-mod');
    });

    it('leaves full plugin names untouched', () => {
      expect(normalizePluginName('babel-plugin-mod')).to.equal('babel-plugin-mod');
      expect(normalizePluginName('@babel/plugin-mod')).to.equal('@babel/plugin-mod');
      expect(normalizePluginName('@scope/babel-plugin')).to.equal('@scope/babel-plugin');
      expect(normalizePluginName('@scope/babel-plugin-mod')).to.equal('@scope/babel-plugin-mod');
      expect(normalizePluginName('@scope/prefix-babel-plugin-mod')).to.equal('@scope/prefix-babel-plugin-mod');
    });
  });

  describe('resolvePluginName', () => {
    it('resolves names from strings', () => {
      expect(resolvePluginName('foo')).to.equal('babel-plugin-foo');
      expect(resolvePluginName('babel-plugin-bar')).to.equal('babel-plugin-bar');
    });

    it('resolves names from loaded plugin implementations with a `name` key', () => {
      expect(resolvePluginName({ name: 'foo' })).to.equal('babel-plugin-foo');
      expect(resolvePluginName({ name: 'babel-plugin-bar' })).to.equal('babel-plugin-bar');
    });

    it('resolves names from array configuration', () => {
      expect(resolvePluginName(['foo', {}])).to.equal('babel-plugin-foo');
      expect(resolvePluginName(['babel-plugin-bar', {}])).to.equal('babel-plugin-bar');
    });

    it('resolves names from absolute plugin paths', () => {
      expect(resolvePluginName('/full/path/to/node_modules/resolved-plugin-name/index.js')).to.equal(
        'resolved-plugin-name'
      );

      expect(resolvePluginName('/full/path/to/node_modules/@scope/resolved-plugin-name/index.js')).to.equal(
        '@scope/resolved-plugin-name'
      );

      expect(resolvePluginName('C:\\full\\path\\to\\node_modules\\resolved-plugin-name\\index.js')).to.equal(
        'resolved-plugin-name'
      );

      expect(resolvePluginName('C:\\full\\path\\to\\node_modules\\@scope\\resolved-plugin-name\\index.js')).to.equal(
        '@scope/resolved-plugin-name'
      );
    });

    it('resolves remainder after `module:` prefix untouched', () => {
      expect(resolvePluginName('module:foo')).to.equal('foo');

      expect(resolvePluginName('module:/full/path/to/node_modules/resolved-plugin-name/index.js')).to.equal(
        '/full/path/to/node_modules/resolved-plugin-name/index.js'
      );
    });
  });
});
