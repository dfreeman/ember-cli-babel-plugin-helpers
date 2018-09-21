import { describe, it } from 'mocha';
import { expect } from 'chai';

import { hasPlugin, ConfigurationTarget } from '../src';

describe('hasPlugin', () => {
  describe('with no configuration', () => {
    let target = {};

    it('correctly returns false', () => {
      expect(hasPlugin(target, 'foo-bar')).to.be.false;
    });
  });

  describe('with simple plugins', () => {
    let target: ConfigurationTarget = {
      options: {
        babel: {
          plugins: [
            'short-name-only',
            '@scoped/short-name-only',
            '/full/path/to/node_modules/resolved-plugin-name/index.js',
            '/full/path/to/node_modules/@scoped/resolved-plugin-name/path/to/index.js',
            { name: 'implementation-only' },
            ['short-name-in-singleton']
          ]
        }
      }
    };

    it('locates plugins by short name', () => {
      expect(hasPlugin(target, 'short-name-only')).to.be.true;
      expect(hasPlugin(target, '@scoped/short-name-only')).to.be.true;
      expect(hasPlugin(target, 'resolved-plugin-name')).to.be.true;
      expect(hasPlugin(target, '@scoped/resolved-plugin-name')).to.be.true;
      expect(hasPlugin(target, 'implementation-only')).to.be.true;
    });

    it('locates plugins by resolved name', () => {
      expect(hasPlugin(target, '/full/path/to/node_modules/short-name-only/index.js')).to.be.true;
      expect(hasPlugin(target, '/full/path/to/node_modules/@scoped/short-name-only/index.js')).to.be.true;
      expect(hasPlugin(target, '/full/path/to/node_modules/resolved-plugin-name/index.js')).to.be.true;
      expect(hasPlugin(target, '/full/path/to/node_modules/@scoped/resolved-plugin-name/index.js')).to.be.true;
      expect(hasPlugin(target, '/full/path/to/node_modules/implementation-only/index.js')).to.be.true;
    });
  });

  describe('with shorthand and full names', () => {
    let target: ConfigurationTarget = {
      options: {
        babel: {
          plugins: [
            'shorthand-6x-name',
            '@babel/shorthand-7x-name',
            '@my-org/shorthand-name',
            'babel-plugin-longhand-6x-name',
            '@babel/plugin-longhand-7x-name',
            '@my-org/babel-plugin-longhand-name'
          ]
        }
      }
    };

    it('locates plugins by short- or longhand names', () => {
      expect(hasPlugin(target, 'shorthand-6x-name')).to.be.true;
      expect(hasPlugin(target, 'babel-plugin-shorthand-6x-name')).to.be.true;
      expect(hasPlugin(target, '@babel/shorthand-7x-name')).to.be.true;
      expect(hasPlugin(target, '@babel/plugin-shorthand-7x-name')).to.be.true;
      expect(hasPlugin(target, '@my-org/shorthand-name')).to.be.true;
      expect(hasPlugin(target, '@my-org/babel-plugin-shorthand-name')).to.be.true;

      expect(hasPlugin(target, 'longhand-6x-name')).to.be.true;
      expect(hasPlugin(target, 'babel-plugin-longhand-6x-name')).to.be.true;
      expect(hasPlugin(target, '@babel/longhand-7x-name')).to.be.true;
      expect(hasPlugin(target, '@babel/plugin-longhand-7x-name')).to.be.true;
      expect(hasPlugin(target, '@my-org/longhand-name')).to.be.true;
      expect(hasPlugin(target, '@my-org/babel-plugin-longhand-name')).to.be.true;
    });
  });

  describe('with plugins that have configuration', () => {
    let target: ConfigurationTarget = {
      options: {
        babel: {
          plugins: [['short-name', { config: true }]]
        }
      }
    };

    it('locates the plugin when requested by name', () => {
      expect(hasPlugin(target, 'short-name')).to.be.true;
    });

    it('locates the plugin when requested with matching config', () => {
      expect(hasPlugin(target, ['short-name', { config: true }])).to.be.true;
    });

    it('returns false when searched with differing config', () => {
      expect(hasPlugin(target, ['short-name', { config: false }])).to.be.false;
    });
  });

  describe('with plugins that have unique identifiers', () => {
    let target: ConfigurationTarget = {
      options: {
        babel: {
          plugins: [['short-name', { config: true }, 'instance-1'], ['short-name', { config: false }, 'instance-2']]
        }
      }
    };

    it('locates the plugin when requested without specifying an identifier', () => {
      expect(hasPlugin(target, 'short-name')).to.be.true;
      expect(hasPlugin(target, ['short-name', { config: true }])).to.be.true;
      expect(hasPlugin(target, ['short-name', { config: false }])).to.be.true;
    });

    it('locates the plugin when requested with an identifier', () => {
      expect(hasPlugin(target, ['short-name', { config: true }, 'instance-1'])).to.be.true;
      expect(hasPlugin(target, ['short-name', undefined, 'instance-1'])).to.be.true;

      expect(hasPlugin(target, ['short-name', { config: false }, 'instance-2'])).to.be.true;
      expect(hasPlugin(target, ['short-name', undefined, 'instance-2'])).to.be.true;
    });

    it('returns false when searched with a differing identifier', () => {
      expect(hasPlugin(target, ['short-name', undefined, 'instance-3'])).to.be.false;
      expect(hasPlugin(target, ['short-name', { config: true }, 'instance-2'])).to.be.false;
      expect(hasPlugin(target, ['short-name', { config: false }, 'instance-1'])).to.be.false;
    });
  });
});
