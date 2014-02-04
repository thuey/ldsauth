README
===

This is a login proxy to LDS.org so that you can
easily create apps that rely on LDS.org login and data.

Still in the early stages.

The basic proxy work is complete.
The caching is being worked on today.
The API should be complete tomorrow.

API
===

This is just a braindump, the api does not exist yet.

* `/stakes/#{stakeUnitNo}/meta` - includes the wards
* `/stakes/#{stakeUnitNo}/callings` - includes positions
* `/stakes/#{stakeUnitNo}` - includes all of the above
* `/stakes/#{stakeUnitNo}/xattrs` - stuff that ldsauth adds (facebook and twitter links)

* `/wards/#{wardUnitNo}/meta` - not sure...
* `/wards/#{wardUnitNo}/callings` - includes email addresses for all members with callings
* `/wards/#{wardUnitNo}/organizations` - includes all organizations and which members belong to which
* `/wards/#{wardUnitNo}/households` - includes all households (ostensibly all members in a YSA ward)
* `/wards/#{wardUnitNo}/xattrs` - stuff that ldsauth adds (facebook and twitter links)
* `/wards/#{wardUnitNo}` - includes all of the above

* `/households/#{headOfHouseholdId}` - base64 data-urls for family & head of house photos, also email, phone, etc
* `/households/#{headOfHouseholdId}/family.jpg`
* `/households/#{headOfHouseholdId}/head.jpg`
* `/households/#{headOfHouseholdId}/xattrs` - stuff that ldsauth adds (facebook and twitter links)
* `/wards/#{wardUnitNo}/individuals` - includes all of the above for the entire ward (takes about 20s, maybe up to a minute)
* `/wards/#{wardUnitNo}/individuals?ids=x,y,z` - fetches just these members

* GET `/me` - shortcut to /households/#{headOfHouseholdId}
* PATCH `/me` - emails Ward Clerk and Bishop the desired changes

A single call to get info for on individual may take a while as we have to
retrieve stake and ward data before any individual to determine if they have a calling.

Subsequent calls to any other person will be much faster.

At the moment the user logs in the current ward directory will begin to download
and the other directories will download in series.

Due to the caching strategy employed, making individual requests (to get photo and email information)
should still complete quickly.

Whatever ward data exists (less than 30 days old) will be used first.
If the data is more than 24 hours old it will be refreshed and the
client may request to know when it has been updated.

LDS.org Proxy Authentication
---

* `/oauth/dialog` - point your oauth app here to authorize it
* `/login` - post username and password to get a session

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

node index.js
