import { resolvePluginName } from './-private/plugin-names';
import { getPluginsArray, findPluginIndex } from './-private/plugin-configuration';

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
 * Locates the existing configuration, if any, for a given plugin.
 *
 * @param target An `EmberApp` or `Addon` instance whose configuration should be checked
 * @param plugin The name of the plugin to be located
 */
export function findPlugin(target: ConfigurationTarget, plugin: string): BabelPluginConfig | undefined {
  let plugins = getPluginsArray(target);
  let index = findPluginIndex(target, plugin);
  return plugins[index];
}

/**
 * Indicates whether the given plugin is already present in the target's configuration.
 *
 * @param target An `EmberApp` or `Addon` instance whose configuration should be checked
 * @param plugin The name of the plugin to be located
 */
export function hasPlugin(target: ConfigurationTarget, plugin: string): boolean {
  return !!findPlugin(target, plugin);
}

export interface AddPluginOptions {
  /**
   * Any plugins that the given one must appear *before* in the plugins array.
   */
  before?: string[];

  /**
   * Any plugins that the given one must appear *after* in the plugins array.
   */
  after?: string[];
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
    throw new Error(`Unable to satisfy placement constraints for Babel plugin ${resolvePluginName(plugin)}`);
  }

  let plugins = getPluginsArray(target);
  let targetIndex = Number.isFinite(latest) ? latest : Number.isFinite(earliest) ? earliest : plugins.length;

  plugins.splice(targetIndex, 0, plugin);
}

function findPluginIndices(target: ConfigurationTarget, plugins: string[] = []): number[] {
  let pluginIndices = plugins.map(name => (name ? findPluginIndex(target, name) : -1));
  return pluginIndices.filter(index => index >= 0);
}
