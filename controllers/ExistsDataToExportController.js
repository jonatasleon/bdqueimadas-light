"use strict";

/**
 * Controller responsible for check if exists data to export file
 * @class ExistsDataToExportController
 *
 * @author Marcos Vinicius [marcos.araujo@inpe.br]
 *
 * @property {object} memberFilter - 'Filter' model.
 * @property {object} memberUtils -  'Utils' model.
 */
var ExistsDataToExportController = function(app) {
    var memberExportation = new (require('../models/Exportation.js'))();
    var memberUtils = new (require('../models/Utils.js'))();

    var existsDataToExport = function(req, res) {
        var json = memberUtils.parseToBool(req.query);
        var options = {};
    
        if(json.satellites !== undefined && json.satellites !== null && json.satellites !== '') options.satellites = json.satellites;
        if(json.biomes !== undefined && json.biomes !== null && json.biomes !== '') options.biomes = json.biomes;
        if(json.countries !== undefined && json.countries !== null && json.countries !== '') options.countries = json.countries;
        if(json.states !== undefined && json.states !== null && json.states !== '') options.states = json.states;
        if(json.cities !== undefined && json.cities !== null && json.cities !== '') options.cities = json.cities;

        options.limit = 1;
        memberExportation.getGeoJSONData(json.dateTimeFrom, json.dateTimeTo, options, function(err, GeoJSONData) {
            if(err) return console.error(err);
            res.json({ existsDataToExport: GeoJSONData.rowCount > 0 });
        });
    }

    return existsDataToExport;
};

module.exports = ExistsDataToExportController;