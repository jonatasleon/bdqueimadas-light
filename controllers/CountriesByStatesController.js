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
    
          memberFilter.getCountriesByContinent(countriesByStates.rows[0].continent, function(err, countries) {
            if(err) return console.error(err);
            
            res.json({ countriesByStates: countriesByStates, countries: countries });
          });
        });
    }

    return getCountriesByStates;
};

module.exports = CountriesByStatesController;