const fs = require('fs');
const path = require('path');
const Graphics = require('../models/Graphics.js');

const graphicsConfig = require(path.join(__dirname, '../configurations/Graphics.json'));

/**
 * Controller responsible for export the Graphics data.
 * @class ExportGraphicDataController
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberGraphics - 'Graphics' model.
 * @property {object} memberFs - 'fs' module.
 * @property {object} memberPath - 'path' module.
 * @property {object} memberGraphicsConfigurations - Graphics configuration.
 */
const ExportGraphicDataController = function (app) {
  const graphics = new Graphics();
  /**
   * Processes the request and returns a response.
   * @param {json} request - JSON containing the request data
   * @param {json} response - JSON containing the response data
   *
   * @function exportGraphicDataController
   * @memberof ExportGraphicDataController
   * @inner
   */
  const exportGraphicDataController = function (request, response) {
    // Object responsible for keeping several information to be used in the database query
    const options = {};

    // Verifications of the 'options' object items
    if (request.query.satellites !== '') options.satellites = request.query.satellites;
    if (request.query.biomes !== '') options.biomes = request.query.biomes;
    if (request.query.countries !== '') options.countries = request.query.countries;
    if (request.query.states !== '') options.states = request.query.states;
    if (request.query.cities !== '') options.cities = request.query.cities;

    const graphicConfigurations = getGraphicConfigurations(request.query.id);

    if (graphicConfigurations.Limit !== null) options.limit = graphicConfigurations.Limit;
    options.y = graphicConfigurations.Y;

    const filterRules = {
      ignoreCountryFilter: graphicConfigurations.IgnoreCountryFilter,
      ignoreStateFilter: graphicConfigurations.IgnoreStateFilter,
      ignoreCityFilter: graphicConfigurations.IgnoreCityFilter,
      showOnlyIfThereIsACountryFiltered: graphicConfigurations.ShowOnlyIfThereIsACountryFiltered,
      showOnlyIfThereIsNoCountryFiltered: graphicConfigurations.ShowOnlyIfThereIsNoCountryFiltered,
      showOnlyIfThereIsAStateFiltered: graphicConfigurations.ShowOnlyIfThereIsAStateFiltered,
      showOnlyIfThereIsNoStateFiltered: graphicConfigurations.ShowOnlyIfThereIsNoStateFiltered,
    };

    graphics.getFiresTotalCount(request.query.dateTimeFrom, request.query.dateTimeTo, filterRules, options, (err, firesTotalCount) => {
      if (err) return console.error(err);

      if (graphicConfigurations.Key === 'week') {
        graphics.getFiresCountByWeek(request.query.dateTimeFrom, request.query.dateTimeTo, filterRules, options, (err, firesCount) => {
          if (err) return console.error(err);

          downloadCsvFiresCount(firesTotalCount, firesCount, graphicConfigurations.Y, graphicConfigurations.Key, request.query.dateTimeFrom, request.query.dateTimeTo, response);
        });
      } else {
        graphics.getFiresCount(request.query.dateTimeFrom, request.query.dateTimeTo, graphicConfigurations.Key, filterRules, options, (err, firesCount) => {
          if (err) return console.error(err);

          downloadCsvFiresCount(firesTotalCount, firesCount, graphicConfigurations.Y, graphicConfigurations.Key, request.query.dateTimeFrom, request.query.dateTimeTo, response);
        });
      }
    });
  };

  /**
   * Downloads the csv file.
   * @param {json} firesTotalCount - Total fires count for the given filters
   * @param {json} firesCount - Fires count for the given filters grouped by the given key
   * @param {string} y - Y label of the graphic
   * @param {string} key - Graphic key
   * @param {string} dateTimeFrom - Initial date / time
   * @param {string} dateTimeTo - Final date / time
   * @param {object} response - Response object
   *
   * @private
   * @function downloadCsvFiresCount
   * @memberof ExportGraphicDataController
   * @inner
   */
  var downloadCsvFiresCount = function (firesTotalCount, firesCount, y, key, dateTimeFrom, dateTimeTo, response) {
    const csv = createCsvFiresCount(firesTotalCount, firesCount, y);
    const path = require('path');

    require('crypto').randomBytes(24, (err, buffer) => {
      const csvPath = path.join(__dirname, `../tmp/graphic-csv-${buffer.toString('hex')}.csv`);

      fs.writeFile(csvPath, csv, 'ascii', (err) => {
        if (err) return console.error(err);

        response.download(csvPath, `Focos por ${key} - de ${dateTimeFrom} a ${dateTimeTo}.csv`, (err) => {
          if (err) return console.error(err);

          fs.unlink(csvPath);
        });
      });
    });
  };

  /**
   * Creates the csv file content for the fires count graphic exportation.
   * @param {json} firesTotalCount - Total fires count for the given filters
   * @param {json} firesCount - Fires count for the given filters grouped by the given key
   * @param {string} y - Y label of the graphic
   *
   * @private
   * @function createCsvFiresCount
   * @memberof ExportGraphicDataController
   * @inner
   */
  var createCsvFiresCount = function (firesTotalCount, firesCount, y) {
    let csv = 'Campo,Valor,Percentagem do Total de Focos\n';
    const yFields = y.match(/[^{\}]+(?=})/g);

    firesCount.rows.forEach((item) => {
      let label = y;

      for (let i = 0, count = yFields.length; i < count; i++) {
        const field = (item[yFields[i]] !== null && item[yFields[i]] !== undefined && item[yFields[i]] !== '' ? item[yFields[i]] : 'Não Identificado');

        label = label.replace(`{${yFields[i]}}`, field);
      }

      csv += `${label},${item.count},${((parseFloat(item.count) / parseFloat(firesTotalCount.rows[0].count)) * 100).toFixed(2)}%\n`;
    });

    return csv;
  };

  /**
   * Returns the graphic configurations accordingly with given id.
   * @param {string} id - Graphic id
   * @returns {json} configurations - Graphic configurations
   *
   * @private
   * @function getGraphicConfigurations
   * @memberof ExportGraphicDataController
   * @inner
   */
  var getGraphicConfigurations = function (id) {
    for (let i = 0, count = graphicsConfig.FiresCount.length; i < count; i++) {
      if (id === graphicsConfig.FiresCount[i].Id) {
        return graphicsConfig.FiresCount[i];
      }
    }
  };

  return exportGraphicDataController;
};

module.exports = ExportGraphicDataController;
