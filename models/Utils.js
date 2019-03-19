const fs = require('fs');
const rimraf = require('rimraf');

const tablesConfig = require('../configurations/Tables.json');

/**
 * Utilities class of the BDQueimadas (server side).
 * @class Utils
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} self - Object that refers to the 'Utils' instance.
 * @property {object} path - 'path' module.
 * @property {object} pgFormat - 'pg-format' module.
 * @property {object} fs - 'fs' module.
 * @property {object} rimraf - 'rimraf' module.
 * @property {json} tablesConfig - Tables configuration.
 */
const Utils = function () {
  /**
   * Creates and returns filters for the system queries.
   * @param {object} options - Filtering options
   * @param {string} query - Query
   * @param {array} params - Parameters array
   * @param {int} parameter - Parameters counter
   * @param {object} filterRules - Filter rules
   * @returns {object} {} - Object containing the query, the parameters array and the parameters counter
   *
   * @function getFilters
   * @memberof Utils
   * @inner
   */
  this.getFilters = function (options, query_, params, parameter, filterRules) {
    let query = `${query_}`;
    // If the 'options.satellites' parameter exists, a satellites 'where' clause is created
    if (options.satellites !== undefined) {
      const satellitesArray = options.satellites.split(',');
      query += ` and ${options.tableAlias !== undefined ? `${options.tableAlias}.` : ''}${tablesConfig.Fires.SatelliteFieldName} in (`;

      for (let i = 0, satellitesArrayLength = satellitesArray.length; i < satellitesArrayLength; i++) {
        if (options.pgFormatQuery !== undefined) query += '%L,';
        else query += `$${parameter++},`;
        params.push(satellitesArray[i]);
      }

      query = `${query.substring(0, (query.length - 1))})`;
    }

    // If the 'options.biomes' parameter exists, a biomes 'where' clause is created
    if (options.biomes !== undefined) {
      const biomesArray = options.biomes.split(',');
      query += ` and (${options.tableAlias !== undefined ? `${options.tableAlias}.` : ''}${tablesConfig.Fires.BiomeIdFieldName} in (`;

      for (let i = 0, biomesArrayLength = biomesArray.length; i < biomesArrayLength; i++) {
        if (options.pgFormatQuery !== undefined) query += '%L,';
        else query += `$${parameter++},`;
        params.push(biomesArray[i]);
      }

      query = `${query.substring(0, (query.length - 1))}))`;
    }

    // If the 'options.countries' parameter exists, a countries 'where' clause is created
    if (options.countries !== undefined && (filterRules === undefined || filterRules === null
        || filterRules.ignoreCountryFilter === undefined || !filterRules.ignoreCountryFilter)) {
      const countriesArray = options.countries.split(',');

      query += ` and (${options.tableAlias !== undefined ? `${options.tableAlias}.` : ''}${tablesConfig.Fires.CountryFieldName} in (`;

      for (let i = 0, countriesArrayLength = countriesArray.length; i < countriesArrayLength; i++) {
        if (options.pgFormatQuery !== undefined) query += '%L,';
        else query += `$${parameter++},`;
        params.push(countriesArray[i]);
      }

      query = `${query.substring(0, (query.length - 1))}))`;
    }

    const filterStates = (options.states !== undefined
        && (filterRules === undefined
            || filterRules === null || filterRules.ignoreStateFilter === undefined
            || !filterRules.ignoreStateFilter)
    );

    // If the 'options.states' parameter exists, a states 'where' clause is created
    if (filterStates) {
      const statesArray = options.states.split(',');
      query += ` and (${options.tableAlias !== undefined ? `${options.tableAlias}.` : ''}${tablesConfig.Fires.StateFieldName} in (`;

      for (let i = 0, statesArrayLength = statesArray.length; i < statesArrayLength; i++) {
        if (options.pgFormatQuery !== undefined) query += '%L,';
        else query += `$${parameter++},`;
        params.push(statesArray[i]);
      }

      query = `${query.substring(0, (query.length - 1))}))`;
    }

    // If the 'options.cities' parameter exists, a cities 'where' clause is created
    if (options.cities !== undefined && (filterRules === undefined || filterRules === null
        || filterRules.ignoreCityFilter === undefined || !filterRules.ignoreCityFilter)) {
      const citiesArray = options.cities.split(',');
      query += ` and (${options.tableAlias !== undefined ? `${options.tableAlias}.` : ''}${tablesConfig.Fires.CityFieldName} in (`;

      for (let i = 0, citiesArrayLength = citiesArray.length; i < citiesArrayLength; i++) {
        if (options.pgFormatQuery !== undefined) query += '%L,';
        else query += `$${parameter++},`;
        params.push(citiesArray[i]);
      }

      query = `${query.substring(0, (query.length - 1))}))`;
    }

    // If the 'options.extent' parameter exists, a extent 'where' clause is created
    if (options.extent !== undefined) {
      if (options.pgFormatQuery !== undefined) query += ` and ST_Intersects(${options.tableAlias !== undefined ? `${options.tableAlias}.` : ''}${tablesConfig.Fires.GeometryFieldName}, ST_MakeEnvelope(%L, %L, %L, %L, 4326))`;
      else query += ` and ST_Intersects(${options.tableAlias !== undefined ? `${options.tableAlias}.` : ''}${tablesConfig.Fires.GeometryFieldName}, ST_MakeEnvelope($${parameter++}, $${parameter++}, $${parameter++}, $${parameter++}, 4326))`;
      params.push(options.extent[0], options.extent[1], options.extent[2], options.extent[3]);
    }

    return {
      query,
      params,
      parameter,
    };
  };


  /**
   * Verifies if a string exists in an array.
   * @param {array} array - Array where the search will be performed
   * @param {string} string - String to be searched
   * @returns {boolean} boolean - Flag that indicates if the string exists in the array
   *
   * @function stringInArray
   * @memberof Utils
   * @inner
   */
  this.stringInArray = function (array, string) {
    if (array !== null) {
      for (let i = 0, arrayLength = array.length; i < arrayLength; i++) {
        if (array[i].toString() === string.toString()) return true;
      }
    }

    return false;
  };

  /**
   * Deletes a folder and all its content.
   * @param {string} path - Path to the folder
   * @param {function} callback - Callback function
   *
   * @function deleteFolderRecursively
   * @memberof Utils
   * @inner
   */
  this.deleteFolderRecursively = function (path, callback) {
    if (fs.existsSync(path)) {
      try {
        rimraf(path, callback);
      } catch (e) {
        console.log(e);
      }
    }
  };
};

module.exports = Utils;
