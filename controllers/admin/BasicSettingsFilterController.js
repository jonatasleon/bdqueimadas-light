"use strict";

/**
 * BasicSettingsFilter controller.
 * @class BasicSettingsFilterController
 *
 * @author Marcos Vinicius [marcos.araujo@inpe.br]
 *
 * @property {object} memberPath - 'path module'.
 * @property {object} memberFs - 'filesystem module'.
 * @property {object} filterJSON - 'path to filter.json file'.
 * @property {object} filterConfigurations - 'filter.json in memory'.
 */
var BasicSettingsFilterController = function(app) {
  // 'path' module
  var memberPath = require('path');

  // 'fs' module
  var memberFs = require('fs');

  // 'Config path'
  var filterJSON = memberPath.join(__dirname, '../../configurations/Filter.json');
  var filterConfigurations = JSON.parse(memberFs.readFileSync(filterJSON, 'utf8'));

  /**
   * Processes the request and returns a response.
   * @param {json} request - JSON containing the request data
   * @param {json} response - JSON containing the response data
   *
   * @function basicSettingsController
   * @memberof BasicSettingsController
   * @inner
   */
  var basicSettingsFilterController = function(request, response) {
    var data = {
      content: 'pages/basicSettingsFilter',
      currentPage: 'BasicSettingsFilter',
      mainTitle: 'Configurações do Filter.json',
      filterConfigurations: filterConfigurations
    }

    response.render('admin/index', data);
  };

  /**
   * Processes the request and returns a response.
   * @param {json} request - JSON containing the request data
   * @param {json} response - JSON containing the response data
   *
   * @function updateBasicSettings
   * @memberof BasicSettingsController
   * @inner
   */
  var updateBasicFilterSettings = function(request, response) {
    var LayerToFilterLayerId = (request.body.LayerToFilterLayerId != "" ? request.body.LayerToFilterLayerId : null),
        CountriesLayerId = (request.body.CountriesLayerId != "" ? request.body.CountriesLayerId : null),
        StatesLayerId = (request.body.StatesLayerId != "" ? request.body.StatesLayerId : null),
        CitiesLayerId = (request.body.CitiesLayerId != "" ? request.body.CitiesLayerId : null),
        ProtectedAreasLayerName = (request.body.ProtectedAreasLayerName != "" ? request.body.ProtectedAreasLayerName : null);

    filterConfigurations.LayerToFilter.LayerId = LayerToFilterLayerId;
    filterConfigurations.CountriesLayer.Id = CountriesLayerId;
    filterConfigurations.StatesLayer.Id = StatesLayerId;
    filterConfigurations.CitiesLayer.Id = CitiesLayerId;
    filterConfigurations.ProtectedAreas.UCF.LayerName = ProtectedAreasLayerName;

    memberFs.writeFile(filterJSON, JSON.stringify(filterConfigurations, null, 2), 'utf8', function(err) {
      if (err) throw err;
      console.log('filter.json file updated!');
    });

    response.redirect(BASE_URL + 'admin/basic-settings-filter');
  };

  return {
    basicSettingsFilterController: basicSettingsFilterController,
    updateBasicFilterSettings: updateBasicFilterSettings
  };
};

module.exports = BasicSettingsFilterController;
