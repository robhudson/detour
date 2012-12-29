// Module dependencies.
module.exports = function(app, configurations, express) {
  var nconf = require('nconf');

  nconf.argv().env().file({ file: 'local.json' });

  // Configuration

  app.configure(function(){
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    if (!process.env.NODE_ENV) {
      app.use(express.logger('dev'));
    }
    app.use(function(req, res, next) {
      res.locals.session = req.session;
      next();
    });
    app.use(app.router);
    app.locals.pretty = true;
    app.use(function(req, res, next) {
      res.status(404);
      res.json({ message: 'call not found' });
      return;
    });
    app.use(function(req, res, next) {
      res.status(403);
      res.json({ message: 'not allowed' });
      return;
    });
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.json({ message: 'something went wrong' });
    });
  });

  app.configure('development, test', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  });

  app.configure('development', function() {
    app.set('redis-detour', nconf.get('redis_dev'));
  });

  app.configure('test', function() {
    app.set('redis-detour', nconf.get('redis_test'));
  });

  app.configure('prod', function(){
    app.use(express.errorHandler());
  });

  return app;
};
