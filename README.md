# WECO Web App

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
2. Execute the `yarn build:dev` command. This will replace the endpoints in the app with the correct ones on the server.
3. Commit the changes to the CVS.
4. Execute the `yarn deploy:dev` command.
