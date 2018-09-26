import { describe, it } from 'mocha';
import { expect } from 'chai';
import { findPluginIndex } from '../../src/-private/plugin-configuration';
import { ConfigurationTarget } from '../../src';

describe('Utilities | plugin-configuration', () => {
  describe('findPluginIndex', () => {
    let target: ConfigurationTarget = {
      options: {
        babel: {
          plugins: ['short-name', 'babel-plugin-long-name', '/path/to/node_modules/babel-plugin-full-path/index.js']
        }
      }
    };

    it('correctly returns -1', () => {
      expect(findPluginIndex({}, 'foo-bar')).to.equal(-1);
    });

    it('locates plugins when requested by short name', () => {
      expect(findPluginIndex(target, 'short-name')).to.equal(0);
      expect(findPluginIndex(target, 'long-name')).to.equal(1);
      expect(findPluginIndex(target, 'full-path')).to.equal(2);
    });

    it('locates plugins when requested by normalized name', () => {
      expect(findPluginIndex(target, 'babel-plugin-short-name')).to.equal(0);
      expect(findPluginIndex(target, 'babel-plugin-long-name')).to.equal(1);
      expect(findPluginIndex(target, 'babel-plugin-full-path')).to.equal(2);
    });
  });
});
