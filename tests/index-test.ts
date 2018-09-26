import { describe, it } from 'mocha';
import { expect } from 'chai';

import { hasPlugin, findPlugin, addPlugin, BabelPluginConfig } from '../src';

describe('Public Helpers', () => {
  describe('hasPlugin', () => {
    let shortNamePlugin: BabelPluginConfig = 'short-name';
    let normalizedNamePlugin: BabelPluginConfig = ['babel-plugin-long-name', {}, 'id'];
    let fullPathPlugin: BabelPluginConfig = ['/path/to/node_modules/babel-plugin-full-path/index.js'];
    let scopedPathPlugin: BabelPluginConfig = ['/path/to/node_modules/@scope/babel-plugin-scoped-path/lib/plugin.js'];

    let target = {
      options: {
        babel: {
          plugins: [shortNamePlugin, normalizedNamePlugin, fullPathPlugin, scopedPathPlugin]
        }
      }
    };

    it('locates plugins by short and normalized names', () => {
      expect(hasPlugin(target, 'nonexistent')).to.be.false;

      expect(hasPlugin(target, 'short-name')).to.be.true;
      expect(hasPlugin(target, 'babel-plugin-short-name')).to.be.true;

      expect(hasPlugin(target, 'long-name')).to.be.true;
      expect(hasPlugin(target, 'babel-plugin-long-name')).to.be.true;

      expect(hasPlugin(target, 'full-path')).to.be.true;
      expect(hasPlugin(target, 'babel-plugin-full-path')).to.be.true;

      expect(hasPlugin(target, '@scope/scoped-path')).to.be.true;
      expect(hasPlugin(target, '@scope/babel-plugin-scoped-path')).to.be.true;
    });
  });

  describe('findPlugin', () => {
    let shortNamePlugin: BabelPluginConfig = 'short-name';
    let normalizedNamePlugin: BabelPluginConfig = ['babel-plugin-long-name', {}, 'id'];
    let fullPathPlugin: BabelPluginConfig = ['/path/to/node_modules/babel-plugin-full-path/index.js'];
    let scopedPathPlugin: BabelPluginConfig = ['/path/to/node_modules/@scope/babel-plugin-scoped-path/lib/plugin.js'];

    let target = {
      options: {
        babel: {
          plugins: [shortNamePlugin, normalizedNamePlugin, fullPathPlugin, scopedPathPlugin]
        }
      }
    };

    it('locates plugins by short and normalized names', () => {
      expect(findPlugin(target, 'nonexistent')).to.be.undefined;

      expect(findPlugin(target, 'short-name')).to.equal(shortNamePlugin);
      expect(findPlugin(target, 'babel-plugin-short-name')).to.equal(shortNamePlugin);

      expect(findPlugin(target, 'long-name')).to.equal(normalizedNamePlugin);
      expect(findPlugin(target, 'babel-plugin-long-name')).to.equal(normalizedNamePlugin);

      expect(findPlugin(target, 'full-path')).to.equal(fullPathPlugin);
      expect(findPlugin(target, 'babel-plugin-full-path')).to.equal(fullPathPlugin);

      expect(findPlugin(target, '@scope/scoped-path')).to.equal(scopedPathPlugin);
      expect(findPlugin(target, '@scope/babel-plugin-scoped-path')).to.equal(scopedPathPlugin);
    });
  });

  describe('addPlugin', () => {
    it('creates configuration when necessary', () => {
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

    it('honors `before` configuration', () => {
      let target = makeTarget(['a', 'b', 'c', 'd', 'e']);

      addPlugin(target, 'babel-plugin-foo', { before: ['d', 'b', 'c'] });

      expect(target.options.babel.plugins).to.deep.equal(['a', 'babel-plugin-foo', 'b', 'c', 'd', 'e']);
    });

    it('honors `after` configuration', () => {
      let target = makeTarget(['a', 'b', 'c', 'd', 'e']);

      addPlugin(target, 'babel-plugin-foo', { after: ['b', 'd', 'c'] });

      expect(target.options.babel.plugins).to.deep.equal(['a', 'b', 'c', 'd', 'babel-plugin-foo', 'e']);
    });

    it('honors combined `before` and `after` configuration', () => {
      let target = makeTarget(['a', 'b', 'c', 'd', 'e']);

      addPlugin(target, 'babel-plugin-foo', { before: ['c'], after: ['b'] });

      expect(target.options.babel.plugins).to.deep.equal(['a', 'b', 'babel-plugin-foo', 'c', 'd', 'e']);
    });

    it('ignores `before` and `after` configuration for plugins that are not present', () => {});

    it('rejects unsatisfiable `before`/`after` constraints', () => {
      let target = makeTarget(['a', 'b', 'c', 'd', 'e']);

      expect(() => addPlugin(target, 'babel-plugin-foo', { before: ['c'], after: ['d'] })).to.throw(
        'Unable to satisfy placement constraints for Babel plugin babel-plugin-foo'
      );
    });
  });

  function makeTarget(plugins: BabelPluginConfig[]) {
    return {
      options: {
        babel: {
          plugins
        }
      }
    };
  }
});
