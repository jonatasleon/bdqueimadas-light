"use strict";

/**
 * Controller responsible for get chart data.
 * @class GraphicsFiresCountController
 *
 * @author Marcos Vinicius [marcos.araujo@inpe.br]
 *
 * @property {object} memberUtils -  'Utils' model.
 * @property {object} memberGraphics -  'Graphics' model.
 */
var GraphicsFiresCountController = function(app) {
    var memberUtils = new (require('../models/Utils.js'))();
    var memberGraphics = new (require('../models/Graphics.js'))();

    var getFiresCount = function(req, res) {
        var json = memberUtils.parseToBool(req.query);
        var options = {};

        if(json.satellites !== '') options.satellites = json.satellites;
        if(json.biomes !== '') options.biomes = json.biomes;
        if(json.countries !== null && json.countries !== '') options.countries = json.countries;
        if(json.states !== null && json.states !== '') options.states = json.states;
        if(json.cities !== null && json.cities !== '') options.cities = json.cities;
        if(json.industrialFires !== null && json.industrialFires !== '') options.industrialFires = json.industrialFires;
        if(json.limit !== null && json.limit !== '') options.limit = json.limit;
        if(json.y !== null) options.y = json.y;

        if(json.key === "week") {
            memberGraphics.getFiresCountByWeek(json.dateTimeFrom, json.dateTimeTo, json.filterRules, options, function(err, firesCount) {
                if(err) return console.error(err);

                var firesTotalCount = {};
                var reduced = firesCount.rows.reduce(function(total, current) { return parseInt(total) + parseInt(current.count) }, 0);
                firesTotalCount.rows = [{"count": reduced.toString()}];

                res.json({ firesCount: firesCount, firesTotalCount: firesTotalCount, id: json.id, y: json.y, key: json.key, title: json.title, limit: json.limit, filterRules: json.filterRules });
            });
        } else if(json.key === "UCE" || json.key === "UCF" || json.key === "TI" || json.key === "UCE_5KM" || json.key === "UCF_5KM" || json.key === "TI_5KM" || json.key === "UCE_10KM" || json.key === "UCF_10KM" || json.key === "TI_10KM") {
            memberGraphics.getFiresCountByPA(json.dateTimeFrom, json.dateTimeTo, json.key, json.filterRules, options, function(err, firesCount) {
                if(err) return console.error(err);

                var firesTotalCount = {};
                var reduced = firesCount.rows.reduce(function(total, current) { return parseInt(total) + parseInt(current.count) }, 0);
                firesTotalCount.rows = [{"count": reduced.toString()}];

                res.json({ firesCount: firesCount, firesTotalCount: firesTotalCount, id: json.id, y: json.y, key: json.key, title: json.title, limit: json.limit, filterRules: json.filterRules });
            });
        } else {
            memberGraphics.getFiresCount(json.dateTimeFrom, json.dateTimeTo, json.key, json.filterRules, options, function(err, firesCount) {
                if(err) return console.error(err);

                var firesTotalCount = {};
                var reduced = firesCount.rows.reduce(function(total, current) { return parseInt(total) + parseInt(current.count) }, 0);
                firesTotalCount.rows = [{"count": reduced.toString()}];

                res.json({ firesCount: firesCount, firesTotalCount: firesTotalCount, id: json.id, y: json.y, key: json.key, title: json.title, limit: json.limit, filterRules: json.filterRules });
            });
        }
    }

    return getFiresCount;
};

module.exports = GraphicsFiresCountController;