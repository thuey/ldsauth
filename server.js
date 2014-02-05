(function () {
  'use strict';

  /**
   * Module dependencies.
   */
  var connect = require('connect')
    , app = connect()
    , server
    , passport = require('passport')
    , oauth2 = require('./oauth2')
    , user = require('./api/user')
    , client = require('./api/client')
    //, site = require('./site')
    , path = require('path')
    , port = process.argv[2] || 3000
    ;

  if (!connect.router) {
    connect.router = require('connect_router');
  }
    
  // Passport configuration
  require('./auth').init();

  function route(rest) {
    /*
    rest.get('/', site.index);
    rest.post('/login', site.login);
    rest.get('/logout', site.logout);
    rest.get('/account', site.account);
    */

    oauth2.authorization.forEach(function (ware) {
      rest.get('/dialog/authorize', ware);
    });
    oauth2.decision.forEach(function (ware) {
      if (Array.isArray(ware)) {
        ware.forEach(function (ware) {
          rest.post('/dialog/authorize/decision', ware);
        });
      } else {
        rest.post('/dialog/authorize/decision', ware);
      }
    });
    oauth2.token.forEach(function (ware) {
      rest.post('/oauth/token', ware);
    });

    user.info.forEach(function (ware) {
      rest.get('/api/userinfo', ware);
    });

    client.info.forEach(function (ware) {
      rest.get('/api/clientinfo', ware);
    });

    /*
     * lds.org api wrapping
     */
    rest.post(
      '/api/login'
    , function (req, res, next) {
        passport.authenticate('local', function (err, user) {
          if (!user) {
            res.redirect('/login.html');
          }

          req.login(user, function (err) {
            if (err) {
              console.error(err);
            }
            res.render('account', { json: JSON.stringify(user.meta) });
          });
        })(req, res, next);
      }
    //, passport.authenticate('local', { successReturnToOrRedirect: '/account', failureRedirect: '/login.html' })
    );
    rest.get(
      '/api/ldsorg/me'
    , function (req, res) {
        // TODO serialize & reconstruct
        var ldsorg = req.user.ldsorg
          ;

        ldsorg.getCurrentUserMeta(function (profile) {
          res.send(profile);
          //res.json("/me not implemented");
        });
      }
    );
    rest.get(
      '/api/ldsorg/me/household'
    , function (req, res) {
        // TODO serialize & reconstruct
        var ldsorg = req.user.ldsorg
          ;

        ldsorg.getCurrentHousehold(function (profile) {
          res.send(profile);
          //res.json("/me not implemented");
        });
      }
    );
    rest.get(
      '/api/ldsorg/me/ward'
    , function (req, res) {
        var ldsorg = req.user.ldsorg
          ;

        ldsorg.getCurrentStake().getCurrentWard().getAll(function (profile) {
          res.send(profile);
          //res.json("/me/ward not implemented");
        });
      }
    );
    rest.get(
      '/api/ldsorg/me/stake'
    , function (req, res) {
        var ldsorg = req.user.ldsorg
          ;

        if (ldsorg.stake) {
        }

        res.end("/me/stake not implemented");
      }
    );
  }
    
  // Connect configuration
  app
    .use(connect.logger())
    .use(connect.query())
    .use(connect.json())
    .use(connect.compress())
    .use(connect.cookieParser())
    .use(connect.urlencoded())
    .use(connect.session({ secret: 'keyboard cat' }))
    .use(require('connect-jade')({ root: __dirname + "/views", debug: true }))
    .use(function (req, res, next) {
      if (!res.send) {
        res.send = function (obj) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(obj, null, '  '));
        };
      }
      next();
     })
    .use(function (req, res, next) {
      if (!res.redirect) {
        res.redirect = function (url) {
          res.statusCode = 302;
          res.setHeader('Location', url);
          res.end();
        };
      }
      next();
     })
    .use(passport.initialize())
    .use(passport.session())
    .use(connect.errorHandler({ dumpExceptions: true, showStack: true }))
    .use('/api', function (req, res, next) {
        console.log('[/api] pass by the api');
        if (req.user) {
          next();
          return;
        }

        //passport.authenticate('bearer', { session: false }),
        passport.authenticate('bearer', function (err, data) {
          if (err || (!data && !/login/.test(req.url))) {
            res.send({ error: "Unauthorized", code: 401 });
            return;
          }

          //req.logIn();
          console.log('bearer data');
          console.log(data);
          req.user = data;
          next();
        })(req, res, next);
      })
    .use(connect.router(route))
    .use(connect.static(path.join(__dirname, 'public')))
    ;

  module.exports = app;

  if (require.main === module) {
    server = app.listen(port, function () {
      console.log('Listening on', server.address());
    });
  }
}());
