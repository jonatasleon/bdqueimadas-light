const AttributesTable = require('../models/AttributesTable');
/**
 * Controller responsible for returning the attributes table data accordingly with the received parameters.
 * @class GetAttributesTableController
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} attributesTable - 'AttributesTable' model.
 */
const GetAttributesTableController = function (app) {
  // 'AttributesTable' model
  const attributesTable = new AttributesTable();

  /**
   * Processes the request and returns a response.
   * @param {json} request - JSON containing the request data
   * @param {json} response - JSON containing the response data
   *
   * @function getAttributesTableController
   * @memberof GetAttributesTableController
   * @inner
   */
  const getAttributesTableController = function (request, response) {
    // Object responsible for keeping several information to be used in the database query
    const options = {};
    // Array responsible for keeping the query 'order by' field names and type (asc or desc)
    const order = [];

    // Verifications of the 'options' object items
    if (request.body.satellites !== '') options.satellites = request.body.satellites;
    if (request.body.biomes !== '') options.biomes = request.body.biomes;
    if (request.body.countries !== null && request.body.countries !== '') options.countries = request.body.countries;
    if (request.body.states !== null && request.body.states !== '') options.states = request.body.states;
    if (request.body.cities !== null && request.body.cities !== '') options.cities = request.body.cities;

    // Setting of the 'order' array, the fields names are obtained by the columns numbers
    const arrayFound = request.body.columns.filter((item) => {
      for (let i = 0, orderLength = request.body.order.length; i < orderLength; i++) {
        if (item.data === request.body.order[i].column) order.push({ column: item.name, dir: request.body.order[i].dir });
      }
    });

    // Call of the method 'getAttributesTableData', responsible for returning data of the attributes table accordingly with the request parameters
    attributesTable.getAttributesTableData(request.body.length, request.body.start, order, request.body.search.value, request.body.dateTimeFrom, request.body.dateTimeTo, options, (err, result) => {
      if (err) return console.error(err);

      // Call of the method 'getAttributesTableCount', responsible for returning the number of rows of the attributes table accordingly with the request parameters, not considering the table search
      attributesTable.getAttributesTableCount(request.body.dateTimeFrom, request.body.dateTimeTo, options, (err, resultCount) => {
        if (err) return console.error(err);

        // Call of the method 'getAttributesTableCount', responsible for returning the number of rows of the attributes table accordingly with the request parameters, considering the table search
        attributesTable.getAttributesTableCountWithSearch(request.body.dateTimeFrom, request.body.dateTimeTo, request.body.search.value, options, (err, resultCountWithSearch) => {
          if (err) return console.error(err);

          // Array responsible for keeping the data obtained by the method 'getAttributesTableData'
          const data = [];

          // Conversion of the result object to array
          result.forEach((val) => {
            const temp = [];
            for (const key in val) temp.push(val[key]);
            data.push(temp);
          });

          // JSON response
          response.json({
            draw: parseInt(request.body.draw),
            recordsTotal: parseInt(resultCount.count),
            recordsFiltered: parseInt(resultCountWithSearch.count),
            data,
          });
        });
      });
    });
  };

  return getAttributesTableController;
};

module.exports = GetAttributesTableController;
