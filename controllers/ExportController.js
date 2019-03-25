// 'fs' module
const fs = require('fs');
// 'path' module
const path = require('path');
// 'Utils' model
const Utils = require('../models/Utils.js');

/**
 * Controller responsible for export the fires data.
 * @class ExportController
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberFs - 'fs' module.
 * @property {object} memberPath - 'path' module.
 * @property {object} memberUtils - 'Utils' model.
 */
const ExportController = function (app) {
  const utils = new Utils();

  /**
   * Returns the difference in days between the current date and a given date.
   * @param {string} dateString - Date (YYYY-MM-DD)
   * @returns {integer} difference - Difference between the dates
   *
   * @private
   * @function getDateDifferenceInDays
   * @memberof ExportController
   * @inner
   */
  const getDateDifferenceInDays = function (dateString) {
    const now = new Date();
    const date = new Date(`${dateString} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`);

    const utc1 = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const utc2 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());

    const difference = Math.floor((utc1 - utc2) / (1000 * 3600 * 24));

    return difference;
  };

  /**
   * Deletes the invalid folders (older than one day) from the tmp folder.
   *
   * @private
   * @function deleteInvalidFolders
   * @memberof ExportController
   * @inner
   */
  const deleteInvalidFolders = function () {
    const tmpDir = path.join(__dirname, '../tmp');
    const dirs = fs.readdirSync(tmpDir)
      .filter(file => fs.statSync(path.join(tmpDir, file)).isDirectory());

    for (let i = 0, count = dirs.length; i < count; i += 1) {
      const dir = path.join(__dirname, `../tmp/${dirs[i]}`);
      const date = dirs[i].split('_--_');

      if (getDateDifferenceInDays(date[1]) > 1) utils.deleteFolderRecursively(dir, () => {});
    }
  };

  /**
   * Processes the request and returns a response.
   * @param {json} request - JSON containing the request data
   * @param {json} response - JSON containing the response data
   *
   * @function exportController
   * @memberof ExportController
   * @inner
   */
  const exportController = function (request, response) {
    const finalPath = `${path.join(__dirname, `../tmp/${request.query.folder}`)}/${request.query.file}`;

    response.download(finalPath, request.query.file, (err) => {
      if (err) return console.error(err);

      return utils.deleteFolderRecursively(path.join(__dirname, `../tmp/${request.query.folder}`), () => {});
    });

    deleteInvalidFolders();
  };

  return exportController;
};

module.exports = ExportController;
