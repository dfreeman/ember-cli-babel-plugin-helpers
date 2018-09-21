import { describe, it } from 'mocha';
import { expect } from 'chai';

import { addPlugin } from '../src';

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
          plugins: ['my-existing-plugin']
        }
      }
    };

    addPlugin(target, 'babel-plugin-foo');

    expect(target).to.deep.equal({
      name: 'target',
      options: {
        otherAddon: true,
        babel: {
          loose: true,
          plugins: ['my-existing-plugin', 'babel-plugin-foo']
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

    addPlugin(target, 'babel-plugin-foo', { before: ['d', 'b', 'c'] });

    expect(target.options.babel.plugins).to.deep.equal(['a', 'babel-plugin-foo', 'b', 'c', 'd', 'e']);
  });

  it('honors `after` configuration', () => {
    let target = {
      options: {
        babel: {
          plugins: ['a', 'b', 'c', 'd', 'e']
        }
      }
    };

    addPlugin(target, 'babel-plugin-foo', { after: ['b', 'd', 'c'] });

    expect(target.options.babel.plugins).to.deep.equal(['a', 'b', 'c', 'd', 'babel-plugin-foo', 'e']);
  });

  it('honors combined `before` and `after` configuration', () => {
    let target = {
      options: {
        babel: {
          plugins: ['a', 'b', 'c', 'd', 'e']
        }
      }
    };

    addPlugin(target, 'babel-plugin-foo', { before: ['c'], after: ['b'] });

    expect(target.options.babel.plugins).to.deep.equal(['a', 'b', 'babel-plugin-foo', 'c', 'd', 'e']);
  });

  it('rejects unsatisfiable `before`/`after` constraints', () => {
    let target = {
      options: {
        babel: {
          plugins: ['a', 'b', 'c', 'd', 'e']
        }
      }
    };

    expect(() => addPlugin(target, 'babel-plugin-foo', { before: ['c'], after: ['d'] })).to.throw(
      'Unable to satisfy placement constraints for Babel plugin babel-plugin-foo'
    );
  });
});
