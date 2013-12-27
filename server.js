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
    , user = require('./user')
    , client = require('./client')
    //, site = require('./site')
    , path = require('path')
    , port = process.argv[2] || 3000
    , phantom = require('./phantom')
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
    rest.post('/api/login', passport.authenticate('local', { successReturnToOrRedirect: '/account.html', failureRedirect: '/login.html' }));

    rest.get('/dialog/authorize', oauth2.authorization);
    rest.post('/dialog/authorize/decision', oauth2.decision);
    rest.post('/oauth/token', oauth2.token);

    rest.get('/api/userinfo', user.info);
    rest.get('/api/clientinfo', client.info);

    // /ldsorg/stakeId/wardId/profiles?ids=1234,7654&pictures=true&household=true
    // /ldsorg/stakeId/wardId/profiles?ids=1234,7654&pictures=true&household=true
    rest.get('/api/ldsorg/:stakeId/:wardId', function (req, res) {
    });
    rest.get('/api/ldsorg/homeward', function (req, res) {
      console.log('/api/ldsorg/homeward');
      if (!req.user || !req.user.username) {
        res.send({ error: 'no username' });
        return;
      }
      function apiWrap(username, password, callbacks, method, args, done) {
        console.log('phantom.callApi(...)');
        phantom.callApi(
          username
        , password
        , 'getData'
        , [
            callbacks
          , method
          , args
          ]
        , function (err, data) {
            console.log('tried too fast', username);
            if (data) {
              data.id = data.currentUserId;
              data.username = username;
              data.password = password;
            }
            done(err, data);
          }
        );
      }

      apiWrap(
        req.user.username, req.user.password, [], 'getCurrentWard', [{ fullHouseholds: req.query.fullHouseholds }]
      , function (currentWard) {
          res.send(currentWard);
        }
      );
    });
/*
    rest.get('/api/ldsorg/homestake', function (req, res) {
    });
    rest.get('/api/ldsorg/:stakeId', function (req, res) {
    });
*/
  }
    
  // Connect configuration
  app
    .use(connect.logger())
    .use(connect.query())
    .use(connect.cookieParser())
    .use(connect.json())
    .use(connect.urlencoded())
    .use(connect.session({ secret: 'keyboard cat' }))
    .use(function (req, res, next) {
      if (!res.send) {
        res.send = function (obj) {
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