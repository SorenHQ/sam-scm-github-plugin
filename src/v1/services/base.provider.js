export default class BaseProvider {
  constructor(config) {
    this.config = config;
  }

  async executeMethod(actionName, params) {
    const actionMethod = this[`action${this.camelCase(actionName)}`];
    if (!actionMethod) {
      throw new Error(`Method ${actionName} not implemented`);
    }
    return actionMethod.call(this, params);
  }

  camelCase(str) {
    return str
      .split("-")
      .map((word, index) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");
  }
}
