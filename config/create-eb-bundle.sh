rm bundle.zip
cd server/
zip -r ../bundle.zip . -qq
cd ../build
pwd
zip -ur ../bundle.zip . -qq
