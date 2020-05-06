"use strict";

/**
 * BasicSettingsTables controller.
 * @class BasicSettingsTablesController
 *
 * @author Marcos Vinicius [marcos.araujo@inpe.br]
 *
 * @property {object} memberPath - 'path module'.
 * @property {object} memberFs - 'filesystem module'.
 * @property {object} tablesJSON - 'path to tables.json file'.
 * @property {object} tablesConfigurations - 'tables.json in memory'.
 */
var BasicSettingsTablesController = function(app) {
  // 'path' module
  var memberPath = require('path');

  // 'fs' module
  var memberFs = require('fs');

  // 'Config path'
  var tablesJSON = memberPath.join(__dirname, '../../configurations/Tables.json');
  var tablesConfigurations = JSON.parse(memberFs.readFileSync(tablesJSON, 'utf8'));

  /**
   * Processes the request and returns a response.
   * @param {json} request - JSON containing the request data
   * @param {json} response - JSON containing the response data
   *
   * @function basicSettingsController
   * @memberof BasicSettingsController
   * @inner
   */
  var basicSettingsTablesController = function(request, response) {
    var data = {
      content: 'pages/basicSettingsTables',
      currentPage: 'BasicSettingsTables',
      mainTitle: 'Configurações do Tables.json',
      tablesConfigurations: tablesConfigurations
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
  var updateBasicTablesSettings = function(request, response) {
    tablesConfigurations.Countries.Schema = (request.body.CountriesSchema != "" ? request.body.CountriesSchema : null);
    tablesConfigurations.Countries.TableName = (request.body.CountriesTableName != "" ? request.body.CountriesTableName : null);
    tablesConfigurations.Countries.IdFieldName =  (request.body.CountriesIdFieldName != "" ? request.body.CountriesIdFieldName : null);
    tablesConfigurations.Countries.NameFieldName = (request.body.CountriesNameFieldName != "" ? request.body.CountriesNameFieldName : null);
    tablesConfigurations.Countries.BdqNameFieldName = (request.body.CountriesBdqNameFieldName != "" ? request.body.CountriesBdqNameFieldName : null);
    tablesConfigurations.Countries.GeometryFieldName = (request.body.CountriesGeometryFieldName != "" ? request.body.CountriesGeometryFieldName : null);

    tablesConfigurations.States.Schema = (request.body.StatesSchema != "" ? request.body.StatesSchema : null);
    tablesConfigurations.States.TableName = (request.body.StatesTableName != "" ? request.body.StatesTableName : null);
    tablesConfigurations.States.IdFieldName =  (request.body.StatesIdFieldName != "" ? request.body.StatesIdFieldName : null);
    tablesConfigurations.States.NameFieldName = (request.body.StatesNameFieldName != "" ? request.body.StatesNameFieldName : null);
    tablesConfigurations.States.BdqNameFieldName = (request.body.StatesBdqNameFieldName != "" ? request.body.StatesBdqNameFieldName : null);
    tablesConfigurations.States.GeometryFieldName = (request.body.StatesGeometryFieldName != "" ? request.body.StatesGeometryFieldName : null);
    tablesConfigurations.States.CountryIdFieldName = (request.body.StatesCountryIdFieldName != "" ? request.body.StatesCountryIdFieldName : null);
    
    tablesConfigurations.Cities.Schema = (request.body.CitiesSchema != "" ? request.body.CitiesSchema : null);
    tablesConfigurations.Cities.TableName = (request.body.CitiesTableName != "" ? request.body.CitiesTableName : null);
    tablesConfigurations.Cities.IdFieldName =  (request.body.CitiesIdFieldName != "" ? request.body.CitiesIdFieldName : null);
    tablesConfigurations.Cities.NameFieldName = (request.body.CitiesNameFieldName != "" ? request.body.CitiesNameFieldName : null);
    tablesConfigurations.Cities.BdqNameFieldName = (request.body.CitiesBdqNameFieldName != "" ? request.body.CitiesBdqNameFieldName : null);
    tablesConfigurations.Cities.GeometryFieldName = (request.body.CitiesGeometryFieldName != "" ? request.body.CitiesGeometryFieldName : null);
    tablesConfigurations.Cities.StateIdFieldName = (request.body.CitiesStateIdFieldName != "" ? request.body.CitiesStateIdFieldName : null);

    tablesConfigurations.Biomes.Schema = (request.body.BiomesSchema != "" ? request.body.BiomesSchema : null);
    tablesConfigurations.Biomes.TableName = (request.body.BiomesTableName != "" ? request.body.BiomesTableName : null);
    tablesConfigurations.Biomes.IdFieldName =  (request.body.BiomesIdFieldName != "" ? request.body.BiomesIdFieldName : null);
    tablesConfigurations.Biomes.NameFieldName = (request.body.BiomesNameFieldName != "" ? request.body.BiomesNameFieldName : null);
    tablesConfigurations.Biomes.GeometryFieldName = (request.body.BiomesGeometryFieldName != "" ? request.body.BiomesGeometryFieldName : null);

    tablesConfigurations.UCF.Schema = (request.body.UCFSchema != "" ? request.body.UCFSchema : null);
    tablesConfigurations.UCF.TableName = (request.body.UCFTableName != "" ? request.body.UCFTableName : null);
    tablesConfigurations.UCF.IdFieldName =  (request.body.UCFIdFieldName != "" ? request.body.UCFIdFieldName : null);
    tablesConfigurations.UCF.NameFieldName = (request.body.UCFNameFieldName != "" ? request.body.UCFNameFieldName : null);
    tablesConfigurations.UCF.GeometryFieldName = (request.body.UCFGeometryFieldName != "" ? request.body.UCFGeometryFieldName : null);

    tablesConfigurations.Fires.Schema = (request.body.FiresSchema != "" ? request.body.FiresSchema : null);
    tablesConfigurations.Fires.TableName = (request.body.FiresTableName != "" ? request.body.FiresTableName : null);
    tablesConfigurations.Fires.IdFieldName =  (request.body.FiresIdFieldName != "" ? request.body.FiresIdFieldName : null);
    tablesConfigurations.Fires.DateTimeFieldName = (request.body.FiresDateTimeFieldName != "" ? request.body.FiresDateTimeFieldName : null);
    tablesConfigurations.Fires.SatelliteFieldName = (request.body.FiresSatelliteFieldName != "" ? request.body.FiresSatelliteFieldName : null);
    tablesConfigurations.Fires.CountryFieldName = (request.body.FiresCountryFieldName != "" ? request.body.FiresCountryFieldName : null);
    tablesConfigurations.Fires.StateFieldName = (request.body.FiresStateFieldName != "" ? request.body.FiresStateFieldName : null);
    tablesConfigurations.Fires.CityFieldName = (request.body.FiresCityFieldName != "" ? request.body.FiresCityFieldName : null);
    tablesConfigurations.Fires.BiomeIdFieldName = (request.body.FiresBiomeIdFieldName != "" ? request.body.FiresBiomeIdFieldName : null);
    tablesConfigurations.Fires.BiomeFieldName = (request.body.FiresBiomeFieldName != "" ? request.body.FiresBiomeFieldName : null);
    tablesConfigurations.Fires.DateFormat = (request.body.FiresDateFormat != "" ? request.body.FiresDateFormat : null);
    tablesConfigurations.Fires.GeometryFieldName = (request.body.FiresGeometryFieldName != "" ? request.body.FiresGeometryFieldName : null);
   
    memberFs.writeFile(tablesJSON, JSON.stringify(tablesConfigurations, null, 2), 'utf8', function(err) {
      if (err) throw err;
      console.log('tables.json file updated!');
    });

    response.redirect(BASE_URL + 'admin/basic-settings-tables');
  };

  return {
    basicSettingsTablesController: basicSettingsTablesController,
    updateBasicTablesSettings: updateBasicTablesSettings
  };
};

module.exports = BasicSettingsTablesController;
