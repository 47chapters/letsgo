## Get deployment status

The [LetsGo CLI](../reference/letsgo-cli.md) provides a command to inspect the deployment status of all components of your app: `yarn ops status`. It is a covenient way to:

- Quickly check the health status of all components.
- Inspect currently deployed configuration settings.
- Discover the URLs of the _web_ and _API_ components.
- Zero-in on the CloudWatch log groups for each component to further inspect them in AWS.
- Check the messages in flight in SQS.
- Check the amount of data in the databse.

You can get all of this information with:

```bash
yarn ops status
```

Or, just to limit the output to a single component, e.g. the _API_:

```bash
yarn ops status -a api
```

Like all other LetsGo CLI commands, you can specify the deployment name and region through options:

```bash
yarn ops status -d stage -r us-west-1
```

The `-o json` option generates the output in JSON and provides even more details than the textual form:

```bash
yarn ops status -o json
```

The JSON output mode can be combined with the `-p` option to extract just a single property from the output. For example, to get the URL of the _API_ component you can call:

```bash
yarn -s ops status -a api -p 'api.apprunner.ServiceUrl'
```

This is useful for scripting. In addition, you can construct simple JavaScript expressions using the `-p` option to further facilitate scripting, e.g.:

```bash
yarn -s ops status -a api -p 'api.apprunner.Status === "RUNNING" ? 1 : 0'
```

### Related topics

[LetsGo CLI](../reference/letsgo-cli.md)
