import deepEqual from 'fast-deep-equal';

/**
 * A Babel plugin is typically specified as a string representing a module to be
 * loaded, either a package name or a full path. It's also possible for the actual
 * implementation to be supplied, in which case we check the value of a `name` field.
 */
export type BabelPlugin = string | { name?: string };

/**
 * Configuration for a Babel plugin may be the bare plugin itself, or a tuple
 * optionally containing configuration for the plugin and a possible unique
 * identifier to allow for multiple instances of the same plugin.
 */
export type BabelPluginConfig = BabelPlugin | [BabelPlugin, unknown?, unknown?];

/**
 * A configuration target is typically an `EmberApp` or `Addon` instance, which
 * may already have plugins configured or other options set.
 */
export interface ConfigurationTarget {
  options?: {
    babel?: {
      plugins?: BabelPluginConfig[];
    };
  };
}

/**
 * Indicates whether the given plugin is already present in the target's configuration.
 *
 * If specific plugin configuration and/or a unique identifier are supplied, those will
 * also be consulted when considering the configured plugins. Otherwise, any plugin with
 * the same name will be treated as a match.
 *
 * @param target An `EmberApp` or `Addon` instance whose configuration should be checked
 * @param plugin A name or configuration tuple for the plugin to be located
 */
export function hasPlugin(target: ConfigurationTarget, plugin: BabelPluginConfig): boolean {
  return findPluginIndex(target, plugin) !== -1;
}

export interface AddPluginOptions {
  /**
   * Any plugins that the given one must appear *before* in the plugins array.
   */
  before?: BabelPluginConfig[];

  /**
   * Any plugins that the given one must appear *after* in the plugins array.
   */
  after?: BabelPluginConfig[];
}

/**
 * Add a plugin to the Babel configuration for the given target.
 *
 * @param target An `EmberApp` or `Addon` instance for which the plugin should be set up
 * @param plugin Configuration for the Babel plugin to add
 * @param options Optional constraints around where the plugin should appear in the array
 */
export function addPlugin(target: ConfigurationTarget, plugin: BabelPluginConfig, options: AddPluginOptions = {}) {
  let earliest = Math.max(...findPluginIndices(target, options.after)) + 1;
  let latest = Math.min(...findPluginIndices(target, options.before));

  if (earliest > latest) {
    throw new Error(`Unable to satisfy placement constraints for Babel plugin ${getName(plugin)}`);
  }

  let plugins = ensurePluginsArray(target);
  let targetIndex = Number.isFinite(latest) ? latest : Number.isFinite(earliest) ? earliest : plugins.length;

  plugins.splice(targetIndex, 0, plugin);
}

function ensurePluginsArray(target: ConfigurationTarget): BabelPluginConfig[] {
  let options = target.options || (target.options = {});
  let babel = options.babel || (options.babel = {});
  return babel.plugins || (babel.plugins = []);
}

function findPluginIndices(target: ConfigurationTarget, plugins: BabelPluginConfig[] = []): number[] {
  return plugins.map(plugin => findPluginIndex(target, plugin)).filter(index => index >= 0);
}

function findPluginIndex(target: ConfigurationTarget, plugin: BabelPluginConfig): number {
  let pluginName = getName(plugin);
  let plugins = target.options && target.options.babel && target.options.babel.plugins;
  if (!pluginName || !plugins) {
    return -1;
  }

  for (let [index, candidate] of plugins.entries()) {
    if (getName(candidate) === pluginName && hasSameConfig(plugin, candidate)) {
      return index;
    }
  }

  return -1;
}

function hasSameConfig(plugin: BabelPluginConfig, candidate: BabelPluginConfig) {
  // If no explicit configuration was given, then just an instance of the plugin
  // being present already is sufficient.
  if (!Array.isArray(plugin) || plugin.length === 1) {
    return true;
  }

  // Conversely, if config was given and the candidate has none, then the desired
  // configuration definitely wasn't set.
  if (!Array.isArray(candidate) || candidate.length === 1) {
    return false;
  }

  // If an identifier was specified and they don't match, they aren't the same
  if (plugin[2] && plugin[2] !== candidate[2]) {
    return false;
  }

  // If everything else matches, do the (potentially more expensive) check of
  // whether their configuration is actually the same.
  return plugin[1] === undefined || deepEqual(plugin[1], candidate[1]);
}

function getName(pluginConfig: BabelPluginConfig): string | undefined {
  let plugin = Array.isArray(pluginConfig) ? pluginConfig[0] : pluginConfig;
  return typeof plugin === 'string' ? findPackageName(plugin) : normalizePluginName(plugin.name);
}

const nodeModulesRegex = /[\\/]node_modules[\\/]/;
const packageNameRegex = /^((@[^\\/]+[\\/])?[^\\/]*)/;

// Given a plugin string (a package name or full module path), returns the
// package name where that plugin is implemented.
function findPackageName(modulePath: string): string | undefined {
  let packagePath = modulePath;
  let match = nodeModulesRegex.exec(modulePath);
  if (match) {
    let index = modulePath.lastIndexOf(match[0]) + match[0].length;
    packagePath = modulePath.substring(index);
  }

  let packageNameMatch = packageNameRegex.exec(packagePath);
  return normalizePluginName(packageNameMatch ? packageNameMatch[0] : packagePath);
}

// Based on https://babeljs.io/docs/en/next/options#name-normalization
// Unfortunately the logic Babel uses to implement this isn't exposed
function normalizePluginName(rawName: string | undefined): string | undefined {
  if (
    !rawName ||
    !/^[\w@]/.test(rawName) ||
    rawName.startsWith('@babel/plugin-') ||
    rawName.startsWith('babel-plugin-')
  ) {
    return rawName;
  }

  if (rawName.startsWith('@babel/')) {
    return rawName.replace('@babel/', '@babel/plugin-');
  }

  if (rawName.startsWith('@')) {
    let [scope, name] = rawName.split('/');
    if (!name.startsWith('babel-plugin')) {
      name = `babel-plugin-${name}`;
    }
    return `${scope}/${name}`;
  }

  return `babel-plugin-${rawName}`;
}
