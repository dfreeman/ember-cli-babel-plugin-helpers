import { ConfigurationTarget, BabelPluginConfig } from '..';
import { normalizePluginName, resolvePluginName } from './plugin-names';

export function getPluginsArray(target: ConfigurationTarget | BabelPluginConfig[]): BabelPluginConfig[] {
  if (Array.isArray(target)) {
    return target;
  }

  let options = target.options || (target.options = {});
  let babel = options.babel || (options.babel = {});
  return babel.plugins || (babel.plugins = []);
}

export function findPluginIndex(plugins: BabelPluginConfig[], plugin: string): number {
  let pluginName = normalizePluginName(plugin);
  return plugins.findIndex(candidate => resolvePluginName(candidate) === pluginName);
}
