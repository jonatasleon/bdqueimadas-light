"use strict";

/**
 * Controller responsible for apply spatial filter for protectedarea.
 * @class ProtectedAreaController
 *
 * @author Marcos Vinicius [marcos.araujo@inpe.br]
 *
 * @property {object} memberFilter - 'Filter' model.
 * @property {object} memberUtils -  'Utils' model.
 */
var ProtectedAreaController = function(app) {
    var memberFilter = new (require('../models/Filter.js'))();
    var memberUtils = new (require('../models/Utils.js'))();

    var getProtectedAreaExtent = function(req, res) {
        var params = memberUtils.parseToBool(req.query);

        memberFilter.getProtectedAreaExtent(params.id, params.ngo, params.type, function(err, extent) {
          if(err) return console.error(err);
          res.json({ key: params.key, id: params.id, type: params.type, extent: extent });
        });
    }

    return getProtectedAreaExtent;
};

module.exports = ProtectedAreaController;