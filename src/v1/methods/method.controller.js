import actionsList from "../core/methods.list.js";
import actionConfigs from "../core/methods.config.js";
import GithubProvider from "../services/github/github.provider.js";

const providers = {
  github: new GithubProvider(),
};

export const getMethodList = (req, res) => {
  res.json({
    status: "success",
    data: actionsList,
  });
};

export const getMethodConfig = (req, res) => {
  try {
    const { actionName } = req.params;
    // TODO: See if we need to implement different configs for each provider
    // TODO: or making the configs provider based

    const method = actionsList.find((a) => a.actionName === actionName);
    if (!method) {
      throw new Error("");
    }

    const configs = actionConfigs.methods.find(
      (act) => act.name === actionName
    );
    if (!configs) {
      return res.status(404).json({
        status: "error",
        message: "Configuration not found for this method",
      });
    }

    res.json({
      status: "success",
      data: {
        ...configs,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      message: "Method not found",
    });
  }
};

export const executeMethod = async (req, res, next) => {
  try {
    const { actionName } = req.params;

    const provider = "github";

    const method = actionsList.find((a) => a.actionName === actionName);
    if (!method) {
      return res.status(404).json({
        status: "error",
        message: "Method not found",
      });
    }

    const providerInstance = providers[provider];
    if (!providerInstance) {
      return res.status(400).json({
        status: "error",
        message: "Provider not supported",
      });
    }

    // We always need to init() the providers to make sure everything is set-up
    await providerInstance.init();

    const result = await providerInstance.executeMethod(actionName, req.body);

    res.json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
