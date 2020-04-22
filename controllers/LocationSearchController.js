"use strict";

/**
 * Controller responsible for apply spatial filter for latitude/longitude search tool.
 * @class LocationSearchController
 *
 * @author Marcos Vinicius [marcos.araujo@inpe.br]
 *
 * @property {object} memberFilter - 'Filter' model.
 */
var LocationSearchController = function(app) {
    var memberFilter = new (require('../models/Filter.js'))();

    var getLatLngExtent = function(req, res) {
        var params = req.query;
        
        memberFilter.getLatLngExtent(params, function(err, extent) {
            if(err) return console.error(err);
            res.json({ key: params.key, id: params.id, extent: extent });
        });
    }

    return getLatLngExtent;
};

module.exports = LocationSearchController;