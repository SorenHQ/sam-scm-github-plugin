import { Router } from "express";
import * as actionController from "./methods/method.controller.js";
import ConfigManager from "./core/ConfigManager.js";

const router = Router();

// Getting Version and Configs of Plugin
router.get("/version", async (req, res, next) => {
  try {
    const configs = await ConfigManager.loadConfigs();

    res.json(configs);
  } catch (error) {
    next(error);
  }
});

// Setting Version and Configs of Plugin
router.post("/version", async (req, res, next) => {
  try {
    const currentConfigs = await ConfigManager.loadConfigs();
    const updatedConfigs = { ...currentConfigs };
    const postedConfigs = req.body;

    // Update only the values in init_config params
    updatedConfigs.init_config = postedConfigs.init_config;

    await ConfigManager.saveConfigs(updatedConfigs);

    res.json(updatedConfigs);
  } catch (error) {
    next(error);
  }
});

// Method routes
router.get("/methods", actionController.getMethodList);

// Get Configs of Methods
router.get("/methods/:actionName", actionController.getMethodConfig);

// Post (request) Methods with Configs
router.post("/methods/:actionName", actionController.executeMethod);

export default router;
