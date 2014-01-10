# many thanks to the Chrome 'copy as cURL' debugger tool
curl 'https://signin.lds.org/login.html' \
  -H 'Cookie: ObFormLoginCookie=wh%3Dwww.lds.org%20wu%3D%2Fdirectory%2Fservices%2Fludrs%2Fmem%2Fcurrent-user-id%2F%20wo%3D1%20rh%3Dhttps%3A%2F%2Fwww.lds.org%20ru%3D%2Fdirectory%2Fservices%2Fludrs%2Fmem%2Fcurrent-user-id%2F; s_campaign=HPTH091213090; TS9911fb=44b573ba366aff304abfbe58395d3c969a774ba96bd55a77529be41c5c48bcb99e9e3f178036b620a7e5674894c5a4899bf1025f; TS620597=8e30339d1c6306544d8b20b0f5982991392a914862a3b313529be41bb49166799cfc6fc594c5a489ed4bb13d; TSbdcacb=0ed5e432c53bbe0adaf8cb746ea940efd78782aa3ddaa58e529c3a5594c5a4897449c43f; lds-preferred-lang=eng; mbox=PC#1382938414528-764297.19_31#1396906955|check#true#1389131015|session#1389130954359-246224#1389132815; s_cc=true; __CT_Data=gpv=64&apv_59_www11=63; WRUID=0; s_ppv=lds.org%253Ahomepage%2C32%2C32%2C735; s_vi=[CS]v1|292B9FFC85012AFC-4000010EC01D4E25[CE]; aam_uuid=49035470207866806541345764450563202613; s_fid=6E7734BE492B7E2E-116DA8B4B5729CCA; s_sq=%5B%5BB%5D%5D; ObSSOCookie=TtSO%2FjIiqwiIeJ8LlZo0eJnkupbrLTy5iafmW3f6kTu0UwE7SytqFtRrN5N3K601Qj2PiCp9rGp0IgByFezLSnNOX34BmOqS2mapZ6ciqAvI0kt%2FpxtwCzKNXZ1Dsn0nuSMdL%2Fa9IJurZYT6yX678MAo8ujwmUpVXtlc6TAUN70ZxlTOUXS4%2FaQSA6nX9l%2Fb0Kig5USle3mMb1rw4AcohDuTwieXesWlsGNV5pi0v0e6vFdBcf%2BDMyv4LMngUFLqaZ7QprHewdN%2FzNxo8aZVs23siU%2FJtweIg2b6q9OVvI%2Fb3fToiwaq8v%2B0Yraiv9bKDju7Jkl4SyE4EfbeJ3rF%2BoTpouIqltcAeKwnJWeKsjs%3D; lds-preferred-lang-v2=eng' \
  -H 'Origin: https://signin.lds.org' \
  -H 'Accept-Encoding: gzip,deflate,sdch' \
  -H 'Host: signin.lds.org' \
  -H 'Accept-Language: en-US' \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8' \
  -H 'Cache-Control: max-age=0' \
  -H 'Referer: https://signin.lds.org/SSOSignIn/' \
  -H 'Connection: keep-alive' \
  --data 'username=foo-user&password=foo-password' \
  --compressed
