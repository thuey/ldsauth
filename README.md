README
===

This is a login proxy to LDS.org so that you can
easily create apps that rely on LDS.org login and data by connecting via OAuth2.

API
===

OAuth2 Endpoint URLs
---

* Authorization Endpoint URL: <http://ldsauth.org/dialog/authorize>
* Token Endpoint URL: <http://ldsauth.org/oauth/authorize>
* Profile Endpoint URL: <http://ldsauth.org/api/ldsorg/me>

### Client ID & Secret

There's not yet an automated registration process (and the API is still in beta), so email coolaj86@gmail.com to get an application key.

Profile
---

* <http://ldsauth.org/api/ldsorg/me> - metadata about your login
* <http://ldsauth.org/api/ldsorg/me/household> - your profile, contact information, and household
* <http://ldsauth.org/api/ldsorg/me/ward> - full list of callings, organizations, roster, pictures, etc
* <http://ldsauth.org/api/ldsorg/me/stake> - full list of stake-level callings, but no ward-level data (i.e. no pictures / profiles)

Stake Level
---

* <http://ldsauth.org/api/ldsorg/stakes/{#stakeUnitNo}>

Ward Level
---

* <http://ldsauth.org/api/ldsorg/stakes/{#stakeUnitNo}/wards/{#wardUnitoNo}/member-list> - member list with phone numbers
* <http://ldsauth.org/api/ldsorg/stakes/{#stakeUnitNo}/wards/{#wardUnitoNo}/photo-list> - member list with photo urls
* <http://ldsauth.org/api/ldsorg/stakes/{#stakeUnitNo}/wards/{#wardUnitoNo}/households/{#householdId}> - contact info and pics for a household
* <http://ldsauth.org/api/ldsorg/stakes/{#stakeUnitNo}/wards/{#wardUnitoNo}/info> - everything except roster
* <http://ldsauth.org/api/ldsorg/stakes/{#stakeUnitNo}/wards/{#wardUnitoNo}/roster> - merger of member-list, photo-list, and all households
* <http://ldsauth.org/api/ldsorg/stakes/{#stakeUnitNo}/wards/{#wardUnitoNo}> - all of the above in one

Because `member-list` and `photo-list` have hardly any useful information, `roster` is provided as a convenience
resource which merges all ward members (often 300+ members, hence 900+ api calls) together.

It is recommended that you request `roster` and `info` at the start of your application.
`info` will return fairly quickly (< 4 seconds), while `roster` make take quite a while (> 20 seconds).
You can then grab the `households/{#householdId}` for contacts you need to view immediately
while you wait for `roster` to complete.

Data Examples
---

### <http://ldsauth.org/api/ldsorg/me>

```json
{
  "currentUserId": 3330000999,
  "currentUnits": {
    "areaUnitNo": 790117,
    "branch": false,
    "district": false,
    "mission": false,
    "newPhotoCount": -1,
    "stake": true,
    "stakeName": "Provo Utah YSA 13th Stake",
    "stakeUnitNo": 519251,
    "userHasStakeAdminRights": false,
    "userHasWardAdminRights": false,
    "userHasWardCalling": false,
    "userHasWardPhotoAdminRights": false,
    "usersHomeWard": true,
    "ward": true,
    "wardName": "Provo YSA 192nd Ward",
    "wardUnitNo": 268097
  },
  "currentStakes": [
    {
      "district": false,
      "mission": false,
      "stake": true,
      "stakeName": "Provo Utah YSA 13th Stake",
      "stakeUnitNo": 519251,
      "userHasStakeAdminRights": false,
      "wards": [
        {
          "areaUnitNo": 790117,
          "branch": false,
          "district": false,
          "mission": false,
          "newPhotoCount": -1,
          "stake": true,
          "stakeName": "Provo Utah YSA 13th Stake",
          "stakeUnitNo": 519251,
          "userHasStakeAdminRights": false,
          "userHasWardAdminRights": false,
          "userHasWardCalling": false,
          "userHasWardPhotoAdminRights": false,
          "usersHomeWard": false,
          "ward": true,
          "wardName": "Provo YSA 181st Ward",
          "wardUnitNo": 11428
        }
      ]
    }
  ]
}
```

* <http://ldsauth.org/api/ldsorg/me/household>
* <http://ldsauth.org/api/ldsorg/me/ward>
* <http://ldsauth.org/api/ldsorg/me/stake>

TODO
===

Expire caches of ward data

Store things that ought to be on LDS.org, but aren't

  * facebook url (for all)
  * home teachers (private to logged in user)
  * home / visit teachees (private to logged in user)

Email / Phone / Facebook Login
---

It's pretty easy to get an LDS.org account these days, but some people just won't register one.
For wards that have been downloaded it should be possible for a person in that ward to
register via email address (and hence facebook) or phone number.

A member should be able to select a city / state and a ward and if the phone number or email
address matches, they should be able to log in.

Note, however, that roughly 5-10% of the email addresses are invalid.
I assume the phone numbers are about the same.
They should perhaps also provide a last name or have the ward clerk verify them.

* `/wards?state=ut` - lists wards/branches by name and number (about 30,000 worldwide)
* `/stakes?state=ut` - lists stakes/districts by name and number (about 3,500 worldwide)

OAuth Apps
---

The member wishing to create the app should first login via LDS.org and then create an app
with its own `key` and `secret` which are tied to that member.

If the member can no longer login, the app ceases to function.

* `/register`


Installation
===

LDSAuth
---

```bash
git clone git://github.com/LDSorg/ldsauth.git
pushd ldsauth
npm install
```

Run
---

node server 3000
