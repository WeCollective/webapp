const shell = require('shelljs');

const { argv } = require('yargs');



const branch = process.env.TRAVIS_BRANCH || argv.branch || 'develop';

const env = branch === 'master' ? 'webapp-prod' : 'webapp-dev';



let command = 'sh ./config/create-eb-bundle.sh';

console.log('Bundling Elastic Beanstalk artifacts...');

const bundled = shell.exec(command);

if (bundled.code !== 0) {

  shell.exit(bundled.code);

}



command = `eb deploy ${env}`;

console.log(`Deploying to environment ${env}...`);

const deployed = shell.exec(command);

if (deployed.code !== 0) {

  shell.exit(deployed.code);

}