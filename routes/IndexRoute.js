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
  app.get('/', app.controllers.IndexController);
  app.get('/city', app.controllers.CityController);
  app.get('/countries', app.controllers.CountriesController);
  app.get('/countriesbystates', app.controllers.CountriesByStatesController);
  app.get('/databyintersection', app.controllers.DataByIntersectionController);
  app.get('/graphicsfirescount', app.controllers.GraphicsFiresCountController);
  app.get('/latlng', app.controllers.LocationSearchController);
  app.get('/states', app.controllers.StatesController);
  app.get('/protectedarea', app.controllers.ProtectedAreaController);
  app.get('/proxy', app.controllers.ProxyController);
  app.get('/statesbycountries', app.controllers.StatesByCountriesController);
  app.get('/graphicsfirescount', app.controllers.GraphicsFiresCountController);
  app.get('/proxy', app.controllers.ProxyController);

};

module.exports = IndexRoute;
