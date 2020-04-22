"use strict";

/**
 * Controller responsible for apply spatial filter for countries.
 * @class CountriesController
 *
 * @author Marcos Vinicius [marcos.araujo@inpe.br]
 *
 * @property {object} memberFilter - 'Filter' model.
 * @property {object} memberUtils -  'Utils' model.
 */
var CountriesController = function(app) {
    var memberFilter = new (require('../models/Filter.js'))();
    var memberUtils = new (require('../models/Utils.js'))();

    var getCountriesExtent = function(req, res) {
        var params = memberUtils.parseToBool(req.query);

        if(typeof(params.ids) !== 'object') {
            params.ids = params.ids.split(',');
        }

        var functionName = "get" + params.key + "Extent";
        memberFilter[functionName](params.ids, function(err, extent) {
            if(err) return console.error(err);
            res.json({ key: params.key, ids: params.ids, extent: extent});
        });
    }

    return getCountriesExtent;
};

module.exports = CountriesController;