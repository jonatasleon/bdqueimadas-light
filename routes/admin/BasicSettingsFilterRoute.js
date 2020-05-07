"use strict";

/**
 * Route of the Admin system basic filter settings.
 * @class BasicSettingsRoute
 *
 * @author Marcos Vinicius [marcos.araujo@inpe.br]
 */
var BasicSettingsFilterRoute = function(app) {
  var controller = app.controllers.admin.BasicSettingsFilterController;

  app.get(BASE_URL + 'admin/basic-settings-filter', controller.basicSettingsFilterController);
  app.post(BASE_URL + 'admin/update-basic-settings-filter', controller.updateBasicFilterSettings);
};

module.exports = BasicSettingsFilterRoute;