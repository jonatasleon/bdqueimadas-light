"use strict";

/**
 * Controller responsible for get attributes data for specific location.
 * @class ProxyController
 *
 * @author Marcos Vinicius [marcos.araujo@inpe.br]
 *
 * @property {object} memberUtils -  'Utils' model.
 * @property {object} memberHttp -    http module.
 * @property {object} memberHttps -   https module.
 */
var ProxyController = function(app) {
    var memberUtils = new (require('../models/Utils.js'))();
    var memberHttp = require('http');
    var memberHttps = require('https');

    var getProxy = function(req, res) {
        var json = memberUtils.parseToBool(req.query);

        var requestObject = json.url.substring(0, 5) === "https" ? memberHttps : memberHttp;
          // Http request to the received url
          requestObject.get(json.url, function(resp) {
            var body = '';
    
            // Data receiving event
            resp.on('data', function(chunk) {
              body += chunk;
            });
    
            // End of request event
            resp.on('end', function() {
              if(json.format === 'xml') {
                body = body.replace(/>\s*/g, '>');
                body = body.replace(/\s*</g, '<');
              } else if(json.format === 'json') {
                try {
                  body = JSON.parse(body);
                } catch(ex) {
                  body = {};
                }
              }
    
              if(json.requestId == 'GetFeatureInfoTool')
                res.json({ msg: body, requestId: json.requestId });
              else
                res.json({ msg: body, requestId: json.requestId })
            });
          }).on("error", function(e) {
            console.error(e.message);
          });
    }

    return getProxy;
};

module.exports = ProxyController;