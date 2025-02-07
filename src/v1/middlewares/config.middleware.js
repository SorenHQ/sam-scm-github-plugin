import ConfigManager from "../core/ConfigManager.js";

export const loadConfigs = async () => {
  if (!ConfigManager.configs) {
    await ConfigManager.loadConfigs();
  }
};
