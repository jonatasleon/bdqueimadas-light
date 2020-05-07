"use strict";


/**
 * Route of the Admin system index.
 * @class IndexRoute
 *
 * @author Marcos Vinicius [marcos.araujo@inpe.br]
 */
var IndexRoute = function(app) {
  app.get(BASE_URL + 'admin', function(request, response) {
    response.redirect(BASE_URL + 'admin/basic-settings-filter');
  });
};

module.exports = IndexRoute;
