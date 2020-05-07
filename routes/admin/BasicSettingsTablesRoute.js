"use strict";

/**
 * Route of the Admin system basic tables settings.
 * @class BasicSettingsRoute
 *
 * @author Marcos Vinicius [marcos.araujo@inpe.br]
 */
var BasicSettingsTablesRoute = function(app) {
  var controller = app.controllers.admin.BasicSettingsTablesController;

  app.get(BASE_URL + 'admin/basic-settings-tables', controller.basicSettingsTablesController);
  app.post(BASE_URL + 'admin/update-basic-settings-tables', controller.updateBasicTablesSettings);
};

module.exports = BasicSettingsTablesRoute;