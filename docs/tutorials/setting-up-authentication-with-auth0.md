## Setting up authentication with Auth0

In this tutorial, you will integrate with Auth0 to authenticate users of your app. You will use authentication to secure the dashboard portion of your _web_ component as well as the HTTP endpoints of the _API_ component. To do this, you will first configure Auth0, then make changes to your app and test it locally, and finally re-deploy the secured application to AWS. Upon completion, you will be able to log in to the dashboard portion of your _web_ component using your Google Account:

<img width="1312" alt="image" src="https://github.com/tjanczuk/letsgo/assets/822369/4d36bb48-5463-4d1b-af0d-6bbbbc7771fd">

This tutorial assumes you have already made the [first deployment of your application to AWS](first-deployment-to-aws.md), and then completed one full development cycle including [re-deploying your application to AWS](re-deploying-to-aws.md). Let's get started!

### Get the public URL of your web application

Run the following command:

```bash
$ yarn ops status -a web
...
Web
  Service
    Status         RUNNING
    Health         HTTP 200 (206ms)
    Url            https://uxb9hhcrtj.us-west-2.awsapprunner.com
...
```

Take note of the _Url_ value, which is the public HTTPS URL of your website. Let's call it _base Url_ - we will be using it when configuring Auth0 in the next steps.

### Sign up to Auth0

We are going to be using Auth0 as the third-party authentication provider. If you don't have an Auth0 account, you can create one [here](https://auth0.com/signup).

### Create the Auth0 API

Go to the _Applications / APIs_ section of the Auth0 management portal and create a new API. Give it a _Name_ you like and set the _Identifier_ to `letsgo:service` (this is important):

<img width="1312" alt="image" src="https://github.com/tjanczuk/letsgo/assets/822369/e466753e-62ef-4de7-acdc-a608c8b892d3">

Once the Auth0 API is created, go to its settings, turn on _Allow Offline Access_, and _Save_ the change:

<img width="1023" alt="image" src="https://github.com/tjanczuk/letsgo/assets/822369/5f293fe5-15df-4953-a3e2-c207dd1d4a6b">

### Create the Auth0 application

Next, in the Auth0 management portal, go to the _Applications / Applications_ section and create a new application. Give it a _Name_ you like and choose _Regular Web Application_ for the application type.

<img width="1312" alt="image" src="https://github.com/tjanczuk/letsgo/assets/822369/48939550-3376-4a77-83d0-da3e5f9a483e">

Once the Auth0 application has been created, go to its settings, find the _Basic Information_ section, and take note of the following values: _Domain_, _Client ID_, and _Client Secret_. We will be using them later when configuring your LetsGo application.

<img width="1413" alt="image" src="https://github.com/tjanczuk/letsgo/assets/822369/364e02a4-b6c7-4836-83dd-972611694856">

On the same settings page, find the _Application URIs_ section, and make the following changes:

- In _Allowed Callback URLs_, enter two URLs separated by a comma:
  - `http://localhost:3000/api/auth/callback`
  - `{base-url}/api/auth/callback`, where `{base-url}` is the _base URL_ of your website you obtained by running `yarn ops status -a web` before
- In _Allowed logout URLs_ and in the _Allowed Web Origins_, enter two URLs separated by a comma:
  - `http://localhost:3000`
  - the _base URL_ of your website

<img width="1413" alt="image" src="https://github.com/tjanczuk/letsgo/assets/822369/a6f93ea7-beec-4ede-930d-cbadc0caae14">

Scroll down the page and _Save_ the changes.

While you are at the bottom of the page, expand _Advanced Settings_, go to the _Endpoints_ tab, and take note of the _JSON Web Key Set_ value. It will look similar to `https://goletsgo.us.auth0.com/.well-known/jwks.json`. We will be using this URL in the next steps when instructing your LetsGo application to trust Auth0 as an authentication provider.

### Configure Auth0 in the local environment

Add the following environment variables to the `apps/web/.env.local` file in your project:

```bash
cat >> apps/web/.env.local <<EOF
AUTH0_ISSUER_BASE_URL=https://{auth0-domain}
AUTH0_CLIENT_ID={auth0-client-id}
AUTH0_CLIENT_SECRET={auth0-client-secret}
AUTH0_SECRET={auth0-secret}
AUTH0_AUDIENCE=letsgo:service
AUTH0_SCOPE=openid profile email offline_access
AUTH0_BASE_URL=http://localhost:3000
EOF
```

Remember to substitute the _Domain_, _Client ID_, and _Client Secret_ values from the previous step for `{auth0-domain}`, `{auth0-client-id}`, and `{auth0-client-secret}`, respectively.

For `{auth0-secret}`, generate a random password - this is the key that will be used to encrypt Auth0 cookies when you run your app locally. You can run `node -p "Math.random().toString(32).substring(2)"` to quickly generate a pseudo-random value which should be good enough for the purpose.

### Configure Auth0 as a trusted issuer

Run the following command to register your Auth0 tenant as a trusted authentication provider:

```bash
yarn ops issuer add --issuer https://{auth0-domain}/ --jwks {json-web-key-set-url}
```

Remember to substitute _Domain_ and _JSON Web Key Set_ URL for `{auth0-domain}` and `{json-web-key-set-url}`, respectively.

**NOTE** Take note of the trailing slash in the value of the `--issuer` option. For example, your command to register an Auth0 issuer will look similar to:

```bash
yarn ops issuer add --issuer https://goletsgo.us.auth0.com/ --jwks https://goletsgo.us.auth0.com/.well-known/jwks.json
```

### Run your application locally and test the authentication

