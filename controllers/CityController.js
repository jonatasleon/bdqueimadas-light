"use strict";

/**
 * Controller responsible for apply spatial filter for specific city.
 * @class CityController
 *
 * @author Marcos Vinicius [marcos.araujo@inpe.br]
 *
 * @property {object} memberFilter - 'Filter' model.
 * @property {object} memberUtils -  'Utils' model.
 */
var CityController = function(app) {
    var memberFilter = new (require('../models/Filter.js'))();
    var memberUtils = new (require('../models/Utils.js'))();

    var getCityExtent = function(req, res) {
        var params = memberUtils.parseToBool(req.query);

        memberFilter.getCityExtent(params.id, function(err, extent) {
            if(err) return console.error(err);
            res.json({ key: params.key, id: params.id, extent: extent });
        });
    }

    return getCityExtent;
};

module.exports = CityController;