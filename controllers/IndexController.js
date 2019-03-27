// 'path' module
const path = require('path');
// 'fs' module
const fs = require('fs');
// Filter model
const Filter = require('../models/Filter.js');

/**
 * Controller of the system index.
 * @class IndexController
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberPath - 'path' module.
 * @property {object} memberFs - 'fs' module.
 * @property {object} memberFilter - Filter model.
 */
const IndexController = function (app) {
  const filter = new Filter();
  /**
   * Processes the request and returns a response.
   * @param {json} request - JSON containing the request data
   * @param {json} response - JSON containing the response data
   *
   * @function indexController
   * @memberof IndexController
   * @inner
   */
  const indexController = function (request, response) {
    // Load of the configuration files to be sent to the front end
    const filterConfigurations = JSON.parse(fs.readFileSync(path.join(__dirname, '../configurations/Filter.json'), 'utf8'));
    const attributesTableConfigurations = JSON.parse(fs.readFileSync(path.join(__dirname, '../configurations/AttributesTable.json'), 'utf8'));
    const mapConfigurations = JSON.parse(fs.readFileSync(path.join(__dirname, '../configurations/Map.json'), 'utf8'));
    const graphicsConfigurations = JSON.parse(fs.readFileSync(path.join(__dirname, '../configurations/Graphics.json'), 'utf8'));
    const applicationConfigurations = JSON.parse(fs.readFileSync(path.join(__dirname, '../configurations/Application.json'), 'utf8'));
    const tablesConfigurations = JSON.parse(fs.readFileSync(path.join(__dirname, '../configurations/Tables.json'), 'utf8'));

    const configurations = {
      filterConfigurations,
      attributesTableConfigurations,
      mapConfigurations,
      graphicsConfigurations,
      applicationConfigurations,
      firesDateFormat: tablesConfigurations.Fires.DateFormat,
    };

    filter.getCountries()
      .then((result) => {
        filter.getBiomes()
          .then((resultBiomes) => {
            // Response parameters
            const params = {
              countries: result,
              biomes: resultBiomes,
              configurations,
            };

            // Response (page rendering)
            response.render('index', params);
          })
          .catch(console.error);
      }).catch(console.error);
  };

  return indexController;
};

module.exports = IndexController;
