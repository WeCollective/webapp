# WECO Web App

# **Weco Codebase Setup Instructions**
~ 2019

# Pre-setup Requirements

-   Download and install a [source code editor](https://en.wikipedia.org/wiki/Source_code_editor) and [terminal](https://www.quora.com/In-coding-terms-what-is-a-terminal-and-what-is-it-used-for)
    

	-   Recommended: [Virtual Studio Code](https://code.visualstudio.com/) integrates both (free and available for Windows, MacOS, and Linux)
    

-   Download and install Git: [](https://git-scm.com/download) [https://git-scm.com/download#](https://git-scm.com/download#)
    
-   Download and install Node.js: [https://nodejs.org/en/](https://nodejs.org/en/)
    
-   Download and Install Docker: [https://hub.docker.com/](https://hub.docker.com/)
    

	-   You have to use an account you can create one or you can ask for the shared one
    

# Setup

-   Create a new folder on your hard drive to store the codebase
    
-   Open your terminal and navigate to the new folder
    
-   Clone the “webb app” (development branch) and “server” (local branch) repositories from [https://github.com/WeCollective](https://github.com/WeCollective) to the folder
    

	-   Enter “git clone --single-branch --branch develop https://github.com/WeCollective/webapp.git”
    
	-   Enter “git clone --single-branch --branch local [https://github.com/WeCollective/server.git](https://github.com/WeCollective/server.git)”
    

-   Navigate in your terminal to the “webapp” folder
    

	-   Enter “npm install”
    
	-   Enter “npm start”
    
	-   If this has worked correctly [https://localhost:8081](https://localhost:8081/) will now display Weco’s template in your browser but won’t load any content
    

-   Open a new terminal and navigate to the “server” folder
    

	-   Enter “npm install”
    
	-   Enter “npm run [start:local](https://github.com/WeCollective/server/blob/master/package.json#L15)” and wait for 4 minutes until the server and localstack have been correctly loaded
    
	-   If this has worked correctly [https://localhost:8081](https://localhost:8081/) will now load content from Weco’s [development environment](https://en.wikipedia.org/wiki/Deployment_environment#Development)
    

	-   Note: Posts and Users will be added only from the dump db files and any users or posts you create will not be kept throughout localstack restarts (to keep them you can add an entry as a json file at (lambda_stuff/dump/the corresponding table) )
    
	-   Changes made to your local code repository will now appear at [](https://localhost:8081/) [https://localhost:8081](https://localhost:8081)
    

-   This will start a service called localstack which emulates AWS services. It will run in the background until you stop it. It is suggested that you run it until you want to stop working as it takes 4 minutes to restart. At the end of the work session to stop it run:
    

	-   “npm run stop:localstack”
    

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
