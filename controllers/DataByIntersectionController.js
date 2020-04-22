"use strict";

/**
 * Controller responsible for get attributes data for specific location.
 * @class DataByIntersectionController
 *
 * @author Marcos Vinicius [marcos.araujo@inpe.br]
 *
 * @property {object} memberFilter - 'Filter' model.
 * @property {object} memberUtils -  'Utils' model.
 */
var DataByIntersectionController = function(app) {
    var memberFilter = new (require('../models/Filter.js'))();
    var memberUtils = new (require('../models/Utils.js'))();

    var getDataByIntersection = function(req, res) {
        var json = memberUtils.parseToBool(req.query);

        memberFilter.getDataByIntersection(json.longitude, json.latitude, json.resolution, function(err, data) {
            if(err) return console.error(err);
            res.json({ data: data });
        });
    }

    return getDataByIntersection;
};

module.exports = DataByIntersectionController;