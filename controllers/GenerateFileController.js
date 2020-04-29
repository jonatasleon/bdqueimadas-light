"use strict";

/**
 * Controller responsible for export file
 * @class GenerateFileController
 *
 * @author Marcos Vinicius [marcos.araujo@inpe.br]
 *
 * @property {object} memberFilter - 'Filter' model.
 * @property {object} memberUtils -  'Utils' model.
 */
var GenerateFileController = function(app) {
    var memberExportation = new (require('../models/Exportation.js'))();
    var memberUtils = new (require('../models/Utils.js'))();
    var memberFs = require('fs');
    var memberPath = require('path');
    var memberExec = require('child_process').exec;
    var memberExecSync = require('child_process').execSync;
    var memberSpawn = require('child_process').spawn;

    var generateFile = function(req, res) {
        var json = memberUtils.parseToBool(req.query);
        var options = {};
    
        if(json.satellites !== undefined && json.satellites !== null && json.satellites !== '') options.satellites = json.satellites;
        if(json.biomes !== undefined && json.biomes !== null && json.biomes !== '') options.biomes = json.biomes;
        if(json.countries !== undefined && json.countries !== null && json.countries !== '') options.countries = json.countries;
        if(json.states !== undefined && json.states !== null && json.states !== '') options.states = json.states;
        if(json.cities !== undefined && json.cities !== null && json.cities !== '') options.cities = json.cities;
        if(json.decimalSeparator !== undefined && json.decimalSeparator !== null && json.decimalSeparator !== '') options.decimalSeparator = json.decimalSeparator;
        if(json.fieldSeparator !== undefined && json.fieldSeparator !== null && json.fieldSeparator !== '') options.fieldSeparator = json.fieldSeparator;
        
    
        var requestFormats = json.format.split(',');
        //if(memberUtils.stringInArray(requestFormats, 'all'))
        //  requestFormats = ['csv', 'geojson', 'kml', 'shapefile'];
        options.format = requestFormats;
        
        var dataTimeFrom = json.dateTimeFrom.split(' ');
        var dataTimeTo = json.dateTimeTo.split(' ');
        var fileName = 'Focos.' + dataTimeFrom[0] + '.' + dataTimeTo[0];
        
        // Call of the method 'registerDownload', responsible for registering the download in the database
        require('crypto').randomBytes(24, function(err, buffer) {
            var today = new Date();
    
            var dd = today.getDate();
            var mm = today.getMonth() + 1;
            var yyyy = today.getFullYear();
    
            if(dd < 10) dd = '0' + dd;
            if(mm < 10) mm = '0' + mm;
    
            var todayString = yyyy + '-' + mm + '-' + dd;
            var filesFolder = buffer.toString('hex') + '_--_' + todayString;
    
            var connectionString = memberExportation.getPgConnectionString();
            var separator = (options.fieldSeparator !== undefined && options.fieldSeparator == "semicolon" ? "SEMICOLON" : "COMMA");
            var folderPath = memberPath.join(__dirname, '../tmp/' + filesFolder);
    
            try {
              memberFs.mkdirSync(folderPath);
            } catch(e) {
              if(e.code != 'EEXIST')
                console.error(e);
            }
    
            var processedFormats = 0;
    
            for(var i = 0, formatsLength = requestFormats.length; i < formatsLength; i++) {
              switch(requestFormats[i]) {
                case 'csv':
                  var fileExtention = '.csv';
                  var ogr2ogrFormat = 'CSV';
                  break;
                case 'shapefile':
                  var fileExtention = '.shp';
                  var ogr2ogrFormat = 'ESRI Shapefile';
                  break;
                case 'kml':
                  var fileExtention = '.kml';
                  var ogr2ogrFormat = 'KML';
                  break;
                default:
                  var fileExtention = '.json';
                  var ogr2ogrFormat = 'GeoJSON';
              }
              if(requestFormats[i] == 'shapefile') {
                try {
                  memberFs.mkdirSync(folderPath + "/shapefile");
                } catch(e) {
                  if(e.code != 'EEXIST')
                    console.error(e);
                }
              }
    
              var ogr2ogr = memberExportation.ogr2ogr();
              var filePath = memberPath.join(__dirname, '../tmp/' + filesFolder + (requestFormats[i] == 'shapefile' ? '/shapefile/' : '/') + fileName + fileExtention);
              var args = ['-progress', '-F', ogr2ogrFormat, filePath, connectionString, '-sql', memberExportation.getQuery((requestFormats[i] != 'csv'), json.dateTimeFrom, json.dateTimeTo, options), '-skipfailures'];
    
              if(requestFormats[i] == "csv")
                args.push('-lco', 'LINEFORMAT=CRLF', '-lco', 'SEPARATOR=' + separator);
    
              var spawnCommand = memberSpawn(ogr2ogr, args);
    
              spawnCommand.on('error', function(err) {
                console.error(err);
                res.json(err);
              });
    
              spawnCommand.on('exit', function(code) {
                processedFormats++;
                if(processedFormats == formatsLength) {
                  var finalizeProcess = function() {
                    if(requestFormats.length == 1) {
                      switch(requestFormats[0]) {
                        case 'csv':
                          var fileExtention = '.csv';
                          break;
                        case 'shapefile':
                          var fileExtention = '.shp';
                          break;
                        case 'kml':
                          var fileExtention = '.kml';
                          break;
                        default:
                          var fileExtention = '.json';
                      }
                      var finalPath = memberPath.join(__dirname, '../tmp/' + filesFolder) + "/" + fileName + fileExtention + (requestFormats[0] == 'shapefile' ? '.zip' : '');
                      var finalFileName = fileName + fileExtention + (requestFormats[0] == 'shapefile' ? '.zip' : '');
                      res.json({ 
                        folder: filesFolder,
                        file: finalFileName
                      });
                    } else {
                      var finalPath = memberPath.join(__dirname, '../tmp/' + filesFolder) + "/" + fileName + ".zip";
                      var finalFileName = fileName + ".zip";
                      var zipGenerationCommand = "zip -r -j " + finalPath + " " + folderPath;
                      memberExec(zipGenerationCommand, function(zipGenerationCommandErr, zipGenerationCommandOut, zipGenerationCommandCode) {
                        if(zipGenerationCommandErr) return console.error(zipGenerationCommandErr);
                        res.json({ 
                          folder: filesFolder,
                          file: finalFileName
                        });
                      });
                    }
                  };
                  if(memberUtils.stringInArray(requestFormats, 'shapefile')) {
                    var zipPath = memberPath.join(__dirname, '../tmp/' + filesFolder) + "/" + fileName + ".shp.zip";
                    var zipGenerationCommand = "zip -r -j " + zipPath + " " + folderPath + "/shapefile";
                    try {
                      var zipGenerationCommandResult = memberExecSync(zipGenerationCommand);
                      memberUtils.deleteFolderRecursively(folderPath + "/shapefile", finalizeProcess);
                    } catch(e) {
                      console.error(e);
                    }
                  } else {
                    finalizeProcess();
                  }
                }
              });
            }
          });
    }

    return generateFile;
};

module.exports = GenerateFileController;