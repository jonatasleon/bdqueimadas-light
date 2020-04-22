"use strict";

/**
 * Main Route of the system.
 * @class IndexRoute
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 * @author Marcos Vinicius [marcos.araujo@inpe.br]
 */
var IndexRoute = function(app) {
  
  /** Main Routes **/
  app.get(BASE_URL, app.controllers.IndexController);
  app.get(BASE_URL + 'city', app.controllers.CityController);
  app.get(BASE_URL + 'countries', app.controllers.CountriesController);
  app.get(BASE_URL + 'countriesbystates', app.controllers.CountriesByStatesController);
  app.get(BASE_URL + 'databyintersection', app.controllers.DataByIntersectionController);
  app.get(BASE_URL + 'graphicsfirescount', app.controllers.GraphicsFiresCountController);
  app.get(BASE_URL + 'latlng', app.controllers.LocationSearchController);
  app.get(BASE_URL + 'states', app.controllers.StatesController);
  app.get(BASE_URL + 'protectedarea', app.controllers.ProtectedAreaController);
  app.get(BASE_URL + 'proxy', app.controllers.ProxyController);
  app.get(BASE_URL + 'statesbycountries', app.controllers.StatesByCountriesController);
  app.get(BASE_URL + 'graphicsfirescount', app.controllers.GraphicsFiresCountController);
  app.get(BASE_URL + 'proxy', app.controllers.ProxyController);

};

module.exports = IndexRoute;
