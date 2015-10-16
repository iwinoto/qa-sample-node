[Original tutorial for this code](http://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/doc/qaapi/index.html#sampleApp)

[Watson Question and Answer service documentation](https://www.ng.bluemix.net/docs/services/QuestionAnswer/index.html)

This is an introduction tutorial with the intention of showing how to create a node.js application which uses the Watson Question and Answer service on Bluemix. The node.js application makes REST calls to the Watson Question and Answer service.

# Tools
## `grunt`

This project uses [grunt](http://gruntjs.com/) to manage build and deploy tasks. Install grunt with

    $ npm -g install grunt

You can see a list of `grunt` tasks with:

    $ grunt -h

## `foreman`

Bluemix has started using process definition files to control application processes. The `Procfile` defines how those application processes are started.

When running locally, [foreman](http://blog.daviddollar.org/2011/05/06/introducing-foreman.html) is used to control processes defined in the `Procfile`. `foreman` is a Ruby application so install foreman with

    $ gem install foreman

# Run locally

Follow these steps to set-up and run locally.

## 1. Dependencies

Install all the application dependencies

    $ npm install

## 2. Create Bluemix services

To run locally, the application will still need the Watson Question and Answer service instantiated on Bluemix. You can use `grunt` to create the service

    $ cf login
    $ grunt create_services

This will create a service with the name `QAAPI`.

## 3. Set the local environment to point to remote services

The `.env` file is used for local environment variables. The application code will look for `VCAP_SERVICES` environment variable which will contain the end point and credentials for services needed by the application. We need to alter `VCAP_SERVICES` in `.env` for the service instance you are connecting to, which was created in the previous step.

For Watson services, cut and paste from Bluemix and remove line feed and carriage return since `foreman` only reads environment variables in one line.

## 4. Start the application

Now you can use `foreman` to start the application. `foreman` will read the process start commands from `Procfile` and set the environment variables from `.env`

    $ foreman start web

# Deploy to Bluemix

The project has been modified for Bluemix deployment.
To deploy to Bluemix execute from the app root:

 1. Update the `host` property in `manifest.yml`
 1. push the application using the default manifest file `manifest.yml`
    `$ cf push`

After a successful push the application will be available at:

   http://_your host name_.mybluemix.net/products

# Files

The Question Answer Node.js starter application has files as below:

 *  `app.js`
 
    This file contains the server side JavaScript code for your application written using the Node.js API

 *  `views/`

    This directory contains the views of the application. It is required by the express framework and jade template engine in this sample application.

 *  `public/`

    This directory contains public resources of the application. It is required by the express framework in this sample application.

 *  `package.json`

    This file is required by the Node.js environment. It specifies this Node.js project name, dependencies, and other configurations of your Node.js application.
    
 *  `manifest.yml`

    Describes the application in the Bluemix context. Includes information for applciation name, host name, memory, number of instances and services to bind.

 *  `Procfile`

    Describes the start commands for application processes. This application only has a web process. This is used by Bluemix to start the application and can also be used the applciation locally using `foreman`.

 *  `cf-services.json`

    Used by `grunt` tasks to create services on Bluemix.

 *  `cf-targets.json`

    Unused here.

    Defines Bluemix targets that the application can be deployed to. Used by `grunt` to login to Bluemix targets and set application host name prefixes.
