rm bundle.zip

cd public
zip -ur ../bundle.zip . -qq
ls
cd ..
ls
zip -r bundle.zip server.js