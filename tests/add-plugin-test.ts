import { describe, it } from 'mocha';
import { expect } from 'chai';

import { addPlugin } from '../src';

describe('addPlugin', () => {
  it('creates configuration when necessary', () => {
    let target = {};

    addPlugin(target, 'foo-plugin');

    expect(target).to.deep.equal({
      options: {
        babel: {
          plugins: ['foo-plugin']
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
          plugins: ['my-existing-plugin']
        }
      }
    };

    addPlugin(target, 'foo-plugin');

    expect(target).to.deep.equal({
      name: 'target',
      options: {
        otherAddon: true,
        babel: {
          loose: true,
          plugins: ['my-existing-plugin', 'foo-plugin']
        }
      }
    });
  });

  it('honors `before` configuration', () => {
    let target = {
      options: {
        babel: {
          plugins: ['a', 'b', 'c', 'd', 'e']
        }
      }
    };

    addPlugin(target, 'foo-plugin', { before: ['d', 'b', 'c'] });

    expect(target.options.babel.plugins).to.deep.equal(['a', 'foo-plugin', 'b', 'c', 'd', 'e']);
  });

  it('honors `after` configuration', () => {
    let target = {
      options: {
        babel: {
          plugins: ['a', 'b', 'c', 'd', 'e']
        }
      }
    };

    addPlugin(target, 'foo-plugin', { after: ['b', 'd', 'c'] });

    expect(target.options.babel.plugins).to.deep.equal(['a', 'b', 'c', 'd', 'foo-plugin', 'e']);
  });

  it('honors combined `before` and `after` configuration', () => {
    let target = {
      options: {
        babel: {
          plugins: ['a', 'b', 'c', 'd', 'e']
        }
      }
    };

    addPlugin(target, 'foo-plugin', { before: ['c'], after: ['b'] });

    expect(target.options.babel.plugins).to.deep.equal(['a', 'b', 'foo-plugin', 'c', 'd', 'e']);
  });

  it('rejects unsatisfiable `before`/`after` constraints', () => {
    let target = {
      options: {
        babel: {
          plugins: ['a', 'b', 'c', 'd', 'e']
        }
      }
    };

    expect(() => addPlugin(target, 'foo-plugin', { before: ['c'], after: ['d'] })).to.throw(
      'Unable to satisfy placement constraints for Babel plugin foo-plugin'
    );
  });
});
