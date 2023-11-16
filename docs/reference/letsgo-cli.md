## LetsGo CLI (yarn ops)

The LetsGo CLI is the primary devops tool you will use to manage the lifecycle of your app. It can be invoked with `yarn ops` from the root of the repository after the first build.

LetsGo CLI allows you to create new deployments of your application in AWS as well as manage existing ones. It supports managing trust, inspecting the database, checking the status of the deployment, helping with the setup of a custom domain, and managing deployment configuration.

### Installation

The LetsGo CLI is an integral part of the LetsGo monorepo. It is located in the `apps/ops` directory and built as part of the repository build. If you followed the [first deploment to AWS](../tutorials/first-deployment-to-aws.md) tutorial, the CLI has already been built and is ready for use.

Otherwise, to build the CLI, make sure all dependencies are installed and then build the entire monorepo:

```bash
yarn install
yarn build
```

When this is done, the LetsGo CLI can be invoked with `yarn ops` from the root of the repository.

### Synopsis

These are the top level commands offered by the CLI:

[yarn ops config](#yarn-ops-config) - manage configuration  
[yarn ops deploy](#yarn-ops-deploy) - deploy or re-deploy the application to AWS  
[yarn ops status](#yarn-ops-status) - get the status of a deployment  
[yarn ops stop](#yarn-ops-stop) - stop the application  
[yarn ops start](#yarn-ops-start) - start the application  
[yarn ops restart](#yarn-ops-restart) - restart the application  
[yarn ops rm](#yarn-ops-rm) - remove the deployment  
[yarn ops domain](#yarn-ops-domain) - setup and manage a custom domain  
[yarn ops db](#yarn-ops-db) - manipulate data in the database  
[yarn ops issuer](#yarn-ops-issuer) - manage trust  
[yarn ops jwt](#yarn-ops-jwt) - create an access token for testing

Individual commands are described below.

### Common options

Most LetsGo CLI command accept these common options:

- `-d, --deployment` - a named deployment to operate on. If the option is not specifed, a default deployment name provided in the `LETSGO_DEPLOYMENT` environment variable is used. If the variable is not set, the default deployment name specified in the `DefaultDeployment` export from [@letsgo/constants](./letsgo-constants/README.md) is used (`main` unless you changed it).
- `-r, --region` - the AWS region of the deployment. If the option is not specified, a default region provided in the `AWS_REGION` environment variable is used. If the variable is not set, the default region specified in the `DefaultRegion` export from [@letsgo/constants](./letsgo-constants/README.md) is used (`us-west-2` unless you changed it).
- `-o, --output` - output format of the command; most commands support `text` and `json`

### yarn ops config

Manages configuration of a deployment in AWS. See [manage configuration](../how-to/manage-configuration.md) for more information.

See the [available configuration settings and default values](../reference/letsgo-constants/README.md) for configuration settings LetsGo defines. You can also define you own configurations settings that will be propagated to the components of your app using environment variables upon deployment.

#### yarn ops config ls

Lists deployment names for which configuration exists in a given region.

To list all deployment names for which configuration exists in the default region:

```bash
yarn ops config ls
```

To list all deployment names for which configuration exists in the `eu-central-1` region:

```bash
yarn ops config ls -r eu-central-1
```

#### yarn ops config set

Sets or removes configuration settings for a given deployment in a given region.

To set the `MY_SETTING1` to `FOOBAR` for the default deployment in the default region:

```bash
yarn ops config set MY_SETTING1=FOOBAR
```

To set the `MY_SETTING1` to `FOOBAR` for the `stage` deployment in the `eu-central-1` region:

```bash
yarn ops config set MY_SETTING1=FOOBAR -d stage -r eu-central-1
```

To delete a configuration setting, set it to an empty value:

```bash
yarn ops config set MY_SETTING1=
```

To read multiple configuration settings from stdin and set them all at once, use the `-s, --stdin` option:

```bash
yarn ops config set -s <<EOF
MY_SETTING1=FOO
MY_SETTING2=BAR
EOF
```

The format accepted on input is that of the [dotenv](https://www.npmjs.com/package/dotenv) file. This command is useful to quickly copy one deployment's configuration to another by piping in the output of `yarn -s ops config get -o env` (see below).

#### yarn ops config get

Gets one or all configuration settings for a given deployment in a given region.

To get all configuration settings of the default deployment in the default region:

```bash
yarn ops config get
```

To get all configuration settings of the default deployment in the default region in the [dotenv](https://www.npmjs.com/package/dotenv) format (useful for scripting or piping into `yarn ops config set -s` - see above):

```bash
yarn -s ops config get -o env
```

To get all configuration settings of the `stage` deployment in the `eu-central-1` region:

```bash
yarn ops config get -d stage -r eu-central-1
```

To get a value of the `MY_SETTING1` configuration setting:

```bash
yarn ops config get MY_SETTING1
```

To get a raw value of the `MY_SETTING1` configuration setting (useful for scriping)

```bash
yarn -s ops config get MY_SETTING1
```

### yarn ops deploy

Deploys or re-deploys all or selected components of your application to the cloud.

The command is designed to be re-entrant and eventually consistent. If it fails for transient reasons (e.g. network failure or a timeout), you can safely re-run the same command. It should eventually finish with success bringing the deployment to the same end state.

The components to deploy are specified with the `-a, --artifact` option. Multiple components can be specified. Available components are: `db`, `api`, `web`, `worker`. You can also specify `all` as a shortcut to deploy all components.

The configuration that is deployed is the configuration previously set with [yarn ops config set](#yarn-ops-config-get).

The prerequisite to running this command is that the code of the components to deploy must be available as locally built Docker images. You can build these images using the `yarn buildx` command. See the [Re-deploying to AWS](../tutorials/re-deploying-to-aws.md) tutorial for details. There are separate Docker images for the `web`, `worker`, and `api` components. In the build process, these images are tagged with the [turborepo](https://turbo.build/repo)'s build hash. By default, the last built images are used. You can override this by explicitly specifying the Docker image tag with the `--api-tag`, `--web-tag`, and `--worker-tag` options. You can inspect Docker images available locally with `docker image ls`.

To deploy or re-deploy all components of the application to the default deployment in the default region using the last built Docker images, run:

```bash
yarn ops deploy -a all
```

To deploy or re-deploy the _web_ and _API_ components of the application to the default deployment in the default region using the last built Docker images, run:

```bash
yarn ops deploy -a api -a web
```

To deploy or re-deploy all components of the application to the `stage` deployment in the `eu-central-1` region using the last built Docker images, run:

```bash
yarn ops deploy -a all -d stage -r eu-central-1
```

To deploy or re-deploy all components of the application to the `stage` deployment in the `eu-central-1` region using the image with `b9d4a2ebe27c43b3` tag for the _API_ component, and last built Docker images for remaining components, run:

```bash
yarn ops deploy -a all -d stage -r eu-central-1 --api-tag b9d4a2ebe27c43b3
```

### yarn ops status

Get the status of the entire deployment or selected components of a deployment.

To get the status of the default deployment in the default region:

```bash
yarn ops status
```

To get the status of the `stage` deployment in the `eu-central-1` region:

```bash
yarn ops status -d stage -r eu-central-1
```

To get the status of the _API_ component in the `stage` deployment in the `eu-central-1` region:

```bash
yarn ops status -d stage -r eu-central-1 -a api
```

To get the status of the default deployment in the default region in the JSON format (includes all details):

```bash
yarn ops status -o json
```

To extract a single property from the JSON representation of the deployment status (useful for scripting):

```bash
yarn -s ops status -p 'api.apprunner.ServiceUrl'
```

**NOTE** Notice the `-s` option passed to `yarn`. It prevents `yarn` form generating output to stdout.

To extract a single property from the JSON representation of the deployment status and transform it with a simple JavaScript expression (useful for scripting):

```bash
yarn -s ops status -p 'api.apprunner.Status === "RUNNING" ? 1 : 0'
```

### yarn ops stop

Temporarily stops all or selected components of the deployment without removing any artifacts (use [yarn ops rm](#yarn-ops-rm) to remove the deployment). Stopping the deployment does not remove any durable data (database stays intact, enqueued messages remain in the queue).

**NOTE** The _API_ and _web_ components preserve their public URL through the stop/start cycle.

Stopping has the following effect on individual components:

- _web_ and _API_ - the public endpoint stops responding, services are suspended, you are not charged for compute.
- _worker_ - the event source mapping pumping messages from the queue to the Lambda is stopped.

To stop all components of the default deployment in the default region:

```bash
yarn ops stop -a all
```

To stop the _API_ and _worker_ components in the `stage` demployment in the `eu-central-1` region:

```bash
yarn ops stop -a api -a worker -d stage -r eu-central-1
```

### yarn ops start

Start all or selected components of a previously stopped deployment. When you start a previously stopped _web_ or _API_ component, it uses the configuration settings current at the time of the start operation. When you start a previously stopped _worker_ component, it continues using the configuration settings current at the time of deployment.

**NOTE** The _API_ and _web_ components preserve their public URL through the stop/start cycle.

To ensure all components of the default deployment in the default region are started:

```bash
yarn ops start -a all
```

To ensure the _API_ and _web_ components of the `stage` deployment in the `eu-central-1` region are started:

```bash
yarn ops start -a api -a web -d stage -r eu-central-1
```

### yarn ops restart

Stops and starts all or selected components. It is equivalent to running `yarn ops stop` followed by `yarn ops start`.

To restart all components of the default deployment in the default region are started:

```bash
yarn ops restart -a all
```

To restart the _API_ and _web_ components of the `stage` deployment in the `eu-central-1` region are started:

```bash
yarn ops restart -a api -a web -d stage -r eu-central-1
```

### yarn ops rm

Removes all or selected components of a deployment.

This is a destructive operation. Please read [Remove deployments](../how-to/remove-deployments.md) for details.

### yarn ops domain

Sets up and manages a custom domain assignment to the _web_ and _API_ components. This topic is covered in detail in the [Configuring a custom domain](../tutorials/configuring-custom-domain.md) tutorial.

#### yarn ops domain add

Assigns a custom domain to the _web_ or _API_ components. Please read [Configuring a custom domain](../tutorials/configuring-custom-domain.md) for details.

The `-a, --artifact` option is required and specifies the component to assign the custom domain to: `web` or `api`.

The `-w, --www` option requests that in addition to the bare domain name specified as an argument, a subdomain with the `www` prefix is also associated with the selected component.

To associate the `api.contoso.com` domain with the _API_ component of the default deploymet in the default region:

```bash
yarn ops domain add -a api api.contoso.com
```

To associate the `contoso.com` and `www.contoso.com` domain names with the _web_ component in the `stage` environment in the `eu-central-1` region:

```bash
yarn ops domain add -a web --www -d stage -r eu-central-1 contoso.com
```

The output of the command shows the DNS records that must be configued for the domain you selected before the custom domain association is effective.

#### yarn ops domain status

Check the status of the custom domain assignment to the _web_ or _API_ component of a deployment.

The `-a, --artifact` option is required and specifies the component to show the custom domain status for: `web` or `api`.

The output of the command shows the overall status of the custom domain assignment as well as the status of individual DNS records that must be present for that assignment to be valid.

To show the status of the custom domain for the _API_ component of the default deployment in the default region:

```bash
yarn ops domain status -a api
```

To show the status of the custom domain for the _web_ component of the `stage` deployment in the `eu-central-1` region:

```bash
yarn ops domain status -a web -d stage -r eu-central-1
```

#### yarn ops domain rm

Disassociate a custom domain from the _web_ or _API_ component of a deployment. After disassociation, the component is no longer reachable using URLs with the custom domain name. The DNS records you have set up previously to enable the custom domain can be manually removed.

To remove the custom domain for the _API_ component of the default deployment in the default region:

```bash
yarn ops domain rm -a api
```

To remove the custom domain for the _web_ component of the `stage` deployment in the `eu-central-1` region:

```bash
yarn ops domain rm -a web -d stage -r eu-central-1
```

### yarn ops db

Manipulates data in the _database_ component. Please read the [Data model](../backgound/data-model.md) to understand LetsGo's database structure.

This set of commands is a thin shim over the functionality of [@letsgo/db](./letsgo-db/README.md) module, described in [Access data in the database from code](../how-to/access-data-in-the-database-from-code.md).

#### yarn ops db ls

Lists database items with a specified `category` and optionally a specified _prefix_ of the `key`.

To list all items in the `orders` category, run:

```bash
yarn ops db ls orders
```

To list all items in the `orders` category with `key` value _starting with_ `2023-`, run:

```bash
yarn ops db ls orders 2023-
```

By default, the output only contains the full `key` values of the matching items. If you want to include the entire items instead, add the `-f, --full` option:

```bash
yarn ops db ls orders 2023- --full
```

This command supports paging. You can specify the `-l, --limit` option to indicate the upper bound on the number of results you would like to get. If the result of the operation specifies a continuation token (`nextToken`), you can specify it using the `-n, --nextToken` option in a subsequent call to the command to receive the next page of results.

#### yarn ops db get

Get the value of a single item with a specific `category` and `key`.

To get an item with the `orders` category and `key` value of `2023-123456`:

```bash
yarn ops db get orders 2023-123456
```

If the item exists, the command returns the JSON representation of the item.

If you want to use the result for scripting, you must tell `yarn` not to generate any output to stdin by passing the `-s` option to yarn:

```bash
yarn -s ops db get orders 2023-123456
```

#### yarn ops db put

Upserts an item to the database. The item is specified as a JSON document which must be an object containing at least the `category` and `key` string properties.

To add an item to the database:

```bash
yarn ops db put '{"category":"orders","key":"2023-123456","customerId":"cust-123","total":120}'
```

When you specify the `-s, --stdin` option, the item to be put into the database is read from stdin:

```bash
yarn ops db put -s <<EOF
{
  "category": "orders",
  "key": "2023-123456",
  "customerId": "cust-123",
  "total": 120
}
EOF
```

The latter form is useful for scriping, where you can pipe the JSON output of one command into `yarn ops db put -s`.

### yarn ops issuer

Manages trusted issuers in a deployment. Please read [Authentication, authorization, and trust](../backgound/authentication-authorization-and-trust.md) and [Manage trust and authentication](../how-to/manage-trust-and-authentication.md) for details.

#### yarn ops issuer ls

Lists trusted issuers in a deployment.

The output shows all trusted issuers in a single deployment. There may be multiple third-party issuers, and multuple built-in PKI issuers. One of the built-in PKI issuers may be designated as _active_.

By default, only issuer identifiers are displayed. To get full issuer information, specify the `-f, --full` option.

This command supports paging. You can specify the `-l, --limit` option to indicate the upper bound on the number of results you would like to get. If the result of the operation specifies a continuation token (`nextToken`), you can specify it using the `-n, --nextToken` option in a subsequent call to the command to receive the next page of results.

To list trusted issuers in the default deployment in the default region:

```bash
yarn ops issuer ls
```

To get full information about trusted issuers in the default deployment in the default region:

```bash
yarn ops issuer ls --full
```

To get full information about trusted issuers in the `stage` deployment in the `eu-central-1` region:

```bash
yarn ops issuer ls --full -d stage -r eu-central-1
```

#### yarn ops issuer add

Adds a new trusted issuer to a deployment or designates one of the existing built-in PKI issuers as _active_.

You must specify either:

1. Both the `--issuer` and `--jwks` options to add a third party issuer, or
1. One of `--pki-create` or `--pki-create-only` to add a new built-in PKI issuer, or
1. `--pki-activate` option to designate an existing built-in PKI issuer as _active_.

To add a new third party issuer, set the `--issuer` to the issuer identifier (the value of the `iss` claim in the access tokens issued by that issuer) and `--jwks` to the URL of the [JWKS](https://datatracker.ietf.org/doc/html/rfc7517) endpoint of the issuer.

For example, to register a new third party issuer with identifier `https://goletsgo.us.auth0.com/` and JWKS endpoint of `https://goletsgo.us.auth0.com/.well-known/jwks.json` for the `stage` deployment in the `eu-central-1` region, run:

```bash
yarn ops issuer add \
  --issuer https://goletsgo.us.auth0.com/ \
  --jwks https://goletsgo.us.auth0.com/.well-known/jwks.json \
  -s stage \
  -r eu-central-1
```

To add a new built-in PKI issuer and set it to _active_, specify the `--pki-create` option:

```bash
yarn ops issuer add --pki-create
```

To add a new built-in PKI issuer without setting it to _active_, specify the `--pki-create-only` option:

```bash
yarn ops issuer add --pki-create-only
```

To set an existing built-in PKI issuer as _active_, specify the `--pki-activate` option and provide the issuer identifier. For example, to set issuer `letsgo:e70580d515b05a17` as active, run:

```bash
yarn ops --pki-actvate letsgo:e70580d515b05a17
```

#### yarn ops issuer rm

Remove a trusted issuer from a deployment. All access tokens created by that issuer will be rejected. It may take up to 5 minutes for the removal to take the effect.

To remove the `letsgo:e70580d515b05a17` built-in PKI issuer from the default deployment in the default region:

```bash
yarn ops issuer rm letsgo:e70580d515b05a17
```

To remove the `https://goletsgo.us.auth0.com/` third party issuer from the `stage` deployment in the `eu-central-1` region:

```bash
yarn ops issuer rm https://goletsgo.us.auth0.com/ -s stage -r eu-central-1
```

### yarn ops jwt

Uses the _active_ built-in PKI issuer to create a JWT access token.

By default, the token is valid for 8 hours and created for the audience value `letsgo:service`. The `iss` and `sub` claims have the same value which is `letsgo:{kid}`, where `{kid}` is the key ID of the built-in PKI issuer.

To change the default expiration time, use the `-e, --expires-in` option. You can specify a number indicating a number of seconds, or use other common notations like `3h`, `2d`.

**NOTE** You can create non-expiring JWT tokens by passing the `--expires-in 0` option. However, the only way to deny access for that token in case it gets leaked is to remove the built-in issuer that was used to create it from the system.

You can customize the `aud` claim value by passing the `-a, --aud` option.

To create a JWT access token for the default deployment in the default region:

```bash
yarn ops jwt
```

To create a JWT access token for the default deployment in the default region and return it in a raw format which can be directly used for scripting:

```bash
yarn -s ops jwt
```

To create a JWT token that expires in 24h, with a custom `foobar` audience for the `stage` deployment in the `eu-central-1` region:

```bash
yarn ops jwt -e 24h -a foobar -d stage -r eu-central-1
```
