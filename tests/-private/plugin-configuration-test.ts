import { describe, it } from 'mocha';
import { expect } from 'chai';
import { findPluginIndex } from '../../src/-private/plugin-configuration';

describe('Utilities | plugin-configuration', () => {
  describe('findPluginIndex', () => {
    let plugins = [
      'short-name',
      'babel-plugin-long-name',
      '/path/to/node_modules/babel-plugin-full-path/index.js',
      'module:foo',
      'module:/path/to/node_modules/babel-plugin-full-path/index.js'
    ];

    it('correctly returns -1', () => {
      expect(findPluginIndex([], 'foo-bar')).to.equal(-1);
    });

    it('locates plugins when requested by short name', () => {
      expect(findPluginIndex(plugins, 'short-name')).to.equal(0);
      expect(findPluginIndex(plugins, 'long-name')).to.equal(1);
      expect(findPluginIndex(plugins, 'full-path')).to.equal(2);
    });

    it('locates plugins when requested by normalized name', () => {
      expect(findPluginIndex(plugins, 'babel-plugin-short-name')).to.equal(0);
      expect(findPluginIndex(plugins, 'babel-plugin-long-name')).to.equal(1);
      expect(findPluginIndex(plugins, 'babel-plugin-full-path')).to.equal(2);
    });

    it('locates plugins when requested with `module:` prefix', () => {
      expect(findPluginIndex(plugins, 'module:foo')).to.equal(3);
      expect(findPluginIndex(plugins, 'module:/path/to/node_modules/babel-plugin-full-path/index.js')).to.equal(4);
    });

    it('locates plugins when requested by full path', () => {
      expect(findPluginIndex(plugins, '/path/to/node_modules/babel-plugin-full-path/index.js')).to.equal(2);
    });
  });
});
