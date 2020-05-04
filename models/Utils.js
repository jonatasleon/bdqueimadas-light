"use strict";

/**
 * Utilities class of the BDQueimadas (server side).
 * @class Utils
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} self - Object that refers to the 'Utils' instance.
 * @property {object} memberPath - 'path' module.
 * @property {object} memberPgFormat - 'pg-format' module.
 * @property {object} memberFs - 'fs' module.
 * @property {object} memberRimraf - 'rimraf' module.
 * @property {json} memberTablesConfig - Tables configuration.
 */
var Utils = function() {

  // Object that refers to the 'Utils' instance
  var self = this;
  // 'path' module
  var memberPath = require('path');
  // 'pg-format' module
  var memberPgFormat = require('pg-format');
  // 'fs' module
  var memberFs = require('fs');
  // 'rimraf' module
  var memberRimraf = require('rimraf');
  // Tables configuration
  var memberTablesConfig = require(memberPath.join(__dirname, '../configurations/Tables.json'));

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
  this.getFilters = function(options, query, params, parameter, filterRules) {
    // If the 'options.satellites' parameter exists, a satellites 'where' clause is created
    if(options.satellites !== undefined) {
      var satellitesArray = options.satellites.split(',');
      query += " and " + (options.tableAlias !== undefined ? options.tableAlias + "." : "") + memberTablesConfig.Fires.SatelliteFieldName + " in (";

      for(var i = 0, satellitesArrayLength = satellitesArray.length; i < satellitesArrayLength; i++) {
        if(options.pgFormatQuery !== undefined) query += "%L,";
        else query += "$" + (parameter++) + ",";
        params.push(satellitesArray[i]);
      }

      query = query.substring(0, (query.length - 1)) + ")";
    }

    // If the 'options.biomes' parameter exists, a biomes 'where' clause is created
    if(options.biomes !== undefined) {
      var biomesArray = options.biomes.split(',');
      query += " and (" + (options.tableAlias !== undefined ? options.tableAlias + "." : "") + memberTablesConfig.Fires.BiomeIdFieldName + " in (";

      for(var i = 0, biomesArrayLength = biomesArray.length; i < biomesArrayLength; i++) {
        if(options.pgFormatQuery !== undefined) query += "%L,";
        else query += "$" + (parameter++) + ",";
        params.push(biomesArray[i]);
      }

      query = query.substring(0, (query.length - 1)) + "))";
    }

    // If the 'options.countries' parameter exists, a countries 'where' clause is created
    if(options.countries !== undefined && (filterRules === undefined || filterRules === null || filterRules.ignoreCountryFilter === undefined || !filterRules.ignoreCountryFilter)) {
      var countriesArray = options.countries.split(',');

      query += " and (" + (options.tableAlias !== undefined ? options.tableAlias + "." : "") + memberTablesConfig.Fires.CountryFieldName + " in (";

      for(var i = 0, countriesArrayLength = countriesArray.length; i < countriesArrayLength; i++) {
        if(options.pgFormatQuery !== undefined) query += "%L,";
        else query += "$" + (parameter++) + ",";
        params.push(countriesArray[i]);
      }

      query = query.substring(0, (query.length - 1)) + "))";
    }

    var filterStates = (options.states !== undefined && (filterRules === undefined || filterRules === null || filterRules.ignoreStateFilter === undefined || !filterRules.ignoreStateFilter));

    // If the 'options.states' parameter exists, a states 'where' clause is created
    if(filterStates) {
      var statesArray = typeof(options.states) === "string" ? options.states.split(',') : options.states;
      query += " and (" + (options.tableAlias !== undefined ? options.tableAlias + "." : "") + memberTablesConfig.Fires.StateFieldName + " in (";

      for(var i = 0, statesArrayLength = statesArray.length; i < statesArrayLength; i++) {
        if(options.pgFormatQuery !== undefined) query += "%L,";
        else query += "$" + (parameter++) + ",";
        params.push(statesArray[i]);
      }

      query = query.substring(0, (query.length - 1)) + "))";
    }

    // If the 'options.cities' parameter exists, a cities 'where' clause is created
    if(options.cities !== undefined && (filterRules === undefined || filterRules === null || filterRules.ignoreCityFilter === undefined || !filterRules.ignoreCityFilter)) {
      var citiesArray = options.cities.split(',');
      query += " and (" + (options.tableAlias !== undefined ? options.tableAlias + "." : "") + memberTablesConfig.Fires.CityFieldName + " in (";

      for(var i = 0, citiesArrayLength = citiesArray.length; i < citiesArrayLength; i++) {
        if(options.pgFormatQuery !== undefined) query += "%L,";
        else query += "$" + (parameter++) + ",";
        params.push(citiesArray[i]);
      }

      query = query.substring(0, (query.length - 1)) + "))";
    }

    // If the 'options.extent' parameter exists, a extent 'where' clause is created
    if(options.extent !== undefined) {
      if(options.pgFormatQuery !== undefined) query += " and ST_Intersects(" + (options.tableAlias !== undefined ? options.tableAlias + "." : "") + memberTablesConfig.Fires.GeometryFieldName + ", ST_MakeEnvelope(%L, %L, %L, %L, 4326))";
      else query += " and ST_Intersects(" + (options.tableAlias !== undefined ? options.tableAlias + "." : "") + memberTablesConfig.Fires.GeometryFieldName + ", ST_MakeEnvelope($" + (parameter++) + ", $" + (parameter++) + ", $" + (parameter++) + ", $" + (parameter++) + ", 4326))";
      params.push(options.extent[0], options.extent[1], options.extent[2], options.extent[3]);
    }

    return {
      query: query,
      params: params,
      parameter: parameter
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
  this.stringInArray = function(array, string) {
    if(array !== null) {
      for(var i = 0, arrayLength = array.length; i < arrayLength; i++) {
        if(array[i].toString() === string.toString())
          return true;
      }
    }

    return false;
  };

  /**
   * 
   * @param {obj} obj - Object to parse
   * @returns {obj} Parsed object
   * 
   * @function parseToBool
   * @memberof Utils
   * @inner
   */
  this.parseToBool = function (obj) {
    var map = Object.create(null);
    map['true'] = true;
    map['false'] = false;
    function deepParseBool(obj) {
      var k,
      has = Object.prototype.hasOwnProperty.bind(obj);
    
      for (k in obj) if (has(k)) {
        switch (typeof obj[k]) {
          case 'object':
            deepParseBool(obj[k]); break;
          case 'string':
            if (obj[k].toLowerCase() in map) obj[k] = map[obj[k].toLowerCase()]
          }
      }
    }

    deepParseBool(obj);
    return obj;
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
  this.deleteFolderRecursively = function(path, callback) {
    if(memberFs.existsSync(path)) {
      try {
        memberRimraf(path, callback);
      } catch(e) {
        console.log(e);
      }
    }
  };
};

module.exports = Utils;
