import fs from "fs/promises";
import path from "path";
import AppError from "./errors/AppError.js";

class ConfigManager {
  constructor() {
    this.configPath = path.resolve(process.cwd(), "src/plugin.configs.json");
    this.configs = null;
    this.availableProviders = [];
  }

  validateConfigParams(providerConfig) {
    const requiredParams = providerConfig.init_config.filter(
      (item) => item.params.required
    );
    return requiredParams.every((param) => {
      return param.value && param.value.trim() !== "";
    });
  }

  async loadConfigs() {
    try {
      const configFile = await fs.readFile(this.configPath, "utf8");
      const parsedConfig = JSON.parse(configFile);
      this.configs = parsedConfig;

      return this.configs;
    } catch (error) {
      console.error("\n\n -- Plugin Loading Issue: ", error, "\n\n");

      throw new AppError(
        "Failed to load plugin configurations",
        500,
        "CONFIG_LOAD_ERROR"
      );
    }
  }

  async saveConfigs(newConfigs) {
    try {
      // Validate newConfig against our minimal requirements
      if (!this.validateConfigParams(newConfigs)) {
        throw new AppError(
          "Configuration must include a valid 'owner' and 'token'",
          400,
          "INVALID_CONFIG_PARAMS"
        );
      }

      // // We can write the new configs to the file to keep persistence but for now we only keep in memory
      // await fs.writeFile(this.configPath, JSON.stringify(newConfigs, null, 2));

      this.configs = newConfigs;

      return this.configs;
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error("\n\n -- Plugin Saving Issue: ", error, "\n\n");
      throw new AppError(
        "Failed to save plugin configurations",
        500,
        "CONFIG_SAVE_ERROR"
      );
    }
  }

  getConfig(name) {
    return this.configs?.init_config[0];
  }

  getAvailableProviders() {
    return this.availableProviders;
  }
}

export default new ConfigManager();
