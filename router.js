exports.createRoutes = function(app, routes){
  var resources = function(resource) {
    var prefix = '/' + resource;
    var resourceObj = require('./controllers/' + resource);

    app.get(prefix, resourceObj.index);
    app.get(prefix + '/index', resourceObj.index);
    app.get(prefix + '/new', resourceObj.new); // must be above show link to avoid getting mixed up
    app.get(prefix + '/:id', resourceObj.show);
    app.get(prefix + '/:id/edit', resourceObj.edit);
    app.post(prefix, resourceObj.create);
    app.put(prefix + '/:id', resourceObj.update);
    app.del(prefix + '/:id', resourceObj.destroy);
  }
  app.get('/', routes.index);

  resources('posts');
};