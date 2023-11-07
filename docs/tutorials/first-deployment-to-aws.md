## First deployment to AWS

In this tutorial, you will make the first deployment of the LetsGo stack to your own AWS account. Upon completion, you will have the web and API components available on publicly accessible, secure URLs, and the worker and database components wired up and ready to use:

<img width="846" alt="image" src="https://github.com/tjanczuk/letsgo/assets/822369/cf6a5118-943e-4c1b-ae61-dda43ab9ffab">

You will also have your local environment prepared for further development. This tutorial does not integrate Auth0 or Stripe - you will do this in separate tutorials.

_NOTE_ This tutorial will deploy several artifacts to your AWS account. The cost of keeping them idle for a day is about $0.70 (that's 70 cents). It is easy to remove all of them when you are done.

### Prerequisities

First, you need to install a few tools, configure your development environment, and create an AWS account if you don't have one already.

#### Node.js

LetsGo requires Node.js v18 or later. Follow the [installation instructions for Node.js](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs) to complete this step. When you are done, you should be able to run the following:

```bash
$ node -v
v20.5.0
```

The reported version number should be >= 18.

#### yarn

LetsGo uses the `yarn` package manager v1.21 or later. It must be installed globally. Run the following to install the latest version of `yarn`:

```bash
npm i -g yarn
```

When done, you should be able to run the following:

```bash
$ yarn -v
1.21.1
```

The reported version number should be >= 1.21

#### git

You must have `git` installed and configured in the system. Follow the [git installation instructions](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) to complete this step. When you are done, you should be able to run the following:

```bash
$ git -v
git version 2.37.1 (Apple Git-137.1)
```

The version and platform may be different on your system.

#### Docker

You must have Docker installed on your system. Follow the [Docker installation instructions](https://docs.docker.com/engine/install/) to complete this step. When you are done, you should be able to run the following:

```bash
$ docker -v
Docker version 24.0.6, build ed223bc
```

The version and build may be different on your system.

### AWS CLI

LetsGo requires that you have an Amazon Web Service (AWS) account and are able to access it using the AWS CLI installed locally.

1. To create a new AWS account, go [here](https://aws.amazon.com/free).
1. To install and configure AWS CLI, follow [these instructions](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).

When you are done, you should be able to run the following:

```bash
$ aws sts get-caller-identity
{
    "UserId": "AIDASVBBTE64I3S2RVCXN",
    "Account": "182606571448",
    "Arn": "arn:aws:iam::182606571448:user/tjanczuk"
}
```

The output of the command should describe your user's identity in AWS.

### Clone the LetsGo repository

Go to a directory where you want to create a subdirectory with your project files and run:

```bash
git clone git@github.com:tjanczuk/letsgo.git
```

You now have a subdirectory called `letsgo` with a copy of the LetsGo project. Go to that subdirectory with:

```bash
cd letsgo
```

All subsequent commands in this tutorial must be run from the `letsgo` directory.

### Install dependencies

Install all dependencies required by the project:

```bash
yarn install
```

### Build the project

Build all components:

```bash
yarn build
```

### Build the Docker images

Build the Docker images for the web, api, and worker components:

```bash
yarn buildx
```

### Create your first LetsGo deployment in AWS

Run the LetsGo CLI command to create your first deployment in AWS:

```bash
yarn ops deploy -a all
```

This will run for several minutes and generate a lot of output with the last line reporting a successful deployment:

```bash
...
Deployed: all, api, db, web, worker
```

### Get the URLs of the web and API components

Call this command to get the status of your deployment:

```bash
$ yarn ops status
Web
  Service
    Status         RUNNING
    Health         HTTP 200 (160ms)
    Url            https://uxb9hhcrtj.us-west-2.awsapprunner.com
...
Api
  Service
    Status         RUNNING
    Health         HTTP 200 (172ms)
    Url            https://6ucstfkcn6.us-west-2.awsapprunner.com
...
```

The output contains a report about the status of the web, API, worker, and database components of your deployment. In the _Web_ and _Api_ sections, locate the _Url_ property. They are the public HTTPS URLs for the web and API components, respectively.

### Validate deployment

Now, call the health endpoint of the API component with _curl_. The endpoint is the combination of the API's Url with the `/v1/health` path, e.g.:

```bash
$ curl https://6ucstfkcn6.us-west-2.awsapprunner.com/v1/health
{"ok":true,"imageTag":"9225060f1903ddef","updatedAt":"2023-11-04T22:08:24.392Z"}
```

Notice the output is an HTTP 200 response with a JSON providing some basic information about the API component.

Lastly, navigate to the Web component's Url in the browser:

<img width="912" alt="image" src="https://github.com/tjanczuk/letsgo/assets/822369/ccca4a7e-a14f-4ceb-9864-2810ef083122">

Congratulations! You have just made your first deployment of the LetsGo stack to your own AWS account. You are ready to start making changes and adjustments to the app, and the first step is to learn how to [build and run the stack locally](building-and-running-locally.md).
