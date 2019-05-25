rm bundle.zip
cd server/
zip -r ../bundle.zip . -qq
cd ../build
zip -ur ../bundle.zip . -qq
