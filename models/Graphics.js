// 'path' module
const path = require('path');
// Tables configuration
const tablesConfig = require(path.join(__dirname, '../configurations/Tables.json'));
// 'Utils' model
const Utils = require('./Utils');
// PostgreSQL connection pool
const { sequelize } = require('../pg');

/**
 * Graphics model, which contains graphics related database manipulations.
 * @class Graphics
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} path - 'path' module.
 * @property {json} tablesConfig - Tables configuration.
 * @property {object} utils - 'Utils' model.
 * @property {object} memberPgPool - PostgreSQL connection pool.
 */
const Graphics = function () {
  /**
   * Callback of the database operations.
   * @callback Graphics~databaseOperationCallback
   * @param {error} err - Error
   * @param {json} result - Result of the operation
   */

  const utils = new Utils();
  /**
   * Returns the count of the fires grouped by the received key.
   * @param {string} dateTimeFrom - Initial date / time
   * @param {string} dateTimeTo - Final date / time
   * @param {string} key - Key
   * @param {json} filterRules - Filter rules
   * @param {json} options - Filtering options
   * @param {databaseOperationCallback} callback - Callback function
   * @returns {databaseOperationCallback} callback - Execution of the callback function, which will process the received data
   *
   * @function getFiresCount
   * @memberof Graphics
   * @inner
   */
  this.getFiresCount = function (dateTimeFrom, dateTimeTo, key, filterRules, options, callback) {
    // Counter of the query parameters
    let parameterAux = 1;

    // Connection with the PostgreSQL database
    let fields = `${key}, count(*) as count`;
    let group = key;

    if (options.y !== undefined) {
      const yFields = options.y.match(/[^{\}]+(?=})/g);
      const index = yFields.indexOf(key);
      if (index > -1) yFields.splice(index, 1);

      if (yFields.length > 0) {
        fields += `, ${yFields.toString()}`;
        group += `, ${yFields.toString()}`;
      }
    }

    // Creation of the query
    const queryAux = `select ${fields} from ${tablesConfig.Fires.Schema}.${tablesConfig.Fires.TableName} where (${tablesConfig.Fires.DateTimeFieldName} between $${parameterAux++} and $${parameterAux++})`;
    const paramsAux = [dateTimeFrom, dateTimeTo];

    const getFiltersResult = utils.getFilters(
      options, queryAux, paramsAux, parameterAux, filterRules,
    );

    let { query, parameter } = getFiltersResult;
    const { params } = getFiltersResult;

    query += ` group by ${group} order by count desc, ${key} asc`;

    // If the 'options.limit' parameter exists, a limit clause is created
    if (options.limit !== undefined) {
      query += ` limit $${parameter++}`;
      params.push(options.limit);
    }

    // Execution of the query
    sequelize.query(
      query,
      {
        bind: params,
        type: sequelize.QueryTypes.SELECT,
      },
    ).then((result) => {
      callback(null, result);
    }).catch(callback);
  };

  /**
   * Returns the count of the fires.
   * @param {string} dateTimeFrom - Initial date / time
   * @param {string} dateTimeTo - Final date / time
   * @param {json} filterRules - Filter rules
   * @param {json} options - Filtering options
   * @param {databaseOperationCallback} callback - Callback function
   * @returns {databaseOperationCallback} callback - Execution of the callback function, which will process the received data
   *
   * @function getFiresTotalCount
   * @memberof Graphics
   * @inner
   */
  this.getFiresTotalCount = function (dateTimeFrom, dateTimeTo, filterRules, options, callback) {
    // Counter of the query parameters
    let parameterAux = 1;

    // Connection with the PostgreSQL database
    // Creation of the query
    const queryAux = `select count(*) as count from ${tablesConfig.Fires.Schema}.${tablesConfig.Fires.TableName} where (${tablesConfig.Fires.DateTimeFieldName} between $${parameterAux++} and $${parameterAux++})`;
    const paramsAux = [dateTimeFrom, dateTimeTo];

    const getFiltersResult = utils.getFilters(options, queryAux, paramsAux, parameterAux, filterRules);
    let { query, params, parameter } = getFiltersResult;

    // If the 'options.limit' parameter exists, a limit clause is created
    if (options.limit !== undefined) {
      query += ` limit $${parameter++}`;
      params.push(options.limit);
    }

    // Execution of the query
    sequelize.query(
      query,
      {
        bind: params,
        type: sequelize.QueryTypes.SELECT,
      },
    ).then((result) => {
      callback(null, result);
    }).catch(callback);
  };

  /**
   * Returns the count of the fires grouped by week.
   * @param {string} dateTimeFrom - Initial date / time
   * @param {string} dateTimeTo - Final date / time
   * @param {json} filterRules - Filter rules
   * @param {json} options - Filtering options
   * @param {databaseOperationCallback} callback - Callback function
   * @returns {databaseOperationCallback} callback - Execution of the callback function, which will process the received data
   *
   * @function getFiresCountByWeek
   * @memberof Graphics
   * @inner
   */
  this.getFiresCountByWeek = function (dateTimeFrom, dateTimeTo, filterRules, options, callback) {
    // Counter of the query parameters
    let parameterAux = 1;

    // Connection with the PostgreSQL database
    // Creation of the query
    const queryAux = `select TO_CHAR(date_trunc('week', ${tablesConfig.Fires.DateTimeFieldName})::date, 'YYYY/MM/DD') as start, `
        + `TO_CHAR((date_trunc('week', ${tablesConfig.Fires.DateTimeFieldName}) + '6 days')::date, 'YYYY/MM/DD') as end, count(*) AS count `
        + `from ${tablesConfig.Fires.Schema}.${tablesConfig.Fires.TableName
        } where (${tablesConfig.Fires.DateTimeFieldName} between $${parameterAux++} and $${parameterAux++})`;
    const paramsAux = [dateTimeFrom, dateTimeTo];

    const getFiltersResult = utils.getFilters(options, queryAux, paramsAux, parameterAux, filterRules);

    let { query, params, parameter } = getFiltersResult;

    query += ' group by 1, 2 order by 1, 2';

    // If the 'options.limit' parameter exists, a limit clause is created
    if (options.limit !== undefined) {
      query += ` limit $${parameter++}`;
      params.push(options.limit);
    }

    // Execution of the query
    sequelize.query(
      query,
      {
        bind: params,
        type: sequelize.QueryTypes.SELECT,
      },
    ).then((result) => {
      callback(null, result);
    }).catch(callback);
  };
};

module.exports = Graphics;
