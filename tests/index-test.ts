import { describe, it } from 'mocha';
import { expect } from 'chai';

import { hasPlugin, findPlugin, addPlugin, BabelPluginConfig } from '../src';

describe('Public Helpers', () => {
  describe('hasPlugin', () => {
    let shortNamePlugin: BabelPluginConfig = 'short-name';
    let normalizedNamePlugin: BabelPluginConfig = ['babel-plugin-long-name', {}, 'id'];
    let fullPathPlugin: BabelPluginConfig = ['/path/to/node_modules/babel-plugin-full-path/index.js'];
    let scopedPathPlugin: BabelPluginConfig = ['/path/to/node_modules/@scope/babel-plugin-scoped-path/lib/plugin.js'];
    let scopedWindowsPathPlugin: BabelPluginConfig = [
      'C:\\path\\to\\node_modules\\@scope\\babel-plugin-scoped-windows-path\\lib\\plugin.js'
    ];

    let config = [shortNamePlugin, normalizedNamePlugin, fullPathPlugin, scopedPathPlugin, scopedWindowsPathPlugin];

    it('locates plugins by short and normalized names', () => {
      expect(hasPlugin(config, 'nonexistent')).to.be.false;

      expect(hasPlugin(config, 'short-name')).to.be.true;
      expect(hasPlugin(config, 'babel-plugin-short-name')).to.be.true;

      expect(hasPlugin(config, 'long-name')).to.be.true;
      expect(hasPlugin(config, 'babel-plugin-long-name')).to.be.true;

      expect(hasPlugin(config, 'full-path')).to.be.true;
      expect(hasPlugin(config, 'babel-plugin-full-path')).to.be.true;

      expect(hasPlugin(config, '@scope/scoped-path')).to.be.true;
      expect(hasPlugin(config, '@scope/babel-plugin-scoped-path')).to.be.true;

      expect(hasPlugin(config, '@scope/scoped-windows-path')).to.be.true;
      expect(hasPlugin(config, '@scope/babel-plugin-scoped-path')).to.be.true;
    });
  });

  describe('findPlugin', () => {
    let shortNamePlugin: BabelPluginConfig = 'short-name';
    let normalizedNamePlugin: BabelPluginConfig = ['babel-plugin-long-name', {}, 'id'];
    let fullPathPlugin: BabelPluginConfig = ['/path/to/node_modules/babel-plugin-full-path/index.js'];
    let scopedPathPlugin: BabelPluginConfig = ['/path/to/node_modules/@scope/babel-plugin-scoped-path/lib/plugin.js'];
    let scopedWindowsPathPlugin: BabelPluginConfig = [
      'C:\\path\\to\\node_modules\\@scope\\babel-plugin-scoped-windows-path\\lib\\plugin.js'
    ];

    let config = [shortNamePlugin, normalizedNamePlugin, fullPathPlugin, scopedPathPlugin, scopedWindowsPathPlugin];

    it('locates plugins by short and normalized names', () => {
      expect(findPlugin(config, 'nonexistent')).to.be.undefined;

      expect(findPlugin(config, 'short-name')).to.equal(shortNamePlugin);
      expect(findPlugin(config, 'babel-plugin-short-name')).to.equal(shortNamePlugin);

      expect(findPlugin(config, 'long-name')).to.equal(normalizedNamePlugin);
      expect(findPlugin(config, 'babel-plugin-long-name')).to.equal(normalizedNamePlugin);

      expect(findPlugin(config, 'full-path')).to.equal(fullPathPlugin);
      expect(findPlugin(config, 'babel-plugin-full-path')).to.equal(fullPathPlugin);

      expect(findPlugin(config, '@scope/scoped-path')).to.equal(scopedPathPlugin);
      expect(findPlugin(config, '@scope/babel-plugin-scoped-path')).to.equal(scopedPathPlugin);

      expect(findPlugin(config, '@scope/scoped-windows-path')).to.equal(scopedWindowsPathPlugin);
      expect(findPlugin(config, '@scope/babel-plugin-scoped-windows-path')).to.equal(scopedWindowsPathPlugin);
    });
  });

  describe('addPlugin', () => {
    describe('with an EmberApp or Addon target', () => {
      it('creates nested configuration when necessary', () => {
        let target = {};

        addPlugin(target, 'babel-plugin-foo');

        expect(target).to.deep.equal({
          options: {
            babel: {
              plugins: ['babel-plugin-foo']
            }
          }
        });
      });

      it('leaves existing configuration alone', () => {
        let target = {
          name: 'target',
          options: {
            otherAddon: true,
            babel: {
              loose: true,
              plugins: ['a', 'b', 'c']
            }
          }
        };

        addPlugin(target, 'd');

        expect(target).to.deep.equal({
          name: 'target',
          options: {
            otherAddon: true,
            babel: {
              loose: true,
              plugins: ['a', 'b', 'c', 'd']
            }
          }
        });
      });
    });

    it('honors `before` configuration', () => {
      let config = ['a', 'b', 'c', 'd', 'e'];

      addPlugin(config, 'babel-plugin-foo', { before: ['d', 'b', 'c'] });

      expect(config).to.deep.equal(['a', 'babel-plugin-foo', 'b', 'c', 'd', 'e']);
    });

    it('honors `after` configuration', () => {
      let config = ['a', 'b', 'c', 'd', 'e'];

      addPlugin(config, 'babel-plugin-foo', { after: ['b', 'd', 'c'] });

      expect(config).to.deep.equal(['a', 'b', 'c', 'd', 'babel-plugin-foo', 'e']);
    });

    it('honors combined `before` and `after` configuration', () => {
      let config = ['a', 'b', 'c', 'd', 'e'];

      addPlugin(config, 'babel-plugin-foo', { before: ['c'], after: ['b'] });

      expect(config).to.deep.equal(['a', 'b', 'babel-plugin-foo', 'c', 'd', 'e']);
    });

    it('ignores `before` and `after` configuration for plugins that are not present', () => {});

    it('rejects unsatisfiable `before`/`after` constraints', () => {
      let config = ['a', 'b', 'c', 'd', 'e'];

      expect(() => addPlugin(config, 'babel-plugin-foo', { before: ['c'], after: ['d'] })).to.throw(
        'Unable to satisfy placement constraints for Babel plugin babel-plugin-foo'
      );
    });
  });
});
