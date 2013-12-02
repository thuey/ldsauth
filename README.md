README
===

This is a login proxy to LDS.org so that you can
easily create apps that rely on LDS.org login and data.

Installation
===

First off, you'll need to install PhantomJS on your server

  http://phantomjs.org/download.html

I recommend using oceandigital.com for servers and selecting the latest 64-bit Ubuntu LTS - 12.04, 14.04

I myself have 32-bit 12.04, so I'll give instructions for that for now

```bash
wget https://phantomjs.googlecode.com/files/phantomjs-1.9.2-linux-i686.tar.bz2
tar xvf phantomjs-1.9.2-linux-i686.tar.bz2
pushd phantomjs-1.9.2-linux-i686
rsync -avhHP ./bin/ /usr/local/bin/
```

Notes
===

Took me a few hours of debugging to finally figure out that IndexedDB / WebSQL shim
aren't supported and therefore PouchDB isn't supported by Phantom
