/**
 * AttributesTable model, which contains attributes table related database manipulations.
 * @class AttributesTable
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberPath - 'path' module.
 * @property {json} memberAttributesTableConfig - Attributes table configuration.
 * @property {json} memberTablesConfig - Tables configuration.
 * @property {object} memberUtils - 'Utils' model.
 * @property {object} memberPgPool - PostgreSQL connection pool.
 */
const AttributesTable = function () {
  // 'path' module
  const memberPath = require('path');
  // Attributes table configuration
  const memberAttributesTableConfig = require(memberPath.join(__dirname, '../configurations/AttributesTable.json'));
  // Tables configuration
  const memberTablesConfig = require(memberPath.join(__dirname, '../configurations/Tables.json'));
  // 'Utils' model
  const memberUtils = new (require('./Utils.js'))();
  // PostgreSQL connection pool
  const memberPgPool = require('../pg');

  /**
   * Returns data of the attributes table accordingly with the received parameters.
   * @param {number} numberOfRegisters - Desired number of records
   * @param {number} initialRegister - Initial record
   * @param {array} order - 'order by' clause parameters
   * @param {string} search - String of the search
   * @param {string} dateTimeFrom - Initial date / time
   * @param {string} dateTimeTo - Final date / time
   * @param {json} options - Filtering options
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getAttributesTableData
   * @memberof AttributesTable
   * @inner
   */
  this.getAttributesTableData = function (numberOfRegisters, initialRegister, order, search, dateTimeFrom, dateTimeTo, options, callback) {
    // Counter of the query parameters
    let parameter = 1;

    // Setting of the query columns string
    let columns = '';
    for (var i = 0, columnsLength = memberAttributesTableConfig.Columns.length; i < columnsLength; i++) {
      const columnName = (memberAttributesTableConfig.Columns[i].TableAlias !== null ? `${memberAttributesTableConfig.Columns[i].TableAlias}.${memberAttributesTableConfig.Columns[i].Name}` : memberAttributesTableConfig.Columns[i].Name);

      if (memberAttributesTableConfig.Columns[i].Name == memberTablesConfig.Fires.DateTimeFieldName) columns += `TO_CHAR(${columnName}, 'YYYY/MM/DD HH24:MI:SS'), `;
      else columns += `${columnName}, `;
    }
    columns = columns.substring(0, (columns.length - 2));

    // Setting of the query 'order by' clause string
    let orderText = '';
    for (var i = 0, orderLength = order.length; i < orderLength; i++) {
      let direction = 'asc';
      if (order[i].dir === 'desc') direction = 'desc';

      let column = memberAttributesTableConfig.Columns[0].Name;
      for (var j = 0, columnsLength = memberAttributesTableConfig.Columns.length; j < columnsLength; j++) {
        if (memberAttributesTableConfig.Columns[j].Name === order[i].column) {
          column = (memberAttributesTableConfig.Columns[j].TableAlias !== null ? `${memberAttributesTableConfig.Columns[j].TableAlias}.${memberAttributesTableConfig.Columns[j].Name}` : memberAttributesTableConfig.Columns[j].Name);
          break;
        }
      }

      orderText += `${column} ${direction}, `;
    }
    orderText = orderText.substring(0, (orderText.length - 2));

    // Connection with the PostgreSQL database
    memberPgPool.connect((err, client, done) => {
      if (!err) {
        // Creation of the query
        let query = `select ${columns} from ${memberTablesConfig.Fires.Schema}.${memberTablesConfig.Fires.TableName} FiresTable where (FiresTable.${memberTablesConfig.Fires.DateTimeFieldName} between $${parameter++} and $${parameter++})`;
        let params = [dateTimeFrom, dateTimeTo];

        options.tableAlias = 'FiresTable';

        const getFiltersResult = memberUtils.getFilters(options, query, params, parameter);

        query = getFiltersResult.query;
        params = getFiltersResult.params;
        parameter = getFiltersResult.parameter;

        // If the the user executed a search in the table, a 'where' clause is created for it
        if (search !== '') {
          const searchResult = createSearch(search, parameter, 'FiresTable');
          query += searchResult.search;
          parameter = searchResult.parameter;
          params = params.concat(searchResult.params);
        }

        // Order and pagination clauses
        query += ` order by ${orderText} limit $${parameter++} offset $${parameter++};`;
        params.push(numberOfRegisters, initialRegister);

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
   * Returns the number of rows of the attributes table accordingly with the received parameters, not considering the table search.
   * @param {string} dateTimeFrom - Initial date / time
   * @param {string} dateTimeTo - Final date / time
   * @param {json} options - Filtering options
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getAttributesTableCount
   * @memberof AttributesTable
   * @inner
   */
  this.getAttributesTableCount = function (dateTimeFrom, dateTimeTo, options, callback) {
    // Counter of the query parameters
    let parameter = 1;

    // Connection with the PostgreSQL database
    memberPgPool.connect((err, client, done) => {
      if (!err) {
        // Creation of the query
        let query = `select count(*) from ${memberTablesConfig.Fires.Schema}.${memberTablesConfig.Fires.TableName} FiresTable where ${memberTablesConfig.Fires.DateTimeFieldName} between $${parameter++} and $${parameter++}`;
        let params = [dateTimeFrom, dateTimeTo];

        const getFiltersResult = memberUtils.getFilters(options, query, params, parameter);

        query = getFiltersResult.query;
        params = getFiltersResult.params;
        parameter = getFiltersResult.parameter;

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
   * Returns the number of rows of the attributes table accordingly with the received parameters, considering the table search.
   * @param {string} dateTimeFrom - Initial date / time
   * @param {string} dateTimeTo - Final date / time
   * @param {string} search - String of the search
   * @param {json} options - Filtering options
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getAttributesTableCountWithSearch
   * @memberof AttributesTable
   * @inner
   */
  this.getAttributesTableCountWithSearch = function (dateTimeFrom, dateTimeTo, search, options, callback) {
    // Counter of the query parameters
    let parameter = 1;

    // Connection with the PostgreSQL database
    memberPgPool.connect((err, client, done) => {
      if (!err) {
        // Creation of the query
        let query = `select count(*) from ${memberTablesConfig.Fires.Schema}.${memberTablesConfig.Fires.TableName} FiresTable where ${memberTablesConfig.Fires.DateTimeFieldName} between $${parameter++} and $${parameter++}`;
        let params = [dateTimeFrom, dateTimeTo];

        const getFiltersResult = memberUtils.getFilters(options, query, params, parameter);

        query = getFiltersResult.query;
        params = getFiltersResult.params;
        parameter = getFiltersResult.parameter;

        // If the the user executed a search in the table, a 'where' clause is created for it
        if (search !== '') {
          const searchResult = createSearch(search, parameter);
          query += searchResult.search;
          parameter = searchResult.parameter;
          params = params.concat(searchResult.params);
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
   * Creates and returns the search 'where' clauses.
   * @param {string} search - Search text
   * @param {int} parameter - Parater counter
   * @param {string} tableAlias - Table alias
   * @returns {json} {} - JSON object with the search text, the parameter counter and the parameters array
   *
   * @private
   * @function createSearch
   * @memberof AttributesTable
   * @inner
   */
  var createSearch = function (search, parameter, tableAlias) {
    let searchText = ' and (';
    const params = [];

    // Loop through the columns configuration
    for (let i = 0, columnsLength = memberAttributesTableConfig.Columns.length; i < columnsLength; i++) {
      const columnName = (tableAlias !== undefined && tableAlias !== null ? `${tableAlias}.${memberAttributesTableConfig.Columns[i].Name}` : memberAttributesTableConfig.Columns[i].Name);

      // Verification of the type of the column (numeric or not numeric)
      if (memberAttributesTableConfig.Columns[i].String) {
        searchText += `${columnName} like $${parameter++} or `;
        params.push(`%${search}%`);
      } else if (!memberAttributesTableConfig.Columns[i].String && !isNaN(search)) {
        searchText += `${columnName} = $${parameter++} or `;
        params.push(Number(search));
      }
    }
    searchText = `${searchText.substring(0, (searchText.length - 4))})`;

    return { search: searchText, parameter, params };
  };
};

module.exports = AttributesTable;
