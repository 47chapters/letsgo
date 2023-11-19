## Building and running locally

In this tutorial, you will run the LetsGo stack locally as you normally would during the active development of your app. Upon completion, you will have the _web_, _API_, and _worker_ components running locally against a database deployed in the cloud, and you will understand how to efficiently make and test code changes:

<img width="914" alt="image" src="https://github.com/tjanczuk/letsgo/assets/822369/c76e6c20-faeb-471e-9c00-7e7684875aa5">

This tutorial assumes you have already completed the [first deployment to AWS](first-deployment-to-aws.md). In particular, the _database_ component must already exist in AWS. All file directory references in this tutorial are relative to the _letsgo_ directory, which is the directory where the LetsGo project was cloned.

### Configure components to run locally

Create the `apps/api/.env`, `apps/worker/.env`, and `apps/web/.env.local` files with the environment variables required by the components to run locally:

```bash
cat > apps/api/.env <<EOF
LETSGO_DEPLOYMENT=main
LETSGO_WEB_URL=http://localhost:3000
LETSGO_API_URL=http://localhost:3001
LETSGO_LOCAL_QUEUE_URL=http://localhost:3002
EOF
cp apps/api/.env /apps/worker/.env
cp apps/api/.env /apps/web/.env.local
```

Later on, when you integrate Auth0 and Stripe into your app, you will add to those local configuration files. But for now, the configuration above is sufficient.

### Run components locally

To run the _web_, _API_, and _worker_ locally, use this command:

```bash
yarn dev
```

This will spawn a number of processes, one for each of the _web_, _API_, and _worker_ components of the stack and one for each of their dependencies. These processes watch the local file system for changes and rebuild and restart components as changes are made.

### Validate the local stack

First, call the health endpoint of the local _API_ component:

```bash
$ curl http://localhost:3001/v1/health
{"ok":true,"imageTag":"unknown","updatedAt":"unknown"}
```

Notice the endpoint returns HTTP 200, which means it is healthy. The JSON response body indicates it is not running any Docker image - simply because the _API_ component is running as a plain Node.js process on your development machine.

Next, navigate the browser to `http://localhost:3000`, which is the locally running _web_ component:

<img width="912" alt="image" src="https://github.com/tjanczuk/letsgo/assets/822369/6e66fba7-f15c-4eb9-9fa0-d5e2b80110e3">

Well done, you are now running the LetsGo stack locally!

### Make a code change

Open `apps/web/src/app/(site)/page.tsx` file in your code editor. Change the `The Service` string to `Hello, world!`. Save the file. You just made a change in the _web_ component of your app.

Go back to the browser window for `http://localhost:3000` and observe the change had an immediate effect:

<img width="912" alt="image" src="https://github.com/tjanczuk/letsgo/assets/822369/e6a77a14-f8f0-414c-9cb7-28214ae6f2d4">

To reduce the development lifecycle, the LetsGo local development environment detects any changes in the files you make, recompiles the dependencies, and restarts the services as necessary for you. This applies equally to the _web_, _API_, and _worker_ components.

Congratulations! You can now run your LetsGo app locally and quickly cycle through changes as you develop your app. Once you are happy with the changes you made locally, it is time to redeploy the new version of your app to AWS. The [re-depoloying to AWS](re-deploying-to-aws.md) tutorial will show you how.
