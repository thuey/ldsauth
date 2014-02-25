'use strict';

module.exports.route = function (rest) {
  rest.get(
    '/api/ldsorg'
  , function (req, res, next) {
      var ldsorg = req.user.ldsorg
        ;

      // if it's been a while, sign back in
      // TODO this should also be implemented in ldsorg itself
      if ((Date.now() - req.user.authenticatedAt) < (30 * 60 * 1000)) {
        next();
        return;
      }

      ldsorg.signin(
        function (err) {
          console.log('re-sign-in complete');
          if (err) {
            res.send(err);
            return;
          }

          ldsorg.init(function (data) {
            req.user.meta = data;
            req.user.id = data.currentUserId;
            req.user.authenticatedAt = Date.now();
            next();
          }, null);
        }
      , { username: req.user.username, password: req.user.password }
      );
    }
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
      });
    }
  );
  rest.get(
    '/api/ldsorg/me/stake'
  , function (req, res) {
      var ldsorg = req.user.ldsorg
        ;

      ldsorg.getCurrentStake().getAll(function (profile) {
        res.send(profile);
      });
    }
  );

  // NOTE / TODO / XXX / BUG
  // Right now it seems to make the most sense to me to require
  // the full drill down of stake/ward/household because I have
  // this nagging feeling that the extra context will
  // come in handy down the road
  rest.get(
    '/api/ldsorg/stakes/:stakeUnitNo/wards/:wardUnitNo/households/:householdId'
  , function (req, res) {
      var ldsorg = req.user.ldsorg
        ;

      ldsorg
        .getStake(req.params.stakeUnitNo)
        .getWard(req.params.wardUnitNo)
        .getHouseholdWithPhotos(function (profile) {
          res.send(profile);
        }, req.params.householdId);
    }
  );
  rest.get(
    '/api/ldsorg/stakes/:stakeUnitNo/wards/:wardUnitNo/photo-list'
  , function (req, res) {
      var ldsorg = req.user.ldsorg
        ;

      ldsorg
        .getStake(req.params.stakeUnitNo)
        .getWard(req.params.wardUnitNo)
        .getPhotoList(function (profile) {
          res.send(profile);
        });
    }
  );
  rest.get(
    '/api/ldsorg/stakes/:stakeUnitNo/wards/:wardUnitNo/member-list'
  , function (req, res) {
      var ldsorg = req.user.ldsorg
        ;

      ldsorg
        .getStake(req.params.stakeUnitNo)
        .getWard(req.params.wardUnitNo)
        .getMemberList(function (profile) {
          res.send(profile);
        });
    }
  );
  rest.get(
    '/api/ldsorg/stakes/:stakeUnitNo/wards/:wardUnitNo/roster'
  , function (req, res) {
      var ldsorg = req.user.ldsorg
        ;

      ldsorg
        .getStake(req.params.stakeUnitNo)
        .getWard(req.params.wardUnitNo)
        .getRoster(function (profile) {
          res.send(profile);
        });
    }
  );
  rest.get(
    '/api/ldsorg/stakes/:stakeUnitNo/wards/:wardUnitNo/info'
  , function (req, res) {
      var ldsorg = req.user.ldsorg
        ;

      ldsorg
        .getStake(req.params.stakeUnitNo)
        .getWard(req.params.wardUnitNo)
        .getAll(function (profile) {
          res.send(profile);
        }, { fullHouseholds: false });
    }
  );
  rest.get(
    '/api/ldsorg/stakes/:stakeUnitNo/wards/:wardUnitNo'
  , function (req, res) {
      var ldsorg = req.user.ldsorg
        ;

      ldsorg
        .getStake(req.params.stakeUnitNo)
        .getWard(req.params.wardUnitNo)
        .getAll(function (profile) {
          res.send(profile);
        });
    }
  );
  rest.get(
    '/api/ldsorg/stakes/:stakeUnitNo'
  , function (req, res) {
      var ldsorg = req.user.ldsorg
        ;

      ldsorg
        .getStake(req.params.stakeUnitNo)
        .getAll(function (profile) {
          res.send(profile);
        });
    }
  );
};
