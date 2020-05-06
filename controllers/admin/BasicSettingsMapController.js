"use strict";

/**
 * BasicSettingsMap controller.
 * @class BasicSettingsmAPController
 *
 * @author Marcos Vinicius [marcos.araujo@inpe.br]
 *
 * @property {object} memberPath - 'path module'.
 * @property {object} memberFs - 'filesystem module'.
 * @property {object} mapJSON - 'path to map.json file'.
 * @property {object} mapConfigurations - 'map.json in memory'.
 */
var BasicSettingsMapController = function(app) {
  // 'path' module
  var memberPath = require('path');

  // 'fs' module
  var memberFs = require('fs');

  // 'Config path'
  var mapJSON = memberPath.join(__dirname, '../../configurations/Map.json');
  var mapConfigurations = JSON.parse(memberFs.readFileSync(mapJSON, 'utf8'));

  /**
   * Processes the request and returns a response.
   * @param {json} request - JSON containing the request data
   * @param {json} response - JSON containing the response data
   *
   * @function basicSettingsController
   * @memberof BasicSettingsController
   * @inner
   */
  var basicSettingsMapController = function(request, response) {
    var data = {
      content: 'pages/basicSettingsMap',
      currentPage: 'BasicSettingsMap',
      mainTitle: 'Configurações Básicas do Map.json',
      mapConfigurations: mapConfigurations
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
  var updateBasicMapSettings = function(request, response) {
    var FocosLayerId = (request.body.FocosLayerId != "" ? request.body.FocosLayerId : null),
        CountriesLayerId = (request.body.CountriesLayerId != "" ? request.body.CountriesLayerId : null),
        StatesLayerId = (request.body.StatesLayerId != "" ? request.body.StatesLayerId : null),
        CitiesLayerId = (request.body.CitiesLayerId != "" ? request.body.CitiesLayerId : null),
        BiomesLayerId = (request.body.BiomesLayerId != "" ? request.body.BiomesLayerId : null),
        UcfsLayerId = (request.body.UcfsLayerId != "" ? request.body.UcfsLayerId : null);

    mapConfigurations.Layers[0].Id = FocosLayerId;
    mapConfigurations.Layers[1].Id = CountriesLayerId;
    mapConfigurations.Layers[2].Id = StatesLayerId;
    mapConfigurations.Layers[3].Id = CitiesLayerId;
    mapConfigurations.Layers[4].Id = BiomesLayerId;
    mapConfigurations.Layers[5].Id = UcfsLayerId;

    memberFs.writeFile(mapJSON, JSON.stringify(mapConfigurations, null, 2), 'utf8', function(err) {
      if (err) throw err;
      console.log('map.json file updated!');
    });

    response.redirect(BASE_URL + 'admin/basic-settings-map');
  };

  return {
    basicSettingsMapController: basicSettingsMapController,
    updateBasicMapSettings: updateBasicMapSettings
  };
};

module.exports = BasicSettingsMapController;