Start your application locally with:

```bash
yarn dev
```

Then navigate to `http://localhost:3000` in the browser and click the _Login_ link in the navbar. You should be redirected to Auth0 and see the Auth0 login dialog:

<img width="1312" alt="image" src="https://github.com/tjanczuk/letsgo/assets/822369/4d36bb48-5463-4d1b-af0d-6bbbbc7771fd">

From here, you can choose to log in using your Google Account or choose _Sign up_ to create a new username and password for your app. After a successful login, you will be redirected back to your locally running application. You will see a page that is part of the management dashboard of your application only available to authenticated users. Sections of this page allow you to manage certain settings of the tenant of your application which was created when you first logged in:

<img width="1320" alt="LetsGo Web - Dashboard" src="https://github.com/47chapters/letsgo/assets/822369/21c488c8-a798-4723-9c07-338d58be248a">

Now that you have authentication working locally, you will configure and re-deploy your app to AWS.

### Configure Auth0 in AWS and re-deploy the app

Run the following commands to configure Auth0 for the deployment of your app in AWS:

```bash
yarn ops config set AUTH0_ISSUER_BASE_URL=https://{auth0-domain}
yarn ops config set AUTH0_CLIENT_ID={auth-client-id}
yarn ops config set AUTH0_CLIENT_SECRET={auth0-client-secret}
```

Remember to substitute the _Domain_, _Client ID_, and _Client Secret_ values from the previous step for `{auth0-domain}`, `{auth0-client-id}`, and `{auth0-client-secret}`, respectively.

For those configuration changes to take effect, you need to re-deploy your application with:

```bash
yarn ops deploy -a all
```

Once the deployment command is completed, navigate the browser to the public URL of your website (which you can obtain by running `yarn ops status -a web`), and click the _Login_ link in the navbar. You should be taken through the same login flow as you just tested locally. After login, you will be redirected to the same tenant management page you have seen locally.

### Test API authentication

At this point, the _API_ component of your app can also leverage the trust relationship with Auth0 to authenticate callers. To demonstrate it, we will call a secure API endpoint of your app with and without an access token issued by Auth0.

First, start your application locally unless it is already running:

```bash
yarn dev
```

Then, call the `/v1/me` API of your local API server without providing an access token:

```bash
$ curl http://localhost:3001/v1/me
{"statusCode":401,"message":"Unauthorized"}
```

Notice how the call was rejected with an HTTP 401 response.

Now, let's get the access token we can use. Go to the Auth0 management portal, navigate to _Applications / APIs_, locate the Auth0 API you have previously created and enter it, go to the _Test_ tab, and locate the _Sending the token to the API_ section at the bottom. You should see a template of a `curl` command similar to this:

```text
curl --request GET \
  --url http://path_to_your_api/ \
  --header 'authorization: Bearer eyJhbGciOiJSUzI1NiIsIn....8qXcLuBk9hdb1RFdQ'
```

The `ey...` string in the `authorization` header will be quite a bit longer. It is your access token issued by Auth0. Copy and modify the command by replacing `http://path_to_your_api/` with `http://localhost:3001/v1/me`, then execute the command:

```bash
$ curl --request GET \
>   --url https://localhost:3001/v1/me \
>   --header 'authorization: Bearer eyJhbGciOi...31JX_NE2nAzwI2zyvW8qXcLuBk9hdb1RFdQ'
```

You will see the output similar to this:

```json
{
  "identityId": "idn-6874747073253341253246253246676f6c657473676f2e75732e61757468302e636f6d2532463a4250525a386b626a6d6a315332787253306932646a336f456236626b6561786e253430636c69656e7473",
  "identity": {
    "iss": "https://goletsgo.us.auth0.com/",
    "sub": "BPRZ8kbjmj1S2xrS0i2dj3oEb6bkeaxn@clients"
  },
  "tenants": [
    {
      "tenantId": "ten-d54feabe077948e1af2d97f2e8668b0e",
      "displayName": "Pink Swallow",
      "createdAt": "2023-11-07T22:14:18.446Z",
      "createdBy": {
        "iss": "https://goletsgo.us.auth0.com/",
        "sub": "BPRZ8kbjmj1S2xrS0i2dj3oEb6bkeaxn@clients"
      },
      "updatedAt": "2023-11-07T22:14:18.446Z",
      "updatedBy": {
        "iss": "https://goletsgo.us.auth0.com/",
        "sub": "BPRZ8kbjmj1S2xrS0i2dj3oEb6bkeaxn@clients"
      },
      "plan": {
        "planId": "free",
        "changes": [
          {
            "timestamp": "2023-11-07T22:14:18.446Z",
            "updatedBy": {
              "iss": "https://goletsgo.us.auth0.com/",
              "sub": "BPRZ8kbjmj1S2xrS0i2dj3oEb6bkeaxn@clients"
            },
            "newPlanId": "free"
          }
        ]
      }
    }
  ]
}
```

The HTTP 200 response indicates the API call was successful. The access token presented was trusted by the API. In the JSON response, the `/v1/me` endpoint returns information about the tenants of your app the caller has permissions to.

You can try issuing the same request to the public _API_ endpoint of your app, which you can get by running `yarn ops status -a api`.

Congratulations! You have successfully secured access to your _web_ and _API_ components using Auth0. Users of your app will need to log in to your dashboard using Auth0, and they will need to obtain an access token from Auth0 in order to call the HTTP APIs.

From here, you can choose to [integrate Stripe](./setting-up-payments-with-stripe.md) to offer paid subscriptions or [configure a custom domain](./configuring-custom-domain.md) for your app.
