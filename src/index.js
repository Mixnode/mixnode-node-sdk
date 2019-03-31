module.exports = (function () {
  const ApiClient = require('./ApiClient');
  const SQLClient = require('./api/SQLClient');

  exports = {
    /**
     * The SQLClient constructor.
     * @property {module:SQLClient}
     */
    SQLClient,

    /**
     * Optionally enable debugging
     * @param isDebug
     */
    setDebug(isDebug) {
      ApiClient.instance.isDebugMode = isDebug;
    }

  };

  return exports;
}());
