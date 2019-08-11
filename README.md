# WECO Web App

# **Weco Codebase Setup Instructions For Local Development**
~ 2019

# Pre-setup Requirements

-   Download and install a [source code editor](https://en.wikipedia.org/wiki/Source_code_editor) and [terminal](https://www.quora.com/In-coding-terms-what-is-a-terminal-and-what-is-it-used-for)
    

	-   Recommended: [Virtual Studio Code](https://code.visualstudio.com/) integrates both (free and available for Windows, MacOS, and Linux)
    

-   Download and install Git: [](https://git-scm.com/download) [https://git-scm.com/download#](https://git-scm.com/download#)
    
-   Download and install Node.js: [https://nodejs.org/en/](https://nodejs.org/en/)

-   Download and install Python https://www.python.org/

-   Download and install PiP https://www.liquidweb.com/kb/install-pip-windows/
    
-   Download and Install Docker Toolbox: [https://docs.docker.com/toolbox/overview/](https://docs.docker.com/toolbox/overview/)
    
	-   You will have to create new account in the process. Keep your user id and password stored safely for future access
	
	-   After you run the installer, restart your computer before opening the application or it may cause your computer to crash
	
	-   Go to the installation folder of docker and from ~/.docker/config.json just remove the "credsStore": "wincred
	
	-   after that install pip packages using the commands:
			"pip install boto" and
			"pip install boto3"
	
	-   Request the server environment variables file from Weco Admins
    
	-   Email james@weco.io or send us a message on [Discord](https://discord.gg/n4xqXj7)    

# Setup

-   Create a new folder on your hard drive to store the codebase
    
-   Open your terminal and navigate to the new folder
    
-   Clone the “webb app” (development branch) and “server” (local branch) repositories from [https://github.com/WeCollective](https://github.com/WeCollective) to the folder

	-   Enter “git clone --single-branch --branch develop [https://github.com/WeCollective/webapp.git](https://github.com/WeCollective/webapp.git)”
    
	-   Enter “git clone --single-branch --branch local [https://github.com/WeCollective/server.git](https://github.com/WeCollective/server.git)”

-   Add the server environment variables file to the "server" folder

	-   Make sure the file is named ".env" with a full stop at the start, not just "env", or else it won't work. You can rename the file this way using Notepad on Windows
	
-   Open the "Docker Quickstart Terminal" and wait for it to load

-   After Booting up docker open up Kitematic (Should be installed with docker toolbox)

-   At the bottom left click on Docker CLI

-   NPM will probably give you an error with powershell, to fix that, locate where nodejs is installed on your pc (usually at C:\Program Files\nodejs) then go to .\node_modules\npm and open up npmrc and change prefix=${APP_DATA} to prefix=C:\Program Files\nodejs\node_modules\npm    (change ${APP_DATA} to your npm module in your nodejs folder)

-   Navigate in your powershell teminal to the “webapp” folder 

	-   Enter “npm install”
    
	-   Enter “npm start”
    
	-   If this has worked correctly [https://localhost:8081](https://localhost:8081/) will now display Weco’s template in your browser but won’t load any content

-   Open a new docker CLI terminal from Kitematic and navigate to the “server” folder

	-   Enter “npm install”

	-   Enter “npm install shelljs”
    
	-   Enter “npm run [start:local](https://github.com/WeCollective/server/blob/master/package.json#L15)” and wait for 4 minutes until the server and localstack have been correctly loaded
    
	-   If this has worked correctly [https://localhost:8081](https://localhost:8081/) will now load content from Weco’s [development environment](https://en.wikipedia.org/wiki/Deployment_environment#Development)

	-   Note: Posts and Users will be added only from the dump db files and any users or posts you create will not be kept throughout localstack restarts (to keep them you can add an entry as a json file at (lambda_stuff/dump/the corresponding table) )
    
	-   Changes made to your local code repository will now appear at [](https://localhost:8081/) [https://localhost:8081](https://localhost:8081)

-   This will start a service called localstack which emulates AWS services. Any changes or interactions with aws can be done using command-line arguments through the aws api, which should be installed already (see documentation at: https://docs.aws.amazon.com/cli/latest/index.html). It will run in the background until you stop it. It is suggested that you run it until you want to stop working as it takes 4 minutes to restart. At the end of the work session to stop it run:

	-   “npm run stop:localstack”
    
# Setup SSL first time running the project:

1. to run the project and use the certificates you have to install them first
2. to install them go to
	for server: config\ssl and double click on ia.p12, that will self-sign the cert for the api, just continue clicking next and accept at the end
	for the webapp: go to config\ssl and click on the ia.p12, install that (click next a bunch of times)
3. You're good to go! https should not give you a problem and certificates should show up as verified (little lock left of the url isn't red)
_P.S. Not green because the certificate is self-signed_


# Pushing changes to GitHub

-   We use the [Gitflow Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) for the development of Weco’s codebase
    
-   Request to become a member of the WeCollective organisation on Github [here](https://github.com/orgs/WeCollective/people).
    
-   Create a new branch from the [develop branch](https://github.com/WeCollective/webapp/tree/develop) on the “webapp” repository and give it a unique name
    
-   Commit any changes you make in your local directory to the new branch and create a pull request to develop
    
-   When the branch is ready for review, let us know on discord or send an email to [james@weco.io](mailto:james@weco.io) so we can begin testing  out the feature you’ve developed.
    
-   If your feature is accepted, we will merge your new branch into the main [develop branch](https://github.com/WeCollective/webapp/tree/develop) and the changes will be deployed to the development environment: [http://webapp-dev.eu9ntpt33z.eu-west-1.elasticbeanstalk.com/](http://webapp-dev.eu9ntpt33z.eu-west-1.elasticbeanstalk.com/)
    
-   When the updates in the [develop branch](https://github.com/WeCollective/webapp/tree/develop) have been reviewed and are ready to go live, one of Weco’s admins will merge the develop branch with the [master branch](https://github.com/WeCollective/webapp), deploying those changes to the production environment: [https://www.weco.io/](https://www.weco.io/)

The front-end web application and server used for the WECO web application.

# How to Deploy New Versions

1. Configure your `weco-iam` profile. You should receive your access keys upon your IAM account creation.
    1. On MacOS, this is done by opening your Terminal and entering the command `open ~/.aws/credentials`.
    2. Add the following lines into the file.
        ```
        [weco-iam]
        aws_access_key_id = <YOUR_ACCESS_KEY>
        aws_secret_access_key = <YOUR_SECRET_KEY>
        ```
    3. Save and close the file.
2. Execute the `npm run build:dev` command. This will replace the endpoints in the app with the correct ones on the server.
3. Commit the changes to the CVS.
4. Execute the `npm run deploy:dev` command.
