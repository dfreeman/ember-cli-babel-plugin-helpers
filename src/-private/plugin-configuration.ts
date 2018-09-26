import { ConfigurationTarget, BabelPluginConfig } from '..';
import { normalizePluginName, resolvePluginName } from './plugin-names';

export function getPluginsArray(target: ConfigurationTarget): BabelPluginConfig[] {
  let options = target.options || (target.options = {});
  let babel = options.babel || (options.babel = {});
  return babel.plugins || (babel.plugins = []);
}

export function findPluginIndex(target: ConfigurationTarget, plugin: string): number {
  let pluginName = normalizePluginName(plugin);
  let plugins = getPluginsArray(target);
  return plugins.findIndex(candidate => resolvePluginName(candidate) === pluginName);
}
