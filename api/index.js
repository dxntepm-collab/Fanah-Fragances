const app = require("../artifacts/api-server/dist/index.mjs").default;

module.exports = (req, res) => {
  return app(req, res);
};
