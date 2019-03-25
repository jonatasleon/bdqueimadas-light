const Filter = require('../models/Filter.js');

/**
 * Controller responsible for returning the protected areas that match the provided value.
 * @class SearchForPAsController
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberFilter - 'Filter' model.
 */
const SearchForPAsController = function (app) {
  // 'Filter' model
  const filter = new Filter();

  /**
   * Processes the request and returns a response.
   * @param {json} request - JSON containing the request data
   * @param {json} response - JSON containing the response data
   *
   * @function searchForPAsController
   * @memberof SearchForPAsController
   * @inner
   */
  const searchForPAsController = function (request, response) {
    // Setting the string to uppercase, removing excessive spaces and non alphanumeric characters
    let searchValue = request.query.value.toUpperCase().replace(/\W /g, '').replace(/\s+/g, ' ').trim();
    const searchValueArray = searchValue.split(' ');
    searchValue = searchValueArray.join(' ');

    if (searchValue.length >= request.query.minLength) {
      // Call of the method 'searchForPAs', responsible for
      // returning the protected areas that match the provided value
      filter.searchForPAs(searchValue)
        .then((result) => {
          // Conversion of the result object to array
          const data = result.map(val => ({
            label: val.name,
            value: {
              id: val.id,
              name: val.name,
            },
          }));

          // JSON response
          response.json(data);
        }).catch(console.error);
    } else {
      response.json([]);
    }
  };

  /**
   * Verifies if a string exists in an array.
   * @param {array} array - Array where the search will be performed
   * @param {string} string - String to be searched
   * @returns {boolean} boolean - Flag that indicates if the string exists in the array
   *
   * @private
   * @function stringInArray
   * @memberof SearchForPAsController
   * @inner
   */
  const stringInArray = function (array, string) {
    for (let i = 0, arrayLength = array.length; i < arrayLength; i++) {
      if (array[i].toString() === string.toString()) return true;
    }
    return false;
  };

  return searchForPAsController;
};

module.exports = SearchForPAsController;
