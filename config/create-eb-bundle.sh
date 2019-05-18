rm bundle.zip
cd server/
zip -r ../bundle.zip . -qq
cd ..
ls
cd build
zip -ur ../bundle.zip . -qq

