"use strict";

/**
 * Controller responsible for return the countries of filtered states.
 * @class CountriesByStatesController
 *
 * @author Marcos Vinicius [marcos.araujo@inpe.br]
 *
 * @property {object} memberFilter - 'Filter' model.
 * @property {object} memberUtils -  'Utils' model.
 */
var CountriesByStatesController = function(app) {
    var memberFilter = new (require('../models/Filter.js'))();
    var memberUtils = new (require('../models/Utils.js'))();

    var getCountriesByStates = function(req, res) {
        var json = memberUtils.parseToBool(req.query);

        memberFilter.getCountriesByStates(json.states, function(err, countriesByStates) {
          if(err) return console.error(err);
          res.json({ countriesByStates: countriesByStates });
        });
    }

    return getCountriesByStates;
};

module.exports = CountriesByStatesController;