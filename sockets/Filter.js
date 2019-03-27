const FilterModels = require('../models/Filter.js');
/**
 * Socket responsible for processing filter related requests.
 * @class Filter
 * @variation 3
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberSockets - Sockets object.
 * @property {object} memberFilter - Filter model.
 */
const Filter = function (io) {
  // Sockets object
  const { sockets } = io;
  // Filter model
  const filterModels = new FilterModels();

  // Socket connection event
  sockets.on('connection', (client) => {
    // Spatial filter request event
    client.on('spatialFilterRequest', (json) => {
      if (json.key === 'States' && json.ids.length > 0) {
        filterModels.getStatesExtent(json.ids)
          .then((extent) => {
            client.emit('spatialFilterResponse', { key: json.key, ids: json.ids, extent });
          }).catch(console.error);
      } else if (json.key === 'ProtectedArea') {
        filterModels.getProtectedAreaExtent(json.id)
          .then((extent) => {
            client.emit('spatialFilterResponse', { key: json.key, id: json.id, extent });
          }).catch(console.error);
      } else if (json.key === 'City') {
        filterModels.getCityExtent(json.id)
          .then((err, extent) => {
            client.emit('spatialFilterResponse', { key: json.key, id: json.id, extent });
          }).catch(console.error);
      } else {
        const functionName = `get${json.key}Extent`;
        filterModels[functionName](json.ids, (err, extent) => {
          if (err) return console.error(err);

          client.emit('spatialFilterResponse', { key: json.key, ids: json.ids, extent });
        });
      }
    });

    // Data by intersection request event
    client.on('dataByIntersectionRequest', (json) => {
      filterModels.getDataByIntersection(json.longitude, json.latitude, json.resolution)
        .then((data) => {
          client.emit('dataByIntersectionResponse', { data });
        }).catch(console.error);
    });

    // Country by state request event
    client.on('countriesByStatesRequest', (json) => {
      filterModels.getCountriesByStates(json.states, (err, countriesByStates) => {
        if (err) return console.error(err);

        client.emit('countriesByStatesResponse', { countriesByStates });
      });
    });

    // States by countries request event
    client.on('statesByCountriesRequest', (json) => {
      filterModels.getStatesByCountries(json.countries, (err, states) => {
        if (err) return console.error(err);

        client.emit('statesByCountriesResponse', { states, filter: json.filter });
      });
    });

    // Get satellites request event
    client.on('getSatellitesRequest', (json) => {
      // Object responsible for keep several information to be used in the database query
      const options = {};

      // Verifications of the 'options' object items
      if (json.satellites !== '') options.satellites = json.satellites;
      if (json.biomes !== '') options.biomes = json.biomes;
      if (json.extent !== '') options.extent = json.extent;
      if (json.countries !== null && json.countries !== '') options.countries = json.countries;
      if (json.states !== null && json.states !== '') options.states = json.states;
      if (json.cities !== undefined && json.cities !== null && json.cities !== '') options.cities = json.cities;

      filterModels.getSatellites(json.dateTimeFrom, json.dateTimeTo, options)
        .then((err, satellitesList) => {
          client.emit('getSatellitesResponse', { satellitesList });
        }).catch(console.error);
    });
  });
};

module.exports = Filter;
