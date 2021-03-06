'use strict';

/**
 * Module dependencies.
 */

exports.info = [
  function(req, res) {
    // req.authInfo is set using the `info` argument supplied by
    // `BearerStrategy`.  It is typically used to indicate scope of the token,
    // and used in access control checks.  For illustrative purposes, this
    // example simply returns the scope in the response.
    res.send({ user_id: req.user.id, name: req.user.name, scope: req.authInfo && req.authInfo.scope });
  }
];
