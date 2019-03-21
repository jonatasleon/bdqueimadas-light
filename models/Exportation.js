// 'path' module
const path = require('path');
// 'pg-format' module
const pgFormat = require('pg-format');
// Tables configuration
const tablesConfig = require(path.join(__dirname, '../configurations/Tables.json'));
// Attributes table configuration
const attributesTableConfig = require(path.join(__dirname, '../configurations/AttributesTable.json'));
// Database configurations
const databaseConfig = require(path.join(__dirname, '../configurations/Database.json'));
// Application configurations
const applicationConfig = require(path.join(__dirname, '../configurations/Application.json'));
// PostgreSQL connection pool
const pgPool = require('../pg');
// 'Utils' model
const Utils = require('./Utils');

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
const Exportation = function () {
  const utils = new Utils();
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
  this.getPgConnectionString = function () {
    const connectionString = `PG:host=${databaseConfig.Host} port=${databaseConfig.Port} user=${databaseConfig.User} dbname=${databaseConfig.Database}`;

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
  this.ogr2ogr = function () {
    const ogr2ogr = applicationConfig.OGR2OGR;

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
  this.getGeoJSONData = function (dateTimeFrom, dateTimeTo, options, callback) {
    // Counter of the query parameters
    let parameterAux = 1;

    // Setting of the query columns string
    let columns = '';
    for (let i = 0, columnsLength = attributesTableConfig.Columns.length; i < columnsLength; i++) {
      const columnName = (attributesTableConfig.Columns[i].TableAlias !== null ? `${attributesTableConfig.Columns[i].TableAlias}.${attributesTableConfig.Columns[i].Name}` : attributesTableConfig.Columns[i].Name);

      if (attributesTableConfig.Columns[i].Name !== 'geom') columns += columnName + (attributesTableConfig.Columns[i].ExportAlias !== null && attributesTableConfig.Columns[i].ExportAlias !== '' ? ` as "${attributesTableConfig.Columns[i].ExportAlias}", ` : ', ');
    }
    columns = columns.substring(0, (columns.length - 2));

    // Connection with the PostgreSQL database
    pgPool.connect((err, client, done) => {
      if (!err) {
        // Creation of the query
        const queryAux = `select ST_AsGeoJSON(${tablesConfig.Fires.GeometryFieldName})::json as geometry, row_to_json((select columns from (select ${
          columns}) as columns)) as properties from ${tablesConfig.Fires.Schema}.${
          tablesConfig.Fires.TableName} FiresTable where (FiresTable.${tablesConfig.Fires.DateTimeFieldName
        } between $${parameterAux++} and $${parameterAux++})`;
        const paramsAux = [dateTimeFrom, dateTimeTo];

        options.exportFilter = true;
        options.tableAlias = 'FiresTable';

        const getFiltersResult = utils.getFilters(options, queryAux, paramsAux, parameterAux);

        let { query } = getFiltersResult;
        const { params } = getFiltersResult;

        // If the 'options.limit' parameter exists, a limit clause is created
        if (options.limit !== undefined) {
          query += ` limit ${options.limit}`;
        }

        // Execution of the query
        client.query(query, params, (err, result) => {
          done();
          if (!err) return callback(null, result);
          return callback(err);
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
  this.getQuery = function (selectGeometry, dateTimeFrom, dateTimeTo, options) {
    // Setting of the query columns string
    let columns = '';

    for (let i = 0, columnsLength = attributesTableConfig.Columns.length; i < columnsLength; i++) {
      let columnName = (attributesTableConfig.Columns[i].TableAlias !== null ? `${attributesTableConfig.Columns[i].TableAlias}.${attributesTableConfig.Columns[i].Name}` : attributesTableConfig.Columns[i].Name);
      columnName = (attributesTableConfig.Columns[i].UnaccentAtExportation ? `unaccent(${columnName})` : columnName);
      const alias = (attributesTableConfig.Columns[i].ExportAlias !== null && attributesTableConfig.Columns[i].ExportAlias !== '' ? ` as "${attributesTableConfig.Columns[i].ExportAlias}"` : ` as ${attributesTableConfig.Columns[i].Name}`);

      if (attributesTableConfig.Columns[i].Name !== tablesConfig.Fires.GeometryFieldName) {
        if (tablesConfig.Fires.DateTimeFieldName == attributesTableConfig.Columns[i].Name) columns += `TO_CHAR(${columnName}, 'YYYY/MM/DD HH24:MI:SS')${alias}, `;
        else columns += `${columnName + alias}, `;
      }
    }

    columns = columns.substring(0, (columns.length - 2));

    if (selectGeometry) columns += `, FiresTable.${tablesConfig.Fires.GeometryFieldName}`;

    // Creation of the query
    const queryAux = `select ${columns} from ${tablesConfig.Fires.Schema}.${tablesConfig.Fires.TableName} FiresTable where (FiresTable.${tablesConfig.Fires.DateTimeFieldName} between %L and %L)`;
    const paramsAux = [dateTimeFrom, dateTimeTo];

    options.exportFilter = true;
    options.pgFormatQuery = true;
    options.tableAlias = 'FiresTable';

    const getFiltersResult = utils.getFilters(options, queryAux, paramsAux);

    let { query, params } = getFiltersResult;

    query += ` order by FiresTable.${tablesConfig.Fires.DateTimeFieldName}`;

    // If the 'options.limit' parameter exists, a limit clause is created
    if (options.limit !== undefined) {
      query += ` limit ${options.limit}`;
    }

    params.splice(0, 0, query);

    const finalQuery = pgFormat(...params);

    return finalQuery;
  };
};

module.exports = Exportation;
