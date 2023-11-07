## Re-deploying to AWS

In this tutorial, you will re-deploy the LetsGo stack that you modified locally to AWS. Upon completion, the changes you made locally will be published and accessible in the cloud.

This tutorial assumes you have already made and tested local modifications to your app as part of the [building and running locally](building-and-running-locally.md) tutorial.

### Build the Docker images

Build the Docker images that include the local modifications you made in the web, api, or worker components:

```bash
yarn buildx
```

### Re-deploy the stack to AWS

Re-deployment of a stack to AWS uses the same `yarn ops deploy` command as the first deployment you made. The command is designed to be re-entrant and eventually consistent. Run this LetsGo CLI command to re-deploy the modified stack to AWS:

```bash
yarn ops deploy -a all
```

This will run for several minutes and generate a lot of output with the last line reporting a successful deployment:

```bash
...
Deployed: all, api, db, web, worker
```

### Get the URLs of the web and API components

In the course of re-deployment, the public URLs of the _web_ and _api_ components remain unchanged. If you need to remind yourself what they are, you can always run the following command:

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

Notice the output is an HTTP 200 response with a JSON providing some basic information about the API component. Also notice how the `updatedAt` field contains a very recent timestamp indicating the time of the re-deployment.

Finally, navigate to the Web component's Url in the browser, and notice how the local change you made got propagated to the cloud:

<img width="912" alt="image" src="https://github.com/tjanczuk/letsgo/assets/822369/6aab4476-4d16-4ab4-97c4-211a80017266">

You have just successfully re-deployed your stack with a simple local modification to AWS. In the next step, you are going to [set up authentication with Auth0]() to enable authenticating users of your app and secure access to the dashboard section of the _web_ component and to the _API_ component.
