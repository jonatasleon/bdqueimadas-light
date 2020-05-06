"use strict";

/**
 * Route of the Admin system basic map settings.
 * @class BasicSettingsRoute
 *
 * @author Marcos Vinicius [marcos.araujo@inpe.br]
 */
var BasicSettingsMapRoute = function(app) {
  var controller = app.controllers.admin.BasicSettingsMapController;

  app.get('/admin/basic-settings-map', controller.basicSettingsMapController);
  app.post('/admin/update-basic-settings-map', controller.updateBasicMapSettings);
};

module.exports = BasicSettingsMapRoute;