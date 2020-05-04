"use strict";

/**
 * Exportation model, which contains exportation related database manipulations.
 * @class Exportation
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberPath - 'path' module.
 * @property {object} memberPgFormat - 'pg-format' module.
 * @property {json} memberTablesConfig - Tables configuration.
 * @property {json} memberAttributesTableConfig - Attributes table configuration.
 * @property {object} memberDatabaseConfigurations - Database configurations.
 * @property {object} memberApplicationConfigurations - Application configurations.
 * @property {object} memberUtils - 'Utils' model.
 * @property {object} memberPgPool - PostgreSQL connection pool.
 */
var Exportation = function() {

  // 'path' module
  var memberPath = require('path');
  // 'pg-format' module
  var memberPgFormat = require('pg-format');
  // Tables configuration
  var memberTablesConfig = require(memberPath.join(__dirname, '../configurations/Tables.json'));
  // Attributes table configuration
  var memberAttributesTableConfig = require(memberPath.join(__dirname, '../configurations/AttributesTable.json'));
  // Database configurations
  var memberDatabaseConfigurations = require(memberPath.join(__dirname, '../configurations/Database.json'));
  // Application configurations
  var memberApplicationConfigurations = require(memberPath.join(__dirname, '../configurations/Application.json'));
  // 'Utils' model
  var memberUtils = new (require('./Utils.js'))();
  // PostgreSQL connection pool
  var memberPgPool = require('../pg');

  /**
   * Callback of the database operations.
   * @callback Graphics~databaseOperationCallback
   * @param {error} err - Error
   * @param {json} result - Result of the operation
   */

   /**
    * Returns the PostgreSQL connection string.
    * @returns {string} connectionString - PostgreSQL connection string
    *
    * @function getPgConnectionString
    * @memberof Exportation
    * @inner
    */
   this.getPgConnectionString = function() {
     var connectionString = "PG:host=" + memberDatabaseConfigurations.Host + " port=" + memberDatabaseConfigurations.Port + " user=" + memberDatabaseConfigurations.User + " dbname=" + memberDatabaseConfigurations.Database + " password=" +memberDatabaseConfigurations.Password;

     return connectionString;
   };

   /**
    * Returns the ogr2ogr application string.
    * @returns {string} ogr2ogr - ogr2ogr application
    *
    * @function ogr2ogr
    * @memberof Exportation
    * @inner
    */
   this.ogr2ogr = function() {
     var ogr2ogr = memberApplicationConfigurations.OGR2OGR;

     return ogr2ogr;
   };

  /**
   * Returns the fires data in GeoJSON format.
   * @param {string} dateTimeFrom - Initial date / time
   * @param {string} dateTimeTo - Final date / time
   * @param {json} options - Filtering options
   * @param {databaseOperationCallback} callback - Callback function
   * @returns {databaseOperationCallback} callback - Execution of the callback function, which will process the received data
   *
   * @function getGeoJSONData
   * @memberof Exportation
   * @inner
   */
  this.getGeoJSONData = function(dateTimeFrom, dateTimeTo, options, callback) {
    // Counter of the query parameters
    var parameter = 1;

    // Setting of the query columns string
    var columns = "";
    for(var i = 0, columnsLength = memberAttributesTableConfig.Columns.length; i < columnsLength; i++) {
      var columnName = (memberAttributesTableConfig.Columns[i].TableAlias !== null ? memberAttributesTableConfig.Columns[i].TableAlias + "." + memberAttributesTableConfig.Columns[i].Name : memberAttributesTableConfig.Columns[i].Name);

      if(memberAttributesTableConfig.Columns[i].Name !== "geom")
        columns += columnName + (memberAttributesTableConfig.Columns[i].ExportAlias !== null && memberAttributesTableConfig.Columns[i].ExportAlias !== "" ? " as \"" + memberAttributesTableConfig.Columns[i].ExportAlias + "\", " : ", ");
    }
    columns = columns.substring(0, (columns.length - 2));

    // Connection with the PostgreSQL database
    memberPgPool.connect(function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select ST_AsGeoJSON(" + memberTablesConfig.Fires.GeometryFieldName + ")::json as geometry, row_to_json((select columns from (select " +
                    columns + ") as columns)) as properties from " + memberTablesConfig.Fires.Schema + "." +
                    memberTablesConfig.Fires.TableName + " FiresTable where (FiresTable." + memberTablesConfig.Fires.DateTimeFieldName +
                    " between $" + (parameter++) + " and $" + (parameter++) + ")",
            params = [dateTimeFrom, dateTimeTo];

        options.exportFilter = true;
        options.tableAlias = "FiresTable";

        var getFiltersResult = memberUtils.getFilters(options, query, params, parameter);

        query = getFiltersResult.query;
        params = getFiltersResult.params;
        parameter = getFiltersResult.parameter;

        // If the 'options.limit' parameter exists, a limit clause is created
        if(options.limit !== undefined) {
          query += " limit " + options.limit;
        }

        // Execution of the query
        client.query(query, params, function(err, result) {
          done();
          if(!err) return callback(null, result);
          else return callback(err);
        });
      } else return callback(err);
    });
  };

  /**
   * Returns the query accordingly with the received parameters.
   * @param {boolean} selectGeometry - Flag that indicates if the geometry field should be selected
   * @param {string} dateTimeFrom - Initial date / time
   * @param {string} dateTimeTo - Final date / time
   * @param {json} options - Filtering options
   * @returns {string} finalQuery - Query
   *
   * @function getQuery
   * @memberof Exportation
   * @inner
   */
  this.getQuery = function(selectGeometry, dateTimeFrom, dateTimeTo, options) {
    
    // Setting of the query columns string
    var columns = "";
    for(var i = 0, columnsLength = memberAttributesTableConfig.Columns.length; i < columnsLength; i++) {
      var columnName = (memberAttributesTableConfig.Columns[i].TableAlias !== null ? memberAttributesTableConfig.Columns[i].TableAlias + "." + memberAttributesTableConfig.Columns[i].Name : memberAttributesTableConfig.Columns[i].Name);
      columnName = (memberAttributesTableConfig.Columns[i].UnaccentAtExportation ? "unaccent(" + columnName + ")" : columnName);
      var alias = (memberAttributesTableConfig.Columns[i].ExportAlias !== null && memberAttributesTableConfig.Columns[i].ExportAlias !== "" ? " as \"" + memberAttributesTableConfig.Columns[i].ExportAlias + "\"" : " as " + memberAttributesTableConfig.Columns[i].Name);

      if(memberAttributesTableConfig.Columns[i].Name !== memberTablesConfig.Fires.GeometryFieldName) {
        if(memberTablesConfig.Fires.DateTimeFieldName == memberAttributesTableConfig.Columns[i].Name)
          columns += "TO_CHAR(" + columnName + ", 'YYYY/MM/DD HH24:MI:SS')" + alias + ", ";
        else
          columns += columnName + alias + ", ";
      }
    }

    columns = columns.substring(0, (columns.length - 2));

    if(selectGeometry)
      columns += ", FiresTable." + memberTablesConfig.Fires.GeometryFieldName;

    // Creation of the query
    var query = "select " + columns + " from " + memberTablesConfig.Fires.Schema + "." + memberTablesConfig.Fires.TableName + " FiresTable where (FiresTable." + memberTablesConfig.Fires.DateTimeFieldName + " between %L and %L)",
        params = [dateTimeFrom, dateTimeTo];

    options.exportFilter = true;
    options.pgFormatQuery = true;
    options.tableAlias = "FiresTable";

    var getFiltersResult = memberUtils.getFilters(options, query, params);

    query = getFiltersResult.query;
    params = getFiltersResult.params;

    query += " order by FiresTable." + memberTablesConfig.Fires.DateTimeFieldName;

    // If the 'options.limit' parameter exists, a limit clause is created
    if(options.limit !== undefined) {
      query += " limit " + options.limit;
    }

    params.splice(0, 0, query);

    var finalQuery = memberPgFormat.apply(null, params);

    return finalQuery;
  };
};

module.exports = Exportation;
