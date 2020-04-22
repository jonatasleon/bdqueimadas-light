"use strict";

/**
 * Controller responsible for return the states of filtered countries.
 * @class StatesByCountriesController
 *
 * @author Marcos Vinicius [marcos.araujo@inpe.br]
 *
 * @property {object} memberFilter - 'Filter' model.
 * @property {object} memberUtils -  'Utils' model.
 */
var StatesByCountriesController = function(app) {
    var memberFilter = new (require('../models/Filter.js'))();
    var memberUtils = new (require('../models/Utils.js'))();

    var getStatesByCountries = function(req, res) {
        var json = memberUtils.parseToBool(req.query);

        memberFilter.getStatesByCountries(json.countries, function(err, states) {
        if(err) return console.error(err);
            res.json({ states: states, filter: json.filter });
        });
    }

    return getStatesByCountries;
};

module.exports = StatesByCountriesController;