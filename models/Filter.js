// 'path' module
const path = require('path');
// Filter configuration
const memberFilterConfig = require(path.join(__dirname, '../configurations/Filter.json'));
// Tables configuration
const memberTablesConfig = require(path.join(__dirname, '../configurations/Tables.json'));
// 'Utils' model
const Utils = require('./Utils.js');
// PostgreSQL connection pool
const {
  Municipios, Estados, Paises, Biomas, Sequelize, sequelize, Op,
} = require('../pg');

/**
 * Filter model, which contains filter related database manipulations.
 * @class Filter
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} path - 'path' module.
 * @property {json} memberFilterConfig - Filter configuration.
 * @property {json} memberTablesConfig - Tables configuration.
 * @property {object} utils - 'Utils' model.
 * @property {object} pgSequelize - PostgreSQL connection pool.
 */
function Filter() {
  const utils = new Utils();
  /**
   * Returns a list of countries filtered by the received states ids.
   * @param {array} states - States ids
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getCountriesByStates
   * @memberof Filter
   * @inner
   */
  this.getCountriesByStates = function (states, callback) {
    Paises.findAll({
      include: [Estados],
      where: {
        id_1: {
          [Op.in]: states,
        },
      },
    }).then((result) => {
      callback(null, result);
    }).catch(callback);
  };

  /**
   * Returns a list of countries.
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getCountries
   * @memberof Filter
   * @inner
   */
  this.getCountries = function (callback) {
    Paises.findAll({
      order: ['id_0', 'ASC'],
    }).then((result) => {
      callback(null, result);
    }).catch(callback);
  };

  /**
   * Returns a list of biomes.
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getBiomes
   * @memberof Filter
   * @inner
   */
  this.getBiomes = function (callback) {
    Biomas.findAll({
      order: ['nome', 'ASC'],
    }).then((result) => {
      callback(null, result);
    }).catch(callback);
  };

  /**
   * Returns a list of states filtered by the received countries ids.
   * @param {array} countries - Countries ids
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getStatesByCountries
   * @memberof Filter
   * @inner
   */
  this.getStatesByCountries = function (countries, callback) {
    Estados.findAll({
      where: {
        id_0: {
          [Op.in]: countries,
        },
      },
      order: [
        ['name_0', 'ASC'],
        ['name_1', 'ASC'],
      ],
    }).then((result) => {
      callback(null, result);
    }).catch(callback);
  };

  /**
   * Returns the countries extent correspondent to the received ids.
   * @param {array} countries - Countries ids
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getCountriesExtent
   * @memberof Filter
   * @inner
   */
  this.getCountriesExtent = function (countries, callback) {
    if (countries.length === 1 && memberFilterConfig.Extents.Countries[countries[0]] !== undefined) {
      const confExtent = memberFilterConfig.Extents.Countries[countries[0]].split(',');
      return callback(null, { rowCount: 1, rows: [{ extent: `BOX(${confExtent[0]} ${confExtent[1]},${confExtent[2]} ${confExtent[3]})` }] });
    }

    const countriesWithExtent = [];
    const countriesWithoutExtent = [];

    for (let i = 0, countriesLength = countries.length; i < countriesLength; i++) {
      if (memberFilterConfig.Extents.Countries[countries[i]] !== undefined) countriesWithExtent.push(countries[i]);
      else countriesWithoutExtent.push(countries[i]);
    }

    let unionGeoms = '';

    if (countriesWithExtent.length > 0) {
      for (let i = 0, countriesWithExtentLength = countriesWithExtent.length; i < countriesWithExtentLength; i++) unionGeoms += `ST_MakeEnvelope(${memberFilterConfig.Extents.Countries[countriesWithExtent[i]]}, 4326), `;

      unionGeoms = unionGeoms.substring(0, (unionGeoms.length - 2));
    }

    let parameter = 1;
    const params = [];
    let query;

    // Creation of the query
    if (countriesWithoutExtent.length > 0) {
      query = 'select ST_Expand(ST_Extent(';

      if (unionGeoms !== '') query += `ST_Collect(ARRAY[${memberTablesConfig.Countries.GeometryFieldName}, ${unionGeoms}])`;
      else query += memberTablesConfig.Countries.GeometryFieldName;

      query += `), 2) as extent from ${memberTablesConfig.Countries.Schema}.${memberTablesConfig.Countries.TableName} where ${memberTablesConfig.Countries.IdFieldName} in (`;

      for (let i = 0, countriesWithoutExtentLength = countriesWithoutExtent.length; i < countriesWithoutExtentLength; i++) {
        query += `$${parameter++},`;
        params.push(countriesWithoutExtent[i]);
      }

      query = `${query.substring(0, (query.length - 1))})`;
    } else query = `select ST_Expand(ST_Extent(ST_Collect(ARRAY[${unionGeoms}])), 2) as extent`;

    console.log(query);

    sequelize.query(
      query, { bind: params, type: sequelize.QueryTypes.SELECT },
    ).then((result) => {
      callback(null, result);
    }).catch(callback);
  };

  /**
   * Returns the states extent correspondent to the received ids.
   * @param {array} states - States ids
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getStatesExtent
   * @memberof Filter
   * @inner
   */
  this.getStatesExtent = function (states, callback) {
    if (states.length === 1 && memberFilterConfig.Extents.States[states[0]] !== undefined) {
      const confExtent = memberFilterConfig.Extents.States[states[0]].split(',');
      return callback(null, { rowCount: 1, rows: [{ extent: `BOX(${confExtent[0]} ${confExtent[1]},${confExtent[2]} ${confExtent[3]})` }] });
    }

    const statesWithExtent = [];
    const statesWithoutExtent = [];

    for (let i = 0, statesLength = states.length; i < statesLength; i++) {
      if (memberFilterConfig.Extents.States[states[i]] !== undefined) statesWithExtent.push(states[i]);
      else statesWithoutExtent.push(states[i]);
    }

    let unionGeoms = '';

    if (statesWithExtent.length > 0) {
      for (let i = 0, statesWithExtentLength = statesWithExtent.length; i < statesWithExtentLength; i++) unionGeoms += `ST_MakeEnvelope(${memberFilterConfig.Extents.States[statesWithExtent[i]]}, 4326), `;

      unionGeoms = unionGeoms.substring(0, (unionGeoms.length - 2));
    }

    let parameter = 1;
    const params = [];
    let query;

    // Creation of the query
    if (statesWithoutExtent.length > 0) {
      query = 'select ST_Expand(ST_Extent(';

      if (unionGeoms !== '') query += `ST_Collect(ARRAY[${memberTablesConfig.States.GeometryFieldName}, ${unionGeoms}])`;
      else query += memberTablesConfig.States.GeometryFieldName;

      query += `), 0.5) as extent from ${memberTablesConfig.States.Schema}.${memberTablesConfig.States.TableName} where ${memberTablesConfig.States.IdFieldName} in (`;

      for (let i = 0, statesWithoutExtentLength = statesWithoutExtent.length; i < statesWithoutExtentLength; i++) {
        query += `$${parameter++},`;
        params.push(statesWithoutExtent[i]);
      }

      query = `${query.substring(0, (query.length - 1))})`;
    } else query = `select ST_Expand(ST_Extent(ST_Collect(ARRAY[${unionGeoms}])), 2) as extent`;

    sequelize.query(
      query, { bind: params, type: sequelize.QueryTypes.SELECT },
    ).then((result) => {
      callback(null, result);
    }).catch(callback);
  };

  /**
   * Returns the extent of the protected area corresponding to the received id.
   * @param {integer} id - Id of the protected area
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getProtectedAreaExtent
   * @memberof Filter
   * @inner
   */
  this.getProtectedAreaExtent = function (id, callback) {
    if (memberFilterConfig.Extents.ProtectedAreas[id.toString()] !== undefined) {
      const confExtent = memberFilterConfig.Extents.ProtectedAreas[id.toString()].split(',');
      return callback(null, { rowCount: 1, rows: [{ extent: `BOX(${confExtent[0]} ${confExtent[1]},${confExtent[2]} ${confExtent[3]})` }] });
    }

    const params = [id.toString()];

    const schemaAndTable = `${memberTablesConfig.UCF.Schema}.${memberTablesConfig.UCF.TableName}`;
    const geom = memberTablesConfig.UCF.GeometryFieldName;
    const idField = memberTablesConfig.UCF.IdFieldName;

    // Creation of the query
    const query = `select ST_Expand(ST_Extent(${geom}), 0.5) as extent from ${schemaAndTable} where ${idField} = $1;`;

    sequelize.query(
      query,
      {
        bind: params,
        type: sequelize.QueryTypes.SELECT,
      },
    );
    // Connection with the PostgreSQL database
    pgSequelize.connect((err, client, done) => {
      if (!err) {
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
   * Returns the extent of the city corresponding to the received id.
   * @param {string} id - Id of the city
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getCityExtent
   * @memberof Filter
   * @inner
   */
  this.getCityExtent = function (id, callback) {
    if (memberFilterConfig.Extents.Cities[id] !== undefined) {
      const confExtent = memberFilterConfig.Extents.Cities[id].split(',');
      return callback(null, { rowCount: 1, rows: [{ extent: `BOX(${confExtent[0]} ${confExtent[1]},${confExtent[2]} ${confExtent[3]})` }] });
    }

    const params = [id];

    // Creation of the query
    const query = `select ST_Expand(ST_Extent(${memberTablesConfig.Cities.GeometryFieldName}), 0.1) as extent from ${memberTablesConfig.Cities.Schema}.${memberTablesConfig.Cities.TableName} where ${memberTablesConfig.Cities.IdFieldName} = $1;`;

    sequelize.query(
      query, { bind: params, type: sequelize.QueryTypes.SELECT },
    ).then((result) => {
      callback(null, result);
    }).catch(callback);
  };

  /**
   * Returns the data of the polygon that intersects with the received point.
   * @param {string} longitude - Longitude of the point
   * @param {string} latitude - Latitude of the point
   * @param {float} resolution - Current map resolution
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getDataByIntersection
   * @memberof Filter
   * @inner
   */
  this.getDataByIntersection = function (longitude, latitude, resolution, callback) {
    // Connection with the PostgreSQL database
    let key = 'States';

    if (resolution >= memberFilterConfig.SpatialFilter.Countries.MinResolution && resolution < memberFilterConfig.SpatialFilter.Countries.MaxResolution) key = 'Countries';

    // Creation of the query
    const query = `SELECT ${memberTablesConfig[key].IdFieldName} as id, ${memberTablesConfig[key].NameFieldName} as name, '${key}' as key, ${memberTablesConfig[key].BdqNameFieldName} as bdq_name`
        + ` FROM ${memberTablesConfig[key].Schema}.${memberTablesConfig[key].TableName} WHERE ST_Intersects(${memberTablesConfig[key].GeometryFieldName}, ST_SetSRID(ST_MakePoint($1, $2), 4326));`;

    const params = [longitude, latitude];
    sequelize.query(
      query, { bind: params, type: sequelize.QueryTypes.SELECT },
    ).then((result) => {
      callback(null, result);
    }).catch(callback);
  };

  /**
   * Returns the satellites for the given filter.
   * @param {string} dateTimeFrom - Initial date / time
   * @param {string} dateTimeTo - Final date / time
   * @param {json} options - Filtering options
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getSatellites
   * @memberof Filter
   * @inner
   */
  this.getSatellites = function (dateTimeFrom, dateTimeTo, options, callback) {
    // Connection with the PostgreSQL database
    // Counter of the query parameters
    let preParameter = 1;

    // Creation of the query
    const preQuery = `select distinct ${memberTablesConfig.Fires.SatelliteFieldName} from ${memberTablesConfig.Fires.Schema}.${memberTablesConfig.Fires.TableName
    } where (${memberTablesConfig.Fires.DateTimeFieldName} between $${preParameter++} and $${preParameter++})`;
    const preParams = [dateTimeFrom, dateTimeTo];

    const getFiltersResult = utils.getFilters(options, preQuery, preParams, preParameter);
    const { query, params } = getFiltersResult;

    sequelize.query(
      query, { bind: params, type: sequelize.QueryTypes.SELECT },
    ).then((result) => {
      callback(null, result);
    }).catch(callback);
  };

  /**
   * Returns the protected areas that match the given value.
   * @param {string} value - Value to be used in the search of protected areas
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function searchForPAs
   * @memberof Filter
   * @inner
   */
  this.searchForPAs = function (value, callback) {
    const params = [`%${value}%`];
    const query = `select ${memberTablesConfig.UCF.IdFieldName} as id, upper(${memberTablesConfig.UCF.NameFieldName}) as name `
        + `from ${memberTablesConfig.UCF.Schema}.${memberTablesConfig.UCF.TableName
        } where unaccent(upper(${memberTablesConfig.UCF.NameFieldName})) like unaccent(upper($1))`;

    sequelize.query(
      query, { bind: params, type: sequelize.QueryTypes.SELECT },
    ).then((result) => {
      callback(null, result);
    }).catch(callback);
  };


  /**
   * Returns the cities that match the given value.
   * @param {string} value - Value to be used in the search of cities
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function searchForCities
   * @memberof Filter
   * @inner
   */
  this.searchForCities = function (value, countries, states, callback) {
    const filters = [];
    filters.append(Sequelize.where(
      Sequelize.fn('unaccent', Sequelize.col('name_2')), {
        [Op.iLike]: Sequelize.fn('unaccent', value),
      },
    ));

    if (countries !== null) {
      const countriesArray = countries.split(',');
      filters.append({
        id_0: {
          [Op.in]: countriesArray,
        },
      });
    }

    if (states !== null) {
      const statesArray = states.split(',');
      filters.append({
        id_1: {
          [Op.in]: statesArray,
        },
      });
    }
    // Connection with the PostgreSQL database
    Municipios.findAll({
      include: [Paises, Estados],
      where: Sequelize.where(
        Sequelize.fn('unaccent', Sequelize.col('name_2')), {
          [Op.iLike]: Sequelize.fn('unaccent', value),
        },
      ),
    }).then((municipios) => {
      console.log(municipios);
      callback(null, municipios);
    }).catch(callback);
  };
}

module.exports = Filter;
