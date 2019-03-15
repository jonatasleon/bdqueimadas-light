const Filter = require('../models/Filter.js');

function checkParam(queryParam) {
  const param = queryParam;
  return param !== undefined && param !== null && param !== '' ? param : null;
}

/**
 * Controller responsible for returning the cities that match the provided value.
 * @class SearchForCitiesController
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberFilter - 'Filter' model.
 */
function SearchForCitiesController(app) {
  // 'Filter' model
  const memberFilter = new Filter();

  /**
   * Processes the request and returns a response.
   * @param {json} request - JSON containing the request data
   * @param {json} response - JSON containing the response data
   *
   * @function searchForCitiesController
   * @memberof SearchForCitiesController
   * @inner
   */
  const searchForCitiesController = function (request, response) {
    // Setting the string to uppercase, removing excessive spaces and non alphanumeric characters
    const searchValue = request.query.value.toUpperCase().replace(/( )+/g, ' ').trim();

    const countries = checkParam(request.query.countries);
    const states = checkParam(request.query.states);

    if (searchValue.length >= request.query.minLength) {
      // Call of the method 'searchForCities', responsible for returning
      // the cities that match the provided value
      memberFilter.searchForCities(searchValue, countries, states, (err, result) => {
        if (err) return console.error(err);

        // Array responsible for keeping the data obtained by the method 'searchForCities'
        const data = [];

        // Conversion of the result object to array
        result.rows.forEach((val) => {
          data.push({
            label: `${val.name} - ${val.state}`,
            value: {
              id: val.id,
              type: val.state,
            },
          });
        });

        // JSON response
        response.json(data);
      });
    } else {
      response.json([]);
    }
  };

  return searchForCitiesController;
}

module.exports = SearchForCitiesController;
